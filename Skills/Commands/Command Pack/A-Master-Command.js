UnitCommand._appendUnitEvent = function(groupArray) {
};

var ClarisCust000 = UnitCommand.configureCommands;
UnitCommand.configureCommands = function(groupArray) {
	ClarisCust000.call(this, groupArray);
	groupArray.insertObject(UnitCommand.Skills, groupArray.indexOf(UnitCommand.Attack));
};

var CommandSkillMode = {
	DISPLAY: 0,
	SELECT: 1,
	USE: 2
};

UnitCommand.Skills = defineObject(UnitListCommand,
{
	_groupArray: null,
	_commandScrollbar: null,
	_unit: null,
	_skill: null,
	
	openCommand: function () {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveCommand: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === CommandSkillMode.DISPLAY) {
			result = this._moveDisplay();
		}
		else if (mode === CommandSkillMode.SELECT) {
			result = this._moveSelect();
		}
		else if (mode === CommandSkillMode.USE){
			result = this._moveUse();
		}
		
		return result;
	},
	
	drawCommand: function() {
		var mode = this.getCycleMode();
		
		if (mode === CommandSkillMode.DISPLAY) {
			this._drawDisplay();
		}
		else if (mode === CommandSkillMode.SELECT) {
			this._drawSelect();
		}
		else if (mode === CommandSkillMode.USE) {
			this._drawUse();
		}
	},
	
	isCommandDisplayable: function() {
		return true;
	},
	
	getCommandName: function() {
		return "Skills";
	},
	
	isRepeatMoveAllowed: function() {
		return false;
	},
	
	getCommandScrollbar: function() {
		return this._commandScrollbar;
	},
	
	_prepareCommandMemberData: function(){
		this._unit = this.getCommandTarget()
		this._commandScrollbar = createScrollbarObject(CommandSkillScrollbar, this);
		this._commandScrollbar.setActive(true);
		this.rebuildCommand();
	},
	
	rebuildCommand: function(){
		var i, count, arr;
		
		this._groupArray = [];
		this.configureCommands(this._groupArray);
		
		count = this._groupArray.length;
		arr = [];
		for (i = 0; i < count; i++) {
			this._groupArray[i]._listCommandManager = this._listCommandManager;
			if (this._groupArray[i].isCommandDisplayable()) {
				arr.push(this._groupArray[i]);
			}
		}
		
		this._commandScrollbar.setScrollFormation(1, arr.length);
		this._commandScrollbar.setObjectArray(arr);
		
		this._groupArray = [];
	},
	
	configureCommands: function(groupArray){
		var i, event, info;
		var unit = this._unit;
		var count = unit.getUnitEventCount();
		
		for (i = 0; i < count; i++) {
			event = unit.getUnitEvent(i);
			info = event.getUnitEventInfo();
			if (info.getUnitEventType() === UnitEventType.COMMAND && event.isEvent()) {
				groupArray.appendObject(UnitCommand.UnitEvent);
				groupArray[groupArray.length - 1].setEvent(event);
			}
		}
		if (UnitCommand.Buff1 != undefined){
			groupArray.appendObject(UnitCommand.Buff1)
		}
		if (UnitCommand.Berserk != undefined){
			groupArray.appendObject(UnitCommand.Berserk)
		}
		if (UnitCommand.Warp != undefined){
			groupArray.appendObject(UnitCommand.Warp)
		}
		if (UnitCommand.Negation != undefined){
			groupArray.appendObject(UnitCommand.Negation)
		}
		if (UnitCommand.Defend != undefined){
			groupArray.appendObject(UnitCommand.Defend)
		}
		if (UnitCommand.Rest != undefined){
			groupArray.appendObject(UnitCommand.Rest)
		}
		groupArray.appendObject(UnitCommand.Wait)
	},
	
	getCommandTextUI: function() {
		return root.queryTextUI('mapcommand_title');
	},
	
	_completeCommandMemberData: function(){
		this.changeCycleMode(CommandSkillMode.DISPLAY)
	},
	
	_moveDisplay: function(){
		var object;
		var result = MoveResult.CONTINUE;
		
		if (InputControl.isSelectAction()) {
			object = this._commandScrollbar.getObject();
			if (object === null) {
				return result;
			}
			object.openCommand();
			MediaControl.soundDirect('commandselect');
			this.changeCycleMode(CommandSkillMode.SELECT);
		}
		else if (InputControl.isCancelAction()) {
			MediaControl.soundDirect('commandcancel');
			result = MoveResult.END;
		}
		else {
			this._commandScrollbar.moveScrollbarCursor();
		}
		
		return result;
	},
	
	getPositionX: function() {
		var width = this.getCommandScrollbar().getScrollbarWidth();
		return LayoutControl.getUnitBaseX(this._unit, width);
	},
	
	getPositionY: function() {
		var height = this.getCommandScrollbar().getScrollbarHeight();
		return LayoutControl.getUnitBaseY(this._unit, height);
	},
	
	_moveSelect: function(){
		var object = this._commandScrollbar.getObject();
		var result = MoveResult.CONTINUE;
		
		if (object.moveCommand() !== MoveResult.CONTINUE) {
			this._commandScrollbar.setActive(true);
			this.changeCycleMode(CommandSkillMode.USE);
		}
		
		return result;
	},
	
	_moveUse: function(){
		this.endCommandAction()
		return MoveResult.END
	},
	
	_drawDisplay: function(){
		if (this._commandScrollbar == null){
			this._commandScrollbar = createScrollbarObject(CommandSkillScrollbar, this);
		}
		var x = this.getPositionX();
		var y = this.getPositionY();
		
		this._commandScrollbar.drawScrollbar(x, y);
	},
	
	_drawSelect: function(){
		var object = this._commandScrollbar.getObject();
		object.drawCommand();
	},
	
	_drawUse: function(){
	}
}
);

CommandSkillScrollbar = defineObject(ListCommandScrollbar,
{
	
}
);