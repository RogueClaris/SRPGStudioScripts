var RSDrain1 = DamageControl.reduceHp;
DamageControl.reduceHp = function(unit, damage){
	if (unit.custom.RS_HealByElement){
		var mhp;
		var hp = unit.getHp();
		
		if (damage > 0) {
			mhp = ParamBonus.getMhp(unit);
			hp += damage;
			if (hp > mhp) {
				hp = mhp;
			}
		}
		else {
			mhp = ParamBonus.getMhp(unit);
			hp -= damage;
			if (hp > mhp) {
				hp = mhp;
			}
		}
		unit.setHp(hp);
		unit.custom.RS_HealByElement = false;
	}
	else{
		RSDrain1.call(this, unit, damage)
	}
};

var RSDrain2 = AttackFlow._doAttackAction;
AttackFlow._doAttackAction = function(){
	var order = this._order;
	var active = order.getActiveUnit();
	var passive = order.getPassiveUnit();
	var ActiveElement = typeof active.custom.RS_Element === 'string' ? active.custom.RS_Element : null
	var PassiveElement = typeof passive.custom.RS_Element === 'string' ? passive.custom.RS_Element : null
	var ActiveWeapon = typeof ItemControl.getEquippedWeapon(active).custom.RS_Element === 'string' ? ItemControl.getEquippedWeapon(active).custom.RS_Element : undefined
	var PassiveWeapon = typeof ItemControl.getEquippedWeapon(passive).custom.RS_Element === 'string' ? ItemControl.getEquippedWeapon(passive).custom.RS_Element : undefined
	if (ActiveElement === PassiveWeapon){
		active.custom.RS_HealByElement = true
	}
	if (PassiveElement === ActiveWeapon){
		passive.custom.RS_HealByElement = true
	}
	RSDrain2.call(this)
};
