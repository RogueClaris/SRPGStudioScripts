/*
Hello, and welcome to the Equipment Script! This script
introduces Shields and Accessories to your SRPG Studio game!

As an upgrade to the Shield script, which enables the creation of Shields,
you can...create Shields. You simply make a Custom Item with the keyword "Shield",
and set it to a custom item type which has a limit of 1 maximum held.

Further, as stated, this script now introduces Accessories! They are like
Shields, but they are not designed to have uses and will not decrease on
hit, nor will they be usable, so it's best to make them infinite. Just
create an item with the keyword "Armband" and again, you're good to go!
Just be sure to create an item type with 1 maximum held, as before, separate
from the Shield item type.

Enjoy the Script!

-Lady Rena, November 17th, 2019
*/

var EQUIP001 = ItemWorkWindow.setItemWorkData;
ItemWorkWindow.setItemWorkData = function(item){
	var arr;
	if (!item.isWeapon() && item.getCustomKeyword() === "Shield"){
		arr = [StringTable.ItemWork_Equipment, StringTable.ItemWork_Discard];
		this._scrollbar.setObjectArray(arr);
	}
	else if (!item.isWeapon() && item.getCustomKeyword() === "Armband"){
		arr = [StringTable.ItemWork_Equipment, StringTable.ItemWork_Discard];
		this._scrollbar.setObjectArray(arr);
	}
	else{
		EQUIP001.call(this,item);
	}
};

var SH003 = ItemPackageControl.getCustomItemAvailabilityObject;
ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword){
	if (keyword === "Shield"){
		return ShieldItemAvailability;
	}
	return SH003.call(this,item,keyword);
};

var ShieldItemAvailability = defineObject(BaseItemAvailability,
{
	isItemAllowed: function(unit, targetUnit, item) {
		return true;
	},
	
	_checkAll: function(unit, item) {
	}
}
);

var ACC003 = ItemPackageControl.getCustomItemAvailabilityObject;
ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword){
	if (keyword === "Armband"){
		return ArmbandItemAvailability;
	}
	return ACC003.call(this,item,keyword);
};

var ArmbandItemAvailability = defineObject(BaseItemAvailability,
{
	isItemAllowed: function(unit, targetUnit, item) {
		return true;
	},
	
	_checkAll: function(unit, item) {
	}
}
);

var SH004 = ItemPackageControl.getCustomItemUseObject;
ItemPackageControl.getCustomItemUseObject = function(item, keyword){
	if (keyword === "Shield"){
		return ShieldItemUse;
	}
	return SH004.call(this,item,keyword);
};

var ACC004 = ItemPackageControl.getCustomItemUseObject;
ItemPackageControl.getCustomItemUseObject = function(item, keyword){
	if (keyword === "Armband"){
		return ArmbandItemUse;
	}
	return ACC004.call(this,item,keyword);
};

var ArmbandItemUse = defineObject(BaseItemUse,
{
	enterMainUseCycle: function(itemUseParent) {
		return EnterResult.NOTENTER;
	}
}
);

ItemControl.setEquippedArmband = function(unit, targetItem){
	var i, item;
	var count = UnitItemControl.getPossessionItemCount(unit);
	var fastIndex = -1, targetIndex = -1;
	// The unit is equipped with a weapon of targetItem.
	// targetItem is listed on top in the item list.
	
	for (i = 2; i < count; i++) {
		item = UnitItemControl.getItem(unit, i);
		if (item !== null && fastIndex === -1) {
			// Save the second item index in the item list.
			fastIndex = i;
		}
		
		if (item === targetItem) {
			// Save the item index to be equipped.
			targetIndex = i;
		}
	}
	
	if (fastIndex === -1 || targetIndex === -1) {
		return;
	}
	
	// Don't trade if the index is matched.
	if (fastIndex === targetIndex) {
		return;
	}
	
	// Swap items.
	item = UnitItemControl.getItem(unit, fastIndex);
	UnitItemControl.setItem(unit, fastIndex, targetItem);
	UnitItemControl.setItem(unit, targetIndex, item);
	
	this.updatePossessionItem(unit);
}

ItemControl.setEquippedShield = function(unit, targetItem) {
	var i, item;
	var count = UnitItemControl.getPossessionItemCount(unit);
	var fastIndex = -1, targetIndex = -1;
	// The unit is equipped with a weapon of targetItem.
	// targetItem is listed on top in the item list.
	
	for (i = 1; i < count; i++) {
		item = UnitItemControl.getItem(unit, i);
		if (item !== null && fastIndex === -1) {
			// Save the second item index in the item list.
			fastIndex = i;
		}
		
		if (item === targetItem) {
			// Save the item index to be equipped.
			targetIndex = i;
		}
	}
	
	if (fastIndex === -1 || targetIndex === -1) {
		return;
	}
	
	// Don't trade if the index is matched.
	if (fastIndex === targetIndex) {
		return;
	}
	
	// Swap items.
	item = UnitItemControl.getItem(unit, fastIndex);
	UnitItemControl.setItem(unit, fastIndex, targetItem);
	UnitItemControl.setItem(unit, targetIndex, item);
	
	this.updatePossessionItem(unit);
};

var ShieldItemUse = defineObject(BaseItemUse,
{
	enterMainUseCycle: function(itemUseParent) {
		return EnterResult.NOTENTER;
	}
}
);

var SH007 = AttackFlow._doAttackAction;
AttackFlow._doAttackAction = function() {
	var order = this._order;
	var active = order.getActiveUnit();
	var passive = order.getPassiveUnit();
	var isItemDecrement = order.isCurrentItemDecrement();
	
	SH007.call(this)
	
	if (isItemDecrement) {
		if (ItemControl.getEquippedShield(passive) !== null){
			ItemControl.decreaseItem(passive,ItemControl.getEquippedShield(passive))
		}
	}
};
var SH006 = ItemSelectMenu._doWorkAction;
ItemSelectMenu._doWorkAction = function(index) {
	var item = this._itemListWindow.getCurrentItem();
	var result = SH006.call(this,index)
	if (item.isWeapon() && index === 0){
		ItemControl.setEquippedWeapon(this._unit, item);
		this._resetItemList();
		this._processMode(ItemSelectMenuMode.ITEMSELECT);
		// return MoveResult.END;
	}
	else if (!item.isWeapon() && item.getCustomKeyword() === "Shield"){
		if (index === 0){
			result = ItemSelectMenuResult.NONE;
			ItemControl.setEquippedShield(this._unit, item);
			this._resetItemList();
			this._processMode(ItemSelectMenuMode.ITEMSELECT);
			// return MoveResult.END
		}
		else if (index === 1){
			this._processMode(ItemSelectMenuMode.DISCARD);
		}
	}
	else if (!item.isWeapon() && item.getCustomKeyword() === "Armband"){
		if (index === 0){
			result = ItemSelectMenuResult.NONE;
			ItemControl.setEquippedArmband(this._unit, item);
			this._resetItemList();
			this._processMode(ItemSelectMenuMode.ITEMSELECT);
			// return MoveResult.END
		}
		else if (index === 1){
			this._processMode(ItemSelectMenuMode.DISCARD);
		}
	}
	
	return result;
};

ItemControl.getEquippedArmband = function(unit){
	var i, item, count;
	if (unit === null) {
		return null;
	}
	count = UnitItemControl.getPossessionItemCount(unit);
	for (i = 0; i < count; i++) {
		item = UnitItemControl.getItem(unit, i);
		if (item.isWeapon()){
			continue;
		}
		if (item.getCustomKeyword() !== "Armband"){
			continue;
		}
		if (item !== null && item.getCustomKeyword() === "Armband"){
			return item;
		}
	}
};

ItemControl.getEquippedShield = function(unit) {
	var i, item, count;
	
	if (unit === null) {
		return null;
	}
	
	count = UnitItemControl.getPossessionItemCount(unit);
	
	// Equipped weapon is the first weapon in the item list.
	for (i = 0; i < count; i++) {
		item = UnitItemControl.getItem(unit, i);
		if (item.isWeapon()){
			continue;
		}
		if (item.getCustomKeyword() !== "Shield"){
			continue;
		}
		if (item !== null && item.getCustomKeyword() === "Shield" && ItemControl.isItemUsable(unit,item)){
			return item;
		}
	}
	
	return null;
};

var EQUIP003 = ItemSelectMenu.isWorkAllowed;
ItemSelectMenu.isWorkAllowed = function(index){
	var result = false;
	var item = this._itemListWindow.getCurrentItem();
	if (!item.isWeapon() && item.getCustomKeyword() === ("Shield" || "Armband") && index === 0){
		result = this._isItemUsable(item) && this._unit.getMostResentMov() === 0
	}
	else{
		result = EQUIP003.call(this,index);
	}
	return result;
};