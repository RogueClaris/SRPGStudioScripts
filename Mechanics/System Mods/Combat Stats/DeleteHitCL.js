/*
Welcome to DeleteHitCL.js - a plugin designed to be used with
Sure Attack skills to place static accuracy on a weapon.

Simply apply the following custom parameter to your weapon:

{
	DeleteHitCL:true
}

This will cause the hit to show up as a pair of dashes,
thus indicating that the weapon has no hitrate. Then, with
a Sure Attack skill guaranteeing a hit and a description on
the weapon explaining how it works, tada! You can make things
like an earthquake spell that only hits groundbound opponents.
To do that, create a Sure Attack Skill with 100% activation,
don't display on activation, and mismatch the Class Type "Flying".
Then slap that skill on the weapon!

Enjoy the script!
*/
var NoTremorFlyingCL = HitCalculator.calculateSingleHit;
HitCalculator.calculateSingleHit = function(active, passive, weapon, totalStatus){
	var result = NoTremorFlyingCL.call(this, active, passive, weapon, totalStatus);
	if (weapon.custom.DeleteHitCL){
		return;
	}
	return result;
}