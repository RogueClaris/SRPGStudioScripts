(function() {
var CounterChecker = AttackChecker.isCounterattack;
AttackChecker.isCounterattack = function(unit, targetUnit) {
	var weapon, indexArray, targetWeapon;
	var CounterUnitList = CounterChecker.call(this,unit,targetUnit)
	var turn = root.getCurrentSession().getTurnType()
	var ableUnit = (turn === TurnType.PLAYER && unit.getUnitType() === UnitType.PLAYER) || (turn === TurnType.ALLY && unit.getUnitType() === UnitType.ALLY) || (turn === TurnType.ENEMY && unit.getUnitType() === UnitType.ENEMY);
	if (SkillControl.getPossessionCustomSkill(unit,"Spear-Distance") && ableUnit){
		return false;
	}
	return CounterUnitList;
};

}) (); //This seemingly random () is an important part of the function. Do not remove it.