document.addEventListener("DOMContentLoaded", function(){
    // Module to control application life.
    const {ipcRenderer} = nodeRequire('electron');

    var newButton  = document.getElementById("newButton");
    var loadButton = document.getElementById("loadButton");
    var saveButton = document.getElementById("saveButton");

    var moduleNameInput     = document.getElementById("moduleNameInput");
    var moduleCategoryInput = document.getElementById("moduleCategoryInput");
    var moduleAuthorInput   = document.getElementById("moduleAuthorInput");

    var inputFolderPathInput  = document.getElementById("inputPathInput");
    var outputPathInput = document.getElementById("outputPathInput");

    var moduleTypeGMRadio       = document.getElementById("moduleTypeGMRadio");
    var moduleTypeGMPlayerRadio = document.getElementById("moduleTypeGMPlayerRadio");
    var moduleTypeCommonRadio   = document.getElementById("moduleTypeCommonRadio");

    var thumbnailCheckbox     = document.getElementById("thumbnailCheckbox");
    var fileClassCheckbox     = document.getElementById("fileClassCheckbox");
    var fileEquipmentCheckbox = document.getElementById("fileEquipmentCheckbox");
    var fileFeatsCheckbox     = document.getElementById("fileFeatsCheckbox");
    var fileNPCsCheckbox      = document.getElementById("fileNPCsCheckbox");
    var fileRacesCheckbox     = document.getElementById("fileRacesCheckbox");
    var fileSpellsCheckbox    = document.getElementById("fileSpellsCheckbox");
    var fileTokensCheckbox    = document.getElementById("fileTokensCheckbox");

    var parseButton = document.getElementById("parseButton");

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
        var data = ipcRenderer.sendSync('loadConfig', null);
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
        var data = gatherConfigData();
        ipcRenderer.sendSync('saveConfig', data);
    }

    function gatherConfigData(){
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
        var data = gatherConfigData();
        ipcRenderer.sendSync('parse', data);
        $('#navBar a[href="#outputTab"]').tab('show');
        disableControls();
    }

    $('#navBar a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    function logItem(message, className){
        var li = document.createElement("li");
        li.className = className;
        li.innerHTML = message;
        var outputPanel  = document.getElementById("outputList");
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
