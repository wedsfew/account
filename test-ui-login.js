const { verifyMasterPassword } = require('./db/database');

// 模拟UI登录过程
async function testUILogin() {
  console.log('模拟UI登录过程测试');
  
  // 模拟用户输入旧密码
  const oldPassword = '22222hua';
  console.log(`\n尝试使用旧密码登录: ${oldPassword}`);
  
  try {
    // 验证密码
    const isValid = await verifyMasterPassword(oldPassword);
    
    if (isValid) {
      console.log('✅ 旧密码验证成功 - 这不应该发生！');
      // 如果验证成功，设置主密码
      // 这里我们不会实际调用setMasterPassword，只是模拟
      console.log('🔒 将会设置主密码并解锁应用');
    } else {
      console.log('❌ 旧密码验证失败 - 这是正确的安全行为');
    }
  } catch (error) {
    console.error('验证旧密码时出错:', error.message);
  }
  
  // 模拟用户输入新密码
  const newPassword = '123456';
  console.log(`\n尝试使用新密码登录: ${newPassword}`);
  
  try {
    // 验证密码
    const isValid = await verifyMasterPassword(newPassword);
    
    if (isValid) {
      console.log('✅ 新密码验证成功 - 这是正确的！');
      // 如果验证成功，设置主密码
      // 这里我们不会实际调用setMasterPassword，只是模拟
      console.log('🔓 将会设置主密码并解锁应用');
    } else {
      console.log('❌ 新密码验证失败 - 这不应该发生！');
    }
  } catch (error) {
    console.error('验证新密码时出错:', error.message);
  }
  
  console.log('\n测试完成');
}

testUILogin();