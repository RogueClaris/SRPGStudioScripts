/* Hello, and welcome to the Breakers script! This script enables Awakening/Fates-style Weapon Breaker skills.
* The Keyword is your weapon type's name plus "-Breaker", so for example: "Sword-Breaker" or "Tome-Breaker".
* To obtain bonuses, you must also set a custom parameter on the skill like so:
    {
        BreakerMods:
        {
            Attack: 5,
            Defense: 3,
            Accuracy: 10,
            Avoid: 15,
            Critical: 20, 
            CriticalAvoid: 5,
            RoundCount: 2
        }
    }
* This will grant the unit with the Skill +5 damage dealt, +3 defense, +10 accuracy, +15 avoid,
   +20% critical chance, -5% of receiving a critical hit, and two additional rounds in combat to attack with.

* Enjoy the script!
* Script by Lady Rena
* Script edited by TacticianDaraen
* Script updated after 5 years by Lady Rena.
*/

(function () {

    var MoldbreakerMod0 = SkillRandomizer.isCustomSkillInvokedInternal;
    var MoldbreakerMod1 = HitCalculator.calculateSingleHit;
    var MoldbreakerMod2 = DamageCalculator.calculateAttackPower;
    var MoldbreakerMod3 = DamageCalculator.calculateDefense;
    var MoldbreakerMod4 = HitCalculator.calculateAvoid;
    var MoldbreakerMod5 = CriticalCalculator.calculateSingleCritical;
    var MoldbreakerMod6 = CriticalCalculator.calculateCriticalAvoid;
    var MoldbreakerMod7 = Calculator.calculateRoundCount;

    SkillRandomizer.isCustomSkillInvokedInternal = function (active, passive, skill, keyword) {
        var Equipped = ItemControl.getEquippedWeapon(passive) != null ? ItemControl.getEquippedWeapon(passive).getWeaponType().getName() : "";

        if (keyword === Equipped + "-Breaker") {
            return this._isSkillInvokedInternal(active, passive, skill);
        }

        return MoldbreakerMod0.call(this, active, passive, skill, keyword);
    };

    DamageCalculator.calculateAttackPower = function (active, passive, weapon, isCritical, totalStatus, trueHitValue) {
        var attack = MoldbreakerMod2.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);

        var mod = BreakerManager.begin_mod(active, passive, "attack");

        return attack + mod;
    }

    DamageCalculator.calculateDefense = function (active, passive, weapon, isCritical, totalStatus, trueHitValue) {
        var defense = MoldbreakerMod3.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);

        var mod = BreakerManager.begin_mod(passive, active, "defense");

        return defense + mod;
    }

    HitCalculator.calculateSingleHit = function (active, passive, weapon, totalStatus) {
        var hit = MoldbreakerMod1.call(this, active, passive, weapon, totalStatus)

        var mod = BreakerManager.begin_mod(active, passive, "accuracy");

        return hit + mod;
    }

    HitCalculator.calculateAvoid = function (active, passive, weapon, totalStatus) {
        var avoid = MoldbreakerMod4.call(this, active, passive, weapon, totalStatus)

        var mod = BreakerManager.begin_mod(passive, active, "avoid");

        return avoid + mod
    }

    CriticalCalculator.calculateSingleCritical = function (active, passive, weapon, totalStatus) {
        var critical = MoldbreakerMod5.call(this, active, passive, weapon, totalStatus)

        var mod = BreakerManager.begin_mod(active, passive, "critical");

        return critical + mod
    }

    CriticalCalculator.calculateCriticalAvoid = function (active, passive, weapon, totalStatus) {
        var critical_avoid = MoldbreakerMod6.call(this, active, passive, weapon, totalStatus)

        var mod = BreakerManager.begin_mod(passive, active, "critical_avoid");

        return critical_avoid + mod
    }

    Calculator.calculateRoundCount = function (active, passive, weapon) {
        var round_count = MoldbreakerMod7.call(this, active, passive, weapon);

        var mod = BreakerManager.begin_mod(active, passive, "round_count");

        return round_count + mod;
    }


    BreakerManager = {
        begin_mod: function (active, passive, mode) {
            if (typeof mode != "string" || this.can_mod(active, passive) == false) {
                return 0;
            }

            // ensure lowercase
            var mode = mode.toLowerCase();

            // If the equipped weapon isn't null, get the name of the weapon
            var weapon_name = ItemControl.getEquippedWeapon(passive) != null ? ItemControl.getEquippedWeapon(passive).getWeaponType().getName() : "";

            // Skill is null by default
            var skill = null;

            // The parameter modifier is zero by default
            var mod = 0;

            // If the weapon isn't found, don't modify.
            if (weapon_name == "") {
                return 0;
            }

            // Obtain the Skill
            skill = SkillControl.getPossessionCustomSkill(active, weapon_name + '-Breaker')

            // If the skill is not found, don't modify.
            if (skill == null) {
                return 0;
            }

            var object = skill.custom.BreakerMods

            if (object == null) {
                return 0;
            }

            switch (mode) {
                case "attack":
                    mod = typeof object.Attack == "number" ? object.Attack : 0
                    break;
                case "defense":
                    mod = typeof object.Defense == "number" ? object.Defense : 0
                    break;
                case "accuracy":
                    mod = typeof object.Accuracy == "number" ? object.Accuracy : 0
                    break;
                case "avoid":
                    mod = typeof object.Avoid == "number" ? object.Avoid : 0
                    break;
                case "critical":
                    mod = typeof object.Critical == "number" ? object.Critical : 0
                    break;
                case "critical_avoid":
                    mod = typeof object.CriticalAvoid == "number" ? object.CriticalAvoid : 0
                    break;
                case "round_count":
                    mod = typeof object.RoundCount == "number" ? object.RoundCount : 0
                    break;
            }

            return mod;
        },

        can_mod: function (active, passive) {
            // You can modify this function to add ways to stop Breakers from working.

            // If the passive unit is not given to this function, return true unconditionally.
            if (passive == null) {
                return true;
            }

            // Breakers can be cancelled by a different skill.
            return SkillControl.getPossessionCustomSkill(passive, "Breaker-Breaker") == null
        }
    }
})();