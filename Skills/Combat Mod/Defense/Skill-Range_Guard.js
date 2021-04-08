(function() {
var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	var PRange = skill.custom.distance;
	var UnitX = active.getMapX();
	var UnitY = active.getMapY();
	var TrgX = passive.getMapX();
	var TrgY = passive.getMapY();
	var EndX = UnitX - TrgX;
	var EndY = UnitY - TrgY;
	var FinalX, FinalY;
	if (EndX < 0){
		FinalX = EndX * -1;
	}
	else{
		FinalX = EndX;
	}
	if (EndY < 0){
		FinalY = EndY * -1;
	}
	else{
		FinalY = EndY;
	}
	if (PRange <= FinalX && FinalX !== 0 && keyword === "Range-Guard" || PRange <= FinalY && FinalY !== 0 && keyword === "Range-Guard" || FinalX+FinalY >= PRange && keyword === "Range-Guard"){
		return this._isSkillInvokedInternal(active, passive, skill);
	}
	if (PRange >= FinalX && FinalX !== 0 && keyword === "Close-Guard" || PRange >= FinalY && FinalY !== 0 && keyword === "Close-Guard"){
		return this._isSkillInvokedInternal(active, passive, skill);
	}
	return alias1.call(this, active, passive, skill, keyword);
};

var alias2 = AttackEvaluator.HitCritical.calculateDamage;
AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, entry, skill) {
	var damage = alias2.call(this, virtualActive, virtualPassive, entry);
	if (SkillControl.checkAndPushCustomSkill(virtualPassive.unitSelf, virtualActive.unitSelf, entry, false, "Range-Guard") !== null) {
		var skill2 = SkillControl.getPossessionCustomSkill(virtualPassive.unitSelf,"Range-Guard");
		if (skill2 !== null){
			damage = Math.floor(damage * skill2.custom.percent);
		}
	}
	if (SkillControl.checkAndPushCustomSkill(virtualPassive.unitSelf, virtualActive.unitSelf, entry, false, "Close-Guard") !== null) {
		var skill3 = SkillControl.getPossessionCustomSkill(virtualPassive.unitSelf,"Close-Guard");
		if (skill3 !== null){
			damage = Math.floor(damage * skill3.custom.percent);
		}
	}
	return damage;
};

}) (); //This seemingly random () is an important part of the function. Do not remove it.