const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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
function getAccounts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM accounts', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
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
    
    db.run(
      'INSERT INTO accounts (name, username, password, category, last_updated) VALUES (?, ?, ?, ?, ?)',
      [name, username, password, category, lastUpdated],
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
    
    db.run(
      'UPDATE accounts SET name = ?, username = ?, password = ?, category = ?, last_updated = ? WHERE id = ?',
      [name, username, password, category, lastUpdated, id],
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

module.exports = {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  getCategories,
  addCategory,
  deleteCategory
};