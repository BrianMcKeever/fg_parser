const ejs = require("ejs");
const archiver = require("archiver");
const fs = require('fs');
const validate = require("validate.js");
const model = require("./model.js");

exports.parse = function parse(parseData){
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

    var dbString = createDBString(parseData);
    zip.append(dbString, {name: "db.xml"});

    var output = fs.createWriteStream(parseData.outputPath);

    output.on('close', function() {
        console.log(zip.pointer() + ' total bytes');
        console.log('zip has been finalized and the output file descriptor has closed.');
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

function createDBString(parseData){
    var dbTemplate = fs.readFileSync("template/db.ejs").toString();
    var data = deepCopy(parseData);
    data.moduleMergeId = createMergeId(data.moduleName);
    data.encounters = null;
    data.stories = null;
    data.images = null;
    data.items = loadItems(data.inputFolderPath);
    data.npcs = null;
    data.quests = null;
    data.tables = null;
    var dbString = ejs.render(dbTemplate, data);
    return dbString;
}

function loadItems(inputFolderPath){
    var items = [];
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

function test(path){
    var homePath = app.getPath("desktop");
    var parserOutputLocation = homePath + "/fg_parser_output.zip";
    if(fs.stat(parserOutputLocation, function(error, stats){
        if(error){
            if(error.code != "ENOENT"){
                console.log(error);
                return;
            } // else output file exists
        } else if(stats.isFile()){
            fs.unlinkSync(parserOutputLocation);
        } else {
            console.log("parserOutputLocation is weird");
        }
    }));

    var zip = new JSZip();
    zip.file("Hello.txt", "Hello World\n");
    var img = zip.folder("images");
    zip
        .generateNodeStream({type:'nodebuffer',streamFiles:true})
        .pipe(fs.createWriteStream(parserOutputLocation))
        .on('finish', function () {
            // JSZip generates a readable stream with a "end" event,
            // but is piped here in a writable stream which emits a "finish" event.
            console.log("fg_parser_output.zip written.");
        });
}

function createMergeId(moduleName){
    var mergeId = moduleName;
    mergeId = mergeId.replace(/[^\w]/gi, "");
    return mergeId;
}
