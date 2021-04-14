/*
On an Key you don't want used by a class,
create a custom parameter like this.

{
	BannedClasses:["Soldier","Beast Tamer","Cat Warrior"]
}

The brackets are necessary, as are the curly braces
at the top and bottom.

Enjoy the script, yo!
-RogueClaris

*/

var BanKeysForLeafyCL0 = KeyItemAvailability.isItemAvailableCondition;
KeyItemAvailability.isItemAvailableCondition = function(unit, item){
	var result = BanKeysForLeafyCL0.call(this, unit, item);
	if (typeof item.custom.BannedClasses === 'object'){
		if (item.custom.BannedClasses.indexOf(unit.getClass().getName()) !== -1){
			return false;
		}
	}
	return result;
}

var BanKeysForLeafyCL1 = UnitCommand.Treasure.isCommandDisplayable;
UnitCommand.Treasure.isCommandDisplayable = function(){
	var result = BanKeysForLeafyCL1.call(this);
	var requireFlag = KeyFlag.TREASURE;
	var unit = this.getCommandTarget();
	var item = ItemControl.getKeyItem(unit, requireFlag);
	if (item !== null && typeof item.custom.BannedClasses === 'object'){
		if (item.custom.BannedClasses.indexOf(unit.getClass().getName()) !== -1){
			return false;
		}
	}
	return result;
}