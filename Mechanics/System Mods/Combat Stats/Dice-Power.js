var DicePowerCompatibilityCL0 = AbilityCalculator.getPower;
AbilityCalculator.getPower = function(unit, weapon) {
	var pow = DicePowerCompatibilityCL0.call(this, unit, weapon) - weapon.getPow();
	var dice = weapon.custom.dice != null ? weapon.custom.dice : 1
	var damage = weapon.custom.damage != null ? weapon.custom.damage : 4
	var bonus = weapon.custom.bonus != null ? weapon.custom.bonus : weapon.getPow();
	for (i = 0; i < dice; i++){
		pow += Math.round(Math.random()*(damage));
	};
	// Atk formula. Weapon pow + (Pow or Mag)
	return pow + bonus;
};

StatusRenderer.drawAttackStatus = function(x, y, arr, color, font, space) {
	var length = this._getTextLength();
	var numberSpace = DefineControl.getNumberSpace();
	x -= 8
	//draw attack keyword.
	TextRenderer.drawKeywordText(x, y, root.queryCommand('attack_capacity'), length, color, font);
	
	//increase x.
	x += 28

	if (typeof arr[0] === 'string'){
		//draw attack dice.
		TextRenderer.drawText(x,y+3,arr[0],length,ColorValue.DEFAULT,font);
	}
	else{
		//draw limitless sign word if the weapon has no dice, somehow.
		TextRenderer.drawSignText(x + 22, y, StringTable.SignWord_Limitless);
	}

	x += space + 48

	//draw hit keyword
	TextRenderer.drawKeywordText(x, y, root.queryCommand('hit_capacity'), length, color, font);
	
	//increase x.
	x += 23 + numberSpace;
	
	//draw critical or limitless
	if (arr[2] >= 0) {
		NumberRenderer.drawNumber(x, y, arr[1]);
	}
	else {
		TextRenderer.drawSignText(x - 8, y, StringTable.SignWord_Limitless);
	}
	
	x += space
	
	//draw critical keyword
	TextRenderer.drawKeywordText(x, y, root.queryCommand('critical_capacity'), length, color, font);
	
	//increase x.
	x += 23 + numberSpace;

	//draw critical or limitless
	if (arr[2] >= 0) {
		NumberRenderer.drawNumber(x, y, arr[2]);
	}
	else {
		TextRenderer.drawSignText(x - 10, y, StringTable.SignWord_Limitless);
	}
	
};

AttackChecker.getAttackStatusInternal = function(unit, weapon, targetUnit) {
	var activeTotalStatus, passiveTotalStatus;
	var arr = [,,,];
	
	if (weapon === null) {
		return this.getNonStatus();
	}
	
	var dice = weapon.custom.dice != null ? weapon.custom.dice : 1
	var damage = weapon.custom.damage != null ? weapon.custom.damage : 4
	var bonus = DicePowerCompatibilityCL0.call(this, unit, weapon);

	activeTotalStatus = SupportCalculator.createTotalStatus(unit);
	passiveTotalStatus = SupportCalculator.createTotalStatus(targetUnit);
	
	arr[0] = dice.toString()+"d"+damage.toString()+"+"+bonus.toString();
	arr[1] = HitCalculator.calculateHit(unit, targetUnit, weapon, activeTotalStatus, passiveTotalStatus);
	arr[2] = CriticalCalculator.calculateCritical(unit, targetUnit, weapon, activeTotalStatus, passiveTotalStatus);

	return arr;
};

ItemSentence.AttackAndHit.drawItemSentence = function(x, y, item) {
	var text;
	var dice = item.custom.dice != null ? item.custom.dice : 1
	var damage = item.custom.damage != null ? item.custom.damage : 4
	var bonus = item.custom.bonus != null ? item.custom.bonus : item.getPow();
	var textUI = root.queryTextUI('default_window');
	var color = textUI.getColor();
	var font = textUI.getFont();
	text = root.queryCommand('attack_capacity');
	ItemInfoRenderer.drawKeyword(x, y, text);
	x += 40
	TextRenderer.drawText(x,y+3,dice.toString()+"d"+damage.toString()+"+"+bonus.toString(),30,0xffffff,font);
	
	x += 84;
	
	text = root.queryCommand('hit_capacity');
	ItemInfoRenderer.drawKeyword(x, y, text);
	x += 40;
	NumberRenderer.drawRightNumber(x, y, item.getHit());
};

ItemSentence.CriticalAndRange.drawItemSentence = function(x, y, item) {
	var text;
	
	text = root.queryCommand('critical_capacity');
	ItemInfoRenderer.drawKeyword(x, y, text);
	x += 40
	NumberRenderer.drawRightNumber(x, y, item.getCritical());
	
	x += 84;
	
	text = root.queryCommand('range_capacity');
	ItemInfoRenderer.drawKeyword(x, y, text);
	x += 40;
	this._drawRange(x, y, item);
};

BaseUnitSentence.drawAbilityText = function(x, y, text, value, isValid) {
	var textui = this.getUnitSentenceTextUI();
	var color = textui.getColor();
	var font = textui.getFont();
	var colorIndex = 1;
	var length = -1;
	
	TextRenderer.drawKeywordText(x, y, text, length, color, font);
	if (typeof value === 'string'){
		x += 39
	}
	else{
		x += 78;
	}
	
	if (isValid) {
		if (typeof value === 'string'){
			TextRenderer.drawText(x,y+2,value,30,0xB7CCDD,font);
		}
		else{	
			if (value < 0) {
				TextRenderer.drawSignText(x - 37, y, ' - ');
				value *= -1;
			}
			NumberRenderer.drawNumberColor(x, y, value, colorIndex, 255);
		}
	}
	else {
		TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
	}
};

UnitSentence.Power.drawUnitSentence = function(x, y, unit, weapon, totalStatus) {
	var value = 0;
	var isValid = false;
	if (weapon !== null) {
		var dice = weapon.custom.dice != null ? weapon.custom.dice : 1
		var damage = weapon.custom.damage != null ? weapon.custom.damage : 4
		var bonus = DicePowerCompatibilityCL0.call(this, unit, weapon);
		
		value = dice.toString()+"d"+damage.toString()+"+"+bonus.toString()
		
		isValid = true;
	}
	this.drawAbilityText(x, y, root.queryCommand('attack_capacity'), value, isValid);
};