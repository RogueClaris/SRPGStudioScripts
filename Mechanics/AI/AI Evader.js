var AIECL0 = AIScorer.Weapon._getTotalScore;
AIScorer.Weapon._getTotalScore = function(unit, combination) {
	//call and get the original score.
	var score = AIECL0.call(this, unit, combination);
	//comes in handy later.
	var found = false;
	//set loop count to zero.
	var i = 0;
	//get unit's weapon.
	var unitWeapon = ItemControl.getEquippedWeapon(unit);
	//get item count.
	var count = UnitItemControl.getPossessionItemCount(unit);
	//get target's weapon.
	var targetWeapon = ItemControl.getEquippedWeapon(combination.targetUnit);
	//if target is not undesirable and target is unarmed, nearly force targeting with +100 to score.
	if (targetWeapon === null && score !== -1){
		score += 100;
		//immediately return score.
		return score;
	}
	//loop over until you find a weapon you can use that the enemy can't counter.
	while (i < count && !found){
		//start by checking if it's a weapon.
		if (unit.getItem(i).isWeapon()){
			//if it is, equip it.
			ItemControl.setEquippedWeapon(unit, unit.getItem(i));
			//found is equal to the target being unable to counter.
			found = !AttackChecker.isCounterattack(combination.targetUnit, unit)
		}
		++i
	}
	//the score is +10'd with the newly equipped weapon. weapon should be favored.
	score += 10;
	//return score.
	return score;
};
