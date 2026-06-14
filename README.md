# 🚀 TUREKIN Blog

> 全栈个人博客系统 — React + Express + MySQL 构建的现代化博客平台

![GitHub License](https://img.shields.io/badge/license-CC--NC--4.0-blue)
![GitHub last commit](https://img.shields.io/github/last-commit/TUREKINNN/TUREKIN-blog)
![GitHub stars](https://img.shields.io/github/stars/TUREKINNN/TUREKIN-blog)

![首页截图](https://www.turekin.me/uploads/screenshot-index.png)

---

## ✨ 特性一览

| 模块 | 功能 |
|------|------|
| 📝 **文章系统** | Markdown 发布、源码高亮、目录锚点、分类标签 |
| 🎵 **音乐播放** | 自托管 MP3、专辑封面、音量控制 |
| 📅 **日历归档** | 日期筛选、文章角标、双击展开整月 |
| 🎨 **主题系统** | 6 种主题色 + 8 种底色，纯暗色风格 |
| 💬 **评论互动** | 访客评论、点赞、管理员回复 |
| 🤝 **友链互通** | 友联展示、本站信息可编辑 |
| 🖥️ **三种视图** | 经典列表 / 影院海报 / 唱片网格 |

---

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18 + TypeScript + Vite + Tailwind CSS |
| **后端** | Express 5 + TypeScript + Prisma ORM |
| **数据库** | MySQL 8.0 |
| **部署** | PM2 + Nginx + Ubuntu 24.04 |

---

## 📁 项目结构

```
TUREKIN-blog/
├── backend/                  # Express API 服务端
│   ├── src/
│   │   ├── routes/          # 10个API模块
│   │   ├── services/        # 业务逻辑层
│   │   ├── middleware/      # 认证/上传/验证
│   │   └── utils/           # 工具函数
│   └── prisma/              # 数据库模型
├── frontend/                 # React 前端 SPA
│   ├── src/
│   │   ├── pages/           # 7个页面
│   │   ├── components/      # 18个组件
│   │   ├── context/         # 6个 Context
│   │   └── hooks/           # 自定义 Hooks
│   └── public/              # 静态资源
├── deploy.sh                 # 一键部署
├── nginx.conf                # Nginx 配置
└── PROJECT_WIKI.md           # 完整项目文档
```

---

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/TUREKINNN/TUREKIN-blog.git
cd TUREKIN-blog

# 2. 安装前端依赖
cd frontend && npm install

# 3. 安装后端依赖
cd ../backend && npm install

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库连接信息

# 5. 初始化数据库
cd prisma && npx prisma db push && npx prisma db seed

# 6. 启动开发服务
cd ../frontend && npm run dev  # → localhost:5173
cd ../backend && npm run dev   # → localhost:3000
```

---

## 📖 文档

完整项目文档见 [PROJECT_WIKI.md](./PROJECT_WIKI.md)，包含：
- 📐 **数据库 Schema** — 8 张表的全部字段与关系
- 📡 **API 参考** — 37 个端点详细说明
- 🧩 **前端架构** — Context 嵌套、路由表、组件交互
- 🎨 **设计系统** — CSS 变量、玻璃面板、主题色
- 📦 **部署流程** — 构建命令、PM2、Nginx 配置
- ⚠️ **常见陷阱** — Zod 踩坑、useCallback 闭包、CSS calc 空格

---

## 🌐 在线演示

[https://www.turekin.me](https://www.turekin.me)

---

## 📄 License

MIT © TUREKIN
