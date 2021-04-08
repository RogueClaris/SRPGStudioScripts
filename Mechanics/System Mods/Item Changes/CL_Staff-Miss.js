/*
Add custom parameters as follows to rescue staves:
{
	StaffHitCL:50, //base hit rate
	StaffMissCL:false //lets the staff miss if you want
}

*/

var StaffMissCL0 = RescueItemUse._moveSrc;
RescueItemUse._moveSrc = function(){
	var item = this._itemUseParent.getItemTargetInfo().item
	if (!item.custom.StaffMissCL){
		return StaffMissCL0.call(this)
	}
	var unit = this._itemUseParent.getItemTargetInfo().unit
	var baseChance = typeof item.custom.StaffHitCL === 'number' ? item.custom.StaffHitCL : 15 // adjust the base chance here
	var bonus;
	var weapon = ItemControl.getEquippedWeapon(unit)
	if (weapon !== null){
		bonus = AbilityCalculator.getHit(unit, weapon); //if the unit has a weapon, call the hit calculation
		bonus -= weapon.getHit() //subtract weapon hit from the output.
	}
	else{
		bonus = Math.max(0, RealBonus.getSki(unit) * 3) // adjust the bonus from the base unit here
	}
	if (Probability.getProbability(bonus+baseChance)){
		root.log('hit')
		return StaffMissCL0.call(this);
	}
	else{
		var target = this._itemUseParent.getItemTargetInfo().targetUnit
		var x = LayoutControl.getPixelX(target.getMapX())
		var y = LayoutControl.getPixelY(target.getMapY())
		var missAnime = root.queryAnime('fire')
		var pos = LayoutControl.getMapAnimationPos(x, y, missAnime)
		var gen = root.getEventGenerator()
		gen.damageHitEx(target, missAnime, 0, DamageType.FIXED, -999, unit, false)
		gen.execute()
		this._check = true
	}
};