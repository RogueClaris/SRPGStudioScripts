/*
Hello and welcome to the Summon Items script! The name isn't fully clear on what it does,
but this script enables a custom type of Item that can summon a Unit from the Player Database.

This has no limit beyond the item's use limit. There is currently no code in place to limit the
number of allies you - or the AI! - can summon. Yes, you read that properly - the AI can use them!

To use, do the following:
-Create a reserved Player Database unit. Set them up as you want them to be summoned.
-Create an item and set "item type" to Custom, with the keyword "RS_Summon".
-Set the Custom Parameters as follows on the item:

{
	UnitID:#, 
	RARITY:#,
	SummonedText:"Daniel",
	RS_SummonCost:#, 
	RS_SummonPercent:true,
	RandomAmount:5,
	MatchSummonLevel:true
}

UnitID is necessary, where # is the ID of the Player you are copying from the Database.

RARITY is optional, and if set, it will increase the item score for the AI by RARITY times
two, making certain Summon items more likely to be used than others. If it is not set, it
is treated as 0. It will be drawn on the item's info to indicate how powerful the staff is, as well.

RS_SummonCost is an amount of HP to pay when casting a Summon. This may be set to a percent with
RS_SummonPercent:true

If RS_SummonPercent is set to true, then RS_SummonCost will be divided by 100, then multiplied by
your unit's max HP, then rounded before being subtracted from their current. In short, if you set
it the above two parameters to 15 and true, you will pay 15% of a unit's Max HP to summon.

RandomAmount adds an additional amount of summons to the summoning pool. In the example, it is set
to 5. This will summon 0-5 additional units.

SummonedText is optional. It will be displayed on the item as "Summoned", showing what it brings
to the map.

MatchSummonLevel is also optional, but if explicitly set to true, it will set the level of summoned units
to the level of the summoner, using their growths to adjust stats.

That should be everything. Please enjoy the script.
-Rogue Claris, May 20th, 2021 (Updated)
*/

var SI001 = ItemControl.isItemUsable;
ItemControl.isItemUsable = function(unit, item) {
	var result = SI001.call(this,unit,item);
	if (result){
		if (item.getCustomKeyword() === "RS_Summon" && typeof item.custom.UnitID === 'number'){
			if (item.custom.UnitID > root.getBaseData().getPlayerList().getCount()-1){
				return false;
			}
			else{
				return true;
			}
		}
	}
	return result;
};

var SI002 = ItemPackageControl.getCustomItemSelectionObject;
ItemPackageControl.getCustomItemSelectionObject = function(item, keyword) {
	
	if (keyword === "RS_Summon"){
		return SummonItemSelection;
	}
	
	return SI002.call(this,item,keyword);
};

var SI003 = ItemPackageControl.getCustomItemAvailabilityObject;
ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword){
	if (keyword === "RS_Summon"){
		return SummonItemAvailability;
	}
	return SI003.call(this,item,keyword);
};

var SI004 = ItemPackageControl.getCustomItemUseObject;
ItemPackageControl.getCustomItemUseObject = function(item, keyword){
	if (keyword === "RS_Summon"){
		return SummonItemUse;
	}
	return SI004.call(this,item,keyword);
};

var SI005 = ItemPackageControl.getCustomItemAIObject;
ItemPackageControl.getCustomItemAIObject = function(item, keyword){
	if (keyword === "RS_Summon"){
		return SummonItemAI;
	}
	return SI005.call(this,item,keyword);
};

var SummonItemSelectionMode = {
	POSSELECT: 0
};

var SummonItemSelection = defineObject(BaseItemSelection,
{
	_isSingleMode: true,
	_posCursor: null,
	
	setInitialSelection: function() {
		this._changePosSelect();
		return EnterResult.OK;
	},
	
	moveItemSelectionCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === SummonItemSelectionMode.POSSELECT) {
			result = this._movePosSelect();
		}
		
		if (result === MoveResult.END) {
			this._posSelector.endPosSelector();
		}

		return result;
	},

	drawItemSelectionCycle: function() {
		var pos;
		var mode = this.getCycleMode();
		
		this._posSelector.drawPosSelector();
		
		if (mode === SummonItemSelectionMode.POSSELECT && this._targetUnit !== null) {
			pos = this._posSelector.getSelectorPos();
		}
	},
	
	isPosSelectable: function() {
		var pos;
		var mode = this.getCycleMode();
		
		if (mode === SummonItemSelectionMode.POSSELECT) {
			pos = this._posSelector.getSelectorPos(true);
			if (pos === null) {
				return false;
			}
			
			return PosChecker.getUnitFromPos(pos.x, pos.y) === null;
		}
		
		return true;
	},
	
	_movePosSelect: function() {
		var result = this._posSelector.movePosSelector();
		
		if (result === PosSelectorResult.SELECT) {
			if (this.isPosSelectable()) {
				this._targetPos = this._posSelector.getSelectorPos(false);
				this._isSelection = true;
				return MoveResult.END;
			}
		}
		else if (result === PosSelectorResult.CANCEL) {
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_changePosSelect: function() {
		this.setPosSelection();
		this.changeCycleMode(SummonItemSelectionMode.POSSELECT);
	},
	
	setPosSelection: function() {
		var indexArray = [];
		var rangeValue = 1
		
		indexArray = this._getMultiTeleportationIndexArray(rangeValue);
		
		this._posSelector.setPosSelectorType(PosSelectorType.FREE);
		this._posSelector.setPosOnly(this._unit, this._item, indexArray, PosMenuType.Item);
	},
	
	_getMultiTeleportationIndexArray: function(rangeValue) {
		var i, index, x, y;
		var indexArrayNew = [];
		var indexArray = IndexArray.getBestIndexArray(this._unit.getMapX(), this._unit.getMapY(), 1, rangeValue);
		var count = indexArray.length;
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			if (this._isPosEnabled(x, y, this._targetUnit)) {
				indexArrayNew.push(index);
			}
		}
		
		return indexArrayNew;
	},
	
	_isPosEnabled: function(x, y, targetUnit) {
		// Cannot instantly move to the position where the unit exists.
		if (PosChecker.getUnitFromPos(x, y) !== null) {
			return false;
		}
		
		// Cannot instantly move to the position where the unit cannot go through.
		if (PosChecker.getMovePointFromUnit(x, y, targetUnit) === 0) {
			return false;
		}
		
		return true;
	}
	
}
);

var SummonControl = {
	getSummonPos: function(unit, targetUnit, item) {
		var curUnit = unit
		var parentIndexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, 1);
		
		// Call a getNearbyPosEx, not the getNearbyPos in order not to return the position beyond the range.
		return PosChecker.getNearbyPosEx(curUnit, targetUnit, parentIndexArray);
	}
}

var SummonItemUseMode = {
	SRC: 0,
	FOCUS: 1,
	DEST: 2,
	END: 3,
	SRCANIME: 4,
	DESTANIME: 5
};

var SummonItemUse = defineObject(BaseItemUse,
{
	_itemUseParent: null,
	_targetUnit: null,
	_targetPos: null,
	_dynamicAnime: null,
	_unit: null,
	
	enterMainUseCycle: function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		
		this._itemUseParent = itemUseParent;
		this._targetPos = itemTargetInfo.targetPos;
		this._unit = itemTargetInfo.unit;
		var TargetList = root.getBaseData().getPlayerList()
		var i, targetUnit;
		for (i = 0; i < TargetList.getCount(); i++){
			if (TargetList.getData(i).getId() === itemTargetInfo.item.custom.UnitID){
				targetUnit = TargetList.getData(i);
			}
		}
		this._targetUnit = root.getObjectGenerator().generateUnitFromBaseUnit(targetUnit);
		this._baseUnit = targetUnit;
		this._targetUnit.setInvisible(true)
		
		// For item use with AI, the position is not always initialized.
		if (this._targetPos === null) {
			this._targetPos = SummonControl.getSummonPos(itemTargetInfo.unit, this._targetUnit, itemTargetInfo.item);
			if (this._targetPos === null) {
				this._itemUseParent.disableItemDecrement();
				return EnterResult.NOTENTER;
			}
		}
		
		if (PosChecker.getUnitFromPos(this._targetPos.x, this._targetPos.y) !== null) {
			// Don't reduce items because the unit exists, so cannot move. 
			this._itemUseParent.disableItemDecrement();
			return EnterResult.NOTENTER;
		}
		
		if (itemUseParent.isItemSkipMode()) {
			this.mainAction();
			return EnterResult.NOTENTER;
		}
		this.changeCycleMode(SummonItemUseMode.FOCUS);
		this._payLife(itemUseParent.getItemTargetInfo());
		return EnterResult.OK;
	},
	
	_payLife: function(info){
		var Unit = info.unit;
		var Item = info.item;
		var Cost = typeof Item.custom.RS_SummonCost == 'number' ? Item.custom.RS_SummonCost : 0;
		var isPercent = Item.custom.RS_SummonPercent;
		var Dynamo = createObject(DynamicEvent);
		var Anime = root.queryAnime('easydamage');
		var Gen = Dynamo.acquireEventGenerator();
		if (!isPercent){
			if (Math.floor(Cost) !== 0){
				Gen.damageHit(Unit, Anime, Math.floor(Cost), DamageType.FIXED, Unit, false);
			}
		}
		else{
			Cost = Math.floor(RealBonus.getMhp(Unit)*Cost/100);
			if (Math.floor(Cost) !== 0){
				Gen.damageHit(Unit, Anime, Math.floor(Cost), DamageType.FIXED, Unit, false);
			}
		}
		Gen.execute()
	},
	
	moveMainUseCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
			
		if (mode === SummonItemUseMode.FOCUS) {
			result = this._moveFocus();
		}
		else if (mode === SummonItemUseMode.DEST) {
			result = this._moveDest();
		}
		else if (mode === SummonItemUseMode.DESTANIME) {
			result = this._moveDestAnime();
		}
		else if (mode === SummonItemUseMode.END) {
			result = this._moveEnd();
		}
		
		return result;
	},
	
	drawMainUseCycle: function() {
		var mode = this.getCycleMode();
		
		if (mode === SummonItemUseMode.DESTANIME) {
			this._dynamicAnime.drawDynamicAnime();
		}
	},
	
	mainAction: function() {
		this._targetUnit.setMapX(this._targetPos.x);
		this._targetUnit.setMapY(this._targetPos.y);
		this._targetUnit.setInvisible(false);
		var generator = root.getEventGenerator()
		var item = this._itemUseParent.getItemTargetInfo().item
		if (this._unit.getUnitType() !== UnitType.PLAYER){
			generator.unitAssign(this._targetUnit, this._unit.getUnitType())
		}
		var levelDiff = this._unit.getLv() - 1;
		if (item.custom.MatchSummonLevel === true){
			generator.experiencePlusEx(this._targetUnit, levelDiff, ExperiencePlusType.LEVEL, true)
		}
		if (typeof item.custom.RandomAmount === 'number'){
			var extraSummons = Math.floor(Math.random()*item.custom.RandomAmount)
			var i = 0;
			var unit, pos;
			while (i < extraSummons){
				pos = PosChecker.getNearbyPos(this._targetUnit, this._targetUnit);
				if (pos !== null){
					unit = root.getObjectGenerator().generateUnitFromBaseUnit(this._baseUnit);
					unit.setInvisible(true);
					unit.setMapX(pos.x);
					unit.setMapY(pos.y);
					unit.setInvisible(false);
					generator.unitAssign(unit, this._unit.getUnitType())
					if (item.custom.MatchSummonLevel === true){
						generator.experiencePlusEx(unit, levelDiff, ExperiencePlusType.LEVEL, true)
					}
				}
				++i;
			}
		}
		generator.execute()
	},
	
	_moveFocus: function() {
		var generator; 
		
		this._targetUnit.setInvisible(true);
		
		generator = root.getEventGenerator();
		generator.locationFocus(this._targetPos.x, this._targetPos.y, true);
		generator.execute();
		
		this.changeCycleMode(SummonItemUseMode.DEST);
		
		return MoveResult.CONTINUE;
	},
	
	_moveDest: function() {
		this._showAnime(this._targetPos.x, this._targetPos.y);
		this.changeCycleMode(SummonItemUseMode.DESTANIME);
		
		return MoveResult.CONTINUE;
	},
	
	_moveDestAnime: function() {
		if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
			this.changeCycleMode(SummonItemUseMode.END);
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveEnd: function() {
		this.mainAction();
		return MoveResult.END;
	},
	
	_showAnime: function(xTarget, yTarget) {
		var x = LayoutControl.getPixelX(xTarget);
		var y = LayoutControl.getPixelY(yTarget);
		var anime = this._itemUseParent.getItemTargetInfo().item.getItemAnime();
		var pos = LayoutControl.getMapAnimationPos(x, y, anime);
		
		this._dynamicAnime = createObject(DynamicAnime);
		this._dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
	}
}
);

var SummonItemPotency = defineObject(BaseItemPotency,
{
}
);

var SummonItemAvailability = defineObject(BaseItemAvailability,
{
	isItemAvailableCondition: function(unit, item) {
		return this._checkOne(unit,item);
	},
	
	_checkOne: function(unit, item) {
		var X = unit.getMapX()
		var Y = unit.getMapY()
		var X1 = X+1
		var Y1 = Y+1
		var X2 = X-1
		var Y2 = Y-1
		if (PosChecker.getUnitFromPos(X1,Y) === null){
			return true;
		}
		if (PosChecker.getUnitFromPos(X2,Y) === null){
			return true;
		}
		if (PosChecker.getUnitFromPos(X,Y1) === null){
			return true;
		}
		if (PosChecker.getUnitFromPos(X,Y2) === null){
			return true;
		}
		return false;
	}
}
);

var SummonItemAI = defineObject(BaseItemAI,
{
	getItemScore: function(unit, combination) {
		var n = combination.item.custom.RARITY != null ? combination.item.custom.RARITY : 0;
		var ID = combination.item.custom.UnitID;
		var Summoned, i;
		var TargetList = root.getBaseData().getPlayerList()
		Summoned = TargetList.getDataFromId(combination.item.custom.UnitID)
		// for (i = 0; i < TargetList.getCount(); i++){
			// if (TargetList.getData(i).getId() === combination.item.custom.UnitID){
				// Summoned = TargetList.getData(i);
			// }
		// }
		return Summoned.getLv() + (n*2);
	},
	
	getActionTargetType: function(unit, item) {
		return ActionTargetType.SINGLE;
	},
	
	getUnitFilter: function(unit, item) {
		return FilterControl.getReverseFilter(unit.getUnitType());
	},
	
	_isUnitTypeAllowed: function(unit, targetUnit) {
		return true;
	}
}
);

var SI006 = ItemPackageControl.getCustomItemInfoObject;
ItemPackageControl.getCustomItemInfoObject = function(item, keyword){
	
	if (keyword === "RS_Summon"){
		return SummonItemInfo
	}
	
	return SI006.call(this,item,keyword)
};

var SummonItemInfo = defineObject(BaseItemInfo,
{
	drawItemInfoCycle: function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, "Summoning Item");
		y += ItemInfoRenderer.getSpaceY();
		
		this._drawValue(x, y);
	},
	
	getInfoPartsCount: function() {
		var count = 1;
		if (typeof this._item.custom.SummonedText === 'string'){
			++count;
		}
		if (typeof this._item.custom.Rarity === 'number'){
			++count;
		}
		return count;
	},
	
	_drawValue: function(x, y) {
		var TUI = root.queryTextUI('default_window');
		var FONT = TUI.getFont();
		var COLOR = TUI.getColor();
		if (typeof this._item.custom.SummonedText === 'string'){
			ItemInfoRenderer.drawKeyword(x, y, "Summoned");
			TextRenderer.drawText(x + TextRenderer.getTextWidth("Summoned", FONT) + 5, y, this._item.custom.SummonedText, -1, COLOR, FONT);
			y += ItemInfoRenderer.getSpaceY();
		}
		if (typeof this._item.custom.Rarity === 'number'){
			ItemInfoRenderer.drawKeyword(x, y, "Rarity");
			x += TextRenderer.getTextWidth("Rarity", FONT) + 5
			TextRenderer.drawText(x, y, this._item.custom.Rarity.toString()+"\u2606", -1, COLOR, FONT);
		}
	}
}
);