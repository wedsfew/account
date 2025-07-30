// 渲染进程JavaScript代码

class AccountManager {
  constructor() {
    this.accounts = [];
    this.currentView = 'accounts';
    this.initializeEventListeners();
    this.loadAccounts();
  }

  // 初始化事件监听器
  initializeEventListeners() {
    // 导航切换
    document.querySelectorAll('[data-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView(e.target.dataset.view);
      });
    });

    // 添加账户按钮
    document.getElementById('add-account-btn').addEventListener('click', () => {
      this.openAccountModal();
    });

    // 模态框关闭按钮
    document.querySelector('.close').addEventListener('click', () => {
      this.closeAccountModal();
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
      const modal = document.getElementById('account-modal');
      if (e.target === modal) {
        this.closeAccountModal();
      }
    });

    // 账户表单提交
    document.getElementById('account-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveAccount();
    });

    // 密码可见性切换
    document.querySelectorAll('.toggle-password').forEach(button => {
      button.addEventListener('click', (e) => {
        this.togglePasswordVisibility(e.target);
      });
    });

    // 搜索功能
    document.getElementById('search-input').addEventListener('input', (e) => {
      this.filterAccounts(e.target.value);
    });
  }

  // 切换视图
  switchView(viewName) {
    // 更新导航状态
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.parentElement.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).parentElement.classList.add('active');

    // 显示选中的视图
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');

    this.currentView = viewName;
  }

  // 加载账户数据
  async loadAccounts() {
    try {
      this.accounts = await window.electronAPI.getAccounts();
      this.renderAccounts();
    } catch (error) {
      console.error('加载账户数据失败:', error);
    }
  }

  // 渲染账户列表
  renderAccounts(accounts = this.accounts) {
    const container = document.getElementById('accounts-container');
    container.innerHTML = '';

    if (accounts.length === 0) {
      container.innerHTML = '<p>暂无账户数据</p>';
      return;
    }

    accounts.forEach(account => {
      const accountCard = this.createAccountCard(account);
      container.appendChild(accountCard);
    });
  }

  // 创建账户卡片
  createAccountCard(account) {
    const card = document.createElement('div');
    card.className = 'account-card';
    card.innerHTML = `
      <div class="account-header">
        <div class="account-name">${account.name}</div>
        <div class="account-category">${account.category}</div>
      </div>
      <div class="account-details">
        <div class="account-username">${account.username}</div>
        <div class="account-password">
          <span>••••••••</span>
          <button class="toggle-visibility" data-account-id="${account.id}">显示</button>
        </div>
      </div>
      <div class="account-footer">
        <div class="account-last-updated">更新于 ${account.lastUpdated}</div>
        <div class="account-actions">
          <button class="edit-account" data-account-id="${account.id}">编辑</button>
          <button class="delete-account" data-account-id="${account.id}">删除</button>
        </div>
      </div>
    `;

    // 添加事件监听器
    card.querySelector('.toggle-visibility').addEventListener('click', (e) => {
      this.togglePasswordVisibility(e.target);
    });

    card.querySelector('.edit-account').addEventListener('click', (e) => {
      this.editAccount(account.id);
    });

    card.querySelector('.delete-account').addEventListener('click', (e) => {
      this.deleteAccount(account.id);
    });

    return card;
  }

  // 打开账户模态框
  openAccountModal(account = null) {
    const modal = document.getElementById('account-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('account-form');
    
    if (account) {
      // 编辑模式
      title.textContent = '编辑账户';
      document.getElementById('account-name').value = account.name;
      document.getElementById('account-username').value = account.username;
      document.getElementById('account-password').value = account.password;
      document.getElementById('account-category').value = account.category;
      form.dataset.editingId = account.id;
    } else {
      // 添加模式
      title.textContent = '添加新账户';
      form.reset();
      delete form.dataset.editingId;
    }
    
    modal.style.display = 'block';
  }

  // 关闭账户模态框
  closeAccountModal() {
    document.getElementById('account-modal').style.display = 'none';
  }

  // 保存账户
  async saveAccount() {
    const form = document.getElementById('account-form');
    const account = {
      name: document.getElementById('account-name').value,
      username: document.getElementById('account-username').value,
      password: document.getElementById('account-password').value,
      category: document.getElementById('account-category').value
    };

    try {
      if (form.dataset.editingId) {
        // 编辑账户
        account.id = form.dataset.editingId;
        await window.electronAPI.updateAccount(account);
      } else {
        // 添加新账户
        await window.electronAPI.addAccount(account);
      }
      
      this.closeAccountModal();
      this.loadAccounts(); // 重新加载账户列表
    } catch (error) {
      console.error('保存账户失败:', error);
    }
  }

  // 编辑账户
  editAccount(accountId) {
    const account = this.accounts.find(acc => acc.id == accountId);
    if (account) {
      this.openAccountModal(account);
    }
  }

  // 删除账户
  async deleteAccount(accountId) {
    if (confirm('确定要删除这个账户吗？')) {
      try {
        await window.electronAPI.deleteAccount(accountId);
        this.loadAccounts(); // 重新加载账户列表
      } catch (error) {
        console.error('删除账户失败:', error);
      }
    }
  }

  // 切换密码可见性
  togglePasswordVisibility(button) {
    const accountId = button.dataset.accountId;
    const passwordSpan = button.previousElementSibling;
    
    if (passwordSpan.textContent === '••••••••') {
      // 这里应该从主进程获取实际密码
      passwordSpan.textContent = 'password123';
      button.textContent = '隐藏';
    } else {
      passwordSpan.textContent = '••••••••';
      button.textContent = '显示';
    }
  }

  // 过滤账户
  filterAccounts(searchTerm) {
    const filteredAccounts = this.accounts.filter(account => 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.renderAccounts(filteredAccounts);
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  window.accountManager = new AccountManager();
});