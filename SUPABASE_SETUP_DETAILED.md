# 🔰 Supabase 配置完全新手指南

本指南专为新手编写，每一步都有详细说明。请按顺序操作，不要跳过任何步骤。

---

## 📌 第一步：创建 Supabase 账号和项目

### 1.1 访问 Supabase 官网

**操作：**
1. 打开浏览器（Chrome、Edge、Firefox 都可以）
2. 在地址栏输入：`https://database.new`
3. 按回车键访问

**你会看到：**
- Supabase 的首页
- 顶部有 "Sign In" 或 "Start your project" 按钮

---

### 1.2 注册/登录账号

**操作：**
1. 点击 **"Sign In"** 或 **"Start your project"** 按钮
2. 你会看到登录选项页面

**选择登录方式（推荐使用 GitHub）：**

#### 方式 A：使用 GitHub 账号（推荐）

**如果你有 GitHub 账号：**
1. 点击 **"Continue with GitHub"** 按钮
2. 如果已经登录 GitHub，会直接跳转
3. GitHub 会询问是否授权 Supabase，点击 **"Authorize Supabase"**
4. 完成！自动登录到 Supabase

**如果你没有 GitHub 账号：**
1. 先打开新标签页访问：`https://github.com`
2. 点击右上角 **"Sign up"**
3. 填写：
   - 邮箱地址（如：yourname@gmail.com）
   - 密码（至少 15 个字符或 8 个字符+数字+特殊字符）
   - 用户名（如：yourname123）
4. 验证邮箱（查收邮件，点击确认链接）
5. GitHub 注册完成后，回到 Supabase，使用 GitHub 登录

#### 方式 B：使用邮箱登录（备选）

1. 在 Supabase 登录页面，输入你的邮箱
2. 点击 **"Continue with Email"**
3. 查收邮件，点击邮件中的登录链接
4. 自动登录到 Supabase

---

### 1.3 创建新项目

**登录成功后，你会看到 Supabase 仪表板（Dashboard）**

**操作：**
1. 点击 **"New Project"** 按钮（绿色按钮）
2. 如果是第一次使用，可能需要先创建 Organization（组织）：
   - 点击 **"New organization"**
   - 输入组织名称（随便填，如：`My Apps`）
   - 点击 **"Create organization"**

3. 现在填写项目信息：

   **① Name（项目名称）：**
   ```
   输入：my-diary

   说明：这是你的项目名称，只能包含小写字母、数字和连字符
   ```

   **② Database Password（数据库密码）：**
   ```
   重要！请设置一个强密码并记住它！

   建议格式：大小写字母+数字+特殊字符，至少12位
   例如：MyDiary@2024!Secure

   ⚠️ 请将密码保存到安全的地方（记事本、密码管理器等）
   ```

   **③ Region（服务器区域）：**
   ```
   选择：Northeast Asia (Tokyo)

   说明：这是离中国最近的服务器，访问速度最快
   ```

   **④ Pricing Plan（付费计划）：**
   ```
   选择：Free（免费）

   说明：免费版完全够用，无需付费
   ```

4. 点击底部的 **"Create new project"** 按钮

5. **等待 2-3 分钟**
   - 你会看到一个进度界面，显示 "Setting up project..."
   - 喝口水，耐心等待
   - 项目创建完成后会自动跳转到项目仪表板

---

## 📌 第二步：创建数据库表

**现在你应该在项目仪表板中，看到左侧有很多菜单选项**

### 2.1 打开 SQL 编辑器

**操作：**
1. 在左侧菜单中，找到并点击 **"SQL Editor"**
   - 图标是一个 `</>`  符号
   - 英文：SQL Editor

2. 点击后，你会看到一个代码编辑器界面

---

### 2.2 创建新查询

**操作：**
1. 在 SQL Editor 页面，点击右上角的 **"New Query"** 按钮
2. 你会看到一个空白的代码编辑区域

---

### 2.3 复制并运行 SQL 代码

**操作：**

**① 清空编辑器**
- 如果编辑器中有任何内容，全选（Ctrl+A）并删除

**② 复制以下完整代码：**

```sql
-- ============================================
-- 日记应用数据库表创建脚本
-- ============================================

-- 1. 创建日记条目表
create table entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- 约束：每个用户每天只能有一条记录
  unique(user_id, date)
);

-- 2. 启用行级安全（RLS）
alter table entries enable row level security;

-- 3. 创建安全策略：用户只能访问自己的数据
create policy "Users can manage their own entries"
  on entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- 创建完成！
-- ============================================
```

**③ 粘贴到编辑器**
- 将上面的代码完整复制（Ctrl+C）
- 点击 SQL Editor 的编辑区域
- 粘贴（Ctrl+V）

**④ 运行代码**
1. 确认代码已经完整粘贴
2. 点击右下角的 **"Run"** 按钮（或按 Ctrl+Enter）
3. 等待 2-3 秒

**⑤ 检查结果**
- 如果成功，你会在底部看到 **"Success. No rows returned"**
- 如果失败，会显示红色错误信息（截图告诉我，我帮你解决）

---

## 📌 第三步：获取 Supabase 凭证

**这是最重要的一步！你需要获取两个密钥，用于连接你的应用和数据库。**

### 3.1 打开 API 设置页面

**操作：**
1. 在左侧菜单底部，找到并点击 **齿轮图标 ⚙️**（Settings）
2. 在设置菜单中，点击 **"API"**
3. 你会看到 "Project API keys" 页面

---

### 3.2 复制项目 URL

**在页面中找到 "Project URL" 部分：**

```
Project URL
┌─────────────────────────────────────────┐
│ https://xxxxx.supabase.co               │
└─────────────────────────────────────────┘
```

**操作：**
1. 找到 **"Project URL"**
2. 点击右边的 **"Copy"** 按钮（或手动选中并复制）
3. 打开记事本（Windows）或文本编辑（Mac）
4. 新建一个文件，命名为 `supabase-credentials.txt`
5. 在文件中写入：
   ```
   Project URL:
   [在这里粘贴你复制的URL]
   ```

**示例：**
```
Project URL:
https://abcdefghijk.supabase.co
```

---

### 3.3 复制公开密钥（anon public key）

**在同一个页面，向下滚动，找到 "Project API keys" 部分：**

```
Project API keys
┌─────────────────────────────────────────┐
│ anon public                             │
│ eyJhbGci... [很长的一串字符]             │
└─────────────────────────────────────────┘
```

**操作：**
1. 找到标记为 **"anon"** 或 **"anon public"** 的密钥
2. 点击右边的 **"Copy"** 按钮（或手动选中并复制）
3. 在你的 `supabase-credentials.txt` 文件中继续写入：
   ```

   Anon Key:
   [在这里粘贴你复制的密钥]
   ```

**示例：**
```
Project URL:
https://abcdefghijk.supabase.co

Anon Key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1NzE2MzMsImV4cCI6MjAwNTE0NzYzM30.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

4. **保存文件！** （Ctrl+S）

---

## 📌 第四步：配置本地项目

**现在回到你的项目代码**

### 4.1 创建 .env 文件

**操作：**

**方法 1：使用命令行（推荐）**

```bash
# 在项目根目录运行
cp .env.example .env
```

**方法 2：手动创建**

1. 打开项目文件夹：`C:\Users\trxbe\diary-app`
2. 右键 → 新建 → 文本文档
3. 将文件名改为：`.env`（注意前面有个点）
   - Windows 可能会警告，点击"是"确认
4. 用记事本或 VS Code 打开 `.env` 文件

---

### 4.2 填写环境变量

**在 .env 文件中输入：**

```env
VITE_SUPABASE_URL=在这里粘贴你的Project URL
VITE_SUPABASE_ANON_KEY=在这里粘贴你的Anon Key
```

**完整示例：**
```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1NzE2MzMsImV4cCI6MjAwNTE0NzYzM30.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**重要提示：**
- ⚠️ 不要有多余的空格
- ⚠️ 不要用引号包裹
- ⚠️ URL 和 Key 之间没有空行

**保存文件**（Ctrl+S）

---

## 📌 第五步：测试配置

### 5.1 重启开发服务器

**操作：**

1. **停止当前服务器：**
   - 在运行 `npm run dev` 的终端窗口
   - 按 `Ctrl + C`
   - 等待服务器停止

2. **重新启动：**
   ```bash
   npm run dev
   ```

3. **等待启动完成**
   - 你会看到：`Local: http://localhost:5173/`

---

### 5.2 测试云端同步

**操作：**

1. **打开浏览器访问：** `http://localhost:5173/`

2. **你应该看到登录页面！**
   - 如果看到登录页面，说明 Supabase 配置成功！✅
   - 如果没有看到登录页面，继续往下看

3. **注册新账号：**
   - 点击 "Don't have an account? Sign up"
   - 输入邮箱（如：test@example.com）
   - 输入密码（至少 6 位）
   - 确认密码
   - 点击 "Create Account"

4. **检查邮箱：**
   - Supabase 会发送确认邮件
   - 打开邮箱，点击确认链接
   - 确认后回到应用登录

5. **开始使用：**
   - 登录后进入主界面
   - 尝试记录一些内容
   - 失焦后会自动保存

6. **验证云端同步：**
   - 回到 Supabase 仪表板
   - 点击左侧 **"Table Editor"**
   - 选择 **"entries"** 表
   - 你应该能看到刚才保存的数据！✅

---

## ✅ 配置完成检查清单

请确认以下所有项都完成：

- [ ] Supabase 账号已创建
- [ ] Supabase 项目已创建（my-diary）
- [ ] SQL 脚本已成功运行（entries 表已创建）
- [ ] Project URL 已复制并保存
- [ ] Anon Key 已复制并保存
- [ ] .env 文件已创建
- [ ] .env 文件中填入了正确的 URL 和 Key
- [ ] 开发服务器已重启
- [ ] 能够看到登录页面
- [ ] 能够注册并登录
- [ ] 能够保存数据到云端

---

## ❓ 常见问题解决

### Q1: 运行 SQL 时出现错误

**错误示例：** `relation "entries" already exists`

**解决方法：**
- 这说明表已经存在，不用担心
- 可以忽略这个错误，继续下一步

---

### Q2: 看不到登录页面，还是直接进入主界面

**可能原因：** .env 文件没有生效

**解决方法：**
1. 确认 .env 文件在项目根目录（和 package.json 同级）
2. 确认文件名是 `.env` 而不是 `.env.txt`
3. 确认已经重启了开发服务器（Ctrl+C 停止，然后 npm run dev）
4. 清除浏览器缓存（Ctrl+Shift+Delete）

---

### Q3: 注册时提示错误

**错误示例：** `Invalid email` 或 `Password too weak`

**解决方法：**
- 使用真实的邮箱格式（必须包含 @）
- 密码至少 6 个字符
- 可以用测试邮箱：`test123@example.com`

---

### Q4: 收不到确认邮件

**解决方法：**
1. 检查垃圾邮件文件夹
2. 等待 5-10 分钟（邮件可能延迟）
3. 或者在 Supabase 仪表板中禁用邮箱确认：
   - 左侧菜单 → Authentication → Settings
   - 找到 "Email Confirmations"
   - 关闭 "Enable email confirmations"

---

### Q5: 数据没有保存到云端

**检查方法：**
1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 查看是否有红色错误信息
4. 截图发给我，我帮你分析

---

## 📞 需要帮助？

如果遇到问题：

1. **截图当前界面** - 让我看看你看到了什么
2. **复制错误信息** - 如果有红色错误，完整复制
3. **告诉我操作步骤** - 你做到了哪一步

我会立即帮你解决！🚀

---

## 🎯 下一步

配置成功后，你可以：

1. ✅ 继续本地使用（已支持云同步）
2. ✅ 继续部署到 Vercel（让其他设备也能访问）

准备好了就告诉我，我们继续下一步！
