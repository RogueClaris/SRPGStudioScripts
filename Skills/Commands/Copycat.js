(function () {
	var alias1 = UnitCommand.configureCommands;
	UnitCommand.configureCommands = function (groupArray) {
		alias1.call(this, groupArray);
		
		groupArray.appendObject(UnitCommand.Record);
	}
	var AssistCommandMode = {
		SELECT: 0,
		ASSIST: 1
	};
	UnitCommand.Record = defineObject(UnitListCommand,
		{
			_posSelector: null,
			
			openCommand: function () {
				this._prepareCommandMemberData();
				this._completeCommandMemberData();
			},
			
			moveCommand: function () {
				var mode = this.getCycleMode();
				var result = MoveResult.CONTINUE;

				if (mode === AssistCommandMode.SELECT) {
					result = this._moveSelect();
				}
				else if (mode === AssistCommandMode.ASSIST) {
					result = this._moveAssist();
				}
				return result;
			},
			
			drawCommand: function () {
				var mode = this.getCycleMode();

				if (mode === AssistCommandMode.SELECT) {
					this._drawSelect();
				}
				else if (mode === AssistCommandMode.ASSIST) {
					this._drawTrade();
				}
			},
			
			isCommandDisplayable: function () {
				var unit = this.getCommandTarget();
				var indexArray = this._getMoveArray(unit);
				var hasSkill = SkillFinder.searchSkill(unit); //Returns number >= 0 if the skill exists.
				var HP = unit.getHp();
				
				return (indexArray.length !== 0 && hasSkill >= 0 && HP >= Math.round(RealBonus.getMhp(unit)*0.25));
			},
			
			getCommandName: function () {
				return "Record";
			},
			
			isRepeatMoveAllowed: function () {
				return true;
			},
			
			_prepareCommandMemberData: function () {
				this._posSelector = createObject(PosSelector);
			},
			
			_completeCommandMemberData: function () {
				var unit = this.getCommandTarget();
				var filter = this._getUnitFilter();
				var indexArray = this._getMoveArray(this.getCommandTarget());

				this._posSelector.setUnitOnly(unit, ItemControl.getEquippedWeapon(unit), indexArray, PosMenuType.Default, filter);
				this._posSelector.setFirstPos();
				this._posSelector.includeFusion();

				this.changeCycleMode(AssistCommandMode.SELECT);
			},
			
			_moveSelect: function () {
				var result = this._posSelector.movePosSelector();
				var unit = this.getCommandTarget();
				var targetUnit;
				var generator = createObject(DynamicEvent)
				var Dynamo = generator.acquireEventGenerator();
				var anime = root.queryAnime('easydamage');
				if (result === PosSelectorResult.SELECT) {
					if (this._isPosSelectable()) {
						targetUnit = this._posSelector.getSelectorTarget(true);
						this._targetUnit = targetUnit;
						var Cost = Math.round(RealBonus.getMhp(unit)*0.25);
						if (targetUnit.getSkillReferenceList().getTypeCount() > 0){
							var WepSkillList = unit.getSkillReferenceList();
							var editor = root.getDataEditor();
							var Lost;
							if (WepSkillList.getTypeCount() === 1){
								Lost = WepSkillList.getTypeData(0);
							}
							var Obtained = targetUnit.getSkillReferenceList().getTypeData(Math.max(0,Math.random()*targetUnit.getSkillReferenceList().getTypeCount()-1));
							Dynamo.damageHit(unit,anime,Cost,0,unit,false);
							// unit.setHP(Math.max(1,unit.getHP()-Cost));
							if (typeof Lost === 'object'){
								// editor.deleteSkillData(WepSkillList,Lost);
								Dynamo.skillChange(unit,Lost,IncreaseType.DECREASE,false);
							}
							if (typeof Obtained === 'object'){
								// editor.addSkillData(WepSkillList,Obtained);
								Dynamo.skillChange(unit,Obtained,IncreaseType.INCREASE,false);
							}
							generator.executeDynamicEvent();
							this._posSelector.endPosSelector();
							this.changeCycleMode(AssistCommandMode.ASSIST);
						}
					}
				}
				else if (result === PosSelectorResult.CANCEL) {
					this._posSelector.endPosSelector();
					return MoveResult.END;
				}

				return MoveResult.CONTINUE;
			},
			
			_moveAssist: function () {
				this.endCommandAction();
				return MoveResult.END;
			},
			
			_drawSelect: function () {
				this._posSelector.drawPosSelector();
			},
			
			_drawTrade: function () {
			},
			
			_getMoveArray: function (unit) {
				var indexArrayNew = [];
				var i, index, x, y, targetUnit;
				
				var indexArray = IndexArray.createIndexArray(unit.getMapX(), unit.getMapY(), null);
				
				var count = indexArray.length;
				
					for (i = 0; i < count; i++) {
						index = indexArray[i];
						x = CurrentMap.getX(index);
						y = CurrentMap.getY(index);
						targetUnit = PosChecker.getUnitFromPos(x, y);
						if (targetUnit !== null && unit !== targetUnit && targetUnit.getUnitType() == UnitType.ENEMY && targetUnit.getSkillReferenceList().getTypeCount() > 0) {
							indexArrayNew.push(index);								
							}
						}
				return indexArrayNew;
			},
			
			_isPosSelectable: function () {
				var unit = this._posSelector.getSelectorTarget(true);

				return unit !== null;
			},

			_getUnitFilter: function () {
				return FilterControl.getNormalFilter(this.getCommandTarget().getUnitType());
			
			}
		}
	);
	
	var SkillFinder = {
		searchSkill: function (unit) {
			/*
			To find a skill in a unit, it is necessary to check the five different categories of skill:
				-Unit: the personal skills of the unit.
				-Class: the skills of the class.
				-Weapon: the skills of the equipped weapon.
				-Item: the skills of the non-weapon items.
				-Terrain: the skills of the terrain where the unit stands.
			*/

			//Search for a skill with the specific parameter on the unit.
			//To search a skill from a unit, it is necessary to check the unit, their class, their equipped weapon, all their items and the terrain they are on.
			//All these variable refer to the list of skill of thar part. For example, unitSkills refers to the unit skills, unitClass to the class skills, and so on.
			var unitSkills = unit.getSkillReferenceList();
			var unitClass = unit.getClass().getSkillReferenceList();
			var unitWeapon = ItemControl.getEquippedWeapon(unit) == null ? null : ItemControl.getEquippedWeapon(unit).getSkillReferenceList();
			var unitItem = unit.getItem(0) == null ? null : unit.getItem(0).getSkillReferenceList();	 //It starts with the first item, later there is a while block that checks for every item of the unit.
			var unitTerrain = root.getCurrentSession().getTerrainFromPos(unit.getMapX(), unit.getMapY(), true).getSkillReferenceList(); //I do not know the impact of the boolean on this function
			var found = -1; //-1 = not found // 0 = found Record
			var i = 0; //Index for unitItem
			found = this.findSkill(unitSkills, found);
			found = this.findSkill(unitClass, found);
			found = unitWeapon == null ? found : this.findSkill(unitWeapon, found); //If the unit does not have a weapon, do not check for weapon skills.
			while (unitItem != null) {
				if (!unit.getItem(i).isWeapon()) {
					found = this.findSkill(unitItem, found);  //Checks for skills in every non-weapon item of the unit
				}											  //The only weapon that can give a skill to a unit is the equipped weapon.
				i++;
				unitItem = unit.getItem(i) == null ? null : unit.getItem(i).getSkillReferenceList();
			}
			found = this.findSkill(unitTerrain, found);
			return found;
		},

		//Checks if the custom keyword exists in one of the skills of the list
		//If the skill was already found on another skill list, the this function only returns the found value without any change.
		findSkill: function (skillList, found) {
			var i = 0;
			while (found==-1 && i < skillList.getTypeCount()) {
				if (skillList.getTypeData(i).custom.Record != null) {
					found = skillList.getTypeData(i).custom.Record;
				}
				i++;
			}
			return found;
		}
	}
})();