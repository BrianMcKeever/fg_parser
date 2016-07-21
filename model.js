var validate = require("validate.js");
var rarities = ["", "common", "uncommon", "rare", "very rare", "legendary", "artifact"];
var fgTrueFalse = [0, 1];

validate.validators.isArmor = function(value, options, key, attributes){
    if(options !== true) return null;
    if(value == "armor"){
        var message = "";
        var name = attributes["name"];
        if(!validate.contains(attributes, "ac")){
            message += "Armor " + name + " is missing AC\n";
        }
        if(!validate.contains(attributes, "dexBonus")){
            message += "Armor " + name + " is missing dexBonus\n";
        }
        if(!validate.contains(attributes, "strengthRequirement")){
            message += "Armor " + name + " is missing strengthRequirement\n";
        } else {
            let strengthRequirement = attributes["strengthRequirement"];
            if (strengthRequirement == "-"){
                //nothing
            } else if (validate.isInteger(strengthRequirement) && strengthRequirement >= 0){
                //nothing
            } else {
                message += "Armor: " + name + "'s strength requirement is not - or a number >= 0\n";
            }
        }
        if(!validate.contains(attributes, "properties")){
            message += "Armor " + name + " is missing properties\n";
        }
        if(message === "") return null;
        return message;

    } 
    return null;
};

validate.validators.isWeapon = function(value, options, key, attributes){
    if(options !== true) return null;
    if(value == "weapon"){
        var message = "";
        var name = attributes["name"];
        if(!validate.contains(attributes, "damage")){
            message += "Weapon " + name + " is missing damage\n";
        }
        if(!validate.contains(attributes, "properties")){
            message += "Weapon " + name + " is missing properties\n";
        }
        if(message === "") return null;
        return message;

    } 
    return null;
};

var itemConstraints = {
    id: {
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThan: 0
        }
    },
    weight: {
        presence: true,
    },
    type: {
        presence: true,
        isWeapon: true,
        isArmor:  true
    },
    subtype: {
    },
    rarity: {
        inclusion: rarities
    },
    unidentifiedName: {
    },
    notes: {
    },
    name: {
        presence: true
    },
    isLocked: {
        presence: true,
        inclusion: fgTrueFalse
    },
    isTemplate: {
        presence: true,
        inclusion: fgTrueFalse
    },
    isIdentified: {
        presence: true,
        inclusion: fgTrueFalse
    },
    description: {
    },
    cost: {
    },
    bonus: {
        numericality: {
            greaterThanOrEqualTo: 0
        }
    },
    ac: {
        numericality: {
            greaterThanOrEqualTo: 0
        }
    },
    dexBonus: {
        numericality: {
            greaterThanOrEqualTo: 0
        }
    },
    strengthRequirement: {
        //checked in isArmor
    },
    damage: {
        format: "(([0-9]+d[0-9]+|[0-9]+) (piercing|slashing|bludgeoning)|-)"
            //1d6 piercing
            //1 piercing
            //-
    },
    properties: {
    }
}

exports.validateItem = function(item){
    return validate(item, itemConstraints);
};
