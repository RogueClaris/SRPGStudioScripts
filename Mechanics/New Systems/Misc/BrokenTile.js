/*
Started by Pike, this is the Ledges/Broken Tile script. It prevents
units from standing on specific tiles, as they are assumed to be
too narrow to keep steady on. However, passing them is no problem.

To use, create the following custom parameters on terrain:

{
	ledge:true,
	standable:["Flying","Mountain"],
	direction:["south"],
	evadeBonus:30
}

The ledge custom parameter marks the terrain as a broken tile.

The standable array lists the names of class types that can
stand on broken tiles regardless of this status.

The direction list  marks what side(s) the ledge is facing. Multiple
can be specified.

The evadeBonus parameter dictates how much evade to give to a unit
on the upper side of a ledge when attacked by one on the lower side.

That's all, folks! Enjoy the script!
-RogueClaris
*/

var LedgeHeightCL0 = HitCalculator.calculateSingleHit;
HitCalculator.calculateSingleHit = function(active, passive, weapon, totalStatus){
	var acc = LedgeHeightCL0.call(this, active, passive, weapon, totalStatus)
	var x1 = active.getMapX()
	var y1 = active.getMapY()
	var x2 = passive.getMapX()
	var y2 = passive.getMapY()
	var dist = Math.abs((x1 - x2) + (y1 - y2))
	var terrain;
	var x = x2;
	var y = y2;
	var dir1 = x1 > x2 ? "east" : "west"
	var dir2 = y1 > y2 ? "south" : "north"
	for (i = 0; i < dist; i++){
		if (x !== x1){
			if (dir1 === "east"){
				x += 1
			}
			else if (dir1 === "west"){
				x -= 1
			}
		}
		if (y !== y1){
			if (dir2 === "south"){
				y += 1
			}
			else if (dir2 === "north"){
				y -= 1
			}
		}
		terrain = PosChecker.getTerrainFromPos(x, y)
		if (terrain && terrain.custom.ledge){
			if (terrain.custom.direction){
				if (terrain.custom.direction.indexOf(dir1) !== -1 || terrain.custom.direction.indexOf(dir2) !== -1){
					acc -= typeof terrain.custom.evadeBonus === "number" ? terrain.custom.evadeBonus : 30;
				}
			}
			else{
				acc -= typeof terrain.custom.evadeBonus === "number" ? terrain.custom.evadeBonus : 30;
			}
		}
	}
	return acc;
};

var LedgeCL0 = UnitCommand.configureCommands
UnitCommand.configureCommands = function(groupArray) {
	var unit = this.getListCommandUnit();
	var terrain = PosChecker.getTerrainFromPos(unit.getMapX(), unit.getMapY());
	if (!terrain.custom.ledge){
		LedgeCL0.call(this, groupArray);
	}
	else {
		var array = terrain.custom.standable;
		var classType = unit.getClass().getClassType().getName();
		if (array != null){
			if (array.indexOf(classType) !== -1){
				LedgeCL0.call(this, groupArray);
			}
		}
	}
};

MoveAutoAction.setAutoActionInfo = function(unit, combination) {
	this._unit = unit;
	this._moveCource = combination.cource;
	this._simulateMove = createObject(SimulateMove);
	var count = this._moveCource.length;
	var x = unit.getMapX();
	var y = unit.getMapY();
	for (var i = 0; i < count; i++){
		var dir = this._moveCource[i]
		x += XPoint[dir];
		y += YPoint[dir];
	}
	var terrain = PosChecker.getTerrainFromPos(x, y);
	var ledgeCheck = terrain.custom.ledge;
	var arr = terrain.custom.standable
	var classType = unit.getClass().getClassType().getName();
	if (ledgeCheck){
		if (arr != null && arr.indexOf(classType) === -1){
			root.log('hi 3')
			this._moveCource.splice(this._moveCource.length-1, 1)
		}
		else if (arr == null){
			root.log('hi 3')
			this._moveCource.splice(this._moveCource.length-1, 1)
		}
	}
};

var LedgeCL1 = WeaponAutoAction.setAutoActionInfo
WeaponAutoAction.setAutoActionInfo = function(unit, combination) {
	LedgeCL1.call(this, unit, combination)
	var cource = combination.cource;
	var x = unit.getMapX();
	var y = unit.getMapY();
	var i, dir;
	for (i = 0; i < cource.length; i++){
		dir = cource[i];
		x += XPoint[dir];
		y += YPoint[dir];
	}
	var terrain = PosChecker.getTerrainFromPos(x, y);
	var ledgeCheck = terrain.custom.ledge;
	var arr = terrain.custom.standable != null ? terrain.custom.standable : []
	var classType = unit.getClass().getClassType().getName();
	if (AttackChecker.getLedgeAttackIndexArray(unit, x, y, ItemControl.getEquippedWeapon(unit), true).length === 0 && arr.indexOf(classType) !== -1){
		this._fail = true;
	}
	else{
		this._fail = false;
	}
};

WeaponAutoAction.enterAutoAction = function() {
	var isSkipMode = this.isSkipMode();
	if (this._fail){
		return EnterResult.NOTENTER;
	}
	if (isSkipMode) {
		if (this._enterAttack() === EnterResult.NOTENTER) {
			return EnterResult.NOTENTER;
		}
		
		this.changeCycleMode(WeaponAutoActionMode.PREATTACK);
	}
	else {
		this._changeCursorShow();
		this.changeCycleMode(WeaponAutoActionMode.CURSORSHOW);
	}
	
	return EnterResult.OK;
}

AttackChecker.getLedgeAttackIndexArray = function(unit, x, y, weapon, isSingleCheck) {
	var i, index, x2, y2, targetUnit;
	var indexArrayNew = [];
	var indexArray = IndexArray.getBestIndexArray(x, y, weapon.getStartRange(), weapon.getEndRange());
	var count = indexArray.length;
	
	for (i = 0; i < count; i++) {
		index = indexArray[i];
		x2 = CurrentMap.getX(index);
		y2 = CurrentMap.getY(index);
		targetUnit = PosChecker.getUnitFromPos(x2, y2);
		if (targetUnit !== null && unit !== targetUnit) {
			if (FilterControl.isReverseUnitTypeAllowed(unit, targetUnit)) {
				indexArrayNew.push(index);
				if (isSingleCheck) {
					return indexArrayNew;
				}
			}
		}
	}
	
	return indexArrayNew;
}
