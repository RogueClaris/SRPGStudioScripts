/*
Hello and welcome to the Random Map Generation script!

To use this script will require a lot of inputs on a single command.
They are as follows:

	isRuntime: Set to true if you want to use RTP assets for the map, false otherwise. If unsure, use 0.
	sheetId: The ID of the sheet in your editor. If unsure, use 0.
	WallPos: A two-entry array of numbers indicating the location of the wall tile for your map. Enter like so: [1,0]
	FloorPos: Same as WallPos. Enter like so: [0,0]
	MinRoomSize: The smallest number of tiles a room can be, wide and tall, entered like so: [5,7]
	MaxRoomSize: Just like MinRoomSize. Enter like so: [7,12]
	minRooms: The minimum number of rooms on the map. At least this many will be drawn, if there is space. Enter like so: 3
	maxRooms: The maximum number of rooms on the map. No matter how much space, no more than this will be drawn. Enter like so: 30
	lootMax: The maximum number of items that can spawn in a room. Enter like so: 3
	
Now, to use the last of those parameters, you need a Random Loot Table on your Map's custom parameters. Go to Map Information,
hit Custom Parameters, and enter them like so if you intend to have Loot drops:

{
	RandomLootTable:
	[
		["Antidote","Item",60],
		["Bottle of Soup","Item",45],
		["Cure Leaf","Item",30]
	]
}

The first entry is the item's name. The second item is the type - Item or Weapon. The third is the chance, from either zero or the last item's chance.
In this example, you have a 30% chance of a Cure Leaf, a 15% chance of a Bottle of Soup, and a 15% chance of an Antidote.
To generate a map, run the following command:

RS_TerrainControl.generateMap(isRuntime, sheetId, WallPos, FloorPos, MinRoomSize, MaxRoomSize, minRooms, maxRooms, lootMax)

Do this with the above explained inputs, and you'll do just fine. Enjoy the Script!
-Lady Rena, May 7th, 2020.
*/


//For controlling the dynamic creation of map terrain.
RS_TerrainControl = {
	
	_roomArray: [],
	_lootArray: [],
	_lootPosArray: [],
	
	generateMap: function(isRuntime, sheetId, WallPos, FloorPos, MinRoomSize, MaxRoomSize, minRooms, maxRooms, lootMax){
		this._roomArray = []
		this._lootArray = []
		this._lootPosArray = []
		var CurSession = root.getCurrentSession();
		var CurMap = CurSession.getCurrentMapInfo();
		var MaxRoomSizeX = MaxRoomSize[0]
		var MaxRoomSizeY = MaxRoomSize[1]
		var MinRoomSizeX = MinRoomSize[0]
		var MinRoomSizeY = MinRoomSize[1]
		var BaseList = root.getBaseData().getGraphicsResourceList(GraphicsType.MAPCHIP, isRuntime);
		var colorIndex = CurMap.getMapColorIndex()
		var CollectionList = BaseList.getCollectionData(sheetId, colorIndex)
		var ChipID = CollectionList.getId()
		var Units = PlayerList.getSortieList()
		var FirstUnit = Units.getData(0)
		var Wall = root.createResourceHandle(true, ChipID, colorIndex, WallPos[0], WallPos[1]) //mountain
		var Floor = root.createResourceHandle(true, ChipID, colorIndex, FloorPos[0], FloorPos[1]) //grass road
		var i, z, x3, y3;
		var j = 0;
		for (var w = 0; w < CurMap.getMapWidth(); w++){
			for (var h = 0; h < CurMap.getMapHeight(); h++){
				CurSession.setMapChipGraphicsHandle(w, h, false, Wall)
			}
		}
		while (j < minRooms){
			var ChosenSpotX = Math.floor(Math.random() * ((CurMap.getMapWidth() - 1) - MaxRoomSizeX))
			var ChosenSpotY = Math.floor(Math.random() * ((CurMap.getMapHeight() - 1 ) - MaxRoomSizeY))
			var ChosenWidth = Math.max(MinRoomSizeX, Math.floor(Math.random() * MaxRoomSizeX))
			var ChosenHeight = Math.max(MinRoomSizeY, Math.floor(Math.random() * MaxRoomSizeY))
			var OkaySpot = true
			for (x3 = ChosenSpotX; x3 < ChosenSpotX+ChosenWidth; x3++){
				for (y3 = ChosenSpotY; y3 < ChosenSpotY+ChosenWidth; y3++){
					if (!CurrentMap.isMapInside(x3, y3)){
						OkaySpot = false
						break
					}
				}
				if (!OkaySpot){
					break
				}
			}
			if (this._roomArray.length == 0 && OkaySpot){
				this.generateRoom(Floor, ChosenSpotX, ChosenSpotY, ChosenWidth, ChosenHeight)
				if (FirstUnit != null){
					FirstUnit.setMapX(Math.floor((this._roomArray[this._roomArray.length-1].x1 + this._roomArray[this._roomArray.length-1].x2)/2))
					FirstUnit.setMapY(Math.floor((this._roomArray[this._roomArray.length-1].y1 + this._roomArray[this._roomArray.length-1].y2)/2))
				}
				this.generateLoot(this._roomArray[this._roomArray.length-1], lootMax)
				j++
			}
			else if (this._roomArray.length > 0 && OkaySpot){
				z = 0;
				found = false
				while (z < this._roomArray.length && !found){
					if (this.intersect(this._roomArray[z], ChosenSpotX, ChosenSpotX + ChosenWidth, ChosenSpotY, ChosenSpotY + ChosenHeight)){
						found = true
					}
					z++
				}
				if (!found && OkaySpot){
					this.generateRoom(Floor, ChosenSpotX, ChosenSpotY, ChosenWidth, ChosenHeight)
					var PrevX = Math.floor((this._roomArray[this._roomArray.length-2].x1 + this._roomArray[this._roomArray.length-2].x2) / 2)
					var PrevY = Math.floor((this._roomArray[this._roomArray.length-2].y1 + this._roomArray[this._roomArray.length-2].y2) / 2)
					var NewX = Math.floor((this._roomArray[this._roomArray.length-1].x1 + this._roomArray[this._roomArray.length-1].x2) / 2)
					var NewY = Math.floor((this._roomArray[this._roomArray.length-1].y1 + this._roomArray[this._roomArray.length-1].y2) / 2)
					this.generateLoot(this._roomArray[this._roomArray.length-1], lootMax)
					if (Math.floor(Math.random()*1) == 1){
						this.generateHorizontalTunnel(PrevX, NewX, PrevY, Floor)
						this.generateVerticalTunnel(PrevY, NewY, NewX, Floor)
					}
					else{
						this.generateVerticalTunnel(PrevY, NewY, PrevX, Floor)
						this.generateHorizontalTunnel(PrevX, NewX, NewY, Floor)
					}
					j++
				}
			}
			j++
		}
		for (i = minRooms; i < maxRooms; i++){
			ChosenSpotX = Math.floor(Math.random() * ((CurMap.getMapWidth() - 1) - MaxRoomSizeX))
			ChosenSpotY = Math.floor(Math.random() * ((CurMap.getMapHeight() - 1) - MaxRoomSizeY))
			ChosenWidth = Math.max(MinRoomSizeX, Math.floor(Math.random() * MaxRoomSizeX))
			ChosenHeight = Math.max(MinRoomSizeY, Math.floor(Math.random() * MaxRoomSizeY))
			var OkaySpot = true
			for (var x3 = ChosenSpotX; x3 < ChosenSpotX+ChosenWidth; x3++){
				for (var y3 = ChosenSpotY; y3 < ChosenSpotY+ChosenWidth; y3++){
					if (!CurrentMap.isMapInside(x3, y3)){
						OkaySpot = false
						break
					}
				}
				if (!OkaySpot){
					break
				}
			}
			z = 0;
			found = false
			while (z < this._roomArray.length && !found){
				if (this.intersect(this._roomArray[z], ChosenSpotX, ChosenSpotX + ChosenWidth, ChosenSpotY, ChosenSpotY + ChosenHeight)){
					found = true
				}
				z++
			}
			if (!found && OkaySpot){
				this.generateRoom(Floor, ChosenSpotX, ChosenSpotY, ChosenWidth, ChosenHeight)
				var PrevX = Math.floor((this._roomArray[this._roomArray.length-2].x1 + this._roomArray[this._roomArray.length-2].x2) / 2)
				var PrevY = Math.floor((this._roomArray[this._roomArray.length-2].y1 + this._roomArray[this._roomArray.length-2].y2) / 2)
				var NewX = Math.floor((this._roomArray[this._roomArray.length-1].x1 + this._roomArray[this._roomArray.length-1].x2) / 2)
				var NewY = Math.floor((this._roomArray[this._roomArray.length-1].y1 + this._roomArray[this._roomArray.length-1].y2) / 2)
				this.generateLoot(this._roomArray[this._roomArray.length-1], lootMax)
				if (Math.floor(Math.random()*1) == 1){
					this.generateHorizontalTunnel(PrevX, NewX, PrevY, Floor)
					this.generateVerticalTunnel(PrevY, NewY, NewX, Floor)
				}
				else{
					this.generateVerticalTunnel(PrevY, NewY, PrevX, Floor)
					this.generateHorizontalTunnel(PrevX, NewX, NewY, Floor)
				}
			}
			root.getMetaSession().global.lootArray = this._lootArray
			root.getMetaSession().global.lootPosArray = this._lootPosArray
			root.getMetaSession().global.roomArray = this._roomArray
		}
	},
	
	generateHorizontalTunnel: function(px, nx, py, Floor){
		var CurSession = root.getCurrentSession();
		var CurMap = CurSession.getCurrentMapInfo();
		var i, j;
		var x;
		for (x = Math.min(px, nx); x < Math.max(px, nx)+1; x++){
			CurSession.setMapChipGraphicsHandle(x, py, false, Floor)
		}
	},
	
	generateVerticalTunnel: function(py, ny, nx, Floor){
		var CurSession = root.getCurrentSession();
		var CurMap = CurSession.getCurrentMapInfo();
		var i, j;
		var y;
		for (y = Math.min(py, ny); y < Math.max(py, ny)+1; y++){
			CurSession.setMapChipGraphicsHandle(nx, y, false, Floor)
		}
	},
	
	generateRoom: function(Floor, x, y, w, h){
		var x2 = x + w
		var y2 = y + h
		var CurSession = root.getCurrentSession();
		for (var m = x; m < x2; m++){
			for (var n = y; n < y2; n++){
				CurSession.setMapChipGraphicsHandle(m, n, false, Floor)
			}
		}
		var room = {}
		room.x1 = x
		room.x2 = x2
		room.y1 = y
		room.y2 = y2
		this._roomArray.push(room)
	},
	
	intersect: function(room, x1, x2, y1, y2){
		return (room.x1 <= x2 && room.x2 >= x1 && room.y1 <= y2 && room.y2 >= y1)
	},
	
	generateLoot: function(room, max){
		var max2 = Math.floor(Math.random()*max)
		var i = 0;
		var CurSession = root.getCurrentSession();
		var CurMap = CurSession.getCurrentMapInfo();
		var LootList = CurMap.custom.RandomLootTable != undefined ? CurMap.custom.RandomLootTable : null
		var DropAnythingRate = typeof CurMap.custom.DropAnythingRate == 'number' ? CurMap.custom.DropAnythingRate : 30
		var item, z, loot, ChosenPos, x, room;
		var DropChances = [];
		if (LootList != null){
			for (var n = 0; n < LootList.length; n++){
				DropChances.push(LootList[n][2])
			}
			while (i < max2){
				x = Math.floor(Math.random() * LootList.length)
				ChosenPos = createPos(Math.min(room.x2-1,Math.floor(Math.random()*room.x2)+room.x1-1), Math.min(room.y2-1,Math.floor(Math.random()*room.y2)+room.y1-1))
				if (this.checkChances(DropChances, DropAnythingRate)){
					if (!this.isLootHere(ChosenPos.x, ChosenPos.y) && this.isRoomInside(room, ChosenPos.x, ChosenPos.y)){
						item = this.convertLoot(LootList[x])
						loot = {}
						loot.name = item.getName()
						loot.id = item.getId()
						loot.weapon = item.isWeapon()
						loot.original = item.getIconResourceHandle().getHandleType() == ResourceHandleType.ORIGINAL ? false : true
						loot.icon = item.getIconResourceHandle().getResourceId()
						loot.color = item.getIconResourceHandle().getColorIndex()
						loot.SrcX = item.getIconResourceHandle().getSrcX()
						loot.SrcY = item.getIconResourceHandle().getSrcY()
						loot.pos = ChosenPos
						this._lootArray.push(loot)
						this._lootPosArray.push(loot.pos)
					}
				}
				i++
			}
		}
	},
	
	isRoomInside: function(room, x, y){
		return (room.x1 <= x && room.x2 >= x && room.y1 <= y && room.y2 >= y)
	},
	
	isLootHere: function(x, y){
		for (var i = 0; i < this._lootArray.length; i++){
			if (x == this._lootArray[i].pos.x && y == this._lootArray[i].pos.y){
				return true;
			}
		}
		return false;
	},
	
	checkChances: function(LootArray, DAR, Chances){
		var result = false;
		var closest = function(array,num){
			var z=0;
			var minDiff=1000;
			var ans;
			for(z in array){
				var m=Math.abs(num-array[z]);
				if(m<minDiff){ 
					minDiff=m; 
					ans=array[z]; 
				}
			}
			return ans;
		}
		if (Math.floor(Math.random()*100) > DAR){
			result = closest(LootArray, Math.floor(Math.random()*Math.max.apply(null,LootArray)));
		}
		return typeof result == 'number';
	},
	
	convertLootEx: function(entry){
		var ItemList = root.getBaseData().getItemList()
		var WeaponList = root.getBaseData().getWeaponList()
		var i = 0;
		var Found = null
		if (entry.weapon){
			while (i < WeaponList.getCount() && Found == null){
				if (WeaponList.getData(i).getName() == entry.name && WeaponList.getData(i).getId() == entry.id){
					Found = WeaponList.getData(i)
				}
				i++
			}
		}
		else{
			while (i < ItemList.getCount() && Found == null){
				if (ItemList.getData(i).getName() == entry.name && ItemList.getData(i).getId() == entry.id){
					Found = ItemList.getData(i)
				}
				i++
			}
		}
		return Found
	},
	
	convertLoot: function(entry){
		var ItemList = root.getBaseData().getItemList()
		var WeaponList = root.getBaseData().getWeaponList()
		var i = 0;
		var Found = null
		if (entry[1].toLowerCase() == 'item'){
			while (i < ItemList.getCount() && Found == null){
				if (ItemList.getData(i).getName() == entry[0]){
					Found = ItemList.getData(i)
				}
				i++
			}
		}
		else{
			while (i < WeaponList.getCount() && Found == null){
				if (WeaponList.getData(i).getName() == entry[0]){
					Found = WeaponList.getData(i)
				}
				i++
			}
		}
		return Found;
	}
};

MapLayer.drawLootLayer = function(){
	var pic, srcX, srcY, pixelX, pixelY, list
	var array = RS_TerrainControl._lootArray.length != 0 ? RS_TerrainControl._lootArray : root.getMetaSession().global.lootArray != undefined ? root.getMetaSession().global.lootArray : []
	var MysLight = root.getCurrentSession().getCurrentMapInfo().custom.mdFog
	if (typeof MysLight == 'object' && typeof MysteryLight == 'object'){
		for (var i = 0; i < array.length; i++){
			if (MysteryLight.checkLootPos(array[i].pos.x, array[i].pos.y)){
				list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, array[i].original);
				pic = list.getCollectionDataFromId(array[i].icon, array[i].color)
				srcX = array[i].SrcX
				srcY = array[i].SrcY
				pixelX = LayoutControl.getPixelX(array[i].pos.x)
				pixelY = LayoutControl.getPixelY(array[i].pos.y)
				pic.drawStretchParts(pixelX, pixelY, 32, 32, srcX * 24, srcY * 24, 24, 24);
			}
		}
	}
	else{
		for (var i = 0; i < array.length; i++){
			list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, array[i].original);
			pic = list.getCollectionDataFromId(array[i].icon, array[i].color)
			srcX = array[i].SrcX
			srcY = array[i].SrcY
			pixelX = LayoutControl.getPixelX(array[i].pos.x)
			pixelY = LayoutControl.getPixelY(array[i].pos.y)
			pic.drawStretchParts(pixelX, pixelY, 32, 32, srcX * 24, srcY * 24, 24, 24);
		}
	}
};

var RSLoot0 = MapLayer.drawUnitLayer;
MapLayer.drawUnitLayer = function(){
	MapLayer.drawLootLayer()
	RSLoot0.call(this)
};

var RSLoot1 = SimulateMove._endMove;
SimulateMove._endMove = function(unit){
	RSLoot1.call(this, unit)
	var array = RS_TerrainControl._lootArray.length != 0 ? RS_TerrainControl._lootArray : root.getMetaSession().global.lootArray != undefined ? root.getMetaSession().global.lootArray : []
	var i;
	if (UnitItemControl.isUnitItemSpace(unit)){
		for (i = 0; i < array.length; i++){
			if (array[i].pos.x == unit.getMapX() && array[i].pos.y == unit.getMapY()){
				var item = RS_TerrainControl.convertLootEx(array[i])
				UnitItemControl.pushItem(unit, item)
				array.splice(i, 1)
			}
		}
	}
}