UnitMenuTopWindow._drawUnitClass = function(xBase, yBase) {
	var textui = this.getWindowTextUI();
	var color = textui.getColor();
	var font = textui.getFont();
	var length = this._getClassTextLength();
	var x = xBase + 120;
	var y = yBase + 50;
	var cls = this._unit.getClass();
	
	// Uncomment the next line to enable unit icon.
	//UnitRenderer.drawDefaultUnit(this._unit, x, y, null);
	// Uncomment the next line to enable class name.
	//TextRenderer.drawText(x + 45, y + 13, cls.getName(), length, color, font);
};

UnitMenuTopWindow._drawUnitName = function(xBase, yBase) {
	var textui = this.getWindowTextUI();
	var color = textui.getColor();
	var font = textui.getFont();
	var length = this._getUnitTextLength();
	var x = xBase + 130;
	var y = yBase + 15;
	//check if the unit has a last name parameter.
	if (typeof this._unit.custom.LastNameCL === 'string'){
		//draw the last name.
		TextRenderer.drawText(x, y, this._unit.getName()+this._unit.custom.LastNameCL, length, color, font);
	}
	//check if the unit has a title parameter.
	if (typeof this._unit.custom.TitleCL === 'string'){
		//draw the title.
		TextRenderer.drawText(x, y, "\n"+this._unit.custom.TitleCL, length, color, font);
	}
	else{
		//otherwise just draw its name.
		TextRenderer.drawText(x, y, this._unit.getName(), length, color, font);
	}
};

//don't draw the class name. you can uncomment the commented-out line below to add it back.
UnitSimpleRenderer._drawInfo = function(x, y, unit, textui) {
	var length = this._getTextLength();
	var color = textui.getColor();
	var font = textui.getFont();
	
	x += GraphicsFormat.FACE_WIDTH + this._getInterval();
	y += 40;
	// TextRenderer.drawText(x, y, unit.getClass().getName(), length, color, font);
};
