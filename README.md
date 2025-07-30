# Account

账户管理仓库

## 项目描述

这是一个用于账户管理的项目仓库，包含一个运行在macOS上的账户管理器应用。

## 账户管理器

### 功能特性

- 添加账户和密码
- 安全获取账户密码
- 删除账户
- 使用macOS钥匙串存储密码，防止其他应用程序读取
- 提供图形用户界面

### 安装依赖

```bash
pip install -r requirements.txt
```

### 使用方法

#### 命令行界面

```bash
# 添加账户
python account_manager/src/main.py add <用户名> <密码>

# 获取密码
python account_manager/src/main.py get <用户名>

# 删除账户
python account_manager/src/main.py delete <用户名>

# 显示帮助
python account_manager/src/main.py help
```

#### 图形界面

```bash
# 运行图形界面
python account_manager/src/gui.py
```

### 安全性说明

账户管理器使用Python的keyring库，该库在macOS上使用钥匙串(Keychain)来存储密码，
确保密码不会被其他应用程序读取，提供了系统级别的安全保护。

## 贡献

欢迎提交 Pull Request 和 Issue。