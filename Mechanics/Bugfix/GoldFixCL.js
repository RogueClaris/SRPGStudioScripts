/*
By default, SapphireSoft's engine includes a feature that should
change all instances of the word "Gold" and "Bonus" to other strings
in your game. However, these features do nothing. They are not called
anywhere in the code. Thusly, I have overwritten several entries of
the String Table with references to the proper commands, that these
entries in the UI may work properly. Plug and play, but with minimal
editing you can change what is displayed. Enjoy!

-RogueClaris
*/

var GoldFixCL0 = SetupControl.setup;
SetupControl.setup = function(){
	GoldFixCL0.call(this);
	StringTable.BattleResult_GetGold = root.queryCommand("gold_currency");
	StringTable.Quest_GetGold = root.queryCommand("gold_currency");
	StringTable.GetTitle_GoldChange = root.queryCommand("gold_currency")+" Get!";
	StringTable.LostTitle_GoldChange = root.queryCommand("gold_currency")+" Lost";
	StringTable.Signal_Gold = root.queryCommand("gold_currency").toUpperCase();
	
	StringTable.Marshal_Bonus = "Trade "+root.queryCommand("bonus_currency")+" for items";
	StringTable.ExperienceDistribution_BonusShortage = root.queryCommand("bonus_currency")+" is missing";
	StringTable.BattleResult_GetBonus = root.queryCommand("bonus_currency");
	StringTable.Quest_GetBonus = root.queryCommand("bonus_currency");
	StringTable.GetTitle_BonusChange = root.queryCommand("bonus_currency")+" Get!"
	StringTable.LostTitle_BonusChange = root.queryCommand("bonus_currency")+" Lost";
	StringTable.Signal_Bonus = root.queryCommand("bonus_currency").toUpperCase();
}