ItemDropListScrollbar._getTextColor = function(object, isSelect, index) {
	var color = ItemListScrollbar._getTextColor.call(this, object, isSelect, index);
	//override any other color nad make it green if it's a droppable item.
	if (this._isDropItem(index)) {
		color = 0x63FF63;//Edit the hex after the 0x to change the color!
	}
	
	return color;
};
