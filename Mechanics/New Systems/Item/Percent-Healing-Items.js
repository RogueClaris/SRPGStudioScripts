/*
To use this script, create a custom item with the Keyword "Percent".
Give it a Custom PARAMETER that is {Heal:#}, where # is the percent
you want to heal by. E.g. 33% is {Heal:33}, 50% is {Heal:50}, etc.

Enjoy the script!
-LadyRena, 8/8/2019.
*/

var PI001 = ItemControl.isItemUsable;
ItemControl.isItemUsable = function(unit, item) {
	var result = PI001.call(this,unit,item);
	if (!item.isWeapon() && item.getCustomKeyword() === "Percent"){
		return true;
	}
	return result;
};

var PI002 = ItemPackageControl.getCustomItemSelectionObject;
ItemPackageControl.getCustomItemSelectionObject = function(item, keyword) {
	
	if (keyword === "Percent"){
		return PercentItemSelection;
	}
	
	return PI002.call(this,item,keyword);
};

var PI003 = ItemPackageControl.getCustomItemAvailabilityObject;
ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword){
	if (keyword === "Percent"){
		return PercentItemAvailability;
	}
	return PI003.call(this,item,keyword);
};

var PI004 = ItemPackageControl.getCustomItemUseObject;
ItemPackageControl.getCustomItemUseObject = function(item, keyword){
	if (keyword === "Percent"){
		return PercentItemUse;
	}
	return PI004.call(this,item,keyword);
};

var PI005 = ItemPackageControl.getCustomItemAIObject;
ItemPackageControl.getCustomItemAIObject = function(item, keyword){
	if (keyword === "Percent"){
		return PercentItemAI;
	}
	return PI005.call(this,item,keyword);
};

var PI006 = ItemPackageControl.getCustomItemInfoObject;
ItemPackageControl.getCustomItemInfoObject = function(item, keyword){
	
	if (keyword === "Percent"){
		return PercentItemInfo
	}
	
	return PI006.call(this,item,keyword)
};

var PI007 = ItemPackageControl.getCustomItemPotencyObject;
ItemPackageControl.getCustomItemPotencyObject = function(item, keyword){
	
	if (keyword === "Percent"){
		return PercentItemPotency
	}
	
	return PI007.call(this,item,keyword)
};

var PercentItemSelection = defineObject(BaseItemSelection,
{
}
);

var PercentItemUse = defineObject(BaseItemUse,
{
	_dynamicEvent: null,
	
	enterMainUseCycle: function(itemUseParent) {
		var generator;
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var recoveryInfo = itemTargetInfo.item.getRecoveryInfo();
		var type = itemTargetInfo.item.getRangeType();
		var plus = Calculator.calculatePercentItemPlus(itemTargetInfo.unit, itemTargetInfo.targetUnit, itemTargetInfo.item);
		var Health = Math.round(RealBonus.getMhp(itemTargetInfo.targetUnit) * (itemTargetInfo.item.custom.Heal / 100))
		this._dynamicEvent = createObject(DynamicEvent);
		generator = this._dynamicEvent.acquireEventGenerator();
		
		if (type !== SelectionRangeType.SELFONLY) {
			generator.locationFocus(itemTargetInfo.targetUnit.getMapX(), itemTargetInfo.targetUnit.getMapY(), true);
		}
		
		generator.hpRecovery(itemTargetInfo.targetUnit, this._getItemRecoveryAnime(itemTargetInfo), Health + plus, RecoveryType.SPECIFY, itemUseParent.isItemSkipMode());
		
		return this._dynamicEvent.executeDynamicEvent();
	},
	
	moveMainUseCycle: function() {
		return this._dynamicEvent.moveDynamicEvent();
	},
	
	_getItemRecoveryAnime: function(itemTargetInfo) {
		return itemTargetInfo.item.getItemAnime();
	}
}
);

var PercentItemInfo = defineObject(BaseItemInfo,
{
	drawItemInfoCycle: function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, "Percent Healing Item");
		y += ItemInfoRenderer.getSpaceY();
		
		this._drawValue(x, y);
	},
	
	getInfoPartsCount: function() {
		return 2;
	},
	
	_drawValue: function(x, y) {
		var TUI = root.queryTextUI('default_window');
		var FONT = TUI.getFont();
		var COLOR = TUI.getColor();
		ItemInfoRenderer.drawKeyword(x, y, StringTable.Recovery_Value);
		x += TextRenderer.getTextWidth(StringTable.Recovery_Value, FONT) * 2
		NumberRenderer.drawRightNumber(x, y, this._item.custom.Heal);
		x += 20
		TextRenderer.drawSingleCharacter(x, y+3, "%", COLOR, FONT);
		x += 40;
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType());
	}
}
);

var PercentItemPotency = defineObject(BaseItemPotency,
{
	_value: 0,
	
	setPosMenuData: function(unit, item, targetUnit) {
		var plus = Calculator.calculatePercentItemPlus(unit, targetUnit, item);
		var Health = item.custom.Heal
		this._value = Calculator.calculatePercentRecoveryValue(targetUnit, Health, RecoveryType.SPECIFY, plus);
	},
	
	drawPosMenuData: function(x, y, textui) {
		var font = textui.getFont();
		
		TextRenderer.drawKeywordText(x, y, this.getKeywordName(), -1, ColorValue.KEYWORD, font);
		NumberRenderer.drawNumber(x + 65, y, this._value);
	},
	
	getKeywordName: function() {
		return StringTable.Recovery_Value;
	}
}
);

var PercentItemAvailability = defineObject(BaseItemAvailability,
{
	isItemAllowed: function(unit, targetUnit, item) {
		// The unit who doesn't reduce HP is not a target.
		return targetUnit.getHp() !== ParamBonus.getMhp(targetUnit);
	}
}
);

var PercentItemAI = defineObject(BaseItemAI,
{
	getItemScore: function(unit, combination) {
		var value;
		var score = this._getScore(unit, combination);
		
		if (score < 0) {
			return score;
		}
		
		value = this._getValue(unit, combination);
		
		score += Miscellaneous.convertAIValue(value);
		
		return score;
	},
	
	_getValue: function(unit, combination) {
		var plus = Calculator.calculatePercentItemPlus(unit, combination.targetUnit, combination.item);
		var Health = Math.round(RealBonus.getMhp(combination.targetUnit) * (combination.item.custom.Heal / 100))
		var recoveryInfo = combination.item.getRecoveryInfo();
		return Calculator.calculateRecoveryValue(combination.targetUnit, Health, RecoveryType.SPECIFY, plus);
	},
	
	_getScore: function(unit, combination) {
		var baseHp;
		var maxHp = ParamBonus.getMhp(combination.targetUnit);
		var currentHp = combination.targetUnit.getHp();
		if (currentHp === maxHp) {
			return AIValue.MIN_SCORE;
		}
		// The unit who terribly reduced HP is prioritized.
		return 50-Math.floor(100*(currentHp/maxHp))
	}
}
);

Calculator.calculatePercentItemPlus = function(unit, targetUnit, item) {
	return 0;
};
Calculator.calculatePercentRecoveryValue = function(unit, health, type, plus) {
	var n = 0;
	var MHP = ParamBonus.getMhp(unit);
	health = Math.round(MHP*(health/100))
	n = health + plus;
	if (n > MHP) {
		n = MHP;
	}
	
	return n;
};