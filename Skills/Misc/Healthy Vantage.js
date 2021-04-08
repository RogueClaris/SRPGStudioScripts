NormalAttackOrderBuilder._isDefaultPriority = function(virtualActive, virtualPassive) {
	var active = virtualActive.unitSelf;
	var passive = virtualPassive.unitSelf;
	var skilltype = SkillType.FASTATTACK;
	var skill = SkillControl.getPossessionSkill(active, skilltype);
	
	if (SkillRandomizer.isSkillInvoked(active, passive, skill)) {
		// If those who launched an attack have the skill of "Preemptive Attack", decide normal battle at that time.
		return true;
	}
	
	if (this._attackInfo.isCounterattack) {
		// If the opponent can counterattack, check if they have a skill of "Preemptive Attack".
		// If the attacker has no skill of preemptive attack, and the opponent has it instead, the opponent launches an attack.
		skill = SkillControl.getPossessionSkill(passive, skilltype);
		
		if (SkillRandomizer.isSkillInvoked(passive, active, skill) && typeof skill.custom.ProcDown === "number"){
			root.log("Potato Down")
			if (passive.getHp() <= Math.floor(RealBonus.getMhp(passive)*skill.custom.ProcDown)){
				virtualPassive.skillFastAttack = skill;
				return false;
			}
		}
		
		else if (SkillRandomizer.isSkillInvoked(passive, active, skill) && typeof skill.custom.ProcUp === "number"){
			root.log("Potato Up")
			if (passive.getHp() >= Math.ceil(RealBonus.getMhp(passive)*skill.custom.ProcUp)){
				virtualPassive.skillFastAttack = skill;
				return false;
			}
		}
		
		else if (SkillRandomizer.isSkillInvoked(passive, active, skill)) {
			root.log("Omnipotato")
			// Due to no attackEntry, cannot add at this moment.
			// Save it so as to be able to add later.
			virtualPassive.skillFastAttack = skill;
			return false;
		}
	}
	
	return true;
};