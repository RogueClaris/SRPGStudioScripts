/*
Add the custom parameter to the unit {Untouchable:true}
They will not be targetable for actions at all.
*/

var RSU1 = FilterControl.isUnitTypeAllowed;
FilterControl.isUnitTypeAllowed = function(unit, targetUnit){
	var result = RSU1.call(this, unit, targetUnit);
	if (targetUnit.custom.Untouchable){
		return false;
	}
	return result;
};

var RSU2 = FilterControl.isReverseUnitTypeAllowed;
FilterControl.isReverseUnitTypeAllowed = function(unit, targetUnit){
	var result = RSU2.call(this, unit, targetUnit);
	if (targetUnit.custom.Untouchable){
		return false;
	}
	return result;
};

var RSU3 = FilterControl.isBestUnitTypeAllowed;
FilterControl.isBestUnitTypeAllowed = function(unit, targetUnit, filterFlag){
	var result = RSU3.call(this, unit, targetUnit, filterFlag);
	if (targetUnit.custom.Untouchable){
		return false;
	}
	return result;
};