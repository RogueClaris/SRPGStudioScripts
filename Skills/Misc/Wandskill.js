var UseCheck = ItemControl.isItemUsable;
ItemControl.isItemUsable = function(unit, item) {
	var Usable = UseCheck.call(this,unit,item);
	var unitSkills = unit.getSkillReferenceList();
	var i;
	if (item !== null && item.isWand()){
		i = 0;
		while (i < unitSkills.getTypeCount()) {
			if (unitSkills.getTypeData(i).getCustomKeyword() === "Healer") {
				return true;
			}
			i++
		}
	}
	return Usable;
};