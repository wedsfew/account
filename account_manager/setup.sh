#!/bin/bash

# 账户管理器设置脚本

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 升级pip
pip install --upgrade pip

# 安装依赖
pip install -r ../requirements.txt

echo "环境设置完成。要激活虚拟环境，请运行: source venv/bin/activate"