(function() {
	
	var CrushIt1 = SkillRandomizer.isCustomSkillInvokedInternal;
	SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
		if (keyword === "Bypass"){
			return this._isSkillInvokedInternal(active, passive, skill);
		}
		return CrushIt1.call(this, active, passive, skill, keyword);
	};
	
	var CrushIt2 = AttackEvaluator.HitCritical.calculateDamage;
	AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, attackEntry){
		var damage = CrushIt2.call(this, virtualActive, virtualPassive, attackEntry);
		var active = virtualActive.unitSelf;
		var passive = virtualPassive.unitSelf;
		var Skill = SkillControl.checkAndPushCustomSkill(active, passive, attackEntry, true, "Bypass");
		if (Skill !== null){
			var weapon = ItemControl.getEquippedWeapon(active);
			if (Miscellaneous.isPhysicsBattle(weapon)){
				var def = RealBonus.getDef(passive);
			}
			else{
				var def = RealBonus.getMdf(passive);
			}
			damage += Math.round(def*Skill.custom.Crush);
		}
		return damage;
	};
}) (); //This seemingly random () is an important part of the function. Do not remove it.