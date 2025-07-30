const { verifyMasterPassword } = require('./db/database');

async function testVerifyPassword() {
  try {
    console.log('测试验证旧主密码(22222hua):');
    const isValidOld = await verifyMasterPassword('22222hua');
    console.log('旧密码验证结果:', isValidOld);
    
    console.log('\n测试验证新主密码(123456):');
    const isValidNew = await verifyMasterPassword('123456');
    console.log('新密码验证结果:', isValidNew);
  } catch (error) {
    console.error('验证密码时出错:', error);
  }
}

testVerifyPassword();