const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const keytar = require('keytar');

// 加密密钥（在实际应用中，这应该从环境变量或安全存储中获取）
let MASTER_PASSWORD = null;

// 初始化主密码
async function initializeMasterPassword() {
  try {
    // 从keytar获取存储的主密码
    const password = await keytar.getPassword('AccountManager', 'masterPassword');
    if (password) {
      MASTER_PASSWORD = password;
      console.log('主密码已从安全存储中初始化');
    }
  } catch (error) {
    console.error('初始化主密码失败:', error);
  }
}

// 确保在模块加载时初始化主密码
initializeMasterPassword();

// 设置主密码
async function setMasterPassword(password) {
  // 保存旧密码以用于解密现有数据
  const oldPassword = MASTER_PASSWORD;
  
  // 设置新密码
  MASTER_PASSWORD = password;
  
  try {
    // 使用keytar安全地存储主密码
    await keytar.setPassword('AccountManager', 'masterPassword', password);
    console.log('主密码已设置并安全存储');
    
    // 如果存在旧密码，重新加密所有已存储的账户数据
    if (oldPassword) {
      await reencryptAllAccounts(oldPassword, password);
    }
  } catch (error) {
    console.error('存储主密码失败:', error);
    // 恢复旧密码
    MASTER_PASSWORD = oldPassword;
    throw error;
  }
}

// 获取主密码
async function getMasterPassword() {
  try {
    // 从keytar获取存储的主密码
    const password = await keytar.getPassword('AccountManager', 'masterPassword');
    MASTER_PASSWORD = password;
    return password;
  } catch (error) {
    console.error('获取主密码失败:', error);
    return null;
  }
}

// 验证主密码
async function verifyMasterPassword(password) {
  try {
    // 从数据库获取所有账户数据
    const accounts = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM accounts', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    
    // 尝试解密第一个账户的密码来验证密码是否正确
    if (accounts && accounts.length > 0) {
      const firstAccount = accounts[0];
      decrypt(firstAccount.password, password);
    }
    
    return true;
  } catch (error) {
    console.error('验证主密码失败:', error);
    return false;
  }
}

// AES加密函数
function encrypt(text, password = MASTER_PASSWORD) {
  // 如果没有设置主密码或文本为空，则不加密
  if (!password || !text) return text;
  
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'GfG', 32);
  const iv = Buffer.alloc(16, 0);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// AES解密函数
function decrypt(encryptedText, password = MASTER_PASSWORD) {
  // 如果没有设置主密码或加密文本为空，则不解密
  if (!password || !encryptedText) return encryptedText;
  
  try {
    // 检查加密文本是否为有效的十六进制字符串
    if (!/^[0-9a-fA-F]+$/.test(encryptedText)) {
      throw new Error('无效的加密文本格式');
    }
    
    // 检查加密文本长度是否为偶数（有效的十六进制字符串长度应为偶数）
    if (encryptedText.length % 2 !== 0) {
      throw new Error('加密文本长度无效');
    }
    
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(password, 'GfG', 32);
    const iv = Buffer.alloc(16, 0);
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('解密失败:', error.message);
    // 如果解密失败，抛出错误
    throw new Error('解密失败: ' + error.message);
  }
}

// 创建数据目录（如果不存在）
const dataDir = path.join(require('os').homedir(), '.account-manager');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 数据库文件路径
const dbPath = path.join(dataDir, 'accounts.db');

// 初始化数据库
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('已连接到 SQLite 数据库');
  }
});

// 创建账户表
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      category TEXT NOT NULL,
      last_updated TEXT NOT NULL
    )
  `);
  
  // 创建分类表
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);
  
  // 检查是否已存在分类数据，如果不存在则插入默认分类
  db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
    if (!err && row.count === 0) {
      const defaultCategories = ['社交媒体', '金融服务', '工作', '个人'];
      const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
      defaultCategories.forEach(category => {
        stmt.run(category);
      });
      stmt.finalize();
    }
  });
});

/**
 * 获取所有账户
 * @returns {Promise<Array>} 账户列表
 */
async function getAccounts() {
  return new Promise(async (resolve, reject) => {
    db.all('SELECT * FROM accounts', async (err, rows) => {
      if (err) {
        reject(err);
      } else {
        try {
          // 获取当前主密码
          const currentPassword = await getMasterPassword();
          
          // 解密密码
          const decryptedRows = rows.map(row => {
            return {
              ...row,
              password: decrypt(row.password, currentPassword)
            };
          });
          resolve(decryptedRows);
        } catch (decryptError) {
          // 如果解密失败，返回错误
          reject(decryptError);
        }
      }
    });
  });
}

/**
 * 添加新账户
 * @param {Object} account - 账户信息
 * @returns {Promise<Object>} 添加结果
 */
function addAccount(account) {
  return new Promise((resolve, reject) => {
    const { name, username, password, category } = account;
    const lastUpdated = new Date().toISOString().split('T')[0];
    
    // 加密密码
    const encryptedPassword = encrypt(password);
    
    db.run(
      'INSERT INTO accounts (name, username, password, category, last_updated) VALUES (?, ?, ?, ?, ?)',
      [name, username, encryptedPassword, category, lastUpdated],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      }
    );
  });
}

/**
 * 更新账户
 * @param {Object} account - 账户信息
 * @returns {Promise<Object>} 更新结果
 */
function updateAccount(account) {
  return new Promise((resolve, reject) => {
    const { id, name, username, password, category } = account;
    const lastUpdated = new Date().toISOString().split('T')[0];
    
    // 加密密码
    const encryptedPassword = encrypt(password);
    
    db.run(
      'UPDATE accounts SET name = ?, username = ?, password = ?, category = ?, last_updated = ? WHERE id = ?',
      [name, username, encryptedPassword, category, lastUpdated, id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      }
    );
  });
}

/**
 * 删除账户
 * @param {number} id - 账户ID
 * @returns {Promise<Object>} 删除结果
 */
function deleteAccount(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM accounts WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
}

/**
 * 获取所有分类
 * @returns {Promise<Array>} 分类列表
 */
function getCategories() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM categories', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * 添加新分类
 * @param {string} name - 分类名称
 * @returns {Promise<Object>} 添加结果
 */
function addCategory(name) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO categories (name) VALUES (?)', [name], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
}

/**
 * 删除分类
 * @param {number} id - 分类ID
 * @returns {Promise<Object>} 删除结果
 */
function deleteCategory(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
}

// 重新加密所有账户数据
async function reencryptAllAccounts(oldPassword, newPassword) {
  return new Promise((resolve, reject) => {
    // 获取所有账户
    db.all('SELECT * FROM accounts', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        // 逐个重新加密账户密码
        for (const row of rows) {
          try {
            // 使用旧密码解密
            const decryptedPassword = decrypt(row.password, oldPassword);
            // 使用新密码加密
            const reencryptedPassword = encrypt(decryptedPassword, newPassword);
            
            // 更新数据库中的密码
            await new Promise((updateResolve, updateReject) => {
              db.run(
                'UPDATE accounts SET password = ? WHERE id = ?',
                [reencryptedPassword, row.id],
                (updateErr) => {
                  if (updateErr) {
                    updateReject(updateErr);
                  } else {
                    updateResolve();
                  }
                }
              );
            });
            
            console.log(`账户 ${row.id} 的密码已重新加密`);
          } catch (decryptError) {
            console.error(`重新加密账户 ${row.id} 的密码时出错:`, decryptError.message);
            // 如果无法解密某个账户的密码，我们仍然继续处理其他账户
          }
        }
        
        console.log('所有账户密码已重新加密');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  getCategories,
  addCategory,
  deleteCategory,
  setMasterPassword,
  getMasterPassword,
  verifyMasterPassword,
  encrypt,
  decrypt,
  reencryptAllAccounts
};