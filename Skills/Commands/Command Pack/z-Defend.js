//Hello and welcome to the Defend script! To set this one up,
//create a custom-type Skill with the keyword "Block", as well
//as creating a Damage Guard type state with the weapon types
//you wish to block, as well as the percent you wish to reduce
//damage by. Give this state the custom parameter {DfpStance:true},
//and that's it! You're good to go! Enjoy the script~!
//-Lady Rena, 1/27/2020

var DefendMode = {
	QUESTION: 0,
	ACTIVATE: 1
};

UnitCommand.Defend = defineObject(UnitListCommand,
{
	_questionWindow: null,
	
	openCommand: function () {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveCommand: function(){
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode == DefendMode.QUESTION){
			result = this._moveQuestion();
		}
		else if (mode == DefendMode.ACTIVATE){
			result = this._activate();
		}
		
		return result;
	},
	
	drawCommand: function(){
		var mode = this.getCycleMode();
		
		if  (mode == DefendMode.QUESTION){
			result = this._drawQuestion();
		}
	},
	
	isCommandDisplayable: function () {
		var unit = this.getCommandTarget();
		var skill = SkillControl.getPossessionCustomSkill(unit,"Block")
		return skill;
	},
	
	getCommandName: function(){
		var unit = this.getCommandTarget();
		var skill = SkillControl.getPossessionCustomSkill(unit,"Block")
		if (skill && typeof skill.custom.custName == 'string'){
			return skill.custom.custName;
		}
		return "Defend"
	},
	
	isRepeatMoveAllowed: function(){
		return false;
	},
	
	_prepareCommandMemberData: function(){
		this._questionWindow = createWindowObject(QuestionWindow, this)
	},
	
	_completeCommandMemberData: function(){
		this._questionWindow.setQuestionMessage("Enter a defensive stance?")
		this.changeCycleMode(DefendMode.QUESTION);
	},
	
	_moveQuestion: function(){
		this._questionWindow.setQuestionActive(true);
		
		if (this._questionWindow.moveWindow() != MoveResult.CONTINUE) {
			if (this._questionWindow.getQuestionAnswer() == QuestionAnswer.YES) {
				this.changeCycleMode(DefendMode.ACTIVATE)
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