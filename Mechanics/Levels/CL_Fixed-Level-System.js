/*
Write custom parameters like this on a unit you want to use this plugin with:

{
	MaxStatsCL:{
		HP:45,
		Str:20,
		Mag:40,
		Skl:25,
		Spd:20,
		Def:15,
		Res:30,
		Lck:20,
		Bld:0,
		Wlv:0,
		Mov:0
	}
}

Each stat name should be how it appears in your window, so if you changed any of those
in your game, change them here as well.

Each number should be the maximum it should be if a unit is your maximum level for their class,
or your overall project, depending on what setting you use. Your unit will gain stats every level
based on how far they are from their maximum.

As a note, custom parameter maximums cannot surpass engine maximums.

Added October 28th, 2020: You may now set "banned" stats, which will not
increase. Obvious choices are Movement and Build, which have been set by
default. Simply edit the stat name into the Banned Stats array in
line 52 and you will be good to go.

Enjoy the script!
-Rogue Claris

==Script History==
October 19th, 2020:
-Released.
October 28th, 2020:
-"Banned" statups added.
*/

var CLFixed0 = ExperienceControl._createGrowthArray;
ExperienceControl._createGrowthArray = function (unit) {
	if (unit.custom.RandomLevelsCL) {
		return CLFixed0.call(this, unit);
	}
	var i, boost, max, StatProgress, StatCur, StatName, percent;
	var StatListCL = unit.custom.MaxStatsCL;
	var unitClass = unit.getClass()
	if (unitClass.custom.PreferClassMaxCL || StatListCL == null){
		StatListCL = unitClass.custom.MaxStatsCL
	}
	//only do the first 11 parameters, as some plugins add parameters that are not compatible, such as weapon ranks.
	var count = 10;
	var growthArray = [];
	//get the precentage progress of unit's current level to max level.
	var LvProgress = unit.getLv() / Miscellaneous.getMaxLv(unit)
	//get the difference in current level and max level.
	var LvDiff = (Miscellaneous.getMaxLv(unit) - unit.getLv())
	//add non-increasing stat names to this, separated by commas.
	//this stops these stats from increasing regardless of levelups.
	var StatNameArray = ["HP", "Str", "Mag", "Skl", "Spd", "Lck", "Def", "Res", "Mov", "Wlv", "Bld"];
	var BannedStats = unit.custom.BannedStats != null ? unit.custom.BannedStats : ["Mov", "Bld"];
	//check custom parameters of unit
	//loop over count
	for (i = 0; i < count; i++) {
		// Make sure to redefine the boost variable each time so as not to repeat bonuses to stats incorrectly
		boost = 0;
		// Get the name
		StatName = StatNameArray[i];
		if (StatListCL[StatName] < 1) {
			continue;
		}
		// and if it's not a banned stat...
		if (BannedStats.indexOf(StatName) === -1) {
			max = Math.min(StatListCL[StatName], ParamGroup.getMaxValue(unit, i))

			// get the current stat amount.
			StatCur = ParamGroup.getUnitValue(unit, i);

			//check progress. If stat is currently at max, it's 0.
			//otherwise, subtract current from max.
			StatProgress = StatCur < max ? max - StatCur : 0

			// check if the level difference is 0.
			// as this means this is the final level up,
			// and the system needs to max out your stats.
			if (LvDiff == 0) {
				// set the difference equal to what is required to max out.
				// ensure a check so that we don't lose stats somehow.
				boost = Math.max(0, max - StatCur);
			}
			else {
				percent = Math.round(StatProgress / LvDiff);
				if (percent < 1) {
					continue;
				}
				percent = percent / 100
				//complicated. bear with me. this is supposed to...
				//1) Round up the difference between max and current stat...
				//1a) ...as affected by the unit's progress from current level to max level.
				//2) Round up after dividing the stat max by the max level.
				//3) Choose the smaller number between the two.
				boost = Math.max(1, Math.round(max * percent));
			}
		}
		//set it.
		growthArray[i] = boost;
	}
	// Do one final round of checks to ensure null entries are set to 0 instead of null
	// Avoids a crash, and adds needed functionality to the plugin
	// Effectively allows for levels to skip a stat if it was higher at base and thus doesn't need to be raised this level.
	for (var check = 0; check < growthArray.length; check++){
		if (growthArray[check] == null){
			growthArray[check] = 0;
		}
	}
	//return it.
	return growthArray;
};

RestrictedExperienceControl.obtainExperience = function (unit, getExp) {
	//call the above function instead of executing this one one.
	if (!ExperienceControl._addExperience(unit, getExp)) {
		return null;
	}
	return ExperienceControl._createGrowthArray(unit);
};
