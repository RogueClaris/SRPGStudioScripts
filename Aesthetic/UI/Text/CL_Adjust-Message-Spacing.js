var CLSpacingAdjust000 = -5; //Base is font height plus 10 pixels. This takes 5 pixels away again. You can change the 5 and the remove minus as you please.

var CLSpacingAdjust001 = CoreAnalyzer.getCharSpaceHeight;
CoreAnalyzer.getCharSpaceHeight = function() {
    return CLSpacingAdjust001.call(this) + CLSpacingAdjust000; //don't touch this line, please.
};

var MessageRowCount = 4; //adjust this 4 to adjust the number of lines in a text box. Defaults is 3.
CoreAnalyzer._maxRowCount = MessageRowCount; //Do not edit this line.

var CLSpacingAdjust002 = MessagePager._getSpaceInterval;
MessagePager._getSpaceInterval = function(){
    return CLSpacingAdjust002.call(this) + CLSpacingAdjust000;
}