/*
Mark a non-player unit with the custom parameter
{Controllable:true} and you will be able to control
them on the player phase. They will still act during
their faction's phase, though.

-Lady Rena, October 20th, 2019.

*/

MapSequenceArea._isTargetMovable = function() {
	if (!StateControl.isTargetControllable(this._targetUnit)) {
		return false;
	}
	
	// The player who doesn't wait allows moving.
	return this._targetUnit.getUnitType() === UnitType.PLAYER && !this._targetUnit.isWait() || this._targetUnit.custom.Controllable && !this._targetUnit.isWait();
};

MapSequenceCommand._doLastAction = function() {
	var i;
	var unit = null;
	var list = PlayerList.getSortieList();
	var count = list.getCount();
	var list2 = EnemyList.getAliveList();
	var count2 = list2.getCount()
	var list3 = AllyList.getAliveList();
	var count3 = list3.getCount()
	// Check it because the unit may not exist by executing a command.
	for (i = 0; i < count; i++) {
		if (this._targetUnit === list.getData(i)) {
			unit = this._targetUnit;
			break;
		}
	}
	for (i = 0; i < count2; i++){
		if (this._targetUnit === list2.getData(i)){
			unit = this._targetUnit;
			break;
		}
	}
	for (i = 0; i < count3; i++){
		if (this._targetUnit === list3.getData(i)){
			unit = this._targetUnit;
		}
	}
	// Check if the unit doesn't die and still exists.
	if (unit !== null) {
		if (this._unitCommandManager.getExitCommand() !== null) {
			if (!this._unitCommandManager.isRepeatMovable()) {
				// If move again is not allowed, don't move again.
				this._targetUnit.setMostResentMov(ParamBonus.getMov(this._targetUnit));
			}
			
			// Set the wait state because the unit did some action.
			this._parentTurnObject.recordPlayerAction(true);
			return 0;
		}
		else {
			// Get the position and cursor back because the unit didn't act.
			this._parentTurnObject.setPosValue(unit);
		}
		
		// Face forward.
		unit.setDirection(DirectionType.NULL);
	}
	else {
		this._parentTurnObject.recordPlayerAction(true);
		return 1;
	}
	
	return 2;
};