# Supabase Cloud Sync Setup

To enable cross-device synchronization for your Diary App, follow these steps:

## 1. Create a Supabase Project
1. Go to [database.new](https://database.new) and create a free project.
2. In your project dashboard, go to **Project Settings > API**.
3. Copy the **Project URL** and **anon public key**.

## 2. Configure Environment Variables
Create a file named `.env` in the root of your project (`C:\Users\trxbe\diary-app\.env`) and add the keys:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Create the Database Table
Go to the **SQL Editor** in Supabase and run this script to create the table:

```sql
create table entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraint: One entry per user per day
  unique(user_id, date)
);

-- Enable Row Level Security (RLS)
alter table entries enable row level security;

-- Policy: Users can only see their own data
create policy "Users can crud their own entries"
  on entries for all
  using (auth.uid() = user_id);
```

## 4. Restart the App
Stop the running server (`Ctrl+C`) and run `npm run dev` again.
The Settings page should now show "Cloud Sync Active".
