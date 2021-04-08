/*
Hello, and welcome to the Rogue Reinforcements script!

To use this script, set the following custom parameters on your chosen maps:

{
	RogueSpawn:true,
	ReinforceCount:#
}

Set # to the number of checks the script should make to spawn foes each turn.
Next, set the following custom parameters on your reinforcement units:

{
	SpawnChance:#
}

Set # to the percent chance they should have of spawning. So for instance,
if you want them to always spawn, set it to 100. If you want them to be very
rare, set it to something like 5, and so on.

Then, you're all set! Just end your turn and watch the reinforcements pile in...
AT RANDOM!!!

-Lady Rena, 4/3/2019
*/
var FoeCheck = {
	
	Unit: null
}

IndexArray.createIndexArray2 = function(x, y, item) {
	var i, rangeValue, rangeType, arr;
	var startRange = 1;
	var endRange = 1;
	var count = 1;
	var unit = FoeCheck.Unit
	
	if (item === null) {
		startRange = 1;
		endRange = 1;
	}
	else if (item.isWeapon()) {
		startRange = item.getStartRange();
		endRange = item.getEndRange()+ParamBonus.getMov(unit);
	}
	else {
		if (item.getItemType() === ItemType.TELEPORTATION && item.getRangeType() === SelectionRangeType.SELFONLY) {
			rangeValue = item.getTeleportationInfo().getRangeValue();
			rangeType = item.getTeleportationInfo().getRangeType();
		}
		else {
			rangeValue = item.getRangeValue();
			rangeType = item.getRangeType();
		}
		
		if (rangeType === SelectionRangeType.SELFONLY) {
			return [];
		}
		else if (rangeType === SelectionRangeType.MULTI) {
			endRange = rangeValue;
		}
		else if (rangeType === SelectionRangeType.ALL) {
			count = CurrentMap.getSize();
			
			arr = [];
			arr.length = count;
			for (i = 0; i < count; i++) {
				arr[i] = i;
			}
			
			return arr;
		}
	}
	
	return this.getBestIndexArray(x, y, startRange, endRange);
};

ReinforcementChecker._getTargetPos = function(posData, pageData) {
	var Map = root.getCurrentSession().getCurrentMapInfo();
	var pos = createPos(posData.getX(), posData.getY());
	var isForce = pageData.isForce();
	var unit = pageData.getSourceUnit();
	var NewPos = null;
	var MoveType = unit.getClass().getClassType().getMoveTypeId()
	var UnitList = PlayerList.getSortieList()
	var i;
	if (Map.custom.RogueSpawn){
		FoeCheck.Unit = unit
		var NewX = root.getRandomNumber() % Map.getMapWidth();
		var NewY = root.getRandomNumber() % Map.getMapHeight();
		while (NewPos === null){
			if (PosChecker.getTerrainFromPos(NewX,NewY).getMovePointFromMoveTypeId(MoveType) > 0){
				var CheckList = IndexArray.createIndexArray2(NewX,NewY,ItemControl.getEquippedWeapon(unit))
				for (i = 0; i < UnitList.getCount(); i++){
					var Player = UnitList.getData(i)
					if (IndexArray.findUnit(CheckList,Player)){
						NewX = root.getRandomNumber() % Map.getMapWidth();
						NewY = root.getRandomNumber() % Map.getMapHeight();
					}
					else{
						NewPos = createPos(NewX,NewY)
					}
				}
			}
			else{
				NewX = root.getRandomNumber() % Map.getMapWidth()
				NewY = root.getRandomNumber() % Map.getMapHeight()
			}
		}
	}
	if (NewPos !== null){
		if (PosChecker.getUnitFromPos(NewPos.x,NewPos.y) !== null){
			if (isForce){
				NewPos = PosChecker.getNearbyPosFromSpecificPos(NewPos.x, NewPos.y, unit, null);
			}
			else{
				return null;
			}
		}
	}
	else if (NewPos === null){
		if (PosChecker.getUnitFromPos(pos.x, pos.y) !== null) {
			if (isForce) {
				pos = PosChecker.getNearbyPosFromSpecificPos(pos.x, pos.y, unit, null);
			}
			else {
				return null;
			}
		}
	}
	if (NewPos !== null){
		return NewPos;
	}
	else{
		return pos;
	}
};

ReinforcementChecker._createReinforcementUnit = function(posData, pageData, arr) {
	var x, y, unit, dx, dy, reinforceUnit, LVS;
	var pos = this._getTargetPos(posData, pageData);
	var dynamicEvent = createObject(DynamicEvent);
	var generator = dynamicEvent.acquireEventGenerator();
	var LvBase = root.getCurrentSession().getCurrentMapInfo().custom.LevelReq !== undefined ? root.getCurrentSession().getCurrentMapInfo().custom.LevelReq : 1
	var LvCap = root.getCurrentSession().getCurrentMapInfo().custom.LevelCutoff !== undefined ? root.getCurrentSession().getCurrentMapInfo().custom.LevelCutoff : 3
	var LvRange = LvCap - LvBase
	if (pos === null) {
		return;
	}
	x = pos.x;
	y = pos.y;
	if (root.getCurrentSession().getCurrentMapInfo().custom.ReinforceFocus){
		generator.locationFocus(x,y,false);
		dynamicEvent.executeDynamicEvent();
	}
	unit = this._appearUnit(pageData, x, y);
	if (unit === null) {
		return;
	}
	if (root.getCurrentSession().getCurrentMapInfo().custom.RogueSpawn){
		LVS = Math.round(Math.random()*LvRange)
		LevelSetter._adjustUnit(unit,Math.max(1,LVS),true)
	}
	dx = this._getPointX(pageData.getDirectionType()) * GraphicsFormat.MAPCHIP_WIDTH;
	dy = this._getPointY(pageData.getDirectionType()) * GraphicsFormat.MAPCHIP_HEIGHT;
	
	// Create an object for drawing.
	reinforceUnit = StructureBuilder.buildReinforcementUnit();
	reinforceUnit.x = x;
	reinforceUnit.y = y;
	reinforceUnit.xPixel = (x * GraphicsFormat.MAPCHIP_WIDTH) + dx;
	reinforceUnit.yPixel = (y * GraphicsFormat.MAPCHIP_HEIGHT) + dy;
	reinforceUnit.direction = pageData.getDirectionType();
	reinforceUnit.unit = unit;
	reinforceUnit.isMoveFinal = false;
	reinforceUnit.unitCounter = createObject(UnitCounter);
	reinforceUnit.moveCount = 0;
	
	arr.push(reinforceUnit);
};

ReinforcementChecker._checkReinforcementPage = function(posData, arr) {
	var i, pageData, turnCount;
	var turnType = root.getCurrentSession().getTurnType();
	var count = posData.getReinforcementPageCount();
	
	for (i = 0; i < count; i++) {
		pageData = posData.getReinforcementPage(i);
		turnCount = this._getTurnCount(pageData);
		// Check if a condition such as "Start Turn" is satisfied.
		if (!root.getCurrentSession().getCurrentMapInfo().custom.RogueSpawn){
			if (pageData.getStartTurn() <= turnCount && pageData.getEndTurn() >= turnCount && turnType === pageData.getTurnType()) {
				// Check if the event condition is satisfied.
				if (pageData.isCondition()) {
					// Appear.
					this._createReinforcementUnit(posData, pageData, arr);
					break;
				}
			}
		}
		else{
			for (var j = 0; j < root.getCurrentSession().getCurrentMapInfo().custom.ReinforceCount; j++){
				if (pageData.getStartTurn() <= turnCount && pageData.getEndTurn() >= turnCount && turnType === pageData.getTurnType() && Math.round(Math.random()*101) <= (typeof pageData.getSourceUnit().custom.SpawnChance === 'number' ? pageData.getSourceUnit().custom.SpawnChance : 50)) {
					// Check if the event condition is satisfied.
					if (pageData.isCondition()) {
						// Appear.
						this._createReinforcementUnit(posData, pageData, arr);
						break;
					}
				}
			}
		}
	}
};