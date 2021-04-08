//To use this script, change the unit's pattern to Custom type,
//and input the word 'Talk', without quotes, as the keyword.
//Secondarily, the talk event must include a player unit, and it
//must be set to 'Either can initiate'. If you do not follow these
//instructions, it will not work.

var RSTALK0 = CombinationBuilder._configureCombinationCollector;
CombinationBuilder._configureCombinationCollector = function(groupArray){
	RSTALK0.call(this, groupArray)
	//append the new collection object.
	groupArray.appendObject(CombinationCollector.Talk)
};

var RSTALK1 = CombinationSelector._configureScorerSecond;
CombinationSelector._configureScorerSecond = function(groupArray){
	RSTALK1.call(this, groupArray)
	//append the new scoring object.
	groupArray.appendObject(AIScorer.Talk)
};

CombinationManager.getMoveTalkCombination = function(unit, x, y, moveAIType){
	var simulator, goalIndex, blockUnitArray, data, moveCource, combination;
	
	if (unit.getMapX() === x && unit.getMapY() === y) {
		// If the current position is a goal, don't move.
		return StructureBuilder.buildCombination();
	}
	
	simulator = root.getCurrentSession().createMapSimulator();
	simulator.startSimulation(unit, CurrentMap.getWidth() * CurrentMap.getHeight());
	
	goalIndex = CurrentMap.getIndex(x, y);
	blockUnitArray = [];
	
	if (this._getBlockUnit(unit, x, y) !== null) {
		// The opponent unit (if the ally, it's the enemy, if the enemy, it's the player or the ally) exists at the goal, so don't create a course.
		// The same category unit is adjusted by createExtendCource, so don't treat.
		moveCource = [];
	}
	else {
		moveCource = CourceBuilder.createExtendCource(unit, goalIndex, simulator);
	}
	
	if (moveCource.length === 0) {
		// Get the closer position to goalIndex instead, because cannot move to the position of goalIndex.
		data = CourceBuilder.getValidGoalIndex(unit, goalIndex, simulator, moveAIType);
		if (goalIndex !== data.goalIndex) {
			// Save because new goal was found.
			goalIndex = data.goalIndex;
			// Create a course based on new goal.
			moveCource = CourceBuilder.createExtendCource(unit, goalIndex, simulator);
		}
		
		// Save a range of unit who blocked the course until the goal.
		blockUnitArray = data.blockUnitArray;
	}
	combination = this.getTalkCombination(unit, simulator);
	if (combination !== null) {
		combination.cource = moveCource
		return combination;
	}
	
	combination = StructureBuilder.buildCombination();
	combination.cource = moveCource;
	
	return combination;
};

//pretty much all of this stuff is just copied and minorly renamed from existing SRPG Studio code.
CombinationManager.getTalkCombination = function(unit, sim){
	var misc = CombinationBuilder.createMisc(unit, sim)
	var combo = CombinationCollector.Talk.collectCombination(misc)
	return combo
}

var RSTALK2 = AutoActionBuilder.buildCustomAction;
AutoActionBuilder.buildCustomAction = function(unit, autoActionArray, keyword){
	if (keyword === "Talk"){
		var miscy = CombinationBuilder.createMisc(unit, root.getCurrentSession().createMapSimulator())
		miscy.unit = unit
		var miscy2 = CombinationCollector.Talk.getTargetUnit(miscy)
		var x, y, targetUnit;
		var combination = null;
		targetUnit = miscy2.targetUnit
		if (targetUnit === null) {
			return this._buildEmptyAction();
		}
		
		x = targetUnit.getMapX();
		y = targetUnit.getMapY();
		
		// Check if it has already reached at goal.
		combination = CombinationManager.getMoveTalkCombination(unit, x, y, MoveAIType.APPROACH);
		if (combination === null) {
			return this._buildEmptyAction();
		}
		
		this._pushMoveTalk(unit, autoActionArray, combination);
		
		return true;
	}
	return RSTALK2.call(this, unit, autoActionArray, keyword)
};

AutoActionBuilder._pushMoveTalk = function(unit, autoActionArray, combination) {
	var autoAction, talkAction;
	
	this._pushScroll(unit, autoActionArray, combination);
	
	if (combination.cource.length === 0) {
		talkAction = createObject(TalkAutoAction)
		talkAction.setAutoActionInfo(unit, combination)
		autoActionArray.push(talkAction)
	}
	else{
		autoAction = createObject(MoveAutoAction);
		autoAction.setAutoActionInfo(unit, combination);
		autoActionArray.push(autoAction);
		talkAction = createObject(TalkAutoAction)
		talkAction.setAutoActionInfo(unit, combination)
		autoActionArray.push(talkAction)
	}
};

BaseCombinationCollector._setUnitRangeCombinationRS = function(misc, filter, rangeMetrics){
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
				combination = this._createAndPushCombinationRS(misc);
				combination.plusScore = score;
				return combination
			}
		}
	}
}

var RSTAA0 = BaseCombinationCollector._createAndPushCombination;
BaseCombinationCollector._createAndPushCombinationRS = function(misc){
	var combo = RSTAA0.call(this, misc);
	combo.unit = misc.unit
	combo.evt = misc.evt
	return combo;
};

CombinationCollector.Talk = defineObject(BaseCombinationCollector,
{
	collectCombination: function(misc) {
		var i, evt, info, temp1, temp2, rangeMetrics, crowd;
		var unit = misc.unit;
		var arr = EventCommonArray.createArray(root.getCurrentSession().getTalkEventList(), EventType.TALK);
		var count = arr.length;
		misc.item = null
		misc.skill = null
		for (i = 0; i < count; i++){
			evt = arr[i]
			if (evt.getExecutedMark() === EventExecutedType.FREE && evt.getTalkEventInfo().isMutual()){
				info = evt.getTalkEventInfo()
				temp1 = info.getSrcUnit()
				temp2 = info.getDestUnit()
				if (unit === temp1){
					misc.targetUnit = temp2
				}
				else if (unit === temp2){
					misc.targetUnit = temp1
				}
				else{
					continue;
				}
				rangeMetrics = StructureBuilder.buildRangeMetrics();
				rangeMetrics.startRange = 1
				rangeMetrics.endRange = 1
				misc.evt = evt
				crowd = this._setUnitRangeCombinationRS(misc, FilterControl.getNormalFilter((UnitType.PLAYER || UnitType.ENEMY || UnitType.ALLY)), rangeMetrics)
				return crowd
			}
		}
	},
	
	getTargetUnit: function(misc){
		var arr = EventCommonArray.createArray(root.getCurrentSession().getTalkEventList(), EventType.TALK);
		var count = arr.length;
		misc.targetUnit = null
		var unit = misc.unit
		for (i = 0; i < count; i++){
			evt = arr[i]
			if (evt.getExecutedMark() === EventExecutedType.FREE && evt.getTalkEventInfo().isMutual()){
				info = evt.getTalkEventInfo()
				temp1 = info.getSrcUnit()
				temp2 = info.getDestUnit()
				if (unit === temp1){
					misc.targetUnit = temp2
				}
				else if (unit === temp2){
					misc.targetUnit = temp1
				}
			}
		}
		return misc
	}
}
);

AIScorer.Talk = defineObject(BaseAIScorer,
{
	getScore: function(unit, combination) {
		if (unit.custom.RS_Talkative){
			return 100
		}
		return 15
	}
}
);

TalkAutoAction = defineObject(BaseAutoAction,
{
	_unit: null,
	_targetUnit: null,
	_evt: null,
	_capsule: null,
	_trigger: false,
	
	setAutoActionInfo: function(unit, combination) {
		this._unit = combination.unit
		this._targetUnit = combination.targetUnit
		this._evt = combination.evt
		this._capsule = createObject(CapsuleEvent)
	},
	
	enterAutoAction: function() {
		if (this._getDist() <= 1){
			return EnterResult.OK;
		}
		else{
			return EnterResult.NOTENTER;
		}
	},
	
	_getDist: function(){
		var x1, x2, y1, y2
		x1 = this._unit.getMapX()
		x2 = this._targetUnit.getMapX()
		y1 = this._unit.getMapY()
		y2 = this._targetUnit.getMapY()
		return Math.abs((x1+y1)-(x2+y2))
	},
	
	moveAutoAction: function() {
		if (!this._trigger){
			this._capsule.enterCapsuleEvent(this._evt, true)
			this._trigger = true
		}
		if (this._capsule.moveCapsuleEvent() !== MoveResult.CONTINUE){
			return MoveResult.END
		}
		return MoveResult.CONTINUE
	}
}
);
