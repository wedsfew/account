const { contextBridge, ipcRenderer } = require('electron');

// As an example, here's how to expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  addAccount: (account) => ipcRenderer.invoke('add-account', account),
  updateAccount: (account) => ipcRenderer.invoke('update-account', account),
  deleteAccount: (accountId) => ipcRenderer.invoke('delete-account', accountId)
});

// Ensure the API is available before the DOM is loaded
if (typeof window !== 'undefined') {
  window.electronAPI = {
    getAccounts: () => ipcRenderer.invoke('get-accounts'),
    addAccount: (account) => ipcRenderer.invoke('add-account', account),
    updateAccount: (account) => ipcRenderer.invoke('update-account', account),
    deleteAccount: (accountId) => ipcRenderer.invoke('delete-account', accountId)
  };
}