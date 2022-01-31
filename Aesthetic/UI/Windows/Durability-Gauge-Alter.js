/*
This edition of Durability Gauge uses your UI Graphic for the Health Gauge instead
of a custom-drawn gauge. It was a requested edit.
*/

var ItemGaugeWidth = 50;

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
		y += 5
		var GaugePic = root.queryUI('unit_gauge');
		if (item.getLimitMax() !== 0){
			var colorIndex = 1
			if (item.getLimit() < Math.round(item.GetLimitMax() * 0.25)){
				colorIndex = 3
			}
			else if (item.getLimit() < Math.round(item.GetLimitMax() * 0.5)){
				colorIndex = 2
			}
			ContentRenderer.drawGauge(x, y, item.getLimit(), item.getLimitMax(), colorIndex, ItemGaugeWidth, GaugePic)
		}
	}
	else if (isDrawLimit && !item.isWeapon() && !item.isWand()){
		this.drawItemLimit(x + iconWidth + interval, y, item, alpha)
	}
}