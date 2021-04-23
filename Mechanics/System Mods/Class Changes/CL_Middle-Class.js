/*To use, set custom parameter as follows on a Class:

{
	MiddleRankCL:true
}

If the class has other parameters, do it like this:

{
	OtherParameter1:"X",
	MiddleRankCL:true
}

Do not include its own set of curly braces if it is not
the only parameter.

You may also set the global parameters as so:

{
	MiddleVsHighCL:0.75,
	MiddleVsLowCL:1.25
}

These dictate how much to modify the EXP gain of a Middle class
when fighting a High-level class, meant to be lower EXP than if
a Low-level had fought it, and the EXP gained when fighting a
Low-level class, meant to be higher than if a High-level class
had been doing the fighting.

These example parameters are the defaults and will work without
setting them in global. If you wish to change them, you may.
Setting both to 1 will result in no change for a Mid-rank class.
*/
var MiddleClassCL0 = ExperienceCalculator._getExperience;
ExperienceCalculator._getExperience = function(data, baseExp) {
	//call original EXP calculation.
	var CLEXP = MiddleClassCL0.call(this, data, baseExp);
	//check for the custom parameter used by the plugin.
	if (data.active.getClass().custom.MiddleRankCL){
		//insert vanilla EXP formula. this can be changed.
		var lv = data.passive.getLv() - data.active.getLv();
		var n;
		var vsHigh = typeof root.getMetaSession().global.MiddleVsHighCL === 'number' ? root.getMetaSession().global.MiddleVsHighCL : 0.75
		var vsLow = typeof root.getMetaSession().global.MiddleVsLowCL === 'number' ? root.getMetaSession().global.MiddleVsLowCL : 1.25
		
		if (data.passiveHp > 0) {
			//if the opponent isn't dead, add or subtract EXP based on the level difference.
			n = baseExp + lv;
		}
		else {
			//if the unit IS dead, increase EXP based on level difference and a multiplier.
			if (lv > 0) {
				//in the case of a higher level, increase dramatically by *4.
				n = lv * 4;
			}
			else {
				//in the case of a lower level, the *2 will decrease due to the lv variable being negative.
				n = lv * 2;
			}
			
			n += baseExp;
		}
		//if class rank is the same, return the vanilla EXP.
		if (data.passive.getClass().custom.MiddleRankCL){
			return n;
		}
		else if (data.passive.getClass().getClassRank() === ClassRank.HIGH){
			//process as if a "low" rank class attacked a "high" rank class, but with an EXP reduction to account for being closer in rank.
			return Math.floor(n * (DataConfig.getLowExperienceFactor() / 100) * vsHigh);
		}
		else{
			//process as if a "high" rank class attacked a "low" rank class, but with an EXP boost to account for being closer in rank.
			return Math.floor(n * (DataConfig.getHighExperienceFactor() / 100) * vsLow);
		}
	}
	//return the original EXP if the custom parameter isn't found.
	return CLEXP;
}