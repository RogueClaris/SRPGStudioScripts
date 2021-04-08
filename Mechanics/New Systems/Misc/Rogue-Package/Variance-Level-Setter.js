/*

To use this plugin, simply run the commands as follows in Execute Script event commands, or as you see fit in your own plugins.

LevelSetter._adjustUnit(unit, level, isSet)
-This command has 3 parameters, which must be a unit object, an integer level, and a boolean, true or false.
--isSet will decide if the units hit higher levels when their stats go up, for example if you grant 3 levels and they are lv5, they will be lv8 now.

LevelSetter._adjustUnitAll(type, level, isSet)
-The second and third commands are the same as above. The first one is now a unit type parameter.
--The options are UnitType.PLAYER, UnitType.ENEMY, and UnitType.ALLY, which will modify those three armies at large.
---You can give individual units the custom parameter {blockGrowth:true} and they will be exempt. Give this to bosses.

LevelSetter._adjustUnitAllForce(type, level, isSet)
-Same as above, but it isn't stopped by {blockGrowth:true}

Enjoy the plugin!
-Lady Rena, 8/19/2019

*/

var LevelSetter = {
	_adjustUnit: function(unit, level, isSet){
		var Growths = ExperienceControl._createGrowthArray(unit);
		var i;
		for (i = 0; i < level; i++){
			ExperienceControl.plusGrowth(unit,Growths);
		}
		if (isSet){
			unit.setLv(unit.getLv()+level)
		}
	},
	
	_adjustUnitAll: function(type, level, isSet){
		var list, count, i, unit;
		if (type === UnitType.PLAYER){
			list = root.getMetaSession().getTotalPlayerList();
			count = list.getCount();
			for (i = 0; i < count; i++){
				unit = list.getData(i)
				if (unit.custom.blockGrowth){
					continue;
				}
				else{
					this._adjustUnit(unit,level,isSet);
				}
			}
		}
		else if (type === UnitType.ALLY){
			list = root.getMetaSession().getTotalAllyList();
			count = list.getCount();
			for (i = 0; i < count; i++){
				unit = list.getData(i)
				if (unit.custom.blockGrowth){
					continue;
				}
				else{
					this._adjustUnit(unit,level,isSet);
				}
			}
		}
		else{
			list = root.getMetaSession().getTotalEnemyList();
			count = list.getCount();
			for (i = 0; i < count; i++){
				unit = list.getData(i)
				if (unit.custom.blockGrowth){
					continue;
				}
				else{
					this._adjustUnit(unit,level,isSet);
				}
			}
		}
	},
	
	_adjustUnitAllForce: function(type, level, isSet){
		var list, count, i, unit;
		if (type === UnitType.PLAYER){
			list = root.getMetaSession().getTotalPlayerList();
			count = list.getCount();
			for (i = 0; i < count; i++){
				unit = list.getData(i)
				this._adjustUnit(unit,level,isSet);
			}
		}
		else if (type === UnitType.ALLY){
			list = root.getMetaSession().getTotalAllyList();
			count = list.getCount();
			for (i = 0; i < count; i++){
				unit = list.getData(i)
				this._adjustUnit(unit,level,isSet);
			}
		}
		else{
			list = root.getMetaSession().getTotalEnemyList();
			count = list.getCount();
			for (i = 0; i < count; i++){
				unit = list.getData(i)
				this._adjustUnit(unit,level,isSet);
			}
		}
	}
};