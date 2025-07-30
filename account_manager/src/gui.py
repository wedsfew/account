#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
账户管理器GUI界面

使用tkinter创建图形用户界面，提供添加、查看和删除账户的功能。
"""

import tkinter as tk
from tkinter import ttk, messagebox
import keyring


class AccountManagerGUI:
    """账户管理器GUI类"""
    
    def __init__(self, root):
        """
        初始化账户管理器GUI
        
        Args:
            root (tk.Tk): tkinter根窗口
        """
        self.root = root
        self.root.title("账户管理器")
        self.root.geometry("400x300")
        
        # 设置服务名称
        self.service_name = "AccountManager"
        
        # 创建界面组件
        self.create_widgets()
    
    def create_widgets(self):
        """创建界面组件"""
        # 主框架
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 用户名输入
        ttk.Label(main_frame, text="用户名:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.username_entry = ttk.Entry(main_frame, width=30)
        self.username_entry.grid(row=0, column=1, pady=5)
        
        # 密码输入
        ttk.Label(main_frame, text="密码:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.password_entry = ttk.Entry(main_frame, width=30, show="*")
        self.password_entry.grid(row=1, column=1, pady=5)
        
        # 按钮框架
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=2, column=0, columnspan=2, pady=10)
        
        # 操作按钮
        ttk.Button(button_frame, text="添加账户", command=self.add_account).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="获取密码", command=self.get_password).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="删除账户", command=self.delete_account).pack(side=tk.LEFT, padx=5)
        
        # 结果显示区域
        ttk.Label(main_frame, text="结果:").grid(row=3, column=0, sticky=tk.W, pady=(10, 5))
        self.result_text = tk.Text(main_frame, height=10, width=40)
        self.result_text.grid(row=4, column=0, columnspan=2, pady=5)
        
        # 滚动条
        scrollbar = ttk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.result_text.yview)
        scrollbar.grid(row=4, column=2, sticky=(tk.N, tk.S))
        self.result_text.configure(yscrollcommand=scrollbar.set)
    
    def add_account(self):
        """添加账户"""
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        
        if not username or not password:
            messagebox.showerror("错误", "用户名和密码不能为空")
            return
        
        try:
            keyring.set_password(self.service_name, username, password)
            self.result_text.insert(tk.END, f"账户 {username} 已成功添加。\n")
            self.username_entry.delete(0, tk.END)
            self.password_entry.delete(0, tk.END)
        except Exception as e:
            messagebox.showerror("错误", f"添加账户时出错: {e}")
    
    def get_password(self):
        """获取账户密码"""
        username = self.username_entry.get().strip()
        
        if not username:
            messagebox.showerror("错误", "用户名不能为空")
            return
        
        try:
            password = keyring.get_password(self.service_name, username)
            if password:
                self.result_text.insert(tk.END, f"账户 {username} 的密码: {password}\n")
            else:
                self.result_text.insert(tk.END, f"未找到账户 {username}。\n")
        except Exception as e:
            messagebox.showerror("错误", f"获取密码时出错: {e}")
    
    def delete_account(self):
        """删除账户"""
        username = self.username_entry.get().strip()
        
        if not username:
            messagebox.showerror("错误", "用户名不能为空")
            return
        
        try:
            keyring.delete_password(self.service_name, username)
            self.result_text.insert(tk.END, f"账户 {username} 已成功删除。\n")
            self.username_entry.delete(0, tk.END)
            self.password_entry.delete(0, tk.END)
        except keyring.errors.PasswordDeleteError:
            messagebox.showerror("错误", f"账户 {username} 不存在。")
        except Exception as e:
            messagebox.showerror("错误", f"删除账户时出错: {e}")


def main():
    """主函数"""
    root = tk.Tk()
    app = AccountManagerGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()