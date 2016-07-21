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
    var definitionString = createDefinitionString(parseData.moduleName, parseData.moduleCategory, parseData.moduleAuthor);

    var zip = new archiver.create("zip");
    zip.append(definitionString, {name: "definition.xml"});

    if(parseData.thumbnail){
        var thumbnailPath = parseData.inputFolderPath + "/thumbnail.png";
        zip.append(fs.createReadStream(thumbnailPath), {name: "thumbnail.png"});
    }

    var dbString = createDBString(parseData, onSuccess, onError);
    zip.append(dbString, {name: "db.xml"});

    var output = fs.createWriteStream(parseData.outputPath);

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
    var dbTemplate = fs.readFileSync("template/db.ejs").toString();
    var data = deepCopy(parseData);
    data.moduleMergeId = createMergeId(data.moduleName);
    data.encounters = null;
    data.stories = null;
    data.images = null;
    data.items = loadItems(data.inputFolderPath, onSuccess, onError);
    data.npcs = null;
    data.quests = null;
    data.tables = null;
    var dbString = ejs.render(dbTemplate, data);
    return dbString;
}

function loadItems(inputFolderPath, onSuccess, onError){
    var itemsPath = inputFolderPath + "/equipment.txt";
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(itemsPath)
    });

    var itemLineRe = /^[ \w-'\(\)"+,:]+\.[ \w-'\(\)"+.:,]+/;

    var items = [];
    var itemsDictionary = {};
    var idCounter = 1;

    var pageNameRe = /^#@;.+/;
    var tableHeaderRe = /^#th;.+/;
    var typeHeaderRe = /^#st;.+/;

    var equipmentTableData = {};
    var lastTable = null;
    var lastTableName = null;
    var lastSubtable = null;
    var lastSubtableName = null;
    var finishedParsingTables = false;


    //var equipmentTableData = {
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
                var data = line.split(". ")
                var name = data.shift();
                var description = data.join(". ");
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
                var validationResult = model.validateItem(itemsDictionary[name]);
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
                var columnSet = new Set(lastTable.columnNames);
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
                var row = line.split(";");
                if(row.length == lastTable.columnNames.length){
                    lastSubtable.push(row);
                    onSuccess("Loaded item row - " + row[0]);
                    var item = {};
                    itemsDictionary[row[0]] = item; //we're assuming the first column is the name
                    var columns = lastTable.columnNames;
                    for(var i = 0; i < columns.length; i++){
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
        console.log(equipmentTableData);
    });

    var item = {
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
    var validationResult = model.validateItem(item);
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
    var validationResult = model.validateItem(item);
    if(validationResult === undefined){
        items.push(item);
    } else {
        console.log(validationResult);
    }
    return items;
}

function createDefinitionString(moduleName, moduleCategory, moduleAuthor){
    var definitionTemplate = fs.readFileSync("template/definition.ejs").toString();
    var definitionData = {
        moduleName: moduleName,
        moduleCategory: moduleCategory,
        moduleAuthor: moduleAuthor
    };
    var definitionString = ejs.render(definitionTemplate, definitionData);
    return definitionString;
}

function createMergeId(moduleName){
    var mergeId = moduleName;
    mergeId = mergeId.replace(/[^\w]/gi, "");
    return mergeId;
}

function formatID(id){
    var result = "" + id;
    while(result.length < 5){
        result = "0" + result;
    }
    return result;
}
