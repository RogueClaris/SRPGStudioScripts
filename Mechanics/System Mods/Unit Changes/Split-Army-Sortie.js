/*
Enables the player to hide some of the units on the Sortie / Battle Prep screen,
to enable a project with two paths. Give maps meant for another army the custom
parameter {Divided:true,Army:"text"}, and units meant for the other army the parameter
{Army:"text"}. The text can be anything. If the two armies are to merge at some point,
run the following in a Code Execution command during an Opening Event, before anyone
shows up on-screen: ArmyControl.Wipe("text") - and then you're good to go! You can also
restore armies with ArmyControl.Restore("text"), as well as being able to wipe and restore
all armies with ArmyControl.WipeAll() and ArmyControl.RestoreAll(), respectively.
Enjoy your split-path games!
-Lady Rena, July 13th, 2020.
*/

var SAS001 = UnitSortieScreen._createUnitList
UnitSortieScreen._createUnitList = function() {
	var List = SAS001.call(this);
	var CurMap = root.getCurrentSession().getCurrentMapInfo()
	var List2 = null;
	if (CurMap.custom.Divided && typeof CurMap.custom.Army === "string"){
		List2 = PlayerList.getArmyList(CurMap.custom.Army);
	}
	else{
		List2 = PlayerList.getArmyless();
	}
	if (List2 !== null && List2.getCount() > 0){
		return List2;
	}
	return List;
};

var SAS002 = SortieSetting._arrangeUnitPos;
SortieSetting._arrangeUnitPos = function() {
	var CurMap = root.getCurrentSession().getCurrentMapInfo()
	if (CurMap.custom.Divided && typeof CurMap.custom.Army === "string"){
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
	else{
		SAS002.call(this)
	}
};

var SAS003 = SortieSetting._setInitialUnitPos;
SortieSetting._setInitialUnitPos = function(){
	var CurMap = root.getCurrentSession().getCurrentMapInfo()
	if (CurMap.custom.Divided && typeof CurMap.custom.Army === "string"){
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
	else{
		SAS003.call(this)
	}
};

var SAS004 = SortieSetting._clearSortieList;
SortieSetting._clearSortieList = function() {
	var CurMap = root.getCurrentSession().getCurrentMapInfo()
	if (CurMap.custom.Divided && typeof CurMap.custom.Army === "string"){
		var i, unit;
		var list = PlayerList.getArmyList(CurMap.custom.Army);
		var count = list.getCount();
		
		// All units are set as no sortie states.
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			this.nonsortieUnit(unit);
		}
	}
	else{
		SAS004.call(this)
	}
};

var SAS005 = SortieSetting.setSortieMark;
SortieSetting.setSortieMark = function(index) {
	var CurMap = root.getCurrentSession().getCurrentMapInfo()
	if (CurMap.custom.Divided && typeof CurMap.custom.Army === "string"){
		var list = PlayerList.getArmyList(CurMap.custom.Army);
		if (index >= list.getCount()){
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
	else{
		return SAS005.call(this, index);
	}
}

PlayerList.getArmyList = function(ArmyParam){
	return AllUnitList.getArmyList(this.getMainList(),ArmyParam);
};

AllUnitList.getArmyList = function(list,ArmyParam){
	var funcCondition = function(unit) {
		return unit.getAliveState() === AliveType.ALIVE && FusionControl.getFusionParent(unit) === null && unit.custom.Army === ArmyParam;
	};
	
	return this.getList(list, funcCondition);
};

PlayerList.getArmyless = function(){
	return AllUnitList.getArmyless(this.getMainList())
};

AllUnitList.getArmyless = function(list){
	var funcCondition = function(unit) {
		return unit.getAliveState() === AliveType.ALIVE && FusionControl.getFusionParent(unit) === null && (unit.custom.Army === null || unit.custom.Army === undefined);
	};
	
	return this.getList(list, funcCondition);
};

ArmyControl = {
	
	Wipe: function(param){
		var List = PlayerList.getArmyList(param);
		var i, unit;
		for (i = 0; i < List.getCount(); i++){
			unit = List.getData(i)
			unit.custom.RSBackupArmy = unit.custom.Army
			delete unit.custom.Army
		}
	},
	
	WipeAll: function(){
		var List = PlayerList.getAliveList();
		var i, unit;
		for (i = 0; i < List.getCount(); i++){
			unit = List.getData(i)
			if (unit.custom.Army !== null || unit.custom.Army !== undefined){
				unit.custom.RSBackupArmy = unit.custom.Army
				delete unit.custom.Army
			}
		}
	},
	
	Restore: function(param){
		var List = PlayerList.getAliveList();
		var i, unit;
		for (i = 0; i < List.getCount(); i++){
			unit = List.getData(i)
			if (typeof unit.custom.RSBackupArmy == 'string' && unit.custom.RSBackupArmy == param){
				unit.custom.Army = unit.cusotm.RSBackupArmy
			}
		}
	},
	
	RestoreAll: function(){
		var List = PlayerList.getAliveList();
		var i, unit;
		for (i = 0; i < List.getCount(); i++){
			unit = List.getData(i)
			if (typeof unit.custom.RSBackupArmy == 'string'){
				unit.custom.Army = unit.cusotm.RSBackupArmy
			}
		}
	}
};