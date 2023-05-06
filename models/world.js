//Dependencies
const Sequelize = require('sequelize');
const db = require('./db');

//Database tables
const world = db.define('world', {
    id_world: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: 'varchar(50)',
        allowNull: false,
        defaultValue: 'null'
    },
    npc: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    enemy: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list1: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list2: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list3: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list4: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list5: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list6: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list7: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list8: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list9: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list10: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list11: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list12: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list13: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list14: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list15: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list16: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list17: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list18: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list19: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list20: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list21: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list22: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list23: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list24: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list25: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list26: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list27: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list28: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list29: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list30: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list31: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list32: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list33: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list34: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list35: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list36: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list37: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list38: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list39: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list40: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list41: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list42: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list43: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list44: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list45: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list46: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list47: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list48: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list49: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list50: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list51: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list52: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list53: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list54: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list55: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list56: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list57: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list58: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list59: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list60: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list61: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list62: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list63: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list64: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list65: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list66: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list67: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list68: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list69: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list70: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list71: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list72: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list73: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list74: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list75: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list76: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list77: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list78: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list79: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list80: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list81: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list82: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list83: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list84: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list85: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list86: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list87: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list88: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list89: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list90: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list91: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list92: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list93: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list94: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list95: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list96: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list97: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list98: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list99: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },
    list100: {
        type: 'longtext',
        allowNull: false,
        defaultValue: '{}'
    },

}, {
    //Disable defaultValues from sequelize

    timestamps: false,
    createdAt: false,
    updatedAt: false,
});

//Exports globally
module.exports = world;