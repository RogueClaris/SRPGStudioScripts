/*
To use this part of the plugin pack, create a custom
skill with the keyword GoldStealCL and add it to a unit,
weapon, or class. Then, give it the following custom parameters:
{
	MinGold:10,
	MaxGold:300,
	Division:10
}
MinGold is the minimum amount of gold the skill can retrieve on hit.
MaxGold is the maximum amount of gold the skill can retrieve on hit.
Division is the number the amount of gold must be divisible by to be retrieved,
for example setting it to 10 means you only get gold in multiples of 10.

Be careful that your MinGold is divisible by your Division, or you will break
the plugin and encounter errors.
*/

(function() {
var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	if (keyword === 'GoldStealCL') {
		return this._isSkillInvokedInternal(active, passive, skill);
	}
	return alias1.call(this, active, passive, skill, keyword);
};

var alias2 = AttackEvaluator.HitCritical.calculateDamage;
AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, entry) {
	var damage = alias2.call(this, virtualActive, virtualPassive, entry);
	var active = virtualActive.unitSelf
	var Skill = SkillControl.getPossessionCustomSkill(active,"GoldStealCL")
	if (entry.isHit && typeof virtualPassive.unitSelf.custom.UserGoldCL === 'number'){
		if (SkillControl.checkAndPushCustomSkill(virtualActive.unitSelf, virtualPassive.unitSelf, entry, true, 'GoldStealCL') !== null){
			var gold = null;
			var max = Skill.custom.MaxGold <= virtualPassive.unitSelf.custom.UserGoldCL ? Skill.custom.MaxGold : virtualPassive.unitSelf.custom.UserGoldCL
			while (gold === null){
				reward = Math.round(Math.random()*max+1)
				if (typeof Skill.custom.Division === 'number'){
					if (reward % Skill.custom.Division === 0){
						gold = Math.max(Skill.custom.MinGold,reward)
					}
				}
				else{
					gold = reward;
				}
			}
		}
	}
	if (typeof active.custom.UserGoldCL !== 'number'){
		active.custom.UserGoldCL = gold;
	}
	else{
		active.custom.UserGoldCL += gold;
	}
	virtualPassive.unitSelf.custom.UserGoldCL -= gold
	return damage;
};

}) (); //This seemingly random (); is an important part of the function. Do not remove it.