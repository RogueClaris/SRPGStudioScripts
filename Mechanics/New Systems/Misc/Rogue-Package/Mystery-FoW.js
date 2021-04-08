/**
 * Original Script by Goinza & Lady Rena. Further modifications by Lady Rena.
 * 
 * "Room-Based" Fog of War. Custom parameters:
 * For the map, use "mdFog", and as the values of that paramter use two other parameters called "color" (uses RGB values) and "alpha" (0-255).
 * For example: {mdFog:{color:0x333333, alpha:128}}
 */

//At the beginning of the map, the fog is updated
var mdfw01 = CurrentMap.prepareMap;
CurrentMap.prepareMap = function() {
	mdfw01.call(this);
	if (MysteryLight.isActive()) {
		MysteryLight.setFog();
	}
}

//Draws the fog
var mdfw03 = MapLayer.drawMapLayer;
MapLayer.drawMapLayer = function() {
	mdfw03.call(this);
	if (MysteryLight.isActive()) {
		MysteryLight.drawLight();
	}
}

//Every end of turn, the fog is updated
var mdfw04 = TurnChangeStart.doLastAction;
TurnChangeStart.doLastAction = function() {
	mdfw04.call(this);
	if (root.getCurrentSession().getTurnType() !== TurnType.ENEMY && MysteryLight.isActive()) {
		MysteryLight.setFog();
	}
}

//Every time a player unit moves, the fow is updated
PlayerTurn._moveUnitCommand = function() {
	var result = this._mapSequenceCommand.moveSequence();

	//This part stops the player's movements when it hits an enemy player
	var stop = root.getMetaSession().global.stop;
	if (stop!=null && stop) {
		root.getMetaSession().global.stop = null;
		this.changeCycleMode(PlayerTurnMode.MAP)
		MysteryLight.setFog();		
		return MoveResult.CONTINUE;
	}
	
	if (result === MapSequenceCommandResult.COMPLETE) {
		this._mapSequenceCommand.resetCommandManager();
		MapLayer.getMarkingPanel().updateMarkingPanelFromUnit(this._targetUnit);
		this._changeEventMode();
		if (MysteryLight.isActive()) {			
			MysteryLight.setFog();
		}
	}
	else if (result === MapSequenceCommandResult.CANCEL) {
		this._mapSequenceCommand.resetCommandManager();
		this.changeCycleMode(PlayerTurnMode.MAP);
	}
	
	return MoveResult.CONTINUE;
}

SimulateMove._currentPos = {
	x: null,
	y: null
}

//Hides the movement of enemy units. Does not hide them when they are on idle animation
//It also stops the movement of the unit who moves on an tile occupied for a invisible unit
var mdfw05 = SimulateMove.drawUnit;
SimulateMove.drawUnit = function() {
	if (MysteryLight.isActive()) {
		var chipWidth = GraphicsFormat.MAPCHIP_WIDTH;
		var chipHeight = GraphicsFormat.MAPCHIP_HEIGHT;
		var x = Math.round(this._xPixel / chipWidth);
		var y = Math.round(this._yPixel / chipHeight);
		
		var unit = MysteryLight.getEnemyUnit(x, y)
		if (this._unit.getUnitType() !== UnitType.ENEMY && unit!=null) {
			//Player unit founds a enemy unit, must stop and end that unit's turn
			if (this._currentPos.x!=null && this._currentPos.y!=null) {
				this._unit.setMapX(this._currentPos.x);
				this._unit.setMapY(this._currentPos.y);
			}
			this._endMove(this._unit);
			root.getMetaSession().global.stop = true;
			this._unit.setWait(true);
		}
		else {
			this._currentPos.x = x;
			this._currentPos.y = y;
		}
		
		if (MysteryLight.isUnitVisibleFromPos(this._unit, x, y)) {
			var unitRenderParam = StructureBuilder.buildUnitRenderParam();
		
			if (this._isMoveFinal) {
				return;
			}
			
			unitRenderParam.direction = this._unit.getDirection();
			unitRenderParam.animationIndex = this._unitCounter.getAnimationIndexFromUnit(this._unit);
			unitRenderParam.isScroll = true;
			UnitRenderer.drawScrollUnit(this._unit, this._xPixel, this._yPixel, unitRenderParam);
		}
	}
	else {
		mdfw05.call(this);
	}   
}

//Hides unit menu of invisible units
var mdfw06 = MapEdit._openMenu;
MapEdit._openMenu = function(unit) {
	if (!MysteryLight.isActive() || unit==null || MysteryLight.isUnitVisible(unit)) {
		result = mdfw06.call(this, unit);
	}
	else {
		result = MapEditResult.NONE;
	}

	return result;
}

//Hides map window of invisible units
var mdfw07 = MapParts.UnitInfo.drawMapParts;
MapParts.UnitInfo.drawMapParts = function() {
	var unit = this.getMapPartsTarget();
	if (!MysteryLight.isActive() || MysteryLight.isUnitVisible(unit)) {
		mdfw07.call(this);
	}
}

//Hides range of invisible units
var mdfw08 = UnitRangePanel.drawRangePanel;
UnitRangePanel.drawRangePanel = function() {
	if (!MysteryLight.isActive() || MysteryLight.isUnitVisible(this._unit)) {
		mdfw08.call(this);
	}
}

//If you are in the unit menu of a visible unit, you can only change it to another unit if that unit is also visible
var mdfw09 = UnitMenuScreen._getUnitList;
UnitMenuScreen._getUnitList = function(unit) {
	var list;
	if (MysteryLight.isActive()) {
		if (unit.getUnitType() == UnitType.ENEMY) {
			var visibleEnemies = [];
			var allEnemies = EnemyList.getAliveDefaultList();
			for (var i=0; i<allEnemies.getCount(); i++) {
				if (MysteryLight.isUnitVisible(allEnemies.getData(i))) {
					visibleEnemies.push(allEnemies.getData(i));
				}
			}
			list = StructureBuilder.buildDataList();
			list.setDataArray(visibleEnemies);
		}
		else {
			var visibleUnits = [];
			var allUnits = unit.getUnitType()==UnitType.PLAYER ? PlayerList.getSortieDefaultList() : AllyList.getAliveDefaultList();
			for (var i=0; i<allUnits.getCount(); i++) {
				if (!allUnits.getData(i).isInvisible()) {
					visibleUnits.push(allUnits.getData(i));
				}
			}
			list = StructureBuilder.buildDataList();
			list.setDataArray(visibleUnits);
		}
		
	}
	else {
		list = mdfw09.call(this, unit);
	}

	return list;
}

//Once an enemy unit ends its move, if it is outside the visible range of your army, it will become invisible. Else, it will become visible
var mdfw10 = SimulateMove._endMove;
SimulateMove._endMove = function(unit) { 
	mdfw10.call(this, unit);
	if (MysteryLight.isActive()) {
		unit.setInvisible(!MysteryLight.isUnitVisible(unit));
	}
}

//Removes the unit.isInvisible check so invisible units can move
var mdfw11 = EnemyTurn._isOrderAllowed;
EnemyTurn._isOrderAllowed = function(unit) {
	if (!MysteryLight.isActive()) {
		return mdfw11.call(this, unit);
	}
	if (unit.isActionStop() || unit.isWait() || StateControl.isBadStateOption(unit, BadStateOption.NOACTION)) {
		return false;
	}
	
	return true;
}

//Updates the fog every time a non-enemy unit dies.
var mdfw12 = DamageControl.setDeathState;
DamageControl.setDeathState = function(unit) {
	mdfw12.call(this, unit);
	if (unit.getUnitType() != UnitType.ENEMY && MysteryLight.isActive()) {
		MysteryLight.setFog();
	}
}

//Modified so the attacking unit won't be visible after the easy battle
EasyBattle._enableDefaultCharChip = function(isDraw) {
	var enable;
	
	if (isDraw) {
		enable = true;
	}
	else {
		enable = false;
	}
	
	if (!MysteryLight.isActive() || MysteryLight.isUnitVisible(this._order.getActiveUnit())) {
		this._order.getActiveUnit().setInvisible(enable);
	}
	this._order.getPassiveUnit().setInvisible(enable);
	this._isUnitDraw = isDraw;
}

//Doesn't draw invisible units during the easy battle 
var mdfw13 = EasyMapUnit.drawMapUnit;
EasyMapUnit.drawMapUnit = function() {
	if (!MysteryLight.isActive() || MysteryLight.isUnitVisible(this._unit)) {
		mdfw13.call(this);
	}
}

//In the objective screen, only count the units that are visible
var mdfw14 = ObjectiveFaceZone._getTotalValue;
ObjectiveFaceZone._getTotalValue = function(unitType) {
	var value;
	if (!MysteryLight.isActive()) {
		value = mdfw14.call(this, unitType);
	}
	else {	
		value = 0;	
		if (unitType === UnitType.PLAYER) {
			list = PlayerList.getSortieDefaultList();
		}
		else if (unitType === UnitType.ENEMY) {
			list = EnemyList.getAliveDefaultList();
		}
		else {
			list = AllyList.getAliveDefaultList();
		}
		
		for (var i=0; i<list.getCount(); i++) {
			if (!list.getData(i).isInvisible()) {
				value++;
			}
		}
	}

	return value;
}
var mdfw15 = SortieSetting.assocUnit
SortieSetting.assocUnit = function(unit, sortiePos) {
	mdfw15.call(this,unit,sortiePos)
	if (MysteryLight.isActive()){
		MysteryLight.setFog()
	};
};

//With this, now you cannot cycle between invisible units
MapEdit._changeTarget = function(isNext) {
	var unit;
	var list = PlayerList.getSortieList();
	var count = list.getCount();
	var index = this._activeIndex;
	
	for (;;) {
		if (isNext) {
			index++;
		}
		else {
			index--;
		}
		
		if (index >= count) {
			index = 0;
		}
		else if (index < 0) {
			index = count - 1;
		}
		
		unit = list.getData(index);
		if (unit === null) {
			break;
		}
		
		if (!unit.isWait() && !unit.isInvisible())  { //Here I added !unit.isInvisible(). This is the only change in the function
			this._activeIndex = index;
			this._setUnit(unit);
			this._setFocus(unit);
			break;
		}
		
		if (index === this._activeIndex) {
			break;
		}
	}
}

//Without this, the auto end feature would not work if there were invisible units in the player's army
PlayerTurn._checkAutoTurnEnd = function() {
	var i, unit;
	var isTurnEnd = true;
	var list = PlayerList.getSortieList();
	var count = list.getCount();
	
	// Don't let the turn change occur at the same time when selecting the auto turn end on the config screen.
	// There is also an intention that doesn't let the turn end at the same time when the alive is 0 at the battle.
	if (this.getCycleMode() !== PlayerTurnMode.MAP) {
		return false;
	}
	
	// Even if the auto turn is not enabled, if no alive exists, end the turn.
	if (count === 0) {
		TurnControl.turnEnd();
		return true;
	}
	
	if (!EnvironmentControl.isAutoTurnEnd()) {
		return false;
	}
	
	for (i = 0; i < count; i++) {
		unit = list.getData(i);
		// If the all players cannot act due to the states, ending the turn is needed, so decide with the following code.
		if (!StateControl.isTargetControllable(unit)) {
			continue;
		}
		
		if (!unit.isWait() && !unit.isInvisible()) { //Here I added !unit.isInvisible(). This is the only change in the function
			isTurnEnd = false;
			break;
		}
	}
	
	if (isTurnEnd) {
		this._isPlayerActioned = false;
		TurnControl.turnEnd();
	}
	
	return isTurnEnd;
}

//If an ally unit (green unit) moves, the fog is updated
EnemyTurn._moveAutoAction = function() {
	// Check if action which is identified with this._autoActionIndex has ended.
	if (this._autoActionArray[this._autoActionIndex].moveAutoAction() !== MoveResult.CONTINUE) {
		if (!this._countAutoActionIndex()) {
			if (root.getCurrentSession().getTurnType() !== TurnType.ENEMY && MysteryLight.isActive()) {
				MysteryLight.setFog();
			}
			this._changeIdleMode(EnemyTurnMode.TOP, this._getIdleValue());
		}
	}
	
	return MoveResult.CONTINUE;
}

//With this, ally units won't attack hidden enemy units.
BaseCombinationCollector._setUnitRangeCombination = function(misc, filter, rangeMetrics) {
	var i, j, indexArray, list, targetUnit, targetCount, score, combination, aggregation;
	var unit = misc.unit;
	var filterNew = this._arrangeFilter(unit, filter);
	var listArray = this._getTargetListArray(filterNew, misc);
	var listCount = listArray.length;
	
	if (misc.item !== null && !misc.item.isWeapon()) {
		aggregation = misc.item.getTargetAggregation();
	}
	else if (misc.skill !== null) {
		aggregation = misc.skill.getTargetAggregation();
	}
	else {
		aggregation = null;
	}
	
	for (i = 0; i < listCount; i++) {
		list = listArray[i];
		targetCount = list.getCount();
		for (j = 0; j < targetCount; j++) {
			targetUnit = list.getData(j);
			if (unit === targetUnit) {
				continue;
			}
			if (targetUnit.isInvisible()){
				continue;
			}
			if (aggregation !== null && !aggregation.isCondition(targetUnit)) {
				continue;
			}
			
			score = this._checkTargetScore(unit, targetUnit);
			if (score < 0) {
				continue;
			}
			
			// Calculate a series of ranges based on the current position of targetUnit (not myself, but the opponent).
			indexArray = IndexArray.createRangeIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), rangeMetrics);
			
			misc.targetUnit = targetUnit;
			misc.indexArray = indexArray;
			misc.rangeMetrics = rangeMetrics;
			
			// Get an array to store the position to move from a series of ranges.
			misc.costArray = this._createCostArray(misc);
			
			if (misc.costArray.length !== 0) {
				// There is a movable position, so create a combination.
				combination = this._createAndPushCombination(misc);
				combination.plusScore = score;
			}
		}
	}
}

//Object that handles the fog
var MysteryLight = defineObject(BaseObject, {

	_fogIndexArray: null,
	_visibleArray: null,

	setFog: function() {  
		var fogTile;
		this._fogIndexArray = [];
		this._setVisibleArray()			
		// for (var i=0; i<CurrentMap.getWidth(); i++) {
			// for (var j=0; j<CurrentMap.getHeight(); j++) {
				// this._checkTerrainVision(i,j)
			// }
		// }
		for (var i=0; i<CurrentMap.getWidth(); i++) {
			for (var j=0; j<CurrentMap.getHeight(); j++) {
				fogTile = this._visibleArray==null || (this._visibleArray!=null && !this._visibleArray[i][j])				
				if (fogTile) {
					this._fogIndexArray.push(CurrentMap.getIndex(i, j));
				}				
				unit = MysteryLight.getEnemyUnit(i, j);
				if (unit!=null)  {
					unit.setInvisible(fogTile);
				}		  
			}
		}
		MapLayer.getMarkingPanel().updateMarkingPanel();	 
	},	

	drawLight: function() {
		root.drawFadeLight(this._fogIndexArray, this._getColor(), this._getAlpha());
	},

	isUnitVisible: function(unit) {
		if (unit==null || this._visibleArray==null) {
			return false;
		}
		var isEnemy = unit.getUnitType() === UnitType.ENEMY;
		var isVisible = this._visibleArray[unit.getMapX()][unit.getMapY()]!=null ? this._visibleArray[unit.getMapX()][unit.getMapY()] : false;

		var invisible = !(!isEnemy || (isEnemy && isVisible));

		return !invisible;
	},

	isUnitVisibleFromPos: function(unit, x, y) {
		if (unit==null) {
			return false;
		}
		var isEnemy = unit.getUnitType() === UnitType.ENEMY;
		var isVisible = this._visibleArray[x][y]!=null ? this._visibleArray[x][y] : false;

		var invisible = !(!isEnemy || (isEnemy && isVisible));

		return !invisible;
	},

	getEnemyUnit: function(x, y) {
		var enemyList = EnemyList.getAliveList();
		var unit;
		var i = 0;
		var found = false;
		while (i<enemyList.getCount() && !found) {
			unit = enemyList.getData(i);
			found = unit.getMapX()==x && unit.getMapY()==y;
			i++;
		}

		return found ? unit : null;
	},

	isActive: function() {
		var hasFog = false;
		if (root.getCurrentSession() != null && root.getBaseScene() != SceneType.REST) {
			hasFog = root.getCurrentSession().getCurrentMapInfo().custom.mdFog != null;
		}
		return hasFog;
	},

	_setVisibleArray: function() {
		this._visibleArray = [];
		for (var j=0; j<CurrentMap.getWidth(); j++) {
			this._visibleArray.push([]);
		}
				
		this._markUnitVision(PlayerList.getSortieList());
	},
	
	checkLootPos: function(x, y){
		if (this._visibleArray[x][y]){
			return true;
		}
		
		return false;
	},

	_markUnitVision: function(unitList)  {
		var unit, vision, vision2, x2, y2, h, i, j, k, l, foundRoom, frx, fry;
		var roomArray = (RS_TerrainControl._roomArray != null && RS_TerrainControl._roomArray.length > 0) ? RS_TerrainControl._roomArray : (root.getMetaSession().global.roomArray != (null || undefined) && root.getMetaSession().global.roomArray.length > 0) ? root.getMetaSession().global.roomArray : []
		for (h=0; h<unitList.getCount(); h++) {
			unit = unitList.getData(h);
			foundRoom = -1
			this._visibleArray[unit.getMapX()][unit.getMapY()] = true;
			vision = this._getVision(unit);
			vision2 = IndexArray.getBestIndexArray(unit.getMapX(),unit.getMapY(),0,vision)
			for (j = 0; j < roomArray.length; j++){
				for (k = roomArray[j].x1; k < roomArray[j].x2; k++){
					for (l = roomArray[j].y1; l < roomArray[j].y2; l++){
						if (unit.getMapX() == k && unit.getMapY() == l){
							foundRoom = roomArray[j]
							break
						}
					}
					if (foundRoom != -1){
						break;
					}
				}
				if (foundRoom != -1){
					break;
				}
			}
			if (foundRoom != -1){
				for (frx = foundRoom.x1-1; frx <= foundRoom.x2; frx++){
					for (fry = foundRoom.y1-1; fry <= foundRoom.y2; fry++){
						this._visibleArray[frx][fry] = true
					}
				}
			}
			else{
				vision = this._getVision(unit);
				vision2 = IndexArray.getBestIndexArray(unit.getMapX(),unit.getMapY(),0,vision)
				for (i = 0; i < vision2.length; i++){
					x2 = CurrentMap.getX(vision2[i])
					y2 = CurrentMap.getY(vision2[i])
					this._visibleArray[x2][y2] = true;
				}
			}
		}
	},
	
	_checkTerrainVision: function(x, y){
		var vision, range, x2, y2, a, b;
		var terrain1 = root.getCurrentSession().getTerrainFromPos(x, y, true);
		var terrain2 = root.getCurrentSession().getTerrainFromPos(x, y, false);
		if (terrain1.custom.vision && typeof terrain1.custom.range === 'number'){
			range = terrain1.custom.range
			vision = IndexArray.getBestIndexArray(x,y,0,range)
			for (a = 0; a < vision.length; a++){
				x2 = CurrentMap.getX(vision[a])
				y2 = CurrentMap.getY(vision[a])
				this._visibleArray[x2][y2] = true;
			}
		}
		else if (terrain2.custom.vision && typeof terrain2.custom.range === 'number'){
			range = terrain2.custom.range
			vision = IndexArray.getBestIndexArray(x,y,0,range)
			for (a = 0; a < vision.length; a++){
				x2 = CurrentMap.getX(vision[a])
				y2 = CurrentMap.getY(vision[a])
				this._visibleArray[x2][y2] = true;
			}
		}
	},

	_getColor: function() {
		var fog = root.getCurrentSession().getCurrentMapInfo().custom.mdFog;
		var color = null;
		if (fog!=null) {
			color = fog.color;
		}

		return color;
	},

	_getAlpha: function() {
		var fog = root.getCurrentSession().getCurrentMapInfo().custom.mdFog;
		var alpha = null;
		if (fog!=null) {
			alpha = fog.alpha;
		}

		return alpha;
	},
	
	_getVision: function(unit) {
		// var vision = unit.getClass().custom.baseVision!=null ? unit.getClass().custom.baseVision : 4;
		// vision += unit.custom.extraVision!=null ? unit.custom.extraVision : 0;
		// var skill = SkillControl.getPossessionCustomSkill(unit, "ExtraVision");
		// if (skill!=null) {
			// vision += skill.custom.extraVision;
		// }
		// var statesList = unit.getTurnStateList();
		// var state;
		// for (var i=0; i<statesList.getCount(); i++) {
			// state = statesList.getData(i).getState();
			// vision += state.custom.extraVision!=null ? state.custom.extraVision : 0;
		// }

		// return vision;
		return 1;
	}

});