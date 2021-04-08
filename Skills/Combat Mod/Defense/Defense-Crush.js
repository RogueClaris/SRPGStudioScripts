(function() {
	
	var CrushIt1 = SkillRandomizer.isCustomSkillInvokedInternal;
	SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
		if (keyword === "Bypass"){
			return this._isSkillInvokedInternal(active, passive, skill);
		}
		return CrushIt1.call(this, active, passive, skill, keyword);
	};
	
	var CrushIt2 = DamageCalculator.calculateDefense;
	DamageCalculator.calculateDefense = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {
		var def = CrushIt2.call(this,active,passive,weapon,isCritical,totalStatus,trueHitValue);
		var Skill = SkillControl.getPossessionCustomSkill(active,"Bypass");
		if (Skill){
			def = Math.round(def*Skill.custom.Crush);
		}
		return def;
	};
}) (); //This seemingly random () is an important part of the function. Do not remove it.