TeleportationItemAI._isMultiRangeEnabled = function(unit, targetUnit, teleportationInfo){
	var i, index, x, y, focusUnit;
	//grab the weapon
	var weapon = ItemControl.getEquippedWeapon(targetUnit);
	//set length bonus to 1 to detect players outside movement
	var plusLength = 1
	//if weapon exists
	if (weapon !== null){
		//add end range to length bonus
		plusLength += weapon.getEndRange()
	}
	//generate new array
	var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, teleportationInfo.getRangeValue() + plusLength + RealBonus.getMov(targetUnit));
	var count = indexArray.length;
	
	for (i = 0; i < count; i++) {
		index = indexArray[i];
		x = CurrentMap.getX(index);
		y = CurrentMap.getY(index);
		focusUnit = PosChecker.getUnitFromPos(x, y);
		if (focusUnit === null) {
			continue;
		}
		
		if (!this._isUnitTypeAllowed(targetUnit, focusUnit)) {
			continue;
		}
		
		// Allow instant move because some unit (focusUnit) exists in a range of targetUnit as a criteria.
		return true;
	}
	
	return false;
}

TeleportationControl._getMultiRangeUnit = function(unit, targetUnit, teleportationInfo) {
	var i, index, x, y, focusUnit;
	//grab the weapon
	var weapon = ItemControl.getEquippedWeapon(targetUnit);
	//set length bonus to 1 to detect players outside movement
	var plusLength = 1
	//if weapon exists
	if (weapon !== null){
		//add end range to length bonus
		plusLength += weapon.getEndRange()
	}
	//generate new array
	var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, teleportationInfo.getRangeValue() + plusLength + RealBonus.getMov(targetUnit));
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
		
		if (!this._isUnitTypeAllowed(targetUnit, focusUnit)) {
			continue;
		}
		
		curUnit = this._checkUnit(curUnit, focusUnit);
	}
	
	return curUnit;
};
