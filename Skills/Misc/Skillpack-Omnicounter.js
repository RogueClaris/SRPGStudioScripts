AttackChecker.isCounterattack = function(unit, targetUnit) {
	var weapon, indexArray, targetWeapon;
	
	if (!Calculator.isCounterattackAllowed(unit, targetUnit)) {
		return false;
	}
	
	weapon = ItemControl.getEquippedWeapon(unit);
	if (weapon !== null && weapon.isOneSide()) {
		// If the attacker is equipped with "One Way" weapon, no counterattack occurs.
		return false;
	}
	
	// Get the equipped weapon of those who is attacked.
	targetWeapon = ItemControl.getEquippedWeapon(targetUnit);
	
	// If no weapon is equipped, cannot counterattack.
	if (targetWeapon === null) {
		return false;
	}
	
	// If "One Way" weapon is equipped, cannot counterattack.
	if (targetWeapon.isOneSide()) {
		return false;
	}
	indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), targetWeapon);
	var TargetX = targetUnit.getMapX()
	var TargetY = targetUnit.getMapY()
	var UnitX = unit.getMapX()
	var UnitY = unit.getMapY()
	var CloseX = UnitX - TargetX;
	var CloseY = UnitY - TargetY;
	if (CloseX < 0){
		var FinalX = CloseX * -1
	}
	else{
		var FinalX = CloseX
	}
	if (CloseY < 0){
		var FinalY = CloseY * -1
	}
	else{
		var FinalY = CloseY
	}
	root.log(FinalX)
	root.log(FinalY)
	if (IndexArray.findUnit(indexArray, unit) !== unit && SkillControl.getPossessionCustomSkill(targetUnit,"Distant-Counter") && FinalX >= ItemControl.getEquippedWeapon(targetUnit).getEndRange() || IndexArray.findUnit(indexArray, unit) !== unit && SkillControl.getPossessionCustomSkill(targetUnit,"Distant-Counter") && FinalY >= ItemControl.getEquippedWeapon(targetUnit).getEndRange()){
		return true;
	}
	if (IndexArray.findUnit(indexArray, unit) !== unit && SkillControl.getPossessionCustomSkill(targetUnit,"Close-Counter") && FinalX < ItemControl.getEquippedWeapon(targetUnit).getStartRange() && FinalY < ItemControl.getEquippedWeapon(targetUnit).getStartRange()){
		return true;
	}
	if (IndexArray.findUnit(indexArray, unit) !== unit && SkillControl.getPossessionCustomSkill(targetUnit,"Omni-Counter")){
		return true;
	}
	
	return IndexArray.findUnit(indexArray, unit);
};