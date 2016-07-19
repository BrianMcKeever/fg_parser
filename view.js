document.addEventListener("DOMContentLoaded", function(){
    // Module to control application life.
    const {ipcRenderer} = require('electron');
    function processButton(){
        var fileToLoad = document.getElementById("input").files[0];
        var path = fileToLoad.path;
        console.log(ipcRenderer.sendSync('synchronous-message', path));
    }

    console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"

    ipcRenderer.on('asynchronous-reply', (event, arg) => {
        console.log(arg); // prints "pong"
    });
    ipcRenderer.send('input-path', 'ping');

    var newButton  = document.getElementById("newButton");
    var loadButton = document.getElementById("loadButton");
    var saveButton = document.getElementById("saveButton");

    var moduleNameInput     = document.getElementById("moduleNameInput");
    var moduleCategoryInput = document.getElementById("moduleCategoryInput");
    var moduleAuthorInput   = document.getElementById("moduleAuthorInput");

    var inputFolderPathInput  = document.getElementById("inputPathInput");
    var outputFolderPathInput = document.getElementById("outputPathInput");

    var moduleTypeGMRadio       = document.getElementById("moduleTypeGMRadio");
    var moduleTypeGMPlayerRadio = document.getElementById("moduleTypeGMPlayerRadio");
    var moduleTypeCommonRadio   = document.getElementById("moduleTypeCommonRadio");

    var fileClassCheckbox     = document.getElementById("fileClassCheckbox");
    var fileEquipmentCheckbox = document.getElementById("fileEquipmentCheckbox");
    var fileFeatsCheckbox     = document.getElementById("fileFeatsCheckbox");
    var fileNPCsCheckbox      = document.getElementById("fileNPCsCheckbox");
    var fileRacesCheckbox     = document.getElementById("fileRacesCheckbox");
    var fileSpellsCheckbox    = document.getElementById("fileSpellsCheckbox");
    var fileTokensCheckbox    = document.getElementById("fileTokensCheckbox");

    newButton.onclick = onNewButtonPress;
    loadButton.onclick = onLoadButtonPress;
    saveButton.onclick = onSaveButtonPress;

    function onNewButtonPress(){
        moduleNameInput.value     = "";
        moduleCategoryInput.value = "";
        moduleAuthorInput.value   = "";

        inputFolderPathInput.value  = "";
        outputFolderPathInput.value = "";

        moduleTypeGMRadio.checked = true;

        fileClassCheckbox.checked     = false;
        fileEquipmentCheckbox.checked = false;
        fileFeatsCheckbox.checked     = false;
        fileNPCsCheckbox.checked      = false;
        fileRacesCheckbox.checked     = false;
        fileSpellsCheckbox.checked    = true;
        fileTokensCheckbox.checked    = false;
    }

    function onLoadButtonPress(){
        var data = ipcRenderer.sendSync('loadConfig', null);
        if(data === null) return;

        moduleNameInput.value     = data.moduleName;
        moduleCategoryInput.value = data.moduleCategory;
        moduleAuthorInput.value   = data.moduleAuthor;

        inputFolderPathInput.value  = data.inputFolderPath;
        outputFolderPathInput.value = data.outputFolderPath;

        moduleTypeGMRadio.checked       = false;
        moduleTypeGMPlayerRadio.checked = false;
        moduleTypeCommonRadio.checked   = false;

        if(data.moduleType == "GM Only"){
            moduleTypeGMRadio.checked = true;
        } else if (data.moduleType == "GM/Player"){
            moduleTypeGMPlayerRadio.checked = true;
        } else {
            moduleTypeCommonRadio.checked = true;
        }

        fileClassCheckbox.checked     = data.classes;
        fileEquipmentCheckbox.checked = data.equipment;
        fileFeatsCheckbox.checked     = data.feats;
        fileNPCsCheckbox.checked      = data.npcs;
        fileRacesCheckbox.checked     = data.races;
        fileSpellsCheckbox.checked    = data.spells;
        fileTokensCheckbox.checked    = data.tokens;
    }

    function onSaveButtonPress(){
        var moduleType;
        if(moduleTypeGMRadio.checked === true){
            moduleType = "GM only";
        } else if(moduleTypeGMPlayerRadio.checked === true){
            moduleType = "GM/Player";
        } else {
            moduleType = "Common";
        }

        var data = {
            "moduleName":     moduleNameInput.value,
            "moduleCategory": moduleCategoryInput.value,
            "moduleAuthor":   moduleAuthorInput.value,

            "inputFolderPath":  inputFolderPathInput.value,
            "outputFolderPath": outputFolderPathInput.value,

            "moduleType": moduleType,

            "classes":   fileClassCheckbox.checked,
            "equipment": fileEquipmentCheckbox.checked,
            "feats":     fileFeatsCheckbox.checked,
            "npcs":      fileNPCsCheckbox.checked,
            "races":     fileRacesCheckbox.checked,
            "spells":    fileSpellsCheckbox.checked,
            "tokens":    fileTokensCheckbox.checked
        }
        ipcRenderer.sendSync('saveConfig', data);
    }
}, false);
