var DoubleDiceCL0 = ExperienceControl._createGrowthArray;
ExperienceControl._createGrowthArray = function(unit) {
	//call the original array.
	var growthArray = DoubleDiceCL0.call(this, unit);
	var i, n;
	//get the skill
	var skill = SkillControl.getPossessionCustomSkill(unit, "Double-Dice")
	//get parameter count.
	var count = ParamGroup.getParameterCount();
	//get weapon.
	var weapon = ItemControl.getEquippedWeapon(unit);
	//loop over array.
	for (i = 0; i < growthArray.length; i++) {
		//if it's not an upgrade and unit has the skill...
		if (growthArray[i] === 0 && skill){
			//try again.
			growthArray[i] = this._getGrowthValue(n);
		}
	}
	
	return growthArray;
};

var DoubleDiceCL1 = RestrictedExperienceControl._createObjectArray;
RestrictedExperienceControl._createObjectArray = function(unit) {
	var objectArray = DoubleDiceCL1.call(this, unit);
	var i, obj;
	var skill = SkillControl.getPossessionCustomSkill(unit, "Double-Dice")
	var count = ParamGroup.getParameterCount();
	var weapon = ItemControl.getEquippedWeapon(unit);
	//same as above.
	for (i = 0; i < objectArray.length; i++) {
		if (objectArray[i].value === 0 && skill){
			objectArray[i].value = ExperienceControl._getGrowthValue(obj.percent);
		}
	}
	return objectArray;
};
