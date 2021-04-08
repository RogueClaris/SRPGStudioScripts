//Hello! Welcome to the Crazy Beat script! Crazy Beat is a Custom Skill that
//increases your damage when your Unit is inflicted with a Bad State.
//To use it, just create a Skill with the keyword "Crazy-Beat". Hyphen included.

(function() {
var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	
	if (keyword === 'Crazy-Beat' && active.getTurnStateList().getCount() !== 0) {
		return this._isSkillInvokedInternal(active, passive, skill);
	}
	return alias1.call(this, active, passive, skill, keyword);
};

var alias2 = AttackEvaluator.HitCritical.calculateDamage;
AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, entry) {
	var damage = alias2.call(this, virtualActive, virtualPassive, entry);
	var boost = Math.max(3, Math.ceil(damage*0.2)) //Modify the 0.2 to change the damage boost.
	var i, state;
	var list = virtualActive.unitSelf.getTurnStateList();
	var count = list.getCount();
	var BadCheck;
	
	for (i = 0; i < count; i++) {
		state = list.getData(i).getState();
		if (state.isBadState()){
			BadCheck=true
		}
	}

	if (SkillControl.checkAndPushCustomSkill(virtualActive.unitSelf, virtualPassive.unitSelf, entry, true, 'Crazy-Beat') !== null && BadCheck){
		return damage + boost;
	}
	return damage;
	
};

}) (); //This seemingly random () is an important part of the function. Do not remove it.