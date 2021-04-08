ReinforcementChecker._setMapScroll = function() {
	var session = root.getCurrentSession();
	// obtain the most recent enemy
	var Unit = EnemyList.getAliveList().getData(EnemyList.getAliveList().getCount()-1)
	// if xScroll is at 0X or off-map...
	if (this._xScroll <= 0){
		//log adjustment.
		root.log("adjusted scroll X")
		//set it to enemy X.
		this._xScroll === Unit.getMapX();
	}
	else{
		//otherwise, set normal scroll pixel X.
		session.setScrollPixelX(this._xScroll * GraphicsFormat.MAPCHIP_WIDTH);
	}
	// if yScroll is at 0Y or off-map...
	if (this._yScroll <= 0){
		//log adjustment.
		root.log("adjusted scroll Y")
		//set it to enemy Y.
		this._yScroll === Unit.getMapY();
	}
	else{
		//otherwise, set normal scroll pixel Y.
		session.setScrollPixelY(this._yScroll * GraphicsFormat.MAPCHIP_HEIGHT);
	}
};
