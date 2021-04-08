RecoveryItemAI._getScore = function(unit, combination) {
	var baseHp;
	var maxHp = ParamBonus.getMhp(combination.targetUnit);
	var currentHp = combination.targetUnit.getHp();
	// If the unit has max hp, score is minimum.
	if (currentHp === maxHp) {
		return AIValue.MIN_SCORE;
	}
	// This formula starts at 50 Points.
	// Then, we divide current HP by maximum, obtaining a decimal.
	// Multiply that decimal by 100 and we get their current HP in real number percent, floored.
	// Subtract it from 50. This result is the score for healing them.
	// The lowest number easily findable seems to be 2-3. Thus, the highest healing
	// score is 48.
	// Adjust the 50 to easily adjust the max score, making healing more likely to happen.
	return 50-Math.floor(100*(currentHp/maxHp))
}
