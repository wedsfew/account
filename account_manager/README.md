# 账户管理器

这是一个运行在macOS上的简单账户管理工具，用于安全地添加和保存账户密码。

## 功能特性

- 添加账户和密码
- 安全获取账户密码
- 删除账户
- 使用macOS钥匙串存储密码，防止其他应用程序读取
- 提供图形用户界面

## 安装依赖

```bash
pip install -r requirements.txt
```

## 使用方法

### 命令行界面

```bash
# 添加账户
python src/main.py add <用户名> <密码>

# 获取密码
python src/main.py get <用户名>

# 删除账户
python src/main.py delete <用户名>

# 显示帮助
python src/main.py help
```

### 图形界面

```bash
# 运行图形界面
python src/gui.py
```

## 安全性说明

本工具使用Python的keyring库，该库在macOS上使用钥匙串(Keychain)来存储密码，
确保密码不会被其他应用程序读取，提供了系统级别的安全保护。