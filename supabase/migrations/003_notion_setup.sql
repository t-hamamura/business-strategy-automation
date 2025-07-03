-- Notionテンプレート設定テーブル
create table if not exists public.notion_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Notionページとプロジェクトの紐付けテーブル
create table if not exists public.notion_page_mappings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  notion_page_id text not null,
  notion_database_id text not null,
  created_at timestamp with time zone default now()
); 