/*
Welcome to Time Alter - aka, save scumming: the script. This is based on
a plugin by ふわふわ, which saved at the start of every turn and let you reload
one turn back with a custom command. It was based on an official plugin.

I have edited this script further to introduce a customizable amount of
"rewind turns". You can now go back as far as 3 turns by default,
and you can save more by adding the following custom parameter
to your game's difficulty settings:

{
	MaxReloadsRS:5
}

This example will allow for five savestates.

You can also use this plugin to customize the amount of save slots available
for regular gameplay, but it cannot go above 90. To do so, set a global parameter:

{
	SaveCountRS:80
}

This will change your load screen to have 80 files when not using the rewind feature.
The name of the command itself has been edited to avoid clashes with other Interruption
plugins.

Beyond these things, the script should be fairly plug-and-play!

Enjoy this script!
*/
(function(){
var TimeAlterSkipScreen = ScreenController.moveScreenControllerCycle;
ScreenController.moveScreenControllerCycle = function(screenContainer) {
	if (typeof screenContainer === 'undefined'){
		return MoveResult.END;
	}
	else{
		return TimeAlterSkipScreen.call(this, screenContainer);
	}
};

var TimeAlterResetSaves = TurnChangeMapStart.doLastAction;
TurnChangeMapStart.doLastAction = function() {
	TimeAlterResetSaves.call(this)
	var count = DefineControl.getMaxSaveFileCount()
	var max = typeof root.getMetaSession().getDifficulty().custom.MaxReloadsRS === 'number' ? root.getMetaSession().getDifficulty().custom.MaxReloadsRS : 3
	for (i = 1; i <= max; i++){
		root.getLoadSaveManager().deleteFile(i+count);
	}
};

var TimeAlterCountUp = DefineControl.getMaxSaveFileCount;
DefineControl.getMaxSaveFileCount = function(){
	var count = typeof root.getMetaSession().global.SaveCountRS === 'number' ? root.getMetaSession().global.SaveCountRS : TimeAlterCountUp.call(this)
	if (count > 90){
		count = 90;
	}
	return count;
}

var TimeAlter1 = PlayerTurn._completeTurnMemberData
PlayerTurn._completeTurnMemberData = function() {
	this._mapEdit.openMapEdit();
	this._changeAutoCursor();
	// There is a possibility that the unit appears at the event when the player's turn started, so execute marking.
	MapLayer.getMarkingPanel().updateMarkingPanel();
	// Inspired by ふわふわ, but using a different method.
	// I'm saving at a custom index forcibly beyond the normally allowed index of files by this plugin.
	var count = DefineControl.getMaxSaveFileCount()
	var max = typeof root.getMetaSession().getDifficulty().custom.MaxReloadsRS === 'number' ? root.getMetaSession().getDifficulty().custom.MaxReloadsRS : 3
	var isNull = false
	for (i = 1; i <= max; i++){
		var saveFile = root.getLoadSaveManager().getSaveFileInfo(i+count)
		var saveFile2 = root.getCurrentSession()
		if (saveFile2 != null && saveFile.getTurnCount() != saveFile2.getTurnCount()){
			if (saveFile.getTurnCount() > 0){
				continue;
			}
			else{
				isNull = true;
				break;
			}
		}
		else{
			isNull = true
			break;
		}
	}
	var screenParam = ScreenBuilder.buildLoadSave();
	screenParam.isLoad = true
	if (isNull){
		var spareScreen = createObject(LoadSaveScreenRS)
		spareScreen._screenParam = screenParam
		var obj = spareScreen._getCustomObject()
		root.getLoadSaveManager().saveFile(i+count, SceneType.FREE, root.getCurrentSession().getCurrentMapInfo().getId(), obj)
	}
	else{
		for (var j = 1; j <= max; j++){
			root.getLoadSaveManager().copyFile(count+j+1, count+j)
		}
		var spareScreen = createObject(LoadSaveScreenRS)
		spareScreen._screenParam = screenParam
		var obj = spareScreen._getCustomObject()
		root.getLoadSaveManager().saveFile(max+count, SceneType.FREE, root.getCurrentSession().getCurrentMapInfo().getId(), obj)
	}
};

//A lot of the code below is reworked, but that doesn't mean it all belongs to me (Claris). Fluffy (ふわふわ) laid out an excellent example for me to follow.
var LoadSaveScreenRS = defineObject(LoadSaveScreenEx,
{
	_screenParam: null,
	_isLoadMode: true,
	_scrollbar: null,
	_questionWindow: null,
	_saveFileDetailWindow: null,
	
	_prepareScreenMemberData: function(screenParam) {
		this._screenParam = screenParam;
		this._screenParam.background = null
		this._isLoadMode = true;
		this._scrollbar = createScrollbarObject(TemporalScrollbarRS, this);
		this._questionWindow = createWindowObject(QuestionWindow, this);
	},
	
	drawScreenCycle: function() {
		var width = this._scrollbar.getObjectWidth() + this._saveFileDetailWindow.getWindowWidth();
		var x = LayoutControl.getCenterX(-1, width);
		var y = LayoutControl.getCenterY(-1, this._scrollbar.getScrollbarHeight());
		
		this._scrollbar.drawScrollbar(x, y);
		this._saveFileDetailWindow.drawWindow(x + this._scrollbar.getObjectWidth(), y);
		
		if (this.getCycleMode() === LoadSaveMode.SAVECHECK) {
			x = LayoutControl.getCenterX(-1, this._questionWindow.getWindowWidth());
			y = LayoutControl.getCenterY(-1, this._questionWindow.getWindowHeight());
			this._questionWindow.drawWindow(x, y);
		}
	},
	
	moveScreenCycle: function() {
		var result = MoveResult.CONTINUE;
		
		if (this._isLoadMode) {
			result = this._moveLoad();
		}
		
		return result;
	},
	
	getScreenInteropData: function() {
		return root.queryScreen('Load');
	},
	
	drawScreenTopText: function(textui) {
		if (textui === null) {
			return;
		}
		
		TextRenderer.drawScreenTopText("Rewind Time", textui);
	},
	
	_moveLoad: function() {
		var input;
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === LoadSaveMode.TOP) {
			input = this._scrollbar.moveInput();
			if (input === ScrollbarInput.SELECT) {
				this._scrollbar.enableSelectCursor(false);
				this._questionWindow.setQuestionActive(true);
				this.changeCycleMode(LoadSaveMode.SAVECHECK);
			}
			else if (input === ScrollbarInput.CANCEL) {
				result = MoveResult.END;
			}
			else {
				this._checkSaveFile();
			}
		}
		if (mode === LoadSaveMode.SAVECHECK) {
			if (this._questionWindow.moveWindow() !== MoveResult.CONTINUE) {
				if (this._questionWindow.getQuestionAnswer() === QuestionAnswer.YES) {
					this._executeLoad();
					result = MoveResult.END;
				}
				else if (this._questionWindow.getQuestionAnswer() === QuestionAnswer.NO) {
					result = MoveResult.END;
				}
			}
		}
		
		return result;
	},
	
	_checkSaveFile: function() {
		if (this._scrollbar.checkAndUpdateIndex()) {
			this._saveFileDetailWindow.setSaveFileInfo(this._scrollbar.getObject());
		}
	},
	
	_completeScreenMemberData: function(screenParam) {
		var count = LayoutControl.getObjectVisibleCount(76, 5);
		
		this._scrollbar.setScrollFormation(1, count);
		this._scrollbar.setActive(true);
		this._setScrollData(DefineControl.getMaxSaveFileCount(), this._isLoadMode);
		this._setDefaultSaveFileIndex();
		
		this._questionWindow.setQuestionMessage("Would you like to turn back time?");
		
		this._scrollbar.enablePageChange();
		this._saveFileDetailWindow = createWindowObject(SaveFileDetailWindow, this);
		this._saveFileDetailWindow.setSize(Math.floor(this._scrollbar.getScrollbarHeight() * 1.2), this._scrollbar.getScrollbarHeight());
		
		this.changeCycleMode(LoadSaveMode.TOP);
	},
	
	_setScrollData: function(count, isLoadMode) {
		var i;
		var manager = root.getLoadSaveManager();
		var max = typeof root.getMetaSession().getDifficulty().custom.MaxReloadsRS === 'number' ? root.getMetaSession().getDifficulty().custom.MaxReloadsRS : 3
		
		for (i = 1; i <= max; i++) {
			this._scrollbar.objectSet(manager.getSaveFileInfo(i+count));
		}
		
		this._scrollbar.objectSetEnd();
		
		this._scrollbar.setLoadMode(isLoadMode);
	},
	
	_executeLoad: function() {
		var object = this._scrollbar.getObject();
		
		if (object.isCompleteFile() || object.getMapInfo() !== null) {
			SceneManager.setEffectAllRange(true);
			
			// root.changeScene is called inside and changed to the scene which is recorded at the save file.
			var max = typeof root.getMetaSession().getDifficulty().custom.MaxReloadsRS === 'number' ? root.getMetaSession().getDifficulty().custom.MaxReloadsRS : 3
			var count = DefineControl.getMaxSaveFileCount()
			var scrollIndex = this._scrollbar.getIndex()
			var loadIndex = Math.min(max+count, scrollIndex+count+1)
			var turnCount = root.getLoadSaveManager().getSaveFileInfo(loadIndex).getTurnCount()
			root.getLoadSaveManager().loadFile(loadIndex);
			for (var i = loadIndex; i <= max+count+1; i++){
				root.getLoadSaveManager().deleteFile(i)
			}
			if (root.getMetaSession().getDifficulty().custom.InfiniteLoadRS) {
				SceneManager.getActiveScene().getTurnObject()._completeTurnMemberData()
			}
		}
	},
	
	_getCustomObject: function() {
		var obj = LoadSaveScreen._getCustomObject.call(this);
		
		this._setLeaderSettings(obj);
		this._setPositionSettings(obj);
		
		return obj;
	},
	
	_setLeaderSettings: function(obj) {
		var unit = this._getLeaderUnit();
		
		if (unit === null) {
			obj.leaderName = 'undefined';
			return;
		}
		
		obj.leaderName = unit.getName();
		obj.leaderLv = unit.getLv();
		obj.binary = serializeResourceHandle(unit.getCharChipResourceHandle());
	},
	
	_setPositionSettings: function(obj) {
		var area, mapInfo;
		
		obj.playerArrayX = [];
		obj.playerArrayY = [];
		obj.enemyArrayX = [];
		obj.enemyArrayY = [];
		obj.allyArrayX = [];
		obj.allyArrayY = [];
		
		if (this._screenParam.scene === SceneType.REST) {
			area = root.getRestPreference().getActiveRestAreaFromMapId(this._screenParam.mapId);
			obj.areaId = area.getId();
			return obj;
		}
		else {
			mapInfo = root.getCurrentSession().getCurrentMapInfo();
			if (this._screenParam.mapId !== mapInfo.getId()) {
				return obj;
			}
		}
		
		this._setPositionSettingsInternal(PlayerList.getSortieList(), obj.playerArrayX, obj.playerArrayY);
		this._setPositionSettingsInternal(EnemyList.getAliveList(), obj.enemyArrayX, obj.enemyArrayY);
		this._setPositionSettingsInternal(AllyList.getAliveList(), obj.allyArrayX, obj.allyArrayY);
	},
	
	_setPositionSettingsInternal: function(list, arrayX, arrayY) {
		var i, unit;
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if (this._isUnitExcluded(unit)) {
				continue;
			}
			
			arrayX.push(unit.getMapX());
			arrayY.push(unit.getMapY());
		}
	},
	
	_isUnitExcluded: function(unit) {
		return unit.isInvisible();
	},
	
	_getLeaderUnit: function() {
		var i, count;
		var list = PlayerList.getMainList();
		var unit = null;
		var firstUnit = null;
		
		count = list.getCount();
		if (count === 0) {
			return null;
		}
		
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if (unit.getAliveState() === AliveType.ERASE) {
				continue;
			}
			
			if (firstUnit === null) {
				firstUnit = unit;
			}
			
			if (unit.getImportance() === ImportanceType.LEADER) {
				break;
			}
		}
		
		if (i === count) {
			unit = firstUnit;
		}
		
		return unit;
	}
}
);

var TemporalScrollbarRS = defineObject(LoadSaveScrollbarEx,
{
	
}
);

var RewindMode = {
	PICK: 0
};
//lots of borrowed code below. but, it's edited.
MapCommand.Rewind = defineObject(BaseListCommand,
{
	_questionWindow: null,
	_loadWindow: null,

	openCommand: function() {
		var screenParam = this._createLoadSaveParam();
		
		this._loadWindow = createObject(LoadSaveScreenRS, this);
		SceneManager.addScreen(this._loadWindow, screenParam);
		this.changeCycleMode(RewindMode.PICK)
	},
	
	_createLoadSaveParam: function() {
		var screenParam = ScreenBuilder.buildLoadSave();
		
		screenParam.isLoad = true;
		
		return screenParam;
	},
	
	moveCommand: function(){
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		if (mode === RewindMode.PICK){
			result = this.movePick();
		}
		return result;
	},
	
	movePick: function(){
		return this._loadWindow.moveScreenCycle()
	},
	
	drawCommand: function() {
	},
	
	getCommandName: function() {
		return "Turnwheel"; //change "Turnwheel" to change the name of the command.
	},
	
	_getMessage: function() {
		return "";
	},
	
	_getCustomObject: function() {
		return {};
	}
}
);

//borrowed code
//マップコマンドにコマンド追加
var TimeConfig = MapCommand.configureCommands;
MapCommand.configureCommands = function(groupArray) {
	TimeConfig.call(this, groupArray);
	var table = root.getMetaSession().getGlobalSwitchTable();	
	//change the 1 below to the ID of the global switch you want to use to enable rewinding.
	//be aware that this switch is now the ONLY condition of showing the rewind feature!
	if(table.isSwitchOn(1)){
		groupArray.insertObject(MapCommand.Rewind, groupArray.length - 1);
	}
};
})();