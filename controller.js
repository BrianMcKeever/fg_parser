const {ipcMain} = require('electron');
const {dialog} = require('electron');
const fs = require('fs');

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


ipcMain.on('input-path', (event, arg) => {
    console.log(arg);  // prints "ping"
    event.sender.send('asynchronous-reply', 'pong');
});

ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg);  // prints "ping"
    event.returnValue = 'pong';
});

function test(path){
    console.log(path);
    var homePath = app.getPath("desktop");
    var fs = require('fs');
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

    var JSZip = require("jszip");
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

    global.fg_parser = true
}

