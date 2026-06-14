#!/bin/bash
set -e

# ============================================================
# TUREKIN Blog 一键部署脚本
# 适配: Ubuntu 24 / 2核2GB / Nginx + PM2
# 部署结构:
#   /www/wwwroot/www.turekin.me/
#     index.html, assets/, avatar/, 404.html, background.jpg
#     backend/  (Express + PM2)
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

WEB_ROOT="/www/wwwroot/www.turekin.me"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

log "============================================"
log "  TUREKIN Blog 部署脚本"
log "  目标服务器: 2核2GB"
log "============================================"

# --------------------------------------------------
# 1. 前端构建
# --------------------------------------------------
log "1/5 构建前端 ..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  log "  安装前端依赖 ..."
  npm install --production=false
fi

rm -rf dist
npm run build || err "前端构建失败"

log "  前端构建完成:"
ls -lh dist/assets/ 2>/dev/null | head -3

# --------------------------------------------------
# 2. 部署前端静态文件
# --------------------------------------------------
log "2/5 部署前端静态文件 ..."

rm -rf "$WEB_ROOT/index.html" "$WEB_ROOT/assets" "$WEB_ROOT/avatar" "$WEB_ROOT/404.html" "$WEB_ROOT/background.jpg"

cp dist/index.html "$WEB_ROOT/index.html"
cp -r dist/assets "$WEB_ROOT/assets"
[ -f "dist/404.html" ] && cp dist/404.html "$WEB_ROOT/404.html"
[ -d "dist/avatar" ] && cp -r dist/avatar "$WEB_ROOT/avatar"
[ -f "dist/background.jpg" ] && cp dist/background.jpg "$WEB_ROOT/background.jpg"

chown -R www:www "$WEB_ROOT/index.html" "$WEB_ROOT/assets" "$WEB_ROOT/404.html" 2>/dev/null || true
[ -d "$WEB_ROOT/avatar" ] && chown -R www:www "$WEB_ROOT/avatar" 2>/dev/null || true
[ -f "$WEB_ROOT/background.jpg" ] && chown www:www "$WEB_ROOT/background.jpg" 2>/dev/null || true

log "  前端文件已部署到 $WEB_ROOT/"

# --------------------------------------------------
# 3. 后端构建 + 部署
# --------------------------------------------------
log "3/5 构建后端 ..."
cd "$SCRIPT_DIR/backend"

if [ ! -d "node_modules" ]; then
  log "  安装后端依赖 ..."
  npm install --production=false
fi

rm -rf dist
npx tsc || err "后端 TypeScript 编译失败"

log "4/5 部署后端 ..."
mkdir -p "$WEB_ROOT/backend"

cp -r dist "$WEB_ROOT/backend/dist"
cp package.json "$WEB_ROOT/backend/package.json"
cp package-lock.json "$WEB_ROOT/backend/package-lock.json" 2>/dev/null || true
cp ecosystem.config.js "$WEB_ROOT/backend/ecosystem.config.js"
cp tsconfig.json "$WEB_ROOT/backend/tsconfig.json"

mkdir -p "$WEB_ROOT/backend/uploads/avatars"
mkdir -p "$WEB_ROOT/backend/uploads/backgrounds"
[ -d "uploads/avatars" ] && cp -r uploads/avatars/* "$WEB_ROOT/backend/uploads/avatars/" 2>/dev/null || true
[ -d "uploads/backgrounds" ] && cp -r uploads/backgrounds/* "$WEB_ROOT/backend/uploads/backgrounds/" 2>/dev/null || true

chown -R www:www "$WEB_ROOT/backend" 2>/dev/null || true

cd "$WEB_ROOT/backend"
if [ ! -d "node_modules" ]; then
  log "  安装后端生产依赖 ..."
  npm install --production
fi

log "  后端文件已部署"

# --------------------------------------------------
# 5. 重启服务
# --------------------------------------------------
log "5/5 重启服务 ..."

export NVM_DIR="/www/server/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" 2>/dev/null || true

cd "$WEB_ROOT/backend"

if pm2 list 2>/dev/null | grep -q "turekin-blog"; then
  pm2 restart ecosystem.config.js
  log "  PM2 已重启 turekin-blog"
else
  pm2 start ecosystem.config.js
  log "  PM2 已启动 turekin-blog"
fi

pm2 save

# Nginx 配置更新
if [ -f "$SCRIPT_DIR/nginx.conf" ]; then
  log "  更新 Nginx 配置 ..."
  cp "$SCRIPT_DIR/nginx.conf" /www/server/panel/vhost/nginx/www.turekin.me.conf
fi

if command -v nginx &>/dev/null; then
  nginx -t && nginx -s reload || warn "Nginx 重载失败，请手动检查配置"
  log "  Nginx 已重载"
else
  warn "Nginx 未安装，跳过重载"
fi

# --------------------------------------------------
# 完成
# --------------------------------------------------
log "============================================"
log "  部署完成！"
log "  前端: https://www.turekin.me/"
log "  API:  https://www.turekin.me/api/articles/1"
log "  PM2:  pm2 status"
log "  日志: pm2 logs turekin-blog"
log "============================================"
