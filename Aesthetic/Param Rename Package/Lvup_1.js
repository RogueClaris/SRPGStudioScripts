var isMaxMinParamForceDraw = false;

var isParaSound     = true;

var LvUpParaUpSound = 'commandcursor';

var LvUpParaDwSound = 'operationblock';

var isLvUpNoSkip    = true;

var LvUpAnimeOriginalPicUse = false;

var LvUpAnimeOriginalPicID = 0;

var LvUpAnimeWitdh  = 24;

var LvUpAnimeHeight = 24;

var LvUpAnimeNum    = 5;

var isUseOriginalSound = false;

var LvUp_ParaUpOriginalSoundID = 4;

var LvUp_ParaDownOriginalSoundID  = 0;

ExperienceParameterWindow.moveWindowContent= function() {
		
		this._scrollbar.moveScrollbarCursor();

		
		if( isLvUpNoSkip == false ) {
			if (InputControl.isSelectAction()) {
				return MoveResult.END;
			}
		}

		
		else if( this._scrollbar.isLvUpParaDisplayEnd() ) {
			if (InputControl.isSelectAction()) {
				return MoveResult.END;
			}
		}
		return MoveResult.CONTINUE;
};

ExperienceParameterWindow.setExperienceParameterData= function(targetUnit, growthArray) {
		var i;
		var count = growthArray.length;
		var arr = [];
		
		for (i = 0; i < count; i++) {
			arr[i] = growthArray[i];
		}
		
		this._scrollbar = createScrollbarObject(StatusScrollbarLvUp, this);
		this._scrollbar.enableStatusBonus(true);
		this._scrollbar.setStatusFromUnit(targetUnit);
		this._scrollbar.setStatusBonus(arr);
};


var StatusScrollbarLvUp = defineObject(StatusScrollbar,
{
	_lvup_draw_index: -1,
	_animeCounter: null,
	_AnimeIndex: -1,
	_AnimeExecuteFlg: false,
	_isLvUpFinished: false,
	_animePic: null,
	_originalSoundHandle : null,
	_originalSoundId : -1,

	moveScrollbarContent: function() {
		if (this._cursorCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
			if (this._riseCursorSrcIndex === 0) {
				this._riseCursorSrcIndex = 1;
			}
			else {
				this._riseCursorSrcIndex = 0;
			}

			
			var i;
			
			var count = this._statusArray.length;
			if( this._lvup_draw_index < count ) {
				this._lvup_draw_index++;
			}

			
			for (i = this._lvup_draw_index; i < count; i++) {

				
				if( this._statusArray[i].bonus != 0 ) {

					if( this._statusArray[i].bonus > 0 ) {
						if ((isMaxMinParamForceDraw == true) || (this._statusArray[i].param < this._statusArray[i].max)) {
							
							this._playParaUpSound();

							this._lvup_draw_index = i;

							
							this._AnimeExecuteFlg = true;
							this._AnimeIndex = -1;
							break;
						}
					}
					else {
						if ((isMaxMinParamForceDraw == true) || (this._statusArray[i].param > this._statusArray[i].min)) {
							
							this._playParaDwSound();

							this._lvup_draw_index = i;

							
							this._AnimeExecuteFlg = true;
							this._AnimeIndex = -1;
							break;
						}
					}
				}
			}
			if (i >= count) {
				this._isLvUpFinished = true;
			}
		}

		if (this._animeCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
			
			if( this._AnimeExecuteFlg == true ) {
				this._AnimeIndex++;
			}
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawScrollContent: function(x, y, object, isSelect, index) {
		var statusEntry = object;
		var n = statusEntry.param;
		var text = statusEntry.type;
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		var length = this._getTextLength();
		
		TextRenderer.drawKeywordText(x, y, text, length, ColorValue.KEYWORD, font);
		x += this._getNumberSpace();
		
		statusEntry.textui = textui;
		if (statusEntry.isRenderable) {
			ParamGroup.drawUnitParameter(x, y, statusEntry, isSelect, statusEntry.index);
		}
		else {
			if (n < 0) {
				n = 0;
			}
			
			NumberRenderer.drawNumber(x, y, n);
		}
		
		if (statusEntry.bonus > 0) {
			
			if (index <= this._lvup_draw_index) {
				
				if ((isMaxMinParamForceDraw == true) || (statusEntry.param < statusEntry.max)) {
					this._drawBonus(x, y, statusEntry);
				}

				
				if( this._AnimeExecuteFlg == true && index == this._lvup_draw_index ) {
					this._drawOriginalAnime(x, y);	// 

					if( this._AnimeIndex >= (LvUpAnimeNum-1)) {
						this._AnimeExecuteFlg = false;
					}
				}
			}
		}
		else if (statusEntry.bonus < 0) {
			
			
			if (index <= this._lvup_draw_index) {
				
				if ((isMaxMinParamForceDraw == true) || (statusEntry.param > statusEntry.min)) {
					this._drawBonus(x, y, statusEntry);
				}

				
				if( this._AnimeExecuteFlg == true && index == this._lvup_draw_index ) {
					this._drawOriginalAnime(x, y);

					if( this._AnimeIndex >= (LvUpAnimeNum-1)) {
						this._AnimeExecuteFlg = false;
					}
				}
			}
		}
	},

	setStatusFromUnit: function(unit) {
		var i, j;
		var count = ParamGroup.getParameterCount();
		
		this._statusArray = [];
		
		for (i = 0, j = 0; i < count; i++) {
			if (this._isParameterDisplayable(i)) {
				this._statusArray[j++] = this._createStatusEntry(unit, i);
			}
		}
		
		this.setScrollFormation(this.getDefaultCol(), this.getDefaultRow());
		this.setObjectArray(this._statusArray);

		this._cursorCounter = createObject(CycleCounter);
		this._cursorCounter.setCounterInfo(20);
		this._cursorCounter.disableGameAcceleration();

		this._animeCounter = createObject(CycleCounter);
		this._animeCounter.setCounterInfo(2);
		this._animeCounter.disableGameAcceleration();
	},
	
	isLvUpParaDisplayEnd: function() {
		return this._isLvUpFinished;
	},

	_createStatusEntry: function(unit, index) {
		var statusEntry = StructureBuilder.buildStatusEntryLvUp();
		
		statusEntry.type = ParamGroup.getParameterName(index);
		if (typeof unit.getClass().custom.CustParamName === 'object'){
			for (i = 0; i < unit.getClass().custom.CustParamName.length; i++){
				if (statusEntry.type === unit.getClass().custom.CustParamName[i][0] && typeof unit.getClass().custom.CustParamName[i][1] === 'string'){
					statusEntry.type = unit.getClass().custom.CustParamName[i][1];
				}
			}
		}
		if (typeof unit.custom.CustParamName === 'object'){
			for (j = 0; j < unit.custom.CustParamName.length; j++){
				if (statusEntry.type === unit.custom.CustParamName[j][0] && typeof unit.custom.CustParamName[j][1] === 'string'){
					statusEntry.type = unit.custom.CustParamName[j][1];
				}
			}
		}
		statusEntry.param = ParamGroup.getClassUnitValue(unit, index);
		statusEntry.bonus = 0;
		statusEntry.index = index;
		statusEntry.isRenderable = ParamGroup.isParameterRenderable(index);
		statusEntry.max   = ParamGroup.getMaxValue(unit, index);
		statusEntry.min   = ParamGroup.getMinValue(unit, index);
		
		return statusEntry;
	},

	_playParaUpSound: function() {
		if(isParaSound == true) {
			if( isUseOriginalSound == false ) {
				MediaControl.soundDirect(LvUpParaUpSound);
			}
			else {
				this._getOriginalSound(LvUp_ParaUpOriginalSoundID);
			}
		}
	},

	_playParaDwSound: function() {
		if(isParaSound == true) {
			if( isUseOriginalSound == false ) {
				MediaControl.soundDirect(LvUpParaDwSound);
			}
			else {
				this._getOriginalSound(LvUp_ParaDownOriginalSoundID);
			}
		}
	},

	_getOriginalSound: function(sound_id) {
		if( this._originalSoundId != sound_id ) {
			this._originalSoundId     = sound_id;
			this._originalSoundHandle = root.createResourceHandle(false, this._originalSoundId, 0, 0, 0);
		}

		if( this._originalSoundHandle != null ) {
			MediaControl.soundPlay(this._originalSoundHandle);
		}
		else {
			root.log('Original Sound ID:'+this._originalSoundId);
		}
	},

	_getOriginalAnimePic: function(anime_pic_id) {
		var isRuntime = false;
		var list, count, pic;
		
		list = root.getBaseData().getGraphicsResourceList(GraphicsType.PICTURE, false);
		count = list.getCount();
		if (count !== 0) {
			pic = list.getDataFromId(anime_pic_id);
			if (pic !== null) {
				return pic;
			}
		}
		return null;
	},

	_drawOriginalAnime: function(x, y) {
		if( LvUpAnimeOriginalPicUse == true ) {
			var ySrc = 0;
			var n = this._AnimeIndex;
			if( this._animePic == null ) {
				this._animePic = this._getOriginalAnimePic(LvUpAnimeOriginalPicID);
			}
			var width = LvUpAnimeWitdh;
			var height = LvUpAnimeHeight;
			
			if (this._animePic !== null) {
				this._animePic.drawParts(x-10, y, width * n, ySrc, width, height);
			}
			else {
				root.log('Original Picture ID:'+LvUpAnimeOriginalPicID);
			}
		}
	}
}
);


StructureBuilder.buildStatusEntryLvUp= function() {
		return {
			type: 0,
			param: 0,
			bonus: 0,
			index: 0,
			isRenderable: false,
			max: 0,
			min: 0
		}
};




