/*
To use this script, give a skill
the custom parameter like so:
{RS_Desc:"Description here."}
If you do this, it will bypass
the limit set in the engine.
*/
var CL_SkillScreenCall0 = SkillScreen.drawScreenBottomText;
SkillScreen.drawScreenBottomText = function(textui) {
	var skill = this._skillInfoWindow.getSkill();
	//make sure the skill exists. check its custom parameters.
	if (skill !== null && typeof skill.custom.RS_Desc === 'string'){
		TextRenderer.drawScreenBottomText(skill.custom.RS_Desc, textui);
	}
	else{
		//call the original function if it's not there.
		CL_SkillScreenCall0.call(this, textui)	
	}
}
