# 全站 iOS 26 液态玻璃 v4 — 高级感改造 Prompt

## 研究归纳

### Gemini 4 大技法 → 落地方案

| 技法 | 物理逻辑 | 前端平替 | 落地组件 |
|------|---------|---------|---------|
| 透光率+折射 | 光线追踪边缘漫反射 | `backdrop-filter: blur(Npx) saturate(120%)` + 对称 `inset box-shadow` | 已有，需微调参数 |
| 表面张力 | 弹簧物理曲率重绘 | 父 `filter: contrast(1.15)` + 子 `blur()` = 边缘融合 | **新增** |
| 环境光自适应 | 采样背景亮度反转色值 | `mix-blend-mode: difference` 在文字/图标 | **新增** |
| 动态高光追踪 | 陀螺仪动态光源 | CSS `--x,--y` 变量 + `radial-gradient` 位移 | **新增** hover 微交互 |

### 3 道性能防线
1. **`will-change: transform, backdrop-filter`** — 独立合成层隔离重排
2. **局部 blur** — 严禁全屏高斯模糊，收束在卡片/按钮等组件
3. **`@media (prefers-reduced-motion: reduce)`** — 降级为不透明纯色

### 从"廉价"到"高级"的关键差异

| 廉价感来源 | 高级感方案 |
|-----------|-----------|
| 纯灰色平面背景 | 极低透明度 tint(0.02) + 背景透射 |
| 单薄 1px border | 多层对称 inset shadow 模拟折射切面 |
| 无层次感 | 3层玻璃深度（深层/中层/浅层）不同 blur 值 |
| 静态死板 | hover 时光斑位移 + 边缘高光增强 |
| 文字与背景融为一体 | `mix-blend-mode` 自适应可读性 |

## 执行计划

### A. CSS 改造 (index.css)
1. `.liquid-tab` — 管理面板/筛选标签的液态玻璃
2. `.glass-music` — 音乐播放器液态玻璃
3. `.btn-ghost` 升级 — 按钮玻璃质感
4. `mix-blend-mode` 在玻璃上的文字
5. `--x, --y` CSS 变量 + `radial-gradient` hover 光斑
6. `will-change` + `prefers-reduced-motion` 降级

### B. 组件改造
7. AdminPanel Tabs → `liquid-tab` 类
8. AdminArticleActions → `.btn-ghost` + liquid glass
9. MusicPlayer → `.glass-music` 类
10. 筛选器 Tab（经典/影院/唱片）→ `liquid-tab`

### C. 功能新增
11. 管理面板站点设置 → 背景图片上传
12. 背景色选择器 → 深色/浅色模式切换
13. SiteThemeContext → 支持 dark/light 模式 + 自定义背景图

### D. 部署
14. 构建前端 → SCP 上传 → reload nginx
15. 重新拷贝 /assets/music 文件（rm -rf assets 会被删除）