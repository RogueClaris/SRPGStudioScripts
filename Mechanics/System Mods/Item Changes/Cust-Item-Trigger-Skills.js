var CITS000 = SkillRandomizer._isSkillInvokedInternal;
SkillRandomizer._isSkillInvokedInternal = function(active, passive, skill) {
	// if skill does not exist, do not activate it.
	if (skill === null){
		return false;
	}
	// call original function. is skill activated?
	var result = CITS000.call(this, active, passive, skill);
	
	// check custom parameter. is it a string?
	if (typeof skill.custom.SkillTrigger === 'string'){
		// check optional parameter alongside original function result.
		// is the skill to be activated only if the item is equipped, or is just being held OK?
		if (skill.custom.EquipOnly && result){
			// check that the trigger strings match.
			if (skill.custom.SkillTrigger === ItemControl.getEquippedWeapon(active).custom.SkillTrigger){
				// activate.
				return true;
			}
			// don't activate.
			result = false;
		}
		else{
			// loop over inventory.
			var i;
			var count = UnitItemControl.getPossessionItemCount(active);
			for (i = 0; i < count; i++){
				// check if the triggers match.
				if (active.getItem(i).custom.SkillTrigger === skill.custom.SkillTrigger){
					// activate
					return true;
				}
			}
			// don't activate.
			result = false;
		}
	}
	// return result
	return result;
};
