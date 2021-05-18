/*
Mark a Sure Attack skill with the following custom parameter:
{
	EffectiveShowCL:true
}
*/

var RecolorEffCL0 = DamageCalculator.isEffective;
DamageCalculator.isEffective = function(active, passive, weapon, isCritical, trueHitValue) {
	var result = RecolorEffCL0.call(this, active, passive, weapon, isCritical, trueHitValue);
	var skill = SkillControl.getPossessionSkill(active, SkillType.TRUEHIT)
	if (skill && skill.getSkillValue() === TrueHitValue.EFFECTIVE && skill.custom.EffectiveShowCL && skill.getTargetAggregation().isCondition(passive)){
		return true;
	}
	return result;
};