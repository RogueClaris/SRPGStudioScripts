var EQA001 = ItemControl.isWeaponAvailable
ItemControl.isWeaponAvailable = function(unit, item) {
	var result = EQA001.call(this,unit,item)
	var unitSkills = unit.getSkillReferenceList();
	var i;
	var found = -1;
	
	if (item === null) {
		return false;
	}
	
	// If item is not weapon, cannot equip.
	if (!item.isWeapon()) {
		return false;
	}
	
	if (item !== null && item.isWeapon()){
		var WepType = item.getWeaponType().getName();
		i = 0;
		while (i < unitSkills.getTypeCount()) {
			if (unitSkills.getTypeData(i).getCustomKeyword() === WepType) {
				return true;
			}
			i++
		}
	}
	
	return result;
};