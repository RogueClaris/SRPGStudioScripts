(function () {
	var AssistCommandMode = {
		SELECT: 0,
		ASSIST: 1
	};
	
	UnitCommand.WaterGod=defineObject(UnitListCommand,
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
				var indexArray = this._getMoveArray(unit);
				var hasSkill = SkillFinder.searchSkill(unit); //Returns number >= 0 if the skill exists.
				return (indexArray.length > 0 && hasSkill === "WGB" && OT_GetNowMP(unit) === ParamBonus.getMp(unit));
				
			},
			
			getCommandName: function () {
				return "Water God's Blessing";
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
				var targetUnitList = this._getMoveArray(unit);
				var targetUnit, i;
				var anime = root.queryAnime('realrecovery');
				OT_SetNowMP(unit,0)
				if (true === true) {
					if (this._isPosSelectable()) {
						this._dynamicEvent = createObject(DynamicEvent)
						var generator = this._dynamicEvent.acquireEventGenerator();
						for (i = 0; i < targetUnitList.length; i++){
							targetUnit = targetUnitList[i]
							if (targetUnit !== unit){
								generator.hpRecovery(targetUnit,anime,0,RecoveryType.MAX,false);
							}
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
				
				var indexArray = PlayerList.getSortieList()
				
				var count = indexArray.getCount();
				for (i = 0; i < count; i++) {
					targetUnit = indexArray.getData(i);
					if (targetUnit !== null && unit !== targetUnit) {
						if (FilterControl.isUnitTypeAllowed(unit, targetUnit) && targetUnit.getHp() < RealBonus.getMhp(targetUnit)) {
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
			var found = -1; //-1 = not found // 0 = found Water God's Blessing
			var i = 0; //Index for unitItem
			found = this.findSkill(unitSkills, found);
			found = this.findSkill(unitClass, found);
			return found;
		},

		//Checks if the custom keyword exists in one of the skills of the list
		//If the skill was already found on another skill list, the this function only returns the found value without any change.
		findSkill: function (skillList, found) {
			var i = 0;
			while (found==-1 && i < skillList.getTypeCount()) {
				if (skillList.getTypeData(i).getCustomKeyword() === "WGB") {
					found = skillList.getTypeData(i).getCustomKeyword();
				}
				i++;
			}
			return found;
		}
	}
})();