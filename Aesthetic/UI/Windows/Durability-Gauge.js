var ItemGaugeColor = 0xff0000;
var ItemGaugeColorTwo = 0x00ff00;
var ItemGaugeColorThree = 0xffff00;
var ItemGaugeColorFour = 0x00e0ff;
var ItemGaugeColorEmpty = 0x400000;
var ItemGaugeColorFrame = 0xdaa520;
var ItemGaugeWidth = 50;
var ItemGaugeHeight = 6;

var ItemGauge = defineObject(GaugeBar, 
{
	setGaugeInfo: function(value, maxValue) {
		this._balancer.setBalancerInfo(value, maxValue);
	},
	
	drawGaugeBar: function(x, y) {
		var curValue = this._balancer.getCurrentValue();
		var maxValue = this._balancer.getMaxValue();
		var w = ItemGaugeWidth;
		var h = ItemGaugeHeight;
		var w2 = w * (curValue / maxValue);
		if (curValue == maxValue){
			var canvas = root.getGraphicsManager().getCanvas();
			canvas.setStrokeInfo(ItemGaugeColorFrame, 255, 2, true);
			canvas.setFillColor(ItemGaugeColorFour, 255);
			this.drawShape(x, y, w, h, canvas);
			canvas.setFillColor(ItemGaugeColorEmpty, 255);
			this.drawShape(x+w2, y, w-w2, h, canvas);
		}
		else if (curValue < maxValue*0.6 && curValue > maxValue*0.3){
			var canvas = root.getGraphicsManager().getCanvas();
			canvas.setStrokeInfo(ItemGaugeColorFrame, 255, 2, true);
			canvas.setFillColor(ItemGaugeColorThree, 255);
			this.drawShape(x, y, w, h, canvas);
			canvas.setFillColor(ItemGaugeColorEmpty, 255);
			this.drawShape(x+w2, y, w-w2, h, canvas);
		}
		else if (curValue < maxValue*0.3){
			var canvas = root.getGraphicsManager().getCanvas();
			canvas.setStrokeInfo(ItemGaugeColorFrame, 255, 2, true);
			canvas.setFillColor(ItemGaugeColor, 255);
			this.drawShape(x, y, w, h, canvas);
			canvas.setFillColor(ItemGaugeColorEmpty, 255);
			this.drawShape(x+w2, y, w-w2, h, canvas);
		}
		else{
			var canvas = root.getGraphicsManager().getCanvas();
			canvas.setStrokeInfo(ItemGaugeColorFrame, 255, 2, true);
			canvas.setFillColor(ItemGaugeColorTwo, 255);
			this.drawShape(x, y, w, h, canvas);
			canvas.setFillColor(ItemGaugeColorEmpty, 255);
			this.drawShape(x+w2, y, w-w2, h, canvas);
		}
	},
	
	drawShape: function(x, y, w, h, canvas) {
		canvas.drawRectangle(x, y, w, h);
	}
}
);

ItemRenderer.drawItemAlpha = function(x, y, item, color, font, isDrawLimit, alpha){
	var interval = this._getItemNumberInterval();
	var iconWidth = GraphicsFormat.ICON_WIDTH + 5;
	var length = this._getTextLength();
	var handle = item.getIconResourceHandle();
	var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam();
	
	graphicsRenderParam.alpha = alpha;
	GraphicsRenderer.drawImageParam(x, y, handle, GraphicsType.ICON, graphicsRenderParam);
	
	TextRenderer.drawAlphaText(x + iconWidth, y + ContentLayout.KEYWORD_HEIGHT, item.getName(), length, color, alpha, font);
	
	if (isDrawLimit && (item.isWeapon() || item.isWand() || !item.isWeapon() && item.getCustomKeyword() === "Shield")){
		x += 150
		y += 9
		var Gauge = createObject(ItemGauge);
		if (item.getLimitMax() !== 0){
			Gauge.setGaugeInfo(item.getLimit(),item.getLimitMax())
			Gauge.drawGaugeBar(x,y)
		}
		else{
			Gauge.setGaugeInfo(50,50)
		}
	}
	else if (isDrawLimit && !item.isWeapon() && !item.isWand()){
		this.drawItemLimit(x + iconWidth + interval, y, item, alpha)
	}
}