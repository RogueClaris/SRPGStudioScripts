var WLVI0 = ItemControl.isItemUsable
ItemControl.isItemUsable = function(unit, item) {
	var result = WLVI0.call(this, unit, item);
	var req = typeof item.custom.wlvReq == 'number' ? item.custom.wlvReq : 0
	if (!item.isWeapon()){
		result = this._isWeaponLevel(unit, item)
	}
	return result;
};

var WLVI1 = ItemControl._isWeaponLevel;
ItemControl._isWeaponLevel = function(unit, item) {
	var req = typeof item.custom.wlvReq == 'number' ? item.custom.wlvReq : 0
	if (item.isWeapon()){
		return WLVI1.call(this, unit, item)
	}
	else{
		return ParamBonus.getBonus(unit, ParamType.WLV) >= req;
	}
};

var WLVI2 = ItemSentence.WeaponLevelAndWeight._isWeaponLevelDisplayable;
ItemSentence.WeaponLevelAndWeight._isWeaponLevelDisplayable = function(item){
	var result = WLVI2.call(this, item)
	if (typeof item.custom.wlvReq == 'number'){
		result = true
	}
	return result;
}

var WLVI3 = ItemSentence.WeaponLevelAndWeight.drawItemSentence;
ItemSentence.WeaponLevelAndWeight.drawItemSentence = function(x, y, item){
	if (item.isWeapon()){
		WLVI3.call(this, x, y, item);
	}
	else{
		if (this._isWeaponLevelDisplayable(item)) {
			text = root.queryCommand('wlv_param');
			ItemInfoRenderer.drawKeyword(x, y, text);
			x += ItemInfoRenderer.getSpaceX();
			NumberRenderer.drawRightNumber(x, y, typeof item.custom.wlvReq == 'number' ? item.custom.wlvReq : 0);
		}
	}
}