# 🚀 部署指南

本文档详细说明如何将日记应用部署到云端，实现多设备访问。

## 方案 1：Vercel 部署（推荐）

### ✅ 优点
- 完全免费
- 自动 HTTPS 加密
- 全球 CDN 加速
- 自动部署（推送代码即更新）
- 任何设备都能访问

### 📋 部署步骤

#### 1. 配置 Supabase（必需）

1. **创建项目**
   - 访问 https://database.new
   - 登录并创建新项目
   - 记录项目 URL 和 anon key

2. **创建数据库表**
   - 进入 SQL Editor
   - 运行 `SUPABASE_SETUP.md` 中的 SQL 脚本

3. **获取凭证**
   - Settings → API
   - 复制 Project URL 和 anon public key

#### 2. 初始化 Git 仓库

```bash
# 如果还没有 git 仓库
git init
git add .
git commit -m "Initial commit"
```

#### 3. 推送到 GitHub

```bash
# 在 GitHub 上创建新仓库（不要初始化 README）
# 然后运行：
git remote add origin https://github.com/你的用户名/diary-app.git
git branch -M main
git push -u origin main
```

#### 4. 在 Vercel 部署

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择你的 GitHub 仓库 `diary-app`
   - 点击 "Import"

3. **配置环境变量**
   - 在 "Environment Variables" 部分添加：
     ```
     VITE_SUPABASE_URL = 你的Supabase项目URL
     VITE_SUPABASE_ANON_KEY = 你的Supabase公钥
     ```

4. **开始部署**
   - 点击 "Deploy"
   - 等待 2-3 分钟

5. **获取访问地址**
   - 部署成功后会得到一个网址，如：
     ```
     https://diary-app-xxx.vercel.app
     ```

### ✨ 部署完成！

现在你可以：
- ✅ 在任何设备的浏览器中访问这个网址
- ✅ 注册账号并登录
- ✅ 在多个设备间同步数据
- ✅ 随时随地记录日记

---

## 方案 2：Netlify 部署

### 步骤类似 Vercel：

1. 访问 https://netlify.com
2. 导入 GitHub 仓库
3. 配置环境变量
4. 部署

---

## 方案 3：自己的服务器部署

如果你有自己的服务器（阿里云、腾讯云等）：

```bash
# 1. 构建项目
npm run build

# 2. 将 dist 文件夹上传到服务器
# 3. 使用 nginx 或 Apache 托管
# 4. 配置域名和 SSL 证书
```

---

## 🔒 安全提示

1. **不要将 .env 文件提交到 Git**
   - 已在 .gitignore 中排除

2. **环境变量只在 Vercel/Netlify 配置**
   - 不要硬编码到代码中

3. **使用强密码**
   - 注册时使用强密码
   - 定期更换密码

---

## 📱 使用说明

部署后的使用流程：

1. **首次使用**
   - 访问部署的网址
   - 注册新账号
   - 开始记录

2. **其他设备**
   - 在新设备上访问相同网址
   - 使用相同账号登录
   - 所有数据自动同步

3. **离线使用**
   - 数据会在本地缓存
   - 联网后自动同步

---

## 🆘 常见问题

**Q: 为什么必须配置 Supabase？**
A: 因为部署到云端后，本地存储（localStorage）无法跨设备共享，必须使用云数据库。

**Q: Vercel 免费版有限制吗？**
A: 个人使用完全免费，有足够的配额。

**Q: 可以使用自定义域名吗？**
A: 可以！在 Vercel 项目设置中添加自己的域名。

**Q: 如何更新网站？**
A: 只需推送新代码到 GitHub，Vercel 会自动重新部署。

---

## 📞 需要帮助？

如有问题，请查看：
- Vercel 文档：https://vercel.com/docs
- Supabase 文档：https://supabase.com/docs
