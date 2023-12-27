// This will cause the CPU characters to determine a weapon to attack with where the enemy cannot counter.
var AIECL0 = AIScorer.Weapon._getTotalScore;
AIScorer.Weapon._getTotalScore = function (unit, combination) {
	// Store the original AI score.
	var score = AIECL0.call(this, unit, combination);

	// Check for the relevant Skill.
	var skill = SkillControl.getPossessionCustomSkill(unit, "CL-Evasive")

	// Only activate if the skill is found OR the global parameters allow being adaptable.
	var condition = skill != null || root.getMetaSession().global.AdaptableCL == true;
	if (!condition) {
		return score;
	}

	var unitWeapon; // for checking the weapon
	var found = false; // for breaking the loop
	var i = 0; // count how many loops to compare to item count
	var count = UnitItemControl.getPossessionItemCount(unit); // amount of unit's items

	//loop over until you find a weapon you can use that the enemy can't counter.
	while (i < count && !found) {
		//start by checking if it's a weapon.
		if (unit.getItem(i).isWeapon()) {
			//if it is, equip it.
			ItemControl.setEquippedWeapon(unit, unit.getItem(i));
			//found is equal to the target being unable to counter.
			found = !AttackChecker.isCounterattack(combination.targetUnit, unit)
		}
		++i
	}

	// Increaes score because you found a weapon.
	// Should make the weapon favored.
	if (found) {
		score += 10;
	}

	// Don't forget to return the score for use.
	return score;
};


// This will cause the CPU characters to determine a weapon that they can counter with when being attacked.
var AIECL1 = AttackChecker.isCounterattack;
AttackChecker.isCounterattack = function (unit, targetUnit) {
	// Obtain original result.
	var result = AIECL1.call(this, unit, targetUnit);

	// If we cannot counter...
	if (!result) {
		// Set up variables.
		var itemCount = UnitItemControl.getPossessionItemCount(unit);
		var found = false;

		while (i < itemCount && !found) {
			// Only check weapons.
			if (unit.getItem(i).isWeapon()) {
				// Determine if the weapon can counterattack the one attacking us.
				found = AttackChecker.isCounterattackPos(unit, targetUnit, unit.getMapX(), unit.getMapY());
				if (found) { ItemControl.setEquippedWeapon(unit, unit.getItem(i)); };
			}
			++i;
		}
	}

	return result;
}