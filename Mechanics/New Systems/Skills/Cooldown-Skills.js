/*
Hello and welcome to the Cooldown Skills script!
This script enables you to set Skills that will
only activate when X many hits have been dealt
or received. To setup a Skill to do this, set
give it the following custom parameters:

{
	Cooldown:true,
	MaxCharge:#
}

As long as # is a non-decimal number, it will
work.

Enjoy the script!

=Plugin Author=
-RogueClaris

=License=
-Free use. Go wild.

=Script History=
-August 27th, 2019: Initial release.
-May 18th, 2021: Fixed multiple bugs.

=Compatibility note=
If replacing the Skill Interaction,
use createObjectEx. It is needed to
access the unit from the SkillInfoWindow
object. Thank you. -RogueClaris
*/


CooldownControl = {
	
	_setupUnit: function(unit){
		if (unit == null){
			return false;
		}
		var list1, list2, list3, list4, skill, i, j, k, l, m;
		unit.custom.CooldownObj = []
		list1 = unit.getSkillReferenceList();
		list2 = ItemControl.getEquippedWeapon(unit) !== null ? ItemControl.getEquippedWeapon(unit).getSkillReferenceList() : null;
		list3 = unit.getClass().getSkillReferenceList();
		list4 = []
		for (j = 0; j < list1.getTypeCount(); j++){
			list4.push(list1.getTypeData(j))
		}
		if (list2 !== null){
			for (k = 0; k < list2.getTypeCount(); k++){
				list4.push(list2.getTypeData(k))
			}
		}
		
		for (l = 0; l < list3.getTypeCount(); l++){
			list4.push(list3.getTypeData(l))
		}
		
		for (i = 0; i < list4.length; i++){
			if (list4[i].custom.Cooldown){
				if (typeof list4[i].custom.CurCharge !== 'number'){
					unit.custom.CooldownObj.push([list4[i].getName(), list4[i].getId(), list4[i].custom.MaxCharge, list4[i].custom.MaxCharge])
				}
			}
		}
		return true;
	},
	
	_decreaseCooldown: function(unit){
		if (typeof unit.custom.CooldownObj != 'object'){
			if (!this._setupUnit(unit)){
				return;
			}
		}
		var i;
		var arr = unit.custom.CooldownObj;
		for (i = 0; i < arr.length; ++i){
			if (typeof arr[i][2] === 'number' && arr[i][2] > 0){
				arr[i][2]--
			}
			else{
				arr[i][2] = arr[i][3]
			}
		}
	},
	
	_resetAllCooldowns: function(){
		this._resetArmyCooldowns(UnitType.PLAYER)
		this._resetArmyCooldowns(UnitType.ENEMY)
		this._resetArmyCooldowns(UnitType.ALLY)
	},
	
	_resetArmyCooldowns: function(type){
		var list, unit, i;
		if (type === UnitType.PLAYER){
			list = PlayerList.getSortieList();
			for (i = 0; i < list.getCount(); i++){
				unit = list.getData(i)
				this._resetCooldown(unit);
			}
		}
		else if (type === UnitType.ENEMY){
			list = EnemyList.getAliveList();
			for (i = 0; i < list.getCount(); i++){
				unit = list.getData(i)
				this._resetCooldown(unit);
			}
		}
		else if (type === UnitType.ALLY){
			list = AllyList.getAliveList();
			for (i = 0; i < list.getCount(); i++){
				unit = list.getData(i)
				this._resetCooldown(unit);
			}
		}
	},
	
	_resetCooldown: function(unit){
		if (typeof unit.custom.CooldownObj != 'object'){
			if (!this._setupUnit(unit)){
				return;
			}
		}
		var i;
		var arr = unit.custom.CooldownObj;
		for (i = 0; i < arr.length; ++i){
			arr[i][2] = arr[i][3]
		}
	},
	
	_findSkill: function(unit, skill){
		if (skill == null || unit == null){
			return null;
		}
		else if (typeof unit.custom.CooldownObj != 'object'){
			if (!this._setupUnit(unit)){
				return;
			}
		}
		var i;
		var arr = unit.custom.CooldownObj;
		for (i = 0; i < arr.length; ++i){
			if (arr[i][0] === skill.getName() && arr[i][1] === skill.getId()){
				return arr[i]
			}
		}
	}
}

var CDS001 = TurnChangeMapStart.doLastAction;
TurnChangeMapStart.doLastAction = function() {
	CDS001.call(this);
	
	CooldownControl._resetAllCooldowns()
};

var CDS002 = SkillRandomizer._isSkillInvokedInternal;
SkillRandomizer._isSkillInvokedInternal = function(active, passive, skill) {
	var result = CDS002.call(this,active,passive,skill);
	var skilltype = skill.getSkillType();
	var skill2 = CooldownControl._findSkill(active, skill)
	
	if (skill2 !== null){
		if (skill2[2] === 0){
			skill2[2] = skill2[3]
			if (skilltype === SkillType.CONTINUOUSATTACK){
				skill2[2] += skill.getSkillValue()
			}
			return true;
		}
		return false;
	}
	return result;
};

var CDS003 = DamageControl.reduceHp;
DamageControl.reduceHp = function(unit, damage){
	CDS003.call(this,unit,damage);
	if (damage > 0){
		CooldownControl._decreaseCooldown(unit);
	}
};

var AddUnitExCL0 = UnitMenuBottomWindow.setUnitMenuData;
UnitMenuBottomWindow.setUnitMenuData = function(){
	AddUnitExCL0.call(this);
	this._skillInteraction = createObjectEx(SkillInteraction, this);
}

var CDS005 = SkillInfoWindow.getWindowHeight;
SkillInfoWindow.getWindowHeight = function(){
	var skill = CooldownControl._findSkill(this.getParentInstance().getParentInstance()._unit, this._skill)
	if (skill !== null){
		this._unit = this.getParentInstance().getParentInstance()._unit;
		return CDS005.call(this) + ItemInfoRenderer.getSpaceY()
	}
	return CDS005.call(this);
};

var CDS006 = SkillInfoWindow.drawWindowContent;
SkillInfoWindow.drawWindowContent = function(x,y){
	CDS006.call(this,x,y);
	var skill = CooldownControl._findSkill(this._unit, this._skill)
	if (skill !== null){
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var countdown = skill[2]
		if (this._isInvocationType()){
			y += ItemInfoRenderer.getSpaceY()
		}
		y += ItemInfoRenderer.getSpaceY() * this._aggregationViewer.getAggregationViewerCount();
		y += ItemInfoRenderer.getSpaceY() * 2
		TextRenderer.drawKeywordText(x, y, "Cooldown", this._getTextLength(), ColorValue.KEYWORD, font);
		x += 75;
		NumberRenderer.drawRightNumber(x,y,countdown)
	}
};

var CDS007 = ItemControl.decreaseLimit;
ItemControl.decreaseLimit = function(unit, item) {
	CDS007.call(this,unit,item);
	if (item.isWeapon()){
		CooldownControl._decreaseCooldown(unit);
	}
	else if (item.isWand()){
		CooldownControl._decreaseCooldown(unit);
	}
};