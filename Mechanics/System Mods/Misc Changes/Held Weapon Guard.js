var RSHWG00 = UnitItemStealScreen._isTradeDisabled;
UnitItemStealScreen._isTradeDisabled = function(unit, item) {
	var result = RSHWG00.call(this, unit, item);
	if (item === ItemControl.getEquippedWeapon(this._unitDest)){
		return true;
	}
	return result
};

var RSHWG01 = StealItemAI._getBestItem;
StealItemAI._getBestItem = function(unit, combination, stealFlag) {
	var result = RSHWG01.call(this, unit, combination, stealFlag);
	if (result != ItemControl.getEquippedWeapon(combination.targetUnit)){
		return result;
	}
	var i, item;
	var arr = [];
	var count = UnitItemControl.getPossessionItemCount(combination.targetUnit);
	
	for (i = 1; i < count; i++) {
		item = UnitItemControl.getItem(combination.targetUnit, i);
		if (item.isImportance() || item.isTradeDisabled()) {
			continue;
		}
		
		if (Miscellaneous.isStealTradeDisabled(unit, item, stealFlag)) {
			continue;
		}
		
		arr.push(item);
	}
	
	if (arr.length === 0) {
		return null;
	}
	
	this._sortItem(arr);

	return arr[0]
}