(function() {
var alias3 = AttackEvaluator.AttackMotion.evaluateAttackEntry;
AttackEvaluator.AttackMotion.evaluateAttackEntry = function(virtualActive, virtualPassive, attackEntry) {
	var midData = this._getAttackMotionId(virtualActive, virtualPassive, attackEntry);
	var found = false;
	var i = 0;
	//loop over skill array active, checking for CustAnime.
	while (i < attackEntry.skillArrayActive.length && !found){
		found = typeof attackEntry.skillArrayActive[i].custom.CustAnime === 'number' ? attackEntry.skillArrayActive[i].custom.CustAnime : false
		i++
	}
	// Get motion ID of the attack.
	if(typeof found === 'number'){
		// Set the Motion ID.
		attackEntry.motionIdActive = found;
	}
	else{
		// default the Motion ID.
		attackEntry.motionIdActive = midData.id;
	}
	attackEntry.motionActionTypeActive = midData.type;
	
	attackEntry.moveIdActive = midData.idMoveOnly;
	attackEntry.moveActionTypeActive = midData.typeMoveOnly;
};
//alter the conditions for skill saving. for Aether / Astra.
var alias4 = SkillControl.checkAndPushSkill;
SkillControl.checkAndPushSkill = function(active, passive, attackEntry, isActive, skilltype) {
	var skill = alias4.call(this, active, passive, attackEntry, isActive, skilltype)
	if (skill === null){
		skill = this.getPossessionSkill(active, skilltype);
	}
	if (SkillRandomizer.isSkillInvoked(active, passive, skill)) {
		//check if the skill is displayable or if it has custanime parameter.
		if (skill.isSkillDisplayable() || skill.custom.CustAnime) {
			//if so, save it.
			if (isActive) {
				attackEntry.skillArrayActive.push(skill);
			}
			else {
				attackEntry.skillArrayPassive.push(skill);
			}
		}
		return skill;
	}
	
	return null;
};
//Remove the window if the skill isn't displayable. for Aether / Astra.
TextCustomEffect._drawAreaTitle = function(x, y, skillArray, unit, isRight) {
	var i;
	var count = skillArray.length;
	var textui = root.queryTextUI('skill_title');
	var color = textui.getColor();
	var font = textui.getFont();
	var pic = textui.getUIImage();
	var width = TitleRenderer.getTitlePartsWidth();
	var height = TitleRenderer.getTitlePartsHeight();
	
	for (i = 0; i < count; i++) {
		if (skillArray[i].isSkillDisplayable()){
			TitleRenderer.drawTitleNoCache(pic, x, y, width, height, this._getTitlePartsCount(skillArray[i], font));
			SkillRenderer.drawSkill(x + 42, y + 18, skillArray[i], color, font);
			y += 40;
			
		}
	}
};
//Remove the dramatic pause if the skill isn't displayable. for Aether / Astra.
TextCustomEffect.setEffectData = function(skillArray, battleObject, battleType, isRight, isFront) {
	this._battleType = battleType;
	this._battleObject = battleObject;
	this._skillArray = skillArray;
	this._isFront = isFront;
	this._isRight = isRight;
	this._counter = createObject(CycleCounter);
	if (this._skillArray != null && this._skillArray[0] != null && this._skillArray[0].isSkillDisplayable()){
		this._counter.setCounterInfo(34);
	}
	else{
		this._counter.setCounterInfo(0);
	}
	
	if (this._battleType === BattleType.REAL) {
		this._battleObject.pushCustomEffect(this);
	}
};
}) (); //HEY DID YOU KNOW THIS RANDOM EMPTY (); IS NEEDED FOR SOME REASON?! BETTER KEEP IT.
