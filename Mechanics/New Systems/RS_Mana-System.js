/*
Welcome to the Rena Sage Mana System, a plugin written by Lady Rena.
Written as an English-community accessible replacement to o-to's MP/SP script,
this is an "alpha" release of the script. It is certainly missing some features.

However, currently, it does not force anything on the user. Setting no parameters will
not cause the game to utilize any of the plugin beyond setting a new Unit Bottom Window.
This window will feature some VERY barebones Mana information. It will be expanded in due time.

Currently, you must set custom parameters on each object, as below, to use the plugin:

-Units & Classes:
--Max: The maximum Mana a unit has. Default is 100.
--Cap: The maximum "Maximum Mana" a unit can ever have. Default is 300.
--Regen: How much they gain each turn. Default is 20% of max.
--The first is a string, RAW or PERCENT, that determine how to add the mana.
--The second is how much mana to add.
--If it's RAW, it adds the mana as a whole number.
--If it's PERCENT, it adds the mana as a percent of max.
{
	RSMana:{
		Max:100,
		Cap:300,
		Regen:["PERCENT",50],
		GrowthChance:40,
		Increment:10
	}
}

-Classes only:
--Cost is the cost of movement. Set it negative to gain mana on move instead.
--Type is the way it drains - or "drains" - mana. Set it to DRAIN or DRAINPERCENT.
--If it's DRAINPERCENT, Cost will act as a percent of max mana.
{
	RSMana:{
		Cost:5,
		Type:"DRAIN",
		Max:100,
		Cap:300,
		Regen:["PERCENT",50],
		GrowthChance:40,
		Increment:10
	}
}

-Weapons & Items:
--Cost: How much it costs to swing this sword or swig this potion.
--Gain: How much you gain by swinging this sword or swigging this potion.
--Type: Can be ADD, ADDPERCENT, DRAIN, or DRAINPERCENT. These should be apparent in effect by now, but...
--ADD increases mana by a raw number of Gain. Incompatible with DRAIN and DRAINPERCENT.
--ADDPERCENT treats Gain as a percent of max mana. Incompatible with DRAIN and DRAINPERCENT.
--DRAIN decreases mana by a raw number of Cost. Incompatible with ADD and ADDPERCENT.
--DRAINPERCENT decreases mana as a percent of max mana. Incompatible with ADD and ADDPERCENT.
{
	RSMana:{
		Cost:10,
		Gain:10,
		Type:"DRAIN"
	}
}

-Weapons only:
--StrikeGain: Can be set as below to regenerate mana based on damage. This will ignore things like Type and Drain.
{
	RSMana:{
		StrikeDrain:true
	}
}

-Custom Items:
The same as above, you can set custom Mana-changing items with the custom keyword "RSMana".
Use the same custom parameters as Weapons & other Items, and it will work out.

This plugin should be fully compatible with AI. If you notice anything amiss, please contact me.

-Lady Rena, July 10th, 2020.
*/

var RS_ManaControl = {
	
	_defaultMana: 100,
	_defaultInc: 10,
	_defaultCap: 300,
	_defaultRegen: 20,
	
	setupMap: function(){
		var list = PlayerList.getSortieList()
		var count = PlayerList.getSortieList().getCount()
		var i;
		for (i = 0; i < count; i++){
			this.setupUnit(list.getData(i))
		}
		list = EnemyList.getAliveList()
		count = list.getCount();
		for (i = 0; i < count; i++){
			this.setupUnit(list.getData(i))
		}
		list = AllyList.getAliveList()
		count = list.getCount()
		for (i = 0; i < count; i++){
			this.setupUnit(list.getData(i))
		}
	},
	
	setupUnit: function(unit){
		if (typeof unit.custom.RSMana == 'object'){
			unit.custom.RSMana.Current = unit.custom.RSMana.Max
		}
		else{
			var cls = unit.getClass()
			var manatest = cls.custom.RSMana
			unit.custom.RSMana = {}
			if (typeof manatest === 'object'){
				unit.custom.RSMana.Max = Math.min(manatest.Cap, manatest.Max + (manatest.Increment * (unit.getLv()-1)))
				unit.custom.RSMana.Current = unit.custom.RSMana.Max
				unit.custom.RSMana.Regen = manatest.Regen
				unit.custom.RSMana.Cap = manatest.Cap
				unit.custom.RSMana.Increment = manatest.Increment
			}
			else{
				unit.custom.RSMana.Max = Math.min(this._defaultCap, this._defaultMana + (this._defaultInc * (unit.getLv()-1)))
				unit.custom.RSMana.Current = unit.custom.RSMana.Max
				unit.custom.RSMana.Regen = [,]
				unit.custom.RSMana.Regen[0] = "PERCENT"
				unit.custom.RSMana.Regen[1] = this._defaultRegen;
				unit.custom.RSMana.Cap = this._defaultCap
				unit.custom.RSMana.Increment = this._defaultInc
			}
		}
	},
	
	regenArmy: function(){
		var list = TurnControl.getActorList()
		var count = list != null ? list.getCount() : 0
		var i;
		for (i = 0; i < count; i++){
			this.regenMana(list.getData(i))
		}
	},
	
	increaseMana: function(unit){
		var chance = 40
		if (typeof unit.custom.RSMana != 'object'){
			root.log('no unit mana detected, setting up unit.')
			this.setupUnit(unit)
		}
		if (typeof unit.custom.RSMana.GrowthChance === 'number'){
			chance = Math.round(unit.custom.RSMana.GrowthChance)
		}
		else if (typeof unit.getClass().custom.RSMana.GrowthChance === 'number'){
			chance = Math.round(unit.getClass().custom.RSMana.GrowthChance)
		}
		if (typeof unit.custom.RSMana.Increment == 'number'){
			if (Probability.getProbability(chance)){
				unit.custom.RSMana.Max += unit.custom.RSMana.Increment
				unit.custom.RSMana.Current += unit.custom.RSMana.Increment
			}
		}
		else if (typeof unit.getClass().custom.RSMana.Increment == 'number'){
			if (Probability.getProbability(chance)){
				unit.custom.RSMana.Max += unit.getClass().custom.RSMana.Increment
				unit.custom.RSMana.Current += unit.getClass().custom.RSMana.Increment
				
			}
		}
		else{
			if (Probability.getProbability(chance)){
				unit.custom.RSMana.Max += this._defaultInc
				unit.custom.RSMana.Current += this._defaultInc
				
			}
		}
	},
	
	setMana: function(unit, obj){
		var Types = ["DRAIN", "DRAINPERCENT", "ADD", "ADDPERCENT"]
		if (typeof unit.custom.RSMana != 'object'){
			root.log('no unit mana detected, setting up unit.')
			this.setupUnit(unit)
		}
		else if (typeof obj != 'object'){
			root.log('no mana object detected.')
			return;
		}
		else if (typeof obj.Type != 'string'){
			root.log('no type detected.')
			return;
		}
		var index = Types.indexOf(obj.Type.toUpperCase())
		if (index == -1){
			root.log('incorrect mana set type.')
			return;
		}
		else{
			var choice = Types[index]
			if (choice == "DRAIN"){
				unit.custom.RSMana.Current = Math.min(unit.custom.RSMana.Max,Math.max(0, unit.custom.RSMana.Current - obj.Cost))
			}
			else if (choice == "DRAINPERCENT"){
				unit.custom.RSMana.Current = Math.min(unit.custom.RSMana.Max,Math.max(0, unit.custom.RSMana.Current - Math.round(unit.custom.RSMana.Max*(obj.Cost/100))))
			}
			if (choice == "ADD"){
				unit.custom.RSMana.Current = Math.max(0, Math.min(unit.custom.RSMana.Max, unit.custom.RSMana.Current + obj.Gain))
			}
			else if (choice == "ADDPERCENT"){
				unit.custom.RSMana.Current = Math.Max(0, Math.min(unit.custom.RSMana.Max, unit.custom.RSMana.Current + Math.round(unit.custom.RSMana.Max*(obj.Gain/100))))
			}
		}
	},
	
	strikeGain: function(unit, amt){
		if (typeof unit.custom.RSMana != 'object'){
			this.setupUnit(unit)
		}
		if (typeof amt != 'number'){
			root.log('non number, regen strike stopped.')
			return;
		}
		unit.custom.RSMana.Current = Math.max(0, Math.min(unit.custom.RSMana.Max, unit.custom.RSMana.Current + amt))
	},
	
	regenMana: function(unit){
		if (typeof unit.custom.RSMana != 'object'){
			this.setupUnit(unit)
		}
		if (unit.custom.RSMana.Regen[0].toUpperCase() == "PERCENT"){
			unit.custom.RSMana.Current = Math.min(unit.custom.RSMana.Max, unit.custom.RSMana.Current + (unit.custom.RSMana.Max * (unit.custom.RSMana.Regen[1]/100)))
			root.log('hi')
		}
		else if (unit.custom.RSMana.Regen[0].toUpperCase() == "RAW"){
			unit.custom.RSMana.Current = Math.min(unit.custom.RSMana.Max, unit.custom.RSMana.Current + unit.custom.RSMana.Regen[1])
		}
	}
}


var Mana01 = ItemPackageControl.getCustomItemSelectionObject;
ItemPackageControl.getCustomItemSelectionObject = function(item, keyword) {
	if (keyword === "RSMana"){
		return ManaItemSelection;
	}
	return Mana01.call(this,item,keyword);
};

ManaItemSelection = defineObject(BaseItemSelection,
{
}
);

var Mana02 = ItemPackageControl.getCustomItemAvailabilityObject;
ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword){
	if (keyword === "RSMana"){
		return ManaItemAvailability;
	}
	return Mana02.call(this,item,keyword);
};

ManaItemAvailability = defineObject(BaseItemAvailability,
{
	isItemAllowed: function(unit, targetUnit, item) {
		if (typeof targetUnit.custom.RSMana == 'obj' && typeof item.custom.RSMana == 'obj'){
			if (typeof item.custom.RSMana.Cost == 'number' && item.custom.RSMana.Cost > targetUnit.custom.RSMana.Current){
				return false;
			}
			else if (typeof item.custom.RSMana.Gain == 'number' && targetUnit.custom.RSMana.Current === targetUnit.custom.RSMana.Max){
				return false;
			}
		}
		return true;
	}
}
);

var Mana03 = ItemPackageControl.getCustomItemUseObject;
ItemPackageControl.getCustomItemUseObject = function(item, keyword){
	if (keyword === "RSMana"){
		return ManaItemUse;
	}
	return Mana03.call(this,item,keyword);
};

ManaItemUse = defineObject(BaseItemUse,
{
	
	_dynamicEvent: null,
	
	enterMainUseCycle: function(itemUseParent) {
		var generator;
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item
		var unit = itemTargetInfo.targetUnit
		var recoveryInfo = item.getRecoveryInfo();
		var type = item.getRangeType();
		var plus = 0
		var ManaObj = item.custom.RSMana;
		var anime = this._getItemRecoveryAnime(itemTargetInfo)
		this._dynamicEvent = createObject(DynamicEvent);
		generator = this._dynamicEvent.acquireEventGenerator();
		
		if (type !== SelectionRangeType.SELFONLY) {
			generator.locationFocus(unit.getMapX(), unit.getMapY(), true);
		}
		var Pos = LayoutControl.getMapAnimationPos(unit.getMapX(), unit.getMapY(), anime)
		generator.animationPlay(anime, Pos.x, Pos.y, false, AnimePlayType.SYNC, 0)
		RS_ManaControl.setMana(unit, ManaObj)
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

var Mana04 = ItemPackageControl.getCustomItemAIObject;
ItemPackageControl.getCustomItemAIObject = function(item, keyword){
	if (keyword === "RSMana"){
		return ManaItemAI;
	}
	return Mana04.call(this,item,keyword);
};

var ManaItemAI = defineObject(BaseItemAI,
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
		var manaobj = combination.item.RSMana;
		var unitobj = combination.targetUnit.custom.RSMana;
		if (typeof manaobj != 'object' || typeof unitobj != 'object'){
			return -1;
		}
		var Mana = 0
		if (typeof manaobj.Gain == 'number' && manaobj.Type == "ADDPERCENT"){
			Mana = Math.min(unitobj.Max, unitobj.Max*(manaobj.Gain/100)+unitobj.Current)
		}
		else if (typeof manaobj.Gain == 'number' && manaobj.Type == "ADD"){
			Mana = Math.min(unitobj.Max, manaobj.Gain+unitobj.Current)
		}
		if (typeof manaobj.Cost == 'number' && manaobj.Type == "DRAINPERCENT"){
			Mana += Math.max(0, unitobj.Max*(manaobj.Cost/100)-unitobj.Current)
		}
		else if (typeof manaobj.Cost == 'number' && manaobj.Type == "DRAIN"){
			Mana += Math.max(0, manaobj.Cost-unitobj.Current)
		}
		else{
			Mana = 0
		}
		return Mana
	},
	
	_getScore: function(unit, combination) {
		var target = combination.targetUnit
		var item = combination.item
		var manaobj = item.custom.RSMana
		var targetobj = target.custom.RSMana
		if (typeof manaobj != 'object' || typeof targetobj != 'object'){
			return AIValue.MIN_SCORE;
		}
		else if (targetobj.Current === targetobj.Max){
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
ItemPackageControl.getCustomItemInfoObject = function(item, keyword){
	if (keyword === "RSMana"){
		return ManaItemInfo;
	}
	return Mana05.call(this,item,keyword);
};

ManaItemInfo = defineObject(BaseItemInfo,
{
	drawItemInfoCycle: function(x, y) {
		if (typeof this._item.custom.RSMana != 'object'){
			ItemInfoRenderer.drawKeyword(x, y, "Please setup this this._item.")
		}
		else{
			if (typeof this._item.custom.RSMana.Gain == 'number'){
				if (this._item.custom.RSMana.Type.toUpperCase() == "ADDPERCENT" || this._item.custom.RSMana.Type.toUpperCase() == "ADD"){
					ItemInfoRenderer.drawKeyword(x, y, "Mana Restorative")
				}
			}
			else if (typeof this._item.custom.RSMana.Cost == 'number'){
				if (this._item.custom.RSMana.Type.toUpperCase() == "DRAINPERCENT" || this._item.custom.RSMana.Type.toUpperCase() == "DRAIN"){
					ItemInfoRenderer.drawKeyword(x, y, "Mana Drainer")
				}
			}
			else{
				ItemInfoRenderer.drawKeyword(x, y, "Improperly configured.");
			}
			y += ItemInfoRenderer.getSpaceY();
			this._drawValue(x, y);
		}
		
	},
	
	getInfoPartsCount: function() {
		var count = 2;
		if (typeof this._item.custom.RSMana != 'object'){
			return count;
		}
		if (typeof this._item.custom.RSMana.Gain == 'number' || typeof this._item.custom.RSMana.Cost == 'number'){
			count += 1
		}
		return count;
	},
	
	_drawValue: function(x, y) {
		var TUI = root.queryTextUI('default_window');
		var FONT = TUI.getFont();
		var COLOR = TUI.getColor();
		if (typeof this._item.custom.RSMana.Gain == 'number'){
			ItemInfoRenderer.drawKeyword(x, y, "Mana Heal");
			x += Math.floor(TextRenderer.getTextWidth("Mana Heal", FONT)+5)
			if (this._item.custom.RSMana.Type.toUpperCase() == "ADDPERCENT"){
				NumberRenderer.drawRightNumber(x, y, this._item.custom.RSMana.Gain);
				x += Math.floor(TextRenderer.getTextWidth(this._item.custom.RSMana.Gain.toString(), FONT)+5)
				TextRenderer.drawSingleCharacter(x, y+3, "%", COLOR, FONT);
			}
			else if (this._item.custom.RSMana.Type.toUpperCase() == "ADD"){
				NumberRenderer.drawRightNumber(x, y, this._item.custom.RSMana.Gain);
			}
		}
		else if (typeof this._item.custom.RSMana.Cost == 'number'){
			ItemInfoRenderer.drawKeyword(x, y, 'Mana Cost')
			x += Math.floor(TextRenderer.getTextWidth("Mana Cost", FONT)+5)
			if (this._item.custom.RSMana.Type.toUpperCase() == "DRAINPERCENT"){
				NumberRenderer.drawRightNumber(x, y, this._item.custom.RSMana.Cost);
				x += Math.floor(TextRenderer.getTextWidth(this._item.custom.RSMana.Cost.toString(), FONT)+5)
				TextRenderer.drawSingleCharacter(x, y+3, "%", COLOR, FONT);
			}
			else if (this._item.custom.RSMana.Type.toUpperCase() == "DRAIN"){
				NumberRenderer.drawRightNumber(x, y, this._item.custom.RSMana.Cost);
			}
		}
		x += 40;
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType());
	},
	
	drawRange: function(x, y, rangeValue, rangeType) {
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		
		ItemInfoRenderer.drawKeyword(x, y, root.queryCommand('range_capacity'));
		x += TextRenderer.getTextWidth(root.queryCommand('range_capacity'), font)+5
		
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
ItemPackageControl.getCustomItemPotencyObject = function(item, keyword){
	if (keyword === "RSMana"){
		return ManaItemPotency;
	}
	return Mana06.call(this,item,keyword);
};

var ManaItemPotency = defineObject(BaseItemPotency,
{
}
);

var ManaSentenceWindow = defineObject(BaseMenuBottomWindow,
{
	
	setUnitMenuData: function(unit) {
	},
	
	changeUnitMenuTarget: function(unit){
		var i, count;
		
		this._unit = unit;
		
		this._groupArray = [];
		this._configureSentence(this._groupArray);
		
		count = this._groupArray.length;
		for (i = 0; i < count; i++) {
			this._groupArray[i].setParentWindow(this);
			this._groupArray[i].setValues(unit, ItemControl.getEquippedWeapon(unit), this._totalStatus);
		}
	},
	
	drawWindowContent: function(x, y) {
		var i;
		var count = this._groupArray.length;
		
		for (i = 0; i < count; i++) {
			this._groupArray[i].drawUnitSentence(x, y, this._unit, this._weapon, this._totalStatus);
			y += this._groupArray[i].getUnitSentenceCount(this._unit) * this.getUnitSentenceSpaceY();
		}
	},
	
	isHelpMode: function(){
		return false;
	},
	
	isTracingHelp: function(){
		return false;
	},
	
	_configureSentence: function(groupArray) {
		groupArray.appendObject(ManaSentence.ManaInfo)
	},
	
	getUnitSentenceSpaceY: function() {
		return 25;
	}
}
);

var BaseManaSentence = defineObject(BaseUnitSentence,
{
	_unitSentenceWindow: null,
	
	setParentWindow: function(unitSentenceWindow) {
		this._unitSentenceWindow = unitSentenceWindow;
	},
	
	getUnitSentenceCount: function(unit) {
		return 1;
	}
}
);

var ManaSentence = {}

ManaSentence.ManaInfo = defineObject(BaseManaSentence,
{
	_cur: 0,
	_max: 0,
	_weapon: null,
	
	setParentWindow: function(unitSentenceWindow) {
		this._unitSentenceWindow = unitSentenceWindow;
	},
	
	setValues: function(unit, weapon, totalStatus) {
		if (unit != null && typeof unit.custom.RSMana === 'object'){
			this._max = unit.custom.RSMana.Max			
			this._cur = unit.custom.RSMana.Current
		}
		if (weapon != null){
			this._weapon = weapon;
		}
	},
	
	drawUnitSentence: function(x, y, unit, weapon, totalStatus) {
		var value = 0;
		var isValid = false
		if (unit != null && typeof unit.custom.RSMana === 'object'){
			isValid = true
		}
		this.drawAbilityText(x, y, "Max Mana", this._max, isValid);
		this.drawAbilityText(x, y+25, "Cur. Mana", this._cur, isValid);
		this.drawWeaponText(x, y+50, this._weapon != null);
	},
	
	getUnitSentenceCount: function(unit) {
		return 2;
	},
	
	drawAbilityText: function(x, y, text, value, isValid) {
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
			NumberRenderer.drawNumberColor(x+20, y, value, colorIndex, 255);
		}
		else {
			TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
		}
	},
	
	drawWeaponText: function(x, y, isValid) {
		var textui = this.getUnitSentenceTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var colorIndex = 1;
		var length = -1;
		
		if (this._weapon === null || typeof this._weapon.custom.RSMana != 'object'){
			isValid = false;
		}
		else{
			value = typeof this._weapon.custom.RSMana.Cost == 'number' ? this._weapon.custom.RSMana.Cost : typeof this._weapon.custom.RSMana.Gain == 'number' ? this._weapon.custom.RSMana.Gain : 0
			text = typeof this._weapon.custom.RSMana.Gain == 'number' ? "Atk Gain" : "Atk Cost"
		}
		TextRenderer.drawKeywordText(x, y, text, length, color, font);
		x += 78;
		
		if (isValid) {
			if (value < 0) {
				TextRenderer.drawSignText(x - 37, y, ' - ');
				value *= -1;
			}
			NumberRenderer.drawNumberColor(x+20, y, value, colorIndex, 255);
		}
		else {
			TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
		}
	}
}
);

var DrawMana01 = UnitMenuScreen._configureBottomWindows;
UnitMenuScreen._configureBottomWindows = function(groupArray) {
	DrawMana01.call(this, groupArray);
	groupArray.appendWindowObject(ManaSentenceWindow, this);
};

var SpendMana01 = ItemControl.decreaseLimit;
ItemControl.decreaseLimit = function(unit, item) {
	SpendMana01.call(this, unit, item);
	if (typeof item.custom.RSMana == 'object'){
		if (!item.isWeapon() && item.getCustomKeyword() == "RSMana"){
			return;
		}
		if (item.custom.RSMana.StrikeGain){
			return;
		}
		RS_ManaControl.setMana(unit, item.custom.RSMana)
	}
};

var SpendManaTemp = SimulateMove._endMove;
SimulateMove._endMove = function(unit) {
	SpendManaTemp.call(this, unit);
	var manaclass = typeof unit.getClass().custom.RSMana == 'object' ? unit.getClass().custom.RSMana : null
	var manaskill = SkillControl.getPossessionCustomSkill(unit, "SaveManaMove")
	if (manaclass != null){
		var manacopy = {}
		manacopy.Type = manaclass.Type
		manacopy.Cost = manaclass.Cost
		if (manaskill && typeof manaskill.custom.RSMana == 'object'){
			if (manaskill.custom.MoveSaveType.toUpperCase() == "PERCENT"){
				manacopy.Cost = Math.round(manacopy.Cost*(manaskill.custom.MoveSave/100))
			}
			else if (manaskill.custom.MoveSaveType.toUpperCase() == "RAW"){
				manacopy.Cost = manacopy.Cost - manaskill.custom.MoveSave
			}
		}
		manacopy.Cost = Math.round(unit.getMostResentMov()*manacopy.Cost)
		unit.custom.CopyCatMana = manacopy
	}
};

var SpendMana02 = MapSequenceCommand._doLastAction;
MapSequenceCommand._doLastAction = function(){
	var result = SpendMana02.call(this)
	var manacopy = typeof this._targetUnit.custom.CopyCatMana == 'object' ? this._targetUnit.custom.CopyCatMana : null
	if (manacopy != null && result in [0, 1]){
		RS_ManaControl.setMana(this._targetUnit, manacopy)
	}
	delete this._targetUnit.custom.CopyCatMana
	return result;
};

var ManaLimitsMovementRS = UnitRangePanel._getRangeMov;
UnitRangePanel._getRangeMov = function(unit) {
	var mov = ManaLimitsMovementRS.call(this, unit)
	var cost;
	var manaclass = typeof unit.getClass().custom.RSMana == 'object' ? unit.getClass().custom.RSMana : null
	if (unit.isMovePanelVisible()) {
		if (manaclass != null){
			if (manaclass.Type == "DRAINPERCENT"){
				cost = Math.round(unit.custom.RSMana.Max*(manaclass.Cost/100))
			}
			else{
				cost = manaclass.Cost
			}
			var manaskill = SkillControl.getPossessionCustomSkill(unit, "SaveManaMove")
			if (manaskill && typeof manaskill.custom.RSMana == 'object'){
				if (manaskill.custom.MoveSaveType.toUpperCase() == "PERCENT"){
					cost = Math.round(cost*(manaskill.MoveSave/100))
				}
			}
			while (mov*cost > unit.custom.RSMana.Current){
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
UnitProvider.recoveryPrepareUnit = function(unit){
	ManaSetup01.call(this, unit);
	RS_ManaControl.setupUnit(unit)
};

var ManaSetup02 = ScriptCall_AppearEventUnit;
ScriptCall_AppearEventUnit = function(unit){
	ManaSetup02.call(this, unit);
	RS_ManaControl.setupUnit(unit)
};

var ManaSetup03 = ReinforcementChecker._appearUnit;
ReinforcementChecker._appearUnit = function(pageData, x, y){
	RS_ManaControl.setupUnit(pageData.getSourceUnit())
	return ManaSetup03.call(this, pageData, x, y);
};
	
var ManaSetup04 = OpeningEventFlowEntry._checkUnitParameter;
OpeningEventFlowEntry._checkUnitParameter = function(){
	ManaSetup04.call(this);
	RS_ManaControl.setupMap()
};

var RegenerationIsLive01 = TurnControl.turnEnd
TurnControl.turnEnd = function(){
	RegenerationIsLive01.call(this)
	if (root.getBaseScene() === SceneType.FREE) {
		RS_ManaControl.regenArmy()
	}
}

var ManaBanList01 = ItemControl.isWeaponAvailable
ItemControl.isWeaponAvailable = function(unit, item){
	var result = ManaBanList01.call(this, unit, item);
	if (typeof unit.custom.RSMana != 'object'){
		return result;
	}
	else if (result && typeof item.custom.RSMana == 'object'){
		if (typeof item.custom.RSMana.Type === 'string' && item.custom.RSMana.Type.toUpperCase() in ["ADD", "ADDPERCENT"]){
			return true;
		}
		else if (typeof item.custom.RSMana.Type === 'string' && item.custom.RSMana.Type.toUpperCase() == 'DRAINPERCENT'){
			if (unit.custom.RSMana.Current < Math.round(unit.custom.RSMana.Max*(item.custom.RSMana.Cost/100))){
				return false;
			}
		}
		else if (typeof item.custom.RSMana.Type === 'string' && item.custom.RSMana.Type.toUpperCase() == 'DRAIN' && unit.custom.RSMana.Current < item.custom.RSMana.Cost){
			return false;
		}
		return true;
	}
	return result;
}

var GrowMana01 = ExperienceControl._addExperience
ExperienceControl._addExperience = function(unit, getExp) {
	var result = GrowMana01.call(this, unit, getExp)
	if (result && typeof unit.custom.RSMana == 'object'){
		RS_ManaControl.increaseMana(unit)
	}
	return result;
};

var SpendMana03 = AttackEvaluator.HitCritical.evaluateAttackEntry;
AttackEvaluator.HitCritical.evaluateAttackEntry = function(virtualActive, virtualPassive, attackEntry) {
	SpendMana03.call(this, virtualActive, virtualPassive, attackEntry)
	if (attackEntry.isHit){
		var active = virtualActive.unitSelf
		var weapon = ItemControl.getEquippedWeapon(active)
		if (typeof active.custom.RSMana === 'object' && weapon != null && typeof weapon.custom.RSMana == 'object' && weapon.custom.RSMana.StrikeGain){
			RS_ManaControl.strikeGain(active, attackEntry.damagePassive)
		}
	}
};