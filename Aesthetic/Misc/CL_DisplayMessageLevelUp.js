/*
Original Proof of Concept by RogueClaris.
Plugin rewritten by SapphireSoft.
Further edited by RogueClaris.

Use the following custom parameters to add quotes to units upon level up:

{
	NoGainMessageCL:"This message will show when you gain no stats by default.",
	BadGainMessageCL:"This message will show when you gain 1 to 2 stats by default.",
	NormalGainMessageCL:"This message will show when you gain 3 to 4 stats by default.",
	GoodGainMessageCL:"This message will show when you gain 5 to 6 stats by default.",
	BestGainMessageCL:"This message will show when you gain 7 or more stats by default."
}

To edit the amount of stats required for each message to show up, you may set the DefaultParameterCountCL
found below.

Please note that the above global parameters are completely optional, and that the "no gain" amount of 0
cannot be changed.

Additionally, your unit will now use different facial expressions to express their feelings about
how they feel about their parameter gains. If you do NOT want a unit to show their feelings, use
the following custom parameter on them:

{
	ExpressionListCL:false
}

Otherwise, if you wish to give them custom expressions different than the default that we have chosen, use this:

{
	ExpressionListCL:[4,7,9,5,3]
}

This example gives you Disgust for the worst outcome,
Anger for a bad outcome, Embarrassed for a normal outcome,
Thinking for a good outcome, and Confused for the best outcome.

Please credit me as RogueClaris if you use this plugin.
Please credit SapphireSoft for rewriting the plugin's proof of concept and for bugfixing it.
Thank you.

=October 4th, 2022, near noon=
Plugin updated to support facial expression changes.

=October 3rd, 2021, early morning hours=
Plugin released.

*/

(function () {

	var DefaultParameterCountCL = {
		Bad: 1,
		Normal: 3,
		Good: 5,
		Best: 7
	}

	var DefaultExpressionList = [11, 8, 0, 1, 2];

	var alias1 = LevelupView._pushFlowEntries;
	LevelupView._pushFlowEntries = function (straightFlow) {
		alias1.call(this, straightFlow);

		straightFlow.pushFlowEntry(LevelUpMessageCL0);
	};


	var LevelUpMessageCL0 = defineObject(BaseFlowEntry,
		{
			_dynamicEvent: null,

			enterFlowEntry: function (levelupViewParam) {
				this._targetUnit = levelupViewParam.targetUnit;
				this._dynamicEvent = createObject(DynamicEvent);

				var gen = this._dynamicEvent.acquireEventGenerator();

				if (levelupViewParam.targetUnit.custom.ExpressionListCL == false) {
					gen.messageShowUnit(this.getRelevantLevelUpMessage(), MessagePos.BOTTOM, this._targetUnit);
				}
				else {
					gen.messageShowUnitEx(this.getRelevantLevelUpMessage(), MessagePos.BOTTOM, this.getRelevantExpression(levelupViewParam.targetUnit), this._targetUnit);
				}
				gen.messageErase(false, false, true)

				return this._dynamicEvent.executeDynamicEvent();
			},

			moveFlowEntry: function () {
				return this._dynamicEvent.moveDynamicEvent();
			},



			getRelevantLevelUpMessage: function () {
				//Backwards compatibility with an old version of the script.
				//You used to have to set global parameters - you do not anymore.
				//But we do not disable that functionality!
				var BadCount = typeof root.getMetaSession().global.BadLevelCountCL === 'number' ? root.getMetaSession().global.BadLevelCountCL : DefaultParameterCountCL.Bad
				var NormalCount = typeof root.getMetaSession().global.NormalLevelCountCL === 'number' ? root.getMetaSession().global.NormalLevelCountCL : DefaultParameterCountCL.Normal
				var GoodCount = typeof root.getMetaSession().global.GoodLevelCountCL === 'number' ? root.getMetaSession().global.GoodLevelCountCL : DefaultParameterCountCL.Good
				var BestCount = typeof root.getMetaSession().global.BestLevelCountCL === 'number' ? root.getMetaSession().global.BestLevelCountCL : DefaultParameterCountCL.Best

				var returnString = typeof this._targetUnit.custom.NoGainMessageCL === "string" ? this._targetUnit.custom.NoGainMessageCL : "..."

				if (this._targetUnit.custom.GrowthArraySizeCL >= BadCount) {
					returnString = typeof this._targetUnit.custom.BadGainMessageCL === "string" ? this._targetUnit.custom.BadGainMessageCL : "Could be worse. Not by much, though."
				}
				if (this._targetUnit.custom.GrowthArraySizeCL >= NormalCount) {
					returnString = typeof this._targetUnit.custom.NormalGainMessageCL === "string" ? this._targetUnit.custom.NormalGainMessageCL : "Getting stronger all the time!"
				}
				if (this._targetUnit.custom.GrowthArraySizeCL >= GoodCount) {
					returnString = typeof this._targetUnit.custom.GoodGainMessageCL === "string" ? this._targetUnit.custom.GoodGainMessageCL : "That's what I'm talking about!!"
				}
				if (this._targetUnit.custom.GrowthArraySizeCL >= BestCount) {
					returnString = typeof this._targetUnit.custom.BestGainMessageCL === "string" ? this._targetUnit.custom.BestGainMessageCL : "I never knew I had it in me...!"
				}
				return returnString;
			},

			getRelevantExpression: function (unit) {
				//define the counts used.
				var BadCount = typeof root.getMetaSession().global.BadLevelCountCL === 'number' ? root.getMetaSession().global.BadLevelCountCL : DefaultParameterCountCL.Bad
				var NormalCount = typeof root.getMetaSession().global.NormalLevelCountCL === 'number' ? root.getMetaSession().global.NormalLevelCountCL : DefaultParameterCountCL.Normal
				var GoodCount = typeof root.getMetaSession().global.GoodLevelCountCL === 'number' ? root.getMetaSession().global.GoodLevelCountCL : DefaultParameterCountCL.Good
				var BestCount = typeof root.getMetaSession().global.BestLevelCountCL === 'number' ? root.getMetaSession().global.BestLevelCountCL : DefaultParameterCountCL.Best

				var useList = DefaultExpressionList;
				if (typeof unit.custom.ExpressionListCL === "object") {
					useList = unit.custom.ExpressionListCL;
				}

				//Use the zeroth listed expression for the worst outcome.
				//Default: ID 11, Eyes Closed expression.
				var returnExpressionId = useList[0];

				//Use the first listed expression for the bad outcome.
				//Default: ID 8, Sad face.
				if (this._targetUnit.custom.GrowthArraySizeCL >= BadCount) {
					returnExpressionId = useList[1];
				}

				//Use the second listed expression for the normal outcome.
				//Default: ID 0, Normal face.
				if (this._targetUnit.custom.GrowthArraySizeCL >= NormalCount) {
					returnExpressionId = useList[2];
				}

				//Use the third listed expression for the good outcome.
				//Default: ID 1, Smiling face.
				if (this._targetUnit.custom.GrowthArraySizeCL >= GoodCount) {
					returnExpressionId = useList[3];
				}

				//Use the fourth listed expression for the best outcome.
				//Default: ID 2, Passionate face.
				if (this._targetUnit.custom.GrowthArraySizeCL >= BestCount) {
					returnExpressionId = useList[4];
				}

				delete this._targetUnit.custom.GrowthArraySizeCL;

				return returnExpressionId
			}

		});

	var LevelUpMessageCL1 = ExperienceControl._createGrowthArray;
	ExperienceControl._createGrowthArray = function (unit) {
		var result = LevelUpMessageCL1.call(this, unit);
		var count = 0;
		for (var i = 0; i < result.length; ++i) {
			if (result[i] > 0) {
				count++;
			}
		}
		unit.custom.GrowthArraySizeCL = count;
		return result;
	}
})();