/*

Welcome to the Damage Variance script, by Lady Rena.
This script creates differing damage amounts by calling,
then multiplying damage by a random number, and adding
a minimum amount of damage back in for safety's sake.

The default damage values are 50% minimum, 130% maximum,
though these can be customized with the following custom
parameters:

{VarianceMinRS:0.9, VarianceMaxRS:1.1}

In the above example, a unit would gain or lose up to 10%
of its damage with each strike, determined randomly.

These custom parameters can be put on weapons, weapon
types, units, and classes - and they will overwrite each
other in that order. Weapons overwrite Weapon Types, Weapon
Types overwrite Units, Units overwrite Classes, and Classes
overwrite the default settings.

Please enjoy the script!

-Lady Rena, June 28th, 2020.
*/

var might = DamageCalculator.calculateDamage;
DamageCalculator.calculateDamage = function(active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue) {
	var atk = might.call(this, active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue);
	var min = typeof weapon.custom.VarianceMinRS == 'number' ? weapon.custom.VarianceMinRS : typeof weapon.getWeaponType().custom.VarianceMinRS == 'number' ? weapon.getWeaponType().custom.VarianceMinRS : typeof active.custom.VarianceMinRS == 'number' ? active.custom.VarianceMinRS : typeof active.getClass().custom.VarianceMinRS == 'number' ? active.getClass().custom.VarianceMinRS : 0.5
	var max = typeof weapon.custom.VarianceMaxRS == 'number' ? weapon.custom.VarianceMaxRS : typeof weapon.getWeaponType().custom.VarianceMaxRS == 'number' ? weapon.getWeaponType().custom.VarianceMaxRS : typeof active.custom.VarianceMaxRS == 'number' ? active.custom.VarianceMaxRS : typeof active.getClass().custom.VarianceMaxRS == 'number' ? active.getClass().custom.VarianceMaxRS : 1.3
	var baseAtk = Math.ceil(atk*min);
	var maxAtk = Math.floor(atk*max);
	var RandDmg = function(minM,maxM){
		return Math.floor(Math.random()*((maxM-minM)+1)+minM);		
	}
	atk = RandDmg(baseAtk,maxAtk);
	return this.validValue(active, passive, weapon, atk);
};

StatusRenderer.drawAttackStatus = function(x, y, arr, color, font, space) {
	var i, text;
	var length = this._getTextLength();
	var numberSpace = DefineControl.getNumberSpace();
	var buf = ['attack_capacity', 'hit_capacity', 'critical_capacity'];
	
	for (i = 0; i < 3; i++) {
		text = root.queryCommand(buf[i]);
		if (buf[i] === 'attack_capacity'){
			TextRenderer.drawKeywordText(x, y, text, length, color, font);
			x += 28 + numberSpace;
			if (arr[i] >= 0 || typeof arr[i][0] === 'number') {
				NumberRenderer.drawNumber(x - numberSpace + 6, y, arr[i][0]);
			}
			else {
				TextRenderer.drawSignText(x - numberSpace, y, StringTable.SignWord_Limitless);
				continue;
			}
			TextRenderer.drawSingleCharacter(x+1, y+3, "~", color, font)
			x += 28 + numberSpace;
			if (arr[i] >= 0 || typeof arr[i][1] === 'number') {
				NumberRenderer.drawNumber(x - numberSpace, y, arr[i][1]);
			}
			else {
				TextRenderer.drawSignText(x - numberSpace - 13, y, StringTable.SignWord_Limitless);
			}
		}
		else{
			TextRenderer.drawKeywordText(x, y, text, length, color, font);
			x += 16 + numberSpace;
			
			if (arr[i] >= 0) {
				NumberRenderer.drawNumber(x, y, arr[i]);
			}
			else {
				TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
			}
			
			x += space;
		}
	}	
};
DamageCalculator.getVanillaDamage = function(active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue) {
	var pow, def, damage;
		
	if (this.isHpMinimum(active, passive, weapon, isCritical, trueHitValue)) {
		return -1;
	}
	
	pow = this.calculateAttackPower(active, passive, weapon, isCritical, activeTotalStatus, trueHitValue);
	def = this.calculateDefense(active, passive, weapon, isCritical, passiveTotalStatus, trueHitValue);
	
	damage = pow - def;
	if (this.isHalveAttack(active, passive, weapon, isCritical, trueHitValue)) {
		if (!this.isHalveAttackBreak(active, passive, weapon, isCritical, trueHitValue)) {
			damage = Math.floor(damage / 2);
		}
	}
	
	if (this.isCritical(active, passive, weapon, isCritical, trueHitValue)) {
		damage = Math.floor(damage * this.getCriticalFactor());
	}
	
	return this.validValue(active, passive, weapon, damage);
};
AttackChecker.getAttackStatusInternal = function(unit, weapon, targetUnit) {
	var activeTotalStatus, passiveTotalStatus;
	var arr = [,,,];
	
	if (weapon === null) {
		return this.getNonStatus();
	}
	
	activeTotalStatus = SupportCalculator.createTotalStatus(unit);
	passiveTotalStatus = SupportCalculator.createTotalStatus(targetUnit);
	
	var pain = DamageCalculator.getVanillaDamage(unit, targetUnit, weapon, false, activeTotalStatus, passiveTotalStatus, 0)
	
	var min = typeof weapon.custom.VarianceMinRS == 'number' ? weapon.custom.VarianceMinRS : typeof weapon.getWeaponType().custom.VarianceMinRS == 'number' ? weapon.getWeaponType().custom.VarianceMinRS : typeof unit.custom.VarianceMinRS == 'number' ? unit.custom.VarianceMinRS : typeof unit.getClass().custom.VarianceMinRS == 'number' ? unit.getClass().custom.VarianceMinRS : 0.5
	var max = typeof weapon.custom.VarianceMaxRS == 'number' ? weapon.custom.VarianceMaxRS : typeof weapon.getWeaponType().custom.VarianceMaxRS == 'number' ? weapon.getWeaponType().custom.VarianceMaxRS : typeof unit.custom.VarianceMaxRS == 'number' ? unit.custom.VarianceMaxRS : typeof unit.getClass().custom.VarianceMaxRS == 'number' ? unit.getClass().custom.VarianceMaxRS : 1.3
	
	arr[0] = [Math.ceil(pain*min),Math.floor(pain*max)]
	arr[1] = HitCalculator.calculateHit(unit, targetUnit, weapon, activeTotalStatus, passiveTotalStatus);
	arr[2] = CriticalCalculator.calculateCritical(unit, targetUnit, weapon, activeTotalStatus, passiveTotalStatus);

	return arr;
};