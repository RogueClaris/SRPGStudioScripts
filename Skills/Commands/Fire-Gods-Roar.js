(function () {
	var AssistCommandMode = {
		SELECT: 0,
		ASSIST: 1
	};
	UnitCommand.FireGod = defineObject(UnitListCommand,
		{
			_posSelector: null,
			_dynamicAnime: null,
			_dynamicEvent: null,

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
				var hasSkill = SkillFinder.searchSkill(unit); //Returns number >= 0 if the skill exists.
				var indexArray = this._getMoveArray(unit)
				return (hasSkill === "FGR" && indexArray.length > 0 && OT_GetNowMP(unit) >= 25);
				
			},
			
			getCommandName: function () {
				return "Fire God's Roar";
			},

			isRepeatMoveAllowed: function () {
				return false;
			},
			
			_prepareCommandMemberData: function () {
			},
			
			_completeCommandMemberData: function () {
				this.changeCycleMode(AssistCommandMode.SELECT);
			},
			
			_moveSelect: function () {
				var unit = this.getCommandTarget();
				var targetUnit, i, j;
				var targetUnitList = this._getMoveArray(unit);
				var anime;
				this._dynamicEvent = createObject(DynamicEvent)
				var generator = this._dynamicEvent.acquireEventGenerator();
				var damage = ItemControl.getEquippedWeapon(unit) != null ? Math.round(AbilityCalculator.getPower(unit,ItemControl.getEquippedWeapon(unit))*1.5) : 20
				var list = root.getBaseData().getEffectAnimationList(true);
				OT_SetNowMP(unit,OT_GetNowMP(unit)-25)
				for (j = 0; j < list.getCount(); j++){
					if (list.getData(j).getName() === "Explosion"){
						anime = list.getData(j);
					}
				}
				if (true === true) {
					if (this._isPosSelectable()) {
						for (i = 0; i < targetUnitList.length; i++){
							targetUnit = targetUnitList[i];
							generator.damageHit(targetUnit,anime,damage,DamageType.MAGIC,unit,false);
						}
						this._dynamicEvent.executeDynamicEvent();
					}
					this.changeCycleMode(AssistCommandMode.ASSIST);
				}

				return MoveResult.CONTINUE;
			},
			
			_moveAssist: function () {
				this.endCommandAction();
				return MoveResult.END;
			},

			_drawSelect: function () {
			},

			_drawTrade: function () {
			},
			
			_getMoveArray: function (unit) {
				var indexArrayNew = [];
				var i, index, x, y, targetUnit;
				
				var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, 5);
				
				var count = indexArray.length;
				for (i = 0; i < count; i++) {
					index = indexArray[i];
					x = CurrentMap.getX(index);
					y = CurrentMap.getY(index);
					targetUnit = PosChecker.getUnitFromPos(x, y);
					if (targetUnit !== null && unit !== targetUnit) {
						if (FilterControl.isReverseUnitTypeAllowed(unit, targetUnit)) {
							indexArrayNew.push(targetUnit);
						}
					}
				}
				return indexArrayNew;
			},
			
			_isPosSelectable: function () {
				return true;
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
			var found = -1; //-1 = not found // 0 = found Fire God's Roar
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
				if (skillList.getTypeData(i).getCustomKeyword() === "FGR") {
					found = skillList.getTypeData(i).getCustomKeyword();
				}
				i++;
			}
			return found;
		}
	}
})();