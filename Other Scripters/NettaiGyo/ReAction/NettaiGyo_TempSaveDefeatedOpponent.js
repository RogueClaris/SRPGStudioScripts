
/*--------------------------------------------------------------------------
  
  最後に攻撃した相手ユニットを格納します
  その時に死亡したかどうかをフラグで持ちます
  この死亡判定はそのユニットが待機するまで有効です。
  最後に攻撃した相手ユニットは次に攻撃を行うまで有効です
  active.custom.lastAttackPassiveUnitのカスパラに倒したユニットを保存し、
  isEnemyDeathFinishにフラグを入れます
  次に待機するタイミングでisEnemyDeathFinishをdeleteします

  ※このスクリプト単体では意味がありません
■概要

■対応バージョン
 SRPG Studio Version:1.118

■更新履歴
18/ 7/8　新規作成

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
Nettaigyo.TurnChangeStart = Nettaigyo.TurnChangeStart || {};
Nettaigyo.MapSequenceCommand.CustomControl = Nettaigyo.MapSequenceCommand.CustomControl || {};
//フラグ取得系
Nettaigyo.MapSequenceCommand.CustomControl.isEnemyDeathFinish = function (unit) {
	if (unit.custom.isEnemyDeathFinish == undefined) {
		return false;
	}
	return true;
};

//skillのenemyKillを確認する
//ようは「倒した時」なのか「倒せなかった時」なのか
//条件を満たすとtrueを返します
//設定されていない場合無条件でtrueを返します
Nettaigyo.MapSequenceCommand.CustomControl.isSkillEnemyKill = function (unit, skill) {
	root.log(unit.getName() + "isSkillEnemyKill");
	//そもそも戦闘していない場合はfalse
	if (!Nettaigyo.MapSequenceCommand.CustomControl.getLastAttackPassiveUnit(unit)) {
		return false;
	}
	root.log("そもそも戦闘はしてる");
	if (skill.custom.enemyKill !== undefined) {
		if (Nettaigyo.MapSequenceCommand.CustomControl.isEnemyDeathFinish(unit) === skill.custom.enemyKill) {
			return true;
		} else {
			return false;
		}
	} else {
		return true;
	}
};
//最後に攻撃を仕掛けた相手の位置を取得
Nettaigyo.MapSequenceCommand.CustomControl.getLastAttackPassiveUnitPos = function (active) {
	var unit = this.getLastAttackPassiveUnit(active);
	if (unit == undefined) {
		return null;
	}
	return { x: unit.getMapX(), y: unit.getMapY() };
};
Nettaigyo.MapSequenceCommand.CustomControl.getLastAttackPassiveUnit = function (active) {
	if (active.custom.lastAttackPassiveUnit == undefined) {
		return null;
	}
	return active.custom.lastAttackPassiveUnit;
};

//最後に攻撃を仕掛けた相手を保存
Nettaigyo.MapSequenceCommand.CustomControl.setLastAttackPassiveUnit = function (active, passive) {
	active.custom.lastAttackPassiveUnit = passive;
};
//最後に攻撃を仕掛けた相手が死亡したかどうかを設定
Nettaigyo.MapSequenceCommand.CustomControl.setEnemyDeathFinish = function (active, passive) {
	//active.custom.lastAttackPassiveUnit = passive;
	active.custom.isEnemyDeathFinish = true;
};
Nettaigyo.MapSequenceCommand.CustomControl.allClear = function (unit) {
	Nettaigyo.MapSequenceCommand.CustomControl.clearEnemyDeathFinish(unit);
	Nettaigyo.MapSequenceCommand.LightningStormControl.setReactionTurnCount(unit, 0);
}
//フラグクリア系
Nettaigyo.MapSequenceCommand.CustomControl.clearEnemyDeathFinish = function (unit) {
	if (unit == undefined) {
		return;
	}
	delete unit.custom.isEnemyDeathFinish;
};

(function () {
	var alias1 = DamageControl.checkHp;
	DamageControl.checkHp = function (active, passive) {
		alias1.call(this, active, passive);
		//root.log(active.getName() + "が" + passive.getName() +  "に攻撃" );
		Nettaigyo.MapSequenceCommand.CustomControl.setLastAttackPassiveUnit(active, passive);
		//倒した場合
		if (passive.getAliveState() === AliveType.DEATH
			|| passive.getAliveState() === AliveType.INJURY) {

			//root.log(active.getName() + "が" + passive.getName() +  "を倒した" );
			Nettaigyo.MapSequenceCommand.CustomControl.setEnemyDeathFinish(active, passive);
		}/*else{
			if( !Nettaigyo.MapSequenceCommand.CustomControl.isEnemyDeathFinish(active) ){
				Nettaigyo.MapSequenceCommand.CustomControl.setEnemyDeathFinish(active,null);
			}
		}*/
	}
	var alias2 = MapSequenceCommand._pushFlowEntries;
	MapSequenceCommand._pushFlowEntries = function (straightFlow) {
		alias2.call(this, straightFlow);
		straightFlow.pushFlowEntry(Nettaigyo.MapSequenceCommand.UpdateFlowEntry);
	};
	//敵
	var alias4 = WaitAutoAction._pushFlowEntries;
	WaitAutoAction._pushFlowEntries = function (straightFlow) {
		alias4.call(this, straightFlow);
		straightFlow.pushFlowEntry(Nettaigyo.MapSequenceCommand.UpdateFlowEntry);
	};

	//死亡ユニット確認
	Nettaigyo.MapSequenceCommand.UpdateFlowEntry = defineObject(BaseFlowEntry,
		{
			_targetUnit: null,
			_skill: null,

			enterFlowEntry: function (playerTurn) {
				this._prepareMemberData(playerTurn);
				return this._completeMemberData(playerTurn);
			},

			moveFlowEntry: function () {
				// this._targetUnit.setReactionTurnCount(this._skill.getSkillValue());
				// this._targetUnit.setWait(false);
				// // 下記コードは敵AI用
				// this._targetUnit.setOrderMark(OrderMarkType.FREE);
				//root.log(this._targetUnit.getName() + "の情報を初期化しました" );
				Nettaigyo.MapSequenceCommand.CustomControl.clearEnemyDeathFinish(this._targetUnit);
				return MoveResult.END;
			},

			_prepareMemberData: function (playerTurn) {
				this._targetUnit = playerTurn.getTurnTargetUnit();
				this._dynamicAnime = createObject(DynamicAnime);
			},

			_completeMemberData: function (playerTurn) {
				return EnterResult.OK;
			}
		});
	//ターン切り替えのときにもリセットしておかないとまずい
	var alias3 = TurnChangeStart.pushFlowEntries;
	TurnChangeStart.pushFlowEntries = function (straightFlow) {
		alias3.call(this, straightFlow);
		straightFlow.pushFlowEntry(Nettaigyo.TurnChangeStart.UpdateFlowEntry);
	};
	Nettaigyo.TurnChangeStart.UpdateFlowEntry = defineObject(BaseFlowEntry,
		{
			enterFlowEntry: function (turnChange) {
				this._prepareMemberData(turnChange);
				return this._completeMemberData(turnChange);
			},

			moveFlowEntry: function () {

				return MoveResult.END;
			},

			_prepareMemberData: function (turnChange) {
				var i, unit;
				var list = TurnControl.getActorList();
				var count = list.getCount();

				for (i = 0; i < count; i++) {
					unit = list.getData(i);
					this._updateUnitFunction(unit);
				}
			},

			_completeMemberData: function (turnChange) {
				return EnterResult.OK;
			},

			//更新処理をこの関数に書く
			_updateUnitFunction: function (unit) {
				Nettaigyo.MapSequenceCommand.CustomControl.allClear(unit);
			}
		}
	);
})(); 