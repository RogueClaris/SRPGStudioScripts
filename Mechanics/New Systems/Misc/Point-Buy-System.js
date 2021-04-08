/*
Welcome to the Point Buy System! This script enables
levelup management! When in Base or at the Battle Prep screen,
you can go to Manage > Customize to spend stat points. These
points are granted upon levelup, which can be used to augment
your natural levelups with further point gains. The lower your
growth is, the more expensive it is to raise the stat. To get
started, assign custom parameters to units & classes like so:

{StatPointGain:100}

Units will gain the combined amount from their own and from
their class' custom parameters, so check it carefully!

From there, you can setup an optional global parameter to
re-enable RNG levelups. Navigate to the Database, then to
the Config tab. Click on Script, and then the Global Parameters
tab in the window that pops up, and enter this:

{EnableLevels:true}

And you'll have your Fire Emblem-style, RNG level ups back,
right alongside points you can spend to increase janked stats!

Enjoy this script!
-Lady Rena, April 18th, 2020.

*/

var RSPBS0 = MarshalCommandWindow._configureMarshalItem;
MarshalCommandWindow._configureMarshalItem = function(groupArray){
	RSPBS0.call(this, groupArray)
	groupArray.appendObject(MarshalCommand.SpendPoints)
}

var RSGA0 = ExperienceControl._createGrowthArray;
ExperienceControl._createGrowthArray = function(unit){
	var GA = RSGA0.call(this, unit)
	if (root.getMetaSession().global.EnableLevels){
		return GA
	}
	return []
};

LevelupView._moveAnime = function() {
	if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
		if (root.getMetaSession().global.EnableLevels){
			this.changeCycleMode(LevelupViewMode.GROWTH);
		}
		else{
			var Dynamo = createObject(DynamicEvent);
			var Gen = Dynamo.acquireEventGenerator();
			Gen.wait(47)
			Gen.execute()
			return MoveResult.END;
		}
	}
	
	return MoveResult.CONTINUE;
};

ExperienceControl.plusGrowth = function(unit, growthArray) {
	var i;
	var count = growthArray.length;
	
	if (root.getMetaSession().global.EnableLevels){
		for (i = 0; i < count; i++) {
			ParameterControl.changeParameter(unit, i, growthArray[i]);
		}
	}
	var Points = unit.custom.StatPoints
	var ClassGain = typeof unit.getClass().custom.StatPointGain == 'number' ? unit.getClass().custom.StatPointGain : 50
	var UnitBonus = typeof unit.custom.StatPointGain == 'number' ? unit.custom.StatPointGain : 0
	if (typeof Points != 'number'){
		unit.custom.StatPoints = 0
	}
	unit.custom.StatPoints += ClassGain
	unit.custom.StatPoints += UnitBonus
};

MarshalCommand.SpendPoints = defineObject(MarshalBaseCommand,
{
	_pbScreen: null,
	
	checkCommand: function() {
		var screenParam = this._createScreenParam();
		
		if (screenParam.unit === null) {
			return false;
		}
		
		this._pbScreen = createObject(PointBuyScreen);
		SceneManager.addScreen(this._pbScreen, screenParam);
		
		return true;
	},
	
	getInfoWindowType: function() {
		return MarshalInfoWindowType.UNIT;
	},
	
	getCommandName: function() {
		return 'Customize';
	},
	
	isMarshalScreenCloesed: function() {
		return SceneManager.isScreenClosed(this._pbScreen);
	},
	
	getMarshalDescription: function() {
		return 'Spend points to increase unit stats.';
	},
	
	_createScreenParam: function() {
		var screenParam = ScreenBuilder.buildUnitMenu();
		
		screenParam.unit = this._unitSelectWindow.getFirstUnit();
		screenParam.enummode = UnitMenuEnum.ALIVE;
		
		return screenParam;
	}
}
);

var PointBuyMode = {
	TOP: 0,
	INPUT: 1,
	CONFIRM: 2
};

var PointBuyScreen = defineObject(BaseScreen,
{
	_unit: null,
	_paramWindow: null,
	_chosenParamIndex: null,
	_inputWindow: null,
	
	setScreenData: function(screenParam) {
		this._prepareScreenMemberData(screenParam);
		this._completeScreenMemberData(screenParam);
	},
	
	moveScreenCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode == PointBuyMode.TOP){
			result = this._moveTop();
		}
		else if (mode == PointBuyMode.INPUT){
			result = this._moveInput();
		}
		else if (mode == PointBuyMode.CONFIRM){
			result = this._moveConfirm();
		}
		
		return result;
	},
	
	drawScreenCycle: function() {
		var x = LayoutControl.getCenterX(-1, 400);
		var y = LayoutControl.getRelativeY(8);
		this._paramWindow.drawWindow(x, y)
		this._viewWindow.drawWindow(x + this._paramWindow.getWindowWidth(), y)
		if (this.getCycleMode() == PointBuyMode.INPUT){
			this._inputWindow.drawWindow(x + this._paramWindow.getWindowWidth(), y + this._viewWindow.getWindowHeight())
		}
	},
	
	_moveTop: function(){
		this._paramWindow._enableCursor(true)
		this._paramWindow.moveCursor()
		if (InputControl.isSelectAction() && !this._inputWindow.checkMax(this._paramWindow._scrollbar.getIndex()) && !this._inputWindow.checkCost(this._paramWindow._scrollbar.getIndex())){
			this._paramWindow._enableCursor(false);
			
			this._chosenParamIndex = this._paramWindow._scrollbar.getIndex()
			this._inputWindow.setParam(this._chosenParamIndex)
			this._inputWindow._paramObject = this._paramWindow._scrollbar.getObject()
			this.changeCycleMode(PointBuyMode.INPUT)
		}
		else if (InputControl.isCancelAction()){
			return MoveResult.END
		}
		return MoveResult.CONTINUE
	},
	
	_moveInput: function(){
		this._inputWindow._moveInput()
		if (InputControl.isSelectAction()){
			this._inputWindow._processChange()
			this.changeCycleMode(PointBuyMode.TOP)
		}
		else if (InputControl.isCancelAction()){
			this.changeCycleMode(PointBuyMode.TOP)
		}
		return MoveResult.CONTINUE;
	},
	
	_prepareScreenMemberData: function(screenParam) {
		this._unit = screenParam.unit
		this._paramWindow = createObject(ParameterWindow)
		this._inputWindow = createObject(PointBuyWindow)
		this._viewWindow = createObject(PointViewWindow)
		this._viewWindow._setUnit(this._unit)
		this._paramWindow._setUnit(this._unit)
		this._inputWindow._setUnit(this._unit)
	},
	
	_completeScreenMemberData: function(screenParam) {
	}
}
)

var ParameterWindow = defineObject(BaseWindow,
{
	_unit: null,
	_scrollbar: null,
	
	initialize: function(){
		this._scrollbar = createObject(ParameterScrollbar)
	},
	
	moveCursor: function(){
		this._scrollbar.moveScrollbarCursor()
	},
	
	_setUnit: function(unit){
		this._unit = unit;
		this._scrollbar._unit = unit
	},
	
	_enableCursor: function(isOn){
		this._scrollbar.setActive(isOn)
		this._scrollbar.enableSelectCursor(isOn)
	},
	
	moveWindow: function() {
		return this.moveWindowContent();
	},
	
	moveWindowContent: function() {
		var input = this._scrollbar.moveInput()
		var result = MoveResult.CONTINUE;
		if (input == ScrollbarInput.SELECT){
			result = PointBuyMode.INPUT
		}
		else if (input == ScrollbarInput.CANCEL){
			result = MoveResult.END;
		}
		return result;
	},
	
	drawWindow: function(x, y) {
		var width = this.getWindowWidth();
		var height = this.getWindowHeight();
		
		if (!this._isWindowEnabled) {
			return;
		}
		
		this._drawWindowInternal(x, y, width, height);
		
		if (this._drawParentData !== null) {
			this._drawParentData(x, y);
		}
		
		this.xRendering = x + this.getWindowXPadding();
		this.yRendering = y + this.getWindowYPadding();
		
		this.drawWindowContent(x + this.getWindowXPadding(), y + this.getWindowYPadding());
		
		this.drawWindowTitle(x, y, width, height);
	},
	
	drawWindowContent: function(x, y) {
		this._scrollbar.drawScrollbar(x,y)
	},
	
	getWindowWidth: function() {
		return DefineControl.getUnitMenuWindowWidth() - 150;
	},
	
	getWindowHeight: function() {	
		return (10 * 25) + 10;
	},
	
	_getCost: function(unit, i){
		var Growth = ParamGroup.getUnitTotalGrowthBonus(unit, i, ItemControl.getEquippedWeapon(unit)) + ParamGroup.getGrowthBonus(unit, i);
		var Cost = Math.floor((100-Growth)/10);
		if (Cost <= 0){
			return -1;
		}
		return Cost;
	}
}
);

var ParameterScrollbar = defineObject(ItemListScrollbar,
{
	_unit: null,
	_objectArray: null,
	
	initialize: function(){
		this.setScrollFormation(1, 8)
		var array = []
		array.appendObject(UnitParameter.MHP);
		array.appendObject(UnitParameter.POW);
		array.appendObject(UnitParameter.MAG);
		array.appendObject(UnitParameter.SKI);
		array.appendObject(UnitParameter.SPD);
		array.appendObject(UnitParameter.LUK);
		array.appendObject(UnitParameter.DEF);
		array.appendObject(UnitParameter.MDF);
		this.setObjectArray(array);
	},
	
	_getCost: function(unit, i){
		var Growth = ParamGroup.getUnitTotalGrowthBonus(unit, i, ItemControl.getEquippedWeapon(unit)) + ParamGroup.getGrowthBonus(unit, i);
		var Cost = Math.floor((100-Growth)/10);
		if (Cost <= 0){
			return -1;
		}
		return Cost;
	},
	
	drawScrollContent: function(x, y, object, isSelect, index) {
		var type = object.getParameterType()
		var unit = this._unit
		var font = root.getBaseData().getFontList().getData(0)
		var amount = ParamGroup.getLastValue(unit, type, ItemControl.getEquippedWeapon(unit))
		var max = ParamGroup.getMaxValue(unit, type)
		var cost = this._getCost(unit, type)
		var isMax = amount >= max
		TextRenderer.drawText(x, y, object.getParameterName()+":", -1, ColorValue.KEYWORD, font)
		if (!isMax && cost != -1){
			NumberRenderer.drawNumber(x+40, y-6, amount)
			TextRenderer.drawText(x+49, y+2, ",", -1, 0xffffff, font)
			TextRenderer.drawText(x+60, y, "Increase Cost:", -1, ColorValue.KEYWORD, font)
			NumberRenderer.drawNumber(x+175, y-6, cost)
		}
		else{
			NumberRenderer.drawNumberColor(x+40, y-6, amount, 1, 255)
			TextRenderer.drawText(x+49, y+2, ",", -1, 0xffffff, font)
			TextRenderer.drawText(x+60, y, "Increase Cost:", -1, ColorValue.KEYWORD, font)
			TextRenderer.drawText(x+165, y-12, "N/A", -1, ColorValue.DISABLE, font)
		}
	},
	
	drawDescriptionLine: function(x, y) {
		var count;
		var textui = this.getDescriptionTextUI();
		var pic = textui.getUIImage();
		var width = TitleRenderer.getTitlePartsWidth();
		var height = TitleRenderer.getTitlePartsHeight();
		
		if (pic !== null) {
			count = Math.floor(this.getScrollbarWidth() / width) - 1;
			TitleRenderer.drawTitle(pic, x - 14, y + this._objectHeight - 55, width, height, count);
		}
	},
	
	drawCursor: function(x, y, isActive) {
		var pic = this.getCursorPicture();
		
		y = y - (32 - this._objectHeight) / 2;
		
		this._commandCursor.drawCursor(x-5, y-7, isActive, pic);
	}
}
);

var PointBuyWindow = defineObject(BonusInputWindow,
{
	_unit: null,
	_max: 0,
	_exp: 0,
	_jump: 0,
	_isMaxLv: false,
	_param: 0,
	_paramObject: null,
	
	initialize: function() {
	},
	
	checkMax: function(i){
		if (ParamGroup.getLastValue(this._unit, i, ItemControl.getEquippedWeapon(this._unit)) >= ParamGroup.getMaxValue(this._unit, i)){
			return true;
		}
		return false;
	},
	
	checkCost: function(i){
		var Points = this._unit != null ? this._unit.custom.StatPoints : 0
		if (typeof Points != 'number'){
			Points = 0
			this._unit.custom.StatPoints = 0
		}
		if (this._getCost(this._unit, i) > Points && this._getCost(this._unit, i) != -1){
			return true;
		}
		return false;
	},
	
	_moveInput: function() {
		var max1 = Math.floor((this._unit.custom.StatPoints / this._getCost(this._unit, this._param)) * this._getCost(this._unit, this._param))
		var max2 = Math.floor((ParamGroup.getMaxValue(this._unit, this._param) - ParamGroup.getLastValue(this._unit, this._param, ItemControl.getEquippedWeapon(this._unit))) * this._getCost(this._unit,this._param))
		root.log("max1: "+max1)
		root.log("max2: "+max2)
		this._max = Math.min(max1, max2);
		if (InputControl.isSelectAction()) {
			this._cost = this._exp
			return MoveResult.SELECT;
		}
		
		if (InputControl.isCancelAction()) {
			this._cancelExp();
			return MoveResult.CANCEL;
		}
		
		if (InputControl.isInputAction(InputType.UP)){
            this._exp += this._getCost(this._unit, this._param);
			if (this._exp > this._max) {
				this._exp = 0;
			}
		}
		else if (InputControl.isInputAction(InputType.DOWN)){
			this._exp -= this._getCost(this._unit, this._param);
			if (this._exp < 0){
				this._exp = 0;
			}
		}
		
		return MoveResult.CONTINUE;
	},
	
	_drawInput: function(x, y) {
		NumberRenderer.drawAttackNumberCenter(x + 50, y, this._exp);
	},
	
	_isExperienceValueAvailable: function() {
		var Points = this._unit != null ? this._unit.custom.StatPoints : 0
		var cost = this._getCost(this._unit, this._param)
		if (cost == -1){
			return false;
		}
		if (typeof Points != 'number'){
			Points = 0
		}
		if (Points < 10) {
			return false;
		}
		if (Points < this._getCost(this._unit, this._param)){
			return false;
		}
		
		return true;
	},
	
	_setUnit: function(unit) {
		this._unit = unit;
		if (this._isExperienceValueAvailable()) {
			this._exp = 0
			this._max = unit.custom.StatPoints
			this.changeCycleMode(BonusInputWindowMode.INPUT);
		}
		else {
			this._exp = 0;
			this.changeCycleMode(BonusInputWindowMode.NONE);
		}
	},
	
	_cancelExp: function() {
		this._exp = 0;
		this._playCancelSound();
	},
	
	setParam: function(num){
		this._param = num
	},
	
	_processChange: function(){
		this._paramObject.setUnitValue(this._unit, this._paramObject.getUnitValue(this._unit)+Math.floor(this._cost/this._getCost(this._unit, this._param)))
		this._unit.custom.StatPoints -= this._cost
		this._cancelExp()
	},
	
	_getCost: function(unit, i){
		var Growth = ParamGroup.getUnitTotalGrowthBonus(unit, i, ItemControl.getEquippedWeapon(unit)) + ParamGroup.getGrowthBonus(unit, i);
		var Cost = Math.floor((100-Growth)/10);
		if (Cost <= 0){
			return -1;
		}
		return Cost;
	}
}
);

var PointViewWindow = defineObject(BaseWindow,
{
	_unit: null,
	
	initialize: function(){
	},
	
	_setUnit: function(unit){
		this._unit = unit
	},
	
	drawWindowContent: function(x, y) {
		var Points = typeof this._unit.custom.StatPoints == 'number' ? this._unit.custom.StatPoints : 0
		var Font = root.getBaseData().getFontList().getData(0)
		var Color = ColorValue.KEYWORD
		TextRenderer.drawText(x, y, "Points:", -1, Color, Font)
		NumberRenderer.drawNumber(x+75, y-6, Points)
	},
	
	getWindowWidth: function(){
		return 250
	},
	
	getWindowHeight: function(){
		return 40
	}
}
);