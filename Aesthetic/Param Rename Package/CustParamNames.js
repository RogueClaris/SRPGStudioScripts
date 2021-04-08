/*
Hello! This script was created to rename stats with custom parameters.
To use it, create the custom parameters like so:
{CustParamName:[["Mag","ReplacementName"]]} - For one parameter.
{CustParamName:[["Mag","ReplacementName"],["Def","Tgh"]]} - For two or more parameters, continue like so. Replace Tgh with any desired name.
The initial name should always be the displayed name of hte stat on the Unit Menu. This should work for any stat, even custom ones.
This Parameter can be applied to either the Unit or the Class, so you can make it sweeping or specific as you see fit.
Thanks for using my plugins, and contact me if you have any issues! -LadyRena
*/
var CPNCL0 = UnitStatusScrollbar._createStatusEntry;
UnitStatusScrollbar._createStatusEntry = function(unit, index, weapon) {
	//call the original function
	var statusEntry = CPNCL0.call(this, unit, index, weapon);
	var i, j;
	//save the engine's name for the parameter.
	var tempName = ParamGroup.getParameterName(index);
	//check if the custom parameter is an object/array
	if (typeof unit.getClass().custom.CustParamName === 'object'){
		//start by looping over its length
		for (i = 0; i < unit.getClass().custom.CustParamName.length; i++){
			//check the first entry. does it match the engine name? and is the second entry a string?
			if (tempName === unit.getClass().custom.CustParamName[i][0] && typeof unit.getClass().custom.CustParamName[i][1] === 'string'){
				//set the new name.
				tempName = unit.getClass().custom.CustParamName[i][1];
			}
		}
	}
	// do the above again, but with the unit instead of the class.
	// overrides class name with unit name.
	if (typeof unit.custom.CustParamName === 'object'){
		for (j = 0; j < unit.custom.CustParamName.length; j++){
			if (tempName === unit.custom.CustParamName[j][0] && typeof unit.custom.CustParamName[j][1] === 'string'){
				tempName = unit.custom.CustParamName[j][1];
			}
		}
	}
	// set the name to the status entry.
	statusEntry.type = tempName;
	// return it!
	return statusEntry;
};

//do the same as above, but in the status scrollbar.
var CPNCL1 = StatusScrollbar._createStatusEntry;
StatusScrollbar._createStatusEntry = function(unit, index, weapon) {
	var statusEntry = CPNCL1.call(this, unit, index, weapon);
	var i, j;
	var tempName = ParamGroup.getParameterName(index);
	if (typeof unit.getClass().custom.CustParamName === 'object'){
		for (i = 0; i < unit.getClass().custom.CustParamName.length; i++){
			if (tempName === unit.getClass().custom.CustParamName[i][0] && typeof unit.getClass().custom.CustParamName[i][1] === 'string'){
				tempName = unit.getClass().custom.CustParamName[i][1];
			}
		}
	}
	if (typeof unit.custom.CustParamName === 'object'){
		for (j = 0; j < unit.custom.CustParamName.length; j++){
			if (tempName === unit.custom.CustParamName[j][0] && typeof unit.custom.CustParamName[j][1] === 'string'){
				tempName = unit.custom.CustParamName[j][1];
			}
		}
	}
	statusEntry.type = tempName;
	return statusEntry;
};
