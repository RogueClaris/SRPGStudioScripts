MapParts.Terrain._drawMain = function(x, y) {
	//check if Fog of War plugin's 'FogLight' is defined
	var FogLight = FogLight || null
	var width = this._getWindowWidth();
	var height = this._getWindowHeight();
	var xCursor = this.getMapPartsX();
	var yCursor = this.getMapPartsY();
	var terrain = PosChecker.getTerrainFromPos(xCursor, yCursor);
	var textui = this._getWindowTextUI();
	var pic = textui.getUIImage();
	// make sure terrain exists.
	if (terrain != null){
		// if terrain avoid is greater than 0,
		if (terrain.getAvoid() !== 0){
			// if FogLight exists,
			if (FogLight !== null){
				// if Fog is inactive,
				if (!FogLight.isActive()){
					// draw it.
					WindowRenderer.drawStretchWindow(x, y, width, height, pic);
				}
				// if Fog is active, array of visible tiles exists, and tile is visible,
				else if (FogLight.isActive() && FogLight._visibleArray !== null && FogLight._visibleArray[xCursor][yCursor]){
					// draw it.
					WindowRenderer.drawStretchWindow(x, y, width, height, pic);
				}
			}
			else{
				// else, draw it.
				WindowRenderer.drawStretchWindow(x, y, width, height, pic);
			}
		}
		else{
			// same as above, but draw it smaller because avoid is 0.
			// pretty up the display, you know?
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

//same as before, but for the content instead of the window size.
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
	//check foglight exists.
	if (FogLight !== null){
		//check if active.
		if (!FogLight.isActive()){
			//draw everywhere if not.
			TextRenderer.drawText(x, y, terrain.getName(), length, color, font);
		}
		//it's active. so check the array for visibility.
		else if (FogLight.isActive() && FogLight._visibleArray !== null && FogLight._visibleArray[xCursor][yCursor]){
			//draw if visible.
			TextRenderer.drawText(x, y, terrain.getName(), length, color, font);
		}
	}
	else{
		//draw because no fog of war plugin.
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
		text = ParamGroup.getParameterName(ParamGroup.getParameterIndexFromType(ParamType.DEF));
		if (FogLight !== null){
			if (!FogLight.isActive()){
				y += this.getIntervalY();
				this._drawKeyword(x, y, text, terrain.getDef());
			}
			else if (FogLight.isActive() && FogLight._visibleArray !== null && FogLight._visibleArray[xCursor][yCursor]){
				y += this.getIntervalY();
				this._drawKeyword(x, y, text, terrain.getDef());
			}
		}
		else{
			this._drawKeyword(x, y, text, terrain.getDef());
		}
	}
	
	if (terrain.getMdf() !== 0) {
		text = ParamGroup.getParameterName(ParamGroup.getParameterIndexFromType(ParamType.MDF));
		if (FogLight !== null){
			if (!FogLight.isActive()){
				y += this.getIntervalY();
				this._drawKeyword(x, y, text, terrain.getMdf());
			}
			else if (FogLight.isActive() && FogLight._visibleArray !== null && FogLight._visibleArray[xCursor][yCursor]){
				y += this.getIntervalY();
				this._drawKeyword(x, y, text, terrain.getMdf());
			}
		}
		else{
			this._drawKeyword(x, y, text, terrain.getMdf());
		}
	}
};
