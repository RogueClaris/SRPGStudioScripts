//----------------------------------------------------------------------------//
//To use this script, create a Custom Skill and make the keyword "No" plus
//the name of the State you are blocking. Additionally, you may block several
//states based on their option type - the keywords are as follows for those:
//
//	Calm for blocking Berserk.
//	Manual for blocking Auto Action.
//	Willful for blocking No Action.
//	Omnisafe to bock all three.
//
//That's all. Enjoy this script and what it offers!
//----------------------------------------------------------------------------//
var StatusCheck = StateControl.isStateBlocked;
StateControl.isStateBlocked = function(unit, targetUnit, state) {
	var isStateBlocked = StatusCheck.call(this, unit, targetUnit, state)
	if (state !== null){
		var omega = state.getBadStateOption();
		if (SkillControl.getPossessionCustomSkill(unit,"No"+state.getName())){
			return true;
		}
		if (SkillControl.getPossessionCustomSkill(unit,"Calm") && omega === BadStateOption.BERSERK){
			return true;
		}
		if (SkillControl.getPossessionCustomSkill(unit,"Manual") && omega === BadStateOption.AUTO){
			return true;
		}
		if (SkillControl.getPossessionCustomSkill(unit,"Willful") && omega === BadStateOption.NOACTION){
			return true;
		}
		if (SkillControl.getPossessionCustomSkill(unit,"Omnisafe") && omega !== BadStateOption.NONE){
			return true;
		}
	}
	return isStateBlocked;
};