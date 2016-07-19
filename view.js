
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

