//very simple, plug and play
TurnChangeEnd._startNextTurn = function() {
	var nextTurnType;
	var turnType = root.getCurrentSession().getTurnType();
	this._checkActorList();
	if (turnType === TurnType.PLAYER) {
		//replaced TurnType.ENEMY with TurnType.ALLY!
		nextTurnType = TurnType.ALLY;
	}
	else if (turnType === TurnType.ALLY) {
		//replaced the above TurnType.ENEMY with TurnType.ALLY, and the below TurnType.ALLY with TurnType.ENEMY!
		nextTurnType = TurnType.ENEMY;
	}
	else {
		nextTurnType = TurnType.PLAYER;
	}
	root.getCurrentSession().setTurnType(nextTurnType);
};
