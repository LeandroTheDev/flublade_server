const { statusAttributes } = require('./config');

class Status {
    /**
    * Returns the character max life based in hes strength and base life.
    *
    * @param {number} strength - Actual Strength from character
    * @param {number} life - Base Life from character
    * @returns {number} - Returns the max life
    */
    static getCharacterMaxLife(strength, life) {
        //Actual Life + Bonus Life
        return life + (strength * statusAttributes['lifeBonusPerStrength'] * life);
    }
    /**
    * Returns the character max mana based in hes intelligence and base mana.
    *
    * @param {number} intelligence - Actual Intelligence from character
    * @param {number} mana - Base Mana from character
    * @returns {number} - Returns the max mana
    */
    static getCharacterMaxMana(intelligence, mana) {
        //Actual Mana + Bonus Mana
        return mana + (intelligence * statusAttributes['manaBonusPerIntelligence'] * mana);
    }
}

module.exports.status = Status;