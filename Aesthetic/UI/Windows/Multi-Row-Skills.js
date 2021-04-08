var SkillInteraction2 = defineObject(BaseInteraction,
{
	initialize: function() {
		//create new scrollbar
		this._scrollbar = createScrollbarObject(IconItemScrollbar2, this);
		//set different formation
		this._scrollbar.setScrollFormation(6, 3);
		//set the window
		this._window = createWindowObject(SkillInfoWindow, this);
	},
	
	setSkillArray: function(arr) {
		this._scrollbar.setObjectArray(arr);
	},
	
	getHelpText: function() {
		var skillEntry = this._scrollbar.getObject();
		
		return skillEntry.skill.getDescription();
	},
	
	_changeTopic: function() {
		var skillEntry = this._scrollbar.getObject();
		
		this._window.setSkillInfoData(skillEntry.skill, skillEntry.objecttype);
	}
}
);

var IconItemScrollbar2 = defineObject(BaseScrollbar,
{
	drawScrollContent: function(x, y, object, isSelect, index) {
		var handle = object.skill.getIconResourceHandle();
		
		GraphicsRenderer.drawImage(x, y-40, handle, GraphicsType.ICON);
	},
	
	drawDescriptionLine: function(x, y) {
	},
	
	playSelectSound: function() {
	},
	
	getObjectWidth: function() {
		return 30;
	},
	
	getObjectHeight: function() {
		return 24;
	},
	
	drawScrollbar: function(xStart, yStart) {
		var i, j, x, y, isSelect, scrollableData;
		var isLast = false;
		var objectCount = this.getObjectCount();
		var width = this._objectWidth + this.getSpaceX();
		var height = this._objectHeight + this.getSpaceY();
		var index = (this._yScroll * this._col) + this._xScroll;
		
		xStart += this.getScrollXPadding();
		yStart += this.getScrollYPadding();
		
		// The data shouldn't be updated with draw functions, but exclude so as to enable to refer to the position with move functions.
		this.xRendering = xStart;
		this.yRendering = yStart;
		MouseControl.saveRenderingPos(this);
		
		for (i = 0; i < this._rowCount; i++) {
			y = yStart + (i * height);
			
			this.drawDescriptionLine(xStart, y);
			
			for (j = 0; j < this._col; j++) {
				x = xStart + (j * width);
				
				isSelect = index === this.getIndex();
				this.drawScrollContent(x, y, this._objectArray[index], isSelect, index);
				if (isSelect && this._isActive) {
					this.drawCursor(x, y-40, true);
				}
				
				if (index === this._forceSelectIndex) {
					this.drawCursor(x, y-40, true);
				}
				
				if (++index === objectCount) {
					isLast = true;
					break;
				}
			}
			if (isLast) {
				break;
			}
		}
		
		if (this._isActive) {
			scrollableData = this.getScrollableData();
			this._edgeCursor.drawHorzCursor(xStart - this.getScrollXPadding(), yStart - this.getScrollYPadding(), scrollableData.isLeft, scrollableData.isRight);
			this._edgeCursor.drawVertCursor(xStart - this.getScrollXPadding(), yStart - this.getScrollYPadding(), scrollableData.isTop, scrollableData.isBottom);
		}
	}
}
);

UnitMenuBottomWindow.setUnitMenuData = function() {
	this._skillInteraction = createObject(SkillInteraction2);
	this._itemInteraction = createObject(ItemInteraction);
	this._statusScrollbar = createScrollbarObject(UnitStatusScrollbar, this);
};

UnitMenuBottomWindow._drawSkillArea = function(xBase, yBase) {
	var dy = this._itemInteraction.getInteractionScrollbar().getScrollbarHeight() + 10;
	var width = 230;
	
	this._skillInteraction.getInteractionScrollbar().drawScrollbar(xBase + width, yBase + dy);
};
