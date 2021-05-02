MapParts.Terrain._drawMain = function(x, y) {
	var FogLight = FogLight || null
	var width = this._getWindowWidth();
	var height = this._getWindowHeight();
	var xCursor = this.getMapPartsX();
	var yCursor = this.getMapPartsY();
	var terrain = PosChecker.getTerrainFromPos(xCursor, yCursor);
	var textui = this._getWindowTextUI();
	var pic = textui.getUIImage();
	
	if (terrain != null){
		if (terrain.getAvoid() !== 0){
			if (FogLight !== null){
				if (!FogLight.isActive()){
					WindowRenderer.drawStretchWindow(x, y, width, height, pic);
				}
				else if (FogLight.isActive() && FogLight._visibleArray !== null && FogLight._visibleArray[xCursor][yCursor]){
					WindowRenderer.drawStretchWindow(x, y, width, height, pic);
				}
			}
			else{
				WindowRenderer.drawStretchWindow(x, y, width, height, pic);
			}
		}
		else{
			if (FogLight !== null){
				if (!FogLight.isActive()){
					WindowRenderer.drawStretchWindow(x, y, width, Math.round(height*0.75), pic);
				}
				else if (FogLight.isActive() && FogLight._visibleArray !== null && FogLight._visibleArray[xCursor][yCursor]){
					WindowRenderer.drawStretchWindow(x, y, width, Math.round(height*0.75), pic);
				}
			}
			else{
				WindowRenderer.drawStretchWindow(x, y, width, Math.round(height*0.75), pic);
			}
		}
	}
	
	x += this._getWindowXPadding();
	y += this._getWindowYPadding();
	
	this._drawContent(x, y, terrain);
};

MapParts.Terrain._drawContent = function(x, y, terrain) {
	var text;
	var FogLight = FogLight || null
	var textui = this._getWindowTextUI();
	var font = textui.getFont();
	var color = textui.getColor();
	var length = this._getTextLength();
	var xCursor = this.getMapPartsX();
	var yCursor = this.getMapPartsY();
	if (terrain === null) {
		return;
	}
	
	x += 2;
	if (FogLight !== null){
		if (!FogLight.isActive()){
			TextRenderer.drawText(x, y, terrain.getName(), length, color, font);
		}
		else if (FogLight.isActive() && FogLight._visibleArray !== null && FogLight._visibleArray[xCursor][yCursor]){
			TextRenderer.drawText(x, y, terrain.getName(), length, color, font);
		}
	}
	else{
		TextRenderer.drawText(x, y, terrain.getName(), length, color, font);
	}
	if (terrain.getAvoid() !== 0){
		y += this.getIntervalY();
		if (FogLight !== null){
			if (!FogLight.isActive()){
				this._drawKeyword(x, y, root.queryCommand('avoid_capacity'), terrain.getAvoid());
			}
			else if (FogLight.isActive() && FogLight._visibleArray !== null && FogLight._visibleArray[xCursor][yCursor]){
				this._drawKeyword(x, y, root.queryCommand('avoid_capacity'), terrain.getAvoid());
			}
		}
		else{
			this._drawKeyword(x, y, root.queryCommand('avoid_capacity'), terrain.getAvoid());
		}
	}
	if (terrain.getDef() !== 0) {
		y += this.getIntervalY();
		text = ParamGroup.getParameterName(ParamGroup.getParameterIndexFromType(ParamType.DEF));
		if (FogLight !== null){
			if (!FogLight.isActive()){
				this._drawKeyword(x, y, text, terrain.getDef());
			}
			else if (FogLight.isActive() && FogLight._visibleArray !== null && FogLight._visibleArray[xCursor][yCursor]){
				this._drawKeyword(x, y, text, terrain.getDef());
			}
		}
		else{
			this._drawKeyword(x, y, text, terrain.getDef());
		}
	}
	
	if (terrain.getMdf() !== 0) {
		y += this.getIntervalY();
		text = ParamGroup.getParameterName(ParamGroup.getParameterIndexFromType(ParamType.MDF));
		if (FogLight !== null){
			if (!FogLight.isActive()){
				this._drawKeyword(x, y, text, terrain.getMdf());
			}
			else if (FogLight.isActive() && FogLight._visibleArray !== null && FogLight._visibleArray[xCursor][yCursor]){
				this._drawKeyword(x, y, text, terrain.getMdf());
			}
		}
		else{
			this._drawKeyword(x, y, text, terrain.getMdf());
		}
	}
};