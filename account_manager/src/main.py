#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
账户管理应用主文件

该应用提供命令行界面用于添加、查看和删除账户信息。
密码将使用keyring库安全存储，防止其他应用程序读取。
"""

import keyring
import sys
import os

class AccountManager:
    """账户管理器类"""
    
    def __init__(self, service_name="AccountManager"):
        """
        初始化账户管理器
        
        Args:
            service_name (str): 用于keyring的服务名称
        """
        self.service_name = service_name
    
    def add_account(self, username, password):
        """
        添加账户
        
        Args:
            username (str): 用户名
            password (str): 密码
        """
        try:
            keyring.set_password(self.service_name, username, password)
            print(f"账户 {username} 已成功添加。")
        except Exception as e:
            print(f"添加账户时出错: {e}")
    
    def get_password(self, username):
        """
        获取账户密码
        
        Args:
            username (str): 用户名
            
        Returns:
            str: 密码或None
        """
        try:
            password = keyring.get_password(self.service_name, username)
            return password
        except Exception as e:
            print(f"获取密码时出错: {e}")
            return None
    
    def delete_account(self, username):
        """
        删除账户
        
        Args:
            username (str): 用户名
        """
        try:
            keyring.delete_password(self.service_name, username)
            print(f"账户 {username} 已成功删除。")
        except keyring.errors.PasswordDeleteError:
            print(f"账户 {username} 不存在。")
        except Exception as e:
            print(f"删除账户时出错: {e}")
    
    def list_accounts(self):
        """
        列出所有账户（仅用户名）
        注意：keyring库不直接提供列出所有账户的功能，
        这里仅作为示例，实际应用中可能需要其他方式实现。
        """
        print("账户列表功能需要额外实现，因为keyring库不直接支持。")

def show_help():
    """显示帮助信息"""
    print("""
账户管理器使用说明:
  添加账户: python main.py add <用户名> <密码>
  获取密码: python main.py get <用户名>
  删除账户: python main.py delete <用户名>
  帮助信息: python main.py help
    """)

def main():
    """主函数"""
    if len(sys.argv) < 2:
        show_help()
        return
    
    manager = AccountManager()
    
    command = sys.argv[1]
    
    if command == "add" and len(sys.argv) == 4:
        username = sys.argv[2]
        password = sys.argv[3]
        manager.add_account(username, password)
    elif command == "get" and len(sys.argv) == 3:
        username = sys.argv[2]
        password = manager.get_password(username)
        if password:
            print(f"账户 {username} 的密码: {password}")
        else:
            print(f"未找到账户 {username} 或获取密码失败。")
    elif command == "delete" and len(sys.argv) == 3:
        username = sys.argv[2]
        manager.delete_account(username)
    elif command == "help":
        show_help()
    else:
        print("无效的命令或参数。")
        show_help()

if __name__ == "__main__":
    main()