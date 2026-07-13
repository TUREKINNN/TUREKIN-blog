# TUREKIN Blog — 全面技术文档

> 本文档为 `www.turekin.me` 个人博客网站的全栈技术描述，供其他 AI 理解系统架构并在此基础上提出改进建议。

---

## 一、概览

| 项目 | 值 |
|------|-----|
| 名称 | TUREKIN Blog |
| 域名 | https://www.turekin.me |
| GitHub | https://github.com/TUREKINNN/TUREKIN-blog |
| 定位 | 个人技术博客 + AI 日记 + 作品集 |
| 作者 | TUREKIN（学生，2026 考研党） |

---

## 二、技术栈

### 前端 (Frontend)

| 层 | 技术 | 说明 |
|----|------|------|
| 框架 | React 18 + TypeScript | SPA 单页应用 |
| 构建 | Vite 5 | 快速 HMR，ESBuild 压缩 |
| 路由 | react-router-dom v6 | 客户端路由 |
| 样式 | Tailwind CSS 3 + 自定义 CSS | 原子化 + 液态玻璃视觉系统 |
| 状态管理 | React Context (6 个) | 无 Redux，纯 Context |
| HTTP | fetch API | 未使用 axios/React Query |
| 图标 | Lucide React | SVG 图标库 |
| 代码高亮 | react-syntax-highlighter | 文章内代码渲染 |
| 动态导入 | React.lazy + Suspense | 页面级代码分割 |

### 后端 (Backend)

| 层 | 技术 | 说明 |
|----|------|------|
| 运行时 | Node.js 20 + TypeScript | 编译为 JS 运行 |
| 框架 | Express 4 | RESTful API |
| ORM | Prisma 5 | 类型安全的数据库操作 |
| 数据库 | MySQL 8 | 关系型存储 |
| 文件上传 | Multer | 头像/封面/背景上传 |
| 认证 | express-session + connect-mysql2 | Session 存储于 MySQL |
| 校验 | Zod | 请求参数校验 |

### 部署 (DevOps)

| 层 | 技术 | 说明 |
|----|------|------|
| 服务器 | Alibaba Cloud ECS (2C2G) | Ubuntu 24.04 |
| Web 服务器 | Nginx 1.24 | 反向代理 + SSL 终结 |
| 进程管理 | PM2 | Node 进程守护 |
| SSL | Let's Encrypt + Certbot | 自动续期 |
| 管理面板 | 宝塔 (Baota) | Nginx 配置管理 |
| 本地路径 | `D:\TUREKIN_CODE\MYWEBSITE\` | Windows 开发机 |

---

## 三、目录结构

```
www.turekin.me/
├── frontend/                    # React 前端
│   ├── src/
│   │   ├── main.tsx             # 入口
│   │   ├── App.tsx              # 路由定义 + Context 嵌套
│   │   ├── index.css            # 全局样式 (2600+ 行)
│   │   ├── liquid-glass.ts      # 液态玻璃 JS (43 行)
│   │   ├── liquid-glass-changelog.md  # 液态玻璃改造记录
│   │   ├── components/
│   │   │   ├── Layout.tsx       # 全局布局 (侧边栏+主内容)
│   │   │   ├── Navbar.tsx       # 顶部导航
│   │   │   ├── Sidebar.tsx      # 侧边栏 (管理员信息/导航/搜索)
│   │   │   ├── ArticleCard.tsx  # 文章卡片 (经典视图)
│   │   │   ├── CinemaView.tsx   # 影院视图 (大幅海报)
│   │   │   ├── AlbumView.tsx    # 唱片视图 (正方形卡片)
│   │   │   ├── HoverPreview.tsx # 悬浮预览 (含下载按钮)
│   │   │   ├── LazyImage.tsx    # 懒加载图片 (IntersectionObserver)
│   │   │   ├── MusicPlayer.tsx  # 音乐播放器
│   │   │   ├── CommentSection.tsx # 评论区
│   │   │   ├── LikeButton.tsx   # 点赞按钮
│   │   │   ├── TagFilter.tsx    # 标签筛选
│   │   │   ├── MiniCalendar.tsx # 迷你日历
│   │   │   ├── Toast.tsx        # 通知组件
│   │   │   └── auth/
│   │   │       ├── AdminPanel.tsx     # 管理面板 (982 行, 最大组件)
│   │   │       ├── AdminLoginForm.tsx  # 管理员登录
│   │   │       ├── LoginPage.tsx      # 登录页
│   │   │       ├── ProtectedRoute.tsx  # 路由守卫
│   │   │       └── VisitorLoginForm.tsx # 游客登录
│   │   ├── context/
│   │   │   ├── AuthContext.tsx        # 认证状态
│   │   │   ├── ArticleContext.tsx     # 文章数据
│   │   │   ├── SearchFilterContext.tsx # 搜索筛选
│   │   │   ├── SiteThemeContext.tsx   # 主题 (预设/模式/背景图)
│   │   │   ├── ThemeContext.tsx       # 暗色模式 (简单版)
│   │   │   └── ToastContext.tsx       # 通知
│   │   ├── hooks/
│   │   │   ├── useApi.ts             # API 请求封装
│   │   │   └── useBrowseTracker.ts   # 浏览时长追踪
│   │   ├── pages/
│   │   │   ├── HomePage.tsx    # 首页 (文章列表)
│   │   │   └── ArticlePage.tsx # 文章详情页
│   │   └── constants/
│   │       └── api.ts           # API 基础 URL
│   ├── tailwind.config.ts       # Tailwind 配置
│   ├── vite.config.ts           # Vite 配置
│   └── package.json
│
├── backend/                     # Express 后端
│   ├── src/
│   │   ├── index.ts             # 服务入口
│   │   ├── app.ts               # Express app 配置
│   │   ├── routes/
│   │   │   ├── auth.ts          # 认证 (登录/注册/登出/头像)
│   │   │   ├── articles.ts      # 文章 CRUD + 列表/日期
│   │   │   ├── comments.ts      # 评论 CRUD + 点赞
│   │   │   ├── config.ts        # 站点配置 + 背景管理
│   │   │   ├── uploads.ts       # 文件上传
│   │   │   ├── tags.ts          # 标签列表
│   │   │   ├── browse.ts        # 浏览时长记录
│   │   │   ├── friendLinks.ts   # 友链管理
│   │   │   └── music.ts         # 音乐管理
│   │   ├── services/
│   │   │   ├── auth.service.ts      # 密码/头像/配置
│   │   │   ├── article.service.ts   # 文章查询/点赞/评论
│   │   │   ├── comment.service.ts   # 评论 CRUD
│   │   │   ├── upload.service.ts    # 上传/背景管理
│   │   │   └── browse.service.ts    # 浏览 JSON 存储
│   │   ├── middleware/
│   │   │   ├── auth.ts          # requireAuth
│   │   │   ├── adminOnly.ts     # adminOnly
│   │   │   ├── upload.ts        # Multer 配置
│   │   │   ├── validate.ts      # Zod 校验
│   │   │   └── errorHandler.ts  # 全局错误处理
│   │   ├── types/
│   │   │   └── index.ts         # 类型定义
│   │   ├── utils/
│   │   │   ├── errors.ts        # AppError 类
│   │   │   └── password.ts      # bcrypt 哈希
│   │   └── lib/
│   │       └── prisma.ts        # Prisma 客户端单例
│   ├── prisma/
│   │   └── schema.prisma        # 数据模型定义
│   ├── uploads/                  # 上传文件存储
│   │   ├── avatars/             # 头像
│   │   ├── articles/            # 文章封面
│   │   ├── backgrounds/         # 背景图
│   │   ├── music/               # 音乐文件
│   │   └── data/                # 浏览数据 JSON
│   └── package.json
│
└── CHANGELOG.md                 # 更新日志
```

---

## 四、数据库模型 (Prisma Schema)

### User (users)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增 |
| username | String (UNIQUE) | 用户名 |
| passwordHash | String | bcrypt 哈希 |
| role | String | `admin` / `guest` / `visitor` |
| displayName | String | 展示名称 |
| avatarUrl | String? | 头像 URL |

### Article (articles)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增 |
| title | String | 标题 |
| summary | Text | 摘要 |
| content | LongText | Markdown 内容 |
| coverImage | String? | 封面 URL |
| tags | JSON | 标签数组 |
| category | String? | 分类 |
| readTime | Int | 阅读分钟数 |
| likes | Int | 点赞数 |
| pinned | Boolean | 是否置顶 |
| authorId | Int (FK) | 作者 |
| publishDate | DateTime | 发布日期 |

### Comment (comments)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增 |
| content | Text | 评论内容 |
| articleId | Int (FK) | 所属文章 |
| authorId | Int (FK) | 评论作者 |
| parentId | Int? (FK) | 父评论 (嵌套回复) |
| pinned | Boolean | 是否置顶 |
| likesCount | Int | 点赞数 |

### BackgroundImage (background_images)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增 |
| filePath | String | 文件路径 |
| originalName | String | 原文件名 |
| sizeBytes | BigInt | 文件大小 |

### SiteConfig (site_config) — JSON 键值存储
| 键 | 说明 |
|-----|------|
| `carousel` | 轮播配置 (自动切换/间隔/图片) |
| `about` | "关于"页面配置 |

### FriendLink (friend_links)
| 字段 | 类型 | 说明 |
|------|------|------|
| name | String | 站点名 |
| url | String | 链接 |
| avatarUrl | String | 头像 |
| description | Text | 描述 |

### Music (music)
| 字段 | 类型 | 说明 |
|------|------|------|
| title | String | 歌曲名 |
| artist | String | 艺术家 |
| coverUrl | String? | 封面图 |
| audioUrl | String | 音频文件 URL |
| duration | Int? | 时长 (秒) |

---

## 五、API 路由表

### 认证 `/api/auth`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/login` | 公开 | 登录 |
| POST | `/register` | 公开 | 注册 |
| POST | `/guest` | 公开 | 游客登录 |
| POST | `/logout` | 已登录 | 登出 |
| GET | `/me` | 已登录 | 获取当前用户 |
| GET | `/admin-profile` | 公开 | 获取管理员信息 |
| POST | `/avatar` | 管理员 | 上传头像 |
| PATCH | `/profile` | 管理员 | 修改个人信息 |

### 文章 `/api/articles`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/` | 公开 | 列表 (支持 page/tag/search) |
| GET | `/dates` | 公开 | 按日期归档 |
| GET | `/:id` | 公开 | 文章详情 |
| POST | `/` | 管理员 | 创建文章 |
| PUT | `/:id` | 管理员 | 更新文章 |
| DELETE | `/:id` | 管理员 | 删除文章 |
| POST | `/:id/like` | 已登录 | 点赞/取消 |
| PATCH | `/:id/pin` | 管理员 | 置顶/取消 |

### 评论 `/api/comments`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/${articleId}` | 公开 | 文章评论列表 |
| POST | `/${articleId}` | 已登录 | 发表评论 |
| DELETE | `/:id` | 管理员 | 删除评论 |
| POST | `/:id/like` | 已登录 | 评论点赞 |
| PATCH | `/:id/pin` | 管理员 | 置顶评论 |

### 配置 `/api/config`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/about` | 公开 | 关于页配置 |
| PUT | `/about` | 管理员 | 更新关于页 |
| GET | `/backgrounds` | 已登录 | 背景图列表 |

### 上传 `/api/uploads`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/article-image` | 管理员 | 上传文章封面 |
| POST | `/background` | 管理员 | 上传背景图 |

### 友链 `/api/friendlinks`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/` | 公开 | 友链列表 |
| POST | `/` | 管理员 | 添加友链 |
| PUT | `/:id` | 管理员 | 更新友链 |
| DELETE | `/:id` | 管理员 | 删除友链 |

### 音乐 `/api/music`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/` | 公开 | 音乐列表 |
| POST | `/` | 管理员 | 添加歌曲 |
| PUT | `/:id` | 管理员 | 更新歌曲 |
| DELETE | `/:id` | 管理员 | 删除歌曲 |

### 浏览 `/api/browse`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/session` | 公开 | 记录浏览会话 |
| GET | `/:id/stats` | 公开 | 文章浏览统计 |

### 标签 `/api/tags`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/` | 公开 | 所有标签列表 |

---

## 六、前端组件架构

### 页面路由
```
/                    → HomePage （文章列表，支持三种视图切换）
/article/:id         → ArticlePage （文章详情 + 评论区）
/login               → LoginPage （登录/游客/注册）
```

### 状态管理 (Context 依赖关系)
```
main.tsx
  └─ ThemeContext (暗色/亮色模式)
     └─ ToastContext
        └─ AuthContext
           └─ SiteThemeContext (颜色预设 + 背景图)
              └─ ArticleContext (文章数据)
                 └─ SearchFilterContext (搜索/筛选)
```

### 关键组件交互
- **Layout**: 固定侧边栏 + 主内容区，侧边栏包含管理员头像、导航、搜索框
- **HomePage**: 根据视图模式渲染不同组件
  - "经典" → ArticleCard 列表 (使用 HoverPreview → LazyImage)
  - "影院" → CinemaView (大幅海报 + 网格)
  - "唱片" → AlbumView (正方形唱片封面)
- **AdminPanel** (982 行): 管理后台，包含文章 CRUD、背景管理、友链管理、音乐管理
- **MusicPlayer**: 底部固定播放器，播放/切换/音量控制

### 图片加载流程
```
ArticleCard
  └─ HoverPreview (悬浮放大预览 + 下载按钮)
       └─ LazyImage (IntersectionObserver 懒加载，200px rootMargin)
            └─ 500ms 超时兜底 → inView=true → 加载 <img>
```

---

## 七、设计系统

### 视觉风格：液态玻璃 (Liquid Glass)

受 iOS 26 设计语言启发，四大核心特征：

1. **通透磨砂基底** — `backdrop-filter: blur() saturate()` 叠加多层
2. **边缘色散虹彩** — `::before` RGB 三通道偏移产生棱镜分光
3. **流体动态高光** — 鼠标 hover 时径向柔光跟随流动
4. **环境自适应** — 深浅主题平滑过渡 (`transition`)

实现方式：单层 `::before` 伪元素承载全部光学效果，35 行 JS 被动监听鼠标位置。

### 色彩系统

| 预设 | 色相 | 说明 |
|------|------|------|
| 星云紫 | HSL(250,85%,65%) | 默认主题 |
| 深海蓝 | HSL(215,80%,60%) | 科技感 |
| 翡翠绿 | HSL(160,70%,50%) | 清新 |
| 日落橙 | HSL(15,85%,60%) | 温暖 |
| 玫瑰粉 | HSL(330,75%,60%) | 柔和 |
| 琥珀金 | HSL(40,90%,55%) | 华丽 |

每种预设自动生成 10 级渐变（100-900），应用于按钮、卡片、标签等。

### 主题模式

- **深色** (默认): `background-color: hsl(250,30%,7%)`，卡片半透明毛玻璃
- **浅色**: `background-color: #f8fafc`，降低模糊强度

### 背景系统

- 管理员可上传背景图到 `/uploads/backgrounds/`
- 通过 `SiteThemeContext` 以 `!important` 内联样式应用到 `body`
- 支持多背景轮播（`carousel` 配置）

---

## 八、已知问题与待改进项

### 代码质量
- [ ] `index.css` 2600+ 行，含 288 处 `!important`，需要拆分和移除
- [ ] `AdminPanel.tsx` 982 行，需拆分为多个子组件
- [ ] `ThemeContext` 与 `SiteThemeContext` 功能重叠
- [ ] 后端多处 `any` 类型滥用（Prisma JSON 字段、Multer 类型等）
- [ ] `getArticleComments` 存在 N+1 查询问题
- [ ] 前后端都存在未使用的导入和死代码
- [ ] Prisma 类型声明不完整（express-session、connect-mysql2）

### 性能
- [ ] 首页首屏加载 JS 包较大（Vite 默认不拆分 vendor）
- [ ] 文章列表无分页缓存，每次切换页面重新请求
- [ ] 评论点赞存在乐观更新竞态条件
- [ ] 图片使用全尺寸原图，无 CDN/缩略图

### 安全
- [ ] IP 级访问频率限制仅基于 express-rate-limit 内存存储
- [ ] 头像/背景上传无病毒扫描
- [ ] 无 CSP (Content Security Policy) 头部

### 体验
- [ ] 搜索无防抖，每次按键触发请求
- [ ] 音乐播放器不支持播放列表/循环模式
- [ ] 无离线支持 (PWA/Service Worker)
- [ ] 无 RSS 订阅

---

## 九、开发工作流

```bash
# 前端开发
cd frontend
npm run dev        # Vite HMR

# 后端开发  
cd backend
npm run dev        # tsx watch src/index.ts

# 构建部署
cd frontend && npm run build    # → dist/
cd backend && npm run build     # → dist/
scp -r dist/* root@121.40.68.130:/www/wwwroot/www.turekin.me/
ssh root@121.40.68.130 "pm2 restart turekin-blog && nginx -s reload"
```

---

## 十、Nginx 配置要点

```nginx
# turekin.me → HTTPS only
server {
    listen 443 ssl http2;
    root /www/wwwroot/www.turekin.me;
    index index.html;
    
    # SPA 历史路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理到 Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
    }
    
    # 文件上传代理
    location ^~ /uploads/ {
        proxy_pass http://127.0.0.1:3000;
        expires 7d;
    }
    
    # 封面图 (强制不缓存，解决浏览器缓存 404)
    location /covers/ {
        expires -1;
        add_header Cache-Control "no-cache, must-revalidate";
    }
}
```

---

> 📅 本文档最后更新：2026-06-29
> 📝 下次修改建议附在章节八「已知问题与待改进项」中
