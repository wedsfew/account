const { decrypt } = require('./db/database');

// 模拟数据库中的加密数据
const encryptedPasswords = [
  '8b4a8e1d4b31dffee32ea83b34662a6a',
  '56445150b6386b78f61ee2ccaa18b212',
  '92fae2d8e57ab0def6880f51d4c4b0c2',
  '6725b1457abd23a253edd1f92da75916'
];

async function testDecryptDirect() {
  try {
    console.log('尝试使用旧主密码(22222hua)直接解密数据库中的数据:');
    
    for (let i = 0; i < encryptedPasswords.length; i++) {
      try {
        // 直接调用decrypt函数并传入旧密码
        const decrypted = decrypt(encryptedPasswords[i], '22222hua');
        console.log(`账户 ${i + 1} 解密成功:`, decrypted);
      } catch (error) {
        console.error(`账户 ${i + 1} 解密失败:`, error.message);
      }
    }
    
    console.log('\n尝试使用新主密码(123456)直接解密数据库中的数据:');
    
    for (let i = 0; i < encryptedPasswords.length; i++) {
      try {
        // 直接调用decrypt函数并传入新密码
        const decrypted = decrypt(encryptedPasswords[i], '123456');
        console.log(`账户 ${i + 1} 解密成功:`, decrypted);
      } catch (error) {
        console.error(`账户 ${i + 1} 解密失败:`, error.message);
      }
    }
  } catch (error) {
    console.error('解密过程出错:', error);
  }
}

testDecryptDirect();