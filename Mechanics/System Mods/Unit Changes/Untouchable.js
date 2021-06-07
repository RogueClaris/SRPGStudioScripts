/*
Add a skill with keyword "Untouchable" to unit.
They will not be targetable for actions at all.
To make them targetable, give units you wish to
be able to hurt them a skill with the keyword
"Touchable" - they will be able to target those
with "Untouchable".
*/

var RSU1 = FilterControl.isUnitTypeAllowed;
FilterControl.isUnitTypeAllowed = function(unit, targetUnit){
	var result = RSU1.call(this, unit, targetUnit);
	var skill = SkillControl.getPossessionCustomSkill(targetUnit, "Untouchable")
	var bypass = SkillControl.getPossessionCustomSkill(unit, "Touchable")
	if (skill && !bypass){
		return false;
	}
	return result;
};

var RSU2 = FilterControl.isReverseUnitTypeAllowed;
FilterControl.isReverseUnitTypeAllowed = function(unit, targetUnit){
	var result = RSU2.call(this, unit, targetUnit);
	var skill = SkillControl.getPossessionCustomSkill(targetUnit, "Untouchable")
	var bypass = SkillControl.getPossessionCustomSkill(unit, "Touchable")
	if (skill && !bypass){
		return false;
	}
	return result;
};