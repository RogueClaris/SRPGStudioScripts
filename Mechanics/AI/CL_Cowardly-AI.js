/*
Create a unit with the Custom AI Keyword "CowardCL", without quotes.
The rest will take care of itself.
*/

var BuildCowardiceCL0 = AutoActionBuilder.buildCustomAction;
AutoActionBuilder.buildCustomAction = function(unit, autoActionArray, keyword) {
	if (keyword == "CowardCL"){
		var simulator = root.getCurrentSession().createMapSimulator();
		simulator.startSimulationWeaponAll(UnitFilterFlag.PLAYER)
		var AtkArr = simulator.getSimulationWeaponIndexArray() + simulator.getSimulationIndexArray();
		var MovArr = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, RealBonus.getMov(unit));
		var pos = null;
		var range = 0
		var x, y;
		var index = CurrentMap.getIndex(unit.getMapX(), unit.getMapY())
		if (AtkArr.indexOf(index) === -1){
			return this._buildEmptyAction();
		}
		while (pos === null && range < MovArr.length){
			x = CurrentMap.getX(MovArr[range]);
			y = CurrentMap.getY(MovArr[range]);
			if (AtkArr.indexOf(MovArr[range]) === -1 && PosChecker.getUnitFromPos(x, y) === null){
				pos = createPos(x, y);
			}
			if (pos === null){
				++range;
			}
		}
		if (range >= MovArr.length && pos === null){
			return this._buildEmptyAction();
		}
		var combination = CombinationManager.getMoveCombination(unit, pos.x, pos.y, MoveAIType.MOVEONLY);
		// Set the target position to move.
		this._pushMove(unit, autoActionArray, combination);
		
		// Set it so as to wait after move.
		this._pushWait(unit, autoActionArray, combination);
		return true;
	}
	return BuildCowardiceCL0.call(this, unit, autoActionArray, keyword);
}