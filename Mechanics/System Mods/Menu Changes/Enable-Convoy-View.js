var StockItemTradeMode = {
	OPERATION: 0,
	STORE: 1,
	EXTRACT: 2,
	STOREWARNING: 3,
	EXTRACTWARNING: 4,
	MENU: 5,
	VIEW: 6
};

StockItemTradeScreen._moveOperation = function() {
	var index;
	var input = this._itemOperationWindow.moveWindow();
	var result = MoveResult.CONTINUE;
	
	if (input === ScrollbarInput.SELECT) {
		index = this._itemOperationWindow.getOperationIndex();
		if (index === 0 && this.isExtractAllowed()) {
			this._processMode(StockItemTradeMode.EXTRACT);
		}
		else if (index === 1 && this.isStoreAllowed()) {
			this._processMode(StockItemTradeMode.STORE);
		}
		else if (index === 2 && this.isStoreAllowed()) {
			this._storeAllItem();
		}
		else if (index === 3 && StockItemControl.getStockItemCount() > 0){
			this._processMode(StockItemTradeMode.VIEW);
		}
	}
	else if (input === ScrollbarInput.CANCEL) {
		if (this._isAction) {
			// Process after the item update ended.
			this._resultCode = StockItemTradeResult.TRADEEND;
		}
		else {
			this._resultCode = StockItemTradeResult.TRADENO;
		}
		
		// Process after the item update ended.
		ItemControl.updatePossessionItem(this._unit);
		
		result = MoveResult.END;
	}
	else if (input === ScrollbarInput.OPTION) {
		this._openMenu();
	}
	else if (this.getCycleMode() === StockItemTradeMode.OPERATION) {
		if (this._unitSimpleWindow === null || this._unitList === null) {
			return result;
		}
		
		index = this._dataChanger.checkDataIndex(this._unitList, this._unit); 
		if (index !== -1) {
			this._unit = this._unitList.getData(index);
			this._unitItemWindow.setUnitItemFormation(this._unit);
			this._unitSimpleWindow.setFaceUnitData(this._unit);
		}
	}
	
	return result;
};

ItemOperationScrollbar._isEnabled = function(index) {
	if (index === 0) {
		return this.getParentInstance().getParentInstance().isExtractAllowed();
	}
	else if (index === 1) {
		return this.getParentInstance().getParentInstance().isStoreAllowed();
	}
	else if (index === 2) {
		return this.getParentInstance().getParentInstance().isStoreAllowed();
	}
	else if (index === 3){
		return StockItemControl.getStockItemCount() > 0;
	}
	else {
		return true;
	}
};

StockItemTradeScreen._processMode = function(mode) {
	if (mode === StockItemTradeMode.OPERATION) {
		this._itemOperationWindow.setItemOperationData();
		this._itemOperationWindow.enableSelectCursor(true);
		
		this._unitItemWindow.setActive(false);
		this._unitItemWindow.setForceSelect(-1);
		this._stockItemWindow.setActive(false);
		this._stockItemWindow.setForceSelect(-1);
	}
	else if (mode === StockItemTradeMode.STORE) {
		this._unitItemWindow.enableSelectCursor(true);
		this._itemOperationWindow.enableSelectCursor(false);
		this._itemInfoWindow.setInfoItem(this._unitItemWindow.getCurrentItem());
	}
	else if (mode === StockItemTradeMode.EXTRACT) {
		this._stockItemWindow.enableSelectCursor(true);
		this._itemOperationWindow.enableSelectCursor(false);
		this._itemInfoWindow.setInfoItem(this._stockItemWindow.getCurrentItem());
	}
	else if (mode === StockItemTradeMode.STOREWARNING) {
		this._infoWindow.setInfoMessage(StringTable.ItemChange_StockItemFull);
	}
	else if (mode === StockItemTradeMode.EXTRACTWARNING) {
		this._infoWindow.setInfoMessage(StringTable.ItemChange_StockItemFull);
	}
	else if (mode === StockItemTradeMode.VIEW){
		this._stockItemWindow.enableSelectCursor(true);
		this._itemOperationWindow.enableSelectCursor(false);
		this._itemInfoWindow.setInfoItem(this._stockItemWindow.getCurrentItem());
	}
	
	this.changeCycleMode(mode);
};

StockItemTradeScreen.moveScreenCycle = function() {
	var mode = this.getCycleMode();
	var result = MoveResult.CONTINUE;
	
	if (mode === StockItemTradeMode.OPERATION) {
		result = this._moveOperation();
	}
	else if (mode === StockItemTradeMode.STORE) {
		result = this._moveStore();
	}
	else if (mode === StockItemTradeMode.EXTRACT) {
		result = this._moveExtract();
	}
	else if (mode === StockItemTradeMode.STOREWARNING) {
		result = this._moveStoreWarning();
	}
	else if (mode === StockItemTradeMode.EXTRACTWARNING) {
		result = this._moveExtractWarning();
	}
	else if (mode === StockItemTradeMode.MENU) {
		result = this._moveMenu();
	}
	else if (mode === StockItemTradeMode.VIEW){
		result = this._moveView();
	}
	
	return result;
};

StockItemTradeScreen._moveView = function() {
	var item;
	var input = this._stockItemWindow.moveWindow();
	StockCategory.setStockCategory(this._stockItemWindow);
	if (InputControl.isInputAction(InputType.LEFT) || InputControl.isInputAction(InputType.RIGHT)) {
		StockCategory.checkStockCategory()
		if (this._stockItemWindow.getCurrentItem() !== null){
			item = this._stockItemWindow.getCurrentItem();
			this._itemInfoWindow.setInfoItem(item);
		}
		else{
			this._itemInfoWindow.setInfoItem(null);
		}
	}
	else if (input === ScrollbarInput.CANCEL) {
		this._itemInfoWindow.setInfoItem(null);
		this._processMode(StockItemTradeMode.OPERATION);
	}
	else if (input === ScrollbarInput.NONE) {
		if (this._stockItemWindow.isIndexChanged()) {
			item = this._stockItemWindow.getCurrentItem();
			this._itemInfoWindow.setInfoItem(item);
		}
	}
	return MoveResult.CONTINUE;
};

ItemOperationWindow.setItemOperationData = function() {
	var arr = ["Take", StringTable.StockItem_Store, StringTable.StockItem_AllStore, "View"];
	
	this._scrollbar = createScrollbarObject(ItemOperationScrollbar, this);
	this._scrollbar.setScrollFormation(arr.length, 1);
	this._scrollbar.setObjectArray(arr);
};

ItemOperationScrollbar.getObjectWidth = function() {
	return Math.floor(ItemRenderer.getItemWidth() / 4);
};

