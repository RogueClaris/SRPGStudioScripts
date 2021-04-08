(function () {
	var NOP001 = UnitCommand.configureCommands;
	UnitCommand.configureCommands = function (groupArray) {
		NOP001.call(this, groupArray);
		var i = 0;
		var result = false;
		while (i < groupArray.length && !result){
			root.log(groupArray[i].getCommandName())
			result = groupArray[i].getCommandName() === root.queryCommand('attack_unitcommand')
			i++
		}
		groupArray.insertObject(UnitCommand.NoteOfPain, i);
	}

	var NoteCommandMode = {
		SELECT: 0,
		ASSIST: 1,
		PAIN: 2
	};

	var FreePainCursor = defineObject(PosFreeCursor,
	{
		initialize: function() {
			this._mapCursor = createObject(PainCursor);
		},
		
		checkCursor: function() {
			var x, y;
			
			this._mapCursor.moveCursor();
			
			x = this._mapCursor.getX();
			y = this._mapCursor.getY();
			if (x !== this._xPrev || y !== this._yPrev) {
				this._parentSelector.setNewTarget();
				this._xPrev = x;
				this._yPrev = y;
			}
		}
	}
	);

	var PainSelector = defineObject(PosSelector,
	{
		initialize: function() {
			this._mapCursor = createObject(PainCursor);
			this._posMenu = createObject(PosMenu);
			this._selectorType = this._getDefaultSelectorType();
		},
		
		_getDefaultSelectorType: function() {
			return PosSelectorType.FREE
		},
		
		setPosOnly: function(unit, item, indexArray, type) {
			this._unit = unit;
			this._indexArray = indexArray;
			MapLayer.getMapChipLight().setIndexArray(indexArray);
			this._setPosMenu(unit, item, type);
			this._posCursor = createObject(FreePainCursor);
			this._posCursor.setParentSelector(this);
			this._posCursor._mapCursor.setIndexArray(indexArray)
		}
	}
	);

	var PainCursor = defineObject(MapCursor,
	{
		_arr: [],
		
		setIndexArray: function(arr){
			this._arr = arr
		},
		
		getIndexArray: function(){
			return this._arr;
		},
		
		_changeCursorValue: function(input) {
			var session = root.getCurrentSession()
			var xCursor = session.getMapCursorX();
			var yCursor = session.getMapCursorY();
			var arr = this.getIndexArray()

			if (input === InputType.LEFT) {
				xCursor--;
			}
			else if (input === InputType.UP) {
				yCursor--;
			}
			else if (input === InputType.RIGHT) {
				xCursor++;
			}
			else if (input === InputType.DOWN) {
				yCursor++;
			}
			var index = CurrentMap.getIndex(xCursor, yCursor)
			if (arr.indexOf(index) === -1){
				return;
			}
			else{
				// A cursor was moved, so play a sound.
				this._playMovingSound();
			}
			
			
			MapView.setScroll(xCursor, yCursor);
			
			session.setMapCursorX(xCursor);
			session.setMapCursorY(yCursor);
		}
	}
	);

	UnitCommand.NoteOfPain = defineObject(UnitListCommand,
		{
			_posSelector: null,
			_targetUnitArray: null,
			_redLightArray: null,
			
			openCommand: function () {
				this._prepareCommandMemberData();
				this._completeCommandMemberData();
			},
			
			moveCommand: function () {
				var mode = this.getCycleMode();
				var result = MoveResult.CONTINUE;

				if (mode === NoteCommandMode.SELECT) {
					result = this._moveSelect();
				}
				else if (mode === NoteCommandMode.ASSIST) {
					result = this._moveAssist();
				}
				else if (mode === NoteCommandMode.PAIN) {
					result = this._movePain();
				}
				return result;
			},
			
			drawCommand: function () {
				var mode = this.getCycleMode();

				if (mode === NoteCommandMode.SELECT) {
					this._drawSelect();
				}
				else if (mode === NoteCommandMode.ASSIST) {
					this._drawAssist();
				}
				else if (mode === NoteCommandMode.PAIN) {
					this._drawPain();
				}
			},
			
			isCommandDisplayable: function () {
				var unit = this.getCommandTarget()
				var hasSkill = SkillControl.getPossessionCustomSkill(unit, "Note-of-Pain")
				return hasSkill;
			},
			
			getCommandName: function () {
				return "Note of Pain";
			},
			
			isRepeatMoveAllowed: function () {
				return false;
			},
			
			_prepareCommandMemberData: function () {
				this._posSelector = createObject(PainSelector);
				this._targetUnitArray = [];
				this._redLightArray = []
			},
			
			_completeCommandMemberData: function () {
				var unit = this.getCommandTarget()
				var filter = this._getUnitFilter();
				var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, Math.max(3, Math.floor(RealBonus.getMag(unit)/2)));
				this._posSelector.initialize()
				this._posSelector.setPosOnly(unit, ItemControl.getEquippedWeapon(unit), indexArray, PosMenuType.Default, filter);
				this._posSelector.setFirstPos();
				
				this.changeCycleMode(NoteCommandMode.SELECT);
			},
			
			_moveSelect: function () {
				var unit = this.getCommandTarget()
				var targetUnitList = this._getMoveArray(unit)
				var i = 0;
				var result = this._posSelector.movePosSelector();
				if (result === PosSelectorResult.SELECT) {
					var targetUnit = this._posSelector.getSelectorTarget(true);
					if (targetUnit != null && targetUnit !== unit && this._targetUnitArray.indexOf(targetUnit) === -1){
						this._targetUnitArray.push(targetUnit);
						this._redLightArray.push(CurrentMap.getIndex(targetUnit.getMapX(), targetUnit.getMapY()))
						if (this._targetUnitArray.length === targetUnitList.length || this._targetUnitArray.length >= 5){
							this._posSelector.endPosSelector();
							this.changeCycleMode(NoteCommandMode.PAIN);
							return MoveResult.CONTINUE;
						}
					}
				}
				if (result === PosSelectorResult.CANCEL && this._targetUnitArray.length > 0) {
					this._targetUnitArray.pop()
					this._redLightArray.pop()
				}
				if (result === PosSelectorResult.CANCEL && this._targetUnitArray.length === 0) {
					this._posSelector.endPosSelector();
					return MoveResult.END;
				}
				return MoveResult.CONTINUE;
			},
			
			_moveAssist: function () {
				this.endCommandAction();
				return MoveResult.END;
			},

			_movePain: function () {
				var unit = this.getCommandTarget()
				var list = this._targetUnitArray;
				var Generator = root.getEventGenerator()
				var Damage = RealBonus.getMag(unit)
				var Anime = root.queryAnime('realdamage')
				var i;
				var EXP = 0
				var data = StructureBuilder.buildAttackExperience();
				var weapon = ItemControl.getEquippedWeapon(unit)
				if (list.length > 0){
					for (i = 0; i < list.length; i++){
						targetUnit = list[i]
						data.active = unit;
						data.activeHp = unit;
						data.activeDamageTotal = 0;
						data.passive = targetUnit;
						data.passiveHp = targetUnit.getHp();
						data.passiveDamageTotal = weapon != null ? DamageCalculator.calculateDamage(unit, targetUnit, weapon, false, null, null, 0) : Math.max(0, RealBonus.getMag(unit) - RealBonus.getMdf(targetUnit))
						Generator.damageHit(targetUnit,Anime,Damage,DamageType.MAGIC,unit,false)
						EXP += ExperienceCalculator.calculateExperience(data)
					}
					Generator.experiencePlus(unit,EXP,false)
					Generator.execute()
				}
				this.changeCycleMode(NoteCommandMode.ASSIST);
				return MoveResult.CONTINUE;
			},

			_drawSelect: function () {
				this._posSelector.drawPosSelector();
				root.drawWavePanel(this._redLightArray, root.queryUI('range_panel'), 0)
			},

			_drawAssist: function () {
			},

			_drawPain: function () {
			},
			
			_getMoveArray: function (unit) {
				var indexArrayNew = [];
				var i, index, x, y, targetUnit;
				
				var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, Math.max(3, Math.floor(RealBonus.getMag(unit)/2)));
				var count = indexArray.length;
				for (i = 0; i < count; i++) {
					index = indexArray[i];
					x = CurrentMap.getX(index);
					y = CurrentMap.getY(index);
					targetUnit = PosChecker.getUnitFromPos(x, y);
					if (targetUnit !== null) {
						if (unit !== targetUnit && targetUnit.getUnitType() === UnitType.ENEMY){
							indexArrayNew.push(index);
						}
					}
				}
				return indexArrayNew;
			},
			
			_isPosSelectable: function () {
				return true;
			},

			_getUnitFilter: function () {
				return FilterControl.getReverseFilter(this.getCommandTarget().getUnitType());
			
			}
		}
	);
})();