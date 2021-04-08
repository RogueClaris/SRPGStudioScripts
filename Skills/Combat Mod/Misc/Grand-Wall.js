/*
Hello and welcome to the Grand Wall script!
To use this script, create a skill with the
custom keyword "Defender", sans quotes, and
give it to a unit of your choice. Then, simply
engage battle with that unit being within 1 tile
of an ally and they will use the Skill's activation
rate to defend said ally from harm, taking the attack
themselves!

Enjoy the Script!
-Lady Rena, October 20th, 2019
*/

NormalAttackOrderBuilder._startVirtualAttack = function() {
	var i, j, isFinal, attackCount, src, dest;
	var Savior = null;
	var state = null;
	var AbleSavior = false;
	var virtualActive, virtualPassive, isDefaultPriority;
	var unitSrc = this._attackInfo.unitSrc;
	var unitDest = this._attackInfo.unitDest;
	var i;
	var DefenseUnit = null;
	var DefenseUnitArray = [];
	var TempDefenseUnit;
	var Players = PlayerList.getSortieList();
	var Enemies = EnemyList.getAliveList();
	var Allies = AllyList.getAliveList();
	var Turn = root.getCurrentSession().getTurnType();
	var stateList = root.getBaseData().getStateList()
	for (i = 0; i < stateList.getCount(); i++){
		if (stateList.getData(i).custom.Defender){
			state = stateList.getData(i);
		}
	}
	if (Turn == TurnType.ENEMY){
		for (i = 0; i < Players.getCount(); i++){
			if (Players.getData(i) != (unitSrc || unitDest || null || undefined) && SkillControl.getPossessionCustomSkill(Players.getData(i),"Defender")){
				DefenseUnitArray.push(Players.getData(i));
			}
		}
		for (i = 0; i < Allies.getCount(); i++){
			if (Allies.getData(i) != (unitSrc || unitDest || null || undefined) && SkillControl.getPossessionCustomSkill(Allies.getData(i),"Defender")){
				DefenseUnitArray.push(Allies.getData(i));
			}
		}
	}
	else{
		for (i = 0; i < Enemies.getCount(); i++){
			if (Enemies.getData(i) != (unitSrc || unitDest || null || undefined) && SkillControl.getPossessionCustomSkill(Enemies.getData(i),"Defender")){
				DefenseUnitArray.push(Enemies.getData(i));
			}
		}
	}
	src = VirtualAttackControl.createVirtualAttackUnit(unitSrc, unitDest, true, this._attackInfo);
	dest = VirtualAttackControl.createVirtualAttackUnit(unitDest, unitSrc, false, this._attackInfo);
	
	src.isWeaponLimitless = DamageCalculator.isWeaponLimitless(unitSrc, unitDest, src.weapon);
	dest.isWeaponLimitless = DamageCalculator.isWeaponLimitless(unitDest, unitSrc, dest.weapon);
	
	isDefaultPriority = this._isDefaultPriority(src, dest);
	if (isDefaultPriority) {
		src.isInitiative = true;
	}
	else {
		dest.isInitiative = true;
	}
	if (DefenseUnitArray.length > 0){
		for (i = 0; i < DefenseUnitArray.length; i++){
			TempDefenseUnit = DefenseUnitArray[i]
			if (TempDefenseUnit == (null || undefined)){
				continue;
			}
			if (TempDefenseUnit == unitSrc){
				continue;
			}
			if (TempDefenseUnit == unitDest){
				continue;
			}
			var TargetX = TempDefenseUnit.getMapX()
			var TargetY = TempDefenseUnit.getMapY()
			var UnitX = unitDest.getMapX()
			var UnitY = unitDest.getMapY()
			var CloseX = Math.abs(UnitX - TargetX);
			var CloseY = Math.abs(UnitY - TargetY);
			if (CloseX <= 1 && CloseY <= 1){
				DefenseUnit = DefenseUnitArray[i];
				break;
			}
		}
		if (DefenseUnit != (null || undefined)){
			var DefSkill = SkillControl.getPossessionCustomSkill(DefenseUnit,"Defender")
			var TargetX = DefenseUnit.getMapX()
			var TargetY = DefenseUnit.getMapY()
			var UnitX = unitDest.getMapX()
			var UnitY = unitDest.getMapY()
			var CloseX = Math.abs(UnitX - TargetX);
			var CloseY = Math.abs(UnitY - TargetY);
			if (CloseX <= 1 && CloseY <= 1 && DefSkill.getInvocationValue() >= Math.random()*101){
				this._attackInfo.unitDest = DefenseUnit;
				Savior = VirtualAttackControl.createVirtualAttackUnit(DefenseUnit, unitSrc, false, this._attackInfo);
				if (state != null){
					StateControl.arrangeState(DefenseUnit,state,IncreaseType.INCREASE);
				}
			}
			AbleSavior = (DefenseUnit.getUnitType() == UnitType.PLAYER && root.getCurrentSession().getTurnType() == TurnType.ENEMY) || (DefenseUnit.getUnitType() == UnitType.ENEMY && root.getCurrentSession().getTurnType() == TurnType.PLAYER) || (DefenseUnit.getUnitType() == UnitType.ENEMY && root.getCurrentSession().getTurnType() == TurnType.ALLY) || (DefenseUnit.getUnitType() == UnitType.ALLY && root.getCurrentSession().getTurnType() == TurnType.ENEMY)
		}
	}
	for (i = 0;; i++) {
		// Execute if statement and else statement alternately.
		// The order of turns will change with this, for instance, after this side attacked, the opponent attacks.
		if ((i % 2) == 0) {
			if (isDefaultPriority) {
				if (Savior != null && AbleSavior){
					virtualActive = src;
					virtualPassive = Savior;
				}
				else{
					virtualActive = src;
					virtualPassive = dest;
				}
			}
			else {
				virtualActive = dest;
				virtualPassive = src;
			}
		}
		else {
			if (isDefaultPriority) {
				virtualActive = dest;
				virtualPassive = src;
			}
			else {
				virtualActive = src;
				virtualPassive = dest;
			}
		}
		
		// Check if the action number left.
		if (VirtualAttackControl.isRound(virtualActive)) {
			VirtualAttackControl.decreaseRoundCount(virtualActive);
			attackCount = this._getAttackCount(virtualActive, virtualPassive);
			
			// Loop processing because there is a possibility to attack 2 times in a row.
			for (j = 0; j < attackCount; j++) {
				isFinal = this._setDamage(virtualActive, virtualPassive);
				if (isFinal) {
					// The battle is not continued any longer because the unit has died.
					virtualActive.roundCount = 0;
					virtualPassive.roundCount = 0;
					break;
				}
			}
		}
		if (virtualActive.roundCount == 0 && virtualPassive.roundCount == 0) {
			break;
		}
	}
	if (Savior != null && AbleSavior){
		if (state != null){
			StateControl.arrangeState(DefenseUnit,state,IncreaseType.DECREASE);
		}
		this._endVirtualAttack(src, Savior);
	}
	else{
		this._endVirtualAttack(src, dest);
	}
};

var GW001 = DamageCalculator.validValue;
DamageCalculator.validValue = function(active, passive, weapon, damage) {
	var state = null;
	var stateList = root.getBaseData().getStateList()
	for (i = 0; i < stateList.getCount(); i++){
		if (stateList.getData(i).custom.Defender){
			state = stateList.getData(i);
		}
	}
	
	if(state != null && StateControl.getTurnState(passive, state)){
		damage = Math.floor(damage/2);
	}
	
	return GW001.call(this, active, passive, weapon, damage);
};