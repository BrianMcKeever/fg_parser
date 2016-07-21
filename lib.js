const ejs = require("ejs");
const archiver = require("archiver");
const fs = require('fs');
const validate = require("validate.js");
const model = require("./model.js");
const {ipcMain} = require('electron');
const series = require("run-series");

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

    series([
        loadBackgrounds.bind(    undefined, parseData, onSuccess, onError),
        loadClasses.bind(        undefined, parseData, onSuccess, onError),
        loadEncounters.bind(     undefined, parseData, onSuccess, onError),
        loadEquipment.bind(      undefined, parseData, onSuccess, onError),
        loadFeats.bind(          undefined, parseData, onSuccess, onError),
        loadImages.bind(         undefined, parseData, onSuccess, onError),
        loadImagePins.bind(      undefined, parseData, onSuccess, onError),
        loadImageGrids.bind(     undefined, parseData, onSuccess, onError),
        loadMagicItems.bind(     undefined, parseData, onSuccess, onError),
        loadNPCs.bind(           undefined, parseData, onSuccess, onError),
        loadParcels.bind(        undefined, parseData, onSuccess, onError),
        loadPregens.bind(        undefined, parseData, onSuccess, onError),
        loadRaces.bind(          undefined, parseData, onSuccess, onError),
        loadReferenceManual.bind(undefined, parseData, onSuccess, onError),
        loadQuests.bind(         undefined, parseData, onSuccess, onError),
        loadSpells.bind(         undefined, parseData, onSuccess, onError),
        loadStory.bind(          undefined, parseData, onSuccess, onError),
        loadTables.bind(         undefined, parseData, onSuccess, onError),
        loadTokens.bind(         undefined, parseData, onSuccess, onError)
        ], zipResults.bind(      undefined, parseData, onSuccess, onError, onDone)
    );
}

function createLoadCallback(parseData, loadFunction){
    let result = function(callback){
        loadFunction(parseData, onSuccess, onError, callback);
    }
    return result;
}

function zipResults(parseData, onSuccess, onError, onDone, error, results){
    //This is being called by the series in parse once all the data has been
    //parsed.

    let definitionString = createDefinitionString(parseData.moduleName, parseData.moduleCategory, parseData.moduleAuthor);
    let zip = new archiver.create("zip");
    zip.append(definitionString, {name: "definition.xml"});

    if(parseData.thumbnail){
        let thumbnailPath = parseData.inputFolderPath + "\\thumbnail.png";
        if(checkFileExists(thumbnailPath, onError)){
            zip.append(fs.createReadStream(thumbnailPath), {name: "thumbnail.png"});
        }
    }

    let data = {};
    data.moduleName =     parseData.moduleName;
    data.moduleCategory = parseData.moduleCategory;
    data.moduleMergeId = createMergeId(data.moduleName);
    data.backgrounds =     results[0];
    data.classes =         results[1];
    data.encounters =      results[2];
    data.items =           results[3];
    data.feats =           results[4];
    data.images =          results[5];
    data.imagePins =       results[6];
    data.imageGrids =      results[7];
    data.magicItems =      results[8];
    data.npcs =            results[9];
    data.parcels =         results[10];
    data.pregens =         results[11];
    data.races =           results[12];
    data.referenceManual = results[13];
    data.quests =          results[14];
    data.spells =          results[15];
    data.stories =         results[16];
    data.tables =          results[17];
    data.tokens =          results[18];
    let dbTemplate = fs.readFileSync("template/db.ejs").toString();
    let dbString = ejs.render(dbTemplate, data);
    zip.append(dbString, {name: "db.xml"});

    let output = fs.createWriteStream(parseData.outputPath);

    output.on('close', function() {
        onSuccess(zip.pointer() + ' total bytes');
        onSuccess('The module has been finished.');
        onDone();
    });

    zip.on('error', function(err) {
        error(err);
    });

    zip.pipe(output);
    zip.finalize();
}

function deepCopy(object){
    return JSON.parse(JSON.stringify(object));
}

function loadClasses(parseData, onSuccess, onError, callback){
    if(!parseData.classes){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/classes.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadFeats(parseData, onSuccess, onError, callback){
    if(!parseData.feats){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/feats.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadNPCs(parseData, onSuccess, onError, callback){
    if(!parseData.npcs){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/npcs.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadRaces(parseData, onSuccess, onError, callback){
    if(!parseData.races){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/races.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadSpells(parseData, onSuccess, onError, callback){
    if(!parseData.spells){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/spells.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadTokens(parseData, onSuccess, onError, callback){
    if(!parseData.tokens){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/tokens.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadBackgrounds(parseData, onSuccess, onError, callback){
    if(!parseData.backgrounds){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/backgrounds.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadEncounters(parseData, onSuccess, onError, callback){
    if(!parseData.encounters){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/encounters.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadImageGrids(parseData, onSuccess, onError, callback){
    if(!parseData.imageGrids){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/imagegrids.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadImagePins(parseData, onSuccess, onError, callback){
    if(!parseData.imagePins){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/imagepins.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadImages(parseData, onSuccess, onError, callback){
    if(!parseData.images){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/images.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadMagicItems(parseData, onSuccess, onError, callback){
    if(!parseData.magicItems){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/magicitems.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadParcels(parseData, onSuccess, onError, callback){
    if(!parseData.parcels){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/parcels.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadPregens(parseData, onSuccess, onError, callback){
    if(!parseData.pregens){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/pregens.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadReferenceManual(parseData, onSuccess, onError, callback){
    if(!parseData.referenceManual){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/referencemanual.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadQuests(parseData, onSuccess, onError, callback){
    if(!parseData.quests){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/quests.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadStory(parseData, onSuccess, onError, callback){
    if(!parseData.story){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/story.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
    }
}

function loadTables(parseData, onSuccess, onError, callback){
    if(!parseData.tables){
        callback(null, null);
        return;
    }
    let path = parseData.inputFolderPath + "/tables.txt";
    if(!checkFileExists(path, onError)){
        callback(null, null);
        return;
    }
}

function loadEquipment(parseData, onSuccess, onError, callback){
    if(!parseData.equipment){
        callback(null, null);
        return;
    }
    let itemsPath = parseData.inputFolderPath + "/equipment.txt";
    if(!checkFileExists(itemsPath, onError)){
        callback(null, null);
        return;
    }
    let lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(itemsPath)
    });

    let itemLineRe = /^[ \w-'\(\)"+,:]+\.[ \w-'\(\)"+.:,]+/;

    let items = [];
    let itemDictionary = {};
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
                if(itemDictionary[name] === undefined){
                    onError("Item not contained in any table: " + name);
                    return;
                }
                itemDictionary[name].name = name;
                itemDictionary[name].description = description;
                itemDictionary[name].isLocked = 1;
                itemDictionary[name].isTemplate = 0;
                itemDictionary[name].isIdentified = 1;
                itemDictionary[name].id = formatID(idCounter);
                idCounter++;
                let validationResult = model.validateItem(itemDictionary[name]);
                if(validationResult !== undefined){
                    onError("Item failed validation: " + name + " " + JSON.stringify(validationResult));
                    return;
                }
                onSuccess("Loaded item description: " + name);
                items.push(itemDictionary[name]);
            } else {
                onError("Item line has wrong format or invalid characters: " + line);
            }

        } else {
            if(pageNameRe.test(line)){
                lastTableName = line.split(";")[1];
                if(equipmentTableData[lastTableName] !== undefined){
                    onError("duplicate table name: " + lastTableName);
                    return;
                }
                lastTable = {};
                lastSubtable = null;

                equipmentTableData[lastTableName] = lastTable;
            } else if (tableHeaderRe.test(line)){
                if(lastTable === null){
                    onError("Can't add header to unknown table: " + line);
                    return;
                }
                if(lastTable.columnNames !== undefined){
                    onError("Can't add header to table with header: " + line);
                    return;
                }
                lastTable.columnNames = line.split(";");
                lastTable.columnNames.shift(); //discarding "#th"
                let columnSet = new Set(lastTable.columnNames);
                if(formatColumnName(lastTable.columnNames[0]) != "name"){
                    onError("The first column name should be name: " + line);
                }
                if(lastTable.columnNames.length != columnSet.size){
                    onError("Duplicate column names: " + line);
                }
            } else if (typeHeaderRe.test(line)){
                lastSubtableName = line.split(";")[1];
                if(lastTable === null){
                    onError("Can't add subtable to unknown table: " + lastSubtableName);
                    return;
                }
                if(lastTable[lastSubtableName] !== undefined){
                    onError("duplicate subtable name: " + lastSubtableName);
                    return;
                }
                lastSubtable = [];
                lastTable[lastSubtableName] = lastSubtable;
            } else if (line == ""){
                finishedParsingTables = true;
            } else {
                if(lastSubtable === null){
                    onError("Can't add item to unknown subtable: " + line);
                    return;
                }
                let row = line.split(";");
                if(row.length == lastTable.columnNames.length){
                    lastSubtable.push(row);
                    let item = {};
                    itemDictionary[row[0]] = item; //we're assuming the first column is the name
                    let columns = lastTable.columnNames;
                    for(let i = 0; i < columns.length; i++){
                        var columnName = formatColumnName(columns[i]);
                        item[columnName] = row[i];
                    }
                    item.type    = capitalizeEachWord(lastTableName);
                    item.subtype = capitalizeEachWord(lastSubtableName);
                    onSuccess("Loaded item row: " + row[0]);
                } else {
                    onError("Wrong number of columns: " + line);
                }
            }
        }
    });
    lineReader.on('close', function () {
        callback(null, items);
    });
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

let columnNameConverter = {
    "Armor": "name",
    "Armor Class (AC)": "ac",
    "Strength": "strengthRequirement"
};

function formatColumnName(name){
    if(columnNameConverter[name] !== undefined){
        name = columnNameConverter[name];
    }
    return camelize(name);
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

function capitalizeEachWord(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
