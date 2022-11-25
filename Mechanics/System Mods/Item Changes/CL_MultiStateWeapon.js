/*
	On any weapon which already inflicts an optional state, add the custom parameter to the weapon like so:

	{
		MultiStateList:[0,1,2,3]
	}

	This will inflict states with IDs 0, 1, 2, and 3 as well when the weapon inflicts its usual state.

	All states will share a universal infliction rate and the weapon is required to already inflict a state.

	However, if you want your weapon's states to have individual shots at activating even though they're bound to
	the same activation chance set on the weapon - for example, a 30% chance for every state individually - you can
	add the custom parameter IndividualStateProc:true

	This will disregard if the original state is inflicted and inflict each state independent of it on the same chance
	set for that state.
*/

var CL_MultiStateWeapon01 = AttackEvaluator.HitCritical._checkStateAttack
AttackEvaluator.HitCritical._checkStateAttack = function (virtualActive, virtualPassive, attackEntry) {
	CL_MultiStateWeapon01.call(this, virtualActive, virtualPassive, attackEntry);
	var weapon = virtualActive.weapon;
	//only inflict if the weapon already inflicted a status; hacky way of checking if weapon option state inflicted itself
	if (typeof weapon.custom.MultiStateList === "object") {
		var i, state;
		var stateList = root.getBaseData().getStateList();
		var list = weapon.custom.MultiStateList;
		for (i = 0; i < list.length; ++i) {
			state = stateList.getDataFromId(list[i]);
			if ((attackEntry.stateArrayPassive.length > 0 && !weapon.custom.IndividualStateProc || StateControl.checkStateInvocation(virtualActive.unitSelf, virtualPassive.unitSelf, weapon) && weapon.custom.IndividualStateProc === true)) {
				attackEntry.stateArrayPassive.push(state);
				virtualPassive.stateArray.push(state);
			}
		}
	}
}

var CL_MultiStateWeapon02 = ItemSentence.AdditionState.getItemSentenceCount;
ItemSentence.AdditionState.getItemSentenceCount = function (item) {
	var result = CL_MultiStateWeapon02.call(this, item);
	if (typeof item.custom.MultiStateList === "object") {
		result += item.custom.MultiStateList.length;
	}
	return result
};


var CL_MultiStateWeapon03 = ItemSentence.AdditionState._isState;
ItemSentence.AdditionState._isState = function (item) {
	var result = CL_MultiStateWeapon03.call(this, item);
	if (!result && typeof item.custom.MultiStateList === "object") {
		result = true;
	}
	return result;
};

var CL_MultiStateWeapon04 = ItemSentence.AdditionState.drawItemSentence;
ItemSentence.AdditionState.drawItemSentence = function (x, y, item) {
	CL_MultiStateWeapon04.call(this, x, y, item);
	if (!this._isState(item)) {
		return;
	}
	x += ItemInfoRenderer.getSpaceX();
	if (typeof item.custom.MultiStateList === "object") {
		var stateInvocation = item.getStateInvocation();
		text = InvocationRenderer.getInvocationText(stateInvocation.getInvocationValue(), stateInvocation.getInvocationType());
		var textui = root.queryTextUI('default_window');
		var color = textui.getColor();
		var font = textui.getFont();
		var i, state;
		var stateList = root.getBaseData().getStateList();
		var list = item.custom.MultiStateList;
		for (i = 0; i < list.length; ++i) {
			y += 25
			state = stateList.getDataFromId(list[i]);
			TextRenderer.drawKeywordText(x, y, state.getName() + " " + text, -1, color, font);
		}
	}
};