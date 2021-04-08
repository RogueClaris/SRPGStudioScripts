var TerrainBonusCL = PosChecker.getTerrainFromPos;
PosChecker.getTerrainFromPos = function(x, y){
	var terrain = TerrainBonusCL.call(this, x, y)
	if (terrain != null){
		if (terrain.custom.SkipTopCL){
			return this.getTerrainFromPosEx(x, y)
		}
	}
	return terrain;
};