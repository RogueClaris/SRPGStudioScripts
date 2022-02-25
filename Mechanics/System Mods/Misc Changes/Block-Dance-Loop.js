UnitCommand.Quick._getTradeArray = function(unit) {
    var i, x, y, targetUnit;
    var indexArray = [];
    
    if (SkillControl.getPossessionSkill(unit, SkillType.QUICK) === null) {
        return indexArray;
    }
    
    for (i = 0; i < DirectionType.COUNT; i++) {
        x = unit.getMapX() + XPoint[i];
        y = unit.getMapY() + YPoint[i];
        targetUnit = PosChecker.getUnitFromPos(x, y);
        if (targetUnit !== null && unit.getUnitType() === targetUnit.getUnitType()) {
            if (targetUnit.isWait() && SkillControl.getPossessionSkill(targetUnit, SkillType.QUICK) === null) {
                indexArray.push(CurrentMap.getIndex(x, y));
            }
        }
    }
    
    return indexArray;
}