(function() {
var HideBonusCL0 = ItemSentence.Bonus.drawItemSentence;
ItemSentence.Bonus.drawItemSentence = function(x, y, item) {
	// if item bonus is hidden by parameter settings,
	if (item.custom.HideBonus){
		// return and do nothing.
		return;
	}
	// otherwise call the original function.
	HideBonusCL0.call(this, x, y, item);
}
var HideBonusCL1 = ItemInfoRenderer.getDopingCount;
ItemInfoRenderer.getDopingCount = function(item, isParameter) {
	// same as above.
	if (item.custom.HideBonus){
		return;
	}
	// except we return the original value here.
	return HideBonusCL1.call(this, item, isParameter);
};

})();
