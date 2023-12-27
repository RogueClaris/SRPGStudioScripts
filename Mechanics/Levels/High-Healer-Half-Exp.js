var HighHealerHalfEXPCL0 = ItemExpFlowEntry._getItemExperience;
ItemExpFlowEntry._getItemExperience = function (itemUseParent) {
	//call the original EXP
	var exp = HighHealerHalfEXPCL0.call(this, itemUseParent);

	// Get the item info.
	var itemTargetInfo = itemUseParent.getItemTargetInfo();

	//get the unit from the target info
	var unit = itemTargetInfo.unit;

	// Check the item to see if it is a Wand.
	var isWand = itemTargetInfo.item.isWand()

	// Check the rank to see if it is High.
	var isRank = unit.getClass().getClassRank() === ClassRank.HIGH

	// Uses the above checks. You can modify them to change the plugin to suit your needs.
	if (isWand && isRank) {
		// Cut exp in half if conditions are met.
		exp = Math.round(exp * 0.5)
	}
	else {
		// Otherwise return original EXP.
		return exp;
	}

	// return value through the EXP Calculator to not go out of bounds and account for other EXP altering skills.
	return ExperienceCalculator.getBestExperience(unit, exp);
};
