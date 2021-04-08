var NegateMode = {
	QUESTION: 0,
	ACTIVATE: 1
};

UnitCommand.Negation = defineObject(UnitListCommand,
{
	_questionWindow: null,
	
	openCommand: function () {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveCommand: function(){
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode == NegateMode.QUESTION){
			result = this._moveQuestion();
		}
		else if (mode == NegateMode.ACTIVATE){
			result = this._activate();
		}
		
		return result;
	},
	
	drawCommand: function(){
		var mode = this.getCycleMode();
		
		if  (mode == NegateMode.QUESTION){
			result = this._drawQuestion();
		}
	},
	
	isCommandDisplayable: function () {
		var unit = this.getCommandTarget();
		var skill = SkillControl.getPossessionCustomSkill(unit,"Negate")
		return skill;
	},
	
	getCommandName: function(){
		var unit = this.getCommandTarget();
		var skill = SkillControl.getPossessionCustomSkill(unit,"Negate")
		if (skill && typeof skill.custom.custName == 'string'){
			return skill.custom.custName;
		}
		return "Negation"
	},
	
	isRepeatMoveAllowed: function(){
		return false;
	},
	
	_prepareCommandMemberData: function(){
		this._questionWindow = createWindowObject(QuestionWindow, this)
	},
	
	_completeCommandMemberData: function(){
		this._questionWindow.setQuestionMessage("Negate the next 3 non-spell attacks?")
		this.changeCycleMode(NegateMode.QUESTION);
	},
	
	_moveQuestion: function(){
		this._questionWindow.setQuestionActive(true);
		
		if (this._questionWindow.moveWindow() != MoveResult.CONTINUE) {
			if (this._questionWindow.getQuestionAnswer() == QuestionAnswer.YES) {
				this.changeCycleMode(NegateMode.ACTIVATE)
				return MoveResult.CONTINUE;
			}
			else if (this._questionWindow.getQuestionAnswer() == QuestionAnswer.NO){
				return this._listCommandManager.changeCycleMode(ListCommandManagerMode.TITLE)
			}
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_drawQuestion: function(){
		var width = this._questionWindow.getWindowWidth();
		var height = this._questionWindow.getWindowHeight();
		var x = LayoutControl.getCenterX(-1, width);
		var y = LayoutControl.getCenterY(-1, height);
		
		this._questionWindow.drawWindow(x, y);
	},
	
	_activate: function(){
		var state = null;
		var unit = this.getCommandTarget()
		var stateList = root.getBaseData().getStateList()
		for (i = 0; i < stateList.getCount(); i++){
			if (stateList.getData(i).custom.DfpStance){
				state = stateList.getData(i);
				break;
			}
		}

		if (state != (null || undefined) && unit != (null || undefined)){
			StateControl.arrangeState(unit, state, IncreaseType.INCREASE)
		}
		return MoveResult.END;
	}
}
);