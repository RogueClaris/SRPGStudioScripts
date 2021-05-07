/*
Hello and welcome to the Stackable Items Script!
To use, set the following custom parameters on items
you wish to stack:

{
	Stackable:true,
	Splittable:true,
	MaxStack:10
}

Stackable should always be set to true; however,
MaxStack is optional, and can be any number. This
is the maximum amount of uses a stackable item can
have. As to Splittable, this is set if you wish to
be able to use the Split command on the item.

Enjoy the script!
-Rogue Claris, April 4th, 2019

==UPDATE LOG==
 =May 7th, 2021=
 Fixed merging features to properly
account for all items and to loop over inventory
correctly.
 Fixed pushing to inventory and convoy. They now
properly merge items instead of sometimes causing
items to disappear.
 Changed how item maximums are checked.
 Changed how item additions are checked.
 Removed Custom Parameter {Amount:X}, which
dictated how much durability was restored. It
now runs on item's current durability always.
This feature may be restored at a later date.
 Added Split command. Break items out of stacks!
*/

StockItemControl.pushStockItem = function(item) {
	var itemArray = this.getStockItemArray();
	var i;
	var item2 = null;
	this.sortItem();
	for (i = 0; i < itemArray.length; i++){
		var checkItem = itemArray[i]
		var custCheck = checkItem.custom.Stackable;
		var custCheckMax = typeof checkItem.custom.MaxStack === 'number' ? checkItem.custom.MaxStack : checkItem.getLimitMax()
		if (custCheck && checkItem.getName() === item.getName() && checkItem.getId() === item.getId() && custCheckMax > checkItem.getLimit()){
			item2 = itemArray[i];
			break;
		}
	}
	if (item2 !== null){
		var max = typeof item2.custom.MaxStack === 'number' ? item2.custom.MaxStack : item2.getLimitMax()
		if (item2.custom.Stackable){
			if (item.getLimit() > 0 && item.getLimit() < max && item2.getId() === item.getId()){
				var amount = item.getLimit()
				var increase = item2.getLimit() + amount;
				if (increase > max){
					item2.setLimit(max);
					amount = increase - max;
				}
				else{
					item2.setLimit(increase)
				}
				if (amount > 0 && amount < item.getLimit()){
					item.setLimit(item.getLimit() - amount)
					itemArray.push(item)
				}
				this.sortItem();
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
	}
	else{
		itemArray.push(item);
		this.sortItem();
	}
};

UnitItemControl.pushItem = function(unit, item) {
	root.log('hi')
	var count = this.getPossessionItemCount(unit);
	var i;
	var item2 = null;
	this.arrangeItem(unit);
	if (count < DataConfig.getMaxUnitItemCount()){
		for (i = 0; i < count; i++) {
			var checkItem = unit.getItem(i)
			var custCheck = checkItem != null ? checkItem.custom.Stackable : false;
			var custCheckMax = custCheck ? typeof checkItem.custom.MaxStack === 'number' ? checkItem.custom.MaxStack : checkItem.getLimitMax() : 0;
			if (checkItem !== null && custCheck && checkItem.getName() === item.getName() && checkItem.getId() === item.getId() && custCheckMax > checkItem.getLimit()){
				item2 = unit.getItem(i);
				break;
			}
		}
		if (item2 !== null){
			if (item2.custom.Stackable){
				var max = typeof item2.custom.MaxStack === 'number' ? item2.custom.MaxStack : item2.getLimitMax()
				if (item.getLimit() > 0 && item.getLimit() < max && item2.getId() === item.getId()){
					var amount = item.getLimit()
					var increase = item2.getLimit() + amount;
					if (increase > max){
						item2.setLimit(max);
						amount = increase - max;
					}
					else{
						item2.setLimit(increase)
					}
					if (amount > 0 && amount < item.getLimit()){
						item.setLimit(item.getLimit() - amount)
						unit.setItem(count, item)
					}
				}
				else{
					unit.setItem(count, item);
				}
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
		return this.checkMerge()
	},
	
	checkMerge: function(){
		var unit = this.getCommandTarget()
		var result = false;
		var item, prevItem, max, max2;
		var count = UnitItemControl.getPossessionItemCount(unit)
		for (i = 1; i < count; i++){
			UnitItemControl.arrangeItem(unit)
			item = unit.getItem(i);
			prevItem = unit.getItem(i-1);
			if (item !== null && item.custom.Stackable && prevItem.custom.Stackable){
				max = typeof prevItem.custom.MaxStack === 'number' ? prevItem.custom.MaxStack : prevItem.getLimitMax();
			}
			if (prevItem !== null && prevItem.custom.Stackable){
				max2 = typeof item.custom.MaxStack === 'number' ? item.custom.MaxStack : item.getLimitMax();
			}
			if (typeof max === 'number' && max > item.getLimit() && typeof max2 === 'number' && max2 > prevItem.getLimit()){
				result = true;
			}
		}
		return result;
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
		var i, item, lastItem, max2, max, amount, increase;
		var result = null;
		while (result === null){
			lastItem = null;
			for (i = 1; i < count; i++){
				UnitItemControl.arrangeItem(unit)
				item = unit.getItem(i);
				prevItem = unit.getItem(i-1);
				if (item !== null && prevItem !== null && item.custom.Stackable){
					max = typeof prevItem.custom.MaxStack === 'number' ? prevItem.custom.MaxStack : prevItem.getLimitMax()
					if (prevItem.getLimit() > 0 && prevItem.getLimit() < max && item.getId() === prevItem.getId()){
						amount = item.getLimit()
						increase = amount + prevItem.getLimit()
						if (increase > max){
							prevItem.setLimit(max);
							amount = increase - max;
						}
						else{
							prevItem.setLimit(increase)
						}
						if (amount > 0 && amount < item.getLimit()){
							item.setLimit(item.getLimit() - amount)
						}
						else{
							UnitItemControl.cutItem(unit,i)
						}
						count = UnitItemControl.getPossessionItemCount(unit);
						i -= 1
						if (i < 1){
							i = 1;
						}
					}
				}
			}
			if (i === count){
				result = true;
				for (i = 1; i < count; i++){
					UnitItemControl.arrangeItem(unit)
					item = unit.getItem(i);
					prevItem = unit.getItem(i-1);
					if (item !== null && item.custom.Stackable && prevItem.custom.Stackable){
						max = typeof prevItem.custom.MaxStack === 'number' ? prevItem.custom.MaxStack : prevItem.getLimitMax();
					}
					if (prevItem !== null && prevItem.custom.Stackable){
						max2 = typeof item.custom.MaxStack === 'number' ? item.custom.MaxStack : item.getLimitMax();
					}
					if (typeof max === 'number' && max > item.getLimit() && typeof max2 === 'number' && max2 > prevItem.getLimit()){
						result = null;
					}
				}
			}
		}
		this.rebuildCommand()
	}
}
);

var AddMergeCL0 = UnitCommand.configureCommands;
UnitCommand.configureCommands = function(groupArray){
	AddMergeCL0.call(this, groupArray);
	groupArray.insertObject(UnitCommand.Merge, groupArray.indexOf(UnitCommand.Item)-1)
	groupArray.insertObject(UnitCommand.Split, groupArray.indexOf(UnitCommand.Item))
};

var SplitCommandMode = {
	SELECT: 0,
	AMOUNT: 1,
	SPLIT: 2
}

UnitCommand.Split = defineObject(UnitListCommand,
{
	_unit: null,
	_itemMenu: null,
	_bonusInputWindow: null,
	
	drawCommand: function() {
		var mode = this.getCycleMode();
		this._drawSelect();
	},
	
	openCommand: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	getCommandName: function() {
		return "Split";
	},
	
	isCommandDisplayable: function() {
		return this.checkSplit();
	},
	
	checkSplit: function(){
		var result = false;
		var unit = this.getCommandTarget();
		if (!UnitItemControl.isUnitItemSpace(unit)){
			return result;
		}
		var count = UnitItemControl.getPossessionItemCount(unit);
		var item, i;
		for (i = 0; i < count; i++){
			item = unit.getItem(i)
			if (item.custom.Splittable && item.getLimit() > 1){
				result = true;
			}
		}
		return result;
	},
	
	isRepeatMoveAllowed: function() {
		return true;
	},
	
	_prepareCommandMemberData: function() {
		this._unit = this.getCommandTarget();
		this._itemMenu = createObject(SplitSelectMenu)
		this._bonusInputWindow = createWindowObject(SplitInputWindow, this)
	},
	
	moveCommand: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === SplitCommandMode.SELECT) {
			result = this._moveSelect();
		}
		else if (mode === SplitCommandMode.AMOUNT){
			result = this._moveAmount();
		}
		else if (mode === SplitCommandMode.SPLIT){
			result = this._moveSplit();
		}
		
		return result;
	},
	
	_completeCommandMemberData: function() {
		this._itemMenu.setMenuTarget(this.getCommandTarget());
		this.changeCycleMode(SplitCommandMode.SELECT)
	},
	
	_moveSelect: function(){
		var item;
		var unit = this.getCommandTarget();
		var result = this._itemMenu.moveWindowManager();
		if (result === SplitSelectMenuResult.CHOOSE){
			item = this._itemMenu.getSelectItem();
			if (item.custom.Splittable){
				this._item = item;
				this._bonusInputWindow.setItem(item);
				this.changeCycleMode(SplitCommandMode.AMOUNT)
			}
			else{
				MediaControl.soundDirect('operationblock')
			}
		}
		else if (result === SplitSelectMenuResult.CANCEL){
			this.rebuildCommand();
			return MoveResult.END;
		}
		return MoveResult.CONTINUE;
	},
	
	_moveAmount: function(){
		if (this._bonusInputWindow.moveWindow() !== MoveResult.CONTINUE) {
			if (this._bonusInputWindow.getInputExp() === -1) {
				this.changeCycleMode(SplitCommandMode.SELECT)
			}
			else {
				this.changeCycleMode(SplitCommandMode.SPLIT)
			}
		}
		return MoveResult.CONTINUE;
	},
	
	_drawSelect: function(){
		this._itemMenu.drawWindowManager();
		if (this.getCycleMode() === SplitCommandMode.AMOUNT){
			x = LayoutControl.getUnitBaseX(this._unit, this._bonusInputWindow.getWindowWidth());
			y = LayoutControl.getUnitBaseY(this._unit, this._bonusInputWindow.getWindowHeight());
			this._bonusInputWindow.drawWindow(x, y);
		}
	},
	
	_moveSplit: function(){
		var unit = this.getCommandTarget()
		var item2 = root.duplicateItem(this._item);
		item2.setLimit(this._bonusInputWindow.getInputExp())
		unit.setItem(UnitItemControl.getPossessionItemCount(unit), item2)
		this._item.setLimit(this._item.getLimit() - this._bonusInputWindow.getInputExp())
		if (!this.checkSplit()){
			this.rebuildCommand();
			return MoveResult.END;
		}
		else{
			UnitItemControl.arrangeItem(unit)
			this._itemMenu._resetItemList()
			this.changeCycleMode(SplitCommandMode.SELECT)
		}
		return MoveResult.CONTINUE;
	}
}
);

var SplitSelectMenuResult = {
	NONE: 0,
	CHOOSE: 1,
	CANCEL: 2
}

SplitSelectMenu = defineObject(ItemSelectMenu,
{
	_moveItemSelect: function() {
		var input = this._itemListWindow.moveWindow();
		var result = SplitSelectMenuResult.NONE;
		
		if (input === ScrollbarInput.SELECT) {
			result = SplitSelectMenuResult.CHOOSE;
		}
		else if (input === ScrollbarInput.CANCEL) {
			ItemControl.updatePossessionItem(this._unit);
			result = SplitSelectMenuResult.CANCEL;
		}
		else {
			if (this._itemListWindow.isIndexChanged()) {
				this._itemInfoWindow.setInfoItem(this._itemListWindow.getCurrentItem());
			}
		}
		return result;
	}
}
);

SplitInputWindow = defineObject(BonusInputWindow,
{
	//don't change unit so as not to cause too many problems with the code.
	_unit: null,
	_exp: 0,
	_max: 0,
	_commandCursor: null,
	//change the command name though, for the sake of what you're doing being obvious.
	setItem: function(item) {
		this._unit = item;
		//remove a lot of code.
		this._max = this._unit.getLimit()-1
		this._exp = 1;
		this.changeCycleMode(BonusInputWindowMode.INPUT);
	}
}
);