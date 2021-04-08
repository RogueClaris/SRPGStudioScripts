/*
Plug and play. Nothing needs editing.
*/
var FlashWhiteWhenHitCL0 = EasyMapUnit._showDamageAnime;
EasyMapUnit._showDamageAnime = function() {
  //set a custom parameter on the unit when it is hit.
	this._unit.custom.FlashWhiteCL = true;
  //call original.
	FlashWhiteWhenHitCL0.call(this);
}

var FlashWhiteWhenHitCL2 = UnitRenderer._drawCustomCharChip;
UnitRenderer._drawCustomCharChip = function(unit, x, y, unitRenderParam){
  //transfer the unit parameter to the unit render param.
	unitRenderParam.FlashWhiteCL = unit.custom.FlashWhiteCL;
  //call original.
	FlashWhiteWhenHitCL2.call(this, unit, x, y, unitRenderParam)
};

var FlashWhiteWhenHitCL1 = UnitRenderer.drawCharChip;
UnitRenderer.drawCharChip = function(x, y, unitRenderParam) {
  //if not flashing white, call original.
	if (!unitRenderParam.FlashWhiteCL){
		FlashWhiteWhenHitCL1.call(this, x, y, unitRenderParam)
	}
	else{
		var dx, dy, dxSrc, dySrc;
		var directionArray = [4, 1, 2, 3, 0];
		var handle = unitRenderParam.handle;
		var width = GraphicsFormat.CHARCHIP_WIDTH;
		var height = GraphicsFormat.CHARCHIP_HEIGHT;
		var xSrc = handle.getSrcX() * (width * 3);
		var ySrc = handle.getSrcY() * (height * 5);
		var pic = this._getGraphics(handle, unitRenderParam.colorIndex);
		
		if (pic === null) {
			return;
		}
		
		dx = Math.floor((width - GraphicsFormat.MAPCHIP_WIDTH) / 2);
		dy = Math.floor((height - GraphicsFormat.MAPCHIP_HEIGHT) / 2);
		dxSrc = unitRenderParam.animationIndex;
		dySrc = directionArray[unitRenderParam.direction];
    //if alpha is set to 255, flash unit white at alpha 180.
    //the reason the alpha must be 255 is so that invisible units do not show up as white.
		if (unitRenderParam.alpha === 255){
			pic.setColor(0xffffff, 180)
		}
		pic.setAlpha(unitRenderParam.alpha);
		pic.setDegree(unitRenderParam.degree);
		pic.setReverse(unitRenderParam.isReverse);
		pic.drawStretchParts(x - dx, y - dy, width, height, xSrc + (dxSrc * width), ySrc + (dySrc * height), width, height);
	}
};


var StopFlashingWhite = EasyBattle.endBattle;
EasyBattle.endBattle = function() {
	var active = this.getActiveBattler().getUnit();
	var passive = this.getPassiveBattler().getUnit();
  //remove parameter from both active and passive unit now that the battle is over.
	active.custom.FlashWhiteCL = false
	passive.custom.FlashWhiteCL = false
  //call original.
	StopFlashingWhite.call(this);
}
