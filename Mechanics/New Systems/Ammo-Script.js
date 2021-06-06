var AMMO1 = ItemControl.isWeaponAvailable;
ItemControl.isWeaponAvailable = function(unit, item) {
	var result = AMMO1.call(this,unit,item);
	
	if (item.custom.Ammo){
		if (item.getLimit() === WeaponLimitValue.BROKEN){
			return false;
		}
	}
	
	return result;
};

var AMMO2 = ItemControl.lostItem;
ItemControl.lostItem = function(unit, item) {
	if (item.custom.Ammo){
		item.setLimit(WeaponLimitValue.BROKEN);
		return;
	}
	AMMO2.call(this, unit, item);
};