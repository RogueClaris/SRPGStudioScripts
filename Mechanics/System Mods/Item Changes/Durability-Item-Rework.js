/*
To use this script, create a Durability Repair item, and give it the following Custom Parameters:

{DIRT:"Static",DIRN:50} OR {DIRT:"Percent",DIRN:50}

The Custom Parameter DIRT chooses the Durability Item Repair Type, and the Custom Parameter DIRN dictates
how much you will be recovering on the item you select. DIRT must be a String, including the quotes, while
DIRN must be an integer, without quotes.

Example 1 does the following: Sets the Repair Type to Static Addition, and will add 50 uses to the item in question.
Example 2 does the following: Sets the Repair Type to Percentile Addition, and will add 50% of the item's max uses to the item in question.

Enjoy the script.

-Lady Rena, 8/8/2019 
*/


var DurabilityChangeSelectMode = {
	TARGETSELECT: 0,
	ITEMSELECT: 1
};

var DurabilityChangeItemSelection = defineObject(BaseItemSelection,
{
	_isSelf: false,
	_durabilitySelectManager: null,
	
	setInitialSelection: function() {
		var rangeType = this._item.getRangeType();
		
		if (rangeType === SelectionRangeType.SELFONLY) {
			this._isSelf = true;
			this._changeItemSelect();
		}
		else {
			this._changeTargetSelect();
		}
		
		return EnterResult.OK;
	},
	
	moveItemSelectionCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === DurabilityChangeSelectMode.TARGETSELECT) {
			result = this._moveTargetSelect();
		}
		else if (mode === DurabilityChangeSelectMode.ITEMSELECT) {
			result = this._moveItemSelect();
		}
		
		return result;
	},
	
	drawItemSelectionCycle: function() {
		var mode = this.getCycleMode();
		
		if (mode === DurabilityChangeSelectMode.TARGETSELECT) {
			this._posSelector.drawPosSelector();
		}
		else if (mode === DurabilityChangeSelectMode.ITEMSELECT) {
			this._durabilitySelectManager.drawWindowManager();
		}
	},
	
	_moveTargetSelect: function() {
		var result = this._posSelector.movePosSelector();
	
		if (result === PosSelectorResult.SELECT) {
			if (this.isPosSelectable()) {
				this._targetUnit = this._posSelector.getSelectorTarget(false);
				this._changeItemSelect();
				return MoveResult.CONTINUE;
			}
		}
		else if (result === PosSelectorResult.CANCEL) {
			this._isSelection = false;
			this._posSelector.endPosSelector();
			return MoveResult.END;
		}

		return MoveResult.CONTINUE;
	},
	
	_moveItemSelect: function() {
		if (this._durabilitySelectManager.moveWindowManager() !== MoveResult.CONTINUE) {
			this._targetItem = this._durabilitySelectManager.getTargetItem();
			if (this._targetItem !== null) {
				this._isSelection = true;
				this._posSelector.endPosSelector();
				return MoveResult.END;
			}
			else {
				if (this._isSelf) {
					this._isSelection = false;
					this._posSelector.endPosSelector();
					return MoveResult.END;
				}
				else {
					this._changeTargetSelect();
				}
			}
		}
		
		return MoveResult.CONTINUE;
	},
	
	_changeTargetSelect: function() {
		this.setUnitSelection();
		this.changeCycleMode(DurabilityChangeSelectMode.TARGETSELECT);
	},
	
	_changeItemSelect: function() {
		this._durabilitySelectManager = createObject(DurabilitySelectManager);
		this._durabilitySelectManager.setTargetUnit(this._targetUnit, this._item);
		this.changeCycleMode(DurabilityChangeSelectMode.ITEMSELECT);
	}
}
);

var DurabilityChangeType = {
	MAXRECOVERY: 0,
	HALF: 1,
	BREAK: 2
};

var DurabilityChangeItemUse = defineObject(BaseItemUse,
{
	enterMainUseCycle: function(itemUseParent) {
		var durability, generator;
		var increaseType = IncreaseType.ASSIGNMENT;
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var type = itemTargetInfo.item.getDurabilityInfo().getDurabilityChangeType();
		
		if (typeof itemTargetInfo.item.custom.DIRT === 'string' && typeof itemTargetInfo.item.custom.DIRN === 'number'){
			if (itemTargetInfo.item.custom.DIRT === 'Static'){
				durability = itemTargetInfo.targetItem.getLimit() + itemTargetInfo.item.custom.DIRN
			}
			else if (itemTargetInfo.item.custom.DIRT === 'Percent'){
				durability = itemTargetInfo.targetItem.getLimit() + Math.round(itemTargetInfo.targetItem.getLimitMax() * (itemTargetInfo.item.custom.DIRN / 100))
			}
		}
		else if (type === DurabilityChangeType.MAXRECOVERY) {
			durability = itemTargetInfo.targetItem.getLimitMax();
		}
		else if (type === DurabilityChangeType.HALF) {
			durability = Math.floor(itemTargetInfo.targetItem.getLimit() / 2);
		}
		else {
			durability = -1;
		}
		
		this._dynamicEvent = createObject(DynamicEvent);
		generator = this._dynamicEvent.acquireEventGenerator();
		generator.itemDurabilityChange(itemTargetInfo.targetUnit, itemTargetInfo.targetItem, durability, increaseType, itemUseParent.isItemSkipMode());
		
		return this._dynamicEvent.executeDynamicEvent();
	},
	
	moveMainUseCycle: function() {
		return this._dynamicEvent.moveDynamicEvent();
	},
	
	getItemAnimePos: function(itemUseParent, animeData) {
		return this.getUnitBasePos(itemUseParent, animeData);
	}
}
);

var DurabilityItemInfo = defineObject(BaseItemInfo,
{
	drawItemInfoCycle: function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName(StringTable.ItemInfo_Durability));
		
		y += ItemInfoRenderer.getSpaceY();
		this._drawType(x, y);
		
		y += ItemInfoRenderer.getSpaceY();
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType());
	},
	
	getInfoPartsCount: function() {
		return 3;
	},
	
	_drawType: function(x, y) {
		var type = this._item.getDurabilityInfo().getDurabilityChangeType();
		var arr = [StringTable.DurabilityType_Max, StringTable.DurabilityType_Half, StringTable.DurabilityType_Break];
		if (typeof this._item.custom.DIRT === 'string'){
			ItemInfoRenderer.drawKeyword(x, y, "Pt");
		}
		else{
			ItemInfoRenderer.drawKeyword(x, y, arr[type]);
		}
	}
}
);

var DurabilityChangeItemPotency = defineObject(BaseItemPotency,
{
}
);

var DurabilityChangeItemAvailability = defineObject(BaseItemAvailability,
{
}
);

var DurabilityChangeItemAI = defineObject(BaseItemAI,
{
}
);

var DurabilitySelectManager = defineObject(BaseWindowManager,
{
	_targetUnit: null,
	_item: null,
	_targetItem: null,
	_itemListWindow: null,
	_itemInfoWindow: null,
	
	setTargetUnit: function(targetUnit, item) {
		this._targetUnit = targetUnit;
		this._item = item;
		
		this._itemListWindow = createWindowObject(ItemDurabilityListWindow, this);
		this._itemListWindow.setDefaultItemFormation();
		this._itemListWindow.setDurabilityItemFormation(targetUnit, item);
		this._itemListWindow.setActive(true);
		
		this._itemInfoWindow = createWindowObject(ItemInfoWindow, this);
	},
	
	moveWindowManager: function() {
		var targetItem = this._itemListWindow.getCurrentItem();
		var input = this._itemListWindow.moveWindow();
		
		if (input === ScrollbarInput.SELECT) {
			if (!Miscellaneous.isDurabilityChangeAllowed(this._item, targetItem)) {
				this._playOperationBlockSound();
			}
			else {
				this._targetItem = targetItem;
				return MoveResult.END;
			}
		}
		else if (input === ScrollbarInput.CANCEL) {
			this._targetItem = null;
			return MoveResult.END;
		}
		
		if (this._itemListWindow.isIndexChanged()) {
			this._itemInfoWindow.setInfoItem(this._itemListWindow.getCurrentItem());
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawWindowManager: function() {
		var x = this.getPositionWindowX();
		var y = this.getPositionWindowY();
		var height = this._itemListWindow.getWindowHeight();
		
		this._itemListWindow.drawWindow(x, y);
		this._itemInfoWindow.drawWindow(x, y + height + this._getWindowInterval());
	},
	
	getTargetItem: function() {
		return this._targetItem;
	},
	
	getTotalWindowWidth: function() {
		return this._itemInfoWindow.getWindowWidth();
	},
	
	getTotalWindowHeight: function() {
		return this._itemListWindow.getWindowHeight() + this._getWindowInterval() + this._itemInfoWindow.getWindowHeight();
	},
	
	getPositionWindowX: function() {
		if (Miscellaneous.isPrepareScene()) {
			return LayoutControl.getCenterX(-1, this.getTotalWindowWidth());
		}
		
		return LayoutControl.getUnitBaseX(this._targetUnit, this.getTotalWindowWidth());
	},
	
	getPositionWindowY: function() {
		return LayoutControl.getCenterY(-1, 340);
	},
	
	_getWindowInterval: function() {
		return 10;
	},
	
	_playOperationBlockSound: function() {
		MediaControl.soundDirect('operationblock');
	}
}
);