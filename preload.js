const { contextBridge, ipcRenderer } = require('electron');

// As an example, here's how to expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  addAccount: (account) => ipcRenderer.invoke('add-account', account),
  updateAccount: (account) => ipcRenderer.invoke('update-account', account),
  deleteAccount: (accountId) => ipcRenderer.invoke('delete-account', accountId),
  getCategories: () => ipcRenderer.invoke('get-categories'),
  addCategory: (name) => ipcRenderer.invoke('add-category', name),
  deleteCategory: (categoryId) => ipcRenderer.invoke('delete-category', categoryId)
});