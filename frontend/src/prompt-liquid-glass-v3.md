# 全站 iOS 26 液态玻璃改造 Prompt

## 研究结论

### 真正的液态玻璃 = SVG 位移滤镜 + 3层架构

Apple Liquid Glass 的核心不是 backdrop-filter blur，而是 **光的折射**。CSS-Tricks 和 liquid-glass.pro 生成器都证实了同一个技术栈：

1. **SVG 滤镜层** — `feTurbulence` 生成噪声纹理 + `feDisplacementMap` 用噪声做位移映射 = 玻璃折射
2. **Tint 层** — 极淡的白色半透明底色 `rgba(255,255,255,0.05~0.15)`
3. **Shine 层** — 对称 inset box-shadow 模拟玻璃边缘光泽
4. **blur 很低** — 3~8px 即可，折射滤镜做主要工作

### 3层 CSS 架构（来自 liquid-glass.pro 生成器）

```css
.liquid-glass {
  position: relative;
  isolation: isolate;  /* 关键：创建独立层叠上下文 */
}
/* ::before — tint + inner shadow（玻璃底色 + 边缘光泽） */
.liquid-glass::before {
  content: ''; position: absolute; inset: 0;
  box-shadow: inset 0 0 15px -5px #ffffff;
  background-color: rgba(255,255,255,0.05);
}
/* ::after — backdrop-filter + SVG displacement（折射） */
.liquid-glass::after {
  content: ''; position: absolute; inset: 0;
  backdrop-filter: blur(3px);
  filter: url(#glass-distortion);
}
```

### SVG 滤镜（必须放在页面 DOM 中）

```svg
<svg style="display:none">
  <filter id="glass-distortion">
    <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise"/>
    <feGaussianBlur in="noise" stdDeviation="2" result="blurred"/>
    <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>
```

### 设计原则（Apple HIG）
- 玻璃只用于**导航层**，不用于内容层
- 避免 glass-on-glass（玻璃叠玻璃）
- Regular variant 自适应背景明暗
- 层次：highlight + shadow + illumination 三层

---

## 执行计划

### Step 1: 在 index.html 注入 SVG 滤镜
在 `<body>` 开头加入隐藏 SVG，定义 `#glass-distortion` 滤镜。

### Step 2: 重写 index.css 玻璃系统

**`.glass-deep`（侧边栏）— 完全重写：**
- `isolation: isolate`
- `::before` — tint `rgba(255,255,255,0.06)` + inset shadow `inset 0 0 20px -5px rgba(255,255,255,0.5)`
- `::after` — `backdrop-filter: blur(6px)` + `filter: url(#glass-distortion)`
- 边缘：对称 inset box-shadow（原子软糖技法）
- 去掉所有之前的 gradient/光斑/动画

**`.glass-panel`（卡片）— 同样重写：**
- tint `rgba(255,255,255,0.04)`
- inset shadow + SVG displacement
- 更低 blur（4px）

**`.liquid-nav`（导航项）：**
- tint `rgba(255,255,255,0.06)` active 时
- inset shadow shine
- SVG displacement on ::after

**`.liquid-search` / `.liquid-tag` / `.liquid-calendar`：**
- 同样的 3 层架构，参数微调

**`.card`（文章卡片）：**
- glass-panel 的变体
- hover 时增强 displacement scale

### Step 3: Sidebar.tsx 调整
- 确保内容层有 `position: relative; z-index: 1` 在 glass 层之上
- 不改任何功能逻辑

### Step 4: Navbar.tsx 也加液态玻璃
- 顶部导航栏用 `.glass-deep` 的变体（横向）

### Step 5: 构建 + 部署
```bash
cd frontend && npm run build
scp -P 2222 dist/* root@server:/www/wwwroot/www.turekin.me/
ssh -p 2222 root@server "nginx -s reload"
```

### 回溯
备份在 `D:/TUREKIN_CODE/MYWEBSITE/BACKUPS-2026-06-24-liquid-glass-v2/`
