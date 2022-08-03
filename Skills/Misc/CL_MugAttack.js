/*
Welcome to the Mug Attack script. This script deals
damage to a target unit after stealing, as long as they
possess a Steal skill with the Custom Parameters
outlined below.

CUSTOM PARAMETERS:
{
	MugCL:
	{
		Damage:10,
		Percent:10,
		Formula:true,
		Lethal:false,
		Weapon:false,
		Type:DamageType.PHYSICS
	}
}

Note that you should not use both Damage or Percent.

They are not incompatible, they just don't play well
with each other.

Damage will deal that much damage to the unit's HP,
while Percent will deal a percent of your maximum HP
instead.

You may set the Formula flag to true if you wish to add
your game's combat formula to the damage. If no weapon is
detected, it will use a vanilla formula of Strength for
DamageType.PHYSICS decreased by Defense, and Magic for
DamageType.MAGIC decreased by Magic Defense.

If you wish to remove the weapon's damage, you may set
the Weapon flag to false. This will deduct your weapon's
might from the formula when possible.

Mugging will not kill the enemy unless Lethal is set to true.
*/

var MugAttack1 = UnitCommand.Steal._moveTrade
UnitCommand.Steal._moveTrade = function () {
	var result = MugAttack1.call(this);
	if (!this._passive) {
		this._passive = this._unitItemStealScreen._unitDest
	}
	if (SceneManager.isScreenClosed(this._unitItemStealScreen)) {
		var resultCode = this._unitItemStealScreen.getScreenResult()
		if (resultCode == UnitItemTradeResult.TRADEEND) {
			var active = this.getCommandTarget()
			var skillActive = SkillControl.getPossessionSkill(active, SkillType.STEAL)
			if (active.getHp() > 0 && this._passive.getHp() > 0 && skillActive != null) {
				MugAttackCL(active, this._passive, skillActive);
			}
		}
	}
	return result;
}

var MugAttack2 = SkillAutoAction._enterSteal;
SkillAutoAction._enterSteal = function(){
	var result = MugAttack2.call(this);
	var skillActive = SkillControl.getPossessionSkill(this._unit, SkillType.STEAL)
	if (this._unit.getHp() > 0 && this._targetUnit.getHp() > 0 && skillActive != null) {
		MugAttackCL(this._unit, this._targetUnit, skillActive);
	}
	return result;
};

var MugAttackCL = function (active, passive, skillActive) {
	var generator = root.getEventGenerator();
	var shouldExecute = false;
	if (skillActive && typeof skillActive.custom.MugCL === 'object') {
		var obj = skillActive.custom.MugCL;
		var damage = typeof obj.Damage === 'number' ? obj.Damage : null;
		var percent = typeof obj.Percent === 'number' ? Math.round(RealBonus.getMhp(passive) * (obj.Percent / 100)) : null;
		var lethal = obj.Lethal;
		var pain = 0
		var weapon = ItemControl.getEquippedWeapon(active)
		if (damage != null) {
			pain += damage;
			shouldExecute = true
		}
		if (percent != null) {
			pain += percent;
			shouldExecute = true;
		}
		if (obj.Formula){
			shouldExecute = true;
			if (weapon != null){
				pain += AbilityCalculator.getPower(active, weapon);
				if (obj.Weapon == false){
					pain -= weapon.getPow();
				}
			}
			else if (obj.Type == DamageType.PHYSICS){
				pain += RealBonus.getStr(active);
				pain += RealBonus.getDef(passive);
			}
			else if (obj.Type == DamageType.MAGIC){
				pain += RealBonus.getMag(active);
				pain -= RealBonus.getMdf(passive);
			}
		}
		if (((passive.getHp() - pain) < 1) && lethal != true) {
			pain = passive.getHp() - 1;
		}
	}
	if (shouldExecute) {
		generator.damageHit(passive, root.queryAnime("easydamage"), pain, obj.Type, active, false);
		generator.execute();
	}
}
