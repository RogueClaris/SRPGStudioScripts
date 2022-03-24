/*
Give Class Types the following custom parameter:
{
	SortieCostCL:X
}
Where X is a whole number.
You may also give it to Classes, and it will override Class Types.
Additionally, you may give it to specific units, and that will override Classes.

Give Maps the following custom parameter:
{
	MaxSortiePointsCL:Y
}
Where Y is a whole number.

This will prevent you from allocating more than Y points to that map in unit costs, associated with X.
The script will do the rest.
*/

var PointTracker = {
	points: 0
}

var RecruitPointSystemCL0 = SortieSetting.nonsortieUnit;
SortieSetting.nonsortieUnit = function(unit) {
	RecruitPointSystemCL0.call(this, unit);
	var curPoints = PointTracker.points;
	var pointCost = typeof unit.getClass().custom.SortieCostCL === "number" ? unit.getClass().custom.SortieCostCL : typeof unit.getClass().getClassType().custom.SortieCostCL === "number" ? typeof unit.getClass().getClassType().custom.SortieCostCL : 1;
	if (typeof unit.custom.SortieCostCL === "number"){
		pointCost = unit.custom.SortieCostCL;
	}
	curPoints = Math.max(0, curPoints-pointCost);
	PointTracker.points = curPoints;
};

var RecruitPointSystemCL1 = SortieSetting._sortieUnit;
SortieSetting._sortieUnit = function(unit) {
	var CurMap = root.getCurrentSession().getCurrentMapInfo();
	var maxPoints = CurMap.custom.MaxSortiePointsCL;
	var curPoints = PointTracker.points
	var pointCost = typeof unit.getClass().custom.SortieCostCL === "number" ? unit.getClass().custom.SortieCostCL : typeof unit.getClass().getClassType().custom.SortieCostCL === "number" ? typeof unit.getClass().getClassType().custom.SortieCostCL : 1;
	if (typeof unit.custom.SortieCostCL === "number"){
		pointCost = unit.custom.SortieCostCL;
	}
	if ((curPoints + pointCost) >= maxPoints){
		return false;
	}
	curPoints += pointCost;
	PointTracker.points = curPoints;
	return RecruitPointSystemCL1.call(this, unit);
};

var RecruitPointSystemCL2 = TurnChangeMapStart.doLastAction;
TurnChangeMapStart.doLastAction = function(){
	RecruitPointSystemCL2.call(this);
	PointTracker.points = 0;
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
		var cur = PointTracker.points;
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