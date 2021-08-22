/*
Give classes the following custom parameter:
{
	SortieCostCL:X
}
Where X is a whole number.

Give Maps the following custom parameter:
{
	MaxSortiePointsCL:Y
}
Where Y is a whole number.

This will prevent you from allocating more than Y points to that map in unit costs, associated with X.
The script will do the rest.
*/

var RecruitPointSystemCL0 = SortieSetting.nonsortieUnit;
SortieSetting.nonsortieUnit = function(unit) {
	var curPoints = root.getMetaSession().global.SortiePointsCL === "number" ? root.getMetaSession().global.SortiePointsCL : 0;
	if ((curPoints - unit.getClass().getClassType().custom.SortieCostCL) > 0){
		curPoints -= unit.getClass().getClassType().custom.SortieCostCL;
		root.getMetaSession().global.SortiePointsCL = curPoints;
	}
	else{
		curPoints = 0;
		root.getMetaSession().global.SortiePointsCL = curPoints;
	}
	return RecruitPointSystemCL0.call(this, unit);
};

var RecruitPointSystemCL1 = SortieSetting._sortieUnit;
SortieSetting._sortieUnit = function(unit) {
	var CurMap = root.getCurrentSession().getCurrentMapInfo();
	var maxPoints = CurMap.custom.MaxSortiePointsCL;
	var curPoints = typeof root.getMetaSession().global.SortiePointsCL === "number" && root.getMetaSession().global.SortiePointsCL > 0 ? root.getMetaSession().global.SortiePointsCL : 0;
	if ((curPoints + unit.getClass().getClassType().custom.SortieCostCL) >= maxPoints){
		return false;
	}
	curPoints += unit.getClass().getClassType().custom.SortieCostCL;
	root.getMetaSession().global.SortiePointsCL = curPoints;
	return RecruitPointSystemCL1.call(this, unit);
};

var RecruitPointSystemCL2 = TurnChangeMapStart.doLastAction;
TurnChangeMapStart.doLastAction = function(){
	RecruitPointSystemCL2.call(this);
	root.getMetaSession().global.SortiePointsCL = 0;
}

var RecruitPointSystemCL3 = UnitSortieScreen.drawScreenCycle;
UnitSortieScreen.drawScreenCycle = function(){
	RecruitPointSystemCL3.call(this);
	var width = this._leftWindow.getWindowWidth() + this._unitMenuTopWindow.getWindowWidth();
	var height = this._leftWindow.getWindowHeight();
	var x = LayoutControl.getCenterX(-1, width);
	var y = LayoutControl.getCenterY(-1, height);
	width = this._leftWindow.getWindowWidth();
	height = this._unitMenuTopWindow.getWindowHeight();
	var range = this._getStartTitleRange(x, y);
	this._pointTotalCostWindow.drawWindow(Math.floor(range.x/2), range.y+2);
}

var RecruitPointSystemCL4 = UnitSortieScreen._prepareScreenMemberData;
UnitSortieScreen._prepareScreenMemberData = function(screenParam) {
	RecruitPointSystemCL4.call(this, screenParam);
	this._pointTotalCostWindow = createWindowObject(PointTotalCostWindow, this);
}

var PointTotalCostWindow = defineObject(BaseWindow,
{
	_curPoints: null,
	_maxPoints: null,
	
	moveWindowContent: function() {
	},
	
	drawWindowContent: function(x, y) {
		var cur = root.getMetaSession().global.SortiePointsCL;
		var max = root.getCurrentSession().getCurrentMapInfo().custom.MaxSortiePointsCL;
		var font = TextRenderer.getDefaultFont();
		y -= 6;
		TextRenderer.drawSignText(x, y, "Pts: ")
		x += TextRenderer.getTextWidth("Pts: ", font)+1;
		NumberRenderer.drawNumber(x, y, cur);
		x += TextRenderer.getTextWidth("3", font)+1;
		TextRenderer.drawSignText(x, y, "/");
		x += TextRenderer.getTextWidth("/", font)+1;
		NumberRenderer.drawRightNumber(x, y, max);
	},
	
	getWindowWidth: function() {
		return 128;
	},
	
	getWindowHeight: function() {
		return 40;
	}
}
);