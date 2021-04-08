var FogCan1 = HitCalculator.calculateSingleHit;
HitCalculator.calculateSingleHit = function(active, passive, weapon, totalStatus){
	var Hit = FogCan1.call(this, active, passive, weapon, totalStatus);
	if (active.getUnitType() === UnitType.PLAYER){
		var x = passive.getMapX()
		var y = passive.getMapY()
		var Hidden = MysteryLight !== (null || undefined) && MysteryLight.isActive() && MysteryLight._visibleArray !== (null || undefined) && !MysteryLight._visibleArray[x][y]
		if (Hidden){
			Hit -= 45
		}
	}
	return Hit;
};

var FogCancel = AttackChecker.isCounterattack;
AttackChecker.isCounterattack = function(unit, targetUnit){
	unit.setInvisible(false)
	targetUnit.setInvisible(false)
	var result = FogCancel.call(this, unit, targetUnit);
	var x = targetUnit.getMapX()
	var y = targetUnit.getMapY()
	if (MysteryLight !== (null || undefined) && MysteryLight.isActive() && MysteryLight._visibleArray !== (null || undefined) && !MysteryLight._visibleArray[x][y]){
		targetUnit.setInvisible(true);
	}
	return result;
}