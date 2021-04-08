TitleScreenScrollbar.drawScrollContent = function(x, y, object, isSelect, index) {
	var text = object.getCommandName();
	var textui = this.getScrollTextUI();
	var color = textui.getColor();
	var font = textui.getFont();
	var pic = textui.getUIImage();
	
	if (!object.isSelectable()) {
		color = ColorValue.DISABLE;
	}
	//Remove the title bar rendering.
	// TextRenderer.drawFixedTitleText(x, y, text, color, font, TextFormat.CENTER, pic, 5);
};
