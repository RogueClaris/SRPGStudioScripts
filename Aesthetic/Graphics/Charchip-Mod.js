//DON'T USE THE RTP WITH THIS MOD. AT ALL.
//When creating CUSTOM ASSETS to use with
//this script, make sure the rows are six
//charchips wide.
(function() {

UnitCounter.moveUnitCounter = function() {
	var result = this._counter.moveCycleCounter();
	
	if (result !== MoveResult.CONTINUE) {
		if (++this._unitAnimationIndex === 10) {
			this._unitAnimationIndex = 0;
		}
	}
	
	result = this._counter2.moveCycleCounter();
	if (result !== MoveResult.CONTINUE) {
		if (++this._unitAnimationIndex2 === 2) {
			this._unitAnimationIndex2 = 0;
		}
	}

	return result;
};

UnitCounter.getAnimationIndex = function() {
	var a = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];
	
	return a[this._unitAnimationIndex];
};

UnitRenderer.drawCharChip = function(x, y, unitRenderParam) {
	var dx, dy, dxSrc, dySrc;
	var directionArray = [4, 1, 2, 3, 0];
	var handle = unitRenderParam.handle;
	var width = GraphicsFormat.CHARCHIP_WIDTH;
	var height = GraphicsFormat.CHARCHIP_HEIGHT;
	var xSrc = handle.getSrcX() * (width * 6);
	var ySrc = handle.getSrcY() * (height * 5);
	var pic = this._getGraphics(handle, unitRenderParam.colorIndex);
	
	if (pic === null) {
		return;
	}
	
	dx = Math.floor((width - GraphicsFormat.MAPCHIP_WIDTH) / 2);
	dy = Math.floor((height - GraphicsFormat.MAPCHIP_HEIGHT) / 2);
	dxSrc = unitRenderParam.animationIndex;
	dySrc = directionArray[unitRenderParam.direction];
	
	pic.setAlpha(unitRenderParam.alpha);
	pic.setDegree(unitRenderParam.degree);
	pic.setReverse(unitRenderParam.isReverse);
	pic.drawStretchParts(x - dx, y - dy, width, height, xSrc + (dxSrc * width), ySrc + (dySrc * height), width, height);
};

MapLayer.drawUnitLayer = function() {
	var index = this._counter.getAnimationIndex();
	var index2 = this._counter.getAnimationIndex2();
	var session = root.getCurrentSession();
	var HPGauges = EnvironmentControl.getMapUnitHpType();
	var ShadowCheck = EnvironmentControl.isMapUnitSymbol();
	this._markingPanel.drawMarkingPanel();
	
	this._unitRangePanel.drawRangePanel();
	this._mapChipLight.drawLight();
	var URP = StructureBuilder.buildUnitRenderParam();
	URP.animationIndex = index;
	if (session !== null) {
		// session.drawUnitSet(true, true, true, index, index2);
		var ListP = PlayerList.getSortieList();
		var ListA = AllyList.getAliveList();
		var ListE = EnemyList.getAliveList();
		var p, a, e, unit;
		for (p = 0; p < ListP.getCount(); p++){
			unit = ListP.getData(p);
			URP.colorIndex = 0;
			URP.handle = unit.getCharChipResourceHandle();
			x = LayoutControl.getPixelX(unit.getMapX());
			y = LayoutControl.getPixelY(unit.getMapY());
			if (unit.custom.RSDD != true){
				if (ShadowCheck){
					MapSymbolDecorator.setupDecoration(unit)
				}
				UnitRenderer.drawDefaultUnit(unit, x, y, URP);
				if (HPGauges != 2){
					MapHpDecorator.setupDecoration(unit);
				}
				root.drawCharChipStateIcon(x, y, unit)
			}
		}
		for (a = 0; a < ListA.getCount(); a++){
			unit = ListA.getData(a);
			URP.colorIndex = 2;
			URP.handle = unit.getCharChipResourceHandle();
			x = LayoutControl.getPixelX(unit.getMapX());
			y = LayoutControl.getPixelY(unit.getMapY());
			if (unit.custom.RSDD != true){
				if (ShadowCheck){
					MapSymbolDecorator.setupDecoration(unit)
				}
				UnitRenderer.drawDefaultUnit(unit, x, y, URP);
				if (HPGauges != 2){
					MapHpDecorator.setupDecoration(unit);
				}
				root.drawCharChipStateIcon(x, y, unit)
			}
		}
		for (e = 0; e < ListE.getCount(); e++){
			unit = ListE.getData(e);
			URP.colorIndex = 1;
			URP.handle = unit.getCharChipResourceHandle();
			x = LayoutControl.getPixelX(unit.getMapX());
			y = LayoutControl.getPixelY(unit.getMapY());
			if (unit.custom.RSDD != true){
				if (ShadowCheck){
					MapSymbolDecorator.setupDecoration(unit)
				}
				UnitRenderer.drawDefaultUnit(unit, x, y, URP);
				if (HPGauges != 2){
					MapHpDecorator.setupDecoration(unit);
				}
				root.drawCharChipStateIcon(x, y, unit)
			}
		}
	}
	
	this._drawColor(EffectRangeType.MAPANDCHAR);
	
	if (this._effectRangeType === EffectRangeType.MAPANDCHAR) {
		this._drawScreenColor();
	}
};

var RSDD1 = SimulateMove.startMove;
SimulateMove.startMove = function(unit, moveCource) {
	unit.custom.RSDD = true;
	RSDD1.call(this, unit, moveCource)
};

var RSDD2 = SimulateMove._endMove;
SimulateMove._endMove = function(unit) {
	unit.custom.RSDD = false;
	RSDD2.call(this, unit);
};

MapHpDecorator._getNumberColorIndex = function(type) {
	var a = [3, 2, 1, 0]
	return a[type];
};

MapHpDecorator._getPos = function(unit) {
	var x = LayoutControl.getPixelX(unit.getMapX());
	var y = LayoutControl.getPixelY(unit.getMapY());
	if (GraphicsFormat.MAPCHIP_WIDTH !== 32 || GraphicsFormat.MAPCHIP_HEIGHT !== 32) {
		x += 8;
		y += 8;
	}
	
	return {
		x: x,
		y: y
	};
};

MapHpDecorator._setupDecorationFromType = function(type, unit) {
	var obj = root.getHpDecoration(type);
	if (unit == null){
		return;
	}
	var Gradient, Canvas;
	var pos = this._getPos(unit);
	var width = 32;
	var height = 10;
	var color = this._getColor(type);
	var alpha = this._getAlpha(type);
	var strokeColor = 0xff;
	var strokeAlpha = 255;
	var hpType = EnvironmentControl.getMapUnitHpType();
	
	obj.beginDecoration();
	
	if (hpType == 0) {
		NumberRenderer.drawNumberColor(pos.x+10, pos.y+12, unit.getHp(), 0, 255)
		// // The color and outline are set before calling addRectangle.
		// obj.setFillColor(color, alpha);
		// obj.setStrokeInfo(strokeColor, strokeAlpha, 1, true);
		// obj.addRectangle(pos.x, pos.y, width, height);
		
		// obj.addHp(pos.x, pos.y, 0);
	}
	else if (hpType == 1) {
		// if (unit.custom.Canvas != null && unit.custom.Canvas != undefined){
			// unit.custom.Canvas.setStrokeInfo(strokeColor, strokeAlpha, 1, true);
			// unit.custom.Canvas.setDegree(270)
			// unit.custom.Canvas.setGradient(unit.custom.Gradient)
			// unit.custom.Canvas.drawRectangle(pos.x-12, pos.y+12, width, height)
		// }
		//^Ignore this for now.
		obj.addGauge(pos.x, pos.y, 1);
		obj.endDecoration()
		// ^original code
		root.drawCharChipHpGauge(0, 24, unit)
		// ^small addition to make it draw with the edits.
		//
		// Canvas = root.getGraphicsManager().getCanvas();
		// Canvas.setStrokeInfo(strokeColor, strokeAlpha, 1, true)
		// Gradient = Canvas.createGradient();
		// Gradient.beginGradient(GradientType.LINEAR)
		// Gradient.addColor(0xff0000, 200)
		// Gradient.addColor(color, 200)
		// Canvas.setGradient(Gradient)
		// Gradient.endGradient()
		// Canvas.setDegree(270)
		// Canvas.drawRectangle(pos.x-12, pos.y+12, width, height)
		// ^pretty, vertical HP bars. laggy with lots of units.
		//
		// Canvas = root.getGraphicsManager().getCanvas();
		// Canvas.setStrokeInfo(strokeColor, strokeAlpha, 1, true)
		// Canvas.setFillColor(color, alpha)
		// Canvas.drawRectangle(pos.x, pos.y+24, width, height)
		// ^horizontal HP bars, less laggy than the gradient version.
	}
};

MapHpDecorator.setupDecoration = function(unit) {
	if (unit == null){
		return;
	}
	else if (unit.getHp() == ParamBonus.getMhp(unit)){		
		this._setupDecorationFromType(HpDecorationType.FULL, unit);
	}
	else if (unit.getHp() >= Math.floor(ParamBonus.getMhp(unit)*0.75)){
		this._setupDecorationFromType(HpDecorationType.NONFULL, unit);
	}
	else if (unit.getHp() >= Math.floor(ParamBonus.getMhp(unit)*0.5)){
		this._setupDecorationFromType(HpDecorationType.HALF, unit);
	}
	else if (unit.getHp() >= 1){
		this._setupDecorationFromType(HpDecorationType.QUARTER, unit);
	}
};

ConfigItem.MapUnitHpVisible.selectFlag = function(index) {
	root.getMetaSession().setDefaultEnvironmentValue(17, index);
	for (var i = 0; i < PlayerList.getSortieList().getCount(); i++){
		MapHpDecorator.setupDecoration(PlayerList.getSortieList().getData(i));
	}
	MapHpDecorator._setupHpBars(PlayerList.getSortieList())
	MapHpDecorator._setupHpBars(AllyList.getAliveList())
	MapHpDecorator._setupHpBars(EnemyList.getAliveList())
	
};

var RSCHP0 = DamageControl.reduceHp;
DamageControl.reduceHp = function(unit, damage){
	RSCHP0.call(this, unit, damage);
	MapHpDecorator._setupHpBarUnit(unit)
};

MapHpDecorator._setupHpBars = function(army){
	var i, unit;
	if (EnvironmentControl.getMapUnitHpType() != 1){
		return;
	}
	for (i = 0; i < army.getCount(); i++){
		unit = army.getData(i)
		this._setupHpBarUnit(unit)
	}
};

MapHpDecorator._setupHpBarUnit = function(unit){
	var Canvas = root.getGraphicsManager().getCanvas();
	var Gradient = Canvas.createGradient();
	var pos = this._getPos(unit);
	var width = 32;
	var height = 10;
	var type = this._getType(unit)
	var color = this._getColor(type);
	var alpha = this._getAlpha(type);
	var strokeColor = 0xff;
	var strokeAlpha = 255;
	unit.custom.Canvas = Canvas;
	// this._Canvas.setStrokeInfo(strokeColor, strokeAlpha, 1, true);
	Gradient.beginGradient(GradientType.LINEAR)
	Gradient.addColor(0xffb000, 200)
	Gradient.addColor(color, 200)
	Gradient.endGradient()
	unit.custom.Gradient = Gradient
	// this._Canvas.setDegree(270)
	// this._Canvas.drawRectangle(pos.x-12, pos.y+12, width, height)
}

MapHpDecorator._getType = function(unit){
	if (unit.getHp() == ParamBonus.getMhp(unit)){
		return HpDecorationType.FULL
	}
	else if (unit.getHp() == Math.floor(ParamBonus.getMhp(unit)*0.75)){
		return HpDecorationType.NOTFULL
	}
	else if (unit.getHp() == Math.floor(ParamBonus.getMhp(unit)*0.5)){
		return HpDecorationType.HALF
	}
	else if (unit.getHp() >= 1){
		return HpDecorationType.QUARTER;
	}
}

var Shadows = MapSymbolDecorator._setupDecorationFromType;
MapSymbolDecorator._setupDecorationFromType = function(type, unit){
	var obj = root.getSymbolDecoration(type);
	var color = this._getColor(type);
	var alpha = this._getAlpha(type);
	var pos = this._getPos(unit);
	var width = 32;
	var height = 18;
	
	obj.beginDecoration();
	if (EnvironmentControl.isMapUnitSymbol()) {
		obj.setFillColor(color, alpha);
		obj.setLargeSize(-2, 0, 4, 6);
		obj.addEllipse(pos.x, pos.y, width, height);
	}
	obj.endDecoration();
	if (unit != null){
		root.drawCharChipSymbol(0, 20, unit)
	}
};

MapSymbolDecorator.setupDecoration = function(unit) {
	if (unit == null){
	}
	else{
		if (unit.getUnitType() == UnitType.PLAYER){
			this._setupDecorationFromType(SymbolDecorationType.PLAYER, unit);
		}
		else if (unit.getUnitType() == UnitType.ENEMY){
			this._setupDecorationFromType(SymbolDecorationType.ENEMY, unit);
		}
		else{
			this._setupDecorationFromType(SymbolDecorationType.PARTNER, unit);
		}
	}
};

MapSymbolDecorator._getPos = function(unit) {
	var x = LayoutControl.getPixelX(unit.getMapX());
	var y = LayoutControl.getPixelY(unit.getMapY());
	if (GraphicsFormat.MAPCHIP_WIDTH !== 32 || GraphicsFormat.MAPCHIP_HEIGHT !== 32) {
		x += 8;
		y += 8;
	}
	
	return {
		x: x,
		y: y
	};
};

var RSEB0 = EasyBattle._enableDefaultCharChip;
EasyBattle._enableDefaultCharChip = function(isDraw) {
	if (isDraw){
		this._order.getActiveUnit().custom.RSDD = true
		this._order.getPassiveUnit().custom.RSDD = true
	}
	else{
		this._order.getActiveUnit().custom.RSDD = false
		this._order.getPassiveUnit().custom.RSDD = false
	}
	RSEB0.call(this, isDraw)
};

}) ();