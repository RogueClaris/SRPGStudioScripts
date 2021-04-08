var alias1 = UnitCommand.configureCommands;
UnitCommand.configureCommands = function (groupArray) {
	alias1.call(this, groupArray);
	
	groupArray.appendObject(UnitCommand.Warp);
}
var AssistCommandMode = {
	SELECT: 0,
	ASSIST: 1,
	WARP: 2
};
UnitCommand.Warp=defineObject(UnitListCommand,
	{
		_posSelector: null,
		_dynamicAnime: null,
		_anotherPosSelector: null,

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
			else if (mode === AssistCommandMode.WARP) {
				result = this._moveWarp();
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
			else if (mode === AssistCommandMode.WARP) {
				this._drawWarp();
			}
		},
		_isPosEnabled: function(x, y, targetUnit) {
			// Cannot instantly move to the position where the unit exists.
			if (PosChecker.getUnitFromPos(x, y) !== null) {
				return false;
			}
			
			// Cannot instantly move to the position where the unit cannot go through.
			if (PosChecker.getMovePointFromUnit(x, y, targetUnit) === 0) {
				return false;
			}
			
			return true;
		},
		
		isCommandDisplayable: function () {
			var unit = this.getCommandTarget();
			var indexArray = this._getMoveArray(unit);
			var hasSkill = SkillControl.getPossessionCustomSkill(unit,"Warp-Ally")
			var HP = unit.getHp();
			var cost
			if (hasSkill && typeof hasSkill.custom.Cost == 'number'){
				cost = hasSkill.custom.Cost;
			}
			else{
				cost = 0;
			}

			return (indexArray.length !== 0 && hasSkill && HP > cost);
		},
		
		getCommandName: function () {
			return "Warp";
		},

		isRepeatMoveAllowed: function () {
			return false;
		},
		
		_prepareCommandMemberData: function () {
			this._posSelector = createObject(PosSelector);
			this._anotherPosSelector = createObject(PosSelector);
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
		
		_getMultiRangeUnit: function(unit, targetUnit, RangeVal){
			var i, index, x, y, focusUnit;
			var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, RangeVal + 1);
			var count = indexArray.length;
			var curUnit = null;
			
			for (i = 0; i < count; i++) {
				index = indexArray[i];
				x = CurrentMap.getX(index);
				y = CurrentMap.getY(index);
				focusUnit = PosChecker.getUnitFromPos(x, y);
				if (focusUnit === null) {
					continue;
				}
				
				curUnit = this._checkUnit(curUnit, focusUnit);
			}
			
			return curUnit;
		},
		_checkUnit: function(curUnit, focusUnit) {
			if (curUnit === null) {
				curUnit = focusUnit;
			}
			else {
				if (focusUnit.getLv() > curUnit.getLv()) {
					curUnit = focusUnit;
				}
			}
			
			return curUnit;
		},
		
		getTeleportationRange: function(unit, targetUnit) {
			//var teleportationInfo = item.getTeleportationInfo();
			var rangeType = SelectionRangeType.MULTI;
			var curUnit = null;
			var parentIndexArray = null;
			
			if (rangeType === SelectionRangeType.SELFONLY) {
				return null;
			}
			else if (rangeType === SelectionRangeType.MULTI) {
				curUnit = this._getMultiRangeUnit(this.getCommandTarget(), targetUnit, Math.floor(RealBonus.getMag(this.getCommandTarget())/2));
				root.log("curUnit set.");
				parentIndexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, Math.floor(RealBonus.getMag(this.getCommandTarget())/2));
				root.log("parentIndexArray made.");
			}
			else if (rangeType === SelectionRangeType.ALL) {
				curUnit = this._getAllRangeUnit(unit, targetUnit);
			}
			
			// Call a getNearbyPosEx, not the getNearbyPos in order not to return the position beyond the range.
			return PosChecker.getNearbyPosEx(curUnit, targetUnit, parentIndexArray);
		},
		_moveSelect: function () {
			var result = this._posSelector.movePosSelector();
			var unit = this.getCommandTarget();
			var targetUnit;
			if (result === PosSelectorResult.SELECT) {
				if (this._isPosSelectable()) {
					targetUnit = this._posSelector.getSelectorTarget(true);
					this._targetUnit = targetUnit;
					var targetX;
					var targetY;
					var parentIndexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, Math.floor(RealBonus.getMag(this.getCommandTarget())/2));
					var Filter = FilterControl.getNormalFilter(UnitType.PLAYER)
					
					this._anotherPosSelector.initialize();
					var Cost;
					var skill = SkillControl.getPossessionCustomSkill(unit,"Warp-Ally")
					if (skill && typeof skill.custom.RSCost){
						Cost = skill.custom.RSCost;
					}
					else{
						Cost = 0;
					}
					var Gen1 = createObject(DynamicEvent)
					var Gen2 = Gen1.acquireEventGenerator();
					Gen2.damageHit(unit, -1, Cost, DamageType.FIXED, unit, false)
					Gen2.execute()
					this._anotherPosSelector.setPosOnly(unit,ItemControl.getEquippedWeapon(unit),parentIndexArray,UnitType.PLAYER);
					this._anotherPosSelector.drawPosCursor();
					this._anotherPosSelector.getSelectorTarget(true);
					this._anotherPosSelector.setPosSelectorType(PosSelectorType.FREE);
					this._anotherPosSelector._setPosMenu()
					
				}
				this.changeCycleMode(AssistCommandMode.WARP);
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

		_moveWarp: function () {
			var result2 = this._posSelector.movePosSelector();
			if (result2 === PosSelectorResult.SELECT){
				var targetX;
				var targetY;
				var TargetPos = this._anotherPosSelector.getSelectorPos(true);
				root.log("Position found.");
				if (TargetPos !== null) {
					targetX=TargetPos.x;
					targetY=TargetPos.y;
					if (this._isPosEnabled(targetX,targetY,this._targetUnit)){
						root.log("Target teleported.");
						this._targetUnit.setMapX(targetX);
						this._targetUnit.setMapY(targetY);
						this._anotherPosSelector.endPosSelector();
						this.changeCycleMode(AssistCommandMode.ASSIST);
					}
					else{
						MediaControl.soundDirect('operationblock');
						root.log("Square unavailable.");
					}
				}	
				else{
					MediaControl.soundDirect('operationblock');
					root.log("Square out of range.");
				}
			}
			else if (result2 === PosSelectorResult.CANCEL){
				this.changeCycleMode(AssistCommandMode.SELECT);
			}
			return MoveResult.CONTINUE;
		},

		_drawSelect: function () {
			this._posSelector.drawPosSelector();
		},

		_drawTrade: function () {
		},

		_drawWarp: function () {
			this._anotherPosSelector.drawPosSelector();
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
				if (targetUnit !== null && unit !== targetUnit && targetUnit.getUnitType() == UnitType.PLAYER) {
					indexArrayNew.push(index);								
				}
				if (targetUnit !== null && unit !== targetUnit && targetUnit.getUnitType() == UnitType.ALLY) {
					indexArrayNew.push(index);								
				}
			}
			return indexArrayNew;
		},
		
		_isPosSelectable: function () {
			var unit = this._posSelector.getSelectorTarget(true);

			return unit !== null && Miscellaneous.isItemAccess(unit);
		},

		_getUnitFilter: function () {
			return FilterControl.getNormalFilter(this.getCommandTarget().getUnitType());
		
		}
	}
);