//Creates the Opportunist skill. Keyword is Opportunist. Add the custom
//parameter {Bonus:#}, where # is any whole number to be added to the
//unit's damage. Damage is added when the enemy cannot counterattack.
//The damage should be reflected in the combat display on the map. Thus,
//this skill will not popup in combat.
//-Lady Rena

var RSOPP000 = DamageCalculator.calculateAttackPower;
DamageCalculator.calculateAttackPower = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {
	var pow = RSOPP000.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue)
	var skill = SkillControl.getPossessionCustomSkill(active,'Opportunist')
	
	if (skill && !AttackChecker.isCounterattack(active, passive)){
		pow += skill.custom.boost;
	}
	
	return pow;
}