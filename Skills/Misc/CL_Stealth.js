/*
Create a custom skill with the keyword "Stealthy".
Equipper's chance of being attacked goes down, as the
targeting score for hitting them with a weapon is reduced
by 75%.
-Rogue Claris
*/ 

var RogueStealth = AIScorer.Weapon.getScore;
AIScorer.Weapon.getScore = function(unit, combination){
	var score = RogueStealth.call(this, unit, combination)
	var target = combination.targetUnit;
	if (target == null){
		return score;
	}
	var skill = SkillControl.getPossessionCustomSkill(target,"Stealthy")
	if (skill){
		score = Math.ceil(score*0.25)
	}
	return score;
};