const { getAccounts } = require('./db/database');

async function testAccountData() {
  try {
    console.log('获取账户数据测试');
    const accounts = await getAccounts();
    console.log('账户数量:', accounts.length);
    
    if (accounts.length > 0) {
      console.log('第一个账户信息:');
      console.log('- ID:', accounts[0].id);
      console.log('- 名称:', accounts[0].name);
      console.log('- 用户名:', accounts[0].username);
      console.log('- 密码:', accounts[0].password);
      console.log('- 分类:', accounts[0].category);
      console.log('- 更新时间:', accounts[0].lastUpdated);
    }
    
    console.log('\n所有账户信息:');
    accounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.name} (${account.username}) - ${account.password}`);
    });
  } catch (error) {
    console.error('获取账户数据时出错:', error);
  }
}

testAccountData();