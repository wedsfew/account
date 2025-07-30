const keytar = require('keytar');

async function checkKeytarPassword() {
  try {
    const password = await keytar.getPassword('AccountManager', 'masterPassword');
    console.log('从keytar中获取的主密码:', password);
  } catch (error) {
    console.error('获取主密码时出错:', error);
  }
}

checkKeytarPassword();