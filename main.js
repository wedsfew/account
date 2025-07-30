const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getAccounts, addAccount, updateAccount, deleteAccount, getCategories, addCategory, deleteCategory, setMasterPassword, getMasterPassword, verifyMasterPassword } = require('./db/database');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    // macOS native appearance
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 10, y: 10 }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'renderer/src/index.html'));


  // Open the DevTools in development mode.
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// IPC handlers for communication between main and renderer processes
ipcMain.handle('get-accounts', async () => {
  try {
    const accounts = await getAccounts();
    return { success: true, data: accounts };
  } catch (error) {
    console.error('获取账户数据失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('add-account', async (event, account) => {
  try {
    const result = await addAccount(account);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('添加账户失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-account', async (event, account) => {
  try {
    const result = await updateAccount(account);
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('更新账户失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-account', async (event, accountId) => {
  try {
    const result = await deleteAccount(accountId);
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('删除账户失败:', error);
    return { success: false, error: error.message };
  }
});

// 分类管理 IPC 处理程序
ipcMain.handle('get-categories', async () => {
  try {
    const categories = await getCategories();
    return { success: true, data: categories };
  } catch (error) {
    console.error('获取分类数据失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('add-category', async (event, name) => {
  try {
    const result = await addCategory(name);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('添加分类失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-category', async (event, categoryId) => {
  try {
    const result = await deleteCategory(categoryId);
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('删除分类失败:', error);
    return { success: false, error: error.message };
  }
});

// 主密码设置 IPC 处理程序
ipcMain.handle('set-master-password', async (event, password) => {
  try {
    console.log('收到设置主密码的请求');
    await setMasterPassword(password);
    return { success: true };
  } catch (error) {
    console.error('设置主密码失败:', error);
    return { success: false, error: error.message };
  }
});

// 主密码验证 IPC 处理程序
ipcMain.handle('verify-master-password', async (event, password) => {
  try {
    console.log('收到验证主密码的请求');
    const isValid = await verifyMasterPassword(password);
    return { success: true, valid: isValid };
  } catch (error) {
    console.error('验证主密码失败:', error);
    return { success: false, error: error.message };
  }
});