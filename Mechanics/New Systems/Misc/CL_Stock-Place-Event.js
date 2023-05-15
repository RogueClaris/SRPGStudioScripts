var DisplayStockCommandCL = UnitCommand.Stock.isCommandDisplayable;
UnitCommand.Stock.isCommandDisplayable = function () {
    var StockCommandDisplayResult = DisplayStockCommandCL.call(this);

    if (!root.getCurrentSession().isMapState(MapStateType.STOCKSHOW)) {
        return false;
    }

    var unit = this.getCommandTarget();
    var x = unit.getMapX();
    var y = unit.getMapY();
    var list = root.getCurrentSession().getPlaceEventList();
    var count = list.getCount();
    var placeEvent, placeInfo;
    for (i = 0; i < count; i++) {
        placeEvent = list.getData(i);
        placeInfo = placeEvent.getPlaceEventInfo();
        if (placeInfo.getX() === x && placeInfo.getY() === y) {
            if (placeInfo.getCustomKeyword() == "DisplayStockCL") {
                StockCommandDisplayResult = true;
                break;
            }
        }
    }

    return StockCommandDisplayResult;
};