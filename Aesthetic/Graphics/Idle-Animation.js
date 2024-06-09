
(function () {
	var UnitCounterAdjustmentCL0_ThankYouSapphireSoft = SetupControl.setup;
	SetupControl.setup = function () {
		UnitCounterAdjustmentCL0_ThankYouSapphireSoft.call(this);

		root.getCustomizationOptionsManager().setUnitAnimationArray(UnitCounter._getAnimationArray());
	};

	UnitCounter._getAnimationArray = function () {
		// arrays start at zero, so "0" here refers to the first frame
		// of a character chip idle animation.
		return [0, 1, 1, 2, 2, 1, 1];
	};
})();