#!/bin/bash

# 账户管理器设置脚本

# 获取脚本所在目录
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# 创建虚拟环境
python3 -m venv "$SCRIPT_DIR/venv"

# 激活虚拟环境
source "$SCRIPT_DIR/venv/bin/activate"

# 升级pip
pip install --upgrade pip

# 安装依赖
pip install -r "$SCRIPT_DIR/../requirements.txt"

echo "环境设置完成。"
echo "要激活虚拟环境，请运行: source account_manager/venv/bin/activate"
echo "要运行命令行界面，请执行: python account_manager/src/main.py help"
echo "要运行图形界面，请执行: python account_manager/src/gui.py"