/*
Welcome to the revised "damage formula by weapon type" script.
This script requires no internal editing and incorporates the
concept of Goinza's "damage formula by specific weapon" script.
To use, assign custom parameters to the weapon or weapon type as
seen below, and remember that weapon formula trumps weapon type
formula:

{
	FormulaCL:
	{
		Stats:[1,3],
		Percents:[0.5,0.5]
	}
}

The stats are an array of Parameter IDs. The Percents are decimal
represented amounts of the stat in question. In the example above,
I am using 50% Strength and 50% Skill. The IDs are below:

Max HP: 		0
Strength: 		1
Magic: 			2
Skill: 			3
Speed: 			4
Luck: 		  	5
Defense: 		6
Resistance:		7
Movement: 		8
Weapon Level:	9
Build: 			10

Presumably if you assign a new parameter with a custom ID through a
script, it would work with this plugin. But I can't guarantee that.
Lastly, if you wish for a weapon to not use its weapon type formula,
but to use the vanilla 100% Strength or 100% Magic formula, you may
give it the custom parameter "{VanillaFormulaCL:true}", and it will
ignore the weapon type's parameters.
Enjoy the script!
-Rogue Claris, Retired Scripter, 9/23/2020
*/

var WeaponTypeDamage = AbilityCalculator.getPower;
AbilityCalculator.getPower = function(unit, weapon){
	var pow = WeaponTypeDamage.call(this, unit, weapon);
	var Equipped = ItemControl.getEquippedWeapon(unit).getWeaponType()
	var obj = Equipped.custom.FormulaCL
	var obj2 = weapon.custom.FormulaCL
	var stat, i, percent;
	if (weapon.custom.VanillaFormulaCL){
		return pow;
	}
	if (typeof obj2 === 'object'){
		pow = 0;
		for (i = 0; i < obj.Stats.length; i++){
			stat = ParamGroup.getLastValue(unit, obj.Stats[i], weapon)
			percent = obj.Percents[i]
			pow += Math.round(stat*percent)
		}
	}
	else if (typeof obj === 'object'){
		pow = 0;
		for (i = 0; i < obj.Stats.length; i++){
			stat = ParamGroup.getLastValue(unit, obj.Stats[i], weapon)
			percent = obj.Percents[i]
			pow += Math.round(stat*percent)
		}
	}
	return pow;
}