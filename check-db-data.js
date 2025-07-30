const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 创建数据目录（如果不存在）
const dataDir = path.join(require('os').homedir(), '.account-manager');

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

// 获取所有账户
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

async function checkDbData() {
  try {
    const accounts = await getAccounts();
    console.log('数据库中的账户数据:');
    accounts.forEach((account, index) => {
      console.log(`账户 ${index + 1}:`, account);
    });
  } catch (error) {
    console.error('获取账户数据失败:', error);
  } finally {
    db.close();
  }
}

checkDbData();