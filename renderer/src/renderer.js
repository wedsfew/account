// 渲染进程JavaScript代码

class AccountManager {
  constructor() {
    this.accounts = [];
    this.categories = [];
    this.currentView = 'accounts';
    this.initializeEventListeners();
    this.loadAccounts();
    this.loadCategories();
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

    // 添加分类按钮
    document.getElementById('add-category-btn').addEventListener('click', () => {
      this.addCategory();
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
      const response = await window.electronAPI.getAccounts();
      if (response.success) {
        this.accounts = response.data;
        this.renderAccounts();
      } else {
        console.error('加载账户数据失败:', response.error);
      }
    } catch (error) {
      console.error('加载账户数据失败:', error);
    }
  }

  // 加载分类数据
  async loadCategories() {
    try {
      const response = await window.electronAPI.getCategories();
      if (response.success) {
        this.categories = response.data;
        this.renderCategories();
      } else {
        console.error('加载分类数据失败:', response.error);
      }
    } catch (error) {
      console.error('加载分类数据失败:', error);
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
    
    // 更新分类下拉列表
    this.updateCategoryOptions();
    
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
      let response;
      if (form.dataset.editingId) {
        // 编辑账户
        account.id = parseInt(form.dataset.editingId);
        response = await window.electronAPI.updateAccount(account);
      } else {
        // 添加新账户
        response = await window.electronAPI.addAccount(account);
      }
      
      if (response.success) {
        this.closeAccountModal();
        this.loadAccounts(); // 重新加载账户列表
      } else {
        console.error('保存账户失败:', response.error);
      }
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
        const response = await window.electronAPI.deleteAccount(accountId);
        if (response.success) {
          this.loadAccounts(); // 重新加载账户列表
        } else {
          console.error('删除账户失败:', response.error);
        }
      } catch (error) {
        console.error('删除账户失败:', error);
      }
    }
  }

  // 打开添加分类模态框
  openCategoryModal() {
    const modal = document.getElementById('category-modal');
    const form = document.getElementById('category-form');
    
    // 清空表单
    form.reset();
    
    // 显示模态框
    modal.style.display = 'block';
  }

  // 关闭添加分类模态框
  closeCategoryModal() {
    document.getElementById('category-modal').style.display = 'none';
  }

  // 添加分类
  async addCategory() {
    const categoryName = document.getElementById('category-name').value;
    if (categoryName) {
      try {
        const response = await window.electronAPI.addCategory(categoryName);
        if (response.success) {
          this.closeCategoryModal();
          this.loadCategories(); // 重新加载分类列表
        } else {
          console.error('添加分类失败:', response.error);
        }
      } catch (error) {
        console.error('添加分类失败:', error);
      }
    }
  }

  // 删除分类
  async deleteCategory(categoryId) {
    if (confirm('确定要删除这个分类吗？这不会删除该分类下的账户。')) {
      try {
        const response = await window.electronAPI.deleteCategory(categoryId);
        if (response.success) {
          this.loadCategories(); // 重新加载分类列表
        } else {
          console.error('删除分类失败:', response.error);
        }
      } catch (error) {
        console.error('删除分类失败:', error);
      }
    }
  }

  // 更新分类下拉列表
  updateCategoryOptions() {
    const categorySelect = document.getElementById('account-category');
    
    // 清空现有选项（保留默认选项）
    categorySelect.innerHTML = '';
    
    // 添加所有当前分类到下拉列表
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.name;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }

  // 渲染分类列表
  renderCategories() {
    const container = document.querySelector('.categories-list');
    
    // 保留添加分类按钮
    const addButton = container.querySelector('.form-group');
    
    // 清空分类列表
    container.innerHTML = '';
    
    // 重新添加分类项
    this.categories.forEach(category => {
      const categoryItem = document.createElement('div');
      categoryItem.className = 'category-item';
      categoryItem.innerHTML = `
        <span>${category.name}</span>
        <div class="category-actions">
          <button class="btn secondary small" data-category-id="${category.id}" disabled>编辑</button>
          <button class="btn danger small delete-category" data-category-id="${category.id}">删除</button>
        </div>
      `;
      
      // 添加删除事件监听器
      categoryItem.querySelector('.delete-category').addEventListener('click', (e) => {
        this.deleteCategory(category.id);
      });
      
      container.appendChild(categoryItem);
    });
    
    // 重新添加添加分类按钮
    container.appendChild(addButton);
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
  
  // 绑定添加分类按钮事件
  const addCategoryBtn = document.getElementById('add-category-btn');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
      window.accountManager.openCategoryModal();
    });
  }
  
  // 绑定添加分类表单提交事件
  const categoryForm = document.getElementById('category-form');
  if (categoryForm) {
    categoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.accountManager.addCategory();
    });
  }
  
  // 绑定关闭分类模态框事件
  const categoryModal = document.getElementById('category-modal');
  const categoryCloseBtn = categoryModal?.querySelector('.close');
  if (categoryCloseBtn) {
    categoryCloseBtn.addEventListener('click', () => {
      window.accountManager.closeCategoryModal();
    });
  }
  
  // 点击模态框外部关闭模态框
  if (categoryModal) {
    categoryModal.addEventListener('click', (e) => {
      if (e.target === categoryModal) {
        window.accountManager.closeCategoryModal();
      }
    });
  }
});