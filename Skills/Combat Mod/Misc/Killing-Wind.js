(function () {

var RSGF01 = DamageControl.checkHp;
DamageControl.checkHp = function(active, passive) {
	RSGF01.call(this, active, passive)
	if (typeof active.custom.RSKC != 'number'){
		active.custom.RSKC = 0
	}
	if (passive.getHp() <= 0 && SkillControl.getPossessionCustomSkill(active,"Killing-Wind") && active.custom.RSKC == 0){
		active.custom.TmpGaleRS = true
		active.custom.RSKC += 1
	}
};

var RSGF02 = UnitWaitFlowEntry._completeMemberData = function(playerTurn) {
	var event;
	var unit = playerTurn.getTurnTargetUnit();
	
	unit.setMostResentMov(0);
	
	// Unless it's unlimited action, then wait.
	if (!Miscellaneous.isPlayerFreeAction(unit)) {
		if (unit.custom.TmpGaleRS && unit.getUnitType() == UnitType.PLAYER){
			delete unit.custom.TmpGaleRS
		}
		else if (unit.custom.TmpGaleRS && unit.getUnitType() != UnitType.PLAYER){
		}
		else{
			unit.setWait(true);
		}
	}
	
	// Get a wait place event from the unit current position.
	event = this._getWaitEvent(unit);
	if (event === null) {
		return EnterResult.NOTENTER;
	}
	
	return this._capsuleEvent.enterCapsuleEvent(event, true);
};

var RSGF03 = TurnChangeEnd._removeWaitState;
TurnChangeEnd._removeWaitState = function(unit) {
	if (SkillControl.getPossessionCustomSkill(unit,"Killing-Wind")){
		unit.custom.RSKC = 0
	}
	RSGF03.call(this, unit);
};

var RSGF04 = EnemyTurn._moveEndEnemyTurn
EnemyTurn._moveEndEnemyTurn = function() {
	var i, unit
	var list = this._getActorList()
	var count = list.getCount()
	for (i = 0; i < count; i++){
		unit = list.getData(i);
		if (unit != null && unit.custom.TmpGaleRS){
			delete unit.custom.TmpGaleRS
			unit.setOrderMark(OrderMarkType.FREE)
			this._orderCount--
			this.changeCycleMode(EnemyTurnMode.TOP)
			break;
		}
	}
	if (i == count){
		TurnControl.turnEnd();
		MapLayer.getMarkingPanel().updateMarkingPanel();
		this._orderCount = 0;
	}
	return MoveResult.CONTINUE;
};

})();