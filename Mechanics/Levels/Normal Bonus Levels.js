RestrictedExperienceControl._addExperience = ExperienceControl._addExperience;
RestrictedExperienceControl._getBaselineExperience = ExperienceControl._getBaselineExperience;
RestrictedExperienceControl._createGrowthArray = ExperienceControl._createGrowthArray;
RestrictedExperienceControl._getGrowthValue = ExperienceControl._getGrowthValue;
var ReplaceExpGainedCL0 = ExperienceControl.obtainExperience;
RestrictedExperienceControl.obtainExperience = function(unit, getExp){
	return ReplaceExpGainedCL0.call(this, unit, getExp);
};
