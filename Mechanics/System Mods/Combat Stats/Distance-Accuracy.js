var DA01 = HitCalculator.calculateSingleHit;
HitCalculator.calculateSingleHit = function(active, passive, weapon, totalStatus) {
	var ACC = DA01.call(this,active,passive,weapon,totalStatus);
	var Reduction = root.getMetaSession().global.hitloss != null ? root.getMetaSession().global.hitloss : 10
	if (SkillControl.getPossessionCustomSkill(active,"TrueshotCL") != null){
		return ACC;
	}
	if (weapon.custom.TrueshotCL){
		return ACC;
	}
	var x, y, x2, y2, FinX, FinY, Final;
	x = active.getMapX();
	y = active.getMapY();
	x2 = passive.getMapX();
	y2 = passive.getMapY();
	FinX = Math.abs(x-x2) != weapon.getStartRange() ? Math.abs(x-x2) : 0
	FinY = Math.abs(y-y2) != weapon.getStartRange() ? Math.abs(y-y2) : 0
	Final = Math.max(0,FinX+FinY-1);
	Reduction *= Final;
	return ACC-Reduction;
};