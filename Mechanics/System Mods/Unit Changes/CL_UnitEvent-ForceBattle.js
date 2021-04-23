/*
To use this command, setup a Unit Event. Somewhere in the event command list,
create a Script Execute event command, and set Object Name to "WeaponPosCommandCL",
without quotes. Then switch to the Original Data tab, and set the data as follows:

Unit: The unit who is executing the Unit Event.
Value 1: Set to 0 to make it terrain mode. Set to 1 to make it unit mode.
Value 2: Set to 0 to make it uncancellable. Set to 1 to make it cancellable.

Then, under it, execute another Script Execute command, and set the Object Name
this time to say "ForceBattleEventCL", again without quotes. Again, set the data
as follows:

Unit: The unit who is executing the Unit Event.
Value 1: A variable to store the X coordinate (DO NOT USE ANYWHERE ELSE!)
Value 2: A variable to store the Y coordinate (DO NOT USE ANYWHERE ELSE!)

You have now successfully forced a battle through a Unit Event. With this,
you can use event commands to apply all manner of data changes before and
after an otherwise normal battle. For instance, you could apply a skill that
grants a special powerup for that attack only, then set a variable to the ID
of that unit's equipped weapon. After that, you can use the Durability Change
command to change the durability of a weapon with that variable's value...almost
like combat arts.
*/

WeaponPosCommandCL = defineObject(MapPosChooseEventCommand,
{
	getEventCommandName: function(){
		return "WeaponPosCommandCL";
	},
	
	_prepareEventCommandMemberData: function() {
		var eventCommandData = root.getEventCommandObject();
		var data = eventCommandData.getOriginalContent()
		
		this._posSelector = createObject(PosSelector);
		this._questionWindow = createWindowObject(QuestionWindow, this);
		this._targetUnit = data.getUnit();
		this._isUnitOnlyMode = data.getValue(0);
		this._isQuestionDisplayable = false;
		this._isCancelAllowed = data.getValue(1);
	},
	
	drawEventCommandCycle: function() {
		this._posSelector.drawPosCursor();
		
		if (this.getCycleMode() === MapPosChooseMode.QUESTION) {
			this._drawQuestion();
			return;
		}
	},
	
	_doEndAction: function() {
		var eventCommandData = root.getEventCommandObject();
		var pos = this._posSelector.getSelectorPos(true);
		var unit = this._posSelector.getSelectorTarget(true);
		
		this._targetUnit.custom.TemporaryTarget = null;
		this._targetUnit.custom.TemporaryDataX = null;
		this._targetUnit.custom.TemporaryDataY = null;
		
		if (pos !== null) {
			this._targetUnit.custom.TemporaryDataX = pos.x;
			this._targetUnit.custom.TemporaryDataY = pos.y;
		}
		
		if (unit !== null) {
			this._targetUnit.custom.TemporaryTarget = unit;
		}
		
		this._posSelector.endPosSelector();
	},
	
	_doFlagAction: function(isSet) {
	},
	
	_completeEventCommandMemberData: function() {
		var unit = this._getPosWindowUnit();
		var item = this._getPosWindowItem();
		var indexArray = IndexArray.getBestIndexArray(this._targetUnit.getMapX(), this._targetUnit.getMapY(), item != null ? item.getStartRange() : 1, item != null ? item.getStartRange() : 1)
		
		this._posSelector.setPosSelectorType(PosSelectorType.JUMP);
		this._posSelector.setPosOnly(unit, item, indexArray, PosMenuType.Item);
		this._posSelector.setFirstPos()
		
		this.changeCycleMode(MapPosChooseMode.SELECT);
		
		return EnterResult.OK;
	}
}
);

var ForceAddCL0 = ScriptExecuteEventCommand._configureOriginalEventCommand;
ScriptExecuteEventCommand._configureOriginalEventCommand = function(groupArray) {
	ForceAddCL0.call(this, groupArray);
	groupArray.appendObject(ForceBattleEventCL)
	groupArray.appendObject(WeaponPosCommandCL)
}

var RangeStartGetCL = function(id){
	if (id < root.getBaseData().getWeaponList().getCount()){
		return root.getBaseData().getWeaponList().getDataFromId(id).getStartRange()
	}
}

var RangeEndGetCL = function(id){
	if (id < root.getBaseData().getWeaponList().getCount()){
		return root.getBaseData().getWeaponList().getDataFromId(id).getEndRange()
	}
}

ForceBattleEventCL = defineObject(ForceBattleEventCommand,
{
	getEventCommandName: function(){
		return "ForceBattleEventCL";
	},
	
	_prepareEventCommandMemberData: function() {
		var eventCommandData = root.getEventCommandObject();
		var data = eventCommandData.getOriginalContent()
		
		this._obj = this;
		this._unitSrc = data.getUnit()
		this._unitDest = data.getUnit().custom.TemporaryTarget != null ? data.getUnit().custom.TemporaryTarget : PosChecker.getUnitFromPos(data.getValue(0), data.getValue(1))
		this._fusionData = null;
		this._isBattleOnly = false;
		this._preAttack = createObject(PreAttack);
		this._lockonCursor = createObject(LockonCursor);
		
		// Initialize for times when battles cannot occur.
		this.changeCycleMode(ForceBattleMode.LIGHT);
	},
	
	getBattleType: function(){
		
	},
	
	isExperienceEnabled: function(){
		return root.getEventCommandObject().getOriginalContent().getValue(2)
	},
	
	getSrcForceEntryType: function(i){
		return -1;
	},
	
	getDestForceEntryType: function(i){
		return -1;
	}
}
);
var StopThatCL3000 = CoreAttack.backCoreAttackCycle;
CoreAttack.backCoreAttackCycle = function() {
	if (this._battleObject !== null){
		StopThatCL3000.call(this);
	}
}