PreAttack._doEndAction = function() {
	var passive = this.getPassiveUnit();
	var active = this.getActiveUnit();
	var generator = createObject(DynamicEvent)
	var Dynamo = generator.acquireEventGenerator();
	var Skill = SkillControl.getPossessionCustomSkill(active,"Payday");
	if (this._attackParam.fusionAttackData !== null) {
		FusionControl.endFusionAttack(this._attackParam.unit);
	}
	
	if (passive.getHp() === 0) {
		// If this deactivation processing is done at the time of dead setting (DamageControl.setDeathState), the state etc.,
		// cannot be specified in the condition of the dead event, so execute with this method. 
		StateControl.arrangeState(passive, null, IncreaseType.ALLRELEASE);
		MetamorphozeControl.clearMetamorphoze(passive);
		if (SkillControl.getPossessionCustomSkill(active,"Payday")){
			if (Skill.getInvocationValue() >= Math.random()*101){
				var gold = null;
				while (gold === null){
					reward = Math.round(Math.random()*Skill.custom.MaxGold+1)
					if (typeof Skill.custom.Division === 'number'){
						if (reward % Skill.custom.Division === 0){
							gold = Math.max(Skill.custom.MinGold,reward)
						}
					}
					else{
						gold = reward;
					}
				}
				Dynamo.goldChange(gold,IncreaseType.INCREASE,false);
				generator.executeDynamicEvent();
			}
		}
	}
	
	AttackControl.setPreAttackObject(null);
	BattlerChecker.setUnit(null, null);
};