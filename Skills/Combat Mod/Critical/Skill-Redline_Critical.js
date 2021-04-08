/*---------------------------------------------------
|Welcome to the Redline Critical script! This script|
|enables a +50% critical chance boost at low HP.    |
|Specifically, if your unit is below 25%. To use,   |
|simply grant them a Custom Skill with the Keyword, |
|"Redline-Critical" and go about your day!          |
---------------------------------------------------*/


(function() {
var SRLC001 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	if (keyword === 'Redline-Critical') {
		return this._isSkillInvokedInternal(active, passive, skill);
	}
	return SRLC001.call(this, active, passive, skill, keyword);
};

var SRLC002 = CriticalCalculator.calculateCritical;
CriticalCalculator.calculateCritical = function(active, passive, weapon, activeTotalStatus, passiveTotalStatus) {
	var percent = SRLC002.call(this, active, passive, weapon, activeTotalStatus, passiveTotalStatus);
	var Threshold = Math.ceil(RealBonus.getMhp(active)*0.25); //Change 0.25 if you wish to change how low the unit's HP must be.
	if (SkillControl.getPossessionCustomSkill(active,'Redline-Critical') && active.getHp() <= Threshold){
		percent = Math.floor(percent*1.5) //Change this 1.5 to change the crit boost amount.
		//You can also change floor to ceil for a 1-pt higher crit bonus in case of uneven multiplication.
	}
	return this.validValue(active, passive, weapon, percent);
};
})();