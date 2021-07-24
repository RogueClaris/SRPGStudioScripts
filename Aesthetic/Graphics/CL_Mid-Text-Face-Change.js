/* Welcome to the Mid-Text Face Change plugin.
 * It introduces a new control character to the
 * SRPG Studio engine, \fc[x], where x can represent
 * a number between 0 and 23. This Control Character
 * changes the actor's face in the message box.
 * To use, simply put \fc[3] or similar into a message
 * box when you want the text to change their facial expression.
 * The code will take care of the rest.
 *
 * Enjoy!
 * -RogueClaris
 *
 * =Plugin History=
 * July 24th, 2021: Updated for more dynamic control detection.
 * July 22nd, 2021: Released.
 *
 */

var MidTextFaceChangeCL0 = TextParser._configureVariableObject;
TextParser._configureVariableObject = function(groupArray){
	MidTextFaceChangeCL0.call(this, groupArray);
	groupArray.appendObject(ControlVariable.FaceChange);
};

ControlVariable.FaceChange = defineObject(BaseControlVariable,
{
	checkDrawInfo: function(index, objectArray, drawInfo) {
		var obj = this.getObjectFromIndex(index, objectArray, this);
		
		if (obj === null) {
			return;
		}
		
		drawInfo.faceChanger = obj;
	},
	
	getKey: function() {
		var key = /\\fc\[(\d+)\]/
		
		return key;
	}
}
);

var MidTextFaceChangeCL1 = BaseMessageView.drawMessageView;
BaseMessageView.drawMessageView = function(isActive, pos){
	var analyzer1 = this._messageAnalyzer;
	var analyzer2 = this._messageAnalyzer.getCoreAnalyzer();
	var textLine = analyzer2._textLineArray[analyzer2._rowCount];
	var txt = textLine.text;
	var index = textLine.currentIndex;
	var parser = analyzer2._textParser;
	var bindex = textLine.baseIndex;
	if (analyzer1._parserInfo.changeFaceId && analyzer1._parserInfo.changeFaceIndex){
		index = Math.max(0, index - (analyzer1._parserInfo.changeFaceId[0].toString().length));
		if (bindex+index === analyzer1._parserInfo.changeFaceIndex){
			this._faceId = analyzer1._parserInfo.changeFaceId[1];
		}
	}
	MidTextFaceChangeCL1.call(this, isActive, pos);
};

var MidTextFaceChangeCL2 = TextParser.startReplace;
TextParser.startReplace = function(text, parserInfo){
	var checkIndex = text.search(ControlVariable.FaceChange.getKey())
	if (checkIndex !== -1){
		var findNum = text.match(ControlVariable.FaceChange.getKey())
		parserInfo.changeFaceIndex = checkIndex;
		if (findNum !== null){
			parserInfo.changeFaceId = findNum;
		}
	}
	return MidTextFaceChangeCL2.call(this, text, parserInfo);
};