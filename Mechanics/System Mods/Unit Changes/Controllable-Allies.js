/*
Mark a non-player unit with the custom parameter
{Controllable:true} and you will be able to control
them on the player phase.

-Rogue Claris

=Original Release: October 20th, 2019=
=Updated Release: June 6th, 2021=

*/

var RCCA01 = MapSequenceArea._isTargetMovable;
MapSequenceArea._isTargetMovable = function() {
	var result = RCCA01.call(this);
	//make sure they can be controlled, are an ally, and have the custom parameter.
	if (StateControl.isTargetControllable(this._targetUnit) && this._targetUnit.getUnitType() === UnitType.ALLY && !this._targetUnit.isWait() && this._targetUnit.custom.Controllable) {
		return true;
	}
	
	// return the original result if the above check isn't satisfied.
	return result;
};

var RCCA02 = MapSequenceCommand._doLastAction;
MapSequenceCommand._doLastAction = function() {
	if (this._targetUnit.getUnitType() === UnitType.ALLY){
		var i;
		var unit = null;
		var list = AllyList.getAliveList();
		var count = list.getCount()
		// Check it because the unit may not exist by executing a command.
		for (i = 0; i < count; i++) {
			if (this._targetUnit === list.getData(i)) {
				unit = this._targetUnit;
				break;
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
	}
	return RCCA02.call(this)
};
