/*
Original Proof of Concept by RogueClaris.
Plugin rewritten by SapphireSoft.
Further edited by RogueClaris.

Use the following custom parameters to add quotes to units upon level up.

{
	NoGainMessageCL:"This message will show when you gain no stats by default.",
	BadGainMessageCL:"This message will show when you gain 1 to 2 stats by default.",
	NormalGainMessageCL:"This message will show when you gain 3 to 4 stats by default.",
	GoodGainMessageCL:"This message will show when you gain 5 to 6 stats by default.",
	BestGainMessageCL:"This message will show when you gain 7 or more stats by default."
}

To edit the amount of stats required for each message to show up, you may set the following global parameters:

{
	BadLevelCountCL:1,
	NormalLevelCountCL:2,
	GoodLevelCountCL:4,
	BestLevelCountCL:6
}

Please note that the above global parameters are completely optional, and that the "no gain" amount of 0
cannot be changed.

Please credit me as RogueClaris if you use this plugin.
Please credit SapphireSoft for rewriting the plugin's proof of concept and for bugfixing it.
Thank you.

=October 3rd, 2021, early morning hours=
Plugin released.


*/

(function() {

var alias1 = LevelupView._pushFlowEntries;
LevelupView._pushFlowEntries = function(straightFlow) {
alias1.call(this, straightFlow);

straightFlow.pushFlowEntry(LevelUpMessageCL0);
};

var LevelUpMessageCL0 = defineObject(BaseFlowEntry,
{
	_dynamicEvent: null,

	enterFlowEntry: function(levelupViewParam) {
	this._targetUnit = levelupViewParam.targetUnit;
	this._dynamicEvent = createObject(DynamicEvent);

	var gen = this._dynamicEvent.acquireEventGenerator();

	gen.messageShowUnit(this.getRelevantLevelUpMessage(), MessagePos.BOTTOM, this._targetUnit);
	gen.messageErase(false, false, true)

	return this._dynamicEvent.executeDynamicEvent();
},

moveFlowEntry: function() {
	return this._dynamicEvent.moveDynamicEvent();
},

getRelevantLevelUpMessage: function(){
	var BadCount = typeof root.getMetaSession().global.BadLevelCountCL === 'number' ? root.getMetaSession().global.BadLevelCountCL : 1
	var NormalCount = typeof root.getMetaSession().global.NormalLevelCountCL === 'number' ? root.getMetaSession().global.NormalLevelCountCL : 3
	var GoodCount = typeof root.getMetaSession().global.GoodLevelCountCL === 'number' ? root.getMetaSession().global.GoodLevelCountCL : 5
	var BestCount = typeof root.getMetaSession().global.BestLevelCountCL === 'number' ? root.getMetaSession().global.BestLevelCountCL : 7
	var CountArr = [BadCount, NormalCount, GoodCount, BestCount];
	
	var returnString = typeof this._targetUnit.custom.NoGainMessageCL === "string" ? this._targetUnit.custom.NoGainMessageCL : "..."
	
	if (this._targetUnit.custom.GrowthArraySizeCL >= BadCount){
		returnString = typeof this._targetUnit.custom.BadGainMessageCL === "string" ? this._targetUnit.custom.BadGainMessageCL : "Could be worse. Not by much, though."
	}
	if (this._targetUnit.custom.GrowthArraySizeCL >= NormalCount){
		returnString = typeof this._targetUnit.custom.NormalGainMessageCL === "string" ? this._targetUnit.custom.NormalGainMessageCL : "Getting stronger all the time!"
	}
	if (this._targetUnit.custom.GrowthArraySizeCL >= GoodCount){
		returnString = typeof this._targetUnit.custom.GoodGainMessageCL === "string" ? this._targetUnit.custom.GoodGainMessageCL : "That's what I'm talking about!!"
	}
	if (this._targetUnit.custom.GrowthArraySizeCL >= BestCount){
		returnString = typeof this._targetUnit.custom.BestGainMessageCL === "string" ? this._targetUnit.custom.BestGainMessageCL : "I never knew I had it in me...!"
	}
	delete this._targetUnit.custom.GrowthArraySizeCL;
	return returnString;
}

});

var LevelUpMessageCL1 = ExperienceControl._createGrowthArray;
ExperienceControl._createGrowthArray = function(unit){
	var result = LevelUpMessageCL1.call(this, unit);
	var count = 0;
	for (var i = 0; i < result.length; ++i){
		if (result[i] > 0){
			count++;
		}
	}
	unit.custom.GrowthArraySizeCL = count;
	return result;
}
})();