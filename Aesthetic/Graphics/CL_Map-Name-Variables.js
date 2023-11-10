/* Welcome to the Map Name Control Characters plugin.
 * It introduces a new control character to the
 * SRPG Studio engine, \mn[x], where x can represent
 * any whole number. This Control Character will
 * query the engine for the name of the map with the matching
 * Data ID and place it in your message events.
 * As an example, you could put \mn[3] in to a message box
 * and it will be replaced by the name of the map with the ID 3.
 * The code will do everything else for you!
 *
 * Enjoy!
 * -RogueClaris
 *
 * =Plugin History=
 * Month Day, 2023: Initial Release.
 */

var MapNameControlCharacterCL0 = VariableReplacer._configureVariableObject
VariableReplacer._configureVariableObject = function (groupArray) {
	MapNameControlCharacterCL0.call(this, groupArray);
	groupArray.appendObject(DataVariable.MapName);
};

DataVariable.MapName = defineObject(BaseDataVariable,
	{
		getList: function () {
			root.log(root.getBaseData().getMapList().getCount())
			return root.getBaseData().getMapList();
		},

		getKey: function () {
			var key = /\\mn\[(\d+)\]/;

			return key;
		}
	}
);