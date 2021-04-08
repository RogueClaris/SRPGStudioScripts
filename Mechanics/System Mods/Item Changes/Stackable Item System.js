/*
Hello and welcome to the Stackable Items Script!
To use, set the following custom parameters on items
you wish to stack:

{
	Stackable:true,
	MaxStack:10,
	Amount:1
}

Stackable should always be set to true; however,
MaxStack can be any number. This is the maximum
amount of uses a stackable item can have.

Additionally, Amount is a custom parameter that
determines how many uses are added when merging
copies of the same item. It should usually be
equal to the amount of uses the item has at
maximum, but you can set it to any number you
want, really.

Enjoy the script!
-Lady Rena, April 4th, 2019
*/

StockItemControl.pushStockItem = function(item) {
	var itemArray = this.getStockItemArray();
	var i;
	var item2 = null;
	for (i = 0; i < itemArray.length; i++){
		this.sortItem();
		if (itemArray[i].getName() === item.getName() && itemArray[i].getId() === item.getId()){
			item2 = itemArray[i];
			break;
		}
	}
	if (item2 !== null){
		if (item2.custom.Stackable && item2.getLimit() !== item2.custom.MaxStack){
			var increase = item2.getLimit() + item.custom.Amount;
			item2.setLimit(Math.min(item2.custom.MaxStack,increase))
			itemArray.push(item)
			this.sortItem();
			var Removed = StockItemControl.getIndexFromItem(item);
			StockItemControl.cutStockItem(Removed);
		}
		else{
			itemArray.push(item);
			this.sortItem();
		}
	}
	else{
		itemArray.push(item);
		this.sortItem();
	}
};

UnitItemControl.pushItem = function(unit, item) {
	var count = this.getPossessionItemCount(unit);
	var i;
	var item2 = null;
	if (count < DataConfig.getMaxUnitItemCount()){
		this.arrangeItem(unit);
		for (i = 0; i < count; i++) {
			if (unit.getItem(i) !== null && unit.getItem(i).getName() === item.getName()){
				item2 = unit.getItem(i);
				break;
			}
		}
		if (item2 !== null){
			if (item2.custom.Stackable && item2.getLimit() !== item.custom.MaxStack){
				var increase = item2.getLimit() + item.custom.Amount
				item2.setLimit(Math.min(item2.custom.MaxStack,increase))
			}
			else{
				unit.setItem(count, item);
			}
		}
		else{
			unit.setItem(count, item);
		}
		return true;
	}
	return false;
};
var MergeCommandMode = {
	MERGE: 0
}
UnitCommand.Merge = defineObject(UnitListCommand,
{
	openCommand: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveCommand: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === MergeCommandMode.MERGE) {
			result = this._moveMerge();
		}
		
		return result;
	},
	
	isCommandDisplayable: function() {
		return true;
	},
	
	getCommandName: function() {
		return "Merge"
	},
	
	isRepeatMoveAllowed: function() {
		return true;
	},
	
	_prepareCommandMemberData: function() {
	},
	
	_completeCommandMemberData: function() {
		var unit = this.getCommandTarget();
		
		this.changeCycleMode(MergeCommandMode.MERGE);
	},
	
	_moveMerge: function(){
		var unit = this.getCommandTarget();
		var count = UnitItemControl.getPossessionItemCount(unit);
		var i, lastItem;
		for (i = 0; i < count; i++){
			UnitItemControl.arrangeItem(unit)
			if (i !== 0 && unit.getItem(i) !== null){
				lastItem = unit.getItem(i-1)
				if (unit.getItem(i).custom.Stackable && lastItem.getLimit() !== 0 && unit.getItem(i).getName() === lastItem.getName()){
					var increase = unit.getItem(i).custom.Amount+lastItem.getLimit()
					lastItem.setLimit(Math.min(lastItem.custom.MaxStack,increase))
					UnitItemControl.cutItem(unit,i)
				}
			}
		}
	}
}
);