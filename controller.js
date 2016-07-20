const {ipcMain} = require('electron');
const {dialog} = require('electron');
const fs = require('fs');
const {BrowserWindow} = require('electron')
const lib = require("./lib.js");

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
    //parseWindow = new BrowserWindow({width: 800, height: 600, resizable: false});
     // parseWindow.loadURL(`file://${__dirname}/parse_window.html`);

      //parseWindow.on('closed', () => {
       // parseWindow = null;
      //});
    lib.parse(arg);
    event.returnValue = null;
});
