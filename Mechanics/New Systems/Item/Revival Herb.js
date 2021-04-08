/*
Hello and welcome to the Revival Herb plugin!
To create an automatic revival item, simply
create an unusable item with the custom
parameters set as follows:

{
	Revival:true
}

It's as simple as that - putting this item on
a non-enemy unit will revive them when they
die!

Enjoy the plugin!
-Lady Rena, April 10th, 2019

*/

var Albatross = {
	Wing: null
}

DamageEraseFlowEntry._doAction = function(damageData) {
	var targetUnit = damageData.targetUnit;
	var i;
	var item = null;
	var count = UnitItemControl.getPossessionItemCount(targetUnit)
	var generator = createObject(DynamicEvent);
	var Dynamo = generator.acquireEventGenerator();
	for (i = 0; i < count; i++){
		if (UnitItemControl.getItem(targetUnit,i).custom.Revival){
			item = UnitItemControl.getItem(targetUnit,i);
			break;
		}
	}
	if (damageData.curHp > 0) {
		targetUnit.setHp(damageData.curHp);
	}
	else {
		if (targetUnit.getUnitType() !== UnitType.ENEMY && item !== null){
			Dynamo.hpRecovery(targetUnit,root.queryAnime('classchange'),ParamBonus.getMhp(targetUnit),RecoveryType.MAX,true)
			Dynamo.execute()
			ItemControl.deleteItem(targetUnit,item);
			targetUnit.setHp(ParamBonus.getMhp(targetUnit))
			Albatross.Wing = true;
		}
		else{
			targetUnit.setHp(0);
			DamageControl.setDeathState(targetUnit);
		}
	}
};

DamageEraseFlowEntry.enterFlowEntry = function(damageData) {
	this._damageData = damageData;
	
	if (damageData.isHit) {
		this._doAction(damageData);
		if (Albatross.Wing !== null){
			return EnterResult.NOTENTER;
		}
	}
	
	if (this.isFlowSkip() || damageData.curHp > 0) {
		return EnterResult.NOTENTER;
	}
	
	this._damageData.targetUnit.setInvisible(true);
	
	this._eraseCounter = createObject(EraseCounter);
	
	return EnterResult.OK;
};

var RVHB001 = DamageControl.checkHp;
DamageControl.checkHp = function(active, passive) {
	var hp = passive.getHp();
	var i;
	var item = null;
	var count = UnitItemControl.getPossessionItemCount(passive)
	var generator = createObject(DynamicEvent);
	var Dynamo = generator.acquireEventGenerator();
	for (i = 0; i < count; i++){
		if (UnitItemControl.getItem(passive,i).custom.Revival){
			item = UnitItemControl.getItem(passive,i);
			break;
		}
	}
	if (hp > 0) {
		return;
	}
	
	if (FusionControl.getFusionAttackData(active) !== null) {
		// For isLosted which will be called later, hp doesn't become 1 at this moment.
		this.setCatchState(passive, false);
	}
	else {
		if (passive.getUnitType() !== UnitType.ENEMY && item !== null){
			Dynamo.hpRecovery(passive,root.queryAnime('classchange'),ParamBonus.getMhp(passive),RecoveryType.MAX,true)
			Dynamo.execute()
			ItemControl.deleteItem(passive,item);
			passive.setHp(ParamBonus.getMhp(passive))
			Albatross.Wing = true;
		}
		else{
			RVHB001.call(this,active,passive);
		}
	}
};