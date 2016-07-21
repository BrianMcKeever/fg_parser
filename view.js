document.addEventListener("DOMContentLoaded", function(){
    // Module to control application life.
    const {ipcRenderer} = nodeRequire('electron');

    let newButton  = document.getElementById("newButton");
    let loadButton = document.getElementById("loadButton");
    let saveButton = document.getElementById("saveButton");

    let moduleNameInput     = document.getElementById("moduleNameInput");
    let moduleCategoryInput = document.getElementById("moduleCategoryInput");
    let moduleAuthorInput   = document.getElementById("moduleAuthorInput");

    let inputFolderPathInput  = document.getElementById("inputPathInput");
    let outputPathInput = document.getElementById("outputPathInput");

    let moduleTypeGMRadio       = document.getElementById("moduleTypeGMRadio");
    let moduleTypeGMPlayerRadio = document.getElementById("moduleTypeGMPlayerRadio");
    let moduleTypeCommonRadio   = document.getElementById("moduleTypeCommonRadio");

    let thumbnailCheckbox     = document.getElementById("thumbnailCheckbox");
    let fileClassCheckbox     = document.getElementById("fileClassCheckbox");
    let fileEquipmentCheckbox = document.getElementById("fileEquipmentCheckbox");
    let fileFeatsCheckbox     = document.getElementById("fileFeatsCheckbox");
    let fileNPCsCheckbox      = document.getElementById("fileNPCsCheckbox");
    let fileRacesCheckbox     = document.getElementById("fileRacesCheckbox");
    let fileSpellsCheckbox    = document.getElementById("fileSpellsCheckbox");
    let fileTokensCheckbox    = document.getElementById("fileTokensCheckbox");

    let parseButton = document.getElementById("parseButton");

    newButton.onclick = onNewButtonPress;
    loadButton.onclick = onLoadButtonPress;
    saveButton.onclick = onSaveButtonPress;

    parseButton.onclick = onParse;

    function onNewButtonPress(){
        moduleNameInput.value     = "";
        moduleCategoryInput.value = "";
        moduleAuthorInput.value   = "";

        inputFolderPathInput.value  = "";
        outputPathInput.value = "";

        moduleTypeGMRadio.checked = true;

        thumbnailCheckbox.checked     = false;
        fileClassCheckbox.checked     = false;
        fileEquipmentCheckbox.checked = false;
        fileFeatsCheckbox.checked     = false;
        fileNPCsCheckbox.checked      = false;
        fileRacesCheckbox.checked     = false;
        fileSpellsCheckbox.checked    = false;
        fileTokensCheckbox.checked    = false;
    }

    function onLoadButtonPress(){
        let data = ipcRenderer.sendSync('loadConfig', null);
        if(data === null) return;

        moduleNameInput.value     = data.moduleName;
        moduleCategoryInput.value = data.moduleCategory;
        moduleAuthorInput.value   = data.moduleAuthor;

        inputFolderPathInput.value  = data.inputFolderPath;
        outputPathInput.value = data.outputPath;

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

        thumbnailCheckbox.checked     = data.thumbnail;
        fileClassCheckbox.checked     = data.classes;
        fileEquipmentCheckbox.checked = data.equipment;
        fileFeatsCheckbox.checked     = data.feats;
        fileNPCsCheckbox.checked      = data.npcs;
        fileRacesCheckbox.checked     = data.races;
        fileSpellsCheckbox.checked    = data.spells;
        fileTokensCheckbox.checked    = data.tokens;
    }

    function onSaveButtonPress(){
        let data = gatherConfigData();
        ipcRenderer.sendSync('saveConfig', data);
    }

    function gatherConfigData(){
        let moduleType;
        if(moduleTypeGMRadio.checked === true){
            moduleType = "GM only";
        } else if(moduleTypeGMPlayerRadio.checked === true){
            moduleType = "GM/Player";
        } else {
            moduleType = "Common";
        }

        let data = {
            "moduleName":     moduleNameInput.value,
            "moduleCategory": moduleCategoryInput.value,
            "moduleAuthor":   moduleAuthorInput.value,

            "inputFolderPath": inputFolderPathInput.value,
            "outputPath":      outputPathInput.value,

            "moduleType": moduleType,

            "thumbnail":   thumbnailCheckbox.checked,
            "classes":   fileClassCheckbox.checked,
            "equipment": fileEquipmentCheckbox.checked,
            "feats":     fileFeatsCheckbox.checked,
            "npcs":      fileNPCsCheckbox.checked,
            "races":     fileRacesCheckbox.checked,
            "spells":    fileSpellsCheckbox.checked,
            "tokens":    fileTokensCheckbox.checked
        }
        return data;
    }

    function disableControls(){
        $("input").attr("disabled", true);
        $("button").attr("disabled", true);
    }
    
    function enableControls(){
        $("input").attr("disabled", false);
        $("button").attr("disabled", false);
    }

    function onParse(){
        let data = gatherConfigData();
        ipcRenderer.sendSync('parse', data);
        $('#navBar a[href="#outputTab"]').tab('show');
        disableControls();
    }

    $('#navBar a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    function logItem(message, className){
        let li = document.createElement("li");
        li.className = className;
        li.innerHTML = message;
        let outputPanel  = document.getElementById("outputList");
        outputPanel.appendChild(li);
    }

    ipcRenderer.on("logParseError", function(event, args){
        logItem(args, "alert-danger");
    });

    ipcRenderer.on("logParseSuccess", function(event, args){
        logItem(args, "alert-success");
    });

    ipcRenderer.on("parseDone", function(event, args){
        enableControls();
    });
    
}, false);
