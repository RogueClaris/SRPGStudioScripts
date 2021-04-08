//Welcome to the Redline Slayer skill!
//In order to use this plugin, create a Skill with the keyword "Redline-Slayer".
//When the unit it is assigned to drops below 25% HP, within a variance of +1HP higher,
//they will gain a 40% damage boost.

(function() {
var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	if (keyword === 'Redline-Slayer') {
		return this._isSkillInvokedInternal(active, passive, skill);
	}
	return alias1.call(this, active, passive, skill, keyword);
};

var alias2 = AttackEvaluator.HitCritical.calculateDamage;
AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, entry) {
	var damage = alias2.call(this, virtualActive, virtualPassive, entry);
	var active = virtualActive.unitSelf
	var Threshold = Math.ceil(RealBonus.getMhp(active)*0.25); //change this 0.25 to change the HP amount you must be below.
	var boost = Math.max(3, Math.ceil(damage*0.4)); //change this 0.4 to change the boost given.
	if (active.getHp() <= Threshold){
		if (SkillControl.checkAndPushCustomSkill(virtualActive.unitSelf, virtualPassive.unitSelf, entry, true, 'Redline-Slayer') !== null){
			return damage + boost;
		}
		return damage;
	}
	return damage;
};

}) (); //This seemingly random (); is an important part of the function. Do not remove it.