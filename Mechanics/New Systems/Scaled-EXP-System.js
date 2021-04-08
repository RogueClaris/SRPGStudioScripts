/*
Hello and welcome to the Scaled EXP System plug-in!
To use, go to the Database, to the config tab, and
select "Script". Then, tab to "Global", and enter
the following information:

{EXPBaseCL:100, ScalePerLvCL:1.5}

Play with the curve until levelups cost as much
exp as you would like for them to cost.

Thanks for using my plugins!
-Rogue Claris, November 4th, 2020
*/
ExperienceCalculator._getNormalValue = function(data) {
	var baseExp = 8;
	var exp = this._getExperience(data, baseExp);
	var Level = data.active.getLv()
	var Scaling = root.getMetaSession().global.ScalePerLvCL
	exp = Math.round(exp*(Scaling * (Level-1)))
	return this._getValidExperience(exp);
};

ExperienceCalculator._getVictoryExperience = function(data) {
	var exp;
	var baseExp = this._getBaseExperience();
	var bonusExp = data.passive.getClass().getBonusExp();
	var Level = data.active.getLv()
	var Scaling = root.getMetaSession().global.ScalePerLvCL
	// If "Optional Exp" of the class is minus, don't obtain the exp when winning.
	// Because this is supposed to beat a leader on the final map.
	if (bonusExp < 0) {
		return 0;
	}
	
	// If the game option "Get optional exp of class when enemy is killed" is enabled, return "Optional Exp" of the class.
	if (DataConfig.isFixedExperience()) {
		return this._getValidExperience(bonusExp + this._getBonusExperience(data.passive));
	}
	
	exp = this._getExperience(data, baseExp);
	
	// If the opponent is a leader or a sub-leader, add the exp.
	exp += this._getBonusExperience(data.passive);
	
	// Add "Optional Exp" of the opponent class.
	exp += bonusExp;
	exp = Math.round(exp*(Scaling * (Level-1)))
	return this._getValidExperience(exp)
};

ExperienceCalculator._getNoDamageExperience = function(data) {
	var baseExp = Math.ceil(this._getBaseExperience()*0.25);
	var exp = this._getExperience(data, baseExp);
	
	return exp;
};

ExperienceCalculator.getBestExperience = function(unit, exp) {
	var Level = unit.getLv()
	var Scaling = root.getMetaSession().global.ScalePerLvCL
	var base = root.getMetaSession().global.EXPBaseCL
	var baselineExp = Math.max(base, Math.round(base*((Level-1)*(Scaling))))
	exp = Math.floor(exp * this._getExperienceFactor(unit));
	
	if (exp > baselineExp) {
		exp = baselineExp;
	}
	else if (exp < 0) {
		exp = 0;
	}
	
	return exp;
};

ExperienceControl._addExperience = function(unit, getExp) {
	var exp;
	var Level = unit.getLv()
	var Scaling = root.getMetaSession().global.ScalePerLvCL
	var base = root.getMetaSession().global.EXPBaseCL
	var baselineExp = Math.max(base, Math.round(base*((Level-1)*(Scaling))))
	// Add the current unit exp and the obtain exp.
	exp = unit.getExp()+getExp
	root.log("exp is:" + exp)
	root.log("required exp is:" + baselineExp)
	if (exp >= baselineExp) {
		// If exceed the reference value, 1 level up.
		unit.setLv(unit.getLv() + 1);
		if (unit.getLv() >= Miscellaneous.getMaxLv(unit)) {
			// If reached maximum level, the exp is 0.
			exp = 0;
		}
		else {
			// Exp falls less than the maximum exp by subtracting the maximum exp.
			exp -= baselineExp;
		}
		
		unit.setExp(exp);
	}
	else {
		unit.setExp(exp);
		
		// If no level up, return false.
		return false;
	}
	
	return true;
};

BonusInputWindow.setUnit = function(unit) {
	var bonus = root.getMetaSession().getBonus();
	var Level = unit.getLv()
	var Scaling = root.getMetaSession().global.ScalePerLvCL
	var base = root.getMetaSession().global.EXPBaseCL
	var Mini = Math.max(base, Math.round(base*((Level-1)*(Scaling))))
	
	this._unit = unit;
	this._isMaxLv = unit.getLv() === Miscellaneous.getMaxLv(unit);
	
	if (this._isExperienceValueAvailable()) {
		// At a rate of 10 with 500 bonus, a maximum of 50 Exp can be gained.
		this._max = Math.floor(bonus / this._getRate());
		if (this._max > Mini) {
			this._max = Mini;
		}
		
		this._exp = 1;
		this.changeCycleMode(BonusInputWindowMode.INPUT);
	}
	else {
		this._exp = -1;
		this.changeCycleMode(BonusInputWindowMode.NONE);
	}
};

LevelupUnitScrollbar._isCursorDisplayable = function(object) {
	var Level = object.getLv()
	var Scaling = root.getMetaSession().global.ScalePerLvCL
	var Scaling2 = Scaling /= Math.pow(Scaling, 1)
	var base = root.getMetaSession().global.EXPBaseCL
	var mini = Math.max(base, Math.round(base*((Level-1)*(Scaling))))
	return object.getExp() >= Math.floor(mini*0.9);
};

var FixCycleMaxCL0 = ExperienceNumberView.setExperienceNumberData;
ExperienceNumberView.setExperienceNumberData = function(unit, exp) {
	var max;
	var Level = unit.getLv()
	var Scaling = root.getMetaSession().global.ScalePerLvCL
	var base = root.getMetaSession().global.EXPBaseCL
	var baselineExp = Math.max(base, Math.round(base*((Level-1)*(Scaling))))
		
	if (exp === 1) {
		// Even if the obtained exp is 1, play the sound.
		max = 0;
	}
	else {
		max = 2;
	}
	
	this._unit = unit;
	this._exp = exp;
	
	this._balancer = createObject(SimpleBalancer);
	this._balancer.setBalancerInfo(0, baselineExp);
	this._balancer.setBalancerSpeed(10);
	this._balancer.startBalancerMove(exp);
	
	this._counter = createObject(CycleCounter);
	this._counter.setCounterInfo(max);
	this.changeCycleMode(ExperienceNumberMode.COUNT);
};