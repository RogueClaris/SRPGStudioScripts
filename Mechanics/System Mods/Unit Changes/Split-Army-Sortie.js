/*
Enables the player to hide some of the units on the Sortie / Battle Prep screen,
to enable a project with two paths.

Maps meant for your main army need the Custom Parameter like so:

{Army:"text"}

Additionally, all units need this custom parameter.

Maps meant for your second army need this additional custom parameter:

{Divided:true}

So a map for your second army should have custom parameters like this:

{Divided:true, Army:"text"}

If the two armies are to merge at some point, run the following
in a Code Execution command during an Opening Event, before anyone
shows up on-screen:

ArmyControl.Wipe("text")

You can restore armies with ArmyControl.Restore("text"),
as well as being able to wipe and restore all armies with
ArmyControl.WipeAll() and ArmyControl.RestoreAll(), respectively.

Enjoy your split-path games!
-DawnSRPG, July 13th, 2020.

ADDENDUM, OCTOBER 8TH, 2022:
Implemented split inventory mecahnics for 2 armies using custom-placeevent
code from official plugin by SapphireSoft. Also added convoy merging.

The commands are:

ArmyControl.serialize()
	-Run at the end of a map where you wish to change armies, during an Ending Event.
	  This will empty the convoy of all items and mark them as belonging to the current
	 Army. It should work during Base as well, as long as the Base is marked with a
	  Custom Parameter:
			{Army:"text"}
	  If this Custom Parameter matches the army you are currently playing, it will work.

ArmyControl.deserialize()
	-Run at the beginning of a map where you have changed to the other army.
	This will restore the convoy of that army.

ArmyControl.mergeConvoy()
	-Run when you merge both armies.
	This will give you all items from both armies in one convoy.

Items given during Initial Data will all belong to the army you start with.
If you wish to share the convoy, do not serialize.
*/

var SAS002 = SortieSetting._arrangeUnitPos;
SortieSetting._arrangeUnitPos = function () {
	var CurMap = root.getCurrentSession().getCurrentMapInfo()
	if (typeof CurMap.custom.Army === "string") {
		this._clearSortieList()
		var i, j, unit, x, y;
		var list = PlayerList.getArmyList(CurMap.custom.Army);
		var count = list.getCount();
		var count2 = this._sortiePosArray.length;
		var arr = [];

		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			x = unit.getMapX();
			y = unit.getMapY();
			for (j = 0; j < count2; j++) {
				if (this._sortiePosArray[j].x === x && this._sortiePosArray[j].y === y) {
					this._sortiePosArray[j].unit = unit;
					this._sortiePosArray[j].isFixed = this._getForceSortieNumber(unit) > 0;
					break;
				}
			}

			if (j === count2) {
				// If the unit position is not certain by the op event,
				// or the sortie position is changed with the project, the unit may not be set as _sortiePosArray.
				// Record such unit who cannot be set. 
				arr.push(unit);
			}
		}

		count = arr.length;
		for (i = 0; i < count; i++) {
			unit = arr[i];
			for (j = 0; j < count2; j++) {
				// The position in which the unit is not set was found, so set the unit. 
				if (this._sortiePosArray[j].unit === null) {
					this._sortiePosArray[j].unit = unit;
					this._sortiePosArray[j].isFixed = this._getForceSortieNumber(unit) > 0;
					unit.setMapX(this._sortiePosArray[j].x);
					unit.setMapY(this._sortiePosArray[j].y);
					break;
				}
			}
		}
	}
	else {
		SAS002.call(this)
	}
};

var SAS003 = SortieSetting._setInitialUnitPos;
SortieSetting._setInitialUnitPos = function () {
	var CurMap = root.getCurrentSession().getCurrentMapInfo()
	if (typeof CurMap.custom.Army === "string") {
		var i, unit;
		var list = PlayerList.getArmyList(CurMap.custom.Army);
		var count = list.getCount();
		var maxCount = this._sortiePosArray.length;
		var sortieCount = 0;

		// If the save is executed even once on the battle setup scene on the current map, func returns false. 
		if (!root.getMetaSession().isFirstSetup()) {
			// Initialize the unit of _sortiePosArray as a reference of the current unit position.
			this._arrangeUnitPos();
			return;
		}

		// If the battle setup scene is displayed for the first time, the subsequent process sets the sortie state automatically.

		this._clearSortieList();

		// The unit of force sortie (the specified position) is set to be a sortie state in order.
		for (i = 0; i < count && sortieCount < maxCount; i++) {
			unit = list.getData(i);
			if (this.isForceSortie(unit)) {
				if (this._sortieFixedUnit(unit)) {
					sortieCount++;
				}
			}
		}

		// The unit of force sortie (the unspecified position) is set to be a sortie state in order.
		for (i = 0; i < count && sortieCount < maxCount; i++) {
			unit = list.getData(i);
			if (this.isForceSortie(unit) && unit.getSortieState() !== SortieType.SORTIE) {
				if (this._sortieForceUnit(unit)) {
					sortieCount++;
				}
			}
		}

		// The other units are set to be sortie states in order.
		for (i = 0; i < count && sortieCount < maxCount; i++) {
			unit = list.getData(i);
			if (unit.getSortieState() !== SortieType.SORTIE) {
				if (this._sortieUnit(unit)) {
					sortieCount++;
				}
			}
		}
	}
	else {
		SAS003.call(this)
	}
};

var SAS004 = SortieSetting._clearSortieList;
SortieSetting._clearSortieList = function () {
	var CurMap = root.getCurrentSession().getCurrentMapInfo()
	if (typeof CurMap.custom.Army === "string") {
		var i, unit;
		var list = PlayerList.getArmyList(CurMap.custom.Army);
		var count = list.getCount();

		// All units are set as no sortie states.
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			this.nonsortieUnit(unit);
		}
	}
	else {
		SAS004.call(this)
	}
};

var SAS005 = SortieSetting.setSortieMark;
SortieSetting.setSortieMark = function (index) {
	var CurMap = root.getCurrentSession().getCurrentMapInfo()
	if (typeof CurMap.custom.Army === "string") {
		var list = PlayerList.getArmyList(CurMap.custom.Army);
		if (index >= list.getCount()) {
			return false;
		}
		var unit = list.getData(index);

		if (!this.isForceSortie(unit)) {
			if (unit.getSortieState() === SortieType.UNSORTIE) {
				this._sortieUnit(unit);
			}
			else {
				this.nonsortieUnit(unit);
			}
		}
		else {
			return false;
		}

		return true;
	}
	else {
		return SAS005.call(this, index);
	}
}

PlayerList.getAliveList = function () {
	var mapInfo = root.getCurrentSession().getCurrentMapInfo();
	var restArea = root.getRestPreference().getActiveRestArea();
	var army;
	if (mapInfo === null) {
		if (typeof restArea.custom.Army === "string") {
			army = restArea.custom.Army;
		}
	}
	else {
		if (typeof mapInfo.custom.Army === "string") {
			army = mapInfo.custom.Army;
		}
	}
	if (typeof army == "string") {
		return PlayerList.getArmyList(army);
	}
	return AllUnitList.getAliveList(this.getMainList());
}

PlayerList.getArmyList = function (ArmyParam) {
	return AllUnitList.getArmyList(this.getMainList(), ArmyParam);
};

AllUnitList.getArmyList = function (list, ArmyParam) {
	var funcCondition = function (unit) {
		return unit.getAliveState() === AliveType.ALIVE && FusionControl.getFusionParent(unit) === null && unit.custom.Army === ArmyParam;
	};

	return this.getList(list, funcCondition);
};

var UnitDivisionStockControlCL0 = UnitItemControl.getItem;
var UnitDivisionStockControlCL1 = UnitItemControl.setItem;
var UnitDivisionStockControlCL2 = StockItemControl.pushStockItem;

UnitItemControl.getItem = function (unit, index) {
	var result = UnitDivisionStockControlCL0.call(this, unit, index);
	if (unit != null && typeof unit.custom.Army === "string" && result) {
		result.custom.Army = unit.custom.Army;
	}
	return result;
};

UnitItemControl.setItem = function (unit, index, item) {
	UnitDivisionStockControlCL1.call(this, unit, index, item);
	if (item != null && unit != null && typeof unit.custom.Army === "string") {
		item.custom.Army = unit.custom.Army;
	}
};

StockItemControl.pushStockItem = function (item) {
	if (item != null && typeof item.custom.Army !== "string") {
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		var restArea = root.getRestPreference().getActiveRestArea();
		if (mapInfo === null) {
			if (typeof restArea.custom.Army === "string") {
				item.custom.Army = restArea.custom.Army;
			}
		}
		else {
			if (typeof mapInfo.custom.Army === "string") {
				item.custom.Army = mapInfo.custom.Army;
			}
		}
	}
	UnitDivisionStockControlCL2.call(this, item)
};

ArmyControl = {
	Wipe: function (param) {
		var List = PlayerList.getArmyList(param);
		var i, unit, item;
		for (i = 0; i < List.getCount(); i++) {
			unit = List.getData(i)
			if (unit == null) {
				continue;
			}
			if (unit.custom.Army !== null || unit.custom.Army !== undefined) {
				for (j = 0; j < UnitItemControl.getPossessionItemCount(unit); j++) {
					item = UnitItemControl.getItem(unit, j);
					item.custom.RSBackupArmy = unit.custom.Army;
					delete item.custom.Army;
				};
				unit.custom.RSBackupArmy = unit.custom.Army
				delete unit.custom.Army
			}
		}
	},

	WipeAll: function () {
		var List = PlayerList.getAliveList();
		var i, unit, item;
		for (i = 0; i < List.getCount(); i++) {
			unit = List.getData(i)
			if (unit != null) {
				continue;
			}
			if (unit.custom.Army !== null || unit.custom.Army !== undefined) {
				for (j = 0; j < UnitItemControl.getPossessionItemCount(unit); j++) {
					item = UnitItemControl.getItem(unit, j);
					item.custom.RSBackupArmy = unit.custom.Army;
					delete item.custom.Army;
				};
				unit.custom.RSBackupArmy = unit.custom.Army
				delete unit.custom.Army
			}
		}
	},

	Restore: function (param) {
		var List = PlayerList.getAliveList();
		var i, unit;
		for (i = 0; i < List.getCount(); i++) {
			unit = List.getData(i)
			if (unit != null && typeof unit.custom.RSBackupArmy == 'string' && unit.custom.RSBackupArmy == param) {
				for (j = 0; j < UnitItemControl.getPossessionItemCount(unit); j++) {
					item = UnitItemControl.getItem(unit, j);
					item.custom.Army = unit.custom.RSBackupArmy;
				}
				unit.custom.Army = unit.custom.RSBackupArmy;
			}
		}
	},

	RestoreAll: function () {
		var List = PlayerList.getAliveList();
		var i, unit;
		for (i = 0; i < List.getCount(); i++) {
			unit = List.getData(i)
			if (unit != null && typeof unit.custom.RSBackupArmy == 'string') {
				unit.custom.Army = unit.custom.RSBackupArmy
			}
		}
	},

	WipeConvoy: function () {
		root.getMetaSession().global.MainConvoyCL = [];
		root.getMetaSession().global.SpareConvoyCL = [];
	},

	serialize: function () {
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		var restArea = root.getRestPreference().getActiveRestArea();
		var army = "";
		var divided;
		if (mapInfo === null) {
			if (typeof restArea.custom.Army === "string") {
				army = restArea.custom.Army;
				divided = restArea.custom.Divided === true;
			}
		}
		else {
			if (typeof mapInfo.custom.Army === "string") {
				army = mapInfo.custom.Army;
				divided = mapInfo.custom.Divided === true;
			}
		}
		var i, item, obj;
		var count = StockItemControl.getStockItemCount();
		var arr = [];

		for (i = 0; i < count; i++) {
			item = StockItemControl.getStockItem(i);
			// Save the stock item information at the array.
			// It includes a current durability by calling getLimit.
			obj = {};
			obj.id = item.getId();
			obj.isWeapon = item.isWeapon();
			obj.limit = item.getLimit();
			obj.army = army;
			arr.push(obj);
		}

		if (divided === true) {
			root.getMetaSession().global.SpareConvoyCL = arr;
		}
		else {
			root.getMetaSession().global.MainConvoyCL = arr;
		}

		StockItemControl.getStockItemArray().length = 0;
	},

	// Without passing by the storeroom, they can be restored with the following method,
	// but there is a possibility to reach full stock item.
	deserialize: function () {
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		var restArea = root.getRestPreference().getActiveRestArea();
		var army = "";
		var divided;
		var obj, item, newItem;
		var arr = [];
		var globalCustom = root.getMetaSession().global;
		var weaponList = root.getBaseData().getWeaponList();
		var itemList = root.getBaseData().getItemList();
		var itemArray = StockItemControl.getStockItemArray();
		if (mapInfo === null) {
			if (typeof restArea.custom.Army === "string") {
				army = restArea.custom.Army;
				divided = restArea.custom.Divided === true;
			}
		}
		else {
			if (typeof mapInfo.custom.Army === "string") {
				army = mapInfo.custom.Army;
				divided = mapInfo.custom.Divided === true;
			}
		}

		if (divided === true) {
			arr = globalCustom.SpareConvoyCL;
		}
		else {
			arr = globalCustom.MainConvoyCL;
		}
		if (arr == null) {
			arr = [];
		}

		while (1 && arr.length > 0) {
			obj = arr[0];
			if (obj.isWeapon) {
				item = weaponList.getDataFromId(obj.id);
			}
			else {
				item = itemList.getDataFromId(obj.id);
			}

			if (item !== null) {
				newItem = root.duplicateItem(item);
				newItem.setLimit(obj.limit);
				newItem.custom.Army = army;
				itemArray.push(newItem);
			}

			// An item was taken out, so an element is cut.
			arr.shift();

			// The item in the storeroom has gone or the stock is full.
			if (arr.length === 0 || itemArray.length === DataConfig.getMaxStockItemCount()) {
				break;
			}
		}
	},

	mergeConvoy: function () {
		var obj, item, newItem;
		var arr = [];
		var globalCustom = root.getMetaSession().global;
		var weaponList = root.getBaseData().getWeaponList();
		var itemList = root.getBaseData().getItemList();
		var itemArray = StockItemControl.getStockItemArray();

		arr = globalCustom.SpareConvoyCL;

		if (arr == null) {
			arr = [];
		}

		while (1 && arr.length > 0) {
			obj = arr[0];
			if (obj.isWeapon) {
				item = weaponList.getDataFromId(obj.id);
			}
			else {
				item = itemList.getDataFromId(obj.id);
			}

			if (item !== null) {
				newItem = root.duplicateItem(item);
				newItem.setLimit(obj.limit);
				itemArray.push(newItem);
			}

			// An item was taken out, so an element is cut.
			arr.shift();

			// The item in the storeroom has gone or the stock is full.
			if (arr.length === 0 || itemArray.length === DataConfig.getMaxStockItemCount()) {
				break;
			}
		}

		arr = globalCustom.MainConvoyCL;

		if (arr == null) {
			arr = [];
		}

		while (1 && arr.length > 0) {
			obj = arr[0];
			if (obj.isWeapon) {
				item = weaponList.getDataFromId(obj.id);
			}
			else {
				item = itemList.getDataFromId(obj.id);
			}

			if (item !== null) {
				newItem = root.duplicateItem(item);
				newItem.setLimit(obj.limit);
				itemArray.push(newItem);
			}

			// An item was taken out, so an element is cut.
			arr.shift();

			// The item in the storeroom has gone or the stock is full.
			if (arr.length === 0 || itemArray.length === DataConfig.getMaxStockItemCount()) {
				break;
			}
		}
	}
};