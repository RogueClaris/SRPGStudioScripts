//Plug and play. Causes state icons to not blink.

MapIconDecorator._addDecorationData = function(obj) {
	var pos = this._getStatePos();
	obj.addObjectType(pos.x, pos.y, IconDecorationType.STATEORFUSION, false);
}