var HighHealerHalfEXPCL0 = ItemExpFlowEntry._getItemExperience;
ItemExpFlowEntry._getItemExperience = function(itemUseParent) {
	//call the original EXP
	var exp = HighHealerHalfEXPCL0.call(this, itemUseParent);
	var itemTargetInfo = itemUseParent.getItemTargetInfo();
	//get the unit from the target info
	var unit = itemTargetInfo.unit;
	//if item is wand and unit is high rank...
	if (itemTargetInfo.item.isWand() && unit.getClass().getClassRank() === ClassRank.HIGH){
		//cut exp in half.
		exp = Math.round(exp*0.5)
	}
	//return.
	return ExperienceCalculator.getBestExperience(unit, exp);
};
