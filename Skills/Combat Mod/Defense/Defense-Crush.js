(function () {

	var CrushIt1 = SkillRandomizer.isCustomSkillInvokedInternal;
	SkillRandomizer.isCustomSkillInvokedInternal = function (active, passive, skill, keyword) {
		if (keyword === "Bypass") {
			return this._isSkillInvokedInternal(active, passive, skill);
		}
		return CrushIt1.call(this, active, passive, skill, keyword);
	};

	var CrushIt2 = AttackEvaluator.HitCritical.calculateDamage;
	AttackEvaluator.HitCritical.calculateDamage = function (virtualActive, virtualPassive, attackEntry) {
		var damage = CrushIt2.call(this, virtualActive, virtualPassive, attackEntry);
		var active = virtualActive.unitSelf;
		var passive = virtualPassive.unitSelf;
		SkillControl.checkAndPushCustomSkill(active, passive, attackEntry, true, "Bypass");
		return damage;
	};

	var CrushIt3 = DamageCalculator.calculateDefense;
	DamageCalculator.calculateDefense = function (active, passive, weapon, isCritical, totalStatus, trueHitValue) {
		var result = CrushIt3.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);
		var skill = SkillControl.getPossessionCustomSkill(active, "Bypass");
		if (skill != null) {
			var multiplier = 0.5
			if (typeof skill.custom.Crush === "number") {
				multiplier = skill.custom.Crush;
			}
			result = Math.round(result * multiplier);
		}
		return result;
	};
})(); //This seemingly random () is an important part of the function. Do not remove it.