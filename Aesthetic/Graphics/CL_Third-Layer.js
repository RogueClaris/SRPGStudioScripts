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
	var i, j;
	var session = root.getCurrentSession();
	var mx = session.getScrollPixelX();
	var my = session.getScrollPixelY();
	if (root.getMetaSession().global.ThirdLayerArray == null || this._mx !== mx || this._my !== my){
		root.getMetaSession().global.ThirdLayerArray = []
		for (i = 0; i < CurrentMap.getWidth(); i++){
			for (j = 0; j < CurrentMap.getHeight(); j++){
				var Terrain = PosChecker.getTerrainFromPos(i, j)
				if (Terrain.custom.StealthCL){
					this._mx = mx
					this._my = my
					var img = Terrain.getMapchipImage()
					var handle = session.getMapChipGraphicsHandle(i, j, true);
					if (MapView.isVisiblePixel(i*root.getMapchipWidth(), (j*root.getMapchipHeight())+root.getMapchipHeight())){
						if (my > 0){
							root.getMetaSession().global.ThirdLayerArray.push([img, LayoutControl.getPixelX(i), root.getMapchipWidth() * j - my, handle.getSrcX() * root.getMapchipWidth(), handle.getSrcY() * root.getMapchipHeight(), root.getMapchipWidth(), root.getMapchipHeight()])
						}
						else{
							root.getMetaSession().global.ThirdLayerArray.push([img, LayoutControl.getPixelX(i), (root.getMapchipWidth() * j), handle.getSrcX() * root.getMapchipWidth(), handle.getSrcY() * root.getMapchipHeight(), root.getMapchipWidth(), root.getMapchipHeight()])
						}
					}
				}
			}
		}
	}
	alias3.call(this);
	var t;
	var arr = root.getMetaSession().global.ThirdLayerArray
	for (t = 0; t < arr.length; ++t){
		arr[t][0].drawParts(arr[t][1], arr[t][2], arr[t][3], arr[t][4], arr[t][5], arr[t][6])
	}
};

var DrawScrollCL = UnitRenderer.drawScrollUnit;
UnitRenderer.drawScrollUnit = function(unit, x, y, unitRenderParam) {
	DrawScrollCL.call(this, unit, x, y, unitRenderParam);
	var i, j;
	var t;
	var arr = root.getMetaSession().global.ThirdLayerArray
	for (t = 0; t < arr.length; ++t){
		arr[t][0].drawParts(arr[t][1], arr[t][2], arr[t][3], arr[t][4], arr[t][5], arr[t][6])
	}
};

var EraseArrCL = ScriptCall_Load;
ScriptCall_Load = function(){
	EraseArrCL.call(this);
	delete root.getMetaSession().global.ThirdLayerArray
}

})();