(function() {
var Dodgy = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	if (keyword === "Slip-Dodge"){
		return this._isSkillInvokedInternal(active, passive, skill);
	}
	return Dodgy.call(this,active,passive,skill,keyword);
};

var Slippery = AttackEvaluator.HitCritical.isHit;
AttackEvaluator.HitCritical.isHit = function(virtualActive, virtualPassive, attackEntry) {
	var Skill = SkillControl.getPossessionCustomSkill(virtualPassive.unitSelf,"Slip-Dodge")
	if (!attackEntry.isFirstAttack){
		if (SkillControl.checkAndPushCustomSkill(virtualPassive.unitSelf,virtualActive.unitSelf,attackEntry,false,"Slip-Dodge")){
			return false;
		}
		return Slippery.call(this, virtualActive, virtualPassive, attackEntry)
	}
	return Slippery.call(this, virtualActive, virtualPassive, attackEntry)
};
}) ();