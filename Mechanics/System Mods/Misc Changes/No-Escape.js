var NOESC001 = ParamBonus.getMov;
ParamBonus.getMov = function(unit) {
	var Mov = NOESC001.call(this,unit);
	if (UnitFinderCL.getAdjacent(unit).length > 0){
		return 1;
	}
	return Mov;
};

UnitFinderCL = {
	getAdjacent: function(unit) {
		var i, index, x, y, targetUnit;
		var indexArrayNew = [];
		var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 0, 1);
		var count = indexArray.length;
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			targetUnit = PosChecker.getUnitFromPos(x, y);
			if (targetUnit !== null && unit !== targetUnit) {
				if (FilterControl.isReverseUnitTypeAllowed(unit, targetUnit)) {
					indexArrayNew.push(index);
					return indexArrayNew
				}
			}
		}
		
		return indexArrayNew;
	}
};