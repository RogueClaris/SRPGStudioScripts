/*
Hello and welcome to the Summon Items script! The name isn't fully clear on what it does,
but this script enables a custom type of Item that can summon a Unit from the Player Database.

This has no limit beyond the item's use limit. There is currently no code in place to limit the
number of allies you - or the AI! - can summon. Yes, you read that properly - the AI can use them!

In order for ENEMY units to use this, create an Event Enemy from the Player Unit they will be summoning.
In order for ALLY units to use this, create an Event Ally from the Player Unit they will be summoning.
For either Enemy or Ally summoners, the summoned units name must remain the same as in the player database.

To create the item itself:
-Set "item type" to Custom, with the keyword "RS_Summon".
-Set the Custom Parameter as follows on the item: 
	{UnitID:#}, where # is the ID of the Player you are copying from the Database.
-Optionally, set another Custom Parameter as follows on the item:
	{RARITY:#}

If RARITY is set, it will increase the item score for the AI by RARITY times two, making certain Summon
items more likely to be used than others. If it is not set, it is treated as 0.

Further, you may set two more Custom Parameters on the item as follows:
	{RS_SummonCost:#}, where # is an amount of HP to pay.
	{RS_SummonPercent:true} or {RS_SummonPercent:false}, whether or not to pay the HP as a percentage.
	
If RS_SummonPercent is set to true, then RS_SummonCost will be divided by 100, then multiplied by
your unit's max HP, then rounded before being subtracted from their current. In short, if you set
it the above two parameters to 15 and true, you will pay 15% of a unit's Max HP to summon.

That should be everything. Please enjoy the script.
-Lady Rena, June 14th, 2020.
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
		if (this._unit.getUnitType() === UnitType.PLAYER){
			var TargetList = root.getBaseData().getPlayerList()
			var i, targetUnit;
			for (i = 0; i < TargetList.getCount(); i++){
				if (TargetList.getData(i).getId() === itemTargetInfo.item.custom.UnitID){
					targetUnit = TargetList.getData(i);
				}
			}
		}
		else if (this._unit.getUnitType() === UnitType.ENEMY){
			var MapInfo = root.getCurrentSession().getCurrentMapInfo()
			var TargetList = MapInfo.getListFromUnitGroup(UnitGroup.ENEMYEVENT)
			var UnitList = root.getBaseData().getPlayerList()
			var i, j
			Temp = null;
			for (j = 0; j < UnitList.getCount(); j++){
				if (UnitList.getData(j).getId() === itemTargetInfo.item.custom.UnitID){
					Temp = UnitList.getData(j);
					break;
				}
			}
			if (Temp !== null){
				for (i = 0; i < TargetList.getCount(); i++){
					if (TargetList.getData(i).getName() === Temp.getName()){
						targetUnit = TargetList.getData(i)
					}
				}
			}
		}
		else{
			var MapInfo = root.getCurrentSession().getCurrentMapInfo()
			var TargetList = MapInfo.getListFromUnitGroup(UnitGroup.ALLYEVENT)
			var UnitList = root.getBaseData().getPlayerList()
			var i, j
			Temp = null;
			for (j = 0; j < UnitList.getCount(); j++){
				if (UnitList.getData(j).getId() === itemTargetInfo.item.custom.UnitID){
					Temp = UnitList.getData(j);
					break;
				}
			}
			if (Temp !== null){
				for (i = 0; i < TargetList.getCount(); i++){
					if (TargetList.getData(i).getName() === Temp.getName()){
						targetUnit = TargetList.getData(i)
					}
				}
			}
		}
		this._targetUnit = root.getObjectGenerator().generateUnitFromBaseUnit(targetUnit);
		this._targetUnit.setInvisible(true)
		
		// For item use with AI, the position is not always initialized.
		if (this._targetPos === null) {
			this._targetPos = SummonControl.getSummonPos(itemTargetInfo.unit, this._targetUnit, itemTargetInfo.item);
			if (this._targetPos === null) {
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
			Gen.damageHit(Unit, Anime, Math.floor(Cost), DamageType.FIXED, Unit, false);
		}
		else{
			Cost = Math.floor(RealBonus.getMhp(Unit)*Cost/100);
			Gen.damageHit(Unit, Anime, Math.floor(Cost), DamageType.FIXED, Unit, false);
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
		for (i = 0; i < TargetList.getCount(); i++){
			if (TargetList.getData(i).getId() === combination.item.custom.UnitID){
				Summoned = TargetList.getData(i);
			}
		}
		// Check if there is a position for combination.targetUnit to instantly move.
		// The criteria is if the different type of unit from myself exists within a range of an instant move.
		return Summoned.getLv() + (n*2);
	},
	
	getActionTargetType: function(unit, item) {
		// Always return ActionTargetType.UNIT even though the item.getRangeType() is SelectionRangeType.SELFONLY.
		return ActionTargetType.SINGLE;
	},
	
	getUnitFilter: function(unit, item) {
		// if (item.getRangeType() === SelectionRangeType.SELFONLY) {
		// Search the opponent because self instantly moves towards the opponent.
		return FilterControl.getReverseFilter(unit.getUnitType());
		// }
		// else {
			// // Search the unit so as to make the unit instantly move.
			// return FilterControl.getNormalFilter(unit.getUnitType());
		// }
	},
	
	_isUnitTypeAllowed: function(unit, targetUnit) {
		// Confirm the different type of unit from myself.
		return true;
	}
}
);