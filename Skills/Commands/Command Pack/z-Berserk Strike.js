//Hello and welcome to the Berserk-Strike script!
//To set this up, create a custom-type Skill, and
//give it the keyword "Berserk"! Then give it to a
//unit and get in range of an enemy! That's it!
//Enjoy the script~! -Lady Rena, 1/27/2020
var BerserkCommandMode = {
	SELECT: 0,
	ASSIST: 1
};

UnitCommand.Berserk=defineObject(UnitListCommand,
{
	_posSelector: null,
	_dynamicAnime: null,
	_dynamicEvent: null,

	openCommand: function () {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},

	moveCommand: function () {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === BerserkCommandMode.SELECT) {
			result = this._moveSelect();
		}
		else if (mode === BerserkCommandMode.ASSIST) {
			result = this._moveAssist();
		}

		return result;
	},
	
	drawCommand: function () {
		var mode = this.getCycleMode();

		if (mode === BerserkCommandMode.SELECT) {
			this._drawSelect();
		}
	},
	
	isCommandDisplayable: function () {
		var unit = this.getCommandTarget();
		var indexArray = AttackChecker.getAttackIndexArray(unit, ItemControl.getEquippedWeapon(unit), true)
		var hasSkill = SkillControl.getPossessionCustomSkill(unit,"Berserk")
		return (indexArray.length != 0 && hasSkill);
		
	},
	
	getCommandName: function () {
		var unit = this.getCommandTarget();
		var skill = SkillControl.getPossessionCustomSkill(unit,"Berserk")
		if (skill && typeof skill.custom.custName == 'string'){
			return skill.custom.custName;
		}
		return "Berserk";
	},

	isRepeatMoveAllowed: function () {
		return false;
	},
	
	_prepareCommandMemberData: function () {
		this._posSelector = createObject(BerserkPosSelector);
	},
	
	_completeCommandMemberData: function () {
		var unit = this.getCommandTarget();
		var filter = this._getUnitFilter();
		var indexArray = AttackChecker.getAttackIndexArray(unit, ItemControl.getEquippedWeapon(unit), true);

		this._posSelector.setUnitOnly(unit, ItemControl.getEquippedWeapon(unit), indexArray, PosMenuType.Attack, filter);
		this._posSelector.setFirstPos();
		this._posSelector.includeFusion();
		this.changeCycleMode(BerserkCommandMode.SELECT);
	},
	
	_moveSelect: function () {
		var result = this._posSelector.movePosSelector();
		var unit = this.getCommandTarget();
		var targetUnit;
		var list = root.getBaseData().getEffectAnimationList(true);
		var anime = root.queryAnime('easycritical')
		var anime2 = root.queryAnime('easydamage');
		this._dynamicAnime = anime
		if (result === PosSelectorResult.SELECT) {
			if (this._isPosSelectable()) {
				targetUnit = this._posSelector.getSelectorTarget(true);
				this._posSelector.endPosSelector();
				this._dynamicEvent = createObject(DynamicEvent)
				var generator = this._dynamicEvent.acquireEventGenerator();
				var Damage = Math.round(AbilityCalculator.getPower(unit,ItemControl.getEquippedWeapon(unit))*1.5);
				var Recoil = Math.round(unit.getHP()/3)
				var isPhys = Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(unit))
				var Acc = Math.round(AbilityCalculator.getHit(unit,ItemControl.getEquippedWeapon(unit))*0.85)
				var isPhys2;
				var data = StructureBuilder.buildAttackExperience();
				data.active = unit;
				data.activeHp = unit.getHp();
				data.activeDamageTotal = Recoil;
				data.passive = targetUnit;
				data.passiveHp = targetUnit.getHp();
				data.passiveDamageTotal = Damage;
				var EXP = ExperienceCalculator.calculateExperience(data);
				if (isPhys){
					isPhys2 = 1;
				}
				else{
					isPhys2 = 2;
				}
				generator.damageHitEx(targetUnit,anime,Damage,isPhys2,Acc,unit,false);
				generator.damageHit(unit,anime2,Recoil,0,unit,false);
				generator.experiencePlus(unit, EXP, false);
				this._dynamicEvent.executeDynamicEvent();
			}
			this.changeCycleMode(BerserkCommandMode.ASSIST);
		}
		else if (result === PosSelectorResult.CANCEL) {
			this._posSelector.endPosSelector();
			return this._listCommandManager.changeCycleMode(ListCommandManagerMode.TITLE)
		}

		return MoveResult.CONTINUE;
	},
	
	_moveAssist: function () {
		this.endCommandAction();
		return MoveResult.END;
	},
	
	_drawSelect: function () {
		this._posSelector.drawPosSelector();
	},

	_isPosSelectable: function () {
		var unit = this._posSelector.getSelectorTarget(true);

		return unit !== null;
	},

	_getUnitFilter: function () {
		return FilterControl.getReverseFilter(this.getCommandTarget().getUnitType());
	}
}
);

BerserkPosSelector = defineObject(PosSelector,
{
	initialize: function() {
		this._mapCursor = createObject(MapCursor);
		this._posMenu = createObject(BerserkPosMenu);
		this._selectorType = this._getDefaultSelectorType();
	}
}
);

BerserkPosMenu = defineObject(PosMenu,
{
	_getObjectFromType: function(type) {
		return BerserkAttackWindow
	}
}
);

BerserkAttackWindow = defineObject(PosAttackWindow,
{
	setPosTarget: function(unit, item, targetUnit, targetItem, isSrc) {
		var isCalculation = false;
		
		if (item !== null && item.isWeapon()) {
			if (isSrc) {
				// If the player has launched an attack, the status can be obtained without conditions.
				this._statusArray = AttackChecker.getAttackStatusInternal(unit, item, targetUnit);
				this._statusArray[0] = Math.round(this._statusArray[0]*1.5)
				this._statusArray[1] = Math.round(this._statusArray[1]*0.85)
				this._statusArray[2] = Math.round(this._statusArray[2]*0)
				isCalculation = true;
			}
			else {
				if (AttackChecker.isCounterattack(targetUnit, unit)) {
					this._statusArray = AttackChecker.getAttackStatusInternal(unit, item, targetUnit);
					isCalculation = true;
				}
				else {
					this._statusArray = AttackChecker.getNonStatus();	
				}
			}
		}
		else {
			this._statusArray = AttackChecker.getNonStatus();
		}
		
		if (isCalculation) {
			this._roundAttackCount = Calculator.calculateRoundCount(unit, targetUnit, item);
			this._roundAttackCount *= Calculator.calculateAttackCount(unit, targetUnit, item);
		}
		else {
			this._roundAttackCount = 0;
		}
		
		this.setPosInfo(unit, item, isSrc);		
	}
}
);