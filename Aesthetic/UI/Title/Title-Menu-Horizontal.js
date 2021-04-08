(function() {
TitleScene._drawScrollbar = function() {
	var x, y;
	var width = this._scrollbar.getScrollbarWidth();
	var height = this._scrollbar.getScrollbarHeight();
	var dx = -100; //A positive number moves it to the left. A negative moves it to the right
	var dy = -100; //A positive number moves it up. A negative moves it down
	
	x = -dx;
	y = root.getGameAreaHeight()*(2/3) - dy;
	this._scrollbar.drawScrollbar(x, y);
};
var CallTitleBarCL0 = TitleScene._prepareSceneMemberData;
TitleScene._prepareSceneMemberData = function() {
	CallTitleBarCL0.call(this)
	this._scrollbar = createScrollbarObject(TitleScreenBar, this);
};

TitleScreenBar = defineObject(TitleScreenScrollbar,
{
	drawScrollbar: function(xStart, yStart) {
		var i, j, x, y, isSelect, scrollableData;
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
			x = xStart + (i * width);
			
			this.drawDescriptionLine(x, yStart);
			
			for (j = 0; j < this._col; j++) {
				y = yStart + (j * height);
				
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
		
		if (this._isActive) {
			scrollableData = this.getScrollableData();
			this._edgeCursor.drawHorzCursor(xStart - this.getScrollXPadding(), yStart - this.getScrollYPadding(), scrollableData.isLeft, scrollableData.isRight);
			this._edgeCursor.drawVertCursor(xStart - this.getScrollXPadding(), yStart - this.getScrollYPadding(), scrollableData.isTop, scrollableData.isBottom);
		}
	},
	
	objectSetEnd: function() {
		var objectCount = this._objectArray.length;
		
		if (this._col === 1) {
			this._commandCursor.setCursorLeftRight(objectCount);
		}
		else if (this._showRowCount === 1) {
			this._commandCursor.setCursorUpDown(objectCount);
		}
		else {
			this._commandCursor.setCursorCross(objectCount, this._col);
		}
		
		this._rowCount = Math.ceil(objectCount / this._col);
		if (this._rowCount > this._showRowCount) {
			this._rowCount = this._showRowCount;
		}
		
		// Check if the number of previous index doesn't exceed the new count.
		this._commandCursor.validate(); 
	}
}
);

})();
