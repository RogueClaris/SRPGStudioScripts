/* To use this script, create a custom skill with the keyword CL_Zomblade
 * and create a Player Unit with the stats and items you want spawned.
 * Then, note the ID of the Player Unit. If you do not have Database IDs
 * visible, then do the following:
 *
 * Click Tools at the top of the engine and select Options
 * Go to the Data tab of the window that pops up
 * Check "Display id next to data name"
 * 
 * With that done, you can now see your Player Unit's ID. If it's your first
 * one it should be zero - which is fine. Arrays start at 0 anyway.
 *
 * Go back to your custom skill, and enter the following custom parameter:
 *
 * {BookmarkCL:#}
 *
 * Where you replace # with the ID of the Player Unit.
 * Upon killing a unit with this skill equipped, you should summon
 * the Player Unit in their place as an Ally.
 *
 * If you wish to force the kill to happen with an activation of this skill,
 * Add this custom parameter, so that it looks like this:
 *
 * {BookmarkCL:#, RequireProc:true}
 *
 * Again, replacing # with the ID. Using RequireProc:true will force the skill
 * not to spawn the unit unless the killing blow is landed at the same time as the skill
 * "activating", e.g. say it has a 50% chance to happen, then it needs to both activate that
 * 50% chance AND the chance must activate on the killing blow.
 *
 * A unit may only be zombified by default if it is of Mob importance.
 * Additionally, units can be made to never be zombified with the custom parameter seen below:
 *
 * {DenyZombladeCL:true}
 *
 * However, if you wish to allow a Leader or Subleader-class unit to be zombified, you may setDeathState
 * the following custom parameter:
 *
 * {AllowZombladeCL:true}
 *
 * This script was made for a user on the Steam Forums, then going by Hellfire Revenant.
 * If you find it useful, please be thankful to them as much as me.
 * -RogueClaris
 */
(function(){
	UNIT_ID = null;
	UNIT_TYPE = null;
	var ZombladeCL01 = DamageControl.checkHp;
	DamageControl.checkHp = function(active, passive){
		var skill = SkillControl.getPossessionCustomSkill(active, "CL_Zomblade");
		if (skill && passive.getHp() <= 0){
			if (skill.custom.RequireProc && skill.custom.isProccedCL || !skill.custom.RequireProc){
				if (skill.custom.isProccedCL){
					skill.custom.isProccedCL = false
				}
				if (passive.getImportance() === ImportanceType.MOB && !passive.custom.DenyZombladeCL || passive.custom.AllowZombladeCL){
					UNIT_ID = skill.custom.BookmarkCL;
					if (active.getUnitType() === UnitType.PLAYER){
						UNIT_TYPE = UnitType.ALLY;
					}
					else{
						UNIT_TYPE = UnitType.ENEMY;
					}
				}
			}
		}
		ZombladeCL01.call(this, active, passive);
	};
	
	var ZombladeCL02 = DamageControl.setDeathState;
	DamageControl.setDeathState = function(unit){
		var x = unit.getMapX();
		var y = unit.getMapY();
		ZombladeCL02.call(this, unit);
		if (UNIT_ID !== null){
			var unit2 = root.getBaseData().getPlayerList().getDataFromId(UNIT_ID);
			var unit3 = root.getObjectGenerator().generateUnitFromBaseUnit(unit2);
			unit3.setMapX(x);
			unit3.setMapY(y);
			var generator = root.getEventGenerator();
			generator.unitAssign(unit3, UNIT_TYPE);
			generator.execute();
			UNIT_ID = null
		}
	};
	
	var ZombladeCL03 = SkillRandomizer.isCustomSkillInvokedInternal;
	SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
		if (keyword === "CL_Zomblade"){
			return this._isSkillInvokedInternal(active, passive, skill);
		}
		return ZombladeCL03.call(this, active, passive, skill, keyword);
	};
	
	var ZombladeCL04 = SkillRandomizer._isSkillInvokedInternal;
	SkillRandomizer._isSkillInvokedInternal = function(active, passive, skill){
		var result = ZombladeCL04.call(this, active, passive, skill);
		if (result && skill.getCustomKeyword() === "CL_Zomblade"){
			skill.custom.isProccedCL = true;
		}
		return result;
	}
})()