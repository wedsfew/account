#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
账户管理器测试文件
"""

import unittest
import sys
import os

# 将src目录添加到Python路径中
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from main import AccountManager

class TestAccountManager(unittest.TestCase):
    """账户管理器测试类"""
    
    def setUp(self):
        """测试前准备"""
        self.manager = AccountManager("TestAccountManager")
    
    def test_add_and_get_account(self):
        """测试添加和获取账户"""
        username = "testuser"
        password = "testpassword"
        
        # 添加账户
        self.manager.add_account(username, password)
        
        # 获取密码
        retrieved_password = self.manager.get_password(username)
        self.assertEqual(retrieved_password, password)
    
    def test_delete_account(self):
        """测试删除账户"""
        username = "testuser2"
        password = "testpassword2"
        
        # 添加账户
        self.manager.add_account(username, password)
        
        # 删除账户
        self.manager.delete_account(username)
        
        # 尝试获取已删除账户的密码
        retrieved_password = self.manager.get_password(username)
        self.assertIsNone(retrieved_password)

if __name__ == '__main__':
    unittest.main()