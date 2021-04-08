/*
This script enables the creation of three Skills that edit
various combat stats based on custom parameters.
The custom parameters are created as follows:
{
	BonusDamage:7,
	BonusAccuracy:15,
	BonusAvoid:15,
	BonusDefense:3,
	BonusCritical:10,
	BonusHits:1
}
Each one does what it says: adds a bonus to Damage, Accuracy,
Avoid, Defense/Resistance, Critical Hit Rate, or number of Hits
based on the input integer. Use the keyword "RogueBlowCL" to make
it activate on the unit's own phase. Use the keyword "RogueRiposteCL"
to make it activate only on the turn of someone who can harm the unit.
Lastly, use the keyword "RogueStanceCL" to make it activate on both turns.
*/

(function() {
TurnCheckCL = function(unit, skill){
	if (root.getCurrentScene() === SceneType.REST){
		return false;
	}
	if (!skill){
		return false;
	}
	if (unit.getUnitType() === UnitType.PLAYER){
		if (skill.getCustomKeyword() === "RogueBlowCL"){
			return root.getCurrentSession().getTurnType() === TurnType.PLAYER;
		}
		else if (skill.getCustomKeyword() === "RogueRiposteCL"){
			return root.getCurrentSession().getTurnType() === TurnType.ENEMY;
		}
	}
	else if (unit.getUnitType() === UnitType.ALLY){
		if (skill.getCustomKeyword() === "RogueBlowCL"){
			return root.getCurrentSession().getTurnType() === TurnType.ALLY;
		}
		else if (skill.getCustomKeyword() === "RogueRiposteCL"){
			return root.getCurrentSession().getTurnType() === TurnType.ENEMY;
		}
	}
	else if (unit.getUnitType() === UnitType.ENEMY){
		if (skill.getCustomKeyword() === "RogueBlowCL"){
			return root.getCurrentSession().getTurnType() === TurnType.ENEMY;
		}
		else if (skill.getCustomKeyword() === "RogueRiposteCL"){
			return root.getCurrentSession().getTurnType() === TurnType.PLAYER || root.getCurrentSession().getTurnType() === TurnType.ALLY;
		}
	}
	return false;
}
var blows0 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	if (keyword === 'RogueBlowCL' || keyword === "RogueStanceCL" || keyword === "RogueRiposteCL") {
		return this._isSkillInvokedInternal(active, passive, skill);
	}
	return blows0.call(this, active, passive, skill, keyword);
};

var AttackPowerCL0 = DamageCalculator.calculateDamage;
DamageCalculator.calculateDamage = function(active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue) {
	var pow = AttackPowerCL0.call(this, active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue);
	var BlowSkill = SkillControl.getPossessionCustomSkill(active, 'RogueBlowCL');
	var RiposteSkill = SkillControl.getPossessionCustomSkill(passive, 'RogueRiposteCL');
	var StanceSkillA = SkillControl.getPossessionCustomSkill(active, 'RogueStanceCL');
	var StanceSkillB = SkillControl.getPossessionCustomSkill(passive, 'RogueStanceCL');
	var ableBlow = TurnCheckCL(active, BlowSkill)
	var ableRiposte = TurnCheckCL(passive, RiposteSkill)
	if (StanceSkillA){
		if (StanceSkillA.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			pow += typeof StanceSkillA.custom.BonusDamage === 'number' ? StanceSkillA.custom.BonusDamage : 0;
		}
		else if (StanceSkillA.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			pow += typeof StanceSkillA.custom.BonusDamage === 'number' ? StanceSkillA.custom.BonusDamage : 0;
		}
		else{
			pow += typeof StanceSkillA.custom.BonusDamage === 'number' ? StanceSkillA.custom.BonusDamage : 0;
		}
	}
	if (StanceSkillB){
		if (StanceSkillB.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			pow += typeof StanceSkillB.custom.BonusDamage === 'number' ? StanceSkillB.custom.BonusDamage : 0;
		}
		else if (StanceSkillB.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			pow += typeof StanceSkillB.custom.BonusDamage === 'number' ? StanceSkillB.custom.BonusDamage : 0;
		}
		else{
			pow += typeof StanceSkillB.custom.BonusDamage === 'number' ? StanceSkillB.custom.BonusDamage : 0;
		}
	}
	if (BlowSkill && ableBlow) {
		if (BlowSkill.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			pow += typeof BlowSkill.custom.BonusDamage === 'number' ? BlowSkill.custom.BonusDamage : 0;
		}
		else if (BlowSkill.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			pow += typeof BlowSkill.custom.BonusDamage === 'number' ? BlowSkill.custom.BonusDamage : 0;
		}
		else{
			pow += typeof BlowSkill.custom.BonusDamage === 'number' ? BlowSkill.custom.BonusDamage : 0;
		}
	}
	if (RiposteSkill && ableRiposte) {
		if (RiposteSkill.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			pow += typeof RiposteSkill.custom.BonusDamage === 'number' ? RiposteSkill.custom.BonusDamage : 0;
		}
		else if (RiposteSkill.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			pow += typeof RiposteSkill.custom.BonusDamage === 'number' ? RiposteSkill.custom.BonusDamage : 0;
		}
		else{
			pow += typeof RiposteSkill.custom.BonusDamage === 'number' ? RiposteSkill.custom.BonusDamage : 0;
		}
	}
	
	return pow;
};

var MightyShield = DamageCalculator.calculateDefense;
DamageCalculator.calculateDefense = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {	
	var def = MightyShield.call(this,active,passive,weapon,isCritical,totalStatus,trueHitValue);
	var BlowSkill = SkillControl.getPossessionCustomSkill(active, 'RogueBlowCL');
	var RiposteSkill = SkillControl.getPossessionCustomSkill(passive, 'RogueRiposteCL');
	var StanceSkillA = SkillControl.getPossessionCustomSkill(active, 'RogueStanceCL');
	var StanceSkillB = SkillControl.getPossessionCustomSkill(passive, 'RogueStanceCL');
	var ableBlow = TurnCheckCL(active, BlowSkill)
	var ableRiposte = TurnCheckCL(passive, RiposteSkill)
	if (StanceSkillA){
		if (StanceSkillA.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			def += typeof StanceSkillA.custom.BonusDefense === 'number' ? StanceSkillA.custom.BonusDefense : 0;
		}
		else if (StanceSkillA.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			def += typeof StanceSkillA.custom.BonusDefense === 'number' ? StanceSkillA.custom.BonusDefense : 0;
		}
		else{
			def += typeof StanceSkillA.custom.BonusDefense === 'number' ? StanceSkillA.custom.BonusDefense : 0;
		}
	}
	if (StanceSkillB){
		if (StanceSkillB.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			def += typeof StanceSkillB.custom.BonusDefense === 'number' ? StanceSkillB.custom.BonusDefense : 0;
		}
		else if (StanceSkillB.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			def += typeof StanceSkillB.custom.BonusDefense === 'number' ? StanceSkillB.custom.BonusDefense : 0;
		}
		else{
			def += typeof StanceSkillB.custom.BonusDefense === 'number' ? StanceSkillB.custom.BonusDefense : 0;
		}
	}
	if (BlowSkill && ableBlow) {
		if (BlowSkill.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			def += typeof BlowSkill.custom.BonusDefense === 'number' ? BlowSkill.custom.BonusDefense : 0;
		}
		else if (BlowSkill.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			def += typeof BlowSkill.custom.BonusDefense === 'number' ? BlowSkill.custom.BonusDefense : 0;
		}
		else{
			def += typeof BlowSkill.custom.BonusDefense === 'number' ? BlowSkill.custom.BonusDefense : 0;
		}
	}
	if (RiposteSkill && ableRiposte) {
		if (RiposteSkill.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			def += typeof RiposteSkill.custom.BonusDefense === 'number' ? RiposteSkill.custom.BonusDefense : 0;
		}
		else if (RiposteSkill.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			def += typeof RiposteSkill.custom.BonusDefense === 'number' ? RiposteSkill.custom.BonusDefense : 0;
		}
		else{
			def += typeof RiposteSkill.custom.BonusDefense === 'number' ? RiposteSkill.custom.BonusDefense : 0;
		}
	}
	
	return def;
};

var SniperScope = HitCalculator.calculateSingleHit;
HitCalculator.calculateSingleHit = function(active, passive, weapon, totalStatus) {
	var result = SniperScope.call(this,active,passive,weapon,totalStatus);
	var BlowSkill = SkillControl.getPossessionCustomSkill(active, 'RogueBlowCL');
	var RiposteSkill = SkillControl.getPossessionCustomSkill(passive, 'RogueRiposteCL');
	var StanceSkillA = SkillControl.getPossessionCustomSkill(active, 'RogueStanceCL');
	var StanceSkillB = SkillControl.getPossessionCustomSkill(passive, 'RogueStanceCL');
	var ableBlow = TurnCheckCL(active, BlowSkill)
	var ableRiposte = TurnCheckCL(passive, RiposteSkill)
	if (StanceSkillA){
		if (StanceSkillA.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			result += typeof StanceSkillA.custom.BonusAccuracy === 'number' ? StanceSkillA.custom.BonusAccuracy : 0;
		}
		else if (StanceSkillA.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			result += typeof StanceSkillA.custom.BonusAccuracy === 'number' ? StanceSkillA.custom.BonusAccuracy : 0;
		}
		else{
			result += typeof StanceSkillA.custom.BonusAccuracy === 'number' ? StanceSkillA.custom.BonusAccuracy : 0;
		}
	}
	if (StanceSkillB){
		if (StanceSkillB.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			result += typeof StanceSkillB.custom.BonusAccuracy === 'number' ? StanceSkillB.custom.BonusAccuracy : 0;
		}
		else if (StanceSkillB.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			result += typeof StanceSkillB.custom.BonusAccuracy === 'number' ? StanceSkillB.custom.BonusAccuracy : 0;
		}
		else{
			result += typeof StanceSkillB.custom.BonusAccuracy === 'number' ? StanceSkillB.custom.BonusAccuracy : 0;
		}
	}
	if (BlowSkill && ableBlow) {
		if (BlowSkill.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			result += typeof BlowSkill.custom.BonusAccuracy === 'number' ? BlowSkill.custom.BonusAccuracy : 0;
		}
		else if (BlowSkill.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			result += typeof BlowSkill.custom.BonusAccuracy === 'number' ? BlowSkill.custom.BonusAccuracy : 0;
		}
		else{
			result += typeof BlowSkill.custom.BonusAccuracy === 'number' ? BlowSkill.custom.BonusAccuracy : 0;
		}
	}
	if (RiposteSkill && ableRiposte) {
		if (RiposteSkill.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			result += typeof RiposteSkill.custom.BonusAccuracy === 'number' ? RiposteSkill.custom.BonusAccuracy : 0;
		}
		else if (RiposteSkill.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			result += typeof RiposteSkill.custom.BonusAccuracy === 'number' ? RiposteSkill.custom.BonusAccuracy : 0;
		}
		else{
			result += typeof RiposteSkill.custom.BonusAccuracy === 'number' ? RiposteSkill.custom.BonusAccuracy : 0;
		}
	}
	return result
};

var MightyBlow = CriticalCalculator.calculateSingleCritical;
CriticalCalculator.calculateSingleCritical = function(active, passive, weapon, totalStatus) {
	var result = MightyBlow.call(this,active,passive,weapon,totalStatus);
	var BlowSkill = SkillControl.getPossessionCustomSkill(active, 'RogueBlowCL');
	var RiposteSkill = SkillControl.getPossessionCustomSkill(passive, 'RogueRiposteCL');
	var StanceSkillA = SkillControl.getPossessionCustomSkill(active, 'RogueStanceCL');
	var StanceSkillB = SkillControl.getPossessionCustomSkill(passive, 'RogueStanceCL');
	var ableBlow = TurnCheckCL(active, BlowSkill)
	var ableRiposte = TurnCheckCL(passive, RiposteSkill)
	if (StanceSkillA){
		if (StanceSkillA.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			result += typeof StanceSkillA.custom.BonusCritical === 'number' ? StanceSkillA.custom.BonusCritical : 0;
		}
		else if (StanceSkillA.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			result += typeof StanceSkillA.custom.BonusCritical === 'number' ? StanceSkillA.custom.BonusCritical : 0;
		}
		else{
			result += typeof StanceSkillA.custom.BonusCritical === 'number' ? StanceSkillA.custom.BonusCritical : 0;
		}
	}
	if (StanceSkillB){
		if (StanceSkillB.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			result += typeof StanceSkillB.custom.BonusCritical === 'number' ? StanceSkillB.custom.BonusCritical : 0;
		}
		else if (StanceSkillB.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			result += typeof StanceSkillB.custom.BonusCritical === 'number' ? StanceSkillB.custom.BonusCritical : 0;
		}
		else{
			result += typeof StanceSkillB.custom.BonusCritical === 'number' ? StanceSkillB.custom.BonusCritical : 0;
		}
	}
	if (BlowSkill && ableBlow) {
		if (BlowSkill.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			result += typeof BlowSkill.custom.BonusCritical === 'number' ? BlowSkill.custom.BonusCritical : 0;
		}
		else if (BlowSkill.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			result += typeof BlowSkill.custom.BonusCritical === 'number' ? BlowSkill.custom.BonusCritical : 0;
		}
		else{
			result += typeof BlowSkill.custom.BonusCritical === 'number' ? BlowSkill.custom.BonusCritical : 0;
		}
	}
	if (RiposteSkill && ableRiposte) {
		if (RiposteSkill.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			result += typeof RiposteSkill.custom.BonusCritical === 'number' ? RiposteSkill.custom.BonusCritical : 0;
		}
		else if (RiposteSkill.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			result += typeof RiposteSkill.custom.BonusCritical === 'number' ? RiposteSkill.custom.BonusCritical : 0;
		}
		else{
			result += typeof RiposteSkill.custom.BonusCritical === 'number' ? RiposteSkill.custom.BonusCritical : 0;
		}
	}
	return result;
};

var FancyFeet = HitCalculator.calculateAvoid;
HitCalculator.calculateAvoid = function(active, passive, weapon, totalStatus) {
	var Dodge = FancyFeet.call(this, active, passive, weapon, totalStatus);
	var BlowSkill = SkillControl.getPossessionCustomSkill(active, 'RogueBlowCL');
	var RiposteSkill = SkillControl.getPossessionCustomSkill(passive, 'RogueRiposteCL');
	var StanceSkillA = SkillControl.getPossessionCustomSkill(active, 'RogueStanceCL');
	var StanceSkillB = SkillControl.getPossessionCustomSkill(passive, 'RogueStanceCL');
	var ableBlow = TurnCheckCL(active, BlowSkill)
	var ableRiposte = TurnCheckCL(passive, RiposteSkill)
	if (StanceSkillA){
		if (StanceSkillA.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			Dodge += typeof StanceSkillA.custom.BonusAvoid === 'number' ? StanceSkillA.custom.BonusAvoid : 0;
		}
		else if (StanceSkillA.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			Dodge += typeof StanceSkillA.custom.BonusAvoid === 'number' ? StanceSkillA.custom.BonusAvoid : 0;
		}
		else{
			Dodge += typeof StanceSkillA.custom.BonusAvoid === 'number' ? StanceSkillA.custom.BonusAvoid : 0;
		}
	}
	if (StanceSkillB){
		if (StanceSkillB.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			Dodge += typeof StanceSkillB.custom.BonusAvoid === 'number' ? StanceSkillB.custom.BonusAvoid : 0;
		}
		else if (StanceSkillB.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			Dodge += typeof StanceSkillB.custom.BonusAvoid === 'number' ? StanceSkillB.custom.BonusAvoid : 0;
		}
		else{
			Dodge += typeof StanceSkillB.custom.BonusAvoid === 'number' ? StanceSkillB.custom.BonusAvoid : 0;
		}
	}
	if (BlowSkill && ableBlow) {
		if (BlowSkill.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			Dodge += typeof BlowSkill.custom.BonusAvoid === 'number' ? BlowSkill.custom.BonusAvoid : 0;
		}
		else if (BlowSkill.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			Dodge += typeof BlowSkill.custom.BonusAvoid === 'number' ? BlowSkill.custom.BonusAvoid : 0;
		}
		else{
			Dodge += typeof BlowSkill.custom.BonusAvoid === 'number' ? BlowSkill.custom.BonusAvoid : 0;
		}
	}
	if (RiposteSkill && ableRiposte) {
		if (RiposteSkill.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			Dodge += typeof RiposteSkill.custom.BonusAvoid === 'number' ? RiposteSkill.custom.BonusAvoid : 0;
		}
		else if (RiposteSkill.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			Dodge += typeof RiposteSkill.custom.BonusAvoid === 'number' ? RiposteSkill.custom.BonusAvoid : 0;
		}
		else{
			Dodge += typeof RiposteSkill.custom.BonusAvoid === 'number' ? RiposteSkill.custom.BonusAvoid : 0;
		}
	}
	return Dodge;
};

var ThousandCuts = Calculator.calculateAttackCount;
Calculator.calculateAttackCount = function(active, passive, weapon) {
	var count = ThousandCuts.call(this, active, passive, weapon);
	var BlowSkill = SkillControl.getPossessionCustomSkill(active, 'RogueBlowCL');
	var RiposteSkill = SkillControl.getPossessionCustomSkill(passive, 'RogueRiposteCL');
	var StanceSkillA = SkillControl.getPossessionCustomSkill(active, 'RogueStanceCL');
	var StanceSkillB = SkillControl.getPossessionCustomSkill(passive, 'RogueStanceCL');
	var ableBlow = TurnCheckCL(active, BlowSkill)
	var ableRiposte = TurnCheckCL(passive, RiposteSkill)
	if (StanceSkillA){
		if (StanceSkillA.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			count += typeof StanceSkillA.custom.BonusHits === 'number' ? StanceSkillA.custom.BonusHits : 0;
		}
		else if (StanceSkillA.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			count += typeof StanceSkillA.custom.BonusHits === 'number' ? StanceSkillA.custom.BonusHits : 0;
		}
		else{
			count += typeof StanceSkillA.custom.BonusHits === 'number' ? StanceSkillA.custom.BonusHits : 0;
		}
	}
	if (StanceSkillB){
		if (StanceSkillB.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			count += typeof StanceSkillB.custom.BonusHits === 'number' ? StanceSkillB.custom.BonusHits : 0;
		}
		else if (StanceSkillB.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			count += typeof StanceSkillB.custom.BonusHits === 'number' ? StanceSkillB.custom.BonusHits : 0;
		}
		else{
			count += typeof StanceSkillB.custom.BonusHits === 'number' ? StanceSkillB.custom.BonusHits : 0;
		}
	}
	if (BlowSkill && ableBlow) {
		if (BlowSkill.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			count += typeof BlowSkill.custom.BonusHits === 'number' ? BlowSkill.custom.BonusHits : 0;
		}
		else if (BlowSkill.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(active))){
			count += typeof BlowSkill.custom.BonusHits === 'number' ? BlowSkill.custom.BonusHits : 0;
		}
		else{
			count += typeof BlowSkill.custom.BonusHits === 'number' ? BlowSkill.custom.BonusHits : 0;
		}
	}
	if (RiposteSkill && ableRiposte) {
		if (RiposteSkill.custom.PhysicalOnly && Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			count += typeof RiposteSkill.custom.BonusHits === 'number' ? RiposteSkill.custom.BonusHits : 0;
		}
		else if (RiposteSkill.custom.MagicalOnly && !Miscellaneous.isPhysicsBattle(ItemControl.getEquippedWeapon(passive))){
			count += typeof RiposteSkill.custom.BonusHits === 'number' ? RiposteSkill.custom.BonusHits : 0;
		}
		else{
			count += typeof RiposteSkill.custom.BonusHits === 'number' ? RiposteSkill.custom.BonusHits : 0;
		}
	}
	return count;
};

}) (); //This seemingly random () is an important part of the function. Do not remove it.