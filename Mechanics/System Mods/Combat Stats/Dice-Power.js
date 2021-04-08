AbilityCalculator.getPower = function(unit, weapon) {
	var pow = 0;
	var dice = weapon.custom.dice != null ? weapon.custom.dice : 1
	var damage = weapon.custom.damage != null ? weapon.custom.damage : 4
	var bonus = weapon.custom.bonus != null ? weapon.custom.bonus : weapon.getPow();
	
	for (i = 0; i < dice; i++){
		pow += Math.round(Math.random()*(damage+1));
	};
	// Atk formula. Weapon pow + (Pow or Mag)
	return pow + bonus;
};

StatusRenderer.drawAttackStatus = function(x, y, arr, color, font, space) {
	var i, text;
	var length = this._getTextLength();
	var numberSpace = DefineControl.getNumberSpace();
	var buf = ['attack_capacity', 'hit_capacity', 'critical_capacity'];
	
	for (i = 0; i < 3; i++) {
		text = root.queryCommand(buf[i]);
		if (buf[i] === 'attack_capacity'){
			TextRenderer.drawKeywordText(x, y, text, length, color, font);
			x += 28
			if (typeof arr[i] === 'string'){
				TextRenderer.drawText(x,y+3,arr[i],length,0xffffff,font);
			}
			else{
				TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
			}
			x += 28 + numberSpace;
		}
		else{
			TextRenderer.drawKeywordText(x, y, text, length, color, font);
			x += 28 + numberSpace;
			
			if (arr[i] >= 0) {
				NumberRenderer.drawNumber(x, y, arr[i]);
			}
			else {
				TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
			}
			
			x += space;
		}
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
	var bonus = weapon.custom.bonus != null ? weapon.custom.bonus : weapon.getPow();
	
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
			TextRenderer.drawText(x,y,value,30,0x40bfff,font);
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
		var bonus = weapon.custom.bonus != null ? weapon.custom.bonus : weapon.getPow();
		
		value = dice.toString()+"d"+damage.toString()+"+"+bonus.toString()
		
		isValid = true;
	}
	this.drawAbilityText(x, y, root.queryCommand('attack_capacity'), value, isValid);
};