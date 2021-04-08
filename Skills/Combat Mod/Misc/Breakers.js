//Hello, and welcome to the Breakers script! This script enables Awakening/Fates-style Weapon Breaker skills.
//The Keyword is your weapon type's name plus "-Breaker" or "-Breaker+", so for example: "Sword-Breaker" or "Tome-Breaker+".
//You must set a Custom Parameter on the Skill in question, {Bonus:#}, where # is the bonus to be given.
//Enjoy the script!
//Original Script by LadyRena. Edited by TacticianDaraen to make the plugin slightly lighter.

(function() {
var Moldbreaker = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	var Equipped = ItemControl.getEquippedWeapon(passive) != null ? ItemControl.getEquippedWeapon(passive).getWeaponType().getName() : "Placeholder";
	if (keyword === Equipped+"-Breaker" || keyword === Equipped+"-Breaker+"){
		return this._isSkillInvokedInternal(active, passive, skill);
	}
	return Moldbreaker.call(this, active, passive, skill, keyword);
};

var Hairtrigger = HitCalculator.calculateHit;
HitCalculator.calculateHit = function(active, passive, weapon, activeTotalStatus, passiveTotalStatus) {
	var percent = Hairtrigger.call(this, active, passive, weapon, activeTotalStatus, passiveTotalStatus)
	var Equipped = ItemControl.getEquippedWeapon(passive) != null ? ItemControl.getEquippedWeapon(passive).getWeaponType().getName() : "Placeholder";
	var Equipped2 = ItemControl.getEquippedWeapon(active) != null ? ItemControl.getEquippedWeapon(active).getWeaponType().getName() : "Placeholder";
	if (Equipped !== "Placeholder"){
		if (SkillControl.getPossessionCustomSkill(active,Equipped+'-Breaker')){
			percent += SkillControl.getPossessionCustomSkill(active,Equipped+'-Breaker').custom.Bonus
		}
		if (SkillControl.getPossessionCustomSkill(passive,Equipped2+'-Breaker')){
			percent -= SkillControl.getPossessionCustomSkill(passive,Equipped2+'-Breaker').custom.Bonus
		}
		if (SkillControl.getPossessionCustomSkill(active,Equipped+'-Breaker+')){
			percent += SkillControl.getPossessionCustomSkill(active,Equipped+'-Breaker+').custom.Bonus
		}
		if (SkillControl.getPossessionCustomSkill(passive,Equipped2+'-Breaker+')){
			percent -= SkillControl.getPossessionCustomSkill(passive,Equipped2+'-Breaker').custom.Bonus
		}
	}
	return this.validValue(active, passive, weapon, percent);
}
}) ();