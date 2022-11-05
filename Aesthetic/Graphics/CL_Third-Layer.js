/*--------------------------------------------------------------------------
  Usage instruction:
  Go into the terrain tab of database, and set the following custom parameters,
  
  {StealthCL:true}
  
  I was able to make this by modifying a plugin created by SapphireSoft,
  "highlevel-outside.js". It causes terrain with the right custom parameters
  to be drawn on top of units, so units can hide go "under" tree tops and such.
  It should be useful for aesthetic purposes, even if it makes units hard to see
  with certain terrain.
  
  Original Plugin Author:
  SapphireSoft
  http://srpgstudio.com/
  
  Original Plugin History:
  2018/08/19 Released
  
  Adapted Plugin Author:
  Rogue Claris
  
  Adapted Plugin History:
  2020/10/05 Released

  	2022/11/02 Update
		No longer leaves old map layer artifacts on the next map.
	  	Overrides the following commands for Quality of Life visual concerns:
	  	AfterTransitionFlowEntry._completeMemberData;
	  	BeforeTransitionFlowEntry._completeMemberData;
   
	2022/11/05 Update
		No longer lags horrifically. Again. Fixed that AGAIN.
		No longer leaves artifacts...again...I fixed that in a different way. Hopefully for good.
  
--------------------------------------------------------------------------*/

(function () {
	var alias3 = MapLayer.drawUnitLayer;
	MapLayer.drawUnitLayer = function () {
		alias3.call(this);
		var i, j;
		var session = root.getCurrentSession();
		var mx = session.getScrollPixelX();
		var my = session.getScrollPixelY();
		if (root.getMetaSession().global.ThirdLayerArray == null) {
			root.getMetaSession().global.ThirdLayerArray = []
			for (i = 0; i < CurrentMap.getWidth(); i++) {
				for (j = 0; j < CurrentMap.getHeight(); j++) {
					var Terrain = PosChecker.getTerrainFromPos(i, j)
					if (Terrain.custom.StealthCL) {
						var img = Terrain.getMapchipImage()
						var handle = session.getMapChipGraphicsHandle(i, j, true);
						root.getMetaSession().global.ThirdLayerArray.push([img, i, j, handle.getSrcX() * GraphicsFormat.MAPCHIP_WIDTH, handle.getSrcY() * GraphicsFormat.MAPCHIP_HEIGHT, GraphicsFormat.MAPCHIP_WIDTH, GraphicsFormat.MAPCHIP_HEIGHT])
					}
				}
			}
		}
		var t;
		var arr = root.getMetaSession().global.ThirdLayerArray
		for (t = 0; t < arr.length; ++t) {
			arr[t][0].drawParts((arr[t][1] * GraphicsFormat.MAPCHIP_WIDTH) - mx, (arr[t][2] * GraphicsFormat.MAPCHIP_HEIGHT) - my, arr[t][3], arr[t][4], arr[t][5], arr[t][6])
		}
	};

	var DrawScrollCL = UnitRenderer.drawScrollUnit;
	UnitRenderer.drawScrollUnit = function (unit, x, y, unitRenderParam) {
		DrawScrollCL.call(this, unit, x, y, unitRenderParam);
		var session = root.getCurrentSession();
		var mx = session.getScrollPixelX();
		var my = session.getScrollPixelY();
		var t;
		var arr = root.getMetaSession().global.ThirdLayerArray
		for (t = 0; t < arr.length; ++t) {
			for (t = 0; t < arr.length; ++t) {
				arr[t][0].drawParts((arr[t][1] * GraphicsFormat.MAPCHIP_WIDTH) - mx, (arr[t][2] * GraphicsFormat.MAPCHIP_HEIGHT) - my, arr[t][3], arr[t][4], arr[t][5], arr[t][6])
			}
		}
	};

	var EraseArrCL = ScriptCall_Load;
	ScriptCall_Load = function () {
		EraseArrCL.call(this);
		if (root.getMetaSession().global.ThirdLayerArray != null) {
			delete root.getMetaSession().global.ThirdLayerArray
		}
	}

	var EraseMapLayerCL1 = SystemTransition.initialize;
	SystemTransition.initialize = function () {
		EraseMapLayerCL1.call(this);
		if (root.getMetaSession().global.ThirdLayerArray != null && root.getCurrentScene() === SceneType.BATTLESETUP) {
			delete root.getMetaSession().global.ThirdLayerArray
		}
	}

	AfterTransitionFlowEntry._completeMemberData = function (battleResultScene) {
		if (SceneManager.isScreenFilled()) {
			return EnterResult.NOTENTER;
		}

		this._transition.setFadeSpeed(5);
		this._transition.setEffectRangeType(EffectRangeType.ALL);
		this._transition.setVolume(255, 0, 160, true);

		return EnterResult.OK;
	}

	BeforeTransitionFlowEntry._completeMemberData = function (battleResultScene) {
		var effect;

		if (SceneManager.isScreenFilled()) {
			// If it's EffectRangeType.ALL, the characters on the "logo" are all covered,
			// so change it to EffectRangeType.ALL.
			effect = root.getScreenEffect();
			effect.setRange(EffectRangeType.ALL);
			return EnterResult.NOTENTER;
		}

		this._transition.setFadeSpeed(5);
		this._transition.setEffectRangeType(EffectRangeType.ALL);
		this._transition.setVolume(160, 0, 0, true);

		return EnterResult.OK;
	}

})();