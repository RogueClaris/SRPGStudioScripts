/*
Hello and welcome to the Twin-Item Alchemy Plugin!
To use this plugin, you will be making use of a new menu,
as well as the AlchemyControl object.

In order to generate a usable recipe, you must follow these steps:

-Create a new script-running event or standalone plugin. I'm willing to make the latter for you if you ask politely!
--To do the former, make a new event command and select "Execute Script". Change it from "Call Event Command" to "Execute Code",
--and follow my example below:

var item1 = root.getBaseData().getWeaponList().getData(0)
var item2 = root.getBaseData().getItemList().getData(3)
var product = root.getBaseData().getWeaponList().getData(7)
var name = "Flare Blade"

AlchemyControl._generateRecipe(item1,item2,product,name)

--Tada! You just created the recipe "Flare Blade"! You can delete it later by running this command:

AlchemyControl._deleteRecipeFromName("Flare Blade")

--And if you know what you're doing, you can write custom commands to call it using this command:

AlchemyControl._getRecipeFromName("Flare Blade")

-Once you've done all you want to do with that, make sure the recipe is available, and obtain both items you set on one unit.
--Go to your Base, and use the Alchemy window to select the items IN THE PROPER ORDER! They are not interchangeable.
--Pump your way through the menus and enjoy your newly transmuted item!!

Enjoy the Script!
-Lady Rena, 8/12/2019
*/

var ALCH001 = MarshalCommandWindow._configureMarshalItem;
MarshalCommandWindow._configureMarshalItem = function(groupArray) {
	ALCH001.call(this, groupArray);
	groupArray.appendObject(MarshalCommand.Alchemy);
};

var Recipe = defineObject(BaseObject,
{
	Name: null,
	Ingredient1: null,
	Ingredient2: null,
	Output: null
}
);

var AlchemyControl = {

	_recipeList: null,

	_initialize: function(){
		if (this._recipeList == null){
			this._recipeList = []
		}
		if (root.getMetaSession().global.AlchemyList == null){
			root.getMetaSession().global.AlchemyList = []
		}
		else{
			this._recipeList = root.getMetaSession().global.AlchemyList;
		}
	},

	_generateRecipe: function(Item1, Item2, Product, RecipeName){
		Recipe = createObject(Recipe)
		Recipe.Ingredient1 = Item1
		Recipe.Ingredient2 = Item2
		Recipe.Output = Product
		Recipe.Name = RecipeName
		this._recipeList.push(Recipe)
		root.getMetaSession().global.AlchemyList.push(Recipe)
	},

	_getRecipeFromName: function(RecipeName){
		if (typeof RecipeName !== 'string'){
			return null;
		}
		var i;
		if (this._recipeList == null){
			this._recipeList = root.getMetaSession().global.AlchemyList;
		}
		for (i = 0; this._recipeList.length; i++){
			if (this._recipeList[i].Name === RecipeName){
				return this._recipeList[i];
			}
		}
	},

	_deleteRecipeFromName: function(RecipeName){
		if (typeof RecipeName !== 'string'){
			return;
		}
		var i;
		if (this._recipeList == null){
			this._recipeList = root.getMetaSession().global.AlchemyList;
		}
		for (i = 0;this._recipeList.length;i++){
			if (this._recipeList[i].Name === RecipeName){
				this._recipeList.splice(i,1)
			}
		}
	},

	_getRecipeFromIngredients: function(Ing1, Ing2){
		var i = 0;
		if (this._recipeList == null){
			this._recipeList = root.getMetaSession().global.AlchemyList;
		}
		for (i = 0; i < this._recipeList.length; i++){
			if (this._recipeList[i].Ingredient1.getName() === Ing1.getName() && this._recipeList[i].Ingredient2.getName() === Ing2.getName()){
				return this._recipeList[i];
			}
		}
		return null;
	}
};

MarshalCommand.Alchemy = defineObject(MarshalBaseCommand, {

	_alchemyScreen: null,

	openCommand: function() {
		this._unitSelectWindow.setActive(true);
		this._unitSelectWindow.setSingleMode();
		this._setSelectableArray();
	},

	checkCommand: function() {
		var screenParam = this._createScreenParam();

		if (screenParam.unit === null) {
			MediaControl.soundDirect('operationblock');
			return false;
		}

		this._alchemyScreen = createObject(AlchemyScreen);
		SceneManager.addScreen(this._alchemyScreen, screenParam);

		return true;
	},

	isMarshalScreenCloesed: function() {
		return SceneManager.isScreenClosed(this._alchemyScreen);
	},

	getInfoWindowType: function() {
		return MarshalInfoWindowType.ITEM;
	},

	getCommandName: function() {
		return "Alchemy";
	},

	getMarshalDescription: function() {
		return "Transmute items in to new ones.";
	},

	notifyScreenClosed: function() {
		this._parentMarshalScreen.updateUnitList();
	},

	_setSelectableArray: function() {
		var i, unit, classEntryArray;
		var list = this._parentMarshalScreen.getUnitList();
		var count = list.getCount();
		var arr = [];

		var j, found, item;

		for (i = 0;i < count;i++) {
			unit = list.getData(i);
			j = 0;
			found = false;
			while (unit.getItem(j) && !found) {
				item = unit.getItem(j);
				found = item !== null
				j++;
			}
			arr.push(found);
		}

		this._unitSelectWindow.getChildScrollbar().setSelectableArray(arr);
	},

	_createScreenParam: function() {
		var screenParam = ScreenBuilder.buildItemUse();

		screenParam.unit = this._unitSelectWindow.getFirstUnit();

		if (screenParam.unit!=null) {
			var j = 0;
			var found = false;
			var item;
			while (screenParam.unit.getItem(j)!=null && !found) {
				item = screenParam.unit.getItem(j);
				found = item !== null
				j++;
			}
			if (!found) {
				screenParam.unit = null;
			}
		}

		return screenParam;
	}
});

var AlchemyMode = {
	SELECT1: 0,
	SELECT2: 1,
	DISPLAY: 2
};

var AlchemyScreen = defineObject(BaseScreen, {

	_unit: null,
	_itemListWindow: null,
	_itemInfoWindow: null,
	_alchemyWindow: null,
	_aqw: null,

	setScreenData: function(screenParam) {
		this._unit = screenParam.unit;
		
		this._itemListWindow = createWindowObject(ItemListWindow);
		this._itemListWindow.setItemFormation(5);
		this._itemListWindow.setUnitItemFormation(this._unit);
		this._itemListWindow.enableSelectCursor(true);
		
		this._itemInfoWindow = createWindowObject(ItemInfoWindow);
		
		this._alchemyWindow = createWindowObject(AlchemyWindow);
		
		this._aqw = createWindowObject(AlchemyQuestionWindow);
		
		this.changeCycleMode(AlchemyMode.SELECT1);
	},

	moveScreenCycle: function() {
		var result = MoveResult.CONTINUE;
		var input;
		var Dynamo = createObject(DynamicEvent)
		var Generator = Dynamo.acquireEventGenerator()
		if (this.getCycleMode() === AlchemyMode.SELECT1){
			input = this._itemListWindow.moveWindow();
			if (input === ScrollbarInput.SELECT){
				this._alchemyWindow.setFirstIngredient(this._itemListWindow.getCurrentItem())
				this._itemListWindow._scrollbar.cut(this._itemListWindow._scrollbar.getIndex())
				this.changeCycleMode(AlchemyMode.SELECT2)
			}
			else if (input === ScrollbarInput.CANCEL){
				result = MoveResult.END
			}
		}
		else if (this.getCycleMode() === AlchemyMode.SELECT2){
			input = this._itemListWindow.moveWindow();
			if (input === ScrollbarInput.SELECT){
				this._alchemyWindow.setSecondIngredient(this._itemListWindow.getCurrentItem())
				this._itemListWindow._scrollbar.cut(this._itemListWindow._scrollbar.getIndex())
				this.changeCycleMode(AlchemyMode.DISPLAY)
			}
			else if (input === ScrollbarInput.CANCEL){
				if (this._alchemyWindow._item1 !== null){
					this._alchemyWindow.clearFirstIngredient();
				}
				result = MoveResult.END
			}
		}
		else if (this.getCycleMode() === AlchemyMode.DISPLAY){
			input = this._itemListWindow.moveWindow();
			var Recipe = AlchemyControl._getRecipeFromIngredients(this._alchemyWindow._item1, this._alchemyWindow._item2)
			var item;
			if (Recipe !== null){
				item = root.duplicateItem(Recipe.Output);
				var input2 = this._aqw.moveWindow()
				if (input2 === ScrollbarInput.SELECT){
					Generator.unitItemChange(this._unit,item,IncreaseType.INCREASE,false);
					Generator.unitItemChange(this._unit,this._alchemyWindow._item1,IncreaseType.DECREASE,true)
					Generator.unitItemChange(this._unit,this._alchemyWindow._item2,IncreaseType.DECREASE,true)
					Generator.execute();
					result = MoveResult.END;
				}
				else if (input === ScrollbarInput.CANCEL){
					if (this._alchemyWindow._item1 != null){
						this._alchemyWindow.clearFirstIngredient();
					}
					if (this._alchemyWindow._item2 != null){
						this._alchemyWindow.clearSecondIngredient();
					}
					result = MoveResult.END
				}
			}
			else{
				if (this._alchemyWindow._item1 != null){
					this._alchemyWindow.clearFirstIngredient();
				}
				if (this._alchemyWindow._item2 != null){
					this._alchemyWindow.clearSecondIngredient();
				}
				result = MoveResult.END
			}
		}
		return result;
	},

	drawScreenCycle: function() {
		var x = LayoutControl.getRelativeX(2);
		var y = LayoutControl.getRelativeY(2);
		var dx;
		var dy;
		var input, input2;

		if (this.getCycleMode() === AlchemyMode.SELECT1){
			if (this._itemListWindow.getCurrentItem() != null){
				this._itemListWindow.drawWindow(x,y);
			}
		}
		else if (this.getCycleMode() === AlchemyMode.SELECT2){
			if (this._itemListWindow.getCurrentItem() != null){
				this._itemListWindow.drawWindow(x,y);
			}
		}
		else if (this.getCycleMode() === AlchemyMode.DISPLAY){
			if (this._itemListWindow.getCurrentItem() != null){
				this._itemListWindow.drawWindow(x,y);
			}
			this._alchemyWindow.drawWindow(x-125, y-100)
		}
	}
});

var AlchemyWindow = defineObject(BaseWindow, {

	_item1: null,
	_item2: null,
	_scrollbar: null,

	initialize: function() {
		this._scrollbar = defineObject(AlchemyScrollbar)
	},

	setFirstIngredient: function(item) {
		this._item1 = item;
	},

	clearFirstIngredient: function(){
		this._item1 = null;
	},

	setSecondIngredient: function(item) {
		this._item2 = item;
	},

	clearSecondIngredient: function(){
		this._item2 = null;
	},

	moveWindowContent: function() {
		return MoveResult.CONTINUE;
	},

	drawWindowContent: function(x, y) {
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		if (this._item1 != null){
			ItemRenderer.drawItem(x, y, this._item1, color, font, false);
		}
		if (this._item2 != null){
			ItemRenderer.drawItem(x, y+25, this._item2, color, font, false);
		}
		if (this._item1 != null && this._item2 != null){
			var Recipe = AlchemyControl._getRecipeFromIngredients(this._item1,this._item2);
			if (Recipe != null){
				this._scrollbar.drawDescriptionLine(x,y+5)
				ItemRenderer.drawItem(x, y+50, Recipe.Output, color, font, false);
			}
		}
	},

	getWindowHeight: function() {
		return (ItemRenderer.getItemHeight()*3)+10;
	},

	getWindowWidth: function() {
		return 136*2;
	}

});

var AlchemyScrollbar = defineObject(BaseScrollbar,
{
	drawDescriptionLine: function(x, y) {
		var count;
		var textui = this.getDescriptionTextUI();
		var pic = textui.getUIImage();
		var width = TitleRenderer.getTitlePartsWidth();
		var height = TitleRenderer.getTitlePartsHeight();

		if (pic !== null) {
			TitleRenderer.drawTitle(pic, x - 14, y, width, height, 5);
		}
	}
}
);

var AlchemyQuestionResult = {
	BUY: 0,
	CANCEL: 1,
	ITEMFULL: 2,
	FORCESTOCK: 3,
	NONE: 4
};

var AlchemyQuestionWindow = defineObject(ShopSelectWindow,
{
	moveWindowContent: function() {
		this._createScrollbar();
		var input = this._scrollbar.moveInput();
		var result = AlchemyQuestionResult.NONE;
		
		if (input === ScrollbarInput.SELECT) {
			if (this._scrollbar.getIndex() === 0) {
				if (!this._isSpaceOk()) {
					if (!this._isForceStockOk()) {
						// Purchasing is attempted but the item list was full.
						result = AlchemyQuestionResult.ITEMFULL;
					}
					else {
						// The item list is full, but purchase it by sending it to the stock.
						result = AlchemyQuestionResult.FORCESTOCK;
					}
				}
				else {
					result = AlchemyQuestionResult.BUY;
				}
			}
			else {
				result = AlchemyQuestionResult.CANCEL;
			}
		}
		else if (input === ScrollbarInput.CANCEL) {
			result = AlchemyQuestionResult.CANCEL;
		}
		
		return result;
	},
	
	getSelectTextArray: function() {
		return ["Yes", "No"];
	},
	
	_isSpaceOk: function() {
		var result;
		var unit = AlchemyScreen._unit
		
		if (unit !== null) {
			result = this._isUnitSpaceOk(unit);
		}
		else {
			result = this._isStockSpaceOk();
		}
			
		return result;
	},
	
	_isUnitSpaceOk: function(unit) {
		return UnitItemControl.isUnitItemSpace(unit);
	},
	
	_isStockSpaceOk: function() {
		return StockItemControl.isStockItemSpace();
	},
	
	_isForceStockOk: function() {
		var unit = this.getParentInstance().getVisitor();
		
		if (unit !== null) {
			if (!Miscellaneous.isStockAccess(unit) && root.getCurrentScene() === SceneType.FREE) {
				// If there is no stock as a class option, moreover,
				// if the scene is a SceneType.FREE,
				// decide with isFullItemTransportable if the item can be sent to the stock.
				if (!DataConfig.isFullItemTransportable()) {
					return false;
				}
			}
		}
		
		return this._isStockSpaceOk();
	}
}
);