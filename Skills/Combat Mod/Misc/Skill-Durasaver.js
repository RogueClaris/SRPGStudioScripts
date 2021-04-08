ItemControl.decreaseLimit = function(unit, item) {
	var limit;
	var rng = Math.random() * 101;
	var Threshold = RealBonus.getLuk(unit)*2;
	// The Item which has durability 0 isn't reduced.
	if (item.getLimitMax() === 0) {
		return;
	}
	
	if (item.isWeapon()) {
		// If the weapon is broken, it doesn't reduce.
		if (item.getLimit() === WeaponLimitValue.BROKEN) {
			return;
		}
	}
	if (item.isWeapon() && SkillControl.getPossessionCustomSkill(unit,"Limitless")){
		limit = item.getLimit();
	}
	if (item.isWeapon() && SkillControl.getPossessionCustomSkill(unit,"Lucky") && rng >= (100-Threshold)){
		limit = item.getLimit();
	}
	else{
		limit = item.getLimit() - 1;
	}
	item.setLimit(limit);
};