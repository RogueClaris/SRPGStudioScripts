KeyEventChecker._getMultiIndexArray = function(unit, keyData) {
	var i, j, index, index2, x, y, x2, y2, event1, event2;
	var indexArrayNew = [];
	var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, keyData.rangeValue);
	var indexArray2 = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 0, 0);
	var count = indexArray.length;
	var count2 = indexArray2.length;
	var isTreasure = this._isTreasure(keyData);
	var isGate = this._isGate(keyData);
	
	for (i = 0; i < count; i++) {
		index = indexArray[i];
		x = CurrentMap.getX(index);
		y = CurrentMap.getY(index);
		if (isGate) {
			event1 = PosChecker.getPlaceEventFromPos(PlaceEventType.GATE, x, y);
			if (event1 !== null) {
				indexArrayNew.push(index);
			}
		}
	}
	if (keyData.rangeValue === 1){
		for (j = 0; j < count2; j++){
			index2 = indexArray2[j];
			x2 = CurrentMap.getX(index2);
			y2 = CurrentMap.getY(index2);
			if (isTreasure) {
				event2 = PosChecker.getPlaceEventFromPos(PlaceEventType.TREASURE, x2, y2);
				if (event2 !== null) {
					indexArrayNew.push(index2);
				}
			}
		}
	}
	else{
		for (j = 0; j < count; j++){
			index2 = indexArray[j];
			x2 = CurrentMap.getX(index2);
			y2 = CurrentMap.getY(index2);
			if (isTreasure) {
				event2 = PosChecker.getPlaceEventFromPos(PlaceEventType.TREASURE, x2, y2);
				if (event2 !== null) {
					indexArrayNew.push(index2);
				}
			}
		}
	}
	
	return indexArrayNew;
};