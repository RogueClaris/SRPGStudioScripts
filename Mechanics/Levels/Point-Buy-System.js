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
right alongside points you can spend to fix bad level ups!

As of January 31st, 2024, you can now also enable purchasable Skills!

First, a Unit must be marked with the Custom Parameters as shown:

{
	CanBuySkillsCL:true,
	AvailableSkills:[0,12,17,21],
}

The former is a boolean that allows them to access skill purchases.
The latter is a REQUIRED list of Skill IDs that they can purchase.

Skills default to costing 5 Stat Points, however you can set the skill's
point cost in Custom Parameters like so:

{
	PointCostCL:7,
	CanAllBuy:true
}

PointCostCL will be how many Stat Points are required to purchase a Skill.

CanAllBuy is an optional boolean that will enable a skill to be bought by every unit,
regardless of if it's in their personal AvailableSkills list in Custom Parameters; but
the unit still needs a list of skills for it to be added to.

Enjoy this script!
-Dawn Elaine, April 18th, 2020.

=Update Log!
 + Plays a sound when you increase or decrease stats before purchasing
 + Now displays the stat increases you're purchasing
 + Now displays the name and character chip of the unit you're working on
 + Better window alignment
 + Better text alignment
 + Got rid of unnecessary comma
-Dawn Elaine, October 29th, 2022

*/

var CostGetter = {
	_getCost: function (unit, i) {
		var Growth = ParamGroup.getUnitTotalGrowthBonus(unit, i, ItemControl.getEquippedWeapon(unit)) + ParamGroup.getGrowthBonus(unit, i);
		while (Growth > 100) {
			Growth -= 100;
		}
		var Cost = Math.round((100 - Growth) / 10);
		if (Cost <= 0) {
			return 1;
		}
		return Cost;
	}
}

var RSPBS0 = MarshalCommandWindow._configureMarshalItem;
MarshalCommandWindow._configureMarshalItem = function (groupArray) {
	RSPBS0.call(this, groupArray)
	groupArray.appendObject(MarshalCommand.SpendPoints)
}

var RSGA0 = ExperienceControl._createGrowthArray;
ExperienceControl._createGrowthArray = function (unit) {
	var GA = RSGA0.call(this, unit)
	if (root.getMetaSession().global.EnableLevels) {
		return GA;
	}
	return [];
};

LevelupView._moveAnime = function () {
	if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
		if (root.getMetaSession().global.EnableLevels) {
			this.changeCycleMode(LevelupViewMode.GROWTH);
		}
		else {
			return MoveResult.END;
		}
	}

	return MoveResult.CONTINUE;
};

ExperienceControl.plusGrowth = function (unit, growthArray) {
	var i;
	var count = growthArray.length;

	if (root.getMetaSession().global.EnableLevels) {
		for (i = 0; i < count; i++) {
			ParameterControl.changeParameter(unit, i, growthArray[i]);
		}
	}
	var Points = unit.custom.StatPoints
	var ClassGain = typeof unit.getClass().custom.StatPointGain === 'number' ? unit.getClass().custom.StatPointGain : 0
	var UnitBonus = typeof unit.custom.StatPointGain === 'number' ? unit.custom.StatPointGain : 0
	if (typeof Points !== 'number') {
		unit.custom.StatPoints = 0
	}
	unit.custom.StatPoints += ClassGain
	unit.custom.StatPoints += UnitBonus
};

MarshalCommand.SpendPoints = defineObject(MarshalBaseCommand,
	{
		_pbScreen: null,

		checkCommand: function () {
			var screenParam = this._createScreenParam();

			if (screenParam.unit === null) {
				return false;
			}

			this._pbScreen = createObject(PointBuyScreen);
			SceneManager.addScreen(this._pbScreen, screenParam);

			return true;
		},

		getInfoWindowType: function () {
			return MarshalInfoWindowType.UNIT;
		},

		getCommandName: function () {
			return 'Learn';
		},

		isMarshalScreenCloesed: function () {
			return SceneManager.isScreenClosed(this._pbScreen);
		},

		getMarshalDescription: function () {
			return 'Spend points to increase unit stats.';
		},

		_createScreenParam: function () {
			var screenParam = ScreenBuilder.buildUnitMenu();

			screenParam.unit = this._unitSelectWindow.getFirstUnit();
			screenParam.enummode = UnitMenuEnum.ALIVE;

			return screenParam;
		}
	}
);

var PointBuyMode = {
	PARAMETER: 0,
	SKILL: 1,
	INPUT: 2,
	CONFIRM: 3
};

var PointBuyScreen = defineObject(BaseScreen,
	{
		_unit: null,
		_nameWindow: null,
		_skillWindow: null,
		_paramWindow: null,
		_inputWindow: null,
		_activeWindow: null,
		_activeUnitIndex: -1,
		_questionWindow: null,
		_unitViewWindow: null,
		_chosenParamIndex: null,

		setScreenData: function (screenParam) {
			this._prepareScreenMemberData(screenParam);
			this._completeScreenMemberData(screenParam);
		},

		_prepareScreenMemberData: function (screenParam) {
			this._nameWindow = createObject(UnitNameWindow)
			this._viewWindow = createObject(PointViewWindow)
			this._inputWindow = createObject(PointBuyWindow)
			this._skillWindow = createObject(SkillBuyWindow)
			this._paramWindow = createObject(ParameterWindow)
			this._unitViewWindow = createObject(UnitCharchipWindow)
			this._questionWindow = createWindowObject(QuestionWindow, this);
			this._questionWindow.setQuestionMessage('');

			this.changeUnit(screenParam.unit);
		},

		_completeScreenMemberData: function (screenParam) {
		},

		moveScreenCycle: function () {
			var mode = this.getCycleMode();
			var result = MoveResult.CONTINUE;

			if (InputControl.isRightPadAction()) {
				this._changeTarget(true);
				this.changeCycleMode(PointBuyMode.PARAMETER)
			}
			else if (InputControl.isLeftPadAction()) {
				this._changeTarget(false);
				this.changeCycleMode(PointBuyMode.PARAMETER)
			}


			if (InputControl.isOptionAction() || InputControl.isOptionAction2()) {
				// Option changes between params and skills
				this.changeMode();
			}

			if (mode === PointBuyMode.PARAMETER) {
				result = this._moveParameterBuy();
			}
			else if (mode === PointBuyMode.SKILL) {
				result = this._moveSkillBuy();
			}
			else if (mode === PointBuyMode.INPUT) {
				result = this._moveInput();
			}
			else if (mode === PointBuyMode.CONFIRM) {
				result = this._moveConfirm();
			}

			return result;
		},

		drawScreenCycle: function () {
			var mode = this.getCycleMode();
			var x = LayoutControl.getCenterX(-1, 500);
			var y = LayoutControl.getRelativeY(8);

			this._nameWindow.drawWindow(x + this._paramWindow.getWindowWidth(), y)

			//adjust the -5 to fix some offset with custom graphics
			this._viewWindow.drawWindow(x + this._paramWindow.getWindowWidth(), y + this._nameWindow.getWindowHeight() + UIFormat.TITLE_HEIGHT - 5)

			//adjust the -5 to fix some offset with custom graphics
			this._unitViewWindow.drawWindow(x + this._paramWindow.getWindowWidth(), y + this._viewWindow.getWindowHeight() + this._nameWindow.getWindowHeight() + UIFormat.TITLE_HEIGHT - 5)

			if (mode === PointBuyMode.PARAMETER) {
				this._paramWindow.drawWindow(x, y)
			}
			else if (mode === PointBuyMode.SKILL) {
				this._skillWindow.drawWindow(x, y);
			}
			else if (mode === PointBuyMode.INPUT) {
				this._paramWindow.drawWindow(x, y)
				this._inputWindow.drawWindow(x + this._paramWindow.getWindowWidth(), y + this._viewWindow.getWindowHeight())
			}
			else if (mode === PointBuyMode.CONFIRM) {
				this._skillWindow.drawWindow(x, y);
				this.drawItemQuestionWindow();
			}
		},

		_moveConfirm: function () {
			var skill;

			if (this._questionWindow.moveWindow() !== MoveResult.CONTINUE) {

				// move to confirming with a yes/no question input
				if (this._questionWindow.getQuestionAnswer() === QuestionAnswer.YES) {
					// disable question
					this._questionWindow.setQuestionActive(false);

					// grab the skill from the scrollbar
					skill = this._skillWindow._scrollbar.getObject();

					// subtract cost
					this._unit.custom.StatPoints -= this._skillWindow.getPrice(skill);


					// teach the skill
					SkillChecker.arrangeSkill(this._unit, skill, IncreaseType.INCREASE);

					// disable question
					this._questionWindow.setQuestionActive(false);

					// make skill unavailable to buy now that it's bought for this unit
					this._skillWindow.resetAvailableData(this._unit);

					// change modes
					this.changeCycleMode(PointBuyMode.SKILL);

				}
				else {
					this._skillWindow._enableCursor(true);
					this._questionWindow.setQuestionActive(false);
					this.changeCycleMode(PointBuyMode.SKILL);
				}
			}

			return MoveResult.CONTINUE;
		},

		_changeTarget: function (isNext) {
			var unit;

			var list = root.getBaseScene() === SceneType.REST ? PlayerList.getAliveList() : PlayerList.getSortieList();
			var count = list.getCount();
			var index = this._unit.getId();

			if (this._activeUnitIndex === -1) {
				for (i = 0; i < count; i++) {
					if (list.getData(i) === unit) {
						this._activeUnitIndex = i;
						break;
					}
				}
			}

			for (; ;) {
				if (isNext) {
					index++;
				}
				else {
					index--;
				}

				if (index >= count) {
					index = 0;
				}
				else if (index < 0) {
					index = count - 1;
				}

				unit = list.getData(index);

				if (unit === null) {
					break;
				}

				break;
			}

			this.changeUnit(unit);
		},

		_moveSkillBuy: function () {
			var unit, index;

			this._skillWindow._enableCursor(true)
			this._skillWindow.moveCursor();

			if (InputControl.isSelectAction()) {
				index = this._skillWindow._scrollbar.getIndex()
				// if we can't buy it don't let us try
				if (this._skillWindow._scrollbar._availableArray[index] == false) {
					MediaControl.soundPlay(root.querySoundHandle('operationblock'))
					return MoveResult.CONTINUE;
				}

				this._skillWindow._enableCursor(false);
				this._questionWindow.setQuestionMessage("Learn this Skill?");
				this._questionWindow.setQuestionActive(true);
				this.changeCycleMode(PointBuyMode.CONFIRM);
			}
			else if (InputControl.isCancelAction()) {
				return MoveResult.END
			}
			return MoveResult.CONTINUE
		},

		_moveParameterBuy: function () {
			var unit;
			this._paramWindow._enableCursor(true)
			this._paramWindow.moveCursor();
			if (InputControl.isSelectAction()) {
				if (!this._inputWindow.checkMax(this._paramWindow._scrollbar.getIndex())) {
					MediaControl.soundPlay(root.querySoundHandle('operationblock'))
					return MoveResult.CONTINUE;
				}
				if (!this._inputWindow.checkCost(this._paramWindow._scrollbar.getIndex())) {
					MediaControl.soundPlay(root.querySoundHandle('operationblock'))
					return MoveResult.CONTINUE;
				}
				this._paramWindow._enableCursor(false);

				this._chosenParamIndex = this._paramWindow._scrollbar.getIndex()
				this._inputWindow.setParam(this._chosenParamIndex)
				this._inputWindow._paramObject = this._paramWindow._scrollbar.getObject()
				this.changeCycleMode(PointBuyMode.INPUT)
			}

			else if (InputControl.isCancelAction()) {
				return MoveResult.END
			}
			return MoveResult.CONTINUE
		},

		_moveInput: function () {
			var result = this._inputWindow._moveInput();

			if (result === MoveResult.SELECT) {

				if (this._inputWindow._exp > 0) {
					this._inputWindow._processChange()
				}
				this.changeCycleMode(PointBuyMode.PARAMETER)

			}
			else if (result === MoveResult.CANCEL) {
				this.changeCycleMode(PointBuyMode.PARAMETER)
			}
			return MoveResult.CONTINUE;
		},

		changeUnit: function (unit) {
			if (this._unit != null) {
				MediaControl.soundDirect('menutargetchange');
			}
			this._unit = unit;
			this._viewWindow._setUnit(this._unit);
			this._nameWindow._setUnit(this._unit);
			this._inputWindow._setUnit(this._unit);
			this._paramWindow._setUnit(this._unit);
			this._unitViewWindow._setUnit(this._unit);

			if (this.checkSkillBuy(this._unit)) {
				this._skillWindow._setUnit(this._unit);
			}
		},

		changeMode: function () {
			var mode = this.getCycleMode();
			if (this.checkSkillBuy(this._unit) && mode == PointBuyMode.PARAMETER) {
				this._skillWindow._setUnit(this._unit);
				this.changeCycleMode(PointBuyMode.SKILL);
				this._activeWindow = "SkillWindow"
				MediaControl.soundDirect('menutargetchange');
			}
			else {
				this.changeCycleMode(PointBuyMode.PARAMETER);
				this._activeWindow = "ParamWindow"
				MediaControl.soundDirect('menutargetchange');
			}
		},

		checkSkillBuy: function (unit) {
			if (unit == null) {
				return false;
			}

			return unit.custom.CanBuySkillsCL == true && unit.custom.AvailableSkills != null
		},

		drawItemQuestionWindow: function () {
			var width = this._questionWindow.getWindowWidth();
			var height = this._questionWindow.getWindowHeight();
			var x = LayoutControl.getCenterX(-1, width);
			var y = LayoutControl.getCenterY(-1, height);

			this._questionWindow.drawWindow(x, y);
		}
	}
)

var ParameterWindow = defineObject(BaseWindow,
	{
		_unit: null,
		_scrollbar: null,

		initialize: function () {
			this._scrollbar = createObject(ParameterScrollbar)
		},

		moveCursor: function () {
			this._scrollbar.moveScrollbarCursor()
		},

		_setUnit: function (unit) {
			this._unit = unit;
			this._scrollbar._unit = unit
		},

		_enableCursor: function (isOn) {
			this._scrollbar.setActive(isOn)
			this._scrollbar.enableSelectCursor(isOn)
		},

		moveWindow: function () {
			return this.moveWindowContent();
		},

		moveWindowContent: function () {
			var input = this._scrollbar.moveInput()
			var result = MoveResult.CONTINUE;
			if (input === ScrollbarInput.SELECT) {
				result = PointBuyMode.INPUT
			}
			else if (input === ScrollbarInput.CANCEL) {
				result = MoveResult.END;
			}
			return result;
		},

		drawWindow: function (x, y) {
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

		drawWindowContent: function (x, y) {
			this._scrollbar.drawScrollbar(x, y)
		},

		getWindowWidth: function () {
			return DefineControl.getUnitMenuWindowWidth() - 150;
		},

		getWindowHeight: function () {
			return 260;
		}
	}
);

var ParameterScrollbar = defineObject(ItemListScrollbar,
	{
		_unit: null,
		_objectArray: null,

		initialize: function () {
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

		drawScrollContent: function (x, y, object, isSelect, index) {
			var type = object.getParameterType()

			if (!this._unit.custom.QoLPointBuyArrayCL) {
				this._unit.custom.QoLPointBuyArrayCL = {}
				for (var i = 0; i < ParamGroup.getParameterCount(); i++) {
					this._unit.custom.QoLPointBuyArrayCL[i] = 0;
				}
			}

			var font = root.getBaseData().getFontList().getData(0)
			var amount = ParamGroup.getUnitValue(this._unit, type)
			var max = ParamGroup.getMaxValue(this._unit, type)
			var cost = CostGetter._getCost(this._unit, type)
			var isMax = amount >= max

			TextRenderer.drawText(x, y, object.getParameterName() + ":", -1, ColorValue.KEYWORD, font)

			if (!isMax && cost !== -1) {
				NumberRenderer.drawNumber(x + 40, y - 3, amount + this._unit.custom.QoLPointBuyArrayCL[type])
				TextRenderer.drawText(x + 60, y, "Increase Cost:", -1, ColorValue.KEYWORD, font)
				NumberRenderer.drawNumber(x + 175, y - 3, cost)
			}
			else {
				NumberRenderer.drawNumberColor(x + 40, y - 3, amount + this._unit.custom.QoLPointBuyArrayCL[type], 1, 255)
				TextRenderer.drawText(x + 60, y, "Increase Cost:", -1, ColorValue.KEYWORD, font)
				TextRenderer.drawText(x + 165, y, "N/A", -1, ColorValue.DISABLE, font)
			}
		},

		drawDescriptionLine: function (x, y) {
			var count;
			var textui = this.getDescriptionTextUI();
			var pic = textui.getUIImage();
			var width = TitleRenderer.getTitlePartsWidth();
			var height = TitleRenderer.getTitlePartsHeight();

			if (pic !== null) {
				count = Math.round(this.getScrollbarWidth() / width) - 1;
				TitleRenderer.drawTitle(pic, x - 14, y + this._objectHeight - 54, width, height, count);
			}
		},

		drawCursor: function (x, y, isActive) {
			var pic = this.getCursorPicture();

			y = y - (32 - this._objectHeight) / 2;

			this._commandCursor.drawCursor(x - 5, y - 7, isActive, pic);
		}
	}
);

SkillRenderer.drawBuyableSkill = function (x, y, skill, color, font, cost) {
	this.drawSkill(x, y, skill, color, font);
	NumberRenderer.drawNumber(x + 140, y, cost);
}

var SkillBuyWindow = defineObject(BaseWindow,
	{
		_unit: null,
		_scrollbar: null,

		initialize: function () {
			this._scrollbar = createScrollbarObject(SkillBuyScrollbar, this)
		},

		moveCursor: function () {
			this._scrollbar.moveScrollbarCursor();
		},

		drawCursor: function (x, y, isActive) {
			var pic = this.getCursorPicture();

			y = y - (32 - this._objectHeight) / 2;

			this._commandCursor.drawCursor(x - 5, y - 7, isActive, pic);
		},

		_setUnit: function (unit) {
			this._unit = unit;
			this._scrollbar._setUnit(unit);
		},

		_enableCursor: function (isOn) {
			this._scrollbar.setActive(isOn)
			this._scrollbar.enableSelectCursor(isOn)
		},

		getPrice: function (object) {
			return this._scrollbar._getPrice(object);
		},

		moveWindow: function () {
			return this.moveWindowContent();
		},

		moveWindowContent: function () {
			var input = this._scrollbar.moveInput()
			var result = MoveResult.CONTINUE;
			if (input === ScrollbarInput.SELECT) {
				result = PointBuyMode.INPUT
			}
			else if (input === ScrollbarInput.CANCEL) {
				result = MoveResult.END;
			}
			return result;
		},

		resetAvailableData: function (unit) {
			this._scrollbar.resetAvailableData(unit);
		},

		drawWindow: function (x, y) {
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

		drawWindowContent: function (x, y) {
			this._scrollbar.drawScrollbar(x, y)
		},

		getWindowWidth: function () {
			return DefineControl.getUnitMenuWindowWidth() - 150;
		},

		getWindowHeight: function () {
			return 260;
		}
	}
);

var SkillBuyScrollbar = defineObject(ItemListScrollbar,
	{
		_unit: null,
		_objectArray: null,
		_availableArray: null,
		_defaultArray: null,

		initialize: function () {
			var skillDatabaseList = root.getBaseData().getSkillList()
			this.setScrollFormation(1, 8)

			var arr = [];

			for (i = 0; i < skillDatabaseList.getCount(); i++) {
				skill = skillDatabaseList.getData(i);
				if (skill.custom.CanAllBuy == true) {
					arr.push(skill)
				}
			}

			this.setObjectArray(arr);

			this._availableArray = [];
			this._defaultArray = [];

			for (i = 0; i < arr.length; i++) {
				this._defaultArray.push(arr[i]);
			}
		},

		drawWindowContent: function (x, y) {
			this._scrollbar.drawScrollbar(x, y)
		},

		_setUnit: function (unit) {
			if (unit != null) {
				var skill;
				var i = 0;
				var arr = []
				var list = unit.custom.AvailableSkills;
				var skillDatabaseList = root.getBaseData().getSkillList()

				for (i = 0; i < list.length; i++) {
					if (list[i] <= skillDatabaseList.getCount()) {
						skill = skillDatabaseList.getDataFromId(list[i]);
						if (skill != null) {
							arr.push(skill);
							this._availableArray.push(!SkillChecker._isSkillLearned(unit, skill))
						}
					}
				}

				for (i = 0; i < this._defaultArray.length; i++) {
					skill = this._defaultArray[i];
					arr.push(skill);
					this._availableArray.push(!SkillChecker._isSkillLearned(unit, skill))
				}

				this.setObjectArray(arr);
			};
		},

		_moveInput: function () {
			return MoveResult.CONTINUE;
		},

		drawScrollContent: function (x, y, object, isSelect, index) {
			var textui = this.getParentTextUI();
			var color = textui.getColor();
			var font = textui.getFont();
			var price = this._getPrice(object);

			if (this._availableArray[index] == false) {
				// Dim the skill which doesn't satisfy the condition.
				color = ColorValue.DISABLE;
			}

			SkillRenderer.drawBuyableSkill(x, y, object, color, font, price);
		},

		resetAvailableData: function (unit) {
			var i;
			var length = this._objectArray.length;

			this._availableArray = [];

			for (i = 0; i < length; i++) {
				this._availableArray.push(this._isSkillBuyable(unit, this._objectArray[i]));
			}
		},

		getObjectWidth: function () {
			return ItemRenderer.getShopItemWidth();
		},

		getObjectHeight: function () {
			return ItemRenderer.getItemHeight();
		},

		_isSkillBuyable: function (unit, skill) {
			return SkillChecker._isSkillLearned(unit, skill) == false;
		},

		_getPrice: function (skill) {
			if (skill != null) {
				return typeof skill.custom.PointCostCL == 'number' ? skill.custom.PointCostCL : 5;
			}

			return -1;
		}
	}
);

var PointBuyWindow = defineObject(BonusInputWindow,
	{
		_unit: null,
		_max: 0,
		_exp: 0,
		_jump: 0,
		_param: 0,
		_costMax: 0,
		_isMaxLv: false,
		_paramObject: null,

		initialize: function () {
		},

		checkMax: function (i) {
			if (ParamGroup.getUnitValue(this._unit, i) >= ParamGroup.getMaxValue(this._unit, i)) {
				return false;
			}
			return true;
		},

		checkCost: function (i) {
			var cost = CostGetter._getCost(this._unit, this._param);
			var Points = this._unit != null ? this._unit.custom.StatPoints : null
			if (typeof Points !== 'number') {
				Points = 0
				this._unit.custom.StatPoints = 0
			}
			if (cost > Points && cost != -1) {
				return false;
			}
			return true;
		},

		_moveInput: function () {
			var cost = CostGetter._getCost(this._unit, this._param);
			this._max = this._getPointMax(this._unit, this._param)
			this._costMax = this._getCostMax(this._unit, this._param)

			//attempted to add holding for pad input but it was very slippery.
			//might request SRPG Studio devs add support natively for this kind of window,
			//or a delay based check be native to the engine.
			//it would be nice.

			//Affirm the selection of EXP
			if (InputControl.isSelectAction()) {
				this._cost = this._exp
				this._unit.custom.QoLPointBuyArrayCL[this._param] = 0;
				return MoveResult.SELECT;
			}

			//cancel control
			if (InputControl.isCancelAction()) {
				this._cancelExp();
				return MoveResult.CANCEL;
			}
			else if (InputControl.isInputAction(InputType.UP) || MouseControl.isInputAction(MouseType.UPWHEEL)) {
				//handle increasing and overflow
				this._exp += cost;
				this._unit.custom.QoLPointBuyArrayCL[this._param] += 1;
				MediaControl.soundPlay(root.querySoundHandle('commandcursor'));
				if (this._exp > this._costMax) {
					this._unit.custom.QoLPointBuyArrayCL[this._param] = 0;
					this._exp = 0;
				}
			}
			else if (InputControl.isInputAction(InputType.DOWN) || MouseControl.isInputAction(MouseType.DOWNWHEEL)) {
				//handle decreasing and underflow
				this._exp -= cost;
				this._unit.custom.QoLPointBuyArrayCL[this._param] -= 1;
				MediaControl.soundPlay(root.querySoundHandle('commandcursor'));
				if (this._exp < 0) {
					this._unit.custom.QoLPointBuyArrayCL[this._param] = this._max;
					this._exp = this._costMax;
				}
			}

			return MoveResult.CONTINUE;
		},

		_getCostMax: function (unit, i) {
			var Cost = CostGetter._getCost(unit, i);
			var remainder = 0;
			if (Cost <= 0) {
				return -1;
			}
			var currentValue = ParamGroup.getUnitValue(unit, i);
			var maxValue = ParamGroup.getMaxValue(unit, i);
			var difference = maxValue - currentValue;
			var value = difference * Cost
			if (value > unit.custom.StatPoints) {
				value = unit.custom.StatPoints;
				remainder = unit.custom.StatPoints % Cost
			}
			return value - remainder
		},

		_getPointMax: function (unit, i) {
			var Cost = CostGetter._getCost(unit, i);
			if (Cost <= 0) {
				return -1;
			}
			var currentValue = ParamGroup.getUnitValue(unit, i);
			var maxValue = ParamGroup.getMaxValue(unit, i);
			var difference = maxValue - currentValue;
			var value = difference * Cost;
			if (value > unit.custom.StatPoints) {
				value = unit.custom.StatPoints;
				remainder = unit.custom.StatPoints % Cost
			}
			return Math.round(value / Cost)
		},

		_drawInput: function (x, y) {
			NumberRenderer.drawAttackNumberCenter(x + 50, y, this._exp);
		},

		_isExperienceValueAvailable: function () {
			var Points = this._unit != null ? this._unit.custom.StatPoints : 0
			var cost = CostGetter._getCost(this._unit, this._param);
			if (cost === -1) {
				return false;
			}
			if (typeof Points !== 'number') {
				Points = 0
			}

			return true;
		},

		_setUnit: function (unit) {
			this._unit = unit;
			if (this._isExperienceValueAvailable()) {
				this._exp = 0;
				this._max = unit.custom.StatPoints;
				this.changeCycleMode(BonusInputWindowMode.INPUT);
			}
			else {
				this._exp = -1;
				this.changeCycleMode(BonusInputWindowMode.NONE);
			}
		},

		_cancelExp: function () {
			this._exp = 0;
			this._unit.custom.QoLPointBuyArrayCL[this._param] = 0;
			this._playCancelSound();
		},

		setParam: function (num) {
			this._param = num
		},

		_processChange: function () {
			this._paramObject.setUnitValue(this._unit, this._paramObject.getUnitValue(this._unit) + Math.round(this._cost / CostGetter._getCost(this._unit, this._param)))
			this._unit.custom.StatPoints -= this._cost
			if (typeof this._unit.custom.StatPoints !== 'number' || this._unit.custom.StatPoints <= 0) {
				this._unit.custom.StatPoints = 0
			}
			this._cancelExp()
		}
	}
);

var PointViewWindow = defineObject(BaseWindow,
	{
		_unit: null,

		initialize: function () {
		},

		_setUnit: function (unit) {
			this._unit = unit
		},

		drawWindowContent: function (x, y) {
			var Points = typeof this._unit.custom.StatPoints === 'number' ? this._unit.custom.StatPoints : 0
			var Font = root.getBaseData().getFontList().getData(0)
			var Color = ColorValue.KEYWORD
			TextRenderer.drawText(x, y - 3, "Points: ", -1, Color, Font)
			NumberRenderer.drawRightNumber(x + TextRenderer.getTextWidth("Points: ", Font) + 5, y - 6, Points)
		},

		getWindowWidth: function () {
			var Points = typeof this._unit.custom.StatPoints === 'number' ? this._unit.custom.StatPoints.toString() : "0"
			var Font = root.getBaseData().getFontList().getData(0)
			return TextRenderer.getTextWidth("Points: " + Points, Font) + 35
		},

		getWindowHeight: function () {
			return 40
		}
	}
);

var UnitNameWindow = defineObject(BaseWindow,
	{
		_unit: null,

		initialize: function () { },

		_setUnit: function (unit) {
			this._unit = unit
		},

		//draw the unit name
		drawWindowContent: function (x, y) {
			var Font = root.getBaseData().getFontList().getData(0)
			var Color = ColorValue.KEYWORD
			TextRenderer.drawText(x, y - 3, this._unit.getName(), -1, Color, Font)
		},

		getWindowWidth: function () {
			var Font = root.getBaseData().getFontList().getData(0)
			return TextRenderer.getTextWidth(this._unit.getName(), Font) + 35
		},

		getWindowHeight: function () {
			return 40
		}
	}
);

var UnitCharchipWindow = defineObject(BaseWindow,
	{
		_unit: null,

		initialize: function () { },

		_setUnit: function (unit) {
			this._unit = unit
		},

		//draw the unit name
		drawWindowContent: function (x, y) {
			unitRenderParam = StructureBuilder.buildUnitRenderParam();

			UnitRenderer._setDefaultParam(this._unit, unitRenderParam);
			UnitRenderer.drawCharChip(x + Math.round(GraphicsFormat.CHARCHIP_WIDTH / 8), y + Math.round(GraphicsFormat.CHARCHIP_HEIGHT / 8), unitRenderParam);
		},

		getWindowWidth: function () {
			return Math.round(GraphicsFormat.CHARCHIP_WIDTH * 1.2);
		},

		getWindowHeight: function () {
			return Math.round(GraphicsFormat.CHARCHIP_HEIGHT * 1.2);

		}
	}
);