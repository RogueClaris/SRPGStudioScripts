/*
Add a skill with keyword "Untouchable" to unit.
They will not be targetable for actions at all.
To make them targetable, give units you wish to
be able to hurt them a skill with the keyword
"Touchable" - they will be able to target those
with "Untouchable".
*/

var RSU0 = PosSelector.getSelectorTarget;
PosSelector.getSelectorTarget = function(isIndexArray){
	var result = RSU0.call(this, isIndexArray);
	if (result != null && SkillControl.getPossessionCustomSkill(result, "Untouchable")){
		if (this._unit != null && SkillControl.getPossessionCustomSkill(this._unit, "Touchable")){
			return result;
		}
		return null;
	}
	return result;
}

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