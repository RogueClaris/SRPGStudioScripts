var RC1 = Calculator.calculateRoundCount;
Calculator.calculateRoundCount = function(active, passive, weapon) {
	var RoundCount = RC1.call(this,active,passive,weapon);
	if (weapon.custom.single){
		RoundCount = 1;
	}
	return RoundCount;
};