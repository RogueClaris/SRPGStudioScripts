/*
      INSTRUCTIONS
    1. Put this in your Plugins folder
    2. Give a Unit a Steal-type skill.
    3. Give that Unit an Action Pattern with the Script condition enabled.
        * Write the following as the script:
        * ThiefControllerCL._shouldThiefRunAway(1)
        * This will return "true" if 1 or more items have been stolen.
        * If you make the Action Pattern the "Move" type, the Thief will seem as if they are running away.
    

      ATTRIBUTION
    If used, please put "RogueClaris" or "Glade W." in your project's credits.
    Please write your own preference for attribution below if you modify this script.
        * 
    
      TERMS OF USE
    * Only for SRPG Studio
    * You may modify this script freely
    * You may not claim as your own work
        * If you made modifications, you can claim those
    * Please Attribute if you use the script.
    * You may reupload anywhere, provided you adhere to the terms above.
*/

var ThievesRunOffCL = SkillAutoAction._enterSteal;
SkillAutoAction._enterSteal = function () {
    var result = ThievesRunOffCL.call(this);
    // Do not change anything if we are not stealing
    if (result == EnterResult.NOTENTER) {
        return result;
    }

    this._unit.custom._HasStolenCL = true

    if (typeof this._unit.custom._StolenItemCountCL != "number") {
        this._unit.custom._StolenItemCountCL = 0
    }
    this._unit.custom._StolenItemCountCL = this._unit.custom._StolenItemCountCL + 1
    return result;
}

ThiefControllerCL = defineObject(BaseObject, {
    _shouldThiefRunAway: function (steal_count) {
        var session = root.getCurrentSession()
        var unit = session.getActiveEventUnit()
        if (typeof steal_count != "number") {
            steal_count = 0
        }
        return unit != null && unit.custom._HasStolenCL == true && unit.custom._StolenItemCountCL >= steal_count
    }
});