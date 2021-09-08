/*
Hello and welcome to the Revival Herb plugin!
To create an automatic revival item, simply
create any item with the following custom
parameter:

{
	Revival:true
}

This will then use the item's animation and
filter flag to determine if the item can be
used to revive the unit in question.

Enjoy the plugin!
-Lady Rena, April 10th, 2019
=Plugin History=
April 10th, 2019:
-Original Release
May 19th, 2021:
-Updated to use different animations.
-Updated to allow enemy use.
-Updated to decrease instead of delete the item.

*/

var ReviveControl = defineObject(BaseObject,
{	
	getItemFromUnit: function(unit){
		var count = UnitItemControl.getPossessionItemCount(unit)
		var i, item, temp;
		i = 0;
		item = null
		while (i < count && item === null){
			temp = UnitItemControl.getItem(unit,i)
			if (temp != null && temp.custom.Revival && FilterControl.isBestUnitTypeAllowed(unit.getUnitType(), unit.getUnitType(), temp.getFilterFlag())){
				item = UnitItemControl.getItem(unit,i);
			}
			if (item === null){
				++i
			}
		}
		return item;
	}
}
);

var AlbatrossWingCL0 = DamageEraseFlowEntry.enterFlowEntry;
DamageEraseFlowEntry.enterFlowEntry = function(damageData) {
	var targetUnit = damageData.targetUnit;
	var item = ReviveControl.getItemFromUnit(targetUnit);
	if (item === null){
		return AlbatrossWingCL0.call(this, damageData);
	}
	else{
		var Dynamo = root.getEventGenerator();
		Dynamo.hpRecovery(targetUnit,item.getItemAnime(),ParamBonus.getMhp(targetUnit),RecoveryType.MAX,false)
		Dynamo.execute();
		ItemControl.decreaseItem(targetUnit,item);
	}
	return EnterResult.NOTENTER;
};

var RVHB001 = DamageControl.checkHp;
DamageControl.checkHp = function(active, passive) {
	var hp = passive.getHp();
	var i;
	var item = ReviveControl.getItemFromUnit(passive);
	var Dynamo = root.getEventGenerator()
	
	if (hp > 0) {
		return;
	}
	
	if (item != null){
		Dynamo.hpRecovery(passive,item.getItemAnime(),ParamBonus.getMhp(passive),RecoveryType.MAX,false);
		Dynamo.execute()
		ItemControl.decreaseItem(passive,item);
	}
	else{
		RVHB001.call(this,active,passive);
	}
};