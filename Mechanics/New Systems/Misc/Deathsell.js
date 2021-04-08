ImportantItemFlowEntry._checkImportantItem = function(unit, generator) {
	var i, item;
	var count = UnitItemControl.getPossessionItemCount(unit);
	var isDataAdd = false;
	var isSkipMode = true;
	
	// If the player unit is dead, check if the unit has important items.
	// The reason is if losing important items, there is a possibility that the game cannot be completed.
	// So if having important items, add them into a stock.
	for (i = 0; i < count; i++) {
		item = UnitItemControl.getItem(unit, i);
		// Check if items are important items.
		if (item !== null && item.isImportance()) {
			// Send it to the stock only if it's not prohibited to trade.
			// Otherwise, the trade is satisfied through the items which have been set to the stock.
			if (!item.isTradeDisabled()) {
				isDataAdd = true;
				generator.stockItemChange(item, IncreaseType.INCREASE, isSkipMode);
				generator.unitItemChange(unit, item, IncreaseType.DECREASE, isSkipMode);
			}
		}
		else if (item !== null && !item.isImportance()){
			var gold;
			var max = DataConfig.getMaxGold();
			
			gold = root.getMetaSession().getGold();
			//gold += root.getEventCommandObject().getGold();
			var itemValue = item.getGold();
			if (item.maxUses === 0){
				gold += Math.round(itemValue/2);
			}
			if (item.isWeapon() && item.getLimitMax() === 0){
				gold += Math.round(itemValue/2);
			}
			else{
				gold += Math.round(itemValue*(item.getLimit() / item.getLimitMax())/2);
			}
			if (gold < 0) {
				gold = 0;
			}
			else if (gold > max) {
				gold = max;
			}
			
			root.getMetaSession().setGold(gold);
		}
	}
	
	return isDataAdd;
};