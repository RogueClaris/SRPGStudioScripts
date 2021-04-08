//Hello, and welcome to the Health Shield script, by LadyRena!
//This script enables a 30% increase in defense or resistance
//when a unit's health is above half. You can, of course, change
//these values to suit your project's needs.
//To use this Script, just create a Custom Skill with the keyword
//"Health-Shield" and slap it on a unit! Enjoy!

var HS001 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	if (keyword === 'Health-Shield'){
		return this._isSkillInvokedInternal(active, passive, skill);
	}
	return HS001.call(this, active, passive, skill, keyword);
};

var HS002 = DamageCalculator.calculateDefense;
DamageCalculator.calculateDefense = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {
	var def = HS002.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);
	var Threshold = Math.floor(RealBonus.getMhp(passive)*0.5);//change this 0.5 to change the threshold you must be above to gain the bonus.
	
	if (SkillControl.getPossessionCustomSkill(passive,"Health-Shield") && Threshold < passive.getHp()){
		def = Math.max(def + 1, Math.round(def*1.3))//Change this value to change the defense buff. Note that values below 1 will DECREASE defense instead!
	}
	
	return def;
};