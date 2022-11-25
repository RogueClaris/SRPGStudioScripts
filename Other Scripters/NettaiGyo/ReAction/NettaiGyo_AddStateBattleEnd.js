/*--------------------------------------------------------------------------
  
  Plugin by NettaiGyo

  Edited by Dawn Elaine Harpy

  Skill Keyword: paramBattleEndAddState
  This can be edited below


  Von, for your purposes, you want the following custom parameters:

  {TurnStart_AddState:[ { State:[1,2,3,4], Dispel:false } ], battleEnd:true, inflictStateEnemy:true}

  TurnStart_AddState is used by this plugin. Play around with what Dispel does.
  This inflicts states with ID 1, 2, 3, and 4 at the end of battle.
  With the inflictStateEnemy parameter set to true, it inflicts it on the target enemy instead of the user.

Original instructions below


パターン1、自分から攻撃して敵を倒した戦闘後にID1と2のステート付与
{
TurnStart_AddState:[ { State:[1,2], Dispel:false } ], enemyKill:true
}
パターン2、自分から攻撃した戦闘後にID2のステート付与
{
TurnStart_AddState:[ { State:[2], Dispel:false } ], battleEnd:true
}
パターン3、自分から攻撃して敵を倒せなかった戦闘後にID3のステート付与
{
TurnStart_AddState:[ { State:[3], Dispel:false } ], enemyKill:false
}
パターン4、自分から攻撃して敵を倒した戦闘後にID1のステート付与を、ID1がすでに付与されているなら2を付与...2→3→4とランクアップ
注意点：State配列に指定するステートIDはほかの要素で付与されないステートにしてください
そうしないとバグります
levelKeepはtrueだと最終段階(ID4)まで来たときに上書き付与します。
falseだと最終段階のときは何もしません
{
TurnStart_AddState:[ { State:[1,2,3,4], Dispel:false, levelUp:true } ], enemyKill:true
}
■概要

■対応バージョン
 SRPG Studio Version:1.250

■更新履歴
19/10/27　新規作成

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
Nettaigyo.TurnChangeStart = Nettaigyo.TurnChangeStart || {};
Nettaigyo.MapSequenceCommand = Nettaigyo.MapSequenceCommand || {};
Nettaigyo.MapSequenceCommand.CustomControl = Nettaigyo.MapSequenceCommand.CustomControl || {};
//戦闘終了時付与用
Nettaigyo.TurnChangeStart.TurnBattleEndStateKeyword = 'paramBattleEndAddState';
Nettaigyo.TurnChangeStart.TurnBattleEndStateDeathKeyword = 'paramBattleEndAddStateDeath';
Nettaigyo.StateControl = {
	getDataFromIdState: function (id) {
		var stateBaseList = root.getBaseData().getStateList();
		var state = stateBaseList.getDataFromId(id);
		return state;
	},
	isDataFromidState: function (unit, id) {
		var state = this.getDataFromIdState(id);
		return StateControl.getTurnState(unit, state);
	},
	removeDataFromidState: function (unit, id) {
		var state = this.getDataFromIdState(id);
		return StateControl.arrangeState(unit, state, IncreaseType.DECREASE);
	},
	checkState: function (unit, skillKeyword, isSkipMode, generator) {
		var commandCount = this._checkStateBase(unit, unit, skillKeyword, isSkipMode, generator, false);
		root.log(unit.getName() + " " + skillKeyword);
		return commandCount;
	},
	//倒した相手も見る
	checkStateDeathFinish: function (unit, skillKeyword, isSkipMode, generator) {
		var commandCount = 0;
		root.log(unit.getName() + " grudge check");
		if (Nettaigyo.MapSequenceCommand.CustomControl.isEnemyDeathFinish(unit)) {
			root.log("defeated grudge enemy");
			var target = Nettaigyo.MapSequenceCommand.CustomControl.getLastAttackPassiveUnit(unit);
			if (target) {
				root.log("grudge start");
				commandCount = this._checkStateBase(target, unit, skillKeyword, isSkipMode, generator, true);
			}
		}
		return commandCount;
	},
	_checkStateBase: function (unit, target, skillKeyword, isSkipMode, generator, killCheck) {
		var commandCount = 0;
		var skillEntry;
		var skillList = SkillControl.getDirectSkillArray(unit, SkillType.CUSTOM, skillKeyword);
		root.log(unit.getName() + "skillList !== null");
		if (skillList === null) {
			return;
		}
		root.log(unit.getName() + "skillList !== null");
		var skillCount = skillList.length;
		root.log(skillCount);
		for (var j = 0; j < skillCount; ++j) {
			skillEntry = skillList[j];
			if (!skillEntry.skill) {
				root.log(unit.getName() + "skillnull");
				continue;
			}

			if (killCheck || skillEntry.skill.custom.enemyKill !== undefined || skillEntry.skill.custom.battleEnd) {
				root.log(unit.getName() + "killCheck");
				if (!Nettaigyo.MapSequenceCommand.CustomControl.isSkillEnemyKill(target, skillEntry.skill)) {
					root.log(unit.getName() + "killCheckcontinue");
					continue;
				}
			}

			root.log(unit.getName() + "updateUnitFunction");
			if (skillEntry.skill.custom.inflictStateEnemy === true){
				target = Nettaigyo.MapSequenceCommand.CustomControl.getLastAttackPassiveUnit(unit);
			}
			commandCount += this._updateUnitFunction(target, skillEntry.skill, isSkipMode, generator);
		}
		return commandCount;
	},
	//更新処理をこの関数に書く
	//この処理はステートの付与
	_updateUnitFunction: function (unit, skill, isSkipMode, generator) {
		var commandCount = 0;
		if (skill === null) {
			return 0;
		}
		root.log(unit.getName() + "updateUnitFunction");
		var add = skill.custom.TurnStart_AddState;
		commandCount = this.unitAddState(unit, add, isSkipMode, generator);
		return commandCount;
	},

	unitAddState: function (unit, addObject, isSkipMode, generator) {
		var commandCount = 0;
		var add = addObject;
		if (typeof add !== 'object') {
			return 0;
		}


		root.log("Skills and parameter recognition");
		var stateBaseList = root.getBaseData().getStateList();
		var length = add.length;
		for (var j = 0; j < length; j++) {
			var obj = add[j];
			var stateLength = obj['State'].length;
			if (this._levelUpAddState(unit, obj, stateBaseList, isSkipMode, generator)) {
				commandCount += 1;
				continue;
			}
			commandCount += this._unitStateChange(unit, obj, stateLength, stateBaseList, isSkipMode, generator);
		}
		return commandCount;
	},
	_unitStateChange: function (unit, obj, stateLength, stateBaseList, isSkipMode, generator) {
		var commandCount = 0;
		if (!obj.Dispel) {
			root.log("I'm about to miss");
			if (obj['State'] == 'DEAD') {
				generator.damageHit(unit, this._getTurnDamageAnime(), 9999, DamageType.FIXED, {}, isSkipMode);
				commandCount++;
				return commandCount;
			}

			for (var h = 0; h < stateLength; h++) {
				var state = stateBaseList.getDataFromId(obj['State'][h]);
				StateControl.arrangeState(unit, state, IncreaseType.INCREASE);
			}
		}
		else if (obj.Dispel == true) {
			for (var h = 0; h < stateLength; h++) {
				var state = stateBaseList.getDataFromId(obj['State'][h]);
				StateControl.arrangeState(unit, state, IncreaseType.DECREASE);
			}
		}
		return commandCount;
	},

	_levelUpAddState: function (unit, obj, stateBaseList, isSkipMode, generator) {
		var commandCount = 0;
		if (!obj.levelUp) {
			return false;
		}
		root.log('levelUpAddState');
		var i = 0;
		var stateLength = obj['State'].length;
		var stateId = 0;
		var index = 0;
		for (var h = 0; h < stateLength; h++) {
			stateId = obj['State'][h];
			if (this.isDataFromidState(unit, stateId) === null) {
				continue;
			}
			index = h + 1;
			if (index >= stateLength) {
				if (obj.levelKeep) {
					this.removeDataFromidState(unit, stateId);
					index = stateLength - 1;
				} else {
					return true;
				}
			} else {
				this.removeDataFromidState(unit, stateId);
			}
			break;
		}

		if (index >= stateLength) {
			if (obj.levelKeep) {
				index = stateLength - 1;
			} else {
				return true;
			}
		}
		var state = stateBaseList.getDataFromId(obj['State'][index]);
		StateControl.arrangeState(unit, state, IncreaseType.INCREASE);
		return true;
		//commandCount += this._unitStateChange(unit,obj,stateLength,stateBaseList, isSkipMode ,generator);
	}
};




(function () {
	//味方
	var alias1 = MapSequenceCommand._pushFlowEntries;
	MapSequenceCommand._pushFlowEntries = function (straightFlow) {
		alias1.call(this, straightFlow);
		straightFlow.pushFlowEntry(Nettaigyo.MapSequenceCommand.AddState);
		//straightFlow.pushFlowEntry(Nettaigyo.MapSequenceCommand.UpdateFlowEntry);
	};
	//敵
	var alias2 = WaitAutoAction._pushFlowEntries;
	WaitAutoAction._pushFlowEntries = function (straightFlow) {
		alias2.call(this, straightFlow);
		straightFlow.pushFlowEntry(Nettaigyo.MapSequenceCommand.AddState);
		//straightFlow.pushFlowEntry(Nettaigyo.MapSequenceCommand.UpdateFlowEntry);
	};

	//入れ替えを確認する
	Nettaigyo.MapSequenceCommand.AddState = defineObject(BaseFlowEntry,
		{
			_targetUnit: null,
			_skill: null,

			enterFlowEntry: function (playerTurn) {
				this._prepareMemberData(playerTurn);
				return this._completeMemberData(playerTurn);
			},

			moveFlowEntry: function () {
				if (this._slideAction.moveCycle() === MoveResult.END) {
					return MoveResult.END;
				}
				return MoveResult.CONTINUE;
			},

			drawFlowEntry: function () {

			},

			_prepareMemberData: function (playerTurn) {
				this._targetUnit = playerTurn.getTurnTargetUnit();
				this._dynamicEvent = createObject(DynamicEvent);
			},

			_completeMemberData: function (playerTurn) {
				var isSkipMode = CurrentMap.isTurnSkipMode();
				var generator = this._dynamicEvent.acquireEventGenerator();
				Nettaigyo.StateControl.checkState(this._targetUnit, Nettaigyo.TurnChangeStart.TurnBattleEndStateKeyword, isSkipMode, generator);
				Nettaigyo.StateControl.checkStateDeathFinish(this._targetUnit, Nettaigyo.TurnChangeStart.TurnBattleEndStateDeathKeyword, isSkipMode, generator);
				return EnterResult.NOTENTER;
			}
		});
})(); 