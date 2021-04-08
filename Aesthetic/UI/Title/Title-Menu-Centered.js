(function() {
TitleScene._drawScrollbar = function() {
	var x, y;
	var width = this._scrollbar.getScrollbarWidth();
	var height = this._scrollbar.getScrollbarHeight();
	var dx = 100; //A positive number moves it to the left. A negative moves it to the right
	var dy = 0; //A positive number moves it up. A negative moves it down
	
	x = root.getGameAreaWidth()*(1/2) - dx;
	y = root.getGameAreaHeight()*(2/3) - dy;
	this._scrollbar.drawScrollbar(x, y);
}
})();