var RSU0 = PosSelector.getSelectorTarget;
PosSelector.getSelectorTarget = function(isIndexArray) {
	var unit = RSU0.call(this, isIndexArray);
	
	// Check if the unit exists at the cursor position and the unit exists within a range.
	if (unit !== null && isIndexArray && unit.custom.Untouchable && unit.getUnitType() === UnitType.ENEMY){
		unit = null;
	}
	return unit;
};