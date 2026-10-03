# PersonalWorkPlatform 个人工作平台

个人工作管理系统，提供项目、清单、日程、问题库、工作统计和目标管理。仓库由 React 前端与 Spring Boot 后端组成。

## 主要功能

| 模块 | 功能 |
| --- | --- |
| 账号 | 注册、登录、退出；登录后通过 JWT 访问业务接口 |
| 项目 | 按类型组织项目，维护项目时间、进度、状态、重要程度及显示颜色 |
| 清单 | 按清单类型管理待办，关联项目和日程，标记完成状态 |
| 日程 | 在日历中创建、修改、删除日程，查看项目和清单的时间安排及统计 |
| 问题库 | 记录问题、级别、所属周与解决情况 |
| 工作统计 | 周记录、月记录、项目用时和图表统计 |
| 目标 | 管理按项目划分的周目标、月目标及完成状态 |

完整功能、架构和数据库设计见 [开发说明](docs/development-guide.md)。

## 技术栈

- 前端：React 18、Vite 5、React Router、Ant Design 5、Tailwind CSS、FullCalendar。
- 后端：Java 17、Spring Boot 3.2.3、Spring Security、MyBatis-Plus 3.5.9。
- 数据：MySQL 8、Redis。

## 本地安装与启动

### 准备环境

安装 JDK 17、MySQL 8、Redis、Node.js 和 npm。后端仓库自带 Maven Wrapper（`mvnw`）。前端依赖锁文件为 `package-lock.json`，以下步骤使用 npm。

### 1. 初始化数据库

从仓库根目录执行：

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS personal_work_dev CHARACTER SET utf8mb4;"
mysql -u root -p personal_work_dev < work-platform-server/sql/personal_work.sql
```

SQL 文件包含 `DROP TABLE IF EXISTS`，只应导入到**新建或可清空**的数据库；已有数据的数据库应按需执行 `work-platform-server/sql/upgrade/` 中的升级脚本。确认 MySQL、Redis 已启动，并按本机环境配置 `work-platform-server/src/main/resources/config/application-dev.yml` 的数据库连接和 Redis 地址。JWT 签名配置位于 `work-platform-server/src/main/resources/config/secret.yml`，部署前需设置自己的密钥，不要把真实凭据提交到仓库。

### 2. 启动后端

```bash
cd work-platform-server
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

`dev` profile 的后端端口是 `8081`。

### 3. 启动前端

在另一个终端执行：

```bash
cd work-platform-react
npm ci
npm run dev
```

打开 <http://localhost:3000>。开发代理会将 `/api` 请求转发到 `http://localhost:8081`；相关地址在 `work-platform-react/.env.dev` 和 `vite.config.mjs` 中配置。

## 部署

### 后端 JAR

在服务器准备 MySQL、Redis，并根据 `application-prod.yml` 配置数据库连接、Redis 地址和生产密钥。`prod` profile 使用 `personal_work` 数据库、Redis DB 0，监听 `8080` 端口。首次部署到空数据库时，可将上面的建库与导入命令中的库名改为 `personal_work`。

```bash
cd work-platform-server
./mvnw clean package -DskipTests
java -jar target/work-platform-server-1.0-SNAPSHOT.jar --spring.profiles.active=prod
```

### 前端静态资源

```bash
cd work-platform-react
npm ci
npm run build
```

构建结果位于 `work-platform-react/dist/`。将其交给支持单页应用回退的静态服务器，并把 `/api/` 反向代理到后端 `8080` 端口。例如 Nginx 站点配置中的核心规则：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /api/ {
    proxy_pass http://127.0.0.1:8080;
}
```

静态资源目录由实际部署路径决定。前端以相对路径请求 `/api`，因此部署时应保证静态站点与 API 代理处于同一域名。

### 后端 Dockerfile

仓库还提供 `work-platform-server/Dockerfile`，其入口固定使用 `dev-docker` profile，要求构建上下文中存在名为 `personal-work-server.jar` 的文件，并通过容器网络访问名为 `mysql`、`redis` 的服务。准备好这些条件后可构建镜像；生产部署建议按上面的 JAR 方式使用 `prod` profile，或先调整 Dockerfile 与运行环境。

## 开发文档

- [系统架构、全部功能与数据库表设计](docs/development-guide.md)
- [数据库初始化 SQL](work-platform-server/sql/personal_work.sql)
- [数据库升级脚本](work-platform-server/sql/upgrade/)

## 许可

见 [LICENSE](LICENSE)。
