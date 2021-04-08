/*
Only user interaction required is the use of a new event command.
Open script execute, enter object name UnitGoldChange
Go to original content tab, set gold value as Value 1.
Done. Run the command.
*/

var UserGoldCL0 = ScriptExecuteEventCommand._configureOriginalEventCommand;
ScriptExecuteEventCommand._configureOriginalEventCommand = function(groupArray) {
	//call the original function.
	UserGoldCL0.call(this, groupArray);
	//append the object.
	groupArray.appendObject(UnitGoldChangeCommandCL)
}

var UnitGoldChangeCommandCL = defineObject(GoldChangeEventCommand,
{
	_goldChangeView: null,
	_unit: null,
	
	enterEventCommandCycle: function() {
		this._prepareEventCommandMemberData();
		//set the unit from the original content.
		this._unit = root.getEventCommandObject().getOriginalContent().getUnit()
		if (!this._checkEventCommand()) {
			return EnterResult.NOTENTER;
		}
		
		return this._completeEventCommandMemberData();
	},
	
	mainEventCommand: function() {
		var gold;
		var max = DataConfig.getMaxGold();
		//check if the user already has gold. if not, use 0.
		gold = typeof this._unit.custom.UserGoldCL === 'number' ? this._unit.custom.UserGoldCL : 0
		//add event gold value.
		gold += root.getEventCommandObject().getOriginalContent().getValue(0)
		//if less than zero gold, set zero.
		if (gold < 0) {
			gold = 0;
		}
		else if (gold > max) {
			gold = max;
		}
		//if more than max gold, set max.
		//and give the unit the gold.
		this._unit.custom.UserGoldCL = gold;
	},
	
	getEventCommandName: function(){
		//relevant to mixing in the command, this name is searched by the engine.
		//the string doesn't have to be different from the object name, but I like it to be.
		return "UnitGoldChange"
	},
	
	isEventCommandSkipAllowed: function(){
		//avoid skipping. disables the transfer of gold for some reason.
		return false;
	},
	
	_completeEventCommandMemberData: function() {
		var eventCommandData = root.getEventCommandObject();
		
		// this._goldChangeView.setGoldChangeData(eventCommandData.getGold());
		this._goldChangeView.setGoldChangeData(root.getEventCommandObject().getOriginalContent().getValue(0));
		//set it to the original content value, not the object command.
		
		return EnterResult.OK;
	}
}
);
