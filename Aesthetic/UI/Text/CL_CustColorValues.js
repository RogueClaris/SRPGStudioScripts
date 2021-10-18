/*
Welcome to the Custom Color Values script. To use, set global parameters like so:

{
	CustDefaultColorCL:0xffffff,
	CustKeywordColorCL:0xf9f09d,
	CustInfoColorCL:0x40bfff,
	CustDisableColorCL:0x808080,
	CustLightColorCL:0x00ffff
}

Global Parameters can be found in Database > Config tab > Script button > Global tab.

The hex codes shown above are the hex codes used by default in the engine. Do not change the 0x, instead inserting your custom hex code after it.

The parameter CustDefaultColorCL changes default text color, such as dialogue. It is usually white.
The parameter CustKeywordColorCL changes keyword text color, such as parameter names. It is usually yellow.
The parameter CustInfoColorCL changes info text color, such as...I don't actually know but I hope you find it useful. I do not know its default color.
The parameter CustDisableColorCL changes disabled item and command colors. It is usually gray.
The parameter CustLightColorCL changes, again, something I am unsure of. But if you're messing with it, you're sure to know what you want, or to swiftly find out what it does.

If you already have a set of global parameters, remember to only have one set of wrapping curly braces and to use commas.
*/

// var ColorValue = {
	// DEFAULT: 0xffffff,
	// KEYWORD: 0xf9f09d,
	// INFO: 0x40bfff,
	// DISABLE: 0x808080,
	// LIGHT: 0x00ffff 
// };

var CustColorValuesCL = ScriptCall_Enter;
ScriptCall_Enter = function(sceneType, commandType){
	var result = CustColorValuesCL.call(this, sceneType, commandType);
	if (typeof root.getMetaSession().global.CustDefaultColorCL != "undefined"){
		ColorValue.DEFAULT = root.getMetaSession().global.CustDefaultColorCL;
	}
	if (typeof root.getMetaSession().global.CustKeywordColorCL != "undefined"){
		ColorValue.KEYWORD = root.getMetaSession().global.CustKeywordColorCL;
	}
	if (typeof root.getMetaSession().global.CustInfoColorCL != "undefined"){
		ColorValue.INFO = root.getMetaSession().global.CustInfoColorCL;
	}
	if (typeof root.getMetaSession().global.CustDisableColorCL != "undefined"){
		ColorValue.DISABLE= root.getMetaSession().global.CustDisableColorCL;
	}
	if (typeof root.getMetaSession().global.CustLightColorCL != "undefined"){
		ColorValue.LIGHT = root.getMetaSession().global.CustLightColorCL;
	}
	return result;
}