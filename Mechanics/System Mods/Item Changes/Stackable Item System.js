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
September 19th, 2023:
  *
May 7th, 2021:
  * Fixed merging features to properly account for all items and to loop over inventory correctly.
  * Fixed pushing to inventory and convoy.
	* They now properly merge items instead of sometimes causing items to disappear.
  * Changed how item maximums are checked.
  * Changed how item additions are checked.
  * Removed Custom Parameter {Amount:X}
	* Durability is now restored based on each item's durability.
	* This feature may be added back at a later date.
  * Added Split command which breaks items out of stacks.
*/


// Custom Listing object to control item stacking.
var StackableItemControlCL = {
	_itemArray: null,
	_targetUnit: null,
	_isUnitMode: null,

	// Set the item array so that it can be referenced freely by other functions.
	setItemArray: function (arr) {
		if (arr != null && arr.length > 0) {
			this._itemArray = arr;
			return EnterResult.OK;
		}
		return EnterResult.NOTENTER;
	},

	// We might be arranging the items of a unit. If so, set it.
	setUnit: function (unit) {
		if (unit != null) {
			this._targetUnit = unit;
			return EnterResult.OK;
		}
		return EnterResult.NOTENTER;
	},

	setup: function (isUnit) {
		var start;
		this._isUnitMode = isUnit;
		if (isUnit) {
			start = this.setItemArray(arr);
			start = this.setUnit(unit);
		}
		else {
			start = this.setItemArray(StockItemControl.getStockItemArray());
		}

		if (start == EnterResult.OK) {
			this.merge();
		}
	},

	merge: function () {
		var count, item, lastItem, max2, max, amount, increase, unit;
		if (this._isUnitMode) {
			unit = this._targetUnit;
			count = UnitItemControl.getPossessionItemCount(unit);
		}
		else {
			count = this._itemArray.length;
		}
		// Assign -1 so that it begins at 0 when the loop begins.
		var index = -1;
		while (true) {
			// Increment index.
			index++;

			// Obtain items to compare, and adjust stacking.
			item = this._isUnitMode ? UnitItemControl.getItem(index) : StockItemControl.getItem(index);
			lastItem = this._isUnitMode ? UnitItemControl.getMatchItem(this._unit, index) : StockItemControl.getMatchItem(index);

			/*
				Conditions to exit the loop:
					* Index is greater than Count.
					* Item was not found.
					* Comparison item was not found ("lastItem")
			*/
			if (index > count || item === null || lastItem === null) {
				break;
			}

			if (item.custom.Stackable) {
				/*
					Ternary operator. Determines what to do based on a condition. Equivalent to the following code:
						if (comparison) {
							// run code on the left of the ":" symbol
						}
						else {
							// run code on the right of the ":" symbol
						}
					In this case I am setting the value of "max" based on the comparison on the left of the "?" symbol.
				*/
				max = typeof item.custom.MaxStack === 'number' ? item.custom.MaxStack : item.getLimitMax();
				amount = item.getLimit();

				// Only proceed if item has a valid limit that is not at the maximum.
				if (amount > 0 && amount < max) {
					increase = amount + item.getLimit();

					// Set limit relevant to maximum.
					increase > max ? item.setLimit(max) : item.setLimit(increase);

					// Determine last operations based on unit mode or not unit mode.
					if (this._isUnitMode) {
						UnitItemControl.cutItem(unit, UnitItemControl.getIndexFromItem(unit, lastItem))
						UnitItemControl.arrangeItem(unit);
					}
					else {
						StockItemControl.cutItem(StockItemControl.getIndexFromItem(lastItem))
						StockItemControl.sortItem();
					}
					// Reassign count & decrement index to obtain data properly.
					// Do not let index go below 0 while in the loop.
					count = this._isUnitMode ? UnitItemControl.getPossessionItemCount(unit) : this._itemArray.length;
					index = Math.max(index - 1, 0);
				}
			}
		}
	}
}

StockItemControl.pushStockItem = function (item) {
	var itemArray = this.getStockItemArray();
	var index;
	var item2 = null;
	this.sortItem();
	for (index = 0; index < itemArray.length; index++) {
		var checkItem = itemArray[index]
		var custCheck = checkItem.custom.Stackable;
		var custCheckMax = typeof checkItem.custom.MaxStack === 'number' ? checkItem.custom.MaxStack : checkItem.getLimitMax()
		if (custCheck && checkItem.getName() === item.getName() && checkItem.getId() === item.getId() && custCheckMax > checkItem.getLimit()) {
			item2 = itemArray[index];
			break;
		}
	}
	if (item2 !== null) {
		var max = typeof item2.custom.MaxStack === 'number' ? item2.custom.MaxStack : item2.getLimitMax()
		if (item2.custom.Stackable) {
			if (item.getLimit() > 0 && item.getLimit() < max && item2.getId() === item.getId()) {
				var amount = item.getLimit()
				var increase = item2.getLimit() + amount;
				if (increase > max) {
					item2.setLimit(max);
					amount = increase - max;
				}
				else {
					item2.setLimit(increase)
				}
				if (amount > 0 && amount < item.getLimit()) {
					item.setLimit(item.getLimit() - amount)
					itemArray.push(item)
				}
				this.sortItem();
			}
			else {
				itemArray.push(item);
				this.sortItem();
			}
		}
		else {
			itemArray.push(item);
			this.sortItem();
		}
	}
	else {
		itemArray.push(item);
		this.sortItem();
	}
};

UnitItemControl.pushItem = function (unit, item) {
	var count = this.getPossessionItemCount(unit);
	var index;
	var item2 = null;
	this.arrangeItem(unit);
	if (count < DataConfig.getMaxUnitItemCount()) {
		for (index = 0; index < count; index++) {
			var checkItem = unit.getItem(index)
			var custCheck = checkItem != null ? checkItem.custom.Stackable : false;
			var custCheckMax = custCheck ? typeof checkItem.custom.MaxStack === 'number' ? checkItem.custom.MaxStack : checkItem.getLimitMax() : 0;
			if (checkItem !== null && custCheck && checkItem.getName() === item.getName() && checkItem.getId() === item.getId() && custCheckMax > checkItem.getLimit()) {
				item2 = unit.getItem(index);
				break;
			}
		}
		if (item2 !== null) {
			if (item2.custom.Stackable) {
				var max = typeof item2.custom.MaxStack === 'number' ? item2.custom.MaxStack : item2.getLimitMax()
				if (item.getLimit() > 0 && item.getLimit() < max && item2.getId() === item.getId()) {
					var amount = item.getLimit()
					var increase = item2.getLimit() + amount;
					if (increase > max) {
						item2.setLimit(max);
						amount = increase - max;
					}
					else {
						item2.setLimit(increase)
					}
					if (amount > 0 && amount < item.getLimit()) {
						item.setLimit(item.getLimit() - amount)
						unit.setItem(count, item)
					}
				}
				else {
					unit.setItem(count, item);
				}
			}
			else {
				unit.setItem(count, item);
			}
		}
		else {
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
		openCommand: function () {
			this._prepareCommandMemberData();
			this._completeCommandMemberData();
		},

		moveCommand: function () {
			var mode = this.getCycleMode();
			var result = MoveResult.CONTINUE;

			if (mode === MergeCommandMode.MERGE) {
				result = this._moveMerge();
			}

			return result;
		},

		isCommandDisplayable: function () {
			return this.checkMerge()
		},

		checkMerge: function () {
			var unit = this.getCommandTarget()
			var result = false;
			var item, prevItem, max, max2;
			var count = UnitItemControl.getPossessionItemCount(unit)
			for (index = 1; index < count; index++) {
				UnitItemControl.arrangeItem(unit)
				item = unit.getItem(index);
				prevItem = unit.getItem(index - 1);
				if (item !== null && item.custom.Stackable && prevItem.custom.Stackable) {
					max = typeof prevItem.custom.MaxStack === 'number' ? prevItem.custom.MaxStack : prevItem.getLimitMax();
				}
				if (prevItem !== null && prevItem.custom.Stackable) {
					max2 = typeof item.custom.MaxStack === 'number' ? item.custom.MaxStack : item.getLimitMax();
				}
				if (typeof max === 'number' && max > item.getLimit() && typeof max2 === 'number' && max2 > prevItem.getLimit()) {
					result = true;
				}
			}
			return result;
		},

		getCommandName: function () {
			return "Merge"
		},

		isRepeatMoveAllowed: function () {
			return true;
		},

		_prepareCommandMemberData: function () {
		},

		_completeCommandMemberData: function () {
			var unit = this.getCommandTarget();
			this.changeCycleMode(MergeCommandMode.MERGE);
		},

		_moveMerge: function () {
			var unit = this.getCommandTarget();
			var count = UnitItemControl.getPossessionItemCount(unit);
			var index, item, lastItem, max2, max, amount, increase;
			var result = null;
			while (result === null) {
				lastItem = null;
				for (index = 1; index < count; index++) {
					UnitItemControl.arrangeItem(unit)
					item = unit.getItem(index);
					prevItem = unit.getItem(index - 1);
					if (item !== null && prevItem !== null && item.custom.Stackable) {
						max = typeof prevItem.custom.MaxStack === 'number' ? prevItem.custom.MaxStack : prevItem.getLimitMax()
						if (prevItem.getLimit() > 0 && prevItem.getLimit() < max && item.getId() === prevItem.getId()) {
							amount = item.getLimit()
							increase = amount + prevItem.getLimit()
							if (increase > max) {
								prevItem.setLimit(max);
								amount = increase - max;
							}
							else {
								prevItem.setLimit(increase)
							}
							if (amount > 0 && amount < item.getLimit()) {
								item.setLimit(item.getLimit() - amount)
							}
							else {
								UnitItemControl.cutItem(unit, index)
							}
							count = UnitItemControl.getPossessionItemCount(unit);
							index -= 1
							if (index < 1) {
								index = 1;
							}
						}
					}
				}
				if (index === count) {
					result = true;
					for (index = 1; index < count; index++) {
						UnitItemControl.arrangeItem(unit)
						item = unit.getItem(index);
						prevItem = unit.getItem(index - 1);
						if (item !== null && item.custom.Stackable && prevItem.custom.Stackable) {
							max = typeof prevItem.custom.MaxStack === 'number' ? prevItem.custom.MaxStack : prevItem.getLimitMax();
						}
						if (prevItem !== null && prevItem.custom.Stackable) {
							max2 = typeof item.custom.MaxStack === 'number' ? item.custom.MaxStack : item.getLimitMax();
						}
						if (typeof max === 'number' && max > item.getLimit() && typeof max2 === 'number' && max2 > prevItem.getLimit()) {
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
UnitCommand.configureCommands = function (groupArray) {
	AddMergeCL0.call(this, groupArray);
	// Insert at index of Item command as these are item related functions.
	var index = groupArray.indexOf(UnitCommand.Item);
	groupArray.insertObject(UnitCommand.Merge, index)
	groupArray.insertObject(UnitCommand.Split, index)
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

		drawCommand: function () {
			var mode = this.getCycleMode();
			this._drawSelect();
		},

		openCommand: function () {
			this._prepareCommandMemberData();
			this._completeCommandMemberData();
		},

		getCommandName: function () {
			return "Split";
		},

		isCommandDisplayable: function () {
			return this.checkSplit();
		},

		checkSplit: function () {
			var result = false;
			var unit = this.getCommandTarget();
			if (!UnitItemControl.isUnitItemSpace(unit)) {
				return result;
			}
			var count = UnitItemControl.getPossessionItemCount(unit);
			var item, index;
			for (index = 0; index < count; index++) {
				item = unit.getItem(index)
				if (item.custom.Splittable && item.getLimit() > 1) {
					result = true;
				}
			}
			return result;
		},

		isRepeatMoveAllowed: function () {
			return true;
		},

		_prepareCommandMemberData: function () {
			this._unit = this.getCommandTarget();
			this._itemMenu = createObject(SplitSelectMenu)
			this._bonusInputWindow = createWindowObject(SplitInputWindow, this)
		},

		moveCommand: function () {
			var mode = this.getCycleMode();
			var result = MoveResult.CONTINUE;

			if (mode === SplitCommandMode.SELECT) {
				result = this._moveSelect();
			}
			else if (mode === SplitCommandMode.AMOUNT) {
				result = this._moveAmount();
			}
			else if (mode === SplitCommandMode.SPLIT) {
				result = this._moveSplit();
			}

			return result;
		},

		_completeCommandMemberData: function () {
			this._itemMenu.setMenuTarget(this.getCommandTarget());
			this.changeCycleMode(SplitCommandMode.SELECT)
		},

		_moveSelect: function () {
			var item;
			var unit = this.getCommandTarget();
			var result = this._itemMenu.moveWindowManager();
			if (result === SplitSelectMenuResult.CHOOSE) {
				item = this._itemMenu.getSelectItem();
				if (item.custom.Splittable) {
					this._item = item;
					this._bonusInputWindow.setItem(item);
					this.changeCycleMode(SplitCommandMode.AMOUNT)
				}
				else {
					MediaControl.soundDirect('operationblock')
				}
			}
			else if (result === SplitSelectMenuResult.CANCEL) {
				this.rebuildCommand();
				return MoveResult.END;
			}
			return MoveResult.CONTINUE;
		},

		_moveAmount: function () {
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

		_drawSelect: function () {
			this._itemMenu.drawWindowManager();
			if (this.getCycleMode() === SplitCommandMode.AMOUNT) {
				x = LayoutControl.getUnitBaseX(this._unit, this._bonusInputWindow.getWindowWidth());
				y = LayoutControl.getUnitBaseY(this._unit, this._bonusInputWindow.getWindowHeight());
				this._bonusInputWindow.drawWindow(x, y);
			}
		},

		_moveSplit: function () {
			var unit = this.getCommandTarget()
			var item2 = root.duplicateItem(this._item);
			item2.setLimit(this._bonusInputWindow.getInputExp())
			unit.setItem(UnitItemControl.getPossessionItemCount(unit), item2)
			this._item.setLimit(this._item.getLimit() - this._bonusInputWindow.getInputExp())
			if (!this.checkSplit()) {
				this.rebuildCommand();
				return MoveResult.END;
			}
			else {
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
		_moveItemSelect: function () {
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
		setItem: function (item) {
			this._unit = item;
			//remove a lot of code.
			this._max = this._unit.getLimit() - 1
			this._exp = 1;
			this.changeCycleMode(BonusInputWindowMode.INPUT);
		}
	}
);