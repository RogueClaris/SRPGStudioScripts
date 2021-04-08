(function() {
var alias00 = ItemDropListScrollbar.initialize;
ItemDropListScrollbar.initialize = function(){
	alias00.call(this)
	//acquire a specific graphics resource
	var list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true).getCollectionData(1, 0).getId()
	//acquire a specific icon
	var icon = root.createResourceHandle(true, list, 0, 4, 0)
	//set it as a graphics handle to be created at scrollbar initialization
	this._pic = GraphicsRenderer.getGraphics(icon, GraphicsType.ICON)
};
var alias01 = ItemDropListScrollbar.drawScrollContent;
ItemDropListScrollbar.drawScrollContent = function(x, y, object, isSelect, index) {
	var textui = this.getParentTextUI();//don't touch this
	var font = textui.getFont();//don't touch this
	alias01.call(this, x, y, object, isSelect, index)
	//check if the object at the current slot is the equipped weapon.
	if (this.getObjectFromIndex(index) === ItemControl.getEquippedWeapon(this._unit)){
		//acquire name width of the weapon.
		var tWide = TextRenderer.getTextWidth(this.getObjectFromIndex(index).getName(), font) + 32
		//draw the icon 32 pixels to the right of the weapon's name, indicating it is Equipped.
		this._pic.drawStretchParts(x+tWide, (this.getObjectHeight()*index)+y, 24, 24, 24*4, 0, 24, 24)
	}
}
})();
