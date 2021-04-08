//Edit the marked line below to change the speed of charchip animations.
//14 is the default speed. Lower numbers are faster. Higher numbers are slower.
//Do not go below 0 or it will bug out and freeze periodically.
//7 is the recommended high speed setting.
//Likewise, 21 is the recommended low speed setting.

UnitCounter.initialize = function() {
	this._counter = createObject(CycleCounter);
	this._counter.setCounterInfo(21); //Edit the 21.
	this._counter.disableGameAcceleration();
	
	// Process for character chip which is consisted of 2 columns, not 3 columns.
	this._counter2 = createObject(CycleCounter);
	this._counter2.setCounterInfo(34);
	this._counter2.disableGameAcceleration();
};