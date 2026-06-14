# 贡献指南

感谢你对 TUREKIN Blog 感兴趣！🎉

## 项目定位

这是一个个人博客系统，同时也作为开源项目供学习参考。

## 如何贡献

### 🐛 报告 Bug

1. 确保 Bug 尚未被报告（搜索 [Issues](https://github.com/TUREKINNN/TUREKIN-blog/issues)）
2. 提 Issue 时请包含：
   - 浏览器版本和操作系统
   - 复现步骤
   - 期望行为 vs 实际行为
   - 截图（如果适用）

### 💡 功能建议

欢迎在 Issues 中提出功能建议，请说明：
- 解决了什么问题
- 预期的实现方式
- 是否愿意参与开发

### 🔧 提交 PR

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feat/your-feature`
3. 提交改动：`git commit -m "feat: add some feature"`
4. 推送到分支：`git push origin feat/your-feature`
5. 创建 Pull Request

### 开发规范

| 规范 | 说明 |
|------|------|
| **前端** | React 18 + TypeScript + Tailwind CSS |
| **后端** | Express 5 + TypeScript + Prisma ORM |
| **提交信息** | 遵循 [Conventional Commits](https://www.conventionalcommits.org/) |
| **代码风格** | 统一使用项目配置的 ESLint + Prettier |

## 本地开发

```bash
git clone https://github.com/TUREKINNN/TUREKIN-blog.git
cd TUREKIN-blog

# 前端
cd frontend && npm install && npm run dev

# 后端
cd ../backend && npm install && npm run dev
```

## 行为准则

请保持友善和建设性的沟通。本项目遵循 [Contributor Covenant](https://www.contributor-covenant.org/) 行为准则。

---

再次感谢你的贡献！喵～ 🐱