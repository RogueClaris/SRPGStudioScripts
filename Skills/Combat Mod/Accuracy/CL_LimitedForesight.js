(function() {
var Dodgy2 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	if (keyword === "Limited-Foresight"){
		return this._isSkillInvokedInternal(active, passive, skill);
	}
	return Dodgy2.call(this,active,passive,skill,keyword);
};

var Slippery = AttackEvaluator.HitCritical.isHit;
AttackEvaluator.HitCritical.isHit = function(virtualActive, virtualPassive, attackEntry) {
	var isHit = Slippery.call(this, virtualActive, virtualPassive, attackEntry)
	if (isHit && !virtualPassive.unitSelf.custom.isHitYetCL){
		if (SkillControl.checkAndPushCustomSkill(virtualPassive.unitSelf,virtualActive.unitSelf,attackEntry,false,"Limited-Foresight")){
			virtualPassive.unitSelf.custom.isHitYetCL = true
			return false;
		}
		return isHit;
	}
	return isHit;
};

var ResetHitCL = TurnChangeStart.doLastAction;
TurnChangeStart.doLastAction = function(){
	ResetHitCL.call(this);
	var list = PlayerList.getSortieList()
	var i, unit;
	for (i = 0; i < list.getCount(); ++i){
		unit = list.getData(i)
		if (SkillControl.getPossessionCustomSkill(unit, "Limited-Foresight")){
			unit.custom.isHitYetCL = false;
		}
	}
	list = EnemyList.getAliveList()
	for (i = 0; i < list.getCount(); ++i){
		unit = list.getData(i)
		if (SkillControl.getPossessionCustomSkill(unit, "Limited-Foresight")){
			unit.custom.isHitYetCL = false;
		}
	}
	list = AllyList.getAliveList()
	for (i = 0; i < list.getCount(); ++i){
		unit = list.getData(i)
		if (SkillControl.getPossessionCustomSkill(unit, "Limited-Foresight")){
			unit.custom.isHitYetCL = false;
		}
	}
}
}) ();