var MasterKeyCL0 = KeyEventChecker.buildKeyDataSkill;
KeyEventChecker.buildKeyDataSkill = function(skill, requireFlag){
	var data = MasterKeyCL0.call(this, skill, requireFlag);
	if (data !== null){
		if (typeof data.skill.custom.KeyExtendCL === 'number'){
			data.rangeValue += data.skill.custom.KeyExtendCL;
			data.rangeType = SelectionRangeType.MULTI
		}
	}
	return data;
}

var MasterKeyCL1 = KeyEventChecker.buildKeyDataItem;
KeyEventChecker.buildKeyDataItem = function(item, requireFlag){
	var data = MasterKeyCL1.call(this, item, requireFlag);
	if (data !== null){
		if (typeof data.item.custom.KeyExtendCL === 'number'){
			data.rangeValue += data.item.custom.KeyExtendCL;
			data.rangeType = SelectionRangeType.MULTI
		}
	}
	return data;
}