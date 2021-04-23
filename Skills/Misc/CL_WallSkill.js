/*
Create a skill with the custom keyword WallCL.
It has the following effects:
1) Unit can be attacked by any army.
2) Unit does not display any info when you press option or hover over it.
3) Unit does not counterattack if equipped with a weapon. Setting to Wait > Wait Only ensures it never attacks.
4) Unit cannot be passed through even by its own army.
5) Unit does not display range panels when highlighted.
6) Unit is not selected when cycling through units on the map.
7) Unit is not selected when cycling through units in the unit menu.
8) Units individual range is not displayed when you cancel on it.
9) You cannot miss when attacking a unit with this skill.
*/

BlockerRule.WALLCL = defineObject(BaseBlockerRule,
{
	isRuleApplicable: function(unit) {
		return true;
	},
	
	isTargetBlocker: function(unit, targetUnit) {
		if (unit === null || targetUnit === null){
			return false;
		}
		if (FilterControl.isReverseUnitTypeAllowed(unit, targetUnit) || SkillControl.getPossessionCustomSkill(targetUnit,"WallCL")){
			return true;
		}
		return false;
	}
}
);

var WallAliasCL0 = SimulationBlockerControl._configureBlockerRule;
SimulationBlockerControl._configureBlockerRule = function(groupArray) {
	WallAliasCL0.call(this, groupArray);
	groupArray.appendObject(BlockerRule.WALLCL);
};

var WallAliasCL1 = FilterControl.isReverseUnitTypeAllowed;
FilterControl.isReverseUnitTypeAllowed = function(u, tu){
	var result = WallAliasCL1.call(this, u, tu);
	if (SkillControl.getPossessionCustomSkill(tu,"WallCL") || SkillControl.getPossessionCustomSkill(u,"WallCL")){
		return true;
	}
	return result;
};

var WallAliasCL2 = Calculator.isCounterattackAllowed;
Calculator.isCounterattackAllowed = function(a, b) {
	var result = WallAliasCL2.call(this, a, b);
	if (SkillControl.getPossessionCustomSkill(b,"WallCL") || SkillControl.getPossessionCustomSkill(a,"WallCL")){
		return false;
	}
	return result;
}

var WallAliasCL3 = CoreAttack._isAnimeEmpty;
CoreAttack._isAnimeEmpty = function(a, b){
	var result = WallAliasCL3.call(this, a, b);
	if (SkillControl.getPossessionCustomSkill(b,"WallCL") || SkillControl.getPossessionCustomSkill(a,"WallCL")){
		return true;
	}
	return result;
}

var WallAliasCL4 = UnitRangePanel.setUnit;
UnitRangePanel.setUnit = function(u){
	if (u !== null && SkillControl.getPossessionCustomSkill(u,"WallCL")){
		return;
	}
	return WallAliasCL4.call(this, u);
}

var WallAliasCL5 = MapEdit._selectAction;
MapEdit._selectAction = function(u){
	if (u !== null && SkillControl.getPossessionCustomSkill(u,"WallCL")){
		return WallAliasCL5.call(this, null);
	}
	return WallAliasCL5.call(this, u);
}

var WallAliasCL6 = MapEdit._cancelAction;
MapEdit._cancelAction = function(u){
	if (u !== null && SkillControl.getPossessionCustomSkill(u,"WallCL")){
		return WallAliasCL6.call(this, null);
	}
	return WallAliasCL6.call(this, u);
}

var WallAliasCL7 = MapEdit._optionAction;
MapEdit._optionAction = function(u){
	if (u !== null && SkillControl.getPossessionCustomSkill(u,"WallCL")){
		return;
	}
	return WallAliasCL6.call(this, u);
};

var WallAliasCL8 = MapEdit._changeTarget;
MapEdit._changeTarget = function(isNext){
	var unit;
	var list = PlayerList.getSortieList();
	var count = list.getCount();
	var index = this._activeIndex;
	root.log('hi')
	
	for (;;) {
		if (isNext) {
			index++;
		}
		else {
			index--;
		}
		
		if (index >= count) {
			index = 0;
		}
		else if (index < 0) {
			index = count - 1;
		}
		
		unit = list.getData(index);
		if (unit === null) {
			break;
		}
		
		if (!unit.isWait() && !SkillControl.getPossessionCustomSkill(unit,"WallCL"))  {
			this._activeIndex = index;
			this._setUnit(unit);
			this._setFocus(unit);
			break;
		}
		
		if (index === this._activeIndex) {
			break;
		}
	}
}

var WallAliasCL9 = UnitMenuScreen._moveTopMode;
UnitMenuScreen._moveTopMode = function() {
	var index;
	var result = MoveResult.CONTINUE;
	
	this._pageChanger.movePage();
	
	if (this._pageChanger.checkPage()) {
		this._activePageIndex = this._pageChanger.getPageIndex();
		return result;
	}
	
	// If up/down key is pressed, the unit is switched with _changeTarget.
	if (InputControl.isSelectAction()) {
		result = this._selectAction();
	}
	else if (InputControl.isCancelAction()) {
		result = this._cancelAction();
	}
	else if (InputControl.isOptionAction()) {
		result = this._optionAction();
	}
	else {
		index = this._dataChanger.checkDataIndex(this._unitList, this._unit); 
		if (index !== -1 && SkillControl.getPossessionCustomSkill(this._unitList.getData(index),"WallCL")){
			index += 1
			if (index >= this._unitList.length){
				index = 0;
			}
			this._setNewTarget(this._unitList.getData(index));
		}
		else if (index !== -1) {
			this._setNewTarget(this._unitList.getData(index));
		}
	}
	
	return result;
};

var WallAliasCL10 = MapParts.UnitInfoSmall._drawContent;
MapParts.UnitInfoSmall._drawContent = function(x, y, unit, textui) {
	if (!SkillControl.getPossessionCustomSkill(unit,"WallCL")){
		WallAliasCL10.call(this, x, y, unit, textui);
	}
}

var WallAliasCL11 = MapParts.UnitInfo.drawMapParts;
MapParts.UnitInfo.drawMapParts = function(){
	if (this.getMapPartsTarget() !== null && !SkillControl.getPossessionCustomSkill(this.getMapPartsTarget(),'WallCL')){
		WallAliasCL11.call(this)
	}
}

var WallHitCL0 = HitCalculator.calculateHit;
HitCalculator.calculateHit = function(active, passive, weapon, activeTotalStatus, passiveTotalStatus) {
	if (SkillControl.getPossessionCustomSkill(passive,"WallCL")){
		return 100;
	}
	return WallHitCL0.call(this, active, passive, weapon, activeTotalStatus, passiveTotalStatus)
}