// Welcome to the Custom Listing: Persistent Unit Window script!
// This script attempts to make it so that sliding your cursor off of a unit
// does not cause the unit info window to lose that unit's info.

// Terms of Use:
// Anything as long as it complies with SRPG Studio Terms of Use.
// Feel free to modify or expand upon the script.
// Credit is not required. If you wish to give it, this script was written by Dawn Elaine.
// If you need assistance, please join either the /r/SRPGStudio or SRPG University discord server and ask for Maplewood.
// Someone will direct your queries to me. Thank you.

var PersistentUnitWindowCL00 = MapParts.UnitInfo.drawMapParts;
MapParts.UnitInfo.drawMapParts = function () {
    var unit = this.getMapPartsTarget(); // Get the unit.
    if (unit == null) { // If that unit is null, try to use the saved unit.
        var mapCustom = root.getCurrentSession().getCurrentMapInfo().custom;
        if (mapCustom.savedUnitCL != null) {
            var x = this._getPositionX(mapCustom.savedUnitCL);
            var y = this._getPositionY(mapCustom.savedUnitCL);
            this._drawMain(x, y);
        }
        // Don't proceed if it's null so that the saved unit persists.
        return;
    }

    PersistentUnitWindowCL00.call(this);
}

var PersistentUnitWindowCL01 = MapParts.UnitInfo.getMapPartsTarget;
MapParts.UnitInfo.getMapPartsTarget = function () {
    var unit = PersistentUnitWindowCL01.call(this); // Obtain the unit normally.
    var mapCustom = root.getCurrentSession().getCurrentMapInfo().custom;
    if (unit != null) {
        // Store the unit in the map for persistence if unit is not null.
        mapCustom.savedUnitCL = unit;
    }
    if (unit == null && mapCustom.savedUnitCL != null && mapCustom.savedUnitCL.getHp() > 0) { // If the normal unit is null, and the saved unit is not, use the saved unit.
        //Also only proceed if HP is greater than 0.
        if (this._mhp == 0) {
            this._mhp = RealBonus.getMhp(mapCustom.savedUnitCL); // Set the Max HP again from the saved unit in case of menu or loading.
        }
        return mapCustom.savedUnitCL;
    }
    // This may return a null unit sometimes, but that's OK. Return the resulting unit.
    return unit;
};

var PersistentUnitWindowCL02 = MapParts.UnitInfo._getPositionY;
MapParts.UnitInfo._getPositionY = function (unit) {
    var position = PersistentUnitWindowCL02.call(this, unit); // Original function result.
    var MapY = LayoutControl.getPixelY(this._mapCursor.getY()); // Value shifts as cursor moves. Padding is set in editor.
    var MapX = LayoutControl.getPixelX(this._mapCursor.getX()); // Value shifts as cursor moves. Padding is set in editor.
    var WindowX = this._getWindowWidth() // Used to compare cursor position. Window width.
    var WindowY = this._getWindowHeight() // Used to compare cursor position. Window height.
    if ((MapY < d && MapY <= WindowY) || (MapY > d && MapY >= WindowY) || (MapX <= WindowX)) {
        var yMin = LayoutControl.getRelativeY(10) - 28; // Minimum Y Coordinate to return when drawing window conditionally. Towards top of screen.
        var yMax = root.getGameAreaHeight() - this._getWindowHeight() - yMin; // Maximum Y Coordinate to return when drawing window conditionally. Towards bottom of screen.
        var d = root.getGameAreaHeight() / 2; // Always returns the same value. Relative to screen size, however.
        if (MapY > d) {
            return yMin;
        }
        else {
            return yMax;
        }
    }
    return position;
};

var PersistentUnitWindowCL03 = MapParts.UnitInfo.setUnit;
MapParts.UnitInfo.setUnit = function (unit) {
    var mapCustom = root.getCurrentSession().getCurrentMapInfo().custom;
    if (unit == null && mapCustom.savedUnitCL != null) {
        // Return with saved unit if normal unit is null and saved unit is not.
        return PersistentUnitWindowCL03.call(this, mapCustom.savedUnitCL);
    }
    return PersistentUnitWindowCL03.call(this, unit);
}