RestrictedExperienceControl._sortObjectArray = function(objectArray, sum, unit) {
	var i, obj;
	var n = 0;
	var count = objectArray.length;
	var max = this._getMax(unit);
	
	var Stats;
	
	//var sum = Math.floor((Math.random()*this._getMax(unit))+1);
	// Sort in descending order of the growth rate.
	//this._sort(objectArray);
	
	if (sum > max) {
		// There are too many parameters grown, so reduce them.
		// Disable parameters which can grow easily first.
		for (i = 0; i < count; i++) {
			obj = objectArray[i];
			if (obj.value === 0) {
				continue;
			}
			
			//obj.value = 0;
			if (++n == sum - max) {
				break;
			}
		}
	}
	else if (sum < max) {
		// There aren't many parameters grown, so increase them.
		// Make parameters, which can grow easily, grow first.
		for (i = 0; i < count; i++) {
			obj = objectArray[i];
			if (obj.value !== 0) {
				continue;
			}
			
			//obj.value = ExperienceControl._getGrowthValue(100);
			if (++n == max - sum) {
				break;
			}
		}
	}
	return objectArray;
}
	
var DoubleDiceCL1 = RestrictedExperienceControl._createObjectArray;
RestrictedExperienceControl._createObjectArray = function(unit) {
	var objectArray = DoubleDiceCL1.call(this, unit);
	var i, obj;
	var count = ParamGroup.getParameterCount();
	var weapon = ItemControl.getEquippedWeapon(unit);
	
	for (i = 0; i < objectArray.length; i++) {
		if (objectArray[i].value === 0){
			objectArray[i].value = ExperienceControl._getGrowthValue(obj.percent);
		}
	}
	return objectArray;
};
	
RestrictedExperienceControl._getMax = function(unit) {
	//The default number of parameters you can grow is 8.
	//9 if you include Mov or have an extra stat.
	return 8;
}