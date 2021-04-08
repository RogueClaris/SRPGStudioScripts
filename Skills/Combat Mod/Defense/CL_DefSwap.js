/*
Create a skill with the keyword "Force-Mdf" and give it to a unit wielding
a physical weapon. It will now deal damage to Resistance. Do the same with
magic weapons and a skill using the keyword "Force-Def" and you will deal
damage to defense.
*/

var DefSwapCL0 = DamageCalculator.calculateDefense;
DamageCalculator.calculateDefense = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {
	//call the original defense calculation
	var def = DefSwapCL0.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue)
	//check physical or magical battle. if physical, check to force magic defense. if magical, check to force physical defense.
	var skill = Miscellaneous.isPhysicsBattle(weapon) ? SkillControl.getPossessionCustomSkill(active, 'Force-Mdf') : SkillControl.getPossessionCustomSkill(active, 'Force-Def')
	//if no skill, return original defense.
	if (skill === null){
		return def;
	}
	//calculate as normal.
	if (this.isNoGuard(active, passive, weapon, isCritical, trueHitValue)) {
		return 0;
	}
	//swap the defenses.
	if (Miscellaneous.isPhysicsBattle(weapon)){
		def = RealBonus.getMdf(passive);
	}
	else{
		def = RealBonus.getDef(passive);
	}
	//calculate as normal.
	def += CompatibleCalculator.getDefense(passive, active, ItemControl.getEquippedWeapon(passive)) + SupportCalculator.getDefense(totalStatus);
	return def;
};