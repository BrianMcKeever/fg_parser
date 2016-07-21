const electron = require('electron');
const {ipcMain} = electron;
const {dialog} = electron;
const fs = require('fs');
const lib = require("./lib.js");

let win;
exports.startController = function(browserWindow){
    win = browserWindow;
    ipcMain.on('saveConfig', (event, arg) => {
        var path = dialog.showSaveDialog({
            title: "title"
        })
        if(path !== undefined){
            fs.writeFileSync(path, JSON.stringify(arg));
        }
        event.returnValue = null;
    });

    ipcMain.on('loadConfig', (event, arg) => {
        var path = dialog.showOpenDialog({
            title: "title",
            properties: ["openFile"]
        })
        var data = null;
        if(path !== undefined){
            path = path[0];
            var buffer = fs.readFileSync(path);
            data = JSON.parse(buffer.toString());
        }
        event.returnValue = data;
    });

    let parseWindow;
    ipcMain.on('parse', (event, arg) => {
        lib.parse(arg, logParseSuccess, logParseError, logParseDone);
        event.returnValue = null;
    });

}

function logParseError(errorString){
    win.webContents.send("logParseError", errorString);
}

function logParseSuccess(successString){
    win.webContents.send("logParseSuccess", successString);
}

function logParseDone(){
    win.webContents.send("parseDone", null);
}
