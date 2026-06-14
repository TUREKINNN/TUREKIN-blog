# 🚀 www.turekin.me 项目 Wiki

> **完整技术文档** — 面向新开发者，30 分钟内理解并开始贡献

---

## 📋 一、项目总览

**www.turekin.me** 是一个个人博客网站，采用前后端分离架构。

| 项目 | 说明 |
|------|------|
| **定位** | 个人技术博客，支持 Markdown 文章发布、评论互动、音乐播放、主题定制 |
| **域名** | www.turekin.me |
| **服务器** | 阿里云 www.turekin.me / Ubuntu 24.04 / 2核2GB |
| **前端** | React 18 + TypeScript + Vite + Tailwind CSS |
| **后端** | Express 5 + TypeScript + Prisma ORM |
| **数据库** | MySQL 8.0 |
| **进程管理** | PM2 |
| **反向代理** | Nginx（宝塔面板管理） |
| **部署方式** | Bash 脚本 + SCP 上传 |

> ⚠️ **已移除的功能：** 背景图系统（BackgroundProvider/BackgroundPicker）已从前端移除；亮色模式已删除，全站仅支持暗色主题。

---

## 📁 二、完整目录结构与文件说明

```
www.turekin.me/
├── deploy.sh                          # 一键部署脚本（主）
├── nginx.conf                         # Nginx 配置文件
│
├── frontend/                          # 🎨 前端项目 (React + Vite)
│   ├── package.json                   # 前端依赖定义
│   ├── tsconfig.json                  # TypeScript 配置
│   ├── vite.config.ts                 # Vite 构建配置
│   ├── index.html                     # HTML 入口
│   ├── public/                        # 静态资源
│   │   ├── avatar/                    # 默认头像 (root.png, user.png, visitor.png)
│   │   ├── beian-icon.png             # 备案图标
│   │   └── favicon.ico                # 网站图标
│   └── src/
│       ├── main.tsx                   # 应用入口
│       ├── App.tsx                    # 根组件 — 路由定义 + 全局 Context Provider 嵌套
│       ├── index.css                  # 全局样式 + Tailwind + CSS 变量
│       │
│       ├── context/                   # 🧩 React Context（全局状态管理）
│       │   ├── AuthContext.tsx        # 用户认证状态 (admin/visitor/guest)
│       │   ├── ArticleContext.tsx     # 文章 CRUD 状态
│       │   ├── SearchFilterContext.tsx# 搜索/标签筛选状态
│       │   ├── SiteThemeContext.tsx   # 主题色（accent）+ 底色（bg hue）
│       │   └── ToastContext.tsx       # 全局 Toast 通知（暂未接入 Provider 树）
│       │
│       ├── pages/                     # 📄 页面组件
│       │   ├── HomePage.tsx           # 首页 — Hero + 文章列表（经典/影院/唱片三视图）
│       │   ├── ArticlePage.tsx        # 文章详情 — Markdown 渲染 + 目录 + 评论
│       │   ├── AboutPage.tsx          # 关于页面 — 站点介绍
│       │   ├── ProfilePage.tsx        # 个人设置 — 修改用户名/密码/头像
│       │   ├── FriendLinksPage.tsx    # 友链页面（含可编辑的站点信息）
│       │   └── ArchivePage.tsx        # 文章归档 — 动态分类标签页
│       │
│       ├── components/                # 🧱 通用/业务组件
│       │   ├── Layout.tsx             # 全局布局 — 导航栏 + 侧栏 + 页脚 + 音乐播放器（懒加载）
│       │   ├── Navbar.tsx             # 移动端顶部导航
│       │   ├── Sidebar.tsx            # 侧边栏 — 搜索、标签、主题选择（accent + bg hue）、日历、友链
│       │   ├── ArticleCard.tsx        # 文章卡片
│       │   ├── MusicPlayer.tsx        # 🎵 音乐播放器（迷你+展开两种态，含封面与音量）
│       │   ├── MiniCalendar.tsx       # 📅 迷你日历（独立组件版本）
│       │   ├── CinemaView.tsx         # 🎬 文章影院视图
│       │   ├── AlbumView.tsx          # 💿 文章唱片视图
│       │   ├── TagFilter.tsx          # 标签筛选下拉
│       │   ├── CommentSection.tsx     # 💬 评论区域（含回复、点赞、删除、置顶）
│       │   ├── LikeButton.tsx         # ❤️ 点赞按钮
│       │   ├── HoverPreview.tsx       # 链接悬停预览
│       │   ├── ImagePreview.tsx       # 图片点击放大预览
│       │   ├── ImageUpload.tsx        # 图片上传组件
│       │   ├── LazyImage.tsx          # 懒加载图片
│       │   ├── LoadingSpinner.tsx     # 通用加载动画
│       │   ├── AvatarUploadModal.tsx  # 头像上传模态框
│       │   ├── Toast.tsx              # Toast 通知渲染
│       │   ├── admin/
│       │   │   ├── PublishEditArticle.tsx  # 发布/编辑文章表单（含分类选择）
│       │   │   ├── AdminPanel.tsx          # 管理面板（含分类管理/站点信息/友链/音乐）
│       │   │   ├── AdminArticleActions.tsx # 文章管理操作按钮
│       │   └── auth/
│       │       ├── LoginPage.tsx      # 登录页面
│       │       ├── AdminLoginForm.tsx # 管理员登录表单
│       │       ├── VisitorLoginForm.tsx # 访客登录/注册表单
│       │       └── ProtectedRoute.tsx # 路由守卫
│       │
│       ├── hooks/                     # 🪝 自定义 Hooks
│       │   ├── useApi.ts             # HTTP 请求封装 (apiFetch, apiUpload)
│       │   ├── useBrowseTracker.ts    # 文章阅读时长追踪
│       │   └── ...                    # 其他 hooks
│       │
│       ├── types/                     # 📐 TypeScript 类型定义
│       │   ├── index.ts              # Article, Comment 等核心类型
│       │   └── auth.ts              # AuthUser, UserRole, LoginError 等
│       │
│       ├── utils/                     # 🔧 工具函数
│       │   ├── auth.ts              # 认证辅助
│       │   ├── performance.ts       # 性能优化
│       │   ├── imageStore.ts        # 图片本地缓存
│       │   └── logger.ts            # 客户端日志
│       │
│       └── constants/
│           └── api.ts               # API 常量
│
├── backend/                           # ⚙️ 后端项目 (Express + Prisma)
│   ├── package.json                   # 后端依赖
│   ├── tsconfig.json                  # TypeScript 配置
│   ├── .env.example                   # 环境变量模板
│   ├── deploy/                        # 部署相关
│   │   ├── deploy.sh                  # 旧版部署脚本
│   │   ├── nginx.conf                 # Nginx 配置（备用）
│   │   └── .env.example               # 生产环境变量模板
│   ├── prisma/
│   │   ├── schema.prisma             # 📊 数据库 Schema（8 张表，含 background_images 但前端已弃用）
│   │   └── seed.ts                   # 种子数据脚本
│   └── src/
│       ├── index.ts                   # 服务启动入口
│       ├── app.ts                     # Express 应用配置（中间件、路由注册）
│       │
│       ├── routes/                    # 🛣️ API 路由（9 个路由文件）
│       │   ├── auth.ts               # /api/auth/* — 认证 + 头像上传
│       │   ├── articles.ts           # /api/articles/* — 文章
│       │   ├── comments.ts           # /api/comments/* — 评论
│       │   ├── uploads.ts            # /api/uploads/* — 文件上传（文章图片、背景图）
│       │   ├── config.ts             # /api/config/* — 站点配置（含 about 信息、分类）
│       │   ├── tags.ts               # /api/tags/* — 标签
│       │   ├── browse.ts             # /api/browse/* — 浏览追踪
│       │   ├── friendLinks.ts        # /api/friendlinks/* — 友链
│       │   └── music.ts             # /api/music/* — 音乐
│       │
│       ├── services/                  # 🧠 业务逻辑层（5 个服务）
│       │   ├── auth.service.ts       # 用户注册/登录/会话管理 + 头像处理
│       │   ├── article.service.ts    # 文章 CRUD + 点赞
│       │   ├── comment.service.ts    # 评论 CRUD + 点赞 + 置顶
│       │   ├── upload.service.ts     # 文件上传/站点配置/标签/背景图管理
│       │   └── browse.service.ts     # 浏览记录（JSON 文件存储）
│       │
│       ├── middleware/                # 🔗 中间件（5 个）
│       │   ├── auth.ts               # requireAuth — 登录校验
│       │   ├── adminOnly.ts          # adminOnly — 管理员权限校验
│       │   ├── validate.ts           # validate — Zod 请求体校验
│       │   ├── upload.ts             # uploadSingle — Multer 文件上传
│       │   └── errorHandler.ts       # 全局错误处理 + 404
│       │
│       ├── lib/
│       │   └── prisma.ts             # Prisma Client 单例
│       │
│       ├── types/
│       │   └── index.ts              # 后端类型定义 (ApiResponse, PaginatedResponse, ArticleListItem...)
│       │
│       └── utils/
│           ├── errors.ts             # AppError 类 + 快捷工厂函数
│           └── password.ts           # bcrypt 密码加密/验证
```

---

## 🗄️ 三、数据库 Schema

> ORM: Prisma / 数据库: MySQL / 字符集: utf8mb4

### 3.1 表一览

| 表名 | 映射 | 说明 |
|------|------|------|
| `users` | User | 用户表 |
| `articles` | Article | 文章表（含 category 字段） |
| `comments` | Comment | 评论表（支持嵌套回复） |
| `article_likes` | ArticleLike | 文章点赞关联表 |
| `comment_likes` | CommentLike | 评论点赞关联表 |
| `site_config` | SiteConfig | 站点配置（JSON KV，存 about/carousel/categories） |
| `friend_links` | FriendLink | 友情链接 |
| `music` | Music | 音乐播放列表 |
| `background_images` | BackgroundImage | ⚠️ 背景图（前端已弃用，表仍存在） |

### 3.2 详细字段

#### User (`users`)
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT (PK, AUTO_INCREMENT) | 用户 ID |
| `username` | VARCHAR(50) UNIQUE | 用户名 |
| `password_hash` | VARCHAR(255) | bcrypt 密码哈希 |
| `role` | VARCHAR(20) DEFAULT 'visitor' | 角色: admin / visitor / guest |
| `display_name` | VARCHAR(100) | 显示名称 |
| `avatar_url` | VARCHAR(500) NULLABLE | 头像 URL（如 `/uploads/avatars/TUREKIN.jpg`） |
| `created_at` | DATETIME | 创建时间 |
| `updated_at` | DATETIME | 更新时间 |

**关系：** User 1:N Article (author)、1:N Comment (author)、1:N ArticleLike、1:N CommentLike

#### Article (`articles`)
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT (PK, AUTO_INCREMENT) | 文章 ID |
| `title` | VARCHAR(200) | 标题 |
| `summary` | VARCHAR(500) | 摘要 |
| `content` | LONGTEXT | Markdown 正文 |
| `cover_image` | VARCHAR(500) NULLABLE | 封面图 URL |
| `tags` | JSON DEFAULT '[]' | 标签数组 |
| `category` | VARCHAR(50) NULLABLE | 分类（管理员可选） |
| `read_time` | INT DEFAULT 5 | 预估阅读时间（分钟） |
| `likes` | INT DEFAULT 0 | 点赞数（冗余计数） |
| `pinned` | BOOLEAN DEFAULT false | 是否置顶 |
| `publish_date` | DATETIME DEFAULT NOW() | 发布日期 |
| `author_id` | INT (FK → users.id) | 作者 ID |
| `created_at` | DATETIME | 创建时间 |
| `updated_at` | DATETIME | 更新时间 |

**索引：** `(pinned DESC, publishDate DESC)` — 列表排序；`(authorId)` — 按作者查询

**关系：** Article N:1 User (author)、1:N Comment、1:N ArticleLike

#### Comment (`comments`)
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT (PK, AUTO_INCREMENT) | 评论 ID |
| `content` | TEXT | 评论内容 |
| `article_id` | INT (FK → articles.id) CASCADE | 所属文章 |
| `author_id` | INT (FK → users.id) CASCADE | 评论者 |
| `parent_id` | INT NULLABLE (自引用 FK) CASCADE | 父评论 ID（嵌套回复） |
| `pinned` | BOOLEAN DEFAULT false | 是否置顶 |
| `likes_count` | INT DEFAULT 0 | 点赞数（冗余计数） |
| `created_at` | DATETIME | 创建时间 |

**关系：** Comment N:1 Article、N:1 User (author)、自引用 1:N (parent → replies)

#### ArticleLike (`article_likes`)
| 字段 | 类型 | 说明 |
|------|------|------|
| `article_id` | INT (FK → articles.id) CASCADE | 文章 ID |
| `user_id` | INT (FK → users.id) CASCADE | 用户 ID |
| `created_at` | DATETIME | 点赞时间 |

**主键：** 复合主键 `(articleId, userId)` — 同一用户对同一文章只能点赞一次

#### CommentLike (`comment_likes`)
| 字段 | 类型 | 说明 |
|------|------|------|
| `comment_id` | INT (FK → comments.id) CASCADE | 评论 ID |
| `user_id` | INT (FK → users.id) CASCADE | 用户 ID |
| `created_at` | DATETIME | 点赞时间 |

**主键：** 复合主键 `(commentId, userId)`

#### SiteConfig (`site_config`)
| 字段 | 类型 | 说明 |
|------|------|------|
| `config_key` | VARCHAR(100) (PK) | 配置键 |
| `config_value` | JSON | 配置值（任意 JSON） |
| `updated_at` | DATETIME | 更新时间 |

**已知配置键：**
- `carousel` — 轮播配置（carouselEnabled, carouselInterval 等）
- `about` — 关于页面内容（siteName, siteDesc, siteAvatar, githubUrl, **categories** 等）

#### FriendLink (`friend_links`)
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT (PK, AUTO_INCREMENT) | 友链 ID |
| `name` | VARCHAR(100) | 站点名称 |
| `url` | VARCHAR(500) | 链接 URL |
| `avatar_url` | VARCHAR(500) | 头像 URL |
| `description` | TEXT | 描述 |
| `created_at` | DATETIME | 创建时间 |
| `updated_at` | DATETIME | 更新时间 |

#### Music (`music`)
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT (PK, AUTO_INCREMENT) | 音乐 ID |
| `title` | VARCHAR(200) | 歌曲标题 |
| `artist` | VARCHAR(100) | 艺术家 |
| `url` | VARCHAR(500) | 音频文件 URL |
| `cover_url` | VARCHAR(500) NULLABLE | 封面图 URL |
| `duration` | INT DEFAULT 0 | 时长（秒） |
| `sort_order` | INT DEFAULT 0 | 排序顺序 |
| `created_at` | DATETIME | 创建时间 |

### 3.3 ER 关系图（文字版）

```
User ───1:N─── Article ───1:N─── Comment ───1:N─── Comment (self-ref replies)
  │              │                    │
  │              │                    └──1:N─── CommentLike
  │              │
  │              └──1:N─── ArticleLike
  │
  └──1:N─── Comment
  └──1:N─── ArticleLike
  └──1:N─── CommentLike

SiteConfig         (独立实体，KV 存储)
FriendLink         (独立实体)
Music              (独立实体)
BackgroundImage    (⚠️ 独立实体，前端已弃用)
```

---

## 🌐 四、所有 API 端点

> 基础路径: `/api`  
> 响应格式: `{ success: boolean, data?: T, error?: { code: string, message: string } }`  
> Auth: Session-based (express-session + MySQL store)

### 4.1 认证模块 — `/api/auth`

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| `POST` | `/api/auth/login` | 无 | 用户登录。Body: `{ username, password }` |
| `POST` | `/api/auth/register` | 无 | 访客注册。Body: `{ username, password, displayName }` |
| `POST` | `/api/auth/guest` | 无 | 游客快速登录（自动创建临时账号） |
| `POST` | `/api/auth/logout` | 登陆即可 | 退出登录（销毁 session） |
| `GET` | `/api/auth/me` | 登陆即可 | 获取当前登录用户信息 |
| `GET` | `/api/auth/admin-profile` | 无 | 获取管理员公开信息（头像、名称） |
| `POST` | `/api/auth/avatar` | requireAuth | 上传头像（multipart: `avatar`）。Guest 禁止 |
| `PATCH` | `/api/auth/profile` | requireAuth | 更新个人信息。Body: `{ username?, displayName?, password?, currentPassword? }`。Guest 禁止 |

**速率限制：** `/api/auth/login`、`/api/auth/register`、`/api/auth/guest` — 15 分钟最多 20 次

### 4.2 文章模块 — `/api/articles`

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| `GET` | `/api/articles` | 可选 | 文章列表（分页）。Query: `page`, `tag`, `search` |
| `GET` | `/api/articles/dates` | 无 | 获取所有文章日期列表（供日历使用） |
| `GET` | `/api/articles/:id` | 可选 | 文章详情（含评论） |
| `POST` | `/api/articles` | admin | 创建文章。Body: `{ title, summary, content, tags, coverImage?, readTime?, category? }` |
| `PUT` | `/api/articles/:id` | admin | 更新文章 |
| `DELETE` | `/api/articles/:id` | admin | 删除文章（级联删除评论） |
| `PATCH` | `/api/articles/:id/pin` | admin | 切换文章置顶状态 |
| `POST` | `/api/articles/:id/like` | requireAuth | 切换文章点赞（已赞则取消） |

**分页大小：** 首页 12 条/页（`PP = 12`），归档页使用 `pageSize=100`

### 4.3 评论模块 — `/api/articles/:id/comments` 和 `/api/comments`

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| `POST` | `/api/articles/:id/comments` | requireAuth | 发表评论/回复。Body: `{ content, parentId? }` |
| `DELETE` | `/api/comments/:commentId` | requireAuth | 删除评论（作者本人/admin可删） |
| `PATCH` | `/api/comments/:commentId` | requireAuth | 编辑评论（仅作者本人） |
| `PATCH` | `/api/comments/:commentId/pin` | admin | 切换评论置顶 |
| `POST` | `/api/comments/:commentId/like` | requireAuth | 切换评论点赞 |

### 4.4 上传模块 — `/api/uploads`

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| `POST` | `/api/uploads/article-image` | admin | 上传文章插图（multipart: `image`） |
| `POST` | `/api/uploads/background` | admin | 上传背景图（multipart: `background`）⚠️ 前端已弃用 |

**速率限制：** `/api/uploads/*` — 15 分钟最多 30 次

### 4.5 站点配置模块 — `/api/config`

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| `GET` | `/api/config` | 无 | 获取站点配置 |
| `PUT` | `/api/config` | admin | 更新站点配置 |
| `GET` | `/api/config/about` | 无 | 获取关于页面内容（含 categories, siteName, siteDesc, siteAvatar, githubUrl） |
| `PUT` | `/api/config/about` | admin | 更新关于页面内容（合并写入，不会覆盖未提交字段） |

### 4.6 标签模块 — `/api/tags`

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| `GET` | `/api/tags` | 无 | 获取所有标签（聚合去重） |

### 4.7 浏览追踪模块 — `/api/browse`

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| `POST` | `/api/browse` | 可选 | 记录浏览会话。Body: `{ articleId, startTime, endTime, durationMs }` |
| `GET` | `/api/browse/article/:id` | 无 | 获取文章浏览统计 |

**存储方式：** JSON 文件（`data/browse_sessions.json`），不经过数据库

### 4.8 友链模块 — `/api/friendlinks`

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| `GET` | `/api/friendlinks` | 无 | 获取所有友链 |
| `POST` | `/api/friendlinks` | admin | 添加友链 |
| `PUT` | `/api/friendlinks/:id` | admin | 更新友链 |
| `DELETE` | `/api/friendlinks/:id` | admin | 删除友链 |

### 4.9 音乐模块 — `/api/music`

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| `GET` | `/api/music` | 无 | 获取音乐列表（按 sortOrder 升序） |
| `POST` | `/api/music` | admin | 添加歌曲 |
| `PUT` | `/api/music/:id` | admin | 更新歌曲 |
| `DELETE` | `/api/music/:id` | admin | 删除歌曲 |

### 4.10 静态文件

| 访问路径 | 实际存储 | 说明 |
|---------|---------|------|
| `GET /uploads/*` | backend/uploads/ | 用户上传文件（头像、文章插图等） |

> **静态文件架构：** Nginx `/uploads/` 通过 `alias` 直接从磁盘 `backend/uploads/` 提供服务，不经过 Express 代理。`backend/uploads/` 目录通过符号链接映射到 web root 可访问路径。

---

## 🎨 五、前端架构

### 5.1 Context 嵌套层级（实际 App.tsx 结构）

```
AuthProvider                          ← 最外层：用户认证
  └─ SiteThemeProvider                ← 主题色（accent）+ 底色（bg hue）管理
      └─ ArticleProvider              ← 文章状态管理
          └─ SearchFilterProvider     ← 搜索/标签筛选
```

> ⚠️ `ToastContext` 已定义但**未接入 Provider 树**（App.tsx 中未包裹 ToastProvider）。`ThemeContext`（亮/暗模式切换）已弃用 — 全站仅暗色，`toggleTheme` 为空操作。

### 5.2 路由表

| 路径 | 组件 | 懒加载 | 说明 |
|------|------|--------|------|
| `/` | HomePage | ❌ | 首页 |
| `/article/:id` | ArticlePage | ✅ | 文章详情 |
| `/about` | AboutPage | ✅ | 关于页面 |
| `/login` | LoginPage | ✅ | 登录页 |
| `/admin` | AdminPanel | ✅ | 管理面板 |
| `/admin/publish` | PublishEditArticle | ✅ | 发布文章 |
| `/admin/edit/:id` | PublishEditArticle | ✅ | 编辑文章 |
| `/settings` | ProfilePage | ❌ | 个人设置 |
| `/friends` | FriendLinksPage | ✅ | 友链页面 |
| `/archive` | ArchivePage | ✅ | 文章归档 |

### 5.3 页面组件说明

| 页面 | 核心功能 |
|------|---------|
| **HomePage** | Hero区（实时时钟、问候语、站点统计）+ 三视图切换（经典/影院/唱片）+ 搜索 + 标签筛选 + 分页（12条/页） |
| **ArticlePage** | Markdown渲染（react-markdown + remark-gfm）+ 代码高亮（Prism）+ 目录导航 + 评论 + 点赞 + 阅读时长追踪 |
| **Sidebar** | 侧边栏：搜索框 + 导航链接 + 标签云 + 日历组件（点击日期显示文章，双击显示整月）+ 友链列表 + 主题选择器（accent + bg hue）+ 用户登录/退出 |
| **MusicPlayer** | 固定右下角音乐播放器，迷你态显示封面缩略图，展开态有大封面+进度条（可拖拽）+音量控制（可拖拽）+歌单列表 |
| **CommentSection** | 嵌套评论 + 点赞 + 置顶 + 编辑 + 删除 + 相对时间显示 |
| **ArchivePage** | 年份分组 + 动态分类标签页（从 `/api/config/about` 读取 categories） |
| **FriendLinksPage** | 友链列表 + 本站信息卡片（名称/描述/链接/头像，管理员可在后台编辑） |

### 5.4 核心组件交互

```
Layout
├── Navbar (移动端)
├── Sidebar
│   ├── 搜索框 (→ SearchFilterContext)
│   ├── 导航链接 (react-router Link)
│   ├── 标签云 (→ TagFilter → SearchFilterContext)
│   ├── CalendarWidget (→ /api/articles/dates) — 内嵌日历+归档链接
│   ├── 友链列表 (→ /api/friendlinks)
│   ├── 主题色选择器 + 底色选择器 (→ SiteThemeContext)
│   └── 用户信息 + 登录/退出 + 头像上传 (→ AuthContext)
├── <main> → 路由页面
├── <footer> → 备案信息
└── MusicPlayer (懒加载)
```

---

## 🎨 六、设计系统

### 6.1 技术栈

- **CSS 框架：** Tailwind CSS 3.4
- **图标库：** lucide-react
- **主题方案：** CSS Custom Properties（CSS 变量）
- **模式：** 仅暗色（亮色模式已移除）

### 6.2 颜色系统

#### 主题色（Accent）— 6 种预设

通过 CSS 变量控制，由 `SiteThemeContext` 管理：

| 预设 ID | 名称 | HSL 色相 | 饱和度 | 亮度 |
|---------|------|---------|--------|------|
| `nebula` | 星云紫 | 250° | 85% | 65% |
| `ocean` | 深海蓝 | 215° | 80% | 60% |
| `forest` | 翡翠绿 | 160° | 70% | 50% |
| `sunset` | 日落橙 | 15° | 85% | 60% |
| `rose` | 玫瑰粉 | 330° | 75% | 60% |
| `amber` | 琥珀金 | 40° | 90% | 55% |

**CSS 变量：** `--theme-hue`, `--theme-sat`, `--theme-light`, `--accent-50`~`--accent-900`, `--accent-glow`

#### 底色（Background Hue）— 8 种预设

控制全局暗色背景的色相偏移，默认 `void`（纯黑）：

| 预设 ID | 名称 | 色相 | 说明 |
|---------|------|------|------|
| `void` | 纯黑 | 0° (sat 0%) | **默认**，最纯粹的黑 |
| `deepvoid` | 深空黑 | 250° | 微紫调深黑 |
| `navy` | 海军蓝 | 220° | 蓝调暗色 |
| `charcoal` | 墨灰 | 260° | 紫灰调 |
| `forestbg` | 森林 | 170° | 绿调暗色 |
| `warm` | 暖棕暗 | 20° | 棕色暖调 |
| `midnight` | 午夜紫 | 280° | 紫调 |
| `steel` | 钢铁蓝 | 210° | 蓝灰调 |

**CSS 变量：** `--bg-hue`

> `SiteThemeContext` 统一管理 accent 和 bg hue，通过 `<style>` 标签动态注入全局背景 CSS。用户选择持久化在 `localStorage`（键：`theme-preset`, `bg-preset`）。

### 6.3 Glass 效果（毛玻璃）

| 类名 | 用途 | 效果 |
|------|------|------|
| `glass-deep` | 侧边栏、导航栏 | 深层毛玻璃：高透明度背景 + backdrop-blur |
| `glass-mid` | 卡片、面板 | 中等毛玻璃 |
| `glass-light` | 弹窗、下拉 | 浅层毛玻璃 |
| `card` | 文章卡片 | 圆角 + 毛玻璃 + 边框 |
| `card-lift` | 可悬浮卡片 | hover 时上浮 + 阴影增强 |

**实现方式：** 通过 CSS 变量 `hsla(var(--bg-hue), 30%, 12%, 0.82)` 配合 `backdrop-filter: blur()` 实现

### 6.4 标签颜色

首页文章标签使用彩色背景（硬编码在 HomePage/CinemaView/AlbumView 中）：

```typescript
const TAG_COLORS = {
  'React':       { bg: 'rgba(59,130,246,0.15)',  text: '#93c5fd' },
  'TypeScript':  { bg: 'rgba(99,102,241,0.15)',  text: '#a5b4fc' },
  'CSS':         { bg: 'rgba(236,72,153,0.15)',  text: '#f9a8d4' },
  'Hermes':      { bg: 'rgba(99,102,241,0.15)',  text: '#a5b4fc' },
  'AI':          { bg: 'rgba(139,92,246,0.15)',  text: '#c4b5fd' },
  // ... 更多
}
```

### 6.5 字体

- **正文：** 系统默认字体栈（Tailwind 的 font-sans）
- **等宽/数字：** `font-mono tabular-nums`（用于时钟、统计数字）
- **品牌名：** `tracking-tight font-bold`

### 6.6 动效

| 动画 | 类名 | 说明 |
|------|------|------|
| 页面入场 | `animate-slide-up` | 从下方滑入 |
| 页面切换 | `animate-page-enter` | 淡入 |
| 卡片悬浮 | `card-lift` + `group-hover:scale-105` | 上浮 + 图片放大 |
| 数字计数 | `AnimatedNumber` 组件 | IntersectionObserver + easeOutCubic |
| 卡片闪光 | `card-shine` | hover 时对角线光晕 |

---

## ⚡ 七、关键功能详解

### 7.1 🎵 音乐播放器 (MusicPlayer)

- **位置：** 右下角固定悬浮
- **数据来源：** `GET /api/music` → 由管理员在后台（管理面板 > 音乐）添加
- **双态设计：**
  - **迷你态：** 显示封面缩略图 + 歌名 + 播放/暂停按钮
  - **展开态：** 显示大封面、进度条（可拖拽 seek）、**音量控制**（可拖拽 seekVol）、歌单列表
- **状态持久化：** 音量存储于 `localStorage`（键: `music-volume`），默认 0.7
- **自动播放：** 切歌时自动播放（需用户已触发过播放）
- **音频元素：** 使用 `Audio()` 实例，通过 `useRef` 持久化

### 7.2 📅 日历组件 (CalendarWidget / MiniCalendar)

- **位置：** 侧边栏内嵌（Sidebar 中的 `CalendarWidget`）+ 独立组件（`MiniCalendar.tsx`）
- **数据来源：** `GET /api/articles/dates` → 返回所有文章的 `{ id, title, date }`
- **交互逻辑：**
  1. 点击有文章的日期 → 列出该日文章
  2. 再次点击同一日期（双击） → 显示该月所有文章
  3. 第三次点击 → 取消选中
- **视觉标记：** 有文章的日期显示圆点 + 角标（文章数>1时显示计数）
- **月切换：** 左右箭头切换月份，切换后重置选中状态

### 7.3 🏷️ 分类体系

- **默认分类（5 个）：** `Project`, `Hermes`, `周热点`, `杂谈`, `开发者说`
- **存储位置：** `site_config` 表中 `configKey='about'` 的 JSON 字段 `categories`
- **管理方式：** 管理员在 AdminPanel → 📂 分类 中可**添加/删除**分类
- **使用方式：** 发布/编辑文章时可选择分类（`category` 字段），或选择「未分类」
- **动态读取：**
  - `ArchivePage` 从 `/api/config/about` 读取 categories 生成动态标签页
  - `PublishEditArticle` 从同一接口读取可用分类选项
- **归档页：** 每个分类作为独立 Tab，显示该分类下的文章（按年份分组）

### 7.4 🔗 友链系统 (FriendLinks)

- **数据表：** `friend_links`（name, url, avatarUrl, description）
- **显示位置：** 侧边栏底部 + 独立 `/friends` 页面
- **友链页面功能：**
  - 展示**本站信息**（站点名称、描述、链接、头像链接），每个字段可一键复制
  - 管理员在 AdminPanel > 🌐 站点 可编辑本站信息（写入 `/api/config/about`）
  - 展示已有友链列表（卡片式，支持 hover 外部链接图标）
  - 申请流程说明（先添加本站链接 → 准备信息 → 发送邮件）
- **管理：** 管理员可在 AdminPanel > 友链管理 CRUD

### 7.5 🎨 主题系统 (SiteThemeContext)

- **单 Context 双维度控制：**
  - **主题色（Accent）：** 6 种预设，控制全局强调色（按钮、链接、图标）
  - **底色（BgHue）：** 8 种预设，控制暗色背景的色相偏移。默认 `void`（纯黑，色相 0° + 饱和度 0%）
- **持久化：** localStorage (`theme-preset`, `bg-preset`)
- **动态注入：** 通过 `<style>` 标签动态注入全局背景 CSS 规则
- **UI 位置：** 侧边栏底部 — 主题色配置（彩色圆点）+ 底色配置（名称列表）

### 7.6 👤 头像系统

- **命名规则：** 按用户名命名 — `{username}.{ext}`（如 `TUREKIN.jpg`, `admin.png`）
- **存储路径：** `backend/uploads/avatars/{username}.{ext}`
- **访问 URL：** `/uploads/avatars/{username}.{ext}`
- **旧头像自动删除：** 上传新头像时，若旧头像路径以 `/uploads/avatars/` 开头且文件名与新文件名不同，则自动删除旧文件
- **Guest 限制：** 游客账户不能修改头像
- **前端缓存破坏：** AuthContext 中头像 URL 自动附加 `_cb` 参数防止浏览器缓存

### 7.7 📊 浏览追踪 (BrowseTracker)

- **存储：** 不经过数据库，直接写入 JSON 文件 `data/browse_sessions.json`
- **前端触发：** `useBrowseTracker` hook 在文章页挂载时开始计时，卸载时上报
- **API：** `POST /api/browse` 记录会话，`GET /api/browse/article/:id` 获取统计
- **容量控制：** 最多保留 10000 条记录

### 7.8 文章三视图

| 视图 | 组件 | 特点 |
|------|------|------|
| **经典** | HomePage 内联 | 置顶文章大幅展示（featured） + 其余网格排列 |
| **影院** | CinemaView | 精选文章全幅封面 + 横向滚动列表 |
| **唱片** | AlbumView | 正方封面网格（3列），hover 旋转放大 |

视图选择持久化在 `localStorage`（键：`viewMode`），默认 `classic`。

---

## 🚀 八、部署流程

### 8.1 部署架构

```
用户请求
    │
    ▼
Nginx (port 80)
    │
    ├── /          → 静态文件 (/www/wwwroot/www.turekin.me/index.html)
    ├── /assets/   → 静态资源 (1年缓存, immutable)
    ├── /uploads/  → alias 直接读取磁盘 backend/uploads/（7天缓存）
    └── /api/      → proxy_pass → Express (port 3000)
                           │
                           ▼
                    PM2 (turekin-blog)
                           │
                           ▼
                    MySQL (port 3306)
```

> **上传文件流：** Express 接收上传 → 存储到 `backend/uploads/` → 该目录通过符号链接映射到 web root → Nginx 通过 `alias` 直接从磁盘提供静态文件，不经过 Express 代理。

### 8.2 构建命令

```bash
# 前端构建
cd frontend
npm install
npm run build          # tsc -b && vite build
# 产物: frontend/dist/

# 后端构建
cd backend
npm install
npx prisma generate   # 生成 Prisma Client
npx prisma db push     # 同步数据库 Schema
npx tsx prisma/seed.ts # 导入种子数据（可选）
npm run build          # tsc → backend/dist/
```

### 8.3 部署脚本（deploy.sh）

一键部署脚本执行步骤：

| 步骤 | 操作 |
|------|------|
| 1/5 | 构建前端 → `cd frontend && npm install && npm run build` |
| 2/5 | 部署前端静态文件 → 复制 `dist/*` 到 `/www/wwwroot/www.turekin.me/` |
| 3/5 | 构建后端 → `cd backend && npm install && npx tsc` |
| 4/5 | 部署后端 → 复制 `dist/` + `package.json` + `ecosystem.config.js` + uploads |
| 5/5 | 重启服务 → `pm2 restart ecosystem.config.js` + `nginx -s reload` |

**执行方式：**
```bash
# 在本地或服务器上
bash deploy.sh
```

### 8.4 PM2 配置

PM2 使用 `ecosystem.config.js` 管理 Express 进程：
- **进程名：** `turekin-blog`
- **入口：** `dist/index.js`
- **工作目录：** `/www/wwwroot/www.turekin.me/backend/`
- **内存限制：** `max_memory_restart: 300M`
- **V8 堆限制：** `--max-old-space-size=256`

**常用 PM2 命令：**
```bash
pm2 status                  # 查看状态
pm2 logs turekin-blog       # 查看日志
pm2 restart turekin-blog    # 重启
pm2 stop turekin-blog       # 停止
pm2 start ecosystem.config.js  # 启动
pm2 save                    # 保存进程列表（开机自启）
```

### 8.5 Nginx 配置要点

```nginx
server {
    listen 80;
    server_name www.turekin.me turekin.me;
    root /www/wwwroot/www.turekin.me;

    # 静态资源强缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 上传文件直接读磁盘（alias 模式）
    location ^~ /uploads/ {
        alias /www/wwwroot/www.turekin.me/backend/uploads/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # API 反向代理到 Express
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 10M;
    }

    # SPA 回退
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ⚙️ 九、配置说明

### 9.1 环境变量 (.env)

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `DATABASE_URL` | MySQL 连接字符串 | `mysql://user:***@localhost:3306/www_turekin_me` |
| `SESSION_SECRET` | 会话加密密钥（至少32字符） | `openssl rand -hex 32` |
| `PORT` | Express 监听端口 | `3000` |
| `NODE_ENV` | 运行环境 | `production` / `development` |
| `UPLOAD_DIR` | 文件上传目录 | `./uploads` |
| `ALLOWED_ORIGINS` | CORS 允许的源（逗号分隔） | `https://www.turekin.me,https://www.turekin.me` |
| `SESSION_SECURE` | 是否仅 HTTPS 传输 Cookie | `true`（生产）/ `false`（开发） |
| `TRUST_PROXY` | 是否信任反向代理（Nginx） | `true`（生产） |
| `SESSION_COOKIE_DOMAIN` | Session Cookie 域名（可选） | `.turekin.me` |

### 9.2 Nginx 配置关键项

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `gzip` | on (level 5) | 启用 gzip 压缩 |
| `/assets/` 缓存 | 1 年 (immutable) | 静态资源强缓存 |
| `/uploads/` | alias 直接读磁盘 | 不经过 Express，7 天缓存 |
| `client_max_body_size` | 10M | API 请求体限制 |
| `index.html` | no-cache | 入口文件禁止缓存 |

---

## ⚠️ 十、常见陷阱与注意事项

### 10.1 Session 问题

- **Session 存储在 MySQL**（通过 `connect-mysql2`）
- 如果 `sessions` 表不存在，服务启动时会自动创建（`createDatabaseTable: true`）
- 生产环境必须设置 `SESSION_SECURE=true` 和 `TRUST_PROXY=true`
- Session 有效期：7 天（`maxAge: 7 * 24 * 60 * 60 * 1000`）

### 10.2 游客账户限制

- Guest 用户**不能修改头像、不能修改个人信息**
- Guest 可以发表评论、点赞文章和评论
- Visitor 注册用户拥有更多权限（修改资料、上传头像）
- Guest 账号密码哈希为空字符串（无法通过密码登录）

### 10.3 分类管理

- 默认 5 个分类存储在 `site_config` 的 `about` 配置中（JSON: `categories`）
- 管理员在 AdminPanel > 📂 分类 中增删，通过 `PUT /api/config/about` 写入
- 归档页和文章编辑器均从 `/api/config/about` 动态读取
- 修改分类不会影响已有文章的分类字段

### 10.4 头像系统

- 头像命名规则：`{username}.{ext}`（如 `TUREKIN.jpg`）
- 上传新头像时自动删除旧文件（同扩展名覆盖，不同扩展名删除旧文件）
- 头像通过 `/uploads/avatars/` 路径访问
- 前端自动附加 `_cb` 缓存破坏参数

### 10.5 浏览追踪存储

- 浏览数据存储在 **JSON 文件**而非数据库中：`data/browse_sessions.json`
- 在 Docker 部署或服务器迁移时**不要忘记备份此文件**
- 最多保留 10000 条记录，超出时自动裁剪旧记录

### 10.6 数据库初始化

- 使用 `prisma db push` 而非 `prisma migrate dev`（无需迁移历史）
- 种子数据脚本：`npx tsx prisma/seed.ts`
- MySQL 用户需有 CREATE TABLE 权限（session 表自动创建）

### 10.7 文件上传路径

- 上传目录结构：`uploads/avatars/`、`uploads/articles/`、`uploads/backgrounds/`
- Express 接收上传存储到 `backend/uploads/`
- Nginx 通过 `alias` 直接从磁盘读取，不经过 Express 代理
- 部署时需确保 `backend/uploads/` 正确符号链接到 web root 可访问路径

### 10.8 前端构建注意

- Vite 构建产物：`frontend/dist/`
- 部署时需手动复制 `public/` 中的静态资源（`avatar/`）
- `index.html` 不要被浏览器缓存（Nginx 已配置 no-cache）

### 10.9 安全相关

- Helmet 中间件配置了严格的 CSP（Content Security Policy）
- 生产环境 CORS 仅允许 `ALLOWED_ORIGINS` 列表中的源
- 密码使用 bcrypt (12 rounds) 加密
- API 全局速率限制：15 分钟 1000 次
- 登录接口额外限制：15 分钟 20 次

### 10.10 PM2 内存管理

- 服务器配置 2核2GB，建议监控 PM2 内存使用
- PM2 配置 `max_memory_restart: 300M`，超限自动重启
- V8 堆限制 `--max-old-space-size=256`

---

## 🤖 十一、QQBot & Hermes 发布规范 (QQBot & Hermes Publishing Conventions)

> Hermes Agent 可通过 QQBot 或管理面板自动发布文章到博客。以下规范确保发布内容一致、可检索。

### 11.1 标题格式 (Title Formats)

文章标题遵循以下格式规则：

| 类型 | 格式 | 示例 |
|------|------|------|
| **技术文章** | `[标签] 标题 — 子标题` | `[Hermes] Agent 架构深度解析 — 从 Prompt 到 Tool Calling` |
| **周热点** | `🔥 周热点 | YYYY-MM-DD ~ YYYY-MM-DD` | `🔥 周热点 | 2026-06-08 ~ 2026-06-14` |
| **Essay** | `zureeallv: 标题` | `zureeallv: 论技术写作的本质` |
| **杂谈** | `杂谈 | 标题` | `杂谈 | 关于 AI 与人类协作的思考` |
| **开发者说** | `开发者说 | 标题` | `开发者说 | 我的 Vim 配置之旅` |

> **规则：** 标题中禁止使用全角符号（中文标点除外）。技术文章标题建议不超过 40 个汉字。

### 11.2 标签规则 (Tag Rules)

所有文章必须携带标签，标签从以下**固定标签池**中选择：

| 标签 | 适用范围 | 说明 |
|------|---------|------|
| `Hermes` | Hermes Agent 相关 | AI 架构、Tool Calling、Skill 开发 |
| `AI` | 通用 AI 话题 | LLM、Prompt Engineering、AI 应用 |
| `React` | 前端开发 | React 组件、Hooks、状态管理 |
| `TypeScript` | 类型系统 | TS 类型体操、配置、最佳实践 |
| `CSS` | 样式/设计 | Tailwind、动画、响应式 |
| `Node.js` | 后端开发 | Express、数据库、API 设计 |
| `DevOps` | 运维部署 | Nginx、PM2、Docker、CI/CD |
| `思考` | 随笔/杂谈 | 非技术类思考文章 |
| `周热点` | 周热点汇总 | 本周 AI/技术领域热点 |

**标签数量：** 每篇文章 2-5 个标签。至少包含一个技术标签。标签在 `article.tags` JSON 数组字段中存储。

### 11.3 分类规则 (Category Rules)

文章分类对应 `article.category` 字段，可选值：

| 分类 | 用途 | 默认标签建议 |
|------|------|-------------|
| `Project` | 个人项目介绍/复盘 | `React`, `TypeScript`, `Node.js` |
| `Hermes` | Hermes Agent 相关 | `Hermes`, `AI` |
| `周热点` | 每周技术热点汇总 | `周热点`, `AI` |
| `杂谈` | 随笔/非技术文章 | `思考` |
| `开发者说` | 开发经验分享 | 按内容自定 |

> **规则：** 管理员发布文章时可选择分类或留空（"未分类"）。分类存储在 `site_config` 的 `about.categories` 中，管理员可在 AdminPanel 动态增删。

### 11.4 每日发布限制 (Daily Limits)

为控制内容质量和服务器资源，Hermes 通过 QQBot 发布有以下限制：

| 限制项 | 值 | 说明 |
|--------|-----|------|
| 每日最大发布数 | 5 篇 | 超出后 QQBot 拒绝并提示"今日已达上限" |
| 单篇最小间隔 | 3 分钟 | 防止刷屏式发布 |
| 单篇内容最小长度 | 200 字符 | 防止空/极短文章 |
| 每日 Essay 上限 | 2 篇 | zureeallv 风格文章单独计数 |

> 计数按 UTC+8 (北京时间) 自然日重置。管理面板发布不在此限制之内。

### 11.5 封面规则 (Cover Rules)

文章封面（`article.cover_image`）遵循以下规则：

| 规则 | 说明 |
|------|------|
| **自动分配** | QQBot 发布时自动从 `/covers/` 池中轮询选择封面（Herme1-14.png） |
| **手动指定** | 管理面板发布时可手动上传或选择封面 |
| **默认封面** | 无封面时使用 Hermes1.png 作为默认 |
| **访问路径** | 通过 `/uploads/covers/` → 符号链接 → `/covers/` Nginx alias 提供服务 |
| **缓存策略** | 封面图 7 天缓存（Nginx 配置） |

> QQBot 发布的文章，封面自动写入 `cover_image` 字段，格式为 `/uploads/covers/HermesN.png`。

---

## 💓 十二、心跳监测与故障转移系统 (Heartbeat & Failover System)

> 确保 www.turekin.me 高可用：本地 Windows 主机与阿里云服务器双向监测。

### 12.1 系统架构

```
┌─────────────────────────┐      每 60s 心跳      ┌─────────────────────────┐
│  本地 Windows 主机        │ ──────────────────▶ │  阿里云 Ubuntu 服务器      │
│  (开发/监控节点)           │ ◀────────────────── │  (www.turekin.me)         │
│                          │     健康检查响应       │                          │
│  PowerShell 心跳脚本      │                      │  Bash 云端监测脚本        │
│  heartbeat.ps1           │                      │  /root/hermes_heartbeat.sh│
│                          │                      │                          │
│  Windows 计划任务          │                      │  Crontab 定时任务         │
│  每 5 分钟触发             │                      │  */1 * * * *              │
└─────────────────────────┘                      └─────────────────────────┘
```

### 12.2 本地 PowerShell 心跳脚本 (heartbeat.ps1)

**路径：** 本地 Windows 开发机上的 `heartbeat.ps1`

**核心逻辑：**
1. 向 `https://www.turekin.me/api/health` 发送 HTTP GET 请求
2. 等待响应，设置 240 秒 (4 分钟) 超时
3. 收到 200 OK → 记录成功日志，退出码 0
4. 超时/非 200/连接失败 → 记录失败日志，触发告警

**关键参数：**
| 参数 | 值 | 说明 |
|------|-----|------|
| 超时时间 | 240 秒 | `TimeoutSec = 240`，覆盖慢响应/网络波动 |
| 请求方法 | `Invoke-WebRequest -Uri $url -TimeoutSec 240 -UseBasicParsing` |
| 日志路径 | `.\heartbeat.log` | 追加式日志，含时间戳 + 状态码 |
| 失败告警 | 写入 `.\heartbeat_failures.log` | 持续失败超过 3 次触发桌面通知 |

### 12.3 云端 Bash 监测脚本 (hermes_heartbeat.sh)

**路径：** `/root/hermes_heartbeat.sh`（阿里云服务器）

**核心逻辑：**
1. 检查 `systemctl is-active mysql` — MySQL 运行状态
2. 检查 `pm2 jlist` 中 `turekin-blog` 进程状态（必须为 `online`）
3. 检查 `nginx -t` 配置有效性 + Nginx 进程存活
4. 任意检查失败 → 记录日志 + 尝试自动恢复（restart 对应服务）
5. 连续 3 次失败 → 发送告警通知（钉钉/邮件 Webhook）

**Crontab 配置：**
```bash
# 每分钟执行一次云端心跳检查
*/1 * * * * /bin/bash /root/hermes_heartbeat.sh >> /var/log/hermes_heartbeat.log 2>&1
```

### 12.4 240 秒超时策略

| 层级 | 超时值 | 说明 |
|------|--------|------|
| PowerShell 脚本 | 240s | 覆盖最坏情况（PM2 重启约 60s + 冷启动约 30s + 缓冲） |
| Nginx proxy_read_timeout | 60s | 上游 API 响应超时 |
| Express 请求超时 | 30s | 应用层超时（connect-timeout 中间件） |
| MySQL 连接超时 | 10s | Prisma pool_timeout |

> **设计理念：** PowerShell 240s 超时远大于各层超时之和，确保只在服务真正不可用时才触发告警，避免网络抖动造成的误报。

### 12.5 Windows 计划任务配置 (Scheduled Task Setup)

创建 Windows 计划任务运行 `heartbeat.ps1`：

```powershell
# 创建计划任务（以管理员身份运行 PowerShell）
$Action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"C:\path\to\heartbeat.ps1`""
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration ([TimeSpan]::MaxValue)
$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "TurekinBlog_Heartbeat" -Action $Action -Trigger $Trigger -Principal $Principal -Description "监测 www.turekin.me 健康状态"
```

| 配置项 | 值 |
|--------|-----|
| 任务名称 | `TurekinBlog_Heartbeat` |
| 触发频率 | 每 5 分钟 |
| 执行账户 | SYSTEM |
| 执行策略 | Bypass（允许未签名脚本） |
| 重复持续时间 | 无限期 |

---

## 🩺 十三、服务器健康监控 (Server Health Monitor)

> 部署在阿里云服务器上的轻量级健康监控，实时追踪 CPU / MEM / Disk / 进程。

### 13.1 监控脚本 (server_health.sh)

**路径：** `/root/.hermes/scripts/server_health.sh`

**技术栈：** Bash 外壳 + **Python 3** 数据采集

**执行流程：**
1. Python 脚本采集系统指标（CPU、MEM、Disk、进程列表）
2. 与预设阈值对比，标记异常指标
3. 输出 JSON 格式健康报告到 `/var/log/hermes_health.json`
4. 异常时推送告警（钉钉 Webhook）

**Crontab 配置：**
```bash
# 每 2 分钟运行一次
*/2 * * * * /bin/bash /root/.hermes/scripts/server_health.sh
```

### 13.2 监控指标

| 指标 | 采集方式 | 告警阈值 | 说明 |
|------|---------|---------|------|
| **CPU 使用率** | `psutil.cpu_percent(interval=1)` | > 90% 持续 3 次 | 可能导致服务响应变慢 |
| **内存使用率** | `psutil.virtual_memory().percent` (MEM check) | > 85% | 触发 PM2 自动重启前预警 |
| **磁盘使用率** | `psutil.disk_usage('/').percent` | > 90% | Uploads 目录可能占满 |
| **PM2 进程** | `pm2 jlist` JSON 输出 | 任何进程非 `online` | 服务已宕 |
| **MySQL 存活** | TCP 端口 3306 探测 | 连接被拒 | 数据库不可用 |
| **Nginx 存活** | `systemctl is-active nginx` | 非 `active` | 反向代理已断 |

### 13.3 MEM 检查详解 (MEM Check)

```python
import psutil

mem = psutil.virtual_memory()
total_mb = mem.total / (1024 * 1024)    # 总内存 (MB)
used_mb = mem.used / (1024 * 1024)      # 已用内存 (MB)
percent = mem.percent                    # 使用率 (%)

# 告警判定
if percent > 85:
    alert(f"⚠️ 内存告警: {percent:.1f}% ({used_mb:.0f}MB / {total_mb:.0f}MB)")

# PM2 进程 MEM 排名 (top 3)
import subprocess, json
pm2_list = json.loads(subprocess.check_output(['pm2', 'jlist']))
top_mem = sorted(pm2_list, key=lambda p: p.get('monit', {}).get('memory', 0), reverse=True)[:3]
```

> **2核2GB 特殊关注：** 服务器仅 2GB RAM，PM2 配置 `max_memory_restart: 300M`。当系统级 MEM > 85% 时，需要排查是否有内存泄漏或非 PM2 进程占用。

### 13.4 健康报告格式 (JSON)

```json
{
  "timestamp": "2026-06-14T12:00:00+08:00",
  "cpu_percent": 23.5,
  "mem_percent": 67.2,
  "mem_used_mb": 1376,
  "mem_total_mb": 2048,
  "disk_percent": 34.1,
  "pm2_status": {"turekin-blog": "online"},
  "mysql_alive": true,
  "nginx_alive": true,
  "alerts": []
}
```

---

## 📱 十四、移动端侧边栏 (Mobile Sidebar)

> 移动端布局中侧边栏默认收起，通过 `isMobileOpen` 状态控制展开/折叠。

### 14.1 问题描述

移动端 Sidebar 在特定场景下出现 **展开后无法折叠 (collapsed state broken)** 的 bug：
- 点击 hamburger 按钮展开 sidebar 后，再次点击无法收起
- 点击遮罩层 (overlay) 也无法关闭
- 根因：`isMobileOpen` 状态更新的闭包捕获了过期值

### 14.2 修复方案

**文件位置：** `frontend/src/components/Layout.tsx`

**修复前（bug 版本）：**
```typescript
const toggleSidebar = () => {
  setIsMobileOpen(!isMobileOpen); // ❌ 闭包可能捕获旧值
};
```

**修复后（函数式 setState）：**
```typescript
const toggleSidebar = () => {
  setIsMobileOpen(prev => !prev); // ✅ 函数式更新，永远基于最新 state
};

// 遮罩层点击关闭
const handleOverlayClick = () => {
  setIsMobileOpen(false); // 直接设置为 false 是安全的
};
```

### 14.3 关键实现细节

| 组件 | 文件 | 说明 |
|------|------|------|
| `Layout.tsx` | `isMobileOpen` state + `toggleSidebar` | 控制 Sidebar 显示/隐藏 |
| `Navbar.tsx` | hamburger 按钮 `onClick` | 调用 `toggleSidebar` |
| `Sidebar.tsx` | 接收 `isMobileOpen` prop | 添加 CSS transition 类 |
| overlay 遮罩 | `Layout.tsx` 内 `<div>` | `onClick={handleOverlayClick}` |

**CSS 过渡：**
```css
.sidebar-mobile {
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}
.sidebar-mobile.open {
  transform: translateX(0);
}
```

> **教训：** React 中凡是依赖前一个 state 值的更新操作，必须使用函数式 setState (`prev => ...`)，尤其是在事件回调中。

---

## ✍️ 十五、Essay 写作规范 (Essay Writing Conventions)

> Hermes Agent 具备撰写 Essay（随笔/杂文）的能力，遵循特定的 `zureeallv` 写作风格。

### 15.1 zureeallv 风格定义

`zureeallv` 是一种 AI 辅助的思辨性写作风格，特点如下：

| 特征 | 说明 |
|------|------|
| **命题驱动** | 每篇 Essay 围绕一个核心命题展开，开篇即陈述命题 |
| **辩证结构** | 正反论证 → 条件分析 → 综合结论，非线性的"观点 → 证据"堆砌 |
| **Thinker 引用** | 引用历史上的思想家/哲学家作为论据支撑（见 15.2） |
| **克制语气** | 避免煽情/口号式表述，保持冷静、分析性语气 |
| **中文为主** | 正文使用中文，关键术语保留英文原文（如 "emergence", "alignment"） |
| **篇幅** | 1500-4000 字，适合深度阅读 |

### 15.2 Thinker 引用体系 (Thinker References)

Essay 中引用思想家时遵循以下体系：

| 思想领域 | 常引 Thinker | 引用格式 |
|---------|-------------|---------|
| 科技哲学 | Kevin Kelly, Norbert Wiener, Marshall McLuhan | "如 McLuhan 所言，'The medium is the message'——……" |
| 认知科学 | Daniel Kahneman, Douglas Hofstadter, Marvin Minsky | 引用其核心概念（如 System 1/2, strange loop） |
| 东方哲学 | 庄子、王阳明、铃木大拙 | 以现代语境重新诠释古典思想 |
| 系统论 | Donella Meadows, Gregory Bateson | 引用杠杆点、元沟通等概念 |
| AI 伦理 | Nick Bostrom, Stuart Russell, Eliezer Yudkowsky | 引用 AI alignment, superintelligence 等框架 |

> **引用规则：** 每个 Essay 至少引用 2 位不同领域的 Thinker。引用应服务于论证，而非简单"掉书袋"。

### 15.3 规范文件 (essay-convention.md)

**路径：** `/root/.hermes/essay-convention.md`

该文件包含完整的 Essay 写作规范，供 Hermes Agent 在撰写时参考。主要内容：

```
# Hermes Essay Writing Convention
## 1. 命题先行原则
## 2. zureeallv 风格要素
## 3. Thinker 引用库（含常用引用句与原文）
## 4. 结构模板（开篇/论证/转折/结语）
## 5. 禁忌事项（禁止空洞抒情/禁止无引用断言/禁止AI腔）
## 6. 审校 Checklist
```

> Hermes Agent 在通过 QQBot 或管理面板发布 Essay 时，会自动加载该规范文件并应用于写作 pipeline。

### 15.4 Essay 发布流程

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│ 用户请求      │ → │ Hermes 加载   │ → │ 生成 Essay    │ → │ 发布到    │
│ "写一篇Essay" │    │ convention   │    │ (迭代3轮)     │    │ www.ture  │
└─────────────┘    └──────────────┘    └──────────────┘    │ kin.me    │
                                                           └──────────┘
```

> Essay 文章自动归入「杂谈」分类，标签包含「思考」。

---

## 🖼️ 十六、封面系统 (Cover System)

> 文章封面图集中管理，通过符号链接统一访问路径。

### 16.1 封面图片池

所有文章封面图集中存储在 `/covers/` 目录：

| 文件名 | 用途 | 说明 |
|--------|------|------|
| `Hermes1.png` | **默认封面** | 无封面文章使用此图 |
| `Hermes2.png` | 技术文章 | 代码/终端主题 |
| `Hermes3.png` | AI 文章 | 神经网络可视化主题 |
| `Hermes4.png` | 周热点 | 火焰/热点主题 |
| `Hermes5.png` | 杂谈 | 星空/思考主题 |
| `Hermes6.png` | 开发者说 | 键盘/工具主题 |
| `Hermes7.png` | 项目 | 架构图主题 |
| `Hermes8.png` | 通用1 | 几何图案主题 |
| `Hermes9.png` | 通用2 | 渐变色彩主题 |
| `Hermes10.png` | 备用1 | 暗色调主题 |
| `Hermes11.png` | 备用2 | 亮色调主题 |
| `Hermes12.png` | 备用3 | 抽象主题 |
| `Hermes13.png` | 备用4 | 粒子主题 |
| `Hermes14.png` | 备用5 | 光晕主题 |

> **总计 14 张封面图**，覆盖所有内容类型。QQBot 发布时根据文章分类自动轮询选择对应主题的封面。

### 16.2 符号链接架构 (Symlink Architecture)

封面图的物理存储与 Web 访问路径通过符号链接解耦：

```
物理路径:                              Web 访问路径:
/covers/                               (不直接暴露)
  ├── Hermes1.png
  ├── Hermes2.png
  └── ...Hermes14.png
         │
         │ symlink (ln -s)
         ▼
/www/wwwroot/www.turekin.me/
  └── backend/uploads/covers/  ←──────  /uploads/covers/Hermes1.png
         (符号链接 → /covers/)          (Nginx alias 直接读磁盘)
```

**创建命令：**
```bash
# 在服务器上执行
mkdir -p /www/wwwroot/www.turekin.me/backend/uploads
ln -s /covers /www/wwwroot/www.turekin.me/backend/uploads/covers

# 验证
ls -la /www/wwwroot/www.turekin.me/backend/uploads/covers
# 输出: lrwxrwxrwx ... covers -> /covers
```

### 16.3 Nginx 配置

封面图通过 `uploads` location 块提供：

```nginx
location ^~ /uploads/ {
    alias /www/wwwroot/www.turekin.me/backend/uploads/;
    expires 7d;
    add_header Cache-Control "public";
}
```

因为 `uploads/covers` → `/covers` 的符号链接，Nginx 的 `alias` 会跟随符号链接直接读取 `/covers/Hermes1.png` 等文件。

### 16.4 封面分配逻辑

**QQBot 自动发布时的封面选择：**
```python
# 伪代码
COVER_MAP = {
    "Hermes":    ["Hermes1.png", "Hermes2.png", "Hermes3.png"],
    "Project":   ["Hermes7.png", "Hermes8.png"],
    "周热点":     ["Hermes4.png"],
    "杂谈":       ["Hermes5.png"],
    "开发者说":   ["Hermes6.png"],
    "default":   ["Hermes1.png", "Hermes9.png", "Hermes10.png"]
}

def pick_cover(category):
    pool = COVER_MAP.get(category, COVER_MAP["default"])
    # 轮询 (round-robin) 选择，避免连续文章使用同一封面
    return round_robin(pool)
```

> **数据库写入：** `article.cover_image = '/uploads/covers/HermesN.png'`

---

## 📚 附录：技术栈速查

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 18.3 |
| 构建工具 | Vite | 5.3 |
| CSS 框架 | Tailwind CSS | 3.4 |
| 路由 | react-router-dom | 6.23 |
| Markdown | react-markdown + remark-gfm | 9.0 + 4.0 |
| 代码高亮 | react-syntax-highlighter (Prism) | 15.5 |
| SEO | react-helmet-async | 2.0 |
| 图标 | lucide-react | 0.400 |
| 后端框架 | Express | 4.19 |
| ORM | Prisma | 5.15 |
| 校验 | Zod | 3.23 |
| 认证 | express-session + connect-mysql2 | - |
| 密码 | bcryptjs | 2.4 |
| 安全 | helmet + cors + express-rate-limit | - |
| 文件上传 | multer | 1.4 |
| 数据库 | MySQL | 8.0 |
| 进程管理 | PM2 | - |
| 反向代理 | Nginx | - |

---

> **文档版本：** v3.0  
> **生成日期：** 2026-06-14  
> **适用项目：** www.turekin.me  
> **变更摘要：** 新增 QQBot 发布规范、心跳监测与故障转移系统、服务器健康监控、移动端侧边栏修复、Essay 写作规范 (zureeallv)、封面系统 (symlink 架构) 共 6 个新章节；移除亮色模式/背景系统；更新 Context 嵌套为实际结构；新增分类管理/头像系统/归档页/友链页/日历交互/Nginx alias 架构等详细说明
