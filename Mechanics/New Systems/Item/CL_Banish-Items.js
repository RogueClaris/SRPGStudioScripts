/*
Create an item with the keyword BanishCL
Add custom parameters as follows:
{
	StaffRangeCL:6, //Range you can select within
	StaffHitCL:50, //base hit rate
	StaffMissCL:false //lets the staff miss if you want
}
If you want a unit to only banish to a specific position,
give them custom parameters like follows:
{
	BanishOverride:true,
	BanishX:9,
	BanishY:0
}
*/

var BanishUse0 = ItemControl.isItemUsable;
ItemControl.isItemUsable = function(unit, item) {
	var result = BanishUse0.call(this,unit,item);
	if (!item.isWeapon() && item.getCustomKeyword() === "BanishCL"){
		return true;
	}
	return result;
}

var BanishCL02 = ItemPackageControl.getCustomItemSelectionObject;
ItemPackageControl.getCustomItemSelectionObject = function(item, keyword) {
	
	if (keyword === "BanishCL"){
		return BanishItemSelection;
	}
	
	return BanishCL02.call(this,item,keyword);
};

var BanishCL03 = ItemPackageControl.getCustomItemAvailabilityObject;
ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword){
	if (keyword === "BanishCL"){
		return BanishItemAvailability;
	}
	return BanishCL03.call(this,item,keyword);
};

var BanishCL04 = ItemPackageControl.getCustomItemUseObject;
ItemPackageControl.getCustomItemUseObject = function(item, keyword){
	if (keyword === "BanishCL"){
		return BanishItemUse;
	}
	return BanishCL04.call(this,item,keyword);
};

var BanishCL05 = ItemPackageControl.getCustomItemAIObject;
ItemPackageControl.getCustomItemAIObject = function(item, keyword){
	if (keyword === "BanishCL"){
		return BanishItemAI;
	}
	return BanishCL05.call(this,item,keyword);
};

var BanishCL06 = ItemPackageControl.getCustomItemInfoObject;
ItemPackageControl.getCustomItemInfoObject = function(item, keyword){
	
	if (keyword === "BanishCL"){
		return BanishItemInfo
	}
	
	return BanishCL06.call(this,item,keyword)
};

var BanishCL07 = ItemPackageControl.getCustomItemPotencyObject;
ItemPackageControl.getCustomItemPotencyObject = function(item, keyword){
	
	if (keyword === "BanishCL"){
		return BanishItemPotency
	}
	
	return BanishCL07.call(this,item,keyword)
};

var BanishItemSelection = defineObject(TeleportationItemSelection,
{
	setPosSelection: function() {
		var indexArray = [];
		//there are only two selection types; cannot banish yourself.
		var rangeType = this._item.custom.FullMapCL ? SelectionRangeType.ALL : SelectionRangeType.MULTI
		
		if (rangeType === SelectionRangeType.MULTI) {
			//base array on item custom parameters, not item UI settings.
			indexArray = this._getMultiTeleportationIndexArray(this._item.custom.StaffRangeCL);
		}
		else if (rangeType === SelectionRangeType.ALL) {
			indexArray = this._getAllTeleportationIndexArray();
		}
		
		// Specify PosSelectorType.FREE to select anywhere. 
		this._posSelector.setPosSelectorType(PosSelectorType.FREE);
		this._posSelector.setPosOnly(this._unit, this._item, indexArray, PosMenuType.Item);
		
		// Don't call setFirstPos so the cursor doesn't go far away instantly.
		// this._posSelector.setFirstPos();
	}
}
);

//I still don't even know what potency does, off the top of my head.
//all I know is this script works without changing anything.
var BanishItemPotency = defineObject(TeleportationItemPotency,
{
}
);

//You could edit in some functions from BaseItemAvailability,
//or TeleportationItemAvailability, if you wanted to mess with
//when Banish items are available.
var BanishItemAvailability = defineObject(TeleportationItemAvailability,
{
}
);

var BanishItemInfo = defineObject(TeleportationItemInfo,
{
	
	drawItemInfoCycle: function(x, y) {
		//draw the item type name.
		ItemInfoRenderer.drawKeyword(x, y, "Banishing Item");
		y += ItemInfoRenderer.getSpaceY();
		
		//draw the selection range for grabbing the unit.
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType());
		y += ItemInfoRenderer.getSpaceY();
		
		this._drawValue(x, y);
	},
	
	_drawValue: function(x, y) {
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var teleportationInfo = this._item.getTeleportationInfo();
		//draw the teleportation ("banishing") range
		ItemInfoRenderer.drawKeyword(x, y, StringTable.Teleportation_Range);
		x += ItemInfoRenderer.getSpaceX();
		
		//if it's everywhere, say so.
		if (this._item.custom.FullMapCL) {
			TextRenderer.drawKeywordText(x, y, StringTable.Range_All, -1, color, font);
		}
		else {
			//else, use the custom parameter.
			NumberRenderer.drawRightNumber(x, y, this._item.custom.StaffRangeCL);
		}
	}
}
);

//pull the relevant function for later use.
var BanishCL0 = TeleportationItemUse._moveSrc;
BanishItemUse = defineObject(TeleportationItemUse,
{
	
	enterMainUseCycle: function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		
		this._itemUseParent = itemUseParent;
		this._targetPos = itemTargetInfo.targetPos;
		
		//left in for posterity, but you really shouldn't select SELFONLY with Banishing items.
		if (itemTargetInfo.item.getRangeType() === SelectionRangeType.SELFONLY) {
			this._targetUnit = itemTargetInfo.unit;
		}
		else {
			this._targetUnit = itemTargetInfo.targetUnit;
		}
		
		// For item use with AI, the position is not always initialized.
		if (this._targetPos === null) {
			this._targetPos = BanishControl.getTeleportationPos(itemTargetInfo.unit, this._targetUnit, itemTargetInfo.item);
			//well, if it can't find a position, it won't work.
			if (this._targetPos === null) {
				return EnterResult.NOTENTER;
			}
		}
		
		//if someone's in the way, it won't work.
		if (PosChecker.getUnitFromPos(this._targetPos.x, this._targetPos.y) !== null) {
			// Don't reduce items because the unit exists, so cannot move. 
			this._itemUseParent.disableItemDecrement();
			return EnterResult.NOTENTER;
		}
		
		//if we're skipping the action, just do it, don't enter the full cycle.
		if (itemUseParent.isItemSkipMode()) {
			this.mainAction();
			return EnterResult.NOTENTER;
		}
		
		//skip to source mode.
		this.changeCycleMode(ItemTeleportationUseMode.SRC);
		
		return EnterResult.OK;
	},
	
	_moveSrc: function(){
		//get the item itself
		var item = this._itemUseParent.getItemTargetInfo().item
		//if the item can't miss, immediately call the teleportation function.
		if (!item.custom.StaffMissCL){
			return BanishCL0.call(this)
		}
		//get the unit otherwise.
		var unit = this._itemUseParent.getItemTargetInfo().unit
		//get the base chance. defaults to 15.
		var baseChance = typeof item.custom.StaffHitCL === 'number' ? item.custom.StaffHitCL : 15 // adjust the base chance here
		var bonus; //prepare the bonus variable.
		//get the weapon.
		var weapon = ItemControl.getEquippedWeapon(unit)
		//if the weapon isn't null, get the unit's hitrate then remove weapon hit.
		if (weapon !== null){
			bonus = AbilityCalculator.getHit(unit, weapon); //if the unit has a weapon, call the hit calculation
			bonus -= weapon.getHit() //subtract weapon hit from the output.
		}
		else{
			//otherwise use the default hit formula. you may edit this to use your hit formula if you'd like.
			bonus = Math.max(0, RealBonus.getSki(unit) * 3) // adjust the bonus from the base unit here
		}
		if (Probability.getProbability(bonus+baseChance)){
			//if we pass the probabiltiy check, call the teleportation function.
			//no need to repeat the code that's already done for us.
			return BanishCL0.call(this);
		}
		else{
			//otherwise, and this was fun to make, play the miss animation
			//I do this specifically at the unit by missing them with
			//a negative-damage attack that has 0% accuracy.
			//I had trouble getting it to display in the right place with
			//gen.animationPlay, so I didn't use that.
			var target = this._itemUseParent.getItemTargetInfo().targetUnit
			var x = LayoutControl.getPixelX(target.getMapX())
			var y = LayoutControl.getPixelY(target.getMapY())
			var anime = root.queryAnime('fire') //"fire' is not an animation you can query. so it returns nothing.
			var pos = LayoutControl.getMapAnimationPos(x, y, anime)
			var gen = root.getEventGenerator()
			gen.damageHitEx(target, anime, 0, DamageType.FIXED, -999, unit, false)
			gen.execute()
		}
	}
}
);

BanishItemAI = defineObject(TeleportationItemAI,
{
	
	getUnitFilter: function(unit, item) {
		return FilterControl.getReverseFilter(unit.getUnitType());
	},
	
	//basically just checks if the AI unit can use teleportation, as the name says. pretty straightforward.
	_isTeleportationEnabled: function(unit, combination) {
		var targetUnit = combination.targetUnit;
		var rangeType = combination.item.custom.FullMapCL ? SelectionRangeType.ALL : SelectionRangeType.MULTI
		
		if (rangeType === SelectionRangeType.MULTI) {
			return this._isMultiRangeEnabled(unit, targetUnit, combination.item);
		}
		else if (rangeType === SelectionRangeType.ALL) {
			//this function is vanilla. find it in Scriptitem-teleportation.js
			return this._isAllRangeEnabled(unit, targetUnit);
		}
		
		return false;
	},
	
	//more complex. let's get into it.
	_isMultiRangeEnabled: function(unit, targetUnit, item) {
		var i, index, x, y, focusUnit;
		//so this gets an array of tile indices starting at 1, and ending at the item's custom parameter-set staff range.
		var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, item.custom.StaffRangeCL);
		//we get the array's size.
		var count = indexArray.length;
		//and we loop over it.
		for (i = 0; i < count; i++) {
			//the index is gotten by indexing. yes, it's literally called that.
			index = indexArray[i];
			//CurrentMap.getX and getY are very useful. They convert an index to usable XY coordinates.
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			focusUnit = PosChecker.getUnitFromPos(x, y);
			//we check if there's a unit at the XY position.
			if (focusUnit === null) {
				continue;
			}
			//we check if we can use them.
			if (!this._isUnitTypeAllowed(focusUnit, unit)) {
				continue;
			}
			
			//and if they pass both tests, we use them.
			return true;
		}
		//if we loop over the array's entire length without finding someone, we can't teleport.
		return false;
	}
}
);

var BanishControl = {
	getTeleportationPos: function(unit, targetUnit, item) {
		if (unit.custom.BanishOverride){
			//this function is vanilla. find it in base-top
			return createPos(unit.custom.BanishX, unit.custom.BanishY)
		}
		var rangeType = item.custom.FullMapCL ? SelectionRangeType.ALL : SelectionRangeType.MULTI
		var curUnit = null;
		var parentIndexArray = null;
		
		if (rangeType === SelectionRangeType.SELFONLY) {
			//won't work. please don't use it on yourself. it's just a warp staff then.
			return null;
		}
		else if (rangeType === SelectionRangeType.MULTI) {
			curUnit = this._getMultiRangeUnit(unit, targetUnit, item);
		}
		else if (rangeType === SelectionRangeType.ALL) {
			curUnit = this._getAllRangeUnit(unit, targetUnit);
		}
		//range is based on custom parameters. start at the highest.
		var range = item.custom.StaffRangeCL;
		var pos = null;
		//loop.
		while (pos === null){
			//get an index array for as far away as possible.
			parentIndexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), range, item.custom.StaffRangeCL);
			//try to get a position.
			pos = PosChecker.getNearbyPosEx(unit, targetUnit, parentIndexArray)
			//if it doesn't work, decrease range.
			if (pos === null){
				range--
			}
		}
		
		// Calling getNearbyPosEx forces it to stay within range of the array.
		return PosChecker.getNearbyPosEx(curUnit, targetUnit, parentIndexArray)
	},
	
	//grabs within a specific range.
	_getMultiRangeUnit: function(unit, targetUnit, item) {
		var i, index, x, y, focusUnit;
		var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, item.custom.StaffRangeCL);
		var count = indexArray.length;
		var curUnit = null;
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			focusUnit = PosChecker.getUnitFromPos(x, y);
			
			if (focusUnit === null){
				continue;
			}
			
			if (focusUnit.getUnitType() === unit.getUnitType() && focusUnit.getImportance() !== ImportanceType.LEADER){
				curUnit = this._checkUnit(curUnit, focusUnit);
			}
		}
		
		return curUnit;
	},
	
	_getAllRangeUnit: function(unit, targetUnit) {
		//this just grabs everyone.
		var i, j, count, list, focusUnit;
		var curUnit = null;
		var filter = FilterControl.getReverseFilter(targetUnit.getUnitType());
		var listArray = FilterControl.getListArray(filter);
		var listCount = listArray.length;
		
		for (i = 0; i < listCount; i++) {
			list = listArray[i];
			count = list.getCount();
			for (j = 0; j < count; j++) {
				focusUnit = list.getData(j);
				curUnit = this._checkUnit(curUnit, focusUnit);
			}
		}
		
		return curUnit;
	},
	
	_checkUnit: function(curUnit, focusUnit) {
		//if curUnit doesn't exist...
		if (curUnit === null) {
			//make it exist.
			curUnit = focusUnit;
		}
		else {
			//check the levels. higher level units are usually more powerful, so...
			if (focusUnit.getLv() > curUnit.getLv()) {
				curUnit = focusUnit;
			}
		}
		//return
		return curUnit;
	},
	
	_isUnitTypeAllowed: function(unit, targetUnit) {
		//make sure the target is an enemy in the eyes of the caster.
		return FilterControl.isReverseUnitTypeAllowed(unit, targetUnit);
	}
};
