AttackEvaluator.PassiveAction.evaluateAttackEntry = function(virtualActive, virtualPassive, attackEntry) {
	var value;
	
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
	
	if (value === SurvivalValue.SURVIVAL && virtualPassive.hp > 1) {
		// Survive with HP1 by reducing 1 damage.
		attackEntry.damagePassive--;
		attackEntry.damagePassiveFull = attackEntry.damagePassive;
		
		if (attackEntry.damageActive < 0) {
			// Increase 1 because the recovery is occurred with a absorb (1 reduction of recovery amount).
			attackEntry.damageActive++;
		}
	}
	else if (value === SurvivalValue.AVOID) {
		// The opponent is immortal and cannot die, so disable the settings so far.
		attackEntry.isHit = false;
		attackEntry.isCritical = false;
		attackEntry.damagePassive = 0;
		attackEntry.damageActive = 0;
		attackEntry.damagePassiveFull = 0;
	}
};
var TM001 = SkillRandomizer.isSkillInvoked;
SkillRandomizer.isSkillInvoked = function(active, passive, skill) {
	var skilltype;
	var result = TM001.call(this, active, passive, skill);
	
	if (skill === null) {
		return false;
	}
	
	skilltype = skill.getSkillType();
	
	if (skilltype === SkillType.SURVIVAL && active.getHp() > 1) {
		result = this._isSurvival(active, passive, skill);
	}
	
	return result;
};