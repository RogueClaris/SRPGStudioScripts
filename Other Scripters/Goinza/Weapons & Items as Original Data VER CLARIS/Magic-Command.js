UnitCommand.HealMagicCL = defineObject(UnitCommand.Item,
{
	getCommandName: function(){
		return "Support Magic" //change this to change the name
	},
	
	isCommandDisplayable: function() {
		var unit = this.getCommandTarget();
		var supportSpells = MagicAttackControl.getSupportSpells(unit);
		return supportSpells.length>0;
	},
	
	_prepareCommandMemberData: function() {
		this._itemUse = null;
		this._itemSelection = null;
		this._itemSelectMenu = createObject(SupportSpellMenu);
	}
}
);

UnitCommand.HarmMagicCL = defineObject(UnitCommand.Item,
{
	getCommandName: function(){
		return "Attack Magic" //change this to change the name
	},
	
	isCommandDisplayable: function() {
		var unit = this.getCommandTarget();
		var attackSpells = MagicAttackControl.getAttackSpells(unit);
		return attackSpells.length>0
	},
	
	_prepareCommandMemberData: function() {
		this._itemUse = null;
		this._itemSelection = null;
		this._itemSelectMenu = createObject(AttackSpellMenu);
	}
}
);



var GoinzaMagicPlusCL0 = UnitCommand.configureCommands;
UnitCommand.configureCommands = function(groupArray){
	GoinzaMagicPlusCL0.call(this, groupArray);
	var i = 0;
	var found = false;
	while (i < groupArray.length && !found){
		found = groupArray[i].getCommandName() === root.queryCommand("attack_unitcommand")
		i++
	}
	groupArray.insertObject(UnitCommand.HarmMagicCL, i)
	groupArray.insertObject(UnitCommand.HealMagicCL, i+1)
};

var AttackSpellWindowCL = defineObject(ItemListWindow,
{
	initialize: function() {
		this._scrollbar = createScrollbarObject(AttackSpellScrollbarCL, this);
	}
}
);

var AttackSpellScrollbarCL = defineObject(ItemListScrollbar,
{
	setUnitItemFormation: function(unit) {
		var i, item;
		var maxCount = DataConfig.getMaxUnitItemCount();
		var arr = MagicAttackControl.getAttackSpells(unit);
		this._unit = unit;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			item = arr[i]
			if (item != null) {
				this.objectSet(item);
			}
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
	}
}
);

var SupportSpellWindowCL = defineObject(ItemListWindow,
{
	initialize: function() {
		this._scrollbar = createScrollbarObject(SupportSpellScrollbarCL, this);
	}
}
);

var SupportSpellScrollbarCL = defineObject(ItemListScrollbar,
{
	setUnitItemFormation: function(unit) {
		var i, item;
		var maxCount = DataConfig.getMaxUnitItemCount();
		var arr = MagicAttackControl.getSupportSpells(unit);
		this._unit = unit;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			item = arr[i]
			if (item != null) {
				this.objectSet(item);
			}
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
	}
}
);

var SupportSpellMenu = defineObject(ItemSelectMenu,
{
	setMenuTarget: function(unit) {
		this._unit = unit;
		
		this._itemListWindow = createWindowObject(SupportSpellWindowCL, this);
		this._itemInfoWindow = createWindowObject(ItemInfoWindow, this);
		this._itemWorkWindow = createWindowObject(ItemWorkWindow, this);
		this._discardManager = createObject(DiscardManager);
		
		this._itemWorkWindow.setupItemWorkWindow();
		
		this._resetItemList();
		
		this._processMode(ItemSelectMenuMode.ITEMSELECT);
	}
}
);

var AttackSpellMenu = defineObject(ItemSelectMenu,
{
	setMenuTarget: function(unit) {
		this._unit = unit;
		
		this._itemListWindow = createWindowObject(AttackSpellWindowCL, this);
		this._itemInfoWindow = createWindowObject(ItemInfoWindow, this);
		this._itemWorkWindow = createWindowObject(ItemWorkWindow, this);
		this._discardManager = createObject(DiscardManager);
		
		this._itemWorkWindow.setupItemWorkWindow();
		
		this._resetItemList();
		
		this._processMode(ItemSelectMenuMode.ITEMSELECT);
	}
}
);