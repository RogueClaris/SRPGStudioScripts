var TradeGoldCL0 = UnitCommand.configureCommands;
UnitCommand.configureCommands = function(groupArray){
	TradeGoldCL0.call(this, groupArray);
	groupArray.insertObject(UnitCommand.GoldTrade, groupArray.indexOf(UnitCommand.Trade))
};

var GoldPayCommandMode = {
	SELECT: 0,
	WALLET: 1,
	PAY: 2
};

UnitCommand.GoldTrade = defineObject(UnitCommand.Trade,
{
	_posSelector: null,
	_targetUnit: null,
	_gold: null,
	_unitGoldTradeScreen: null,
	_goldChangeView: null,
	_target: null,
	
	_prepareCommandMemberData: function() {
		this._listCommandManager._commandScrollbar.setActive(false)
		this._posSelector = createObject(PosSelector);
		this._unitGoldTradeScreen = createObject(UnitGoldTradeScreen);
	},
	
	_completeCommandMemberData: function() {
		var unit = this.getCommandTarget();
		var filter = this._getUnitFilter();
		var indexArray = this._getTradeArray(unit)
		
		this._posSelector.setUnitOnly(unit, ItemControl.getEquippedWeapon(unit), indexArray, PosMenuType.Default, filter);
		this._posSelector.setFirstPos();
		this._posSelector.includeFusion();
		
		this.changeCycleMode(GoldPayCommandMode.SELECT);
	},
	
	_getTradeArray: function(unit) {
		var i, x, y, targetUnit;
		var indexArray = [];
		
		if (this._isFusionTradable(unit)) {
			indexArray.push(CurrentMap.getIndex(unit.getMapX(), unit.getMapY()));
		}
		
		for (i = 0; i < DirectionType.COUNT; i++) {
			x = unit.getMapX() + XPoint[i];
			y = unit.getMapY() + YPoint[i];
			targetUnit = PosChecker.getUnitFromPos(x, y);
			if (targetUnit !== null && this._isTradable(targetUnit)) {
				indexArray.push(CurrentMap.getIndex(x, y));
			}
		}
		
		return indexArray;
	},
	
	_isTradable: function(unit){
		if (typeof unit.custom.UserGoldCL !== 'number'){
			unit.custom.UserGoldCL = 0
		}
		return true;
	},
	
	getCommandName: function(){
		return "Pay"
	},
	
	moveCommand: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === GoldPayCommandMode.SELECT) {
			result = this._moveSelect();
		}
		else if (mode === GoldPayCommandMode.WALLET) {
			result = this._moveWallet();
		}
		else if (mode === GoldPayCommandMode.PAY) {
			result = this._movePay();
		}
		
		return result;
	},
	
	drawCommand: function() {
		var mode = this.getCycleMode();
		
		if (mode === GoldPayCommandMode.SELECT) {
			this._drawSelect();
		}
		else if (mode === GoldPayCommandMode.WALLET) {
			this._drawWallet();
		}
		else if (mode === GoldPayCommandMode.PAY) {
			this._drawPay();
		}
	},
	
	_moveSelect: function() {
		var screenParam;
		var result = this._posSelector.movePosSelector();
		
		if (result === PosSelectorResult.SELECT) {
			if (this._isPosSelectable()) {
				this._posSelector.endPosSelector();
				
				screenParam = this._createScreenParam();
				SceneManager.addScreen(this._unitGoldTradeScreen, screenParam);
				
				this.changeCycleMode(GoldPayCommandMode.WALLET);
			}
		}
		else if (result === PosSelectorResult.CANCEL) {
			this._posSelector.endPosSelector();
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveTrade: function() {
	},
	
	_drawSelect: function() {
		this._posSelector.drawPosSelector();
	},
	
	_drawWallet: function(){
	},
	
	_moveWallet: function(){
		if (this.getCommandTarget().custom.isTradeGoldCL){
			this.endCommandAction()
			return MoveResult.END;
		}
		return MoveResult.CONTINUE;
	}
}
);

var GoldPayInputWindowMode = {
	NONE: 0,
	INPUT: 1
};

var GoldPayInputWindow = defineObject(BonusInputWindow,
{
	setUnit: function(unit, target) {
		this._exp = typeof unit.custom.UserGoldCL === 'number' ? unit.custom.UserGoldCL : 0;
		this._unit = unit;
		this._target = target;
		this._max = typeof unit.custom.UserGoldCL === 'number' ? unit.custom.UserGoldCL : 0;
		
		this.changeCycleMode(GoldPayInputWindowMode.INPUT);
	},
	
	moveWindowContent: function() {
		var result = MoveResult.END;
		
		if (this.getCycleMode() === GoldPayInputWindowMode.INPUT) {
			result = this._moveInput();
		}
		else {
			result = this._moveNone();
		}
		
		return result;
	},
	
	_isExperienceValueAvailable: function() {
		if (this._exp <= this._max){
			return true;
		}
		return false;
	},
	
	_moveInput: function() {
		var inputType;
		
		if (InputControl.isSelectAction()) {
			this._changeBonus();
			return MoveResult.CONTINUE;
		}
		
		if (InputControl.isCancelAction()) {
			// this._cancelExp();
			this._unit.custom.isTradeGoldCL = true
			return MoveResult.END;
		}
		
		inputType = this._commandCursor.moveCursor();
		if (inputType === InputType.UP || MouseControl.isInputAction(MouseType.UPWHEEL)) {
			if (++this._exp > this._max) {
				this._exp = 0;
			}
		}
		else if (inputType === InputType.DOWN || MouseControl.isInputAction(MouseType.DOWNWHEEL)) {
			if (--this._exp < 0) {
				this._exp = this._max;
			}
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawWindowContent: function(x, y) {
		if (this.getCycleMode() === GoldPayInputWindowMode.INPUT) {
			this._drawInput(x, y);
		}
		else if (this.getCycleMode() === GoldPayInputWindowMode.NONE){
			this._drawNone(x, y);
		}
	},
	
	getWindowWidth: function() {
		return this.getCycleMode() === GoldPayInputWindowMode.INPUT ? 140 : 260;
	},
	
	_getRate: function() {
		return 1;
	},
	
	_getMessage: function() {
		return "You haven't got the gold!"
	},
	
	_changeBonus: function() {
		if (typeof this._unit.custom.UserGoldCL === 'number'){
			this._unit.custom.UserGoldCL -= this._exp;
			if (typeof this._target.custom.UserGoldCL === 'number'){
				this._target.custom.UserGoldCL += this._exp
			}
			else{
				this._target.custom.UserGoldCL = this._exp
			}
			this.getParentInstance()._goldChangeView = createWindowObject(GoldChangeNoticeView, this.getParentInstance())
			this.getParentInstance()._goldChangeView.setGoldChangeData(this._exp)
		}
		else{
			this._unit.custom.UserGoldCL = 0;
		}
	},
	
	_drawNone: function(x, y) {
		var range;
		var text = this._getMessage();
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var width = this.getWindowWidth() - (this.getWindowXPadding() * 2);
		var height = this.getWindowHeight() - (this.getWindowYPadding() * 2);
		
		range = createRangeObject(x, y, width, height);
		TextRenderer.drawRangeText(range, TextFormat.CENTER, text, -1, color, font);
	}
}
);

var UnitGoldTradeScreen = defineObject(UnitItemTradeScreen,
{
	_unitSrc: null,
	_unitDest: null,
	_goldInputWindow: null,
	_unitWindowSrc: null,
	_unitWindowDest: null,
	_resultCode: 0,
	_goldChangeView: null,
	
	_prepareScreenMemberData: function(screenParam) {
		this._unitSrc = screenParam.unit;
		this._unitDest = screenParam.targetUnit;
		this._isSrcScrollbarActive = false
		this._isSelect = false;
		this._selectIndex = 0;
		this._isSrcSelect = true;
		this._maxItemCount = DataConfig.getMaxUnitItemCount();
		this._resultCode = UnitItemTradeResult.TRADENO;
		this._itemListSrc = createWindowObject(ItemListWindow, this);
		this._itemListDest = createWindowObject(ItemListWindow, this);
		this._unitWindowSrc = createWindowObject(UnitSimpleWindow, this);
		this._unitWindowDest = createWindowObject(UnitSimpleWindow, this);
		this._goldInputWindow = createWindowObject(GoldPayInputWindow, this)
		this._goldInputWindow.setUnit(this._unitSrc, this._unitDest)
	},
	
	_completeScreenMemberData: function(screenParam) {
		var count = LayoutControl.getObjectVisibleCount(ItemRenderer.getItemHeight(), 15) - 3;
		
		if (count > DataConfig.getMaxUnitItemCount()) {
			count = DataConfig.getMaxUnitItemCount();
		}
		
		this._itemListSrc.setItemFormation(count);
		
		this._itemListDest.setItemFormation(count);
		
		this._updateListWindow();
	},
	
	setScreenData: function(screenParam) {
		this._prepareScreenMemberData(screenParam);
		this._completeScreenMemberData(screenParam);
	},
	
	moveScreenCycle: function() {
		if (this._goldInputWindow !== null){
			return this._goldInputWindow.moveWindow()
		}
		else{
			if (this._goldChangeView.moveNoticeView() !== MoveResult.CONTINUE){
				this._unitSrc.custom.isTradeGoldCL = true;
				return MoveResult.END;
			}
			return MoveResult.CONTINUE;
		}
	},
	
	drawScreenCycle: function() {
		var xSpace = this._getItemIntervalX();
		var yLine = this._unitWindowSrc.getWindowHeight();
		var width = (this._itemListSrc.getWindowWidth() * 2) + xSpace;
		var x = LayoutControl.getCenterX(-1, width);
		var y = this._getStartY();
		
		this._unitWindowSrc.drawWindow(x, y);
		
		x += this._itemListSrc.getWindowWidth() + xSpace;
		this._unitWindowDest.drawWindow(x, y);
		
		if (this._goldInputWindow !== null){
			this._goldInputWindow.drawWindow(Math.floor(x*0.5), Math.floor(y*2))
		}
		
		if (this._goldChangeView !== null){
			this._goldInputWindow = null
			var x2 = LayoutControl.getCenterX(-1, this._goldChangeView.getNoticeViewWidth());
			var y2 = LayoutControl.getCenterY(-1, this._goldChangeView.getNoticeViewHeight());
			
			this._goldChangeView.drawNoticeView(x2, y2);
		}
	}
}
);