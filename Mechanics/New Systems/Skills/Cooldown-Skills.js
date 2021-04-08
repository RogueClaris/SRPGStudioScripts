/*
Hello and welcome to the Cooldown Skills script!
This script enables you to set Skills that will
only activate when X many hits have been dealt
or received. To setup a Skill to do this, set
the activation percent to Absolute, 0%, and give
it the custom parameters {Cooldown:true,MaxCharge:#},
where # is any non-decimal number.

Enjoy the script!
-Lady Rena, 8/27/2019
*/


CooldownControl = {
	
	_setupUnit: function(unit){
		var list1, list2, list3, list4, skill, i, j, k, l, m;
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
					list4[i].custom.CurCharge = list4[i].custom.MaxCharge;
				}
			}
		}
	},
	
	_decreaseCooldown: function(unit){
		var list1, list2, list3, list4, skill, i, j, k, l, m;
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
					list4[i].custom.CurCharge = list4[i].custom.MaxCharge;
					list4[i].custom.CurCharge -= 1
				}
				else if (typeof list4[i].custom.CurCharge === 'number' && list4[i].custom.CurCharge > 0){
					if (list4[i].custom.CurCharge > list4[i].custom.MaxCharge){
						list4[i].custom.CurCharge = list4[i].custom.MaxCharge;
					}
					list4[i].custom.CurCharge -= 1
				}
			}
		}
	},
	
	_resetAllCooldowns: function(){
		var type = UnitType.PLAYER;
		this._resetArmyCooldowns(type)
		type = UnitType.ENEMY;
		this._resetArmyCooldowns(type)
		type = UnitType.ALLY;
		this._resetArmyCooldowns(type)
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
		var list1, list2, list3, list4, skill, i, j, k, l, m;
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
			if (list4[i].custom.Cooldown && typeof list4[i].custom.CurCharge === 'number'){
				delete list4[i].custom.CurCharge
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
	
	if (typeof skill.custom.CurCharge === 'number' && skill.custom.CurCharge === 0){
		skill.custom.CurCharge = skill.custom.MaxCharge
		if (skilltype === SkillType.CONTINUOUSATTACK){
			skill.custom.CurCharge += skill.getSkillValue()
		}
		return true;
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

var CDS005 = SkillInfoWindow.getWindowHeight;
SkillInfoWindow.getWindowHeight = function(){
	if (this._skill !== null && this._skill.custom.Cooldown){
		return CDS005.call(this) + ItemInfoRenderer.getSpaceY()
	}
	return CDS005.call(this);
};

var CDS006 = SkillInfoWindow.drawWindowContent;
SkillInfoWindow.drawWindowContent = function(x,y){
	CDS006.call(this,x,y);
	if (this._skill.custom.Cooldown){
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var countdown = typeof this._skill.custom.CurCharge === 'number' ? this._skill.custom.CurCharge : this._skill.custom.MaxCharge;
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