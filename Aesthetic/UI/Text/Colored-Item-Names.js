/*=============================================\
|Hello and welcome to the Item Coloring script!|
|To use, simply add a custom parameter to the  |
|item in question named color, and then set the|
\value to one of the keywords below! Enjoy!!!*/

/*======================================\
|To make a custom color in this plugin, |
|all you have to do is get a Hexadecimal|
|color code, and add "0x" to the front. |
\Be sure to remove any other symbols!! */

ItemListScrollbar._getTextColor = function(object, isSelect, index) {
	var textui = this.getParentTextUI();
	var color = textui.getColor();
	// if it's an important item, use the keyword value.
	// this is just as editable as the rest, so you can change it here if you want.
	if (this._isWarningItem(object)) {
		color = ColorValue.KEYWORD;
	}
	else if (object.custom.color !== null){
		// otherwise, check the custom parameter!
		if (object.custom.color === "white"){
			//hex code goes after 0x
			//it's in RGB format.
			color = 0xffffff;
		}
		if (object.custom.color === "blue"){
			//I used google to find a hex code checker
			//they're very easy to use!
			color = 0x0c00ff;
		}
		if (object.custom.color === "green"){
			color = 0x20ff40;
		}
		if (object.custom.color === "red"){
			color = 0xff5040;
		}
		if (object.custom.color === "violet"){
			color = 0xff10ef;
		}
		if (object.custom.color === "gray"){
			color = 0x7f7f8f;
		}
		if (object.custom.color === "black"){
			color = 0x0;
		}
	}
	//return the color or it'll bug out!
	return color;
};
