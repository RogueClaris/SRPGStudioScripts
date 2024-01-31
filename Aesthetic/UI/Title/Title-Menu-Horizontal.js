(function () {
	TitleScene._drawScrollbar = function () {
		var x, y;
		var width = this._scrollbar.getScrollbarWidth();
		var height = this._scrollbar.getScrollbarHeight();
		var dx = 40; //A positive number moves it to the left. A negative moves it to the right
		var dy = -140; //A positive number moves it up. A negative moves it down

		x = dx;
		y = root.getGameAreaHeight() * (2 / 3) - dy;
		this._scrollbar.drawScrollbar(x, y);
	};

	var CallTitleBarCL0 = TitleScene._prepareSceneMemberData;

	TitleScene._prepareSceneMemberData = function () {
		CallTitleBarCL0.call(this)
		this._scrollbar = createScrollbarObject(TitleScreenBar, this);
	};

	TitleScene._completeSceneMemberData = function () {
		this._configureTitleItem(this._commandArray);

		this._scrollbar.setScrollFormation(this._commandArray.length, 1);
		// this._scrollbar.setScrollFormation(1, this._commandArray.length);
		this._scrollbar.setObjectArray(this._commandArray);
		this._setFirstIndex();

		this._straightFlow.setStraightFlowData(this);
		this._pushFlowEntries(this._straightFlow);
		this._straightFlow.enterStraightFlow();

		this._setBackgroundData();

		this.changeCycleMode(TitleSceneMode.FLOW);
	},

		TitleScreenBar = defineObject(TitleScreenScrollbar,
			{
				drawScrollbar: function (xStart, yStart) {
					var i, j, x, y, isSelect, scrollableData;
					var isLast = false;
					var objectCount = this.getObjectCount();
					var width = this._objectWidth + this.getSpaceX();
					var height = this._objectHeight + this.getSpaceY();
					var index = (this._xScroll * this._col) + this._yScroll;
					// root.log(index);

					// To adjust cursor positions, edit these numbers
					// These are the X values of where the cursor renders
					// In order from left to right: NEW GAME, CONTINUE, OPTIONS, EXIT GAME
					// Lower numbers push to the left. Higher numbers push to the right.
					// You can edit one number independent of the others.
					var placements = [-20, 190, 390, 560]

					xStart += this.getScrollXPadding();
					yStart += this.getScrollYPadding();

					// The data shouldn't be updated with draw functions, but exclude so as to enable to refer to the position with move functions.
					this.xRendering = xStart;
					this.yRendering = yStart;

					MouseControl.saveRenderingPos(this);

					for (i = 0; i < this._rowCount; i++) {
						y = yStart;

						this.drawDescriptionLine(xStart, y);

						for (j = 0; j < this._col; j++) {
							x = xStart + placements[j];
							root.log(xStart + placements[0])

							isSelect = index === this.getIndex();

							this.drawScrollContent(x, y, this._objectArray[index], isSelect, index);

							if (isSelect && this._isActive) {
								this.drawCursor(x, y, true);
							}

							if (index === this._forceSelectIndex) {
								this.drawCursor(x, y, false);
							}

							if (++index === objectCount) {
								isLast = true;
								break;
							}
						}
						if (isLast) {
							break;
						}
					}

					if (this._isActive) {
						scrollableData = this.getScrollableData();
						this._edgeCursor.drawHorzCursor(xStart - this.getScrollXPadding(), yStart - this.getScrollYPadding(), scrollableData.isLeft, scrollableData.isRight);
						this._edgeCursor.drawVertCursor(xStart - this.getScrollXPadding(), yStart - this.getScrollYPadding(), scrollableData.isTop, scrollableData.isBottom);
					}
				},

				objectSetEnd: function () {
					var objectCount = this._objectArray.length;

					if (this._col === 1) {
						this._commandCursor.setCursorUpDown(objectCount);
					}
					else if (this._showRowCount === 1) {
						this._commandCursor.setCursorLeftRight(objectCount);
					}
					else {
						this._commandCursor.setCursorCross(objectCount, this._col);
					}

					this._rowCount = Math.ceil(objectCount / this._col);
					if (this._rowCount > this._showRowCount) {
						this._rowCount = this._showRowCount;
					}

					// Check if the number of previous index doesn't exceed the new count.
					this._commandCursor.validate();
				}
			}
		);
})();
