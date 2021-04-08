Miscellaneous.isStealTradeDisabled = function(unit, item, value) {
	if (!(value & StealFlag.WEAPON) && item.isWeapon()) {
		// Even if a weapon cannot be stolen, if the target is a weapon, cannot trade.
		return true;
	}
	if (item.isWand()){
		return true;
	}
	if (value & StealFlag.WEIGHT) {
		if (ParamBonus.getStr(unit) < item.getWeight()) {
			// If "Calculate by Weight" is enabled and if the unit pow is less than the item weight, disable.
			return true;
		}
	}
	
	return this.isTradeDisabled(unit, item);
};

