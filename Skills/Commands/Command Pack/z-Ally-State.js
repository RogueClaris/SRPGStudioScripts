var BuffMode = {
	SELECT: 0,
	QUESTION: 1,
	BUFF: 2
};

UnitCommand.Buff1 = defineObject(UnitListCommand,
{
	_questionWindow: null,
	_posSelector: null,
	_targetUnit: null,
	
	openCommand: function () {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveCommand: function(){
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode == BuffMode.SELECT){
			result = this._moveSelect();
		}
		else if (mode == BuffMode.QUESTION){
			result = this._moveQuestion();
		}
		else if (mode == BuffMode.BUFF){
			result = this._moveBuff();
		}
		
		return result;
	},
	
	drawCommand: function(){
		var mode = this.getCycleMode();
		
		if (mode == BuffMode.SELECT){
			this._drawSelect();
		}
		else if  (mode == BuffMode.QUESTION){
			this._drawQuestion();
		}
	},
	
	isCommandDisplayable: function () {
		var unit = this.getCommandTarget();
		var indexArray = IndexArray.getBestIndexArray(unit.getMapX(),unit.getMapY(),1,1)
		var skill = SkillControl.getPossessionCustomSkill(unit,"Buff1")
		return skill && indexArray.length != 0;
	},
	
	getCommandName: function(){
		var unit = this.getCommandTarget();
		var skill = SkillControl.getPossessionCustomSkill(unit,"Buff1")
		if (skill && typeof skill.custom.custName == 'string'){
			return skill.custom.custName;
		}
		return "Buff"
	},
	
	isRepeatMoveAllowed: function(){
		return false;
	},
	
	_prepareCommandMemberData: function(){
		this._questionWindow = createWindowObject(QuestionWindow, this)
		this._posSelector = createObject(PosSelector)
	},
	
	_completeCommandMemberData: function(){
		this._questionWindow.setQuestionMessage("Do you wish to buff this ally?")
		var unit = this.getCommandTarget()
		var indexArray = IndexArray.getBestIndexArray(unit.getMapX(),unit.getMapY(),1,1)
		this._posSelector.setUnitOnly(unit, null, indexArray, PosMenuType.Item, UnitFilterFlag.PLAYER);
		this._posSelector.setFirstPos();
		this._posSelector.includeFusion();
		this.changeCycleMode(BuffMode.SELECT);
	},
	
	_moveSelect: function(){
		var result = this._posSelector.movePosSelector();
		var unit = this.getCommandTarget();
		var targetUnit;
		if (result === PosSelectorResult.SELECT) {
			if (this._isPosSelectable()) {
				this._targetUnit = this._posSelector.getSelectorTarget(true);
				this.changeCycleMode(BuffMode.QUESTION)
			}
			else{
				MediaControl.soundDirect('operationblock');
			}
		}
		else if (result === PosSelectorResult.CANCEL){
			this._posSelector.endPosSelector();
			return this._listCommandManager.changeCycleMode(ListCommandManagerMode.TITLE)
		}
		return MoveResult.CONTINUE;
	},
	
	_drawSelect: function(){
		this._posSelector.drawPosSelector();
	},
	
	_isPosSelectable: function () {
		var unit = this._posSelector.getSelectorTarget(true);

		return (unit != null && unit.getUnitType() == (UnitType.PLAYER));
	},
	
	_moveQuestion: function(){
		this._questionWindow.setQuestionActive(true);
		
		if (this._questionWindow.moveWindow() != MoveResult.CONTINUE) {
			if (this._questionWindow.getQuestionAnswer() == QuestionAnswer.YES) {
				this.changeCycleMode(BuffMode.BUFF)
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
	
	_moveBuff: function(){
		var list = root.getBaseData().getStateList()
		var count = list.getCount()
		var state, i;
		for (var i = 0; i < count; i++){
			state = list.getData(i)
			if (state.custom.BuffCommand1){
				StateControl.arrangeState(this._targetUnit, state, IncreaseType.INCREASE)
				this._posSelector.endPosSelector();
				return MoveResult.END;
			}
		}
		this._posSelector.endPosSelector();
		return MoveResult.END;
	}
}
);