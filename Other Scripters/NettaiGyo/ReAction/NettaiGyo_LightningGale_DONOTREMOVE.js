
/*--------------------------------------------------------------------------
  
  疾風迅雷のスキルを作れます
  [LightningStorm]カスタムキーワードに指定、
  カスタムパラメータに{param_bonus:1}で1ターンの発動回数を指定します
  デフォルトで1です。0にすると発動回数無制限になります

　※このスクリプト単体では機能しません。
「倒した相手を一時保存する.js」を併用してください。

■概要

■対応バージョン
　SRPG Studio Version:1.188

■更新履歴
18/ 7/8　新規作成
18/ 7/9 スペルミスを修正

■作成者: 熱帯魚 

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/
//倒したかどうか
var Nettaigyo = Nettaigyo || {};
Nettaigyo.MapSequenceCommand = Nettaigyo.MapSequenceCommand || {};
Nettaigyo.MapSequenceCommand.LightningStormControl = Nettaigyo.MapSequenceCommand.LightningStormControl || {};
Nettaigyo.MapSequenceCommand.LightningStormControl.SkillKeyword = "LightningStorm";
//再行動できなかったときに呼ぶべし
Nettaigyo.MapSequenceCommand.LightningStormControl.checkUpdate = function(unit){
	if( !Nettaigyo.MapSequenceCommand.CustomControl.isEnemyDeathFinish(unit)){
		return EnterResult.NOTENTER;
	}	
	var skill = SkillControl.getPossessionCustomSkill(unit, Nettaigyo.MapSequenceCommand.LightningStormControl.SkillKeyword)
	if( skill === null ) {
		return EnterResult.NOTENTER;
	}

	var maxCount = 1;//デフォルト値
	// パラメータボーナスの取得
	if( typeof skill.custom.param_bonus === "number" ) {
		maxCount = skill.custom.param_bonus;
	}
//root.log("maxCount:" + maxCount);
	if( maxCount > 0){
//root.log("nowCount" + this.getReactionTurnCount(unit));
		if( this.getReactionTurnCount(unit) >= maxCount ){
			return EnterResult.NOTENTER;
		}
	}
//root.log("しっぷうじんらい:" + maxCount);
	Nettaigyo.MapSequenceCommand.LightningStormControl.addReactionTurnCount(unit);
	return EnterResult.OK;
};
Nettaigyo.MapSequenceCommand.LightningStormControl.setReactionTurnCount = function(unit, trun){
	if(unit === null || unit === undefined){
		return;
	}
//root.log("しっぷうじんらいかうんと:" + trun);
	unit.custom.lightningStormReactionTurnCount = trun;
};
Nettaigyo.MapSequenceCommand.LightningStormControl.addReactionTurnCount = function(unit){
	var nowCount = Nettaigyo.MapSequenceCommand.LightningStormControl.getReactionTurnCount(unit);
	Nettaigyo.MapSequenceCommand.LightningStormControl.setReactionTurnCount(unit,nowCount+1);
};
Nettaigyo.MapSequenceCommand.LightningStormControl.getReactionTurnCount = function(unit){
	if( typeof unit.custom.lightningStormReactionTurnCount === "number" ){
		return unit.custom.lightningStormReactionTurnCount;
	}
	return 0;
};

(function () { 
	var alias1 = ReactionFlowEntry._completeMemberData;
	ReactionFlowEntry._completeMemberData = function(playerTurn) {
		//デフォルトはrtpSkill
		var result = alias1.call(this,playerTurn);
		if( result === EnterResult.OK){
			return EnterResult.OK;
		}

		if( result !== EnterResult.OK){
			result = Nettaigyo.MapSequenceCommand.LightningStormControl.checkUpdate(this._targetUnit);
			if( result === EnterResult.OK){
				this._skill = null;
				this._startReactionAnime();
				return EnterResult.OK;
			}
		}
		return result;
	};

	var alias2 = ReactionFlowEntry.moveFlowEntry;
	ReactionFlowEntry.moveFlowEntry = function() {
		if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
			if( this._skill !== null ){
				this._targetUnit.setReactionTurnCount(this._skill.getSkillValue());
			}
			this._targetUnit.setWait(false);
			// 下記コードは敵AI用
			this._targetUnit.setOrderMark(OrderMarkType.FREE);
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	};
})(); 