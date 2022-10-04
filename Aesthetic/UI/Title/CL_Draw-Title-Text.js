(function () {
    //Definitely change this.
    var titleString = "What We Leave Behind";

    //default color is black.
    //leave the 0x alone.
    //after it is a hexadecimal code.
    var titleColor = 0x600000;

    //alpha is 255, or fully opaque. cannot go higher.
    //lower it to make text more transparent.
    var titleAlpha = 255;

    var CallTitleBarCL0 = TitleScene._prepareSceneMemberData;
    TitleScene._prepareSceneMemberData = function () {
        CallTitleBarCL0.call(this);
        //change X and Y to change the location of where the title is drawn
        //default is vaguely center screen
        //relevant commands are:
        //LayoutControl.getCenterX(max, width) / getCenterY(max, height) [attempts to obtain a centered X & Y coordinate based on inputs]
        //LayoutControl.getRelativeX(div) / getRelativeY(div) [divides game area width or height by input number]
        //You can also just input raw values.
        this._titleX = LayoutControl.getCenterX(-1, UIFormat.SCREENFRAME_WIDTH / 2) + 35;
        this._titleY = LayoutControl.getCenterY(-1, UIFormat.SCREENFRAME_HEIGHT / 2);
        //Change the 0 to your desired font ID.
        //1 is the font used in title areas, so I used it.
        this._titleFont = root.getBaseData().getFontList().getData(10);
        //prepare the graphics manager.
        this._manager = root.getGraphicsManager();
    };

    //draw the text at the designated location
    var DrawTitleTextCL1 = TitleScene._drawLogo;
    TitleScene._drawLogo = function () {
        DrawTitleTextCL1.call(this);
        this._manager.drawText(this._titleX, this._titleY, titleString, TextRenderer.getTextWidth(titleString, this._titleFont), titleColor, titleAlpha, this._titleFont)
    };
})();