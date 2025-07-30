const { getAccounts } = require('./db/database');

async function testGetAccounts() {
  try {
    console.log('尝试获取并解密账户数据:');
    const accounts = await getAccounts();
    
    if (accounts && accounts.length > 0) {
      console.log(`成功获取到 ${accounts.length} 个账户:`);
      accounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account.name} - ${account.username} - ${account.password}`);
      });
    } else {
      console.log('没有找到账户数据');
    }
  } catch (error) {
    console.error('获取账户数据时出错:', error);
  }
}

testGetAccounts();