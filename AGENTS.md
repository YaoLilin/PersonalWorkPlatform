

# 项目规则说明
## 项目结构
### 前端
- 使用 React 框架
- 组件使用 antd
- 样式使用 tailwind

### 后端
- 框架使用 SpringBoot
- ORM 框架使用 MyBatis Pro
- 缓存使用 Redis

## 项目规则
- 前端尽可能使用 antd 组件
- 如果数据库表结构发生更改，即时更新SQL文件：[personal_work.sql](work-platform-server/sql/personal_work.sql)。
- 数据库表结构发生更改后，创建升级文件：在 [upgrade](work-platform-server/sql/upgrade) 目录下新增/修改SQL文件，记录表结构变更内容，如果文件夹下有git未提交修改的SQL文件，则记录到此文件，如果没有修改文件，则创建文件，需先在文件夹下新增名称为当前日期的文件夹，例如：upgrade/20260719，然后在日期文件夹内新增SQL文件，记录变更内容。
- 如果数据库表字段为字典类，则必需在字段注释中说明字典对应名称，如：0:未完成 1:已完成

#### git 提交规范
- 如果存在较多改动，需要在 git 提交信息的正文（Body）中描述改动内容

git 提交信息示例：
```text
feat(user-auth): 增加用户邮箱验证功能

为了提升账户安全性，本次提交增加了用户注册后的邮箱验证流程。

- 新增邮件发送服务接口
- 在用户注册成功后自动生成并发送验证链接
- 增加验证链接的有效时间戳校验

Closes #234
```

### 全局规则
- 遵守全局规则文件：/Users/yaolilin/.agents/global-rules.md
