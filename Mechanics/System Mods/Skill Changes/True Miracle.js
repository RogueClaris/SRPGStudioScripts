/*
	Welcome to the True Miracle script.
	it makes the Survive script function like
	Miracle from Fire Emblem's later entries,
	where you need at least 1 Health Point in
	order to survive lethal blows.

	It is automatic, and you don't need to set
	anything up.

	However, if you wish for a Survive skill to
	function as vanilla, add the custom parameter
	to the Survive skill as follows:

	{
		ImmortalCL:true
	}
*/

var TM000 = AttackEvaluator.PassiveAction.evaluateAttackEntry;
AttackEvaluator.PassiveAction.evaluateAttackEntry = function(virtualActive, virtualPassive, attackEntry) {
	var value;
	
	//call for compatibility, but...
	TM000.call(this, virtualActive, virtualPassive, attackEntry);
	//we're kinda just repeating the code orz
	if (!attackEntry.isHit) {
		return;
	}
	
	// Don't continue if no dead even if get damaged.
	if (virtualPassive.hp - attackEntry.damagePassive > 0) {
		return;
	}
	
	value = this._getSurvivalValue(virtualActive, virtualPassive, attackEntry);
	if (value === -1) {
		return;
	}
	
	var skill = SkillControl.getPossessionSkill(virtualPassive.unitSelf, SkillType.SURVIVAL)
	if (skill.custom.ImmortalCL === true){
		return;
	}
	
	if (value === SurvivalValue.SURVIVAL && virtualPassive.hp > 1) {
		// Survive with HP1 by reducing 1 damage.
		attackEntry.damagePassive--;
		attackEntry.damagePassiveFull = attackEntry.damagePassive;
		
		if (attackEntry.damageActive < 0) {
			// Increase 1 because the recovery is occurred with a absorb (1 reduction of recovery amount).
			attackEntry.damageActive++;
		}
	}
};

var TM001 = SkillRandomizer.isSkillInvoked;
SkillRandomizer.isSkillInvoked = function(active, passive, skill) {
	var skilltype;
	var result = TM001.call(this, active, passive, skill);
	
	if (skill === null) {
		return false;
	}

	if (skill.custom.ImmortalCL === true){
		return result;
	}
	
	skilltype = skill.getSkillType();
	//for some reason active is the person being attacked...?
	if (skilltype === SkillType.SURVIVAL && active.getHp() > 1) {
		result = this._isSurvival(active, passive, skill);
	}
	else{
		return false;
	}
	
	return result;
};