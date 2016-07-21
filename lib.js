const ejs = require("ejs");
const archiver = require("archiver");
const fs = require('fs');
const validate = require("validate.js");
const model = require("./model.js");
const {ipcMain} = require('electron');

exports.parse = function parse(parseData, onSuccess, onError, onDone){
//        parseData = {
//            "moduleName":     moduleNameInput.value,
//            "moduleCategory": moduleCategoryInput.value,
//            "moduleAuthor":   moduleAuthorInput.value,
//
//            "inputFolderPath": inputFolderPathInput.value,
//            "outputPath":      outputPathInput.value,
//
//            "moduleType": moduleType,
//
//            "thumbnail": thumbnailCheckbox.checked,
//            "classes":   fileClassCheckbox.checked,
//            "equipment": fileEquipmentCheckbox.checked,
//            "feats":     fileFeatsCheckbox.checked,
//            "npcs":      fileNPCsCheckbox.checked,
//            "races":     fileRacesCheckbox.checked,
//            "spells":    fileSpellsCheckbox.checked,
//            "tokens":    fileTokensCheckbox.checked
//        }
    let definitionString = createDefinitionString(parseData.moduleName, parseData.moduleCategory, parseData.moduleAuthor);

    let zip = new archiver.create("zip");
    zip.append(definitionString, {name: "definition.xml"});

    if(parseData.thumbnail){
        let thumbnailPath = parseData.inputFolderPath + "\\thumbnail.png";
        if(checkFileExists(thumbnailPath, onError)){
            zip.append(fs.createReadStream(thumbnailPath), {name: "thumbnail.png"});
        }
    }

    let dbString = createDBString(parseData, onSuccess, onError);
    zip.append(dbString, {name: "db.xml"});

    let output = fs.createWriteStream(parseData.outputPath);

    output.on('close', function() {
        onSuccess(zip.pointer() + ' total bytes');
        onSuccess('The module has been finished.');
        onDone();
    });

    zip.on('error', function(err) {
        throw err;
    });

    zip.pipe(output);
    zip.finalize();
}

function deepCopy(object){
    return JSON.parse(JSON.stringify(object));
}

function createDBString(parseData, onSuccess, onError){
    let dbTemplate = fs.readFileSync("template/db.ejs").toString();
    let data = deepCopy(parseData);
    data.moduleMergeId = createMergeId(data.moduleName);

    data.backgrounds =     loadBackgrounds(    parseData, onSuccess, onError);
    data.classes =         loadClasses(        parseData, onSuccess, onError);
    data.encounters =      loadEncounters(     parseData, onSuccess, onError);
    data.items =           loadEquipment(      parseData, onSuccess, onError);
    data.feats =           loadFeats(          parseData, onSuccess, onError);
    data.images =          loadImages(         parseData, onSuccess, onError);
    data.imagePins =       loadImagePins(      parseData, onSuccess, onError);
    data.imageGrids =      loadImageGrids(     parseData, onSuccess, onError);
    data.magicItems =      loadMagicItems(     parseData, onSuccess, onError);
    data.npcs =            loadNPCs(           parseData, onSuccess, onError);
    data.parcels =         loadParcels(        parseData, onSuccess, onError);
    data.pregens =         loadPregens(        parseData, onSuccess, onError);
    data.races =           loadRaces(          parseData, onSuccess, onError);
    data.referenceManual = loadReferenceManual(parseData, onSuccess, onError);
    data.quests =          loadQuests(         parseData, onSuccess, onError);
    data.spells =          loadSpells(         parseData, onSuccess, onError);
    data.stories =         loadStory(          parseData, onSuccess, onError);
    data.tables =          loadTables(         parseData, onSuccess, onError);
    data.tokens =          loadTokens(         parseData, onSuccess, onError);
    let dbString = ejs.render(dbTemplate, data);
    return dbString;
}

function loadClasses(parseData, onSuccess, onError){
    if(!parseData.classes) return;
    let path = parseData.inputFolderPath + "/classes.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadFeats(parseData, onSuccess, onError){
    if(!parseData.feats) return;
    let path = parseData.inputFolderPath + "/feats.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadNPCs(parseData, onSuccess, onError){
    if(!parseData.npcs) return;
    let path = parseData.inputFolderPath + "/npcs.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadRaces(parseData, onSuccess, onError){
    if(!parseData.races) return;
    let path = parseData.inputFolderPath + "/races.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadSpells(parseData, onSuccess, onError){
    if(!parseData.spells) return;
    let path = parseData.inputFolderPath + "/spells.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadTokens(parseData, onSuccess, onError){
    if(!parseData.tokens) return;
    let path = parseData.inputFolderPath + "/tokens.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadBackgrounds(parseData, onSuccess, onError){
    if(!parseData.backgrounds) return;
    let path = parseData.inputFolderPath + "/backgrounds.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadEncounters(parseData, onSuccess, onError){
    if(!parseData.encounters) return;
    let path = parseData.inputFolderPath + "/encounters.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadImageGrids(parseData, onSuccess, onError){
    if(!parseData.imageGrids) return;
    let path = parseData.inputFolderPath + "/imagegrids.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadImagePins(parseData, onSuccess, onError){
    if(!parseData.imagePins) return;
    let path = parseData.inputFolderPath + "/imagepins.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadImages(parseData, onSuccess, onError){
    if(!parseData.images) return;
    let path = parseData.inputFolderPath + "/images.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadMagicItems(parseData, onSuccess, onError){
    if(!parseData.magicItems) return;
    let path = parseData.inputFolderPath + "/magicitems.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadParcels(parseData, onSuccess, onError){
    if(!parseData.parcels) return;
    let path = parseData.inputFolderPath + "/parcels.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadPregens(parseData, onSuccess, onError){
    if(!parseData.pregens) return;
    let path = parseData.inputFolderPath + "/pregens.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadReferenceManual(parseData, onSuccess, onError){
    if(!parseData.referenceManual) return;
    let path = parseData.inputFolderPath + "/referencemanual.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadQuests(parseData, onSuccess, onError){
    if(!parseData.quests) return;
    let path = parseData.inputFolderPath + "/quests.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadStory(parseData, onSuccess, onError){
    if(!parseData.story) return;
    let path = parseData.inputFolderPath + "/story.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadTables(parseData, onSuccess, onError){
    if(!parseData.tables) return;
    let path = parseData.inputFolderPath + "/tables.txt";
    if(!checkFileExists(path, onError)){
        return null;
    }
}

function loadEquipment(parseData, onSuccess, onError){
    if(!parseData.equipment) return;
    let itemsPath = parseData.inputFolderPath + "/equipment.txt";
    if(!checkFileExists(itemsPath, onError)){
        return null;
    }
    let lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(itemsPath)
    });

    let itemLineRe = /^[ \w-'\(\)"+,:]+\.[ \w-'\(\)"+.:,]+/;

    let items = [];
    let itemsDictionary = {};
    let idCounter = 1;

    let pageNameRe = /^#@;.+/;
    let tableHeaderRe = /^#th;.+/;
    let typeHeaderRe = /^#st;.+/;

    let equipmentTableData = {};
    let lastTable = null;
    let lastTableName = null;
    let lastSubtable = null;
    let lastSubtableName = null;
    let finishedParsingTables = false;


    //let equipmentTableData = {
    //  "Adventuring Gear": {
    //      columnNames: ["Name", "Cost", "Weight"],
    //      "Amunition": [
    //          ["Arrows", "1 gp", "0.05 lb"]
    //      ]
    //  }
    //}
    lineReader.on('line', function (line) {
        if(finishedParsingTables){
            if(itemLineRe.test(line)){
                let data = line.split(". ")
                let name = data.shift();
                let description = data.join(". ");
                if(itemsDictionary[name] === undefined){
                    onError("Item not contained in any table: " + name);
                    return;
                }
                itemsDictionary[name].name = name;
                itemsDictionary[name].description = description;
                itemsDictionary[name].isLocked = 1;
                itemsDictionary[name].isTemplate = 0;
                itemsDictionary[name].isIdentified = 1;
                itemsDictionary[name].id = formatID(idCounter);
                idCounter++;
                let validationResult = model.validateItem(itemsDictionary[name]);
                if(validationResult !== undefined){
                    onError("Item failed validation: " + name + " " + JSON.stringify(validationResult));
                }
                onSuccess("Loaded item description - " + name);
            } else {
                onError("Item line has wrong format or invalid characters- " + line);
            }

        } else {
            if(pageNameRe.test(line)){
                lastTableName = line.split(";")[1];
                if(equipmentTableData[lastTableName] !== undefined){
                    onError("duplicate table name - " + lastTableName);
                    return;
                }
                lastTable = {};
                lastSubtable = null;

                equipmentTableData[lastTableName] = lastTable;
            } else if (tableHeaderRe.test(line)){
                if(lastTable === null){
                    onError("Can't add header to unknown table - " + line);
                    return;
                }
                if(lastTable.columnNames !== undefined){
                    onError("Can't add header to table with header - " + line);
                    return;
                }
                lastTable.columnNames = line.split(";");
                lastTable.columnNames.shift(); //discarding "#th"
                let columnSet = new Set(lastTable.columnNames);
                if(lastTable.columnNames.length != columnSet.size){
                    onError("Duplicate column names - " + line);
                }
            } else if (typeHeaderRe.test(line)){
                lastSubtableName = line.split(";")[1];
                if(lastTable === null){
                    onError("Can't add subtable to unknown table - " + lastSubtableName);
                    return;
                }
                if(lastTable[lastSubtableName] !== undefined){
                    onError("duplicate subtable name - " + lastSubtableName);
                    return;
                }
                lastSubtable = [];
                lastTable[lastSubtableName] = lastSubtable;
            } else if (line == ""){
                finishedParsingTables = true;
            } else {
                if(lastSubtable === null){
                    onError("Can't add item to unknown subtable - " + line);
                    return
                }
                let row = line.split(";");
                if(row.length == lastTable.columnNames.length){
                    lastSubtable.push(row);
                    onSuccess("Loaded item row - " + row[0]);
                    let item = {};
                    itemsDictionary[row[0]] = item; //we're assuming the first column is the name
                    let columns = lastTable.columnNames;
                    for(let i = 0; i < columns.length; i++){
                        item[columns[i]] = row[i];
                    }
                    item.type = lastTableName;
                    item.subtype = lastSubtableName;
                } else {
                    onError("Wrong number of columns - " + line);
                }
            }
        }
    });
    lineReader.on('close', function () {
        //console.log(equipmentTableData);
    });

    /*
    let item = {
        id: "00001",
        weight: 5,
        type: "weapon",
        subtype: "melee weapon",
        rarity: "common",
        unidentifiedName: "short sword",
        notes: "weapon notes",
        name: "short sword",
        isLocked: 0,
        isTemplate: 0,
        isIdentified: 0,
        description: "short sword description",
        cost: "15 gp",
        bonus: 0,
        damage: "1d6 slashing",
        properties: "light"
    };
    let validationResult = model.validateItem(item);
    if(validationResult === undefined){
        items.push(item);
    } else {
        console.log(validationResult);
    }
    item = {
        id: "00002",
        weight: 15,
        type: "armor",
        subtype: "leather",
        rarity: "common",
        unidentifiedName: "hide armor",
        notes: "hide armor notes",
        name: "hide armor",
        isLocked: 0,
        isTemplate: 0,
        isIdentified: 0,
        description: "hide armor description",
        cost: "5 gp",
        bonus: 3,
        ac: 13,
        dexBonus: 10,
        strengthRequirement: 0,
        properties: ""
    };
    validationResult = model.validateItem(item);
    if(validationResult === undefined){
        items.push(item);
    } else {
        console.log(validationResult);
    }
    */
    return items;
}

function createDefinitionString(moduleName, moduleCategory, moduleAuthor){
    let definitionTemplate = fs.readFileSync("template/definition.ejs").toString();
    let definitionData = {
        moduleName: moduleName,
        moduleCategory: moduleCategory,
        moduleAuthor: moduleAuthor
    };
    let definitionString = ejs.render(definitionTemplate, definitionData);
    return definitionString;
}

function createMergeId(moduleName){
    let mergeId = moduleName;
    mergeId = mergeId.replace(/[^\w]/gi, "");
    return mergeId;
}

function formatID(id){
    let result = "" + id;
    while(result.length < 5){
        result = "0" + result;
    }
    return result;
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
}

function checkFileExists(path, onError){
    try{
        fs.accessSync(path, fs.R_OK);
    }catch(err){
        console.log(err);
        onError(path + " either doesn't exist or is in a location unreadable to the program.");
        return false;
    }
    return true;
}
