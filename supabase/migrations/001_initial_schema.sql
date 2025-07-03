-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ワークスペース（チーム）テーブル
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ワークスペースメンバーテーブル
create type member_role as enum ('owner', 'admin', 'member');

create table public.workspace_members (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role member_role default 'member',
  invited_at timestamp with time zone default timezone('utc'::text, now()) not null,
  joined_at timestamp with time zone,
  unique(workspace_id, user_id)
);

-- プロジェクトテーブル
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  company_name text not null,
  industry text not null,
  target_market text,
  main_product_service text,
  competitors text[], -- 競合企業のリスト
  budget_range text,
  status text default 'draft' check (status in ('draft', 'active', 'completed', 'archived')),
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- プロンプトテンプレートテーブル
create table public.prompt_templates (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  order_index integer not null,
  phase text not null,
  title text not null,
  main_question text not null,
  overview text not null,
  deliverables text not null,
  tags text[],
  prompt_content jsonb not null, -- フェーズ1-3のプロンプト
  variables text[], -- 使用する変数のリスト
  is_active boolean default true,
  is_custom boolean default false, -- カスタムプロンプトかどうか
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- API設定テーブル
create table public.api_settings (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  gemini_api_key text,
  notion_api_token text,
  notion_database_id text,
  api_rate_limit integer default 60, -- 1分あたりのリクエスト数
  execution_delay integer default 30, -- リクエスト間の待機時間（秒）
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(workspace_id)
);

-- 実行ログテーブル
create type execution_status as enum ('pending', 'running', 'completed', 'failed', 'skipped');

create table public.execution_logs (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  prompt_template_id uuid references public.prompt_templates(id),
  phase integer not null check (phase in (1, 2, 3)),
  status execution_status default 'pending',
  input_data jsonb, -- 実行時の入力データ
  output_data jsonb, -- Geminiからの出力
  notion_page_id text, -- 作成されたNotionページのID
  error_message text,
  execution_time_ms integer,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) の設定
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.prompt_templates enable row level security;
alter table public.api_settings enable row level security;
alter table public.execution_logs enable row level security;

-- RLSポリシー：ワークスペース
create policy "Users can view workspaces they are members of" on public.workspaces
  for select using (
    id in (
      select workspace_id from public.workspace_members 
      where user_id = auth.uid()
    )
  );

create policy "Users can update workspaces they own" on public.workspaces
  for update using (owner_id = auth.uid());

-- RLSポリシー：ワークスペースメンバー
create policy "Users can view workspace members" on public.workspace_members
  for select using (
    workspace_id in (
      select workspace_id from public.workspace_members 
      where user_id = auth.uid()
    )
  );

-- RLSポリシー：プロジェクト
create policy "Users can access projects in their workspaces" on public.projects
  for all using (
    workspace_id in (
      select workspace_id from public.workspace_members 
      where user_id = auth.uid()
    )
  );

-- RLSポリシー：プロンプトテンプレート
create policy "Users can access prompt templates in their workspaces" on public.prompt_templates
  for all using (
    workspace_id in (
      select workspace_id from public.workspace_members 
      where user_id = auth.uid()
    )
  );

-- RLSポリシー：API設定
create policy "Users can access API settings in their workspaces" on public.api_settings
  for all using (
    workspace_id in (
      select workspace_id from public.workspace_members 
      where user_id = auth.uid()
    )
  );

-- RLSポリシー：実行ログ
create policy "Users can access execution logs for their projects" on public.execution_logs
  for all using (
    project_id in (
      select p.id from public.projects p
      join public.workspace_members wm on p.workspace_id = wm.workspace_id
      where wm.user_id = auth.uid()
    )
  );

-- トリガー関数：updated_at自動更新
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- updated_atトリガーの作成
create trigger update_workspaces_updated_at before update on public.workspaces
  for each row execute function public.update_updated_at_column();

create trigger update_projects_updated_at before update on public.projects
  for each row execute function public.update_updated_at_column();

create trigger update_prompt_templates_updated_at before update on public.prompt_templates
  for each row execute function public.update_updated_at_column();

create trigger update_api_settings_updated_at before update on public.api_settings
  for each row execute function public.update_updated_at_column();