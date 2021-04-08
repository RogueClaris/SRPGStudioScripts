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
};
	
RestrictedExperienceControl._getMax = function(unit) {
	//The default number of parameters you can grow is 8, thus you should set this to 7(+1).
	//Or, if you include Mov or have an extra stat to upgrade, increment it up by 1 for each stat added.
	//Change the *7 if you need to!!
	var AMOUNT=Math.floor((Math.random()*7)+1);
	return AMOUNT;
};