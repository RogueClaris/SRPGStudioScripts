var RSEffectiveColor = PosAttackWindow.setPosTarget;
PosAttackWindow.setPosTarget = function(unit, item, targetUnit, targetItem, isSrc){
	var isCalculation = false;
	if (item != null && item.isWeapon() && DamageCalculator.isEffective(unit, targetUnit, item, false, null)){
		this._recolor = true
		if (item !== null && item.isWeapon()) {
			if (isSrc) {
				// If the player has launched an attack, the status can be obtained without conditions.
				this._statusArray = AttackChecker.getAttackStatusInternal(unit, item, targetUnit);
				isCalculation = true;
			}
			else {
				if (AttackChecker.isCounterattack(targetUnit, unit)) {
					this._statusArray = AttackChecker.getAttackStatusInternal(unit, item, targetUnit);
					isCalculation = true;
				}
				else {
					this._statusArray = AttackChecker.getNonStatus();	
				}
			}
		}
		else {
			this._statusArray = AttackChecker.getNonStatus();
		}
		
		if (isCalculation) {
			this._roundAttackCount = Calculator.calculateRoundCount(unit, targetUnit, item);
			this._roundAttackCount *= Calculator.calculateAttackCount(unit, targetUnit, item);
		}
		else {
			this._roundAttackCount = 0;
		}
		
		this.setPosInfo(unit, item, isSrc);
	}
	else{
		this._recolor = false
		RSEffectiveColor.call(this, unit, item, targetUnit, targetItem, isSrc)
	}
};

PosAttackWindow.drawInfoBottom = function(xBase, yBase) {
	var x = xBase;
	var y = yBase + 90;
	var textui = this.getWindowTextUI();
	var color = ColorValue.KEYWORD;
	var font = textui.getFont();
	if (this._recolor){
		StatusRenderer.drawAttackStatusRS(x, y, this._statusArray, color, font, 20);
	}
	else{
		StatusRenderer.drawAttackStatus(x, y, this._statusArray, color, font, 20);
	}
};

StatusRenderer.drawAttackStatusRS = function(x, y, arr, color, font, space) {
	var i, text;
	var length = this._getTextLength();
	var numberSpace = DefineControl.getNumberSpace();
	var buf = ['attack_capacity', 'hit_capacity', 'critical_capacity'];
	
	for (i = 0; i < 3; i++) {
		text = root.queryCommand(buf[i]);
		TextRenderer.drawKeywordText(x, y, text, length, color, font);
		x += 28 + numberSpace;
		
		if (arr[i] >= 0) {
			if (text == root.queryCommand('attack_capacity')){
				NumberRenderer.drawNumberColor(x, y, arr[i], 2, 255)
				//TextRenderer.drawText(x, y, arr[i], -1, 0x00ff00, font)
			}
			else{
				NumberRenderer.drawNumber(x, y, arr[i]);
				//TextRenderer.drawText(x, y, arr[i], -1, 0x00ff00, font)
			}
		}
		else {
			TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
		}
		
		x += space;
	}	
};