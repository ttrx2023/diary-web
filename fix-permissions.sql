-- ============================================
-- 修复 Supabase 权限问题（406 错误）
-- ============================================
-- 这个脚本会重新配置数据库权限，解决输入框无法使用的问题

-- 第一步：删除现有的策略（如果有）
DROP POLICY IF EXISTS "Users can manage their own entries" ON entries;
DROP POLICY IF EXISTS "Users can crud their own entries" ON entries;

-- 第二步：暂时禁用 RLS（这样我们可以看到是否是 RLS 的问题）
ALTER TABLE entries DISABLE ROW LEVEL SECURITY;

-- 第三步：重新启用 RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- 第四步：创建新的、更宽松的策略
-- 这个策略允许认证用户对自己的数据进行所有操作

-- 策略1：允许用户查看自己的数据
CREATE POLICY "Enable read access for authenticated users"
ON entries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 策略2：允许用户插入自己的数据
CREATE POLICY "Enable insert for authenticated users"
ON entries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 策略3：允许用户更新自己的数据
CREATE POLICY "Enable update for authenticated users"
ON entries FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 策略4：允许用户删除自己的数据
CREATE POLICY "Enable delete for authenticated users"
ON entries FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 第五步：验证策略已创建
-- 运行以下查询检查策略（可选）
-- SELECT * FROM pg_policies WHERE tablename = 'entries';

-- ============================================
-- 完成！刷新浏览器测试
-- ============================================
