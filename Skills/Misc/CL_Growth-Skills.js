/*
Create a Parameter Up skill with the bonuses you want to add to your Growth Rates.
Add the custom parameter {GrowthBonusCL:true} to it.
Give it to a unit.

The bonuses will be neutralized in the unit's stats and added as growth bonuses instead.
Enjoy the script!
*/

var SkillGrowthDopingCL0 = BaseUnitParameter.getUnitTotalGrowthBonus;
BaseUnitParameter.getUnitTotalGrowthBonus = function(unit, weapon){
	var d = SkillGrowthDopingCL0.call(this, unit, weapon);
	var i, skill;
	var arr = SkillControl.getSkillObjectArray(unit, weapon, SkillType.PARAMBONUS, '', this._getParamBonusObjectFlag());
	var count = arr.length;
	for (i = 0; i < count; i++) {
		skill = arr[i].skill;
		if (skill && skill.custom.GrowthBonusCL){
			d += this.getParameterBonus(skill);
		}
	}
	return d;
}

var SkillGrowthDopingCL1 = BaseUnitParameter.getUnitTotalParamBonus;
BaseUnitParameter.getUnitTotalParamBonus = function(unit, weapon){
	var d = SkillGrowthDopingCL1.call(this, unit, weapon);
	var i, skill;
	var arr = SkillControl.getSkillObjectArray(unit, weapon, SkillType.PARAMBONUS, '', this._getParamBonusObjectFlag());
	var count = arr.length;
	
	// Check the skill of parameter bonus.
	for (i = 0; i < count; i++) {
		skill = arr[i].skill;
		if (skill && skill.custom.GrowthBonusCL){
			d -= this.getParameterBonus(skill);
		}
	}
	return d;
};