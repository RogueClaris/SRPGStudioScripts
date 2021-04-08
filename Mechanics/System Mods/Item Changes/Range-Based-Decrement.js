SpecialDecreaser = {
	decreaseLimit: function(unit, item, count){
		for (var i = 0; i < count; i++){
			ItemControl.decreaseItem(unit, item)
		}
	}
};

ItemUseParent.decreaseItem = function(){
	if (!this._isItemDecrementDisabled) {
		if (this._itemTargetInfo.item.custom.DistanceDrop){
			var x, y, x2, y2, FinX, FinY, Final;
			var active = this._itemTargetInfo.unit
			var passive = this._itemTargetInfo.targetUnit
			x = active.getMapX();
			y = active.getMapY();
			x2 = passive.getMapX();
			y2 = passive.getMapY();
			FinX = Math.abs(x-x2);
			FinY = Math.abs(y-y2);
			Final = Math.max(1,FinX+FinY);
			SpecialDecreaser.decreaseLimit(this._itemTargetInfo.unit, this._itemTargetInfo.item, Final)
		}
		else{
			// Reduce the item durability once.
			ItemControl.decreaseItem(this._itemTargetInfo.unit, this._itemTargetInfo.item);
		}
	}	
}

BaseItemAvailability._checkMulti = function(unit, item) {
	var i, index, x, y;
	if (item.custom.DistanceDrop){
		var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, Math.min(item.getLimit(),item.getRangeValue()));
	}
	else{
		var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, item.getRangeValue());
	}
	var count = indexArray.length
	
	for (i = 0; i < count; i++) {
		index = indexArray[i];
		x = CurrentMap.getX(index);
		y = CurrentMap.getY(index);
		if (this.isPosEnabled(unit, item, x, y)) {
			return true;
		}
	}
	
	return false;
};