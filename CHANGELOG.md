# Changelog

## 2026-06-28 — 代码清理与优化

### 后端重构
- **friendLinks 路由**：添加 `requireAuth`，统一错误处理为 `AppError + next(e)` 模式
- **music 路由**：修复字段名不匹配（`url→audioUrl`，`sortOrder→createdAt`），统一错误处理
- **articles 路由**：`/dates` 端点统一错误处理
- **browse 路由**：动态 `require` 改为静态 `import`
- **auth 路由**：guest 内联权限检查提取为 `adminOnly` middleware，cookie 名硬编码改为动态获取
- **错误处理**：文件大小提示 10MB→100MB，移除未使用的 `optionalAuth` middleware
- **清理**：移除浏览服务中未使用的 `prisma` import，删除孤儿 `dist/backgrounds.js`
- **Prisma Schema**：同步添加 Music 模型和 category 字段，生成客户端
- **配置**：修复 `package.json` start 路径，添加 `.gitignore`

### 前端修复
- **LazyImage**：`loading="lazy"` → `loading={inView ? 'eager' : undefined}`（修复 Edge Intervention 导致图片不加载）
- **SiteThemeContext**：内联样式加 `!important`（修复 CSS `body { background: ... !important }` 覆盖背景图）
- **MusicPlayer**：`url→audioUrl` 字段对齐后端，移除已删除的 `sortOrder`
- **AdminPanel**：音乐表单 `name→title` 字段对齐后端

### 后端修复清单
| 文件 | 改动 |
|------|------|
| `.gitignore` | 新增 |
| `backend/package.json` | 修复 start 路径 |
| `backend/prisma/schema.prisma` | 添加 Music 模型、category 字段 |
| `backend/src/middleware/errorHandler.ts` | 文件限制 10MB→100MB |
| `backend/src/middleware/auth.ts` | 移除未使用 optionalAuth |
| `backend/src/routes/articles.ts` | /dates 统一错误处理 |
| `backend/src/routes/auth.ts` | 导入 adminOnly，移除内联 guest 检查，cookie 名动态化 |
| `backend/src/routes/browse.ts` | 动态 require→静态 import |
| `backend/src/routes/friendLinks.ts` | 加 requireAuth，统一错误处理 |
| `backend/src/routes/music.ts` | 字段对齐，统一错误处理 |
| `backend/src/services/browse.service.ts` | 移除未用 prisma import |

### 前端修复清单
| 文件 | 改动 |
|------|------|
| `frontend/src/components/LazyImage.tsx` | loading lazy→eager |
| `frontend/src/components/MusicPlayer.tsx` | url→audioUrl |
| `frontend/src/components/auth/AdminPanel.tsx` | name→title |
| `frontend/src/context/SiteThemeContext.tsx` | 背景图 !important |
