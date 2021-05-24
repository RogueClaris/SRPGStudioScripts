/*
Welcome to the Penalty script. This script deals
damage to a unit after combat, as long as they
possess a specific, custom skill. Create it as
follows:

KEYWORD: PenaltyCL

CUSTOM PARAMETERS:
{
	PenaltyCL:
	{
		Damage:10,
		Percent:10,
		Lethal:false
	}
}

Note that only Damage or Percent should be used, though
they are not incompatible. Damage will deal that much
raw damage to the unit's HP, while Percent will take
a chunk of their maximum HP instead. Neither one will
kill the unit unless the Lethal flag is set to true.

Enjoy the script!
-Rogue Claris, 8/16/2020
*/

var CLPenalty0 = AttackFlow.moveEndFlow;
AttackFlow.moveEndFlow = function(){
	var result = CLPenalty0.call(this)
	var order = this._order
	var active = order.getActiveUnit();
	var passive = order.getPassiveUnit()
	var skillActive = SkillControl.getPossessionCustomSkill(active, "PenaltyCL")
	var skillPassive = SkillControl.getPossessionCustomSkill(passive, "PenaltyCL")
	var generator = root.getEventGenerator()
	if (skillActive != null && result === MoveResult.END){
		if (typeof skillActive.custom.PenaltyCL === 'object'){
			var obj = skillActive.custom.PenaltyCL
			var damage = typeof obj.Damage === 'number' ? obj.Damage : null
			var percent = typeof obj.Percent === 'number' ? Math.round(RealBonus.getMhp(active)*(obj.Percent/100)) : null
			var lethal = obj.Lethal
			if (damage != null){
				if (((active.getHp() - damage) < 1) && !lethal){
					damage = active.getHp()-1
				}
				generator.damageHit(active, root.queryAnime("easydamage"), damage, DamageType.FIXED, active, false)
			}
			if (percent != null){
				if ((active.getHp() - percent) < 1) && !lethal){
					percent = active.getHp()-1
				}
				generator.damageHit(active, root.queryAnime("easydamage"), percent, DamageType.FIXED, active, false)
			}
		}
	}
	if (skillPassive != null && result === MoveResult.END){
		if (typeof skillPassive.custom.PenaltyCL === 'object'){
			var obj = skillPassive.custom.PenaltyCL
			var damage = typeof obj.Damage === 'number' ? obj.Damage : null
			var percent = typeof obj.Percent === 'number' ? Math.round(RealBonus.getMhp(passive)*(obj.Percent/100)) : null
			var lethal = obj.Lethal
			if (damage != null){
				if (((passive.getHp() - damage) < 1) && !lethal){
					damage = passive.getHp()-1
				}
				generator.damageHit(passive, root.queryAnime("easydamage"), damage, DamageType.FIXED, passive, false)
			}
			if (percent != null){
				if ((passive.getHp() - percent) < 1) && !lethal){
					percent = passive.getHp()-1
				}
				generator.damageHit(passive, root.queryAnime("easydamage"), percent, DamageType.FIXED, passive, false)
			}
		}
	}
	generator.execute()
	return result;
}