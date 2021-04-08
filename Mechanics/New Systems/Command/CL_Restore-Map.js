/*
When you wish to store a copy of the map, run the following command.

CL_TerrainFixer.initialize()

When you change much of the map, you may run the following command to
restore the most recent change.

CL_TerrainFixer.restore()

To pick a specific index out of the array of changes, run
the following command. Note that "i" will be automatically
checked for array length, and if it is too high it will not
run the command.

CL_TerrainFixer.restoreIndex(i)

To bind a change to a specific unit, run these commands.
Note that "u" must be a specific Unit object.

CL_TerrainFixer.pushByUnit(u)
CL_TerrainFixer.restoreByUnit(u)

To only make changes if a local switch is on, run
the following commands. Note that sID will be automatically
checked and if it is too high, it will not run the command.

CL_TerrainFixer.initializeBySwitch(sID)
CL_TerrainFixer.restoreBySwitch(sID)

To wipe all changes, run the following command.
This will get rid of everything!
Use when it gets resource heavy.

To save and restore only if switches are on, 

CL_TerrainFixer.wipe()

That is all. Thank you for using my scripts.
-Rogue Claris, 8/14/2020
*/

var CL_TerrainFixer = {
	//call this to push a new array set.
	initialize: function(){
		//get current session.
		var SessionCL = root.getCurrentSession();
		//if the local map exists...
		if (SessionCL.getCurrentMapInfo() != null){
			//get the info again.
			var info = SessionCL.getCurrentMapInfo();
			//make two arrays.
			var terrainArrayLayerCL = [];
			var terrainArrayNonLayerCL = [];
			//prepare two integer variables.
			var i, j;
			//loop over them as coordinates.
			for (i = 0; i < CurrentMap.getWidth(); i++){
				for (j = 0; j < CurrentMap.getHeight(); j++){
					//push the graphics handles for the transparent layer map
					terrainArrayLayerCL.push(SessionCL.getMapChipGraphicsHandle(i, j, true));
					//push the graphics handles for the nontransparent layer map
					terrainArrayNonLayerCL.push(SessionCL.getMapChipGraphicsHandle(i, j, false));
				}
			}
			//if the global arrays are undefined, make them before pushing.
			if (root.getMetaSession().global.terrainArrayLayerCL === null || root.getMetaSession().global.terrainArrayLayerCL === undefined){
				root.getMetaSession().global.terrainArrayLayerCL = []
			}
			root.getMetaSession().global.terrainArrayLayerCL.push(terrainArrayLayerCL)
			if (root.getMetaSession().global.terrainArrayNonLayerCL === null || root.getMetaSession().global.terrainArrayNonLayerCL === undefined){
				root.getMetaSession().global.terrainArrayNonLayerCL = []
			}
			root.getMetaSession().global.terrainArrayNonLayerCL.push(terrainArrayNonLayerCL)
			return true;
		}
		return false;
	},
	//only initialize if a switch is on.
	initializeBySwitch: function(sID){
		var SessionCL = root.getCurrentSession()
		if (SessionCL.getCurrentMapInfo() != null){
			var info = SessionCL.getCurrentMapInfo();
			var isOn = info.getLocalSwitchTable().isSwitchOn(info.getLocalSwitchTable().getSwitchIndexFromId(sID))
			if (isOn){
				this.initialize()
			}
		}
	},
	//restore the most recent initialize.
	restore: function(){
		var SessionCL = root.getCurrentSession()
		if (SessionCL.getCurrentMapInfo() != null){
			var generator = root.getEventGenerator();
			var e = 0;
			var h = 0;
			var i, j, x, y
			//check the global array.
			if (typeof root.getMetaSession().global.terrainArrayNonLayerCL === "object"){
				//pop it to get the most recent array within the array. oh joy.
				var arr = root.getMetaSession().global.terrainArrayNonLayerCL.pop()
				//loop over map.
				for (i = 0; i < CurrentMap.getWidth(); i++){
					for (j = 0; j < CurrentMap.getHeight(); j++){
						//if h is still smaller than the array size...
						if (h < arr.length){
							//change the map tile.
							generator.mapChipChange(i, j, false, arr[h])
							//increment h.
							h++
						}
					}
				}
			}
			//do the same with the layer array and e instead of h. I don't know why I cared when I reused i and j.
			if (typeof root.getMetaSession().global.terrainArrayLayerCL === "object"){
				var arr = root.getMetaSession().global.terrainArrayLayerCL.pop()
				for (i = 0; i < CurrentMap.getWidth(); i++){
					for (j = 0; j < CurrentMap.getHeight(); j++){
						if (e < arr.length){
							generator.mapChipChange(i, j, false, arr[e])
							e++
						}
					}
				}
			}
			//execute the changes.
			generator.execute()
			return true;
		}
		return false;
	},
	//restore from a specific index.
	restoreIndex: function(l){
		var SessionCL = root.getCurrentSession()
		if (SessionCL.getCurrentMapInfo() != null){
			var generator = root.getEventGenerator();
			var e = 0;
			var h = 0;
			var i, j, x, y
			if (typeof root.getMetaSession().global.terrainArrayNonLayerCL === "object"){
				if (l < root.getMetaSession().global.terrainArrayNonLayerCL.length){
					var arr = root.getMetaSession().global.terrainArrayNonLayerCL[l]
					for (i = 0; i < CurrentMap.getWidth(); i++){
						for (j = 0; j < CurrentMap.getHeight(); j++){
							if (h < arr.length){
								generator.mapChipChange(i, j, false, arr[h])
								h++
							}
						}
					}
				}
			}
			if (typeof root.getMetaSession().global.terrainArrayLayerCL === "object"){
				if (l < root.getMetaSession().global.terrainArrayLayerCL.length){
					var arr = root.getMetaSession().global.terrainArrayLayerCL[l]
					for (i = 0; i < CurrentMap.getWidth(); i++){
						for (j = 0; j < CurrentMap.getHeight(); j++){
							if (e < arr.length){
								generator.mapChipChange(i, j, false, arr[e])
								e++
							}
						}
					}
				}
			}
			generator.execute()
			return true;
		}
		return false;
	},
	//restore but only if a local switch is on.
	restoreBySwitch: function(sID){
		var SessionCL = root.getCurrentSession()
		if (SessionCL.getCurrentMapInfo() != null && SessionCL.getCurrentMapInfo().getLocalSwitchTable().isSwitchOn(SessionCL.getCurrentMapInfo().getLocalSwitchTable().getSwitchIndexFromId(sID))){
			var generator = root.getEventGenerator();
			var e = 0;
			var h = 0;
			var i, j, x, y
			if (typeof root.getMetaSession().global.terrainArrayNonLayerCL === "object"){
				var arr = root.getMetaSession().global.terrainArrayNonLayerCL.pop()
				for (i = 0; i < CurrentMap.getWidth(); i++){
					for (j = 0; j < CurrentMap.getHeight(); j++){
						if (h < arr.length){
							generator.mapChipChange(i, j, false, arr[h])
							h++
						}
					}
				}
			}
			if (typeof root.getMetaSession().global.terrainArrayLayerCL === "object"){
				var arr = root.getMetaSession().global.terrainArrayLayerCL.pop()
				for (i = 0; i < CurrentMap.getWidth(); i++){
					for (j = 0; j < CurrentMap.getHeight(); j++){
						if (e < arr.length){
							generator.mapChipChange(i, j, false, arr[e])
							e++
						}
					}
				}
			}
			generator.execute()
			return true;
		}
		return false;
	},
	//this is a fun one. restore unit-based change.
	//meant for unit events.
	//find the unit push below.
	restoreByUnit: function(unit){
		var SessionCL = root.getCurrentSession()
		if (SessionCL.getCurrentMapInfo() != null){
			var generator = root.getEventGenerator();
			var e = 0;
			var h = 0;
			var i, j, x, y
			var list = root.getMetaSession().global.unitTerrainArrayUnitList
			var arrIndex = null;
			var u = 0;
			while (arrIndex === null && u < list.length){
				//make sure it matches the unit in every way conceivable.
				if (list[u][0] === unit.getName() && list[u][1] === unit.getId() && list[u][2] === unit.getUnitType()){
					arrIndex = u
				}
				//if the arrIndex isn't found, increment "u".
				if (typeof arrIndex !== 'number'){
					++u
				}
			}
			if (u < list.length){
				var arr1 = root.getMetaSession().global.unitTerrainArrayLayerCL[u]
				var arr2 = root.getMetaSession().global.unitTerrainArrayNonLayerCL[u]
				for (i = 0; i < CurrentMap.getWidth(); i++){
					for (j = 0; j < CurrentMap.getHeight(); j++){
						if (h < arr1.length){
							generator.mapChipChange(i, j, false, arr1[h])
							h++
						}
						if (e < arr2.length){
							generator.mapChipChange(i, j, false, arr2[e])
							e++
						}
					}
				}
			}
			generator.execute()
			return true;
		}
		return false;
	},
	//push a change specific to a unit.
	//it will only be restorable with that unit.
	pushByUnit: function(unit){
		var SessionCL = root.getCurrentSession()
		if (SessionCL.getCurrentMapInfo() != null){
			var info = SessionCL.getCurrentMapInfo()
			var unitTerrainArrayLayerCL = []
			var unitTerrainArrayNonLayerCL = []
			var unitTerrainArrayUnitList = []
			var i, j
			for (i = 0; i < CurrentMap.getWidth(); i++){
				for (j = 0; j < CurrentMap.getHeight(); j++){
					unitTerrainArrayLayerCL.push(SessionCL.getMapChipGraphicsHandle(i, j, true))
					unitTerrainArrayNonLayerCL.push(SessionCL.getMapChipGraphicsHandle(i, j, false))
				}
			}
			unitTerrainArrayUnitList.push(unit.getName())
			unitTerrainArrayUnitList.push(unit.getId())
			unitTerrainArrayUnitList.push(unit.getUnitType())
			if (root.getMetaSession().global.unitTerrainArrayUnitList === null || root.getMetaSession().global.unitTerrainArrayUnitList === undefined){
				root.getMetaSession().global.unitTerrainArrayUnitList = []
			}
			root.getMetaSession().global.unitTerrainArrayUnitList.push(unitTerrainArrayUnitList)
			if (root.getMetaSession().global.unitTerrainArrayLayerCL === null || root.getMetaSession().global.unitTerrainArrayLayerCL === undefined){
				root.getMetaSession().global.unitTerrainArrayLayerCL = []
			}
			root.getMetaSession().global.unitTerrainArrayLayerCL.push(unitTerrainArrayLayerCL)
			if (root.getMetaSession().global.unitTerrainArrayNonLayerCL === null || root.getMetaSession().global.unitTerrainArrayNonLayerCL === undefined){
				root.getMetaSession().global.unitTerrainArrayNonLayerCL = []
			}
			root.getMetaSession().global.unitTerrainArrayNonLayerCL.push(unitTerrainArrayNonLayerCL)
			return true;
		}
		return false;
	},
	//get rid of EVERYTHING!
	wipe: function(){
		delete root.getMetaSession().global.terrainArrayLayerCL
		delete root.getMetaSession().global.terrainArrayNonLayerCL
		delete root.getMetaSession().global.unitTerrainArrayLayerCL
		delete root.getMetaSession().global.unitTerrainArrayNonLayerCL
		delete root.getMetaSession().global.unitTerrainArrayUnitList
	}
}
