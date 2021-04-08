ItemListScrollbar.drawScrollbar = function(xStart, yStart) {
	var i, j, x, y, isSelect;
	var isLast = false;
	var objectCount = this.getObjectCount();
	var width = this._objectWidth + this.getSpaceX();
	var height = this._objectHeight + this.getSpaceY();
	var index = (this._yScroll * this._col) + this._xScroll;
	
	xStart += this.getScrollXPadding();
	yStart += this.getScrollYPadding();
	
	// The data shouldn't be updated with draw functions, but exclude so as to enable to refer to the position with move functions.
	this.xRendering = xStart;
	this.yRendering = yStart;
	MouseControl.saveRenderingPos(this);
	
	for (i = 0; i < this._rowCount; i++) {
		y = yStart + (i * height);
		
		this.drawDescriptionLine(xStart, y);
		
		for (j = 0; j < this._col; j++) {
			x = xStart + (j * width);
			
			isSelect = index === this.getIndex();
			this.drawScrollContent(x, y, this._objectArray[index], isSelect, index);
			if (isSelect && this._isActive) {
				this.drawCursor(x, y, true);
			}
			
			if (index === this._forceSelectIndex) {
				this.drawCursor(x, y, false);
			}
			
			if (++index === objectCount) {
				isLast = true;
				break;
			}
		}
		if (isLast) {
			break;
		}
	}
	//remove the isActive check and simply draw the edge cursor.
	this.drawEdgeCursor(xStart, yStart);
};
