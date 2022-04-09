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
ExperienceControl._createGrowthArray = function(unit) {
	var i, n, max, StatProgress, StatCur, StatName;
	//only do the first 11 parameters, as some plugins add parameters that are not compatible, such as weapon ranks.
	var count = 11;
	var growthArray = [];
	//get the precentage progress of unit's current level to max level.
	var LvProgress = unit.getLv() / Miscellaneous.getMaxLv(unit)
	//get the difference in current level and max level.
	var LvDiff = Miscellaneous.getMaxLv(unit) - unit.getLv()
	//add non-increasing stat names to this, separated by commas.
	//this stops these stats from increasing regardless of levelups.
	var StatNameArray = ['HP', 'Str', 'Mag', 'Skl', 'Spd', 'Lck', 'Def', 'Res', 'Mov', 'Wlv', 'Bld'];
	var BannedStats = ["Mov","Bld"]
	//check custom parameters of unit
	if (typeof unit.custom.MaxStatsCL === 'object'){
		//loop over count
		for (i = 0; i < count; i++) {
			//complicated. bear with me. this is supposed to...
			StatName = StatNameArray[i]
			//1) check if custom param value is undefined, null, or neither.
			//2) if undefined or null, max is 0.
			//3) if neither, check if the custom param max is less than the in-engine max.
			//4) if custom parameter max is less than the in-engine max, set it to custom parameter max.
			//5) otherwise, use in-engine max.
			max = unit.custom.MaxStatsCL[StatName] != null ? unit.custom.MaxStatsCL[StatName] <= ParamGroup.getMaxValue(unit, i) ? unit.custom.MaxStatsCL[StatName] : 0 : ParamGroup.getMaxValue(unit, i)
			//get the current stat amount.
			StatCur = ParamGroup.getUnitValue(unit, i)
			//check progress. If stat is currently at max, it's 0.
			//otherwise, subtract current from max.
			StatProgress = StatCur < max ? max - StatCur : 0
			//if it's not a banned stat...
			if (BannedStats.indexOf(StatName) === -1){
				//check if the level difference is 0.
				//this means this is the final level up,
				//and the system needs to max out your stats.
				if (LvDiff === 0){
					//set the difference equal to what is required to max out.
					n = max-StatCur
				}
				else{
					//complicated. bear with me. this is supposed to...
					//1) Round up the difference between max and current stat...
					//1a) ...as affected by the unit's progress from current level to max level.
					//2) Round up after dividing the stat max by the max level.
					//3) Choose the smaller number between the two.
					n = Math.min(Math.ceil(max / Miscellaneous.getMaxLv(unit)), Math.ceil(StatProgress * LvProgress))
				}
			}
			else{
				//if it's banned it's 0. the end.
				n = 0;
			}
			//set it.
			growthArray[i] = n;
		}
	}
	else{
		//call otherwise.
		CLFixed0.call(this,unit);
	}
	//return it.
	return growthArray;
};

RestrictedExperienceControl.obtainExperience = function(unit, getExp) {
	//call the above function instead of executing this one one.
	if (!ExperienceControl._addExperience(unit, getExp)) {
		return null;
	}
	return ExperienceControl._createGrowthArray(unit);
};
