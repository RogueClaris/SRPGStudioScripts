var CL_SubtractY0 = UnitSimpleRenderer._drawName;
UnitSimpleRenderer._drawName = function (x, y, unit, textui) {
	if (root.getMetaSession().global.DrawManaMini === false) {
		CL_SubtractY0.call(this, x, y, unit, textui);
	}
	else {
		CL_SubtractY0.call(this, x, y - 5, unit, textui);
	}
};
var CL_SubtractY1 = UnitSimpleRenderer._drawInfo;
UnitSimpleRenderer._drawInfo = function (x, y, unit, textui) {
	if (root.getMetaSession().global.DrawManaMini === false) {
		CL_SubtractY1.call(this, x, y, unit, textui);
	}
	else {
		CL_SubtractY1.call(this, x, y - 20, unit, textui);
	}
};
var CL_SubtractY2 = UnitSimpleRenderer._drawSubInfo;
UnitSimpleRenderer._drawSubInfo = function (x, y, unit, textui, mhp) {
	if (root.getMetaSession().global.DrawManaMini === false) {
		CL_SubtractY2.call(this, x, y, unit, textui, mhp);
	}
	else {
		CL_SubtractY2.call(this, x, y - 27, unit, textui, mhp);
		x += GraphicsFormat.FACE_WIDTH + this._getInterval();
		y += 29;
		ContentRenderer.drawManaInfo(x, y, unit);
	}
};

var DrawMoveCostCL0 = UnitMenuTopWindow._drawUnitClass;
UnitMenuTopWindow._drawUnitClass = function (xBase, yBase) {
	var cls = this._unit.getClass();
	var textui = this.getWindowTextUI();
	var color = textui.getColor();
	var font = textui.getFont();
	var length = this._getClassTextLength();
	var manaclass = typeof this._unit.getClass().custom.RSMana === 'object' ? this._unit.getClass().custom.RSMana : null
	var manaUnit = typeof this._unit.custom.RSMana === "object" ? this._unit.custom.RSMana : null;
	var x = xBase + 155
	var y = yBase + 35;
	var xPlus = 10;
	UnitRenderer.drawDefaultUnit(this._unit, x - 35, y + 15, null);
	x += 15
	if (TextRenderer.getTextWidth(this._unit.getName(), font) >= 15 + xPlus) {
		xPlus += typeof this._unit.custom.BonusSpacingCL === 'number' ? this._unit.custom.BonusSpacingCL : 30
	}
	TextRenderer.drawText(x + xPlus, y - 20, cls.getName(), length, color, font);
	if (manaclass != null || manaUnit) {
		var cost = 0;
		var type = manaUnit != null
		if (type){
			type = typeof manaUnit.Type === "string" ? manaUnit.Type : "DRAIN";
			cost = typeof manaUnit.Cost === "number" ? manaUnit.Cost : 0;
		}
		else{
			type = manaclass != null;
			if (type){
				type = typeof manaclass.Type === "string" ? manaclass.Type : "DRAIN";
				cost = typeof manaclass.Cost === "number" ? manaclass.Cost : 0;
			}
			else{
				type = "DRAIN";
				cost = 0;
			}
		}
		if (type === "DRAINPERCENT" && cost >= 0) {
			cost = Math.round(this._unit.custom.RSMana.Max * (cost / 100))
		}
		ItemInfoRenderer.drawKeyword(x + 10, y - 6, "Move Cost");
		NumberRenderer.drawRightNumber(x + TextRenderer.getTextWidth("Move Cost", font) + 15, y - 6, cost)
		ContentRenderer.drawManaInfo(x + 10, y - 17, this._unit)
	}
};

var RS_ManaControl = {

	_defaultMana: 100,
	_defaultInc: 10,
	_defaultCap: 300,
	_defaultRegen: 20,
	_defaultChance: 40,
	_defaultMoveCost: 0,

	setupMap: function () {
		var list = PlayerList.getSortieList()
		var count = PlayerList.getSortieList().getCount()
		var i;
		for (i = 0; i < count; i++) {
			this.setupUnit(list.getData(i))
		}
		list = EnemyList.getAliveList()
		count = list.getCount();
		for (i = 0; i < count; i++) {
			this.setupUnit(list.getData(i))
		}
		list = AllyList.getAliveList()
		count = list.getCount()
		for (i = 0; i < count; i++) {
			this.setupUnit(list.getData(i))
		}
	},

	setupUnit: function (unit) {
		var cls = unit.getClass()
		if (typeof unit.custom.RSMana === 'object' && typeof unit.custom.RSMana.Max === 'number') {
			unit.custom.RSMana.Current = Number(unit.custom.RSMana.Max)
		}
		else if (typeof unit.custom.RSMana !== "object"){
			var manatest = cls.custom.RSMana
			var unitManaTest = unit.custom.RSMana;
			if (typeof manatest === 'object' && typeof cls.custom.RSMana.Max === 'number') {
				if (typeof unitManaTest != "object"){
					unit.custom.RSMana = manatest;
				}
				else{
					if (typeof unitManaTest.Cap !== "number"){
						unit.custom.RSMana.Cap = typeof manatest.Cap === "number" ? manatest.Cap : this._defaultCap;
					}
					if (typeof unitManaTest.Increment !== "number"){
						unit.custom.RSMana.Increment = typeof manatest.Increment === "number" ? manatest.Increment : this._defaultInc;
					}
					if (typeof unitManaTest.Max !== "number"){
						unit.custom.RSMana.Max = typeof manatest.Max === "number" ? Math.min(manatest.Cap, manatest.Max + (manatest.Increment * (unit.getLv() - 1))) : Math.min(this._defaultCap, this._defaultMana + (this._defaultInc * (unit.getLv() - 1)));
						unit.custom.RSMana.Current = unit.custom.RSMana.Max;
					}
					if (typeof unitManaTest.Regen !== "object"){
						unit.custom.RSMana.Regen = typeof manatest.Regen === "object" ? manatest.Regen : ["PERCENT", this._defaultRegen];
					}
					if (typeof unitManaTest.Cost !== "number"){
						unit.custom.RSMana.Cost = typeof manatest.Cost === "number" ? manatest.Cost : 0;
					}
				}
			}
			else {
				cls.custom.RSMana = {
					Cost: 0,
					Max: Math.min(this._defaultCap, this._defaultMana + (this._defaultInc * (unit.getLv() - 1))),
					Current: Math.min(this._defaultCap, this._defaultMana + (this._defaultInc * (unit.getLv() - 1))),
					Type: "DRAIN",
					Regen: ["PERCENT", this._defaultRegen],
					GrowthChance: this._defaultChance,
					Increment: this._defaultInc,
					Cap: this._defaultCap
				}
				if (typeof unit.custom.RSMana != 'object'){
					unit.custom.RSMana = cls.custom.RSMana;
				}
			}
		}
	},

	regenArmy: function () {
		var list = TurnControl.getActorList()
		var count = list != null ? list.getCount() : 0
		var i;
		for (i = 0; i < count; i++) {
			this.regenMana(list.getData(i))
		}
	},

	forceSetMana: function (unit, amount, isMax) {
		//Set up the unit if it is not set up.
		if (typeof unit.custom.RSMana != 'object') {
			this.setupUnit(unit)
		}
		if (isMax === true) {
			unit.custom.RSMana.Max = amount
		}
		else {
			unit.custom.RSMana.Current = amount
		}
	},

	incrementMana: function (unit) {
		if (typeof unit.custom.RSMana.Increment === 'number') {
			unit.custom.RSMana.Max += unit.custom.RSMana.Increment
			unit.custom.RSMana.Current += unit.custom.RSMana.Increment
		}
		else if (typeof unit.getClass().custom.RSMana.Increment === 'number') {
			unit.custom.RSMana.Max += unit.getClass().custom.RSMana.Increment
			unit.custom.RSMana.Current += unit.getClass().custom.RSMana.Increment
		}
		else {
			unit.custom.RSMana.Max += this._defaultInc
			unit.custom.RSMana.Current += this._defaultInc
		}
		if (unit.custom.RSMana.Current > unit.custom.RSMana.Cap){
			unit.custom.RSMana.Current = unit.custom.RSMana.Cap;
		}
		if (unit.custom.RSMana.Current > unit.custom.RSMana.Max){
			unit.custom.RSMana.Current = unit.custom.RSMana.Max
		}
	},

	incrementManaByAmount: function (unit, amount) {
		unit.custom.RSMana.Max += amount;
		unit.custom.RSMana.Current += amount;
		if (unit.custom.RSMana.Current > unit.custom.RSMana.Cap){
			unit.custom.RSMana.Current = unit.custom.RSMana.Cap;
		}
		if (unit.custom.RSMana.Current > unit.custom.RSMana.Max){
			unit.custom.RSMana.Current = unit.custom.RSMana.Max
		}
	},

	setMana: function (unit, obj) {
		var Types = ["DRAIN", "DRAINPERCENT", "ADD", "ADDPERCENT"]
		if (typeof unit.custom.RSMana != 'object') {
			this.setupUnit(unit)
		}
		else if (typeof obj != 'object') {
			return;
		}
		else if (typeof obj.Type != 'string') {
			return;
		}
		var index = Types.indexOf(obj.Type.toUpperCase())
		if (index === -1) {
			return;
		}
		else {
			var choice = Types[index]
			var Cost = typeof obj.Cost === 'number' ? obj.Cost : 0
			if (choice === "DRAIN") {
				unit.custom.RSMana.Current = Math.min(unit.custom.RSMana.Max, Math.max(0, unit.custom.RSMana.Current - Cost))
			}
			else if (choice === "DRAINPERCENT") {
				unit.custom.RSMana.Current = Math.min(unit.custom.RSMana.Max, Math.max(0, unit.custom.RSMana.Current - Math.round(unit.custom.RSMana.Max * (Cost / 100))))
			}
			if (choice === "ADD") {
				unit.custom.RSMana.Current = Math.max(0, Math.min(unit.custom.RSMana.Max, unit.custom.RSMana.Current + obj.Gain))
			}
			else if (choice === "ADDPERCENT") {
				unit.custom.RSMana.Current = Math.max(0, Math.min(unit.custom.RSMana.Max, unit.custom.RSMana.Current + Math.round(unit.custom.RSMana.Max * (obj.Gain / 100))))
			}
		}
	},

	strikeGain: function (unit, amt) {
		if (typeof unit.custom.RSMana != 'object') {
			this.setupUnit(unit)
		}
		if (typeof amt != 'number') {
			return;
		}
		unit.custom.RSMana.Current = Math.max(0, Math.min(unit.custom.RSMana.Max, unit.custom.RSMana.Current + amt))
	},

	regenMana: function (unit) {
		if (typeof unit.custom.RSMana != 'object') {
			this.setupUnit(unit)
		}
		if (unit.custom.RSMana.Regen[0].toUpperCase() === "PERCENT") {
			unit.custom.RSMana.Current = Math.min(unit.custom.RSMana.Max, unit.custom.RSMana.Current + (unit.custom.RSMana.Max * (unit.custom.RSMana.Regen[1] / 100)))
		}
		else if (unit.custom.RSMana.Regen[0].toUpperCase() === "RAW") {
			unit.custom.RSMana.Current = Math.min(unit.custom.RSMana.Max, unit.custom.RSMana.Current + unit.custom.RSMana.Regen[1])
		}
	},

	checkMana: function (unit, amt) {
		if (typeof unit.custom.RSMana != 'object') {
			this.setupUnit(unit)
		}
		if (unit.custom.RSMana.Current < amt) {
			return false;
		}
		return true;
	},

	getMana: function (unit, isMax) {
		if (typeof unit.custom.RSMana != 'object') {
			this.setupUnit(unit)
		}
		return isMax ? unit.custom.RSMana.Max : unit.custom.RSMana.Current;
	}
}


var Mana01 = ItemPackageControl.getCustomItemSelectionObject;
ItemPackageControl.getCustomItemSelectionObject = function (item, keyword) {
	if (keyword === "RSMana") {
		return ManaItemSelection;
	}
	return Mana01.call(this, item, keyword);
};

ManaItemSelection = defineObject(BaseItemSelection,
	{
	}
);

var Mana02 = ItemPackageControl.getCustomItemAvailabilityObject;
ItemPackageControl.getCustomItemAvailabilityObject = function (item, keyword) {
	if (keyword === "RSMana") {
		return ManaItemAvailability;
	}
	return Mana02.call(this, item, keyword);
};

ManaItemAvailability = defineObject(BaseItemAvailability,
	{
		isItemAllowed: function (unit, targetUnit, item) {
			if (typeof item.custom.RSMana === 'object') {
				if (typeof targetUnit.custom.CopyCatMana === 'object') {
					if (typeof item.custom.RSMana.Cost === 'number' && item.custom.RSMana.Cost > targetUnit.custom.CopyCatMana.Current) {
						return false;
					}
					else if (typeof item.custom.RSMana.Gain === 'number' && targetUnit.custom.CopyCatMana.Current >= targetUnit.custom.RSMana.Max) {
						return false;
					}
					return true;
				}
				else if (typeof targetUnit.custom.RSMana === 'object') {
					if (typeof item.custom.RSMana.Cost === 'number' && item.custom.RSMana.Cost > targetUnit.custom.RSMana.Current) {
						return false;
					}
					else if (typeof item.custom.RSMana.Gain === 'number' && targetUnit.custom.RSMana.Current >= targetUnit.custom.RSMana.Max) {
						return false;
					}
					return true;
				}
				return false;
			}
			return false;
		}
	}
);

var Mana03 = ItemPackageControl.getCustomItemUseObject;
ItemPackageControl.getCustomItemUseObject = function (item, keyword) {
	if (keyword === "RSMana") {
		return ManaItemUse;
	}
	return Mana03.call(this, item, keyword);
};

var ManaItemUseMode = {
	MAIN: 0
}

ManaItemUse = defineObject(BaseItemUse,
	{

		_dynamicEvent: null,
		_window: null,
		_x: null,
		_y: null,

		enterMainUseCycle: function (itemUseParent) {
			var generator;
			var itemTargetInfo = itemUseParent.getItemTargetInfo();
			var item = itemTargetInfo.item
			var unit = itemTargetInfo.targetUnit
			//Use the mana in the item use when moving and using mana items.
			//This way we use mana and recover it in the correct order.
			var manacopy = typeof unit.custom.CopyCatMana === 'object' ? unit.custom.CopyCatMana : null
			if (manacopy != null) {
				RS_ManaControl.setMana(unit, manacopy)
				delete unit.custom.CopyCatMana
			}
			var type = item.getRangeType();
			var ManaObj = item.custom.RSMana;
			var anime = this._getItemRecoveryAnime(itemTargetInfo)

			this._window = createWindowObject(UnitMenuTopWindow, this);
			this._x = LayoutControl.getCenterX(-1, this._window.getWindowWidth())
			this._y = LayoutControl.getCenterY(-1, this._window.getWindowHeight())
			this._window.changeUnitMenuTarget(unit)
			this._dynamicEvent = createObject(DynamicEvent);
			generator = this._dynamicEvent.acquireEventGenerator();

			if (type !== SelectionRangeType.SELFONLY) {
				generator.locationFocus(unit.getMapX(), unit.getMapY(), true);
			}
			var Pos = LayoutControl.getMapAnimationPos(LayoutControl.getPixelX(unit.getMapX()), LayoutControl.getPixelY(unit.getMapY()), anime)
			generator.animationPlay(anime, Pos.x, Pos.y, false, AnimePlayType.SYNC, 0)
			RS_ManaControl.setMana(unit, ManaObj)
			this.changeCycleMode(ManaItemUseMode.MAIN);
			this._dynamicEvent.executeDynamicEvent();
			return EnterResult.OK
		},

		moveMainUseCycle: function () {
			if (InputControl.isSelectAction()) {
				if (this._dynamicEvent.moveDynamicEvent() !== MoveResult.CONTINUE) {
					return MoveResult.END;
				}
			}
			return MoveResult.CONTINUE;
		},

		drawMainUseCycle: function () {
			if (this._dynamicEvent.moveDynamicEvent() !== MoveResult.CONTINUE) {
				this._window.drawWindow(this._x, this._y)
			}
		},

		_getItemRecoveryAnime: function (itemTargetInfo) {
			return itemTargetInfo.item.getItemAnime();
		}
	}
);

var Mana04 = ItemPackageControl.getCustomItemAIObject;
ItemPackageControl.getCustomItemAIObject = function (item, keyword) {
	if (keyword === "RSMana") {
		return ManaItemAI;
	}
	return Mana04.call(this, item, keyword);
};

var ManaItemAI = defineObject(BaseItemAI,
	{
		getItemScore: function (unit, combination) {
			var value;
			var score = this._getScore(unit, combination);

			if (score < 0) {
				return score;
			}

			value = this._getValue(unit, combination);

			score += Miscellaneous.convertAIValue(value);

			return score;
		},

		_getValue: function (unit, combination) {
			var manaobj = combination.item.RSMana;
			var unitobj = combination.targetUnit.custom.RSMana;
			if (typeof manaobj != 'object' || typeof unitobj != 'object') {
				return -1;
			}
			var Mana = 0
			if (typeof manaobj.Gain === 'number' && manaobj.Type === "ADDPERCENT") {
				Mana = Math.min(unitobj.Max, unitobj.Max * (manaobj.Gain / 100) + unitobj.Current)
			}
			else if (typeof manaobj.Gain === 'number' && manaobj.Type === "ADD") {
				Mana = Math.min(unitobj.Max, manaobj.Gain + unitobj.Current)
			}
			if (typeof manaobj.Cost === 'number' && manaobj.Type === "DRAINPERCENT") {
				Mana += Math.max(0, unitobj.Max * (manaobj.Cost / 100) - unitobj.Current)
			}
			else if (typeof manaobj.Cost === 'number' && manaobj.Type === "DRAIN") {
				Mana += Math.max(0, manaobj.Cost - unitobj.Current)
			}
			else {
				Mana = 0
			}
			return Mana
		},

		_getScore: function (unit, combination) {
			var target = combination.targetUnit
			var item = combination.item
			var manaobj = item.custom.RSMana
			var targetobj = target.custom.RSMana
			if (typeof manaobj != 'object' || typeof targetobj != 'object') {
				return AIValue.MIN_SCORE;
			}
			else if (targetobj.Current === targetobj.Max) {
				return AIValue.MIN_SCORE;
			}

			var baseHp = Math.floor(targetobj.Max * 0.25);
			if (targetobj.Current < baseHp) {
				return 50;
			}

			baseHp = Math.floor(targetobj.Max * 0.5);
			if (targetobj.Current < baseHp) {
				return 30;
			}

			baseHp = Math.floor(targetobj.Max * 0.75);
			if (targetobj.Current < baseHp) {
				return 10;
			}

			return AIValue.MIN_SCORE;
		}
	}
);

var Mana05 = ItemPackageControl.getCustomItemInfoObject;
ItemPackageControl.getCustomItemInfoObject = function (item, keyword) {
	if (keyword === "RSMana") {
		return ManaItemInfo;
	}
	return Mana05.call(this, item, keyword);
};

ManaItemInfo = defineObject(BaseItemInfo,
	{
		drawItemInfoCycle: function (x, y) {
			if (typeof this._item.custom.RSMana != 'object') {
				ItemInfoRenderer.drawKeyword(x, y, "Please setup this this._item.")
			}
			else {
				if (typeof this._item.custom.RSMana.Gain === 'number') {
					if (this._item.custom.RSMana.Type.toUpperCase() === "ADDPERCENT" || this._item.custom.RSMana.Type.toUpperCase() === "ADD") {
						ItemInfoRenderer.drawKeyword(x, y, "Mana Restorative")
					}
				}
				else if (typeof this._item.custom.RSMana.Cost === 'number') {
					if (this._item.custom.RSMana.Type.toUpperCase() === "DRAINPERCENT" || this._item.custom.RSMana.Type.toUpperCase() === "DRAIN") {
						ItemInfoRenderer.drawKeyword(x, y, "Mana Drainer")
					}
				}
				else {
					ItemInfoRenderer.drawKeyword(x, y, "Improperly configured.");
				}
				y += ItemInfoRenderer.getSpaceY();
				this._drawValue(x, y);
			}

		},

		getInfoPartsCount: function () {
			return 2;
		},

		_drawValue: function (x, y) {
			var TUI = root.queryTextUI('default_window');
			var FONT = TUI.getFont();
			var COLOR = TUI.getColor();
			var name = UnitParameter.Mana.getParameterName()
			if (typeof this._item.custom.RSMana.Gain === 'number') {
				ItemInfoRenderer.drawKeyword(x, y, name + " Heal");
				x += Math.floor(TextRenderer.getTextWidth(name + " Heal", FONT) + 5)
				if (this._item.custom.RSMana.Type.toUpperCase() === "ADDPERCENT") {
					NumberRenderer.drawRightNumber(x, y, this._item.custom.RSMana.Gain);
					x += Math.floor(TextRenderer.getTextWidth(this._item.custom.RSMana.Gain.toString(), FONT) + 5)
					TextRenderer.drawSingleCharacter(x, y + 3, "%", COLOR, FONT);
				}
				else if (this._item.custom.RSMana.Type.toUpperCase() === "ADD") {
					NumberRenderer.drawRightNumber(x, y, this._item.custom.RSMana.Gain);
				}
			}
			else if (typeof this._item.custom.RSMana.Cost === 'number') {
				ItemInfoRenderer.drawKeyword(x, y, name + ' Cost')
				x += Math.floor(TextRenderer.getTextWidth(name + " Cost", FONT) + 5)
				if (this._item.custom.RSMana.Type.toUpperCase() === "DRAINPERCENT") {
					NumberRenderer.drawRightNumber(x, y, this._item.custom.RSMana.Cost);
					x += Math.floor(TextRenderer.getTextWidth(this._item.custom.RSMana.Cost.toString(), FONT) + 5)
					TextRenderer.drawSingleCharacter(x, y + 3, "%", COLOR, FONT);
				}
				else if (this._item.custom.RSMana.Type.toUpperCase() === "DRAIN") {
					NumberRenderer.drawRightNumber(x, y, this._item.custom.RSMana.Cost);
				}
			}
			x += 40;
			this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType());
		},

		drawRange: function (x, y, rangeValue, rangeType) {
			var textui = this.getWindowTextUI();
			var color = textui.getColor();
			var font = textui.getFont();

			ItemInfoRenderer.drawKeyword(x, y, root.queryCommand('range_capacity'));
			x += TextRenderer.getTextWidth(root.queryCommand('range_capacity'), font) + 5

			if (rangeType === SelectionRangeType.SELFONLY) {
				TextRenderer.drawKeywordText(x, y, StringTable.Range_Self, -1, color, font);
			}
			else if (rangeType === SelectionRangeType.MULTI) {
				NumberRenderer.drawRightNumber(x, y, rangeValue);
			}
			else if (rangeType === SelectionRangeType.ALL) {
				TextRenderer.drawKeywordText(x, y, StringTable.Range_All, -1, color, font);
			}
		}
	}
);

var Mana06 = ItemPackageControl.getCustomItemPotencyObject;
ItemPackageControl.getCustomItemPotencyObject = function (item, keyword) {
	if (keyword === "RSMana") {
		return ManaItemPotency;
	}
	return Mana06.call(this, item, keyword);
};

var ManaItemPotency = defineObject(BaseItemPotency,
	{
	}
);


var DrawManaWeaponCL0 = ItemInfoWindow._configureWeapon;
ItemInfoWindow._configureWeapon = function (groupArray) {
	DrawManaWeaponCL0.call(this, groupArray);
	groupArray.insertObject(ItemSentence.ManaDetails, 2)
};

var DrawManaItemCL0 = ItemInfoWindow._configureItem;
ItemInfoWindow._configureItem = function (groupArray) {
	DrawManaItemCL0.call(this, groupArray)
	groupArray.insertObject(ItemSentence.ManaDetails, 2)
}

ItemSentence.ManaDetails = defineObject(BaseItemSentence,
	{
		drawItemSentence: function (x, y, item) {
			if (!item.isWeapon() && item.getCustomKeyword() === 'RSMana') { return; } //SRPG World suggested change
			var text;
			var tx = 0;
			var name = UnitParameter.Mana.getParameterName()
			var checkMana = typeof item.custom.RSMana === 'object' ? item.custom.RSMana : null
			if (checkMana !== null) {
				if (typeof checkMana.Cost === 'number') {
					text = name + " Cost"
					ItemInfoRenderer.drawKeyword(x, y, text);
					NumberRenderer.drawRightNumber(x + TextRenderer.getTextWidth(text, root.queryTextUI('default_window').getFont()) + 5, y, checkMana.Cost);
					if (typeof checkMana.Gain !== "number"){
						y += 22;
					}
				}
				if (typeof checkMana.Gain === 'number') {
					text = name + " Gain"
					if (typeof checkMana.Cost === 'number') {
						tx += TextRenderer.getTextWidth("Mana Cost", root.queryTextUI('default_window').getFont()) * 1.5
					}
					ItemInfoRenderer.drawKeyword(x + tx, y, text);
					NumberRenderer.drawRightNumber(x + ItemInfoRenderer.getSpaceX() + tx + 15, y, checkMana.Gain);
					y += 22;
				}
				if (item.isWeapon()){
					if (checkMana.StrikeGain && checkMana.StrikeDrain){
						text = name + " Steal"
						ItemInfoRenderer.drawKeyword(x, y, text);
					}
					else if (checkMana.StrikeGain){
						text = name + " Gain"
						ItemInfoRenderer.drawKeyword(x, y, text);
					}
					else if (checkMana.StrikeDrain) {
						text = name + " Drain"
						ItemInfoRenderer.drawKeyword(x, y, text);
					}
				}
			}
		},

		getItemSentenceCount: function (item) {
			var count = 0;
			if (!item.isWeapon() && item.getCustomKeyword() === 'RSMana') { return 0; } //SRPG World suggested addition
			var checkMana = typeof item.custom.RSMana === 'object' ? item.custom.RSMana : null
			if (checkMana !== null) {
				count += typeof checkMana.Cost === 'number' || typeof checkMana.Gain === 'number' ? 1 : 0
				if (checkMana.StrikeGain && checkMana.StrikeDrain){
					count += 1;
				}
				else if (checkMana.StrikeGain || checkMana.StrikeDrain){
					count += 1;
				}
			}
			return count;
		}
	}
);

var ManaSentence = {}

ManaSentence.ManaInfo = defineObject(BaseItemSentence,
	{
		_cur: 0,
		_max: 0,
		_weapon: null,

		setParentWindow: function (unitSentenceWindow) {
			this._unitSentenceWindow = unitSentenceWindow;
		},

		setValues: function (unit, weapon, totalStatus) {
			if (unit != null && typeof unit.custom.RSMana === 'object') {
				this._max = unit.custom.RSMana.Max
				this._cur = unit.custom.RSMana.Current
			}
			if (weapon != null) {
				this._weapon = weapon;
			}
		},

		drawUnitSentence: function (x, y, unit, weapon, totalStatus) {
			var value = 0;
			var isValid = false
			if (unit != null && typeof unit.custom.RSMana === 'object') {
				isValid = true
			}
			this.drawAbilityText(x, y, "Max Mana", this._max, isValid);
			this.drawAbilityText(x, y + 25, "Cur. Mana", this._cur, isValid);
			this.drawWeaponText(x, y + 50, this._weapon != null);
		},

		getUnitSentenceCount: function (unit) {
			return 2;
		},

		drawAbilityText: function (x, y, text, value, isValid) {
			var textui = this.getUnitSentenceTextUI();
			var color = textui.getColor();
			var font = textui.getFont();
			var colorIndex = 1;
			var length = -1;

			TextRenderer.drawKeywordText(x, y, text, length, color, font);

			x += 78;

			if (isValid) {
				if (value < 0) {
					TextRenderer.drawSignText(x - 37, y, ' - ');
					value *= -1;
				}
				NumberRenderer.drawNumberColor(x + 20, y, value, colorIndex, 255);
			}
			else {
				TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
			}
		},

		drawWeaponText: function (x, y, isValid) {
			var textui = this.getUnitSentenceTextUI();
			var color = textui.getColor();
			var font = textui.getFont();
			var colorIndex = 1;
			var length = -1;

			if (this._weapon === null || typeof this._weapon.custom.RSMana != 'object') {
				isValid = false;
			}
			else {
				value = typeof this._weapon.custom.RSMana.Cost === 'number' ? this._weapon.custom.RSMana.Cost : typeof this._weapon.custom.RSMana.Gain === 'number' ? this._weapon.custom.RSMana.Gain : 0
				text = typeof this._weapon.custom.RSMana.Gain === 'number' ? "Atk Gain" : "Atk Cost"
			}
			TextRenderer.drawKeywordText(x, y, text, length, color, font);
			x += 78;

			if (isValid) {
				if (value < 0) {
					TextRenderer.drawSignText(x - 37, y, ' - ');
					value *= -1;
				}
				NumberRenderer.drawNumberColor(x + 20, y, value, colorIndex, 255);
			}
			else {
				TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
			}
		}
	}
);

var SpendMana01 = ItemControl.decreaseLimit;
ItemControl.decreaseLimit = function (unit, item) {
	SpendMana01.call(this, unit, item);
	if (typeof item.custom.RSMana === 'object') {
		if (!item.isWeapon() && item.getCustomKeyword() === "RSMana") {
			return;
		}
		if (item.custom.RSMana.StrikeGain) {
			return;
		}
		RS_ManaControl.setMana(unit, item.custom.RSMana)
	}
};

var SpendManaTemp = SimulateMove._endMove;
SimulateMove._endMove = function (unit) {
	SpendManaTemp.call(this, unit);
	var manaclass = typeof unit.getClass().custom.RSMana === 'object' ? unit.getClass().custom.RSMana : null;
	var manaUnit = typeof unit.custom.RSMana === 'object' ? unit.custom.RSMana : null;
	var manaskill = SkillControl.getPossessionCustomSkill(unit, "SaveManaMove");
	if (manaclass != null || manaUnit != null) {
		var manacopy = {}
		if (manaUnit != null){
			manacopy.Type = typeof manaUnit.Type === "string" ? manaUnit.Type : "DRAIN";
			manacopy.Cost = typeof manaUnit.Cost === "number" ? manaUnit.Cost : 0;
		}
		else{
			if (manaclass != null){
				manacopy.Type = typeof manaclass.Type === "string" ? manaclass.Type : "DRAIN";
				manacopy.Cost = typeof manaclass.Cost === "number" ? manaclass.Cost : 0;
			}
		}
		if (manaskill && typeof manaskill.custom.RSMana === 'object') {
			if (manaskill.custom.MoveSaveType.toUpperCase() === "PERCENT") {
				manacopy.Cost = Math.round(manacopy.Cost * (manaskill.custom.MoveSave / 100))
			}
			else if (manaskill.custom.MoveSaveType.toUpperCase() === "RAW") {
				manacopy.Cost = manacopy.Cost - manaskill.custom.MoveSave
			}
		}

		//save the mana for later.
		manacopy.Cost = Math.round(unit.getMostResentMov() * manacopy.Cost)
		unit.custom.CopyCatMana = manacopy
		unit.custom.CopyCatMana.Current = unit.custom.RSMana.Current - manacopy.Cost;

		//for AI, immediately spend mana.
		if (unit.getUnitType() !== UnitType.PLAYER){
			RS_ManaControl.setMana(unit, manacopy)
			delete unit.custom.CopyCatMana
		}
	}
};

var SpendMana02 = MapSequenceCommand._doLastAction;
MapSequenceCommand._doLastAction = function () {
	var result = SpendMana02.call(this)
	var manacopy = typeof this._targetUnit.custom.CopyCatMana === 'object' ? this._targetUnit.custom.CopyCatMana : null
	if (manacopy != null && result in [0, 1]) {
		RS_ManaControl.setMana(this._targetUnit, manacopy)
		delete this._targetUnit.custom.CopyCatMana
	}
	return result;
};

var ManaLimitsMovementRS = UnitRangePanel._getRangeMov;
UnitRangePanel._getRangeMov = function (unit) {
	var mov = ManaLimitsMovementRS.call(this, unit)
	var cost;
	var manaclass = typeof unit.getClass().custom.RSMana === 'object' ? unit.getClass().custom.RSMana : null;
	var manaUnit = typeof unit.custom.RSMana === "object" ? unit.custom.RSMana : null;
	if (unit.isMovePanelVisible()) {
		if (manaclass != null || manaUnit != null) {
			var type = manaUnit != null
			if (type){
				type = typeof manaUnit.Type === "string" ? manaUnit.Type : "DRAIN";
				cost = typeof manaUnit.Cost === "number" ? manaUnit.Cost : 0;
			}
			else{
				type = manaclass != null;
				if (type){
					type = typeof manaclass.Type === "string" ? manaclass.Type : "DRAIN";
					cost = typeof manaclass.Cost === "number" ? manaclass.Cost : 0;
				}
				else{
					type = "DRAIN";
					cost = 0;
				}
			}
			if (type === "DRAINPERCENT" && cost >= 0) {
				cost = Math.round(unit.custom.RSMana.Max * (cost / 100))
			}
			var manaskill = SkillControl.getPossessionCustomSkill(unit, "SaveManaMove")
			if (manaskill && typeof manaskill.custom.RSMana === 'object') {
				if (manaskill.custom.MoveSaveType.toUpperCase() === "PERCENT") {
					cost = Math.round(cost * (manaskill.MoveSave / 100))
				}
			}
			while (mov * cost > unit.custom.RSMana.Current) {
				mov -= 1
			}
		}
	}
	else {
		mov = 0;
	}

	return mov;
};

//Limits enemies & allies
var ManaLimitsMovementRS02 = ParamBonus.getMov;
ParamBonus.getMov = function(unit){
	var mov = ManaLimitsMovementRS02.call(this, unit)
	if (unit.getUnitType() === UnitType.PLAYER){
		return mov;
	}
	var cost;
	var manaclass = typeof unit.getClass().custom.RSMana === 'object' ? unit.getClass().custom.RSMana : null;
	var manaUnit = typeof unit.custom.RSMana === "object" ? unit.custom.RSMana : null;
	if (unit.isMovePanelVisible()) {
		if (manaclass != null || manaUnit != null) {
			var type = manaUnit != null
			if (type){
				type = typeof manaUnit.Type === "string" ? manaUnit.Type : "DRAIN";
				cost = typeof manaUnit.Cost === "number" ? manaUnit.Cost : 0;
			}
			else{
				type = manaclass != null;
				if (type){
					type = typeof manaclass.Type === "string" ? manaclass.Type : "DRAIN";
					cost = typeof manaclass.Cost === "number" ? manaclass.Cost : 0;
				}
				else{
					type = "DRAIN";
					cost = 0;
				}
			}
			if (type === "DRAINPERCENT" && cost >= 0) {
				cost = Math.round(unit.custom.RSMana.Max * (cost / 100))
			}
			var manaskill = SkillControl.getPossessionCustomSkill(unit, "SaveManaMove")
			if (manaskill && typeof manaskill.custom.RSMana === 'object') {
				if (manaskill.custom.MoveSaveType.toUpperCase() === "PERCENT") {
					cost = Math.round(cost * (manaskill.MoveSave / 100))
				}
			}
			while (mov * cost > unit.custom.RSMana.Current) {
				mov -= 1
			}
		}
	}
	else {
		mov = 0;
	}

	return mov;
};

var ManaSetup01 = UnitProvider.recoveryPrepareUnit
UnitProvider.recoveryPrepareUnit = function (unit) {
	ManaSetup01.call(this, unit);
	RS_ManaControl.setupUnit(unit)
};

var ManaSetup02 = ScriptCall_AppearEventUnit;
ScriptCall_AppearEventUnit = function (unit) {
	ManaSetup02.call(this, unit);
	RS_ManaControl.setupUnit(unit)
};

var ManaSetup03 = ReinforcementChecker._appearUnit;
ReinforcementChecker._appearUnit = function (pageData, x, y) {
	RS_ManaControl.setupUnit(pageData.getSourceUnit())
	return ManaSetup03.call(this, pageData, x, y);
};

var ManaSetup04 = OpeningEventFlowEntry._checkUnitParameter;
OpeningEventFlowEntry._checkUnitParameter = function () {
	ManaSetup04.call(this);
	RS_ManaControl.setupMap()
};

var RegenerationIsLive01 = TurnControl.turnEnd
TurnControl.turnEnd = function () {
	RegenerationIsLive01.call(this)
	if (root.getBaseScene() === SceneType.FREE) {
		RS_ManaControl.regenArmy()
	}
}

var ManaBanList01 = ItemControl.isWeaponAvailable
ItemControl.isWeaponAvailable = function (unit, item) {
	var result = ManaBanList01.call(this, unit, item);
	if (typeof unit.custom.RSMana != 'object') {
		return result;
	}
	else if (result && typeof item.custom.RSMana === 'object') {
		if (typeof item.custom.RSMana.Type === 'string' && item.custom.RSMana.Type.toUpperCase() in ["ADD", "ADDPERCENT"]) {
			return true;
		}
		else if (typeof item.custom.RSMana.Type === 'string' && item.custom.RSMana.Type.toUpperCase() === 'DRAINPERCENT') {
			if (unit.custom.RSMana.Current < Math.round(unit.custom.RSMana.Max * (item.custom.RSMana.Cost / 100))) {
				return false;
			}
		}
		else if (typeof item.custom.RSMana.Type === 'string' && item.custom.RSMana.Type.toUpperCase() === 'DRAIN' && unit.custom.RSMana.Current < item.custom.RSMana.Cost) {
			return false;
		}
		return true;
	}
	return result;
}

var SpendMana03 = AttackEvaluator.HitCritical.evaluateAttackEntry;
AttackEvaluator.HitCritical.evaluateAttackEntry = function (virtualActive, virtualPassive, attackEntry) {
	SpendMana03.call(this, virtualActive, virtualPassive, attackEntry)
	if (attackEntry.isHit) {
		var active = virtualActive.unitSelf
		var passive = virtualPassive.unitSelf
		var weapon = ItemControl.getEquippedWeapon(active)
		if (typeof active.custom.RSMana === 'object' && weapon != null && typeof weapon.custom.RSMana === 'object' && weapon.custom.RSMana.StrikeGain) {
			RS_ManaControl.strikeGain(active, attackEntry.damagePassive)
		}
		if (typeof passive.custom.RSMana === "object" && weapon != null && typeof weapon.custom.RSMana === "object" && weapon.custom.RSMana.StrikeDrain){
			RS_ManaControl.strikeGain(passive, -attackEntry.damagePassive);
		}
	}
};

ContentRenderer.drawManaInfo = function (x, y, unit) {
	var manacheck = typeof unit.custom.RSMana === 'object' ? unit.custom.RSMana : null;
	var manacheck2 = typeof unit.getClass().custom.RSMana === "object" ? unit.getClass().custom.RSMana : null;
	y += 32
	if (manacheck != null || manacheck2 != null) {
		var current = typeof manacheck.Current === "number" ? manacheck.Current : null;
		if (current === null){
			current = typeof manacheck2.Current === "number" ? manacheck2.Current : 0;
		}
		var max = typeof manacheck.Max === "number" ? manacheck.Max : null;
		if (max === null){
			max = typeof manacheck2.Max === "number" ? manacheck2.Max : 0;
		}
		var pic = root.queryUI('unit_gauge');
		TextRenderer.drawSignText(x, y, UnitParameter.Mana.getParameterName());
		NumberRenderer.drawNumber(x + 60, y, current);
		TextRenderer.drawSignText(x + 70, y, '/');
		NumberRenderer.drawRightNumber(x + 80, y, max);
		this.drawGauge(x, y + 20, current, max, 1, 110, pic);
	}
};

ParamType.COUNT = ParamType.COUNT + 1;
ParamType.MANA = ParamType.COUNT - 1;

UnitParameter.Mana = defineObject(BaseUnitParameter,
	{
		getParameterType: function () {
			return ParamType.MANA;
		},

		getUnitValue: function (unit) {
			return RS_ManaControl.getMana(unit, true);
		},

		setUnitValue: function (unit, value) {
			RS_ManaControl.incrementMana(unit)
		},

		// Obj is the unit, class, or weapon etc.
		// Determines Bonus Mana
		getParameterBonus: function (obj) {
			return 0;
		},

		// Obj is the unit, class, or weapon etc.
		// Determines Mana Growth Chance
		getGrowthBonus: function (obj) {
			if (!obj.custom) {
				return 0;
			}
			if (obj != null && typeof obj.custom.RSMana === "object") {
				return typeof obj.custom.RSMana.GrowthChance === "number" ? obj.custom.RSMana.GrowthChance : 0;
			}
			return 0;
		},

		// Obj is CommandParameterChange, Item, State, or TurnState.
		// Would normally add to mana from items and stuff.
		getDopingParameter: function (obj) {
			// However, nothing boosts it like this due to the difficulty of handling it internally
			return 0;
		},

		getMaxValue: function (unit) {
			if (typeof unit.custom.RSMana === "object") {
				return typeof unit.custom.RSMana.Cap === "number" ? unit.custom.RSMana.Cap : 0;
			}
			return 0;
		},

		getMinValue: function (unit) {
			return 0;
		},

		getParameterName: function () {
			var text = "Mana"
			if (typeof root.getMetaSession().global.RSManaParamName === "string"){
				text = root.getMetaSession().global.RSManaParamName;
			}
			return text;
		},

		_getAssistValue: function (parameterObject) {
			//no need. not even sure what this does tbh.
			return 0;
		},

		isParameterDisplayable: function (unitStatusType) {
			return unitStatusType !== UnitStatusType.UNITMENU;
		},

		isParameterRenderable: function () {
			return false;
		}
	}
);

var RSManaSystem_InsertManaParam01 = ParamGroup._configureUnitParameters;
ParamGroup._configureUnitParameters = function (groupArray) {
	RSManaSystem_InsertManaParam01.call(this, groupArray);
	//insert next to MHP
	groupArray.insertObject(UnitParameter.Mana, groupArray.indexOf(UnitParameter.MHP));
}

var RSManaSystem_InsertManaParam02 = ParameterControl.changeParameter;
ParameterControl.changeParameter = function (unit, index, growthValue) {
	if (ParamGroup.getParameterName(index) === UnitParameter.Mana.getParameterName()) {
		if (typeof unit.custom.RSMana !== "object") {
			RS_ManaControl.setupUnit(unit);
		}
	}
	RSManaSystem_InsertManaParam02.call(this, unit, index, growthValue);
}

var RSManaSystem_InsertManaParam03 = ExperienceControl._createGrowthArray;
ExperienceControl._createGrowthArray = function (unit) {
	var result = RSManaSystem_InsertManaParam03.call(this, unit);
	for (var count = 0; count < result.length; count++) {
		if (ParamGroup.getParameterName(count) === "Mana") {
			// Set the value to the actual mana increment.
			result[count] = unit.custom.RSMana.Increment;
		}
	}
	return result;
}

var RSManaSystem_InsertManaParam04 = RestrictedExperienceControl._createObjectArray;
RestrictedExperienceControl._createObjectArray = function (unit) {
	var result = RSManaSystem_InsertManaParam04.call(this, unit);
	for (var count = 0; count < result.length; count++) {
		if (ParamGroup.getParameterName(result[count].index) === "Mana") {
			result[count].percent = unit.custom.RSMana.GrowthChance
			result[count].value = unit.custom.RSMana.Increment
		}
	}
	return result;
}

ParamGroup.returnParamList = function () {
	return this._objectArray;
}