const { remote } = require('electron');
const { BrowserWindow } = remote;

/**
 * Binds to the JS "window" the shortcut CTRL+SHIFT+I to toggle Chrome Dev Tools.
 * @param {Window} window
 */
function bindDevToolsShortcut(window) {
    window.addEventListener('keyup', (event) => {
        if (event.ctrlKey && event.shiftKey && (event.keyCode == 73 || event.keyCode == 105)) { // 'i' or 'I'
            BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
            event.preventDefault();
            return false;
        }
    }, true);
}

module.exports = {
    bindDevToolsShortcut
};