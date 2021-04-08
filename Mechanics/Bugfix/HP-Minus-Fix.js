var ParamBonus.getBonusFromWeapon;
ParamBonus.getBonusFromWeapon = function(unit, type, weapon) {
	var i, typeTarget, n;
	var index = -1;
	var count = ParamGroup.getParameterCount();
	for (i = 0; i < count; i++) {
		typeTarget = ParamGroup.getParameterType(i);
		if (type === typeTarget) {
			index = i;
			break;
		}
	}
	// if index is still -1, do nothing. return 0. the end.
	if (index === -1) {
		return 0;
	}
	n = ParamGroup.getLastValue(unit, index, weapon);
	// if HP is the Parameter, it must stop at 1.
	if (type === ParamType.MHP) {
		if (n < 1) {
			n = 1;
			unit.setHp(n)
		}
	}
	else {
		//otherwise it can be 0.
		if (n < 0) {
			n = 0;
		}
	}
	return n;
};
