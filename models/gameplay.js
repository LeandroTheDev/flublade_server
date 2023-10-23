//Returns the selected skill result
class SkillsFunctions {
    //Skill Translate
    static skillTranslate(playerStats, skillName) {
        //Documentation
        //0 Damage
        //1 Actual Life
        //2 Actual Mana
        //3 Strength
        //4 Agility
        //5 Intelligence
        //6 Max Life
        //7 Max Mana
        //8 Skill Tier
        //9 Skill Stacks
        switch (skillName) {
            case 'basicAttack': return SkillsFunctions.basicAttack(playerStats[0]);
            case 'furiousAttack': return SkillsFunctions.furiousAttack(playerStats[0], playerStats[1], playerStats[6]);
            case 'poisonous': return SkillsFunctions.poisonous(playerStats[8]);
        }
    }
    //Basic Attack
    static basicAttack(damage) {
        return {
            'damage': damage,
            '=life': null,
            '-life': null,
            '+life': null,
            '=armor': null,
            '-armor': null,
            '+armor': null,
            '=mana': null,
            '-mana': null,
            '+mana': null,
            '=strength': null,
            '-strength': null,
            '+strength': null,
            '=agility': null,
            '-agility': null,
            '+agility': null,
            '=intelligence': null,
            '-intelligence': null,
            '+intelligence': null,
            'buffs': null,
            'debuffs': null,
            'enemyBuffs': null,
            'enemyDebuffs': null,
        };
    }
    //Furious Attack
    static furiousAttack(damage, life, maxLife) {
        //Reduces 10% Max life
        life = life - (maxLife * 0.1);
        var losedLife = maxLife * 0.1;
        if (life <= 0.1) {
            life = 0.1;
        }
        //100% Damage Bonus
        damage = damage * 2;
        return {
            'damage': damage.toFixed(2),
            '=life': life.toFixed(2),
            '-life': losedLife.toFixed(2),
            '+life': null,
            '=armor': null,
            '-armor': null,
            '+armor': null,
            '=mana': null,
            '-mana': null,
            '+mana': null,
            '=strength': null,
            '-strength': null,
            '+strength': null,
            '=agility': null,
            '-agility': null,
            '+agility': null,
            '=intelligence': null,
            '-intelligence': null,
            '+intelligence': null,
            'buffs': null,
            'debuffs': null,
            'enemyBuffs': null,
            'enemyDebuffs': null,
        };
    }
    //Poisonous
    static poisonous(tier) {
        const damage = 2 * tier;
        const rounds = 3;
        const cost = 1 * tier;
        return {
            'damage': damage,
            '=life': null,
            '-life': null,
            '+life': null,
            '=armor': null,
            '-armor': null,
            '+armor': null,
            '=mana': null,
            '-mana': cost,
            '+mana': null,
            '=strength': null,
            '-strength': null,
            '+strength': null,
            '=agility': null,
            '-agility': null,
            '+agility': null,
            '=intelligence': null,
            '-intelligence': null,
            '+intelligence': null,
            'buffs': null,
            'debuffs': null,
            'enemyBuffs': null,
            'enemyDebuffs': [{ 'name': 'poisoned', 'rounds': rounds, 'tier': tier, 'image': skillsId['poisoned']['image'] }],
        };
    }
}
//Returns the selected passive result
class PassivesFunctions {
    //Passive Translate
    static passiveTranslate(playerStats, passiveName) {
        switch (passiveName) {
            //Documentation
            //0 Damage
            //1 Actual Life
            //2 Actual Mana
            //3 Strength
            //4 Agility
            //5 Intelligence
            //6 Max Life
            //7 Max Mana
            //8 Skill Tier
            //9 Skill Stacks
            case 'healthTurbo': return PassivesFunctions.healthTurbo(playerStats[6], playerStats[1]);
            case 'damageTurbo': return PassivesFunctions.damageTurbo(playerStats[0], playerStats[6], playerStats[1]);
            case 'magicalBlock': return PassivesFunctions.magicalBlock();
            case 'petsBlock': return PassivesFunctions.magicalBlock();
            case 'noisy': return PassivesFunctions.magicalBlock();
            case 'poisoned': return PassivesFunctions.poisoned(playerStats[8], playerStats[9]);
        }
    }
    //Health Turbo
    static healthTurbo(maxLife, life) {
        //Variables Creation
        var porcentage = parseFloat((((maxLife - life) / maxLife) * 100).toFixed(2));

        //Porcentage Calculation
        var totalLifeRecovery = 0.0;
        for (var i = 100.0 - porcentage; i <= 100; i += 2) {
            totalLifeRecovery += maxLife * 0.005;
        }

        //Modification
        totalLifeRecovery = parseFloat(totalLifeRecovery.toFixed(2));
        life = life + totalLifeRecovery;
        life = parseFloat(life.toFixed(2));
        if (life > maxLife) {
            life = maxLife;
        }

        //Returning
        return {
            'damage': null,
            '=life': life,
            '-life': null,
            '+life': totalLifeRecovery,
            '=armor': null,
            '-armor': null,
            '+armor': null,
            '=mana': null,
            '-mana': null,
            '+mana': null,
            '=strength': null,
            '-strength': null,
            '+strength': null,
            '=agility': null,
            '-agility': null,
            '+agility': null,
            '=intelligence': null,
            '-intelligence': null,
            '+intelligence': null,
            'buffs': null,
            'debuffs': null,
            'enemyBuffs': null,
            'enemyDebuffs': null,
        };
    }
    //Damage Turbo
    static damageTurbo(damage, maxLife, life) {
        //Variables Creation
        var porcentage = (((maxLife - life) / maxLife) * 100).toFixed(2);
        var totalDamage = 0.0;
        //Porcentage Calculation
        for (var i = 100.0 - porcentage; i <= 100; i += 5) {
            totalDamage += damage * 0.03;
        }

        totalDamage = totalDamage.toFixed(2);

        //Returning
        return {
            'damage': damage + parseFloat(totalDamage),
            '=life': null,
            '-life': null,
            '+life': null,
            '=armor': null,
            '-armor': null,
            '+armor': null,
            '=mana': null,
            '-mana': null,
            '+mana': null,
            '=strength': null,
            '-strength': null,
            '+strength': null,
            '=agility': null,
            '-agility': null,
            '+agility': null,
            '=intelligence': null,
            '-intelligence': null,
            '+intelligence': null,
            'buffs': null,
            'debuffs': null,
            'enemyBuffs': null,
            'enemyDebuffs': null,
        };
    }
    //Poisoned
    static poisoned(tier, stacks) {
        return {
            'damage': null,
            '=life': null,
            '-life': (2 * tier) * stacks,
            '+life': null,
            '=armor': null,
            '-armor': null,
            '+armor': null,
            '=mana': null,
            '-mana': null,
            '+mana': null,
            '=strength': null,
            '-strength': null,
            '+strength': null,
            '=agility': null,
            '-agility': null,
            '+agility': null,
            '=intelligence': null,
            '-intelligence': null,
            '+intelligence': null,
            'buffs': null,
            'debuffs': null,
            'enemyBuffs': null,
            'enemyDebuffs': null,
        };
    }
    //Magical Block
    static magicalBlock() {
        return {
            'damage': null,
            '=life': null,
            '-life': null,
            '+life': null,
            '=armor': null,
            '-armor': null,
            '+armor': null,
            '=mana': null,
            '-mana': null,
            '+mana': null,
            '=strength': null,
            '-strength': null,
            '+strength': null,
            '=agility': null,
            '-agility': null,
            '+agility': null,
            '=intelligence': null,
            '-intelligence': null,
            '+intelligence': null,
            'buffs': null,
            'debuffs': null,
            'enemyBuffs': null,
            'enemyDebuffs': null,
        };
    }
}
//Returns generic system functions
class SystemFunctions {
    static serverName = 'FLUBLADE OFFICIAL';

    //Character Total Damage
    static playerTotalDamage(damage, actualStrength, isRemove, equip) {
        const strengthDamage = actualStrength / 100;
        if (equip != null) {
            if (isRemove) {
                damage = damage / (1 + strengthDamage);
                damage = damage - equip;
                damage = Math.round((damage + Number.EPSILON) * 100) / 100;
                return damage;
            } else {
                damage = damage + equip;
                damage = damage + (damage * strengthDamage);
                damage = Math.round((damage + Number.EPSILON) * 100) / 100;
                return damage;
            }
        } else {
            var damage = damage + Math.round(((damage * strengthDamage) + Number.EPSILON) * 100) / 100;
            var damage = Math.round((damage + Number.EPSILON) * 100) / 100;
            return damage;
        }
    }

    //Calculates all items and player damage
    static refreshPlayerTotalDamage(actualStrength, equips) {
        const strengthDamage = actualStrength / 100;
        var itemEquipped = [];
        var baseDamage = 1 + strengthDamage;
        //Pickup items in equip inventory
        for (var i = 0; i <= equips.length - 1; i++) {
            if (equips[i] != 'none') {
                itemEquipped.push(equips[i]);
            }
        }
        //Calculates again damage for every equip item
        for (var i = 0; i <= itemEquipped.length - 1; i++) {
            if (itemEquipped[i]['baseDamage'] != 0) {
                baseDamage = SystemFunctions.playerTotalDamage(baseDamage, actualStrength, false, itemEquipped[i]['baseDamage']);
            }
        }
        baseDamage = Math.round((baseDamage + Number.EPSILON) * 100) / 100;
        return baseDamage;
    }

    //Character Max Life
    static playerMaxLife(characterClass, actualStrength) {
        //Pickup base Max life
        var maxLife = baseAtributes[characterClass]['life'];
        //Calculation by strength
        for (var i = 0; i < actualStrength; i++) {
            maxLife = maxLife + (maxLife * 0.05);
        }
        //Rounded Life
        maxLife = maxLife.toFixed(2);
        return maxLife;
    }

    //Armor Porcentage
    static armorPorcentageCalculator(armor) {
        //Limit Armor
        if (armor >= 680) {
            return 90.0;
        }
        if (armor <= 20) {
            armor = armor / 2;
            return armor.toFixed(1);
        } else if (armor <= 50 && armor >= 21) {
            const basePorcentage = 10.0;
            armor = (armor / 3) + basePorcentage;
            return armor.toFixed(1);
        } else if (armor <= 150 && armor >= 51) {
            const basePorcentage = 26.6;
            armor = (armor / 5) + basePorcentage;
            return armor.toFixed(1);
        } else {
            const basePorcentage = 56.6;
            armor = (armor / 20) + basePorcentage;
            return armor.toFixed(1);
        }
    }

    //Calculates the item tier
    static calculatesItemTier(itemName) {
        //Calculation Variables
        const name = itemName.substring(0, itemName.length - 3);
        const scalling = itemsId[name]['scalling'];
        const tier = itemName.slice(itemName.length - 2);
        var itemAtributes = itemsId[name];
        //Calculation
        itemAtributes['name'] = itemName;
        itemAtributes['baseArmor'] = itemAtributes['baseArmor'] + ((itemAtributes['baseArmor'] * scalling) * tier);
        itemAtributes['baseMagic'] = itemAtributes['baseMagic'] + ((itemAtributes['baseMagic'] * scalling) * tier);
        itemAtributes['baseDamage'] = itemAtributes['baseDamage'] + ((itemAtributes['baseDamage'] * scalling) * tier);
        itemAtributes['baseStrength'] = itemAtributes['baseStrength'] + ((itemAtributes['baseStrength'] * scalling) * tier);
        itemAtributes['baseAgility'] = itemAtributes['baseAgility'] + ((itemAtributes['baseAgility'] * scalling) * tier);
        itemAtributes['baseIntelligence'] = itemAtributes['baseIntelligence'] + ((itemAtributes['baseIntelligence'] * scalling) * tier);
        return itemAtributes;
    }

    //Calculates the player equipments stats
    static calculatesPlayerEquipmentsStats(equip, character, isRemove, isLevelUp) {
        //LevelUp Stats
        if (isLevelUp) {
            character['armor'] = character['armor'] + baseAtributes[character['class']]['armorLevel'];
            character['magicArmor'] = character['magicArmor'] + baseAtributes[character['class']]['magicArmorLevel'];
            character['strength'] = character['strength'] + baseAtributes[character['class']]['strengthLevel'];
            character['agility'] = character['agility'] + baseAtributes[character['class']]['agilityLevel'];
            character['intelligence'] = character['intelligence'] + baseAtributes[character['class']]['intelligenceLevel'];
            character['damage'] = SystemFunctions.refreshPlayerTotalDamage(character['strength'], character['equips']);
            return character;
        }
        //Remove Stats Else Add
        if (isRemove) {
            character['damage'] = SystemFunctions.playerTotalDamage(character['damage'], character['strength'], true, equip['baseDamage']);
            character['armor'] = character['armor'] - equip['baseArmor'];
            character['magicArmor'] = character['magicArmor'] - equip['baseMagic'];
            character['strength'] = character['strength'] - equip['baseStrength'];
            character['agility'] = character['agility'] - equip['baseAgility'];
            character['intelligence'] = character['intelligence'] - equip['baseIntelligence'];
            return character;
        } else {
            character['armor'] = character['armor'] + equip['baseArmor'];
            character['magicArmor'] = character['magicArmor'] + equip['baseMagic'];
            character['strength'] = character['strength'] + equip['baseStrength'];
            character['agility'] = character['agility'] + equip['baseAgility'];
            character['intelligence'] = character['intelligence'] + equip['baseIntelligence'];
            character['damage'] = SystemFunctions.playerTotalDamage(character['damage'], character['strength'], false, equip['baseDamage']);
            return character;
        }
    }
}

//------
//Gameplay Configuration
//------

//XP to level up
const levelCaps = {
    1: 25,
    2: 50,
    3: 100,
    4: 150,
    5: 200,
    6: 250,
    7: 300,
    8: 350,
    9: 400,
    10: 500,
    11: 600,
    12: 700,
    13: 800,
    14: 900,
    15: 1000,
    16: 1100,
    17: 1200,
    18: 1300,
    19: 1400,
    20: 1500,
    21: 2000,
    22: 2500,
    23: 3000,
    24: 3500,
    25: 4000,
    26: 4500,
    27: 5000,
    28: 5500,
    29: 6000,
    30: 8000,
    31: 10000,
    32: 12000,
    33: 14000,
    34: 16000,
    35: 18000,
    36: 20000,
    37: 22000,
    38: 24000,
    39: 26000,
    40: 30000,
}
//Skills, safe to change: type, image, isLate
const skillsId = {
    //Magics
    'basicAttack': {
        'name': 'basicAttack',
        'createBuff': false,
        'buffRounds': 0,
        'isLate': false,
        'type': 'physical',
        'image': 'assets/skills/basicAttack.png',
        'costType': 'none',
        'costQuantity': '0',
    },
    'furiousAttack': {
        'name': 'furiousAttack',
        'createBuff': '',
        'buffRounds': 0,
        'isLate': false,
        'type': 'physical',
        'image': 'assets/skills/furiousAttack.png',
    },
    'poisonous': {
        'name': 'poisonous',
        'createBuff': '',
        'buffRounds': 0,
        'isLate': false,
        'type': 'toxic',
        'image': 'assets/skills/poisonous.png',
    },
    //Passives
    'healthTurbo': {
        'image': 'assets/skills/passives/healthTurbo.png',
        'name': 'healthTurbo',
        'isLate': true,
        'type': 'life',
        'isStackable': false,
        'isHide': false,
    },
    'damageTurbo': {
        'image': 'assets/skills/passives/damageTurbo.png',
        'name': 'damageTurbo',
        'isLate': false,
        'type': 'physical',
        'isStackable': false,
        'isHide': false,
    },
    'magicalBlock': {
        'image': 'assets/skills/passives/magicalBlock.png',
        'name': 'magicalBlock',
        'isLate': false,
        'type': 'block',
        'isStackable': false,
        'isHide': true,
    },
    'petsBlock': {
        'image': 'assets/skills/passives/petsBlock.png',
        'name': 'petsBlock',
        'isLate': false,
        'type': 'block',
        'isStackable': false,
        'isHide': true,
    },
    'noisy': {
        'image': 'assets/skills/passives/noisy.png',
        'name': 'noisy',
        'isLate': false,
        'type': 'block',
        'costType': 'none',
        'costQuantity': 'none',
        'isStackable': false,
        'isHide': true,
    },
    'poisoned': {
        'image': 'assets/skills/poisonous.png',
        'name': 'poisoned',
        'isLate': true,
        'type': 'toxic',
        'isStackable': true,
        'isHide': false,
    },
}
//Base attributes for classes, safe to change: all
const baseAtributes = {
    'archer': {
        'life': 8,
        'mana': 8,
        'armor': 2,
        'strength': 5,
        'agility': 13,
        'intelligence': 5,
        'buffs': {},
    },
    'assassin': {
        'life': 7,
        'mana': 12,
        'armor': 2,
        'strength': 2,
        'agility': 15,
        'intelligence': 8,
        'buffs': {},
    },
    'berserk': {
        'life': 20,
        'lifeRegen': 1,
        'mana': 5,
        'armor': 0,
        'armorLevel': 1,
        'magicArmor': 0,
        'magicArmorLevel': 0,
        'strength': 12,
        'strengthLevel': 2,
        'agility': 6,
        'agilityLevel': 1,
        'intelligence': 2,
        'intelligenceLevel': 0.5,
        'buffs': {
            'healthTurbo': skillsId['healthTurbo'],
            'damageTurbo': skillsId['damageTurbo'],
            'magicalBlock': skillsId['magicalBlock'],
            'petsBlock': skillsId['petsBlock'],
            'noisy': skillsId['noisy'],
        },
        'skills': {
            'basicAttack': skillsId['basicAttack'],
            'furiousAttack': skillsId['furiousAttack'],
        },
    }
}
//All enemys loots, safe to change: all
const lootDropRate = {
    'small_spider': {
        '0': 'gold',
        '0Chance': 50,
        '0Unique': false,
        '1': 'thread',
        '1Chance': 25,
        '1Unique': false,
        '2': 'cloth',
        '2Chance': 20,
        '2Unique': false,
        '3': 'wooden_sword',
        '3Chance': 10,
        '3Unique': true,
        '4': 'thread',
        '4Chance': 25,
        '4Unique': false,
        '5': 'thread',
        '5Chance': 25,
        '5Unique': false,
        '6': 'thread',
        '6Chance': 25,
        '6Unique': false,
        '7': 'wooden_sword%01',
        '7Chance': 8,
        '7Unique': true,
    }
}
//Items, safe to change: image, equip, 'bases', scalling, passive, sell
const itemsId = {
    //Crafting
    'cloth': {
        'name': 'cloth',
        'image': 'assets/items/cloth.png',
        'equip': 'none',
        'baseArmor': 0,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 0,
        'passive': 'none',
        'sell': 2,
    },
    'thread': {
        'name': 'thread',
        'image': 'assets/items/thread.png',
        'equip': 'none',
        'baseArmor': 0,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 0,
        'passive': 'none',
        'sell': 3,
    },
    'gold': {
        'name': 'gold',
        'image': 'assets/items/gold.png',
        'equip': 'none',
        'baseArmor': 0,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 0,
        'passive': 'none',
        'sell': 0,
    },
    //Weapons
    'wooden_sword': {
        'name': 'wooden_sword',
        'image': 'assets/items/wooden_sword.png',
        'equip': [9, 10],
        'baseArmor': 0,
        'baseMagic': 0,
        'baseDamage': 2,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 1,
        'passive': 'none',
        'sell': 1,
    },
    'sword_of_the_primordial_fire': {
        'name': 'sword_of_the_primordial_fire',
        'image': 'assets/items/sword_of_the_primordial_fire.png',
        'equip': [9, 10],
        'baseArmor': 0,
        'baseMagic': 0,
        'baseDamage': 525,
        'baseStrength': 2,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 0.1,
        'passive': 'none',
        'sell': 5000,
    },
    //Armors
    'leather_helmet': {
        'name': 'leather_helmet',
        'image': 'assets/items/leather_helmet.png',
        'equip': [0],
        'baseArmor': 2,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 1,
        'passive': 'none',
        'sell': 1,
    },
    'leather_gloves': {
        'name': 'leather_gloves',
        'image': 'assets/items/leather_gloves.png',
        'equip': [4, 5],
        'baseArmor': 1,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 2,
        'passive': 'none',
        'sell': 1,
    },
    'leather_chestplate': {
        'name': 'leather_chestplate',
        'image': 'assets/items/leather_chestplate.png',
        'equip': [6],
        'baseArmor': 5,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 0.5,
        'passive': 'none',
        'sell': 1,
    },
    'leather_boots': {
        'name': 'leather_boots',
        'image': 'assets/items/leather_boots.png',
        'equip': [8],
        'baseArmor': 2,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 1,
        'passive': 'none',
        'sell': 1,
    },
    'bones_amulet': {
        'name': 'bones_amulet',
        'image': 'assets/items/bones_amulet.png',
        'equip': [3],
        'baseArmor': 0,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 2,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 0.5,
        'passive': 'none',
        'sell': 1,
    },
}

module.exports = {
    SkillsFunctions,
    PassivesFunctions,
    SystemFunctions,
    levelCaps: levelCaps,
    skillsId: skillsId,
    baseAtributes: baseAtributes,
    lootDropRate: lootDropRate,
    itemsId: itemsId,
};