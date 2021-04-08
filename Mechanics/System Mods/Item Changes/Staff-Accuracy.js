
//"Staff accuracy = 30 + (Magic x 5) + Skill", "Staff avoid = (Resistance x 5) + (Distance from enemy x 2)"

DamageItemUse.enterMainUseCycle = function(itemUseParent) {
	var generator;
	var itemTargetInfo = itemUseParent.getItemTargetInfo();
	var damageInfo = itemTargetInfo.item.getDamageInfo();
	var type = itemTargetInfo.item.getRangeType();
	var plus = Calculator.calculateDamageItemPlus(itemTargetInfo.unit, itemTargetInfo.targetUnit, itemTargetInfo.item);
	var X1, Y1, X2, Y2;
	X1 = itemTargetInfo.unit.getMapX();
	Y1 = itemTargetInfo.unit.getMapY();
	X2 = itemTargetInfo.targetUnit.getMapX();
	Y2 = itemTargetInfo.targetUnit.getMapY();
	var DIST = Math.abs((X1+Y1)-(X2+Y2))
	var ACC = Math.round(damageInfo.getHit() + (RealBonus.getMag(itemTargetInfo.unit)*5)+RealBonus.getSki(itemTargetInfo.unit) - (RealBonus.getMdf(itemTargetInfo.targetUnit)*5) - DIST*2);
	root.log(damageInfo.getHit())
	this._dynamicEvent = createObject(DynamicEvent);
	generator = this._dynamicEvent.acquireEventGenerator();
	
	if (type !== SelectionRangeType.SELFONLY) {
		generator.locationFocus(itemTargetInfo.targetUnit.getMapX(), itemTargetInfo.targetUnit.getMapY(), true);
	}
	if (itemTargetInfo.item.isWand()){
		generator.damageHitEx(itemTargetInfo.targetUnit, this._getItemDamageAnime(itemTargetInfo),damageInfo.getDamageValue() + plus, damageInfo.getDamageType(), ACC, itemTargetInfo.unit, itemUseParent.isItemSkipMode());
	}
	else{
		generator.damageHitEx(itemTargetInfo.targetUnit, this._getItemDamageAnime(itemTargetInfo),damageInfo.getDamageValue() + plus, damageInfo.getDamageType(), damageInfo.getHit(), itemTargetInfo.unit, itemUseParent.isItemSkipMode());
	}
	
	return this._dynamicEvent.executeDynamicEvent();
};
DamageItemInfo.getInfoPartsCount = function() {
	return 2;
};
DamageItemInfo.drawItemInfoCycle = function(x, y) {
	ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName(StringTable.ItemInfo_Damage));
	y += ItemInfoRenderer.getSpaceY();
	
	this._drawValue(x, y);
	// y += ItemInfoRenderer.getSpaceY();
	
	// this._drawHit(x, y);
	// x += ItemInfoRenderer.getSpaceX() + 40;
	// this._drawInfo(x, y);
};
DamageItemPotency.setPosMenuData = function(unit, item, targetUnit) {
	var damageInfo = item.getDamageInfo();
	var plus = Calculator.calculateDamageItemPlus(unit, targetUnit, item);
	var X1, Y1, X2, Y2;
	X1 = unit.getMapX();
	Y1 = unit.getMapY();
	X2 = targetUnit.getMapX();
	Y2 = targetUnit.getMapY();
	var DIST = Math.abs((X1+Y1)-(X2+Y2))
	var ACC = Math.round(damageInfo.getHit() + (RealBonus.getMag(unit)*5)+RealBonus.getSki(unit) - (RealBonus.getMdf(targetUnit)*5) - DIST*2)
	this._value = Calculator.calculateDamageValue(targetUnit, damageInfo.getDamageValue(), damageInfo.getDamageType(), plus);
	if (ACC > 0){
		this._value2 = ACC;//Calculator.calculateDamageHit(targetUnit, damageInfo.getHit());
	}
	else{
		this._value2 = 0;
	}
};

StateItemUse.enterMainUseCycle = function(itemUseParent) {
	var generator;
	var itemTargetInfo = itemUseParent.getItemTargetInfo();
	var info = itemTargetInfo.item.getStateInfo();
	var X1, Y1, X2, Y2;
	X1 = itemTargetInfo.unit.getMapX();
	Y1 = itemTargetInfo.unit.getMapY();
	X2 = itemTargetInfo.targetUnit.getMapX();
	Y2 = itemTargetInfo.targetUnit.getMapY();
	var DIST = Math.abs((X1+Y1)-(X2+Y2))
	var stateInvocation = info.getStateInvocation();
	var BaseHit = Probability.getInvocationPercent(itemTargetInfo.unit, stateInvocation.getInvocationType(), stateInvocation.getInvocationValue())
	var ACC = Math.round(BaseHit + (RealBonus.getMag(itemTargetInfo.unit)*5)+RealBonus.getSki(itemTargetInfo.unit) - (RealBonus.getMdf(itemTargetInfo.targetUnit)*5) - DIST*2);
	this._dynamicEvent = createObject(DynamicEvent);
	generator = this._dynamicEvent.acquireEventGenerator();
	if (itemTargetInfo.item.isWand()){
		var randInt = Math.round(Math.random()*101)
		root.log(randInt)
		root.log(ACC)
		if (randInt < ACC){
			StateControl.arrangeState(itemTargetInfo.targetUnit,info.getStateInvocation().getState(),IncreaseType.INCREASE);
		}
		else{
			var anime = root.queryAnime("fire");
			generator.damageHitEx(itemTargetInfo.targetUnit, anime,-1, DamageType.PHYSICAL, -1, itemTargetInfo.unit, itemUseParent.isItemSkipMode());
		}
	}
	else{
		generator.unitStateAddition(itemTargetInfo.targetUnit, info.getStateInvocation(), IncreaseType.INCREASE, itemTargetInfo.unit, itemUseParent.isItemSkipMode());
	}
	
	return this._dynamicEvent.executeDynamicEvent();
};
StateItemPotency.setPosMenuData = function(unit, item, targetUnit) {
	var stateInvocation = item.getStateInfo().getStateInvocation();
	var state = stateInvocation.getState();
	var X1, Y1, X2, Y2;
	X1 = unit.getMapX();
	Y1 = unit.getMapY();
	X2 = targetUnit.getMapX();
	Y2 = targetUnit.getMapY();
	var DIST = Math.abs((X1+Y1)-(X2+Y2))
	var BaseHit = Probability.getInvocationPercent(unit, stateInvocation.getInvocationType(), stateInvocation.getInvocationValue())
	var ACC = Math.min(100,Math.round(BaseHit + (RealBonus.getMag(unit)*5)+RealBonus.getSki(unit) - (RealBonus.getMdf(targetUnit)*5) - DIST*2));
	if (StateControl.isStateBlocked(targetUnit, unit, state)) {
		this._value = 0;
	}
	else {
		if (item.isWand()){
			if (ACC > 0){
				this._value = ACC;
			}
			else{
				this._value = 0;
			}
		}
		else{
			this._value = Probability.getInvocationPercent(unit, stateInvocation.getInvocationType(), stateInvocation.getInvocationValue());
		}
	}
};
StateItemInfo._drawValue = function(x, y) {
	var stateInvocation = this._item.getStateInfo().getStateInvocation();
	var state = stateInvocation.getState();
	var text = InvocationRenderer.getInvocationText(stateInvocation.getInvocationValue(), stateInvocation.getInvocationType());
	var textui = this.getWindowTextUI();
	var color = textui.getColor();
	var font = textui.getFont();
	TextRenderer.drawKeywordText(x, y, state.getName(), -1, color, font);
};