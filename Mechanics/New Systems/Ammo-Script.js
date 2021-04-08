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
	var weaponType = item.getWeaponType();
	
	if (weaponType.getBreakedWeapon() !== null) {
		// If "Broken Weapon" is set, set the value to show broken state.
		item.setLimit(WeaponLimitValue.BROKEN);
		return;
	}
	
	if (item.custom.Ammo){
		item.setLimit(WeaponLimitValue.BROKEN);
	}
	else if (unit === null) {
		StockItemControl.cutStockItem(StockItemControl.getIndexFromItem(item));
	}
	else {
		this.deleteItem(unit, item);
	}
};
