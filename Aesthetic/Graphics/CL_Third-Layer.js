/*--------------------------------------------------------------------------
  Usage instruction:
  Go into the terrain tab of database, and set the following custom parameters,
  
  {
	  StealthCL:true,
	  x:5,
	  y:1
  }
  
  The "x" and "y" parameters should be the number of tiles from the left and number
  of tiles down for the image on the tileset. For example, putting units behind the
  runtime package white "pillar" mapchip would be x:2 and y:1
  
  Be aware that this can only support one image per terrain. That is the major drawback
  of this plugin.
  
  I was able to make this by modifying a plugin created by SapphireSoft,
  "highlevel-outside.js". It causes terrain with the right custom parameters
  to be drawn on top of units, so units can hide go "under" tree tops and such.
  It should be useful for aesthetic purposes, even if it makes units hard to see
  with certain terrain.
  
  Original Plugin Author:
  SapphireSoft
  http://srpgstudio.com/
  
  Original Plugin History:
  2018/08/19 Released
  
  Adapted Plugin Author:
  Rogue Claris
  
  Adapted Plugin History:
  2020/10/05 Released
  
  
--------------------------------------------------------------------------*/

(function() {
var alias3 = MapLayer.drawUnitLayer;
MapLayer.drawUnitLayer = function() {
	alias3.call(this);
	var i, j;
	for (i = 0; i < CurrentMap.getWidth(); i++){
		for (j = 0; j < CurrentMap.getHeight(); j++){
			var Terrain = PosChecker.getTerrainFromPos(i, j)
			var session = root.getCurrentSession();
			var mx = session.getScrollPixelX();
			var my = session.getScrollPixelY();
			if (Terrain.custom.StealthCL){
				var img = Terrain.getMapchipImage()
				if (MapView.isVisiblePixel(i*root.getMapchipWidth(), (j*root.getMapchipHeight())+root.getMapchipHeight())){
					if (my > 0){
						img.drawParts(LayoutControl.getPixelX(i), root.getMapchipWidth() * j - my, Terrain.custom.x * root.getMapchipWidth(), Terrain.custom.y * root.getMapchipHeight(), root.getMapchipWidth(), root.getMapchipHeight())
					}
					else{
						img.drawParts(LayoutControl.getPixelX(i), (root.getMapchipWidth() * j), Terrain.custom.x * root.getMapchipWidth(), Terrain.custom.y * root.getMapchipHeight(), root.getMapchipWidth(), root.getMapchipHeight())
					}
				}
			}
		}
	}
};

var DrawScrollCL = UnitRenderer.drawScrollUnit;
UnitRenderer.drawScrollUnit = function(unit, x, y, unitRenderParam) {
	DrawScrollCL.call(this, unit, x, y, unitRenderParam);
	var i, j;
	for (i = 0; i < CurrentMap.getWidth(); i++){
		for (j = 0; j < CurrentMap.getHeight(); j++){
			var Terrain = PosChecker.getTerrainFromPos(i, j)
			var session = root.getCurrentSession();
			var mx = session.getScrollPixelX();
			var my = session.getScrollPixelY();
			if (Terrain.custom.StealthCL){
				var img = Terrain.getMapchipImage()
				if (MapView.isVisiblePixel(i*root.getMapchipWidth(), (j*root.getMapchipHeight())+root.getMapchipHeight())){
					if (my > 0){
						img.drawParts(LayoutControl.getPixelX(i), root.getMapchipWidth() * j - my, Terrain.custom.x * root.getMapchipWidth(), Terrain.custom.y * root.getMapchipHeight(), root.getMapchipWidth(), root.getMapchipHeight())
					}
					else{
						img.drawParts(LayoutControl.getPixelX(i), (root.getMapchipWidth() * j), Terrain.custom.x * root.getMapchipWidth(), Terrain.custom.y * root.getMapchipHeight(), root.getMapchipWidth(), root.getMapchipHeight())
					}
				}
			}
		}
	}
};

})();