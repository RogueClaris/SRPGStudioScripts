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
 * July 22nd, 2021: Released.
 */

var MidTextFaceChangeCL0 = TextParser._configureVariableObject;
TextParser._configureVariableObject = function(groupArray){
	MidTextFaceChangeCL0.call(this, groupArray);
	groupArray.appendObject(ControlVariable.FaceChange);
};

ControlVariable.FaceChange = defineObject(BaseControlVariable,
{
	checkDrawInfo: function(index, objectArray, drawInfo) {
		//fetch the object, this is RTP code, I really don't know what it does.
		var obj = this.getObjectFromIndex(index, objectArray, this);
		//check if it's null; it won't do us any good if it is.
		if (obj === null) {
			return;
		}
		drawInfo.faceChanger = obj;
	},
	
	getKey: function() {
		var key = /\\fc\[(\d+)\]/i
		
		return key;
	}
}
);

var MidTextFaceChangeCL1 = BaseMessageView.drawMessageView;
BaseMessageView.drawMessageView = function(isActive, pos){
	//snag the analyzers.
	var analyzer1 = this._messageAnalyzer;
	var analyzer2 = this._messageAnalyzer.getCoreAnalyzer();
	//get the current line of text's object,
	var textLine = analyzer2._textLineArray[analyzer2._rowCount];
	//and its text.
	var txt = textLine.text;
	//and the current index.
	var index = textLine.currentIndex;
	//grab base index, aka bindex.
	var bindex = textLine.baseIndex;
	//pull up the array.
	var changeFace = analyzer1._parserInfo._changeFaceCL;
	//pull up the backup text.
	var backup = analyzer1._parserInfo._backupTextCL;
	//initialize cindex [change index] and poppy [pop but it's actually shift]
	var cindex, poppy;
	//create a duplicate of changeFace every time. this way we don't run out of array before we hit the index.
	var changeFace2 = [].concat(changeFace);
	//once it's around,
	if (changeFace2){
		//shift out the first element copied over.
		poppy = changeFace2.shift();
		//if THAT'S found,
		if (poppy){
			//check the index of it in the backup text.
			cindex = backup.indexOf(poppy)
			//if the change index is not -1, then...
			root.log(cindex)
			root.log(index === undefined)
			root.log(bindex === undefined)
			if (cindex !== -1 && cindex === index+bindex){
				//shift out the first element of the ORIGINAL array to change what we're accessing, and...
				changeFace.shift()
				//set faceId to the number found within poppy.
				this._faceId = poppy.match(/[0-9]+/)
			}
		}
	}
	MidTextFaceChangeCL1.call(this, isActive, pos);
};

var MidTextFaceChangeCL2 = TextParser.startReplace;
TextParser.startReplace = function(text, parserInfo){
	//find all instances of \fc[x] in the text, where x is a number.
	var findNum = text.match(/\\fc\[(\d+)\]/g)
	//make sure it's not null and that it has at least 1 result.
	if (findNum && findNum.length > 0){
		//backup the original text
		parserInfo._backupTextCL = text;
		//save the match.
		parserInfo._changeFaceCL = findNum;
	}
	return MidTextFaceChangeCL2.call(this, text, parserInfo);
};