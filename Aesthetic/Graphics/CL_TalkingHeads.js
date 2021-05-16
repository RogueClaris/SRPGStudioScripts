/*
Drop it into your plugins folder.
Do not use with standard SRPG Studio-oriented
face graphics.

Use as if each "expression" is a new frame in an animation.
That's how this plugin treats the images.

There is currently no "off" switch.
As of this release I am looking into it.
-RogueClaris

Plugin History:
May 16th, 2021, pt2: Added pausing for pause control characters. Script is considered complete.
May 16th, 2021: Added pausing for ellipses.
May 15th, 2021: Initial Release.
*/
(function(){
var PauseCharacterArray = ["."]
var CallThisToDrawFacesCL0 = BaseMessageView.drawFace;
BaseMessageView.drawFace = function(xDest, yDest, isActive) {
	var analyzer1 = this._messageAnalyzer;
	var analyzer2 = this._messageAnalyzer.getCoreAnalyzer();
	var textLine = analyzer2._textLineArray[analyzer2._rowCount];
	var txt = textLine.text;
	var index = textLine.currentIndex;
	var parser = analyzer2._textParser;
	var checkText = parser._backupTextCL;
	var bindex = textLine.baseIndex;
	if (checkText.search(ControlVariable.WaitLong.getKey()) === index+bindex || checkText.search(ControlVariable.WaitMiddle.getKey()) === index+bindex || checkText.search(ControlVariable.WaitShort.getKey()) === index+bindex){
		CallThisToDrawFacesCL0.call(this, xDest, yDest, isActive);
	}
	else if (PauseCharacterArray.indexOf(txt.charAt(index)) !== -1 || analyzer1._messageState === MessageAnalyzerState.ENDTEXT || analyzer1._messageState === MessageAnalyzerState.READBLOCK){
		CallThisToDrawFacesCL0.call(this, xDest, yDest, isActive);
	}
	else{
		var pic, xSrc, ySrc;
		var destWidth = GraphicsFormat.FACE_WIDTH;
		var destHeight = GraphicsFormat.FACE_HEIGHT;
		var srcWidth = destWidth;
		var srcHeight = destHeight;
		var handle = this._faceHandle;
		var facialExpressionId = this._faceId;
		
		if (handle === null) {
			return;
		}
		
		pic = GraphicsRenderer.getGraphics(handle, GraphicsType.FACE);
		if (pic === null) {
			return;
		}
		
		if (this._counter == null){
			this._counter = createObject(CycleCounter);
			this._counter.setCounterInfo(28)
		}
		this._counter.moveCycleCounter()
		if (root.isLargeFaceUse()) {
			destWidth = root.getLargeFaceWidth();
			destHeight = root.getLargeFaceHeight();
			if (pic.isLargeImage()) {
				srcWidth = destWidth;
				srcHeight = destHeight;
			}
		}
		
		if (facialExpressionId === 0) {
			xSrc = handle.getSrcX();
			ySrc = handle.getSrcY();
		}
		else {
			xSrc = Math.floor(facialExpressionId % 6);
			ySrc = Math.floor(facialExpressionId / 6);
		}
		
		if (this._messageLayout.isFaceReverse()) {
			pic.setReverse(true);
		}
		if (this._pic == null){
			this._pic = pic;
		}
		if (!isActive) {
			this._pic.setColor(this._getNonActiveColor(), this._getNonActiveAlpha());
		}
		xSrc += Math.floor(this._counter.getCounter()/10)
		xSrc *= srcWidth;
		ySrc *= srcHeight;
		this._pic.drawStretchParts(xDest, yDest, destWidth, destHeight, xSrc, ySrc, srcWidth, srcHeight);
	}
}
var BackupOriginalTextCL0 = TextParser.startReplace;
TextParser.startReplace = function(text, parserInfo){
	this._backupTextCL = text;
	return BackupOriginalTextCL0.call(this, text, parserInfo);
}
})();