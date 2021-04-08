var DrawFundsCL0 = UnitSimpleRenderer.drawContentEx;
UnitSimpleRenderer.drawContentEx = function(x, y, unit, textui, mhp) {
	DrawFundsCL0.call(this, x, y, unit, textui, mhp);
	var length = this._getTextLength();
	var color = textui.getColor();
	var font = textui.getFont();
	x += GraphicsFormat.FACE_WIDTH + this._getInterval()
	TextRenderer.drawText(x, y + 45, "Funds", length, color, font);
	x += TextRenderer.getTextWidth("Funds", font);
	NumberRenderer.drawRightNumber(x + 5, y + 42, typeof unit.custom.UserGoldCL === 'number' ? unit.custom.UserGoldCL : 0);
};

var DrawFundsCL1 = UnitSimpleRenderer._drawInfo;
UnitSimpleRenderer._drawInfo = function(x, y, unit, textui, mhp) {
	y -= 13
	DrawFundsCL1.call(this, x, y, unit, textui, mhp);
};