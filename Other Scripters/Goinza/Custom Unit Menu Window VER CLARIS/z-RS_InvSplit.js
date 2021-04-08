/*
Welcome to the Split Inventory script, by Rena Sage.
This script is almost Plug-and-Play, in that it requires
very little setup on your part to take effect. To use, put
the file in Plugins, then go to Database > Config 2, and set
the max item count to twice what you want each inventory's size to be.

The effects are as follows:
1. Marks Player-unit equipped weapons with a custom parameter automatically,
-- which tells the code that the weapon is the ONLY equipped weapon. No effect
-- on enemy or ally units, however.
2. Adds a new Unit Command where you can manually swap weapons. Selecting the
-- equipped weapon will unequip it, acting as if the unit has no weapons!
3. Most importantly, splits Items & Weapons between two equal-size inventories.

Modified by Eclogia:
ItemWorkWindow.setItemWorkData
UnitItemTradeScreen._exchangeItem

*/

// var GradCol1 = 0xF9A600 //Set a hex code after 0x.
// var GradCol2 = 0xF9FF00 //Set a hex code after 0x.
// var GradVer1 = GradientType.RADIAL //Or set GradientType.LINEAR
// var GradVer2 = "Round" //or set "Sharp" for a boxier rectangle.
var RSWeaponWindow = defineObject(ItemListWindow,
{
	initialize: function() {
		this._scrollbar = createScrollbarObject(WepListScrollbar, this);
	},
	
	setDefaultItemFormation: function() {
		var max = 7;
		var count = DataConfig.getMaxUnitItemCount()
		
		if (count > max) {
			count = max;
		}
		
		this.setItemFormation(count);
	}
}
);

var InvMarkCL1 = ItemListScrollbar.initialize;

var WepListScrollbar = defineObject(ItemListScrollbar,
{
	initialize: function(){
		InvMarkCL1.call(this);
		var iconList = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true).getCollectionData(1, 0).getId()
		var icon = root.createResourceHandle(true, iconList, 0, 4, 0)
		this._equipPic = GraphicsRenderer.getGraphics(icon, GraphicsType.ICON)
	},
		
	setUnitMaxItemFormation: function(unit) {
		var i;
		var maxCount = DataConfig.getMaxUnitItemCount()
		
		this._unit = unit;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			if (item === null || item != null && item.isWeapon()){
				this.objectSet(UnitItemControl.getItem(unit, i));
			}
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
	},
	
	setUnitItemFormation: function(unit) {
		var i, item;
		var maxCount = DataConfig.getMaxUnitItemCount()
		
		this._unit = unit;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item !== null && item.isWeapon()) {
				this.objectSet(item);
			}
		}
		
		this.objectSetEnd();
		this.resetAvailableData();
	},
	
	setStockItemFormation: function() {
	},
	
	setStockItemFormationFromWeaponType: function(weapontype) {
	},
	
	drawScrollContent: function(x, y, object, isSelect, index) {
		var isAvailable, color;
		var textui = root.queryTextUI("default_window")
		var font = textui.getFont();
		
		if (object === null) {
			return;
		}
		
		if (this._availableArray !== null) {
			isAvailable = this._availableArray[index];
		}
		else {
			isAvailable = true;
		}
		
		color = 0xffffff
		
		if (isAvailable) {
			ItemRenderer.drawItem(x, y, object, color, font, true);
		}
		else {
			// Draw it tinted if items cannot be used.
			ItemRenderer.drawItemAlpha(x, y, object, color, font, true, 120);
		}
		if (this.getObjectFromIndex(index) === ItemControl.getEquippedWeapon(this._unit)){
			var tWide = TextRenderer.getTextWidth(this.getObjectFromIndex(index).getName(), font) + 32
			this._equipPic.drawStretchParts(x+tWide, y, 24, 24, 24*4, 0, 24, 24)
		}
	}
}
);

var ItemOnlyWindow = defineObject(ItemListWindow,
{
	initialize: function() {
		this._scrollbar = createScrollbarObject(ItemOnlyScrollbar, this);
	},
	
	setDefaultItemFormation: function() {
		var max = 7;
		var count = DataConfig.getMaxUnitItemCount()
		
		if (count > max) {
			count = max;
		}
		this.setItemFormation(count);
	},
	
	setItemFormation: function(count) {
		this._scrollbar.setScrollFormation(1, count);
	}
}
);

ItemSelectMenu._resetItemList = function() {
	var count = UnitItemControl.getPossessionItemCount(this._unit);
	var visibleCount = 8;
	
	if (count > visibleCount) {
		count = visibleCount;
	}
	var count2 = count
	if (this._unit != null){
		for (var i = 0; i < count; i++){
			var item = UnitItemControl.getItem(this._unit, i)
			if (item != null && item.isWeapon()){
				count2--
			}
		}
	}
	this._itemListWindow.setItemFormation(count2);
	this._itemListWindow.setUnitItemFormation(this._unit);
}

var ItemOnlyScrollbar = defineObject(ItemListScrollbar,
{
	
	initialize: function(){
		InvMarkCL1.call(this)
		//megaman
		var iconList = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true).getCollectionData(1, 0).getId()
		var icon = root.createResourceHandle(true, iconList, 0, 4, 0)
		this._list = [ItemControl.getEquippedShield(this._unit), ItemControl.getEquippedArmband(this._unit)]
		this._equipPic = GraphicsRenderer.getGraphics(icon, GraphicsType.ICON)
	},
	
	setUnitMaxItemFormation: function(unit) {
		var i, item;
		var maxCount = DataConfig.getMaxUnitItemCount()
		
		this._unit = unit;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item === null || item != null && !item.isWeapon()){
				this.objectSet(item);
			}
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
	},
	
	setUnitItemFormation: function(unit) {
		var i, item;
		var maxCount = DataConfig.getMaxUnitItemCount()
		this._unit = unit;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item != null && !item.isWeapon()) {
				this.objectSet(item);
			}
		}
		this.objectSetEnd();
		this.resetAvailableData();
	},
	
	setStockItemFormation: function() {
	},
	
	setStockItemFormationFromWeaponType: function(weapontype) {
	},
	
	resetAvailableData: function() {
		var i, item;
		var length = this._objectArray.length;
		
		this._availableArray = [];
		
		for (i = 0; i < length; i++) {
			item = this._objectArray[i];
			if (item !== null && !item.isWeapon()) {
				this._availableArray.push(this._isAvailable(item, false, i));
			}
		}
	},
	
	drawScrollContent: function(x, y, object, isSelect, index) {
		var isAvailable, color;
		var textui = root.queryTextUI("default_window")
		var font = textui.getFont();
		
		if (object === null) {
			return;
		}
		
		if (this._availableArray !== null) {
			isAvailable = this._availableArray[index];
		}
		else {
			isAvailable = true;
		}

		color = 0xffffff
		
		if (isAvailable) {
			ItemRenderer.drawItem(x, y, object, color, font, true);
		}
		else {
			// Draw it tinted if items cannot be used.
			ItemRenderer.drawItemAlpha(x, y, object, color, font, true, 120);
		}
		if (this._list.indexOf(this.getObjectFromIndex(index)) !== -1){
			var tWide = TextRenderer.getTextWidth(this.getObjectFromIndex(index).getName(), font) + 32
			this._equipPic.drawStretchParts(x+tWide, y, 24, 24, 24*4, 0, 24, 24)
		}
	}
}
);

UnitCommand.Item.isCommandDisplayable = function() {
	var i = 0;
	var max = DataConfig.getMaxUnitItemCount()
	var found = false;
	var item;
	var unit = this.getCommandTarget()
	while (i < max && !found){
		item = UnitItemControl.getItem(unit, i)
		if (item != null && !item.isWeapon()){
			found = true;
		}
		i++
	}
	return found;
}

ItemSelectMenu.setMenuTarget = function(unit) {
	this._unit = unit;
	this._itemListWindow = createWindowObject(ItemOnlyWindow, this);
	this._itemInfoWindow = createWindowObject(ItemInfoWindow, this);
	this._itemWorkWindow = createWindowObject(ItemWorkWindow, this);
	this._discardManager = createObject(DiscardManager);
	
	this._itemWorkWindow.setupItemWorkWindow();
	
	this._resetItemList();
	
	this._processMode(ItemSelectMenuMode.ITEMSELECT);
};

var ItemDropOnlyScrollbar = defineObject(ItemOnlyScrollbar,
{
	_trophyRefArray: null,
	
	setDataScrollbar: function(unit) {
        this.setUnitItemFormation(unit);
        this.resetDropMark();
    },
	
	resetDropMark: function() {
		var i, count, trophy, list;
		var length = this._objectArray.length;
		
		this._trophyRefArray = [];
		
		for (i = 0; i < length; i++) {
			this._trophyRefArray.push(false);
		}
		
		if (this._unit !== null && this._unit.getUnitType() === UnitType.ENEMY) {
			list = this._unit.getDropTrophyList();
			count = list.getCount();
			for (i = 0; i < count; i++) {
				trophy = list.getData(i);
				// Check if the contents of the trophy are items and if they need to be obtained immediately.
				if ((trophy.getFlag() & TrophyFlag.ITEM) && trophy.isImmediately()) {
					this._checkDrop(trophy);
				}
			}
		}
	},
	
	_checkDrop: function(trophy) {
		var i;
		var length = this._objectArray.length;
		
		for (i = 0; i < length; i++) {
			if (!this._trophyRefArray[i]) {
				if (ItemControl.compareItem(this._objectArray[i], trophy.getItem())) {
					// Specify true so as to display in color if the same item as the trophy item is possessed.
					this._trophyRefArray[i] = true;
					break;
				}
			}
		}
	},
	
	_getTextColor: function(object, isSelect, index) {
		var color = ItemListScrollbar._getTextColor.call(this, object, isSelect, index);
		
		if (this._isDropItem(index)) {
			color = ColorValue.LIGHT;
		}
		
		return color;
	},
	
	_isDropItem: function(index) {
		if (this._unit !== null && this._unit.getUnitType() === UnitType.ENEMY) {
			return this._trophyRefArray[index];
		}
		
		return false;
	}
}
);

var WepDropOnlyScrollbar = defineObject(WepListScrollbar,
{
	_trophyRefArray: null,
	
	setDataScrollbar: function(unit) {
        this.setUnitItemFormation(unit);
        this.resetDropMark();
    },
	
	resetDropMark: function() {
		var i, count, trophy, list;
		var length = this._objectArray.length;
		
		this._trophyRefArray = [];
		
		for (i = 0; i < length; i++) {
			this._trophyRefArray.push(false);
		}
		
		if (this._unit !== null && this._unit.getUnitType() === UnitType.ENEMY) {
			list = this._unit.getDropTrophyList();
			count = list.getCount();
			for (i = 0; i < count; i++) {
				trophy = list.getData(i);
				// Check if the contents of the trophy are items and if they need to be obtained immediately.
				if ((trophy.getFlag() & TrophyFlag.ITEM) && trophy.isImmediately()) {
					this._checkDrop(trophy);
				}
			}
		}
	},
	
	_checkDrop: function(trophy) {
		var i;
		var length = this._objectArray.length;
		
		for (i = 0; i < length; i++) {
			if (!this._trophyRefArray[i]) {
				if (ItemControl.compareItem(this._objectArray[i], trophy.getItem())) {
					// Specify true so as to display in color if the same item as the trophy item is possessed.
					this._trophyRefArray[i] = true;
					break;
				}
			}
		}
	},
	
	_getTextColor: function(object, isSelect, index) {
		var color = ItemListScrollbar._getTextColor.call(this, object, isSelect, index);
		
		if (this._isDropItem(index)) {
			color = ColorValue.LIGHT;
		}
		
		return color;
	},
	
	_isDropItem: function(index) {
		if (this._unit !== null && this._unit.getUnitType() === UnitType.ENEMY) {
			return this._trophyRefArray[index];
		}
		
		return false;
	}
}
);

var ItemOnlyInteraction = defineObject(ItemInteraction,
{
	_textui: null,
	
	initialize: function() {
		this._scrollbar = createScrollbarObject(ItemDropOnlyScrollbar, this);
		this._scrollbar.setScrollFormation(1, DefineControl.getVisibleUnitItemCount()-1);
		
		this._window = createWindowObject(ItemInfoWindow, this);
	},
	
	setUnitData: function(unit) {
        this._scrollbar.setDataScrollbar(unit);
        this._changeTopic();
    },
	
	getTitle: function(){
		return "Items"
	},
	
	hasWindow: function() {
        return this._window!=null;
    }
}
);

var UnitMenuBottomItemWindow = defineObject(CustomBottomUnitWindow,
{
	_topLeftInteraction: null,
    _topRightInteraction: null,
    _bottomLeftInteraction: null,
    _bottomRightInteraction: null,
	_unitMenuHelp: -1,
    _index: 0,
	
	setIndex: function(newIndex) {
        this._index = newIndex;
    },
	
	setUnitMenuData: function() {
		this._skillInteraction = createObject(SkillInteraction);
		this._itemInteraction = createObject(ItemOnlyInteraction);
		this._statusScrollbar = createScrollbarObject(UnitStatusScrollbar, this);
		this._topLeftInteraction = createObject(Options.TOPLEFT[this._index]);
        this._topRightInteraction = createObject(Options.TOPRIGHT[this._index]);
        this._bottomLeftInteraction = createObject(Options.BOTTOMLEFT[this._index]);
        this._bottomRightInteraction = createObject(Options.BOTTOMRIGHT[this._index]);
	}
}
);

var UnitMenuBottomWeaponWindow = defineObject(CustomBottomUnitWindow,
{
	_topLeftInteraction: null,
    _topRightInteraction: null,
    _bottomLeftInteraction: null,
    _bottomRightInteraction: null,
	_unitMenuHelp: -1,
    _index: 0,
	
	setIndex: function(newIndex) {
        this._index = newIndex;
    },
	
	setUnitMenuData: function() {
		this._skillInteraction = createObject(SkillInteraction);
		this._itemInteraction = createObject(WepOnlyInteraction);
		this._statusScrollbar = createScrollbarObject(UnitStatusScrollbar, this);
		this._topLeftInteraction = createObject(Options.TOPLEFT[this._index]);
        this._topRightInteraction = createObject(Options.TOPRIGHT[this._index]);
        this._bottomLeftInteraction = createObject(Options.BOTTOMLEFT[this._index]);
        this._bottomRightInteraction = createObject(Options.BOTTOMRIGHT[this._index]);
	}
}
);

var WepOnlyInteraction = defineObject(TopCustomInteraction,
{
	_textui: null,
	
	initialize: function() {
		this._scrollbar = createScrollbarObject(WepDropOnlyScrollbar, this);
		this._scrollbar.setScrollFormation(1, DefineControl.getVisibleUnitItemCount()-1);
		
		this._window = createWindowObject(ItemInfoWindow, this);
	},
	
	hasWindow: function() {
        return this._window!=null;
    },
	
	setUnitData: function(unit) {
        this._scrollbar.setDataScrollbar(unit);
        this._changeTopic();
    },

    //Title that will show up in the window
    getTitle: function() {
        return 'Weapons';
    },

    //The interaction must use a diffent scrollbar object
    getScrollbarObject: function() {
        return WepDropOnlyScrollbar;
    },

    getWindowObject: function() {
        return ItemInfoWindow;
    },

    getWindowTextUI: function() {
        return root.queryTextUI('default_window');
    },

    hasWindow: function() {
        return this._window!=null;
    }
}
);

var EquipCommandMode = {
	TOP: 0
};

UnitCommand.EquipWeapon = defineObject(UnitCommand.Item,
{
	_getWeaponCount: function() {
		var i, weapon;
		var unit = this.getCommandTarget();
		var count = UnitItemControl.getPossessionItemCount(unit);
		var weaponCount = 0;
		
		for (i = 0; i < count; i++) {
			weapon = UnitItemControl.getItem(unit, i);
			if (weapon === null) {
				continue;
			}
			
			if (ItemControl.isWeaponAvailable(unit, weapon)) {
				weaponCount++;
			}
		}
		
		return weaponCount;
	},
	
	openCommand: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveCommand: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === EquipCommandMode.TOP) {
			result = this._moveTop();
		}
		return result;
	},
	
	drawCommand: function() {
		var mode = this.getCycleMode();
		
		if (mode === EquipCommandMode.TOP) {
			this._drawTop();
		}
	},
	
	getCommandName: function() {
		return "Weapons";
	},
	
	isRepeatMoveAllowed: function() {
		return true;
	},
	
	isCommandDisplayable: function() {
		return this._getWeaponCount() > 0
	},
	
	_prepareCommandMemberData: function() {
		this._itemUse = null;
		this._itemSelection = null;
		this._itemSelectMenu = createObject(WeaponSelectMenuRS);
	},
	
	_moveTop: function() {
		var weapon;
		var input = this._itemSelectMenu.moveWindowManager();
		
		if (input === ScrollbarInput.SELECT) {
			weapon = this._itemSelectMenu.getSelectWeapon();
			ItemControl.setEquippedWeapon(this.getCommandTarget(), weapon);
			this.rebuildCommand();
			return MoveResult.END;
		}
		else if (input === ScrollbarInput.CANCEL) {
			if (this._weaponPrev !== this._itemSelectMenu.getSelectWeapon()) {
				// Rebuild the command because the equipped weapon has changed.
				// For example, if the equipped weapon includes "Steal" as "Optional Skills", "Steal" must be removed from the command.
				this.rebuildCommand();
			}
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	}
}
);

//Automatically equip if only 1 weapon is found.
UnitCommand.Attack._completeCommandMemberData = function() {
	if (DataConfig.isWeaponSelectSkippable()) {
		if (this._getWeaponCount() === 1) {
			this._isWeaponSelectDisabled = true;
		}
	}
	
	if (this._isWeaponSelectDisabled) {
		for (var i = 0; i < UnitItemControl.getPossessionItemCount(this.getCommandTarget()); i++) {
			weapon = UnitItemControl.getItem(this.getCommandTarget(), i);
			if (weapon === null) {
				continue;
			}
			
			if (ItemControl.isWeaponAvailable(this.getCommandTarget(), weapon)) {
				if (ItemControl.getEquippedWeapon(this.getCommandTarget()) === null){
					ItemControl.setEquippedWeapon(this.getCommandTarget(), weapon)
				}
				this._startSelection(ItemControl.getEquippedWeapon(this.getCommandTarget()));
				break;
			}
		}
	}
	else {
		this._weaponSelectMenu.setMenuTarget(this.getCommandTarget());
		this._weaponPrev = this._weaponSelectMenu.getSelectWeapon();
		this.changeCycleMode(AttackCommandMode.TOP);
	}
};

var RSWepCmd01 = UnitCommand.configureCommands;
UnitCommand.configureCommands = function(groupArray){
	RSWepCmd01.call(this, groupArray)
	var i = 0;
	var found = false;
	var count = groupArray.length;
	while (i<groupArray.length && !found) {        
		if (groupArray[i]._itemUse === null){
			found = groupArray[i].getCommandName() === root.queryCommand('item_unitcommand');
		}
		i++;
	}
	groupArray.insertObject(UnitCommand.EquipWeapon, i)
}

var WeaponSelectMenuRS = defineObject(WeaponSelectMenu,
{
	_isWeaponAllowed: function(unit, item) {
		var indexArray;
		
		if (!ItemControl.isWeaponAvailable(unit, item)) {
			return false;
		}
	
		return true
	}
}
);

UnitItemControl.getPossessionItemOnly = function(unit) {
	var i;
	var count = DataConfig.getMaxUnitItemCount()
	var bringCount = 0;
	
	for (i = 0; i < count; i++) {
		if (unit.getItem(i) != null && !unit.getItem(i).isWeapon()) {
			bringCount++;
		}
	}
	
	return bringCount;
};

UnitItemControl.getPossessionWeaponOnly = function(unit) {
	var i;
	var count = DataConfig.getMaxUnitItemCount()
	var bringCount = 0;
	
	for (i = 0; i < count; i++) {
		if (unit.getItem(i) != null && unit.getItem(i).isWeapon()) {
			bringCount++;
		}
	}
	
	return bringCount;
};

UnitItemControl.isItemOnlySpace = function(unit) {
	return this.getPossessionItemOnly(unit) < Math.ceil(DataConfig.getMaxUnitItemCount()/2)
};

UnitItemControl.isWeaponOnlySpace = function(unit) {
	return this.getPossessionWeaponOnly(unit) < Math.ceil(DataConfig.getMaxUnitItemCount()/2)
};

ItemControl.getEquippedWeapon = function(unit) {
	var i, item, count;
	
	if (unit === null) {
		return null;
	}
	
	count = UnitItemControl.getPossessionItemCount(unit);
	
	// Equipped weapon is the first weapon in the item list.
	for (i = 0; i < count; i++) {
		item = UnitItemControl.getItem(unit, i);
		if (unit.getUnitType() == UnitType.PLAYER){
			if (item !== null && this.isWeaponAvailable(unit, item) && item.custom.EquippedRS == true) {
				return item;
			}
		}
		else{
			if (item !== null && this.isWeaponAvailable(unit, item)) {
				return item;
			}
		}
	}
	
	return null;
};

ItemControl.setEquippedWeapon = function(unit, targetItem) {
	var i, item;
	var count = UnitItemControl.getPossessionItemCount(unit);
	var fastIndex = -1, targetIndex = -1;
	
	// The unit is equipped with a weapon of targetItem.
	// targetItem is listed on top in the item list.
	
	for (i = 0; i < count; i++) {
		item = UnitItemControl.getItem(unit, i);
		if (item !== null && fastIndex === -1) {
			// Save the first item index in the item list.
			fastIndex = i;
		}
		
		if (item === targetItem) {
			// Save the item index to be equipped.
			targetIndex = i;
		}
	}
	
	if (fastIndex === -1 || targetIndex === -1) {
		return;
	}
	
	// Don't trade if the index is matched.
	if (fastIndex === targetIndex) {
		if (targetItem.isWeapon() && !targetItem.custom.EquippedRS){
			targetItem.custom.EquippedRS = true
		}
		else if (targetItem.isWeapon() && targetItem.custom.EquippedRS){
			targetItem.custom.EquippedRS = false
		}
		return;
	}
	
	// Swap items.
	item = UnitItemControl.getItem(unit, fastIndex);
	UnitItemControl.setItem(unit, fastIndex, targetItem);
	UnitItemControl.setItem(unit, targetIndex, item);
	if (targetItem.isWeapon() && !targetItem.custom.EquippedRS){
		targetItem.custom.EquippedRS = true
	}
	else if (targetItem.isWeapon() && targetItem.custom.EquippedRS){
		targetItem.custom.EquippedRS = false
	}
	if (item.isWeapon()){
		item.custom.EquippedRS = false
	}
	this.updatePossessionItem(unit);
};

var StartMapClaris = TurnChangeMapStart.doLastAction;
TurnChangeMapStart.doLastAction = function(){
	StartMapClaris.call(this)
	var h, i, j, w, x, y, unit, found, item;
	var players = PlayerList.getAliveList()
	var foes = EnemyList.getAliveList()
	var friends = AllyList.getAliveList()
	for (h = 0; h < players.getCount(); h++){
		unit = players.getData(h)
		w = 0
		found = false
		while (w < UnitItemControl.getPossessionItemCount(unit) && !found){
			item = UnitItemControl.getItem(unit, w);
			if (item != null && ItemControl.isWeaponAvailable(unit, item) && item.isWeapon()){
				ItemControl.setEquippedWeapon(unit, item)
				found = true
			}
			w++
		}
	}
};

var SetAIWeapon0 = AIScorer.Weapon._setTemporaryWeapon;
AIScorer.Weapon._setTemporaryWeapon = function(unit, combination){
	var itemHead = UnitItemControl.getItem(unit, 0);
	var prevItemIndex = UnitItemControl.getIndexFromItem(unit, combination.item);
	if (combination.item.isWeapon()){
		combination.item.custom.EquippedRS = true
	}
	if (itemHead.isWeapon()){
		itemHead.custom.EquippedRS = false
	}
	return SetAIWeapon0.call(this, unit, combination)
};

var SetAIWeapon1 = AIScorer.Weapon._resetTemporaryWeapon;
AIScorer.Weapon._resetTemporaryWeapon = function(unit, combination, prevItemIndex) {
	var itemHead = UnitItemControl.getItem(unit, 0);
	var item = UnitItemControl.getItem(unit, prevItemIndex);
	if (itemHead.isWeapon()){
		itemHead.custom.EquippedRS = false
	}
	if (item.isWeapon()){
		item.custom.EquippedRS = true
	}
	SetAIWeapon1.call(this, unit, combination, prevItemIndex)
};

// Removed function. Feature may not be possible. Sets item to inventory with dual inventory pages.
UnitItemControl.pushItem = function(unit, item) {
	if (item.isWeapon()){
		var count = this.getPossessionWeaponOnly(unit)
		var spare = this.getPossessionItemOnly(unit)
	}
	else{
		var count = this.getPossessionItemOnly(unit)
		var spare = this.getPossessionWeaponOnly(unit)
	}
	var max = DataConfig.getMaxUnitItemCount()
	this.arrangeItem(unit);
	var i = 0;
	while (i < max){
		if (unit.getItem(i) === null){
			unit.setItem(i, item)
			return true
		}
		i++
	}
	return false;
};

ItemChangeControl._increaseUnitItem = function(unit, targetItem) {
	var arr = [];
	if (targetItem.isWeapon()){
		if (!UnitItemControl.isUnitWeaponOnlySpace(unit)) {
			arr.push(targetItem);
			return arr;
		}
	}
	else{
		if (!UnitItemControl.isUnitItemOnlySpace(unit)) {
			arr.push(targetItem);
			return arr;
		}
	}
	
	UnitItemControl.pushItem(unit, targetItem);
	
	// Update because new item is possessed.
	ItemControl.updatePossessionItem(unit);
	
	return arr;
};

var AttackPlsStopThis = UnitCommand.Attack._startSelection;
UnitCommand.Attack._startSelection = function(weapon) {
	var unit = this.getCommandTarget();
	var filter = this._getUnitFilter();
	var indexArray = this._getIndexArray(unit, weapon);
	
	// Equip with the selected item.
	ItemControl.setEquippedWeapon(unit, weapon);
	weapon.custom.EquippedRS = true
	this._posSelector.setUnitOnly(unit, weapon, indexArray, PosMenuType.Attack, filter);
	this._posSelector.setFirstPos();
	
	this.changeCycleMode(AttackCommandMode.SELECTION);
};

UnitItemControl.isUnitWeaponOnlySpace = function(unit, item){
	return this.getPossessionWeaponOnly(unit) < Math.ceil(DataConfig.getMaxUnitItemCount()/2)
};

UnitItemControl.isUnitItemOnlySpace = function(unit, item){
	return this.getPossessionItemOnly(unit) < Math.ceil(DataConfig.getMaxUnitItemCount()/2)
};

UnitItemFull.setItemFullData = function(unit, item) {
	BaseItemFull.setItemFullData.call(this, unit, item);
	if (item.isWeapon()){
		this._itemListWindow = createWindowObject(RSWeaponWindow, this)
		this._itemListWindow.setDefaultItemFormation();
		this._itemListWindow.enableWarningState(true);
	}
	else{
		this._itemListWindow = createWindowObject(ItemOnlyWindow, this)
		this._itemListWindow.setDefaultItemFormation();
		this._itemListWindow.enableWarningState(true);
	}
	this._itemListWindow.setUnitItemFormation(this._unit);
	this._itemListWindow.setActive(true);
	
	this.changeCycleMode(UnitItemFullMode.TOP);
}

UnitItemFull._moveStockQuestion = function() {
	if (this._questionWindow.moveWindow() !== MoveResult.CONTINUE) {
		if (this._questionWindow.getQuestionAnswer() === QuestionAnswer.YES) {
			if (this._targetItem.custom.EquippedRS){
				this._targetItem.custom.EquippedRS = false;
			}
			// Send the obtained item to the stock.
			StockItemControl.pushStockItem(this._targetItem);
			return MoveResult.END;
		}
		else {
			this._itemListWindow.enableSelectCursor(true);
			this.changeCycleMode(UnitItemFullMode.TOP);
		}
	}
	
	return MoveResult.CONTINUE;
}

StockItemTradeScreen._storeItem = function() {
	var index = this._unitItemWindow.getItemIndex();
	var item = UnitItemControl.getItem(this._unit, index);
	
	if (item === null) {
		return;
	}
	if (item.custom.EquippedRS){
		item.custom.EquippedRS = false
	}
	this._cutUnitItem(index);
	this._pushStockItem(item);
	
	this._updateListWindow();
};

var setItemWorkDataAlias = ItemWorkWindow.setItemWorkData;
ItemWorkWindow.setItemWorkData = function(item) {
	setItemWorkDataAlias.call(this, item);
	if (item.isWeapon()) {
		arr = [StringTable.ItemWork_Equipment, StringTable.ItemWork_Discard];
		this._scrollbar.setObjectArray(arr);
	}
}

var exchangeItemAlias = UnitItemTradeScreen._exchangeItem;
UnitItemTradeScreen._exchangeItem = function() {
	var unitSrc = this._getTargetUnit(this._isSrcSelect);
	var unitDest = this._getTargetUnit(this._isSrcScrollbarActive);
	var srcIndex = this._selectIndex;
	var destIndex = this._getTargetIndex();
	var itemSrc = unitSrc.getItem(srcIndex);
	var itemDest = unitDest.getItem(destIndex);
	if (itemDest != null && itemDest === ItemControl.getEquippedWeapon(unitDest)){
		if (!ItemControl.isWeaponAvailable(unitSrc, itemDest)){
			itemDest.custom.EquippedRS = false;
		}
		else{
			itemDest.custom.EquippedRS = true;
		}
	}
	else{
		if (itemDest !== null && itemDest.isWeapon()){
			itemDest.custom.EquippedRS = false;
		}
	}
	if (itemSrc != null && itemSrc === ItemControl.getEquippedWeapon(unitSrc)){
		if (!ItemControl.isWeaponAvailable(unitDest, itemSrc)){
			itemSrc.custom.EquippedRS = false;
		}
		else{
			itemSrc.custom.EquippedRS = true;
		}
	}
	else{
		if (itemSrc !== null && itemSrc.isWeapon()){
			itemSrc.custom.EquippedRS = false;
		}
	}
	exchangeItemAlias.call(this);
};

var tradeSelectAlias = UnitItemTradeScreen._moveTradeSelect;
UnitItemTradeScreen._moveTradeSelect = function() {
	// Check if the selection key was pressed in a state of selecting the item.
	if (this._isSelect) {
		if (!this._isTradable()) {
			this._playWarningSound();
			return MoveResult.CONTINUE;
		}
		
		// Swap the item.
		this._exchangeItem();
		
		// Update the window due to swap.
		this._updateListWindow();

		// Deactivate the selection state.
		this._selectCancel();
		
		// Update by changing the item.
		ItemControl.updatePossessionItem(this._unitSrc);
		ItemControl.updatePossessionItem(this._unitDest);
		
	}
	else {
		// Save the position to select.
		this._selectIndex = this._getTargetIndex();
		
		// Save if the selection was done at trade source or trade destination.
		this._isSrcSelect = this._isSrcScrollbarActive;
		
		// Set as a selection state.
		this._isSelect = true;
		
		// By calling setForceSelect, always display the cursor at the selected position.
		if (this._isSrcSelect) {
			this._itemListSrc.setForceSelect(this._selectIndex);
		}
		else {
			this._itemListDest.setForceSelect(this._selectIndex);
		}
	}
	
	return MoveResult.CONTINUE;
};

var setEquippedRSCustomParam = function(srcIndex, destIndex, itemSrc, itemDest) {
}

StockItemTradeScreen.isExtractAllowed = function() {
	// No stock item exists, no more items can be withdrawn.
	if (StockItemControl.getStockItemCount() === 0) {
		return false;
	}
	
	// No blank at the unit item, no more item can be withdrawn.
	if (!UnitItemControl.isUnitItemSpace(this._unit)) {
		return false;
	}
	var item = this._itemInfoWindow.getInfoItem()
	if (item != null){
		if (item.isWeapon()){
			if (!UnitItemControl.isUnitWeaponOnlySpace(this._unit)){
				return false;
			}
		}
		else{
			if (!UnitItemControl.isUnitItemOnlySpace(this._unit)){
				return false;
			}
		}
	}
	
	return true;
};

StockItemTradeScreen._moveExtract = function() {
	var item;
	var input = this._stockItemWindow.moveWindow();
	
	if (input === ScrollbarInput.SELECT) {	
		var check = this._stockItemWindow.getCurrentItem()
		if (check != null && check.isWeapon() && !UnitItemControl.isUnitWeaponOnlySpace(this._unit)){
			MediaControl.soundDirect('operationblock');
		}
		else if (check != null && !check.isWeapon() && !UnitItemControl.isUnitItemOnlySpace(this._unit)){
			MediaControl.soundDirect('operationblock');
		}
		else{
			// Take the item out.
			this._extractItem();
			
			if (!this.isExtractAllowed()) {
				this._processMode(StockItemTradeMode.OPERATION);
				this._itemInfoWindow.setInfoItem(null);
			}
			
			// If trade is done even once, set true.
			this._isAction = true;
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
}
	
var CheckTradeCL0 = UnitItemTradeScreen._isTradable;
UnitItemTradeScreen._isTradable = function() {
	var result = CheckTradeCL0.call(this);
	var srcItem = this._getSelectedItem(this._itemListSrc)
	var destItem = this._getSelectedItem(this._itemListDest)
	var unitSrc = this._getTargetUnit(this._isSrcSelect);
	var unitDest = this._getTargetUnit(this._isSrcScrollbarActive);
	if (srcItem == null && destItem != null){
		if (!UnitItemControl.isWeaponOnlySpace(unitDest) && destItem.isWeapon()){
			return false;
		}
		else if (!UnitItemControl.isItemOnlySpace(unitDest) && !destItem.isWeapon()){
			return false;
		}
	}
	if (srcItem != null && destItem == null){
		if (!UnitItemControl.isWeaponOnlySpace(unitDest) && srcItem.isWeapon()){
			return false;
		}
		else if (!UnitItemControl.isItemOnlySpace(unitDest) && !srcItem.isWeapon()){
			return false;
		}
	}
	if (!this._isSameTypeOrEmpty(srcItem, destItem)){
		return false;
	}
	return result;
}

UnitItemTradeScreen._isSameTypeOrEmpty = function(srcItem, destItem){
	if (srcItem == null || destItem == null){
		return true;
	}
	if (srcItem.isWeapon() && destItem.isWeapon()){
		return true;
	}
	if (!srcItem.isWeapon() && !destItem.isWeapon()){
		return true;
	}
	return false;
}