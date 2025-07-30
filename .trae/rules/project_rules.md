# GitHub 操作规范

## 所有github操作都在分支cursor上进行

## 分支管理
- 所有 GitHub 相关操作必须在 `treacn` 分支上进行
- 创建 Pull Request 时，目标分支应为主分支（main/master）
- 在进行任何 GitHub 操作前，确保当前工作在正确的分支上

## 提交规范
- 使用清晰、描述性的提交信息
- 提交信息应使用中文，格式为：`类型: 简短描述`
- 常用类型：功能、修复、文档、重构、测试

## Pull Request 规范
- PR 标题应简洁明了，描述主要变更
- 在 PR 描述中包含变更的详细说明
- 确保所有相关测试通过后再请求合并

## 代码审查
- 所有代码变更都需要通过 Pull Request 进行
- 重要变更需要进行代码审查
- 保持代码质量和项目一致性

## Python开发规范

### 虚拟环境管理
- 每个项目都必须创建独立的Python虚拟环境
- 使用 `python3 -m venv <项目名>_env` 创建虚拟环境
- 激活虚拟环境：`source <项目名>_env/bin/activate`
- 创建 requirements.txt 文件管理依赖

### 依赖管理
- 所有第三方库安装必须在激活的虚拟环境中进行
- 使用 `pip freeze > requirements.txt` 导出依赖
- 使用 `pip install -r requirements.txt` 安装依赖

### 代码风格
- 遵循PEP 8代码规范
- 使用4个空格缩进
- 行长度不超过79个字符
- 适当添加注释和文档字符串

### 测试
- 为关键功能编写单元测试
- 使用unittest或pytest框架
- 测试覆盖率应达到80%以上