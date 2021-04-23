/*
To use, set the custom parameter on the unit {InfiniteChangeCL:true}
Unit can change classes indefinitely with this. Alternatively, set
the custom parameter on a specific class {NegateChangeCostCL:true}
This class will decrease the class up count after increasing it.
*/

var ResetClassCountCL0 = ClassChangeSelectManager._checkGroup;
ClassChangeSelectManager._checkGroup = function(unit, item) {
	var group = ResetClassCountCL0.call(this, unit, item);
	var cls = unit.getClass()
	if (unit.custom.InfiniteChangeCL){
		unit.setClassUpCount(0)
	}
	else if (cls.custom.NegateChangeCostCL){
		unit.setClassUpCount(unit.getClassUpCount()-1)
	}
	return group;
}