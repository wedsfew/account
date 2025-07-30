const { encrypt, decrypt, getMasterPassword } = require('./db/database');

async function checkEncryption() {
  try {
    // 获取当前主密码
    const masterPassword = await getMasterPassword();
    console.log('当前主密码:', masterPassword);
    
    // 测试数据
    const testData = 'test123';
    
    // 使用当前主密码加密
    const encrypted = encrypt(testData, masterPassword);
    console.log('加密后的数据:', encrypted);
    
    // 尝试解密
    const decrypted = decrypt(encrypted, masterPassword);
    console.log('解密后的数据:', decrypted);
    
    console.log('加密解密测试成功:', testData === decrypted);
  } catch (error) {
    console.error('加密解密测试失败:', error);
  }
}

checkEncryption();