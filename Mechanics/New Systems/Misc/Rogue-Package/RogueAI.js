//Modifies marked units to choose a random map position and move towards it each turn.
//They will often walk backwards. To use, set their pattern to Custom.
//The keyword is RS-Rogue
//Enjoy the script!
//-Lady Rena, May 17th, 2020.
var RSRogueAI0 = AutoActionBuilder.buildCustomAction;
AutoActionBuilder.buildCustomAction = function(unit, autoActionArray, keyword) {
	if (keyword == "RS-Rogue"){
		var x, y;
		var targetPos = null;
		var TargetArr = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, Math.max(ParamBonus.getMov(unit),6))
		var target = null
		var i = 0;
		var list = unit.getUnitType() == UnitType.ENEMY ? PlayerList.getAliveList() : EnemyList.getAliveList()
		while (target == null && i < list.getCount()){
			if (IndexArray.findUnit(TargetArr, list.getData(i))){
				target = list.getData(i)
			}
			i++
		}
		if (target != null){
			if (AttackChecker.isSpecificUnitAttackable(unit, target)){
				var combination = CombinationManager.getWaitCombination(unit);
				combination.targetUnit = target
				this._pushAttack(unit, autoActionArray, combination);
				return true;
			}
			else{
				var combination = CombinationManager.getRogueApproach(unit, true);
				if (combination === null) {
					combination = CombinationManager.getEstimateCombination(unit)
					if (combination === null) {
						return this._buildEmptyAction();
					}
					else {
						// Set the target position to move.
						this._pushMove(unit, autoActionArray, combination);
						
						// Set it so as to wait after move.
						this._pushWait(unit, autoActionArray, combination);
					}
				}
				else{
					this._pushGeneral(unit, autoActionArray, combination);
				}
			}
			return true
		}
		else{
			if (typeof unit.custom.goalX == 'number' && typeof unit.custom.goalY == 'number'){
				if (unit.custom.goalX == unit.getMapX() && unit.custom.goalY == unit.getMapY()){
					while (targetPos == null){
						x = root.getRandomNumber() % CurrentMap.getWidth();
						y = root.getRandomNumber() % CurrentMap.getHeight();
						if (PosChecker.getUnitFromPos(x, y) == null && PosChecker.getMovePointFromUnit(x, y, unit) > 0){
							targetPos = createPos(x, y)
						}
					}
					var combination = CombinationManager.getMoveCombination(unit, x, y, MoveAIType.MOVEONLY);
					if (combination === null) {
						return this._buildEmptyAction();
					}
					unit.custom.goalX = targetPos.x
					unit.custom.goalY = targetPos.y
					if (combination.item !== null) {
						this._pushGeneral(unit, autoActionArray, combination);
						return true;
					}
					else {
						this._pushMove(unit, autoActionArray, combination);
					}
					return true;
				}
				else{
					x = unit.custom.goalX
					y = unit.custom.goalY
					var combination = CombinationManager.getMoveCombination(unit, x, y, MoveAIType.MOVEONLY);
					if (combination === null) {
						return this._buildEmptyAction();
					}
					if (combination.item !== null) {
						this._pushGeneral(unit, autoActionArray, combination);
						return true;
					}
					else {
						this._pushMove(unit, autoActionArray, combination);
					}
					return true;
				}
			}
			else{
				while (targetPos == null){
					x = root.getRandomNumber() % CurrentMap.getWidth();
					y = root.getRandomNumber() % CurrentMap.getHeight();
					if (PosChecker.getUnitFromPos(x, y) == null && PosChecker.getMovePointFromUnit(x, y, unit) > 0){
						targetPos = createPos(x, y)
					}
				}
				var combination = CombinationManager.getMoveCombination(unit, x, y, MoveAIType.MOVEONLY);
				if (combination === null) {
					return this._buildEmptyAction();
				}
				unit.custom.goalX = targetPos.x
				unit.custom.goalY = targetPos.y
				if (combination.item !== null) {
					this._pushGeneral(unit, autoActionArray, combination);
					return true;
				}
				else {
					this._pushMove(unit, autoActionArray, combination);
				}
				return true;
			}
		}
	}
	return RSRogueAI0.call(this, unit, autoActionArray, keyword)
};

AttackChecker.isSpecificUnitAttackable = function(unit, targetUnit){
	var i, item, indexArray, x, y, j;
	var count = UnitItemControl.getPossessionItemCount(unit);
	
	for (i = 0; i < count; i++) {
		item = UnitItemControl.getItem(unit, i);
		if (item !== null && ItemControl.isWeaponAvailable(unit, item)) {
			indexArray = this.getAttackIndexArray(unit, item, true);
			if (indexArray.length !== 0) {
				for (j = 0; j < indexArray.length; j++){
					x = CurrentMap.getX(indexArray[j])
					y = CurrentMap.getY(indexArray[j])
					if (targetUnit.getMapX() == x && targetUnit.getMapY() == y){
						return true;
					}
				}
			}
		}
	}
	
	return false;
};

CombinationManager.getRogueApproach = function(unit, isShortcutEnabled) {
	var combinationArray, combinationIndex, combination;
	var misc = CombinationBuilder.createMisc(unit, root.getCurrentSession().createMapSimulator());
	var isRange = true;
	
	misc.isShortcutEnabled = isShortcutEnabled;
	
	// The range to detect is within a range of the unit mov.
	misc.simulator.startSimulation(unit, ParamBonus.getMov(unit));
	
	// Create combinations of an array about the action.
	combinationArray = CombinationBuilder.createApproachCombinationArray(misc);
	if (combinationArray.length === 0) {
		combinationArray = this._getShortcutCombinationArray(misc);
		if (combinationArray.length === 0) {
			return null;
		}
		isRange = false;
	}
	// Get the best combination of an array.
	combinationIndex = CombinationSelector.getCombinationIndex(unit, combinationArray);
	if (combinationIndex < 0) {
		return null;
	}
	
	// With this processing, store the best combination.
	combination = combinationArray[combinationIndex];
	
	if (isRange) {
		// Create a move course from the unit current position until the position which combination.posIndex indicates.
		combination.cource = CourceBuilder.createRangeCource(unit, combination.posIndex, combination.simulator);
	}
	else {
		combination.cource = CourceBuilder.createExtendCource(unit, combination.posIndex, combination.simulator);
	}
	
	return combination;
}