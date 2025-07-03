-- API使用量追跡システム
-- マイグレーション: 004_api_usage_tracking.sql

-- APIサービス定義テーブル
CREATE TABLE IF NOT EXISTS api_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    base_url TEXT NOT NULL,
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    rate_limit_per_day INTEGER DEFAULT 10000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API使用量ログテーブル
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    service_id UUID REFERENCES api_services(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    tokens_used INTEGER,
    cost_usd DECIMAL(10,6),
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API使用量制限テーブル
CREATE TABLE IF NOT EXISTS api_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    service_id UUID REFERENCES api_services(id) ON DELETE CASCADE,
    quota_type VARCHAR(20) NOT NULL CHECK (quota_type IN ('daily', 'monthly', 'yearly')),
    limit_value INTEGER NOT NULL,
    used_value INTEGER DEFAULT 0,
    reset_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, workspace_id, service_id, quota_type)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_workspace_id ON api_usage_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_service_id ON api_usage_logs(service_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_quotas_user_id ON api_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_api_quotas_workspace_id ON api_quotas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_api_quotas_service_id ON api_quotas(service_id);

-- 初期データ挿入
INSERT INTO api_services (name, description, base_url, rate_limit_per_minute, rate_limit_per_hour, rate_limit_per_day) VALUES
('gemini-ai', 'Google Gemini AI API', 'https://generativelanguage.googleapis.com', 60, 1000, 10000),
('notion-api', 'Notion API', 'https://api.notion.com', 30, 500, 5000),
('openai-api', 'OpenAI API', 'https://api.openai.com', 60, 1000, 10000)
ON CONFLICT (name) DO NOTHING;

-- 使用量統計ビュー
CREATE OR REPLACE VIEW api_usage_stats AS
SELECT 
    aul.user_id,
    aul.workspace_id,
    aul.service_id,
    as.name as service_name,
    DATE_TRUNC('day', aul.created_at) as usage_date,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN aul.status_code >= 200 AND aul.status_code < 300 THEN 1 END) as successful_requests,
    COUNT(CASE WHEN aul.status_code >= 400 THEN 1 END) as failed_requests,
    AVG(aul.response_time_ms) as avg_response_time,
    SUM(aul.tokens_used) as total_tokens,
    SUM(aul.cost_usd) as total_cost,
    MAX(aul.created_at) as last_request_at
FROM api_usage_logs aul
JOIN api_services as ON aul.service_id = as.id
GROUP BY aul.user_id, aul.workspace_id, aul.service_id, as.name, DATE_TRUNC('day', aul.created_at);

-- 使用量制限チェック関数
CREATE OR REPLACE FUNCTION check_api_quota(
    p_user_id UUID,
    p_workspace_id UUID,
    p_service_id UUID,
    p_quota_type VARCHAR(20)
) RETURNS BOOLEAN AS $$
DECLARE
    quota_record RECORD;
    current_usage INTEGER;
BEGIN
    -- クォータレコードを取得
    SELECT * INTO quota_record
    FROM api_quotas
    WHERE user_id = p_user_id 
      AND workspace_id = p_workspace_id 
      AND service_id = p_service_id 
      AND quota_type = p_quota_type;
    
    -- クォータが存在しない場合は制限なし
    IF NOT FOUND THEN
        RETURN TRUE;
    END IF;
    
    -- リセット日をチェック
    IF quota_record.reset_date < CURRENT_DATE THEN
        -- クォータをリセット
        UPDATE api_quotas
        SET used_value = 0,
            reset_date = CASE 
                WHEN p_quota_type = 'daily' THEN CURRENT_DATE + INTERVAL '1 day'
                WHEN p_quota_type = 'monthly' THEN CURRENT_DATE + INTERVAL '1 month'
                WHEN p_quota_type = 'yearly' THEN CURRENT_DATE + INTERVAL '1 year'
            END,
            updated_at = NOW()
        WHERE id = quota_record.id;
        
        RETURN TRUE;
    END IF;
    
    -- 使用量をチェック
    RETURN quota_record.used_value < quota_record.limit_value;
END;
$$ LANGUAGE plpgsql;

-- 使用量更新関数
CREATE OR REPLACE FUNCTION update_api_usage(
    p_user_id UUID,
    p_workspace_id UUID,
    p_service_id UUID,
    p_usage_value INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
    -- 日次クォータを更新
    INSERT INTO api_quotas (user_id, workspace_id, service_id, quota_type, limit_value, used_value, reset_date)
    VALUES (p_user_id, p_workspace_id, p_service_id, 'daily', 10000, p_usage_value, CURRENT_DATE + INTERVAL '1 day')
    ON CONFLICT (user_id, workspace_id, service_id, quota_type)
    DO UPDATE SET 
        used_value = api_quotas.used_value + p_usage_value,
        updated_at = NOW();
    
    -- 月次クォータを更新
    INSERT INTO api_quotas (user_id, workspace_id, service_id, quota_type, limit_value, used_value, reset_date)
    VALUES (p_user_id, p_workspace_id, p_service_id, 'monthly', 100000, p_usage_value, CURRENT_DATE + INTERVAL '1 month')
    ON CONFLICT (user_id, workspace_id, service_id, quota_type)
    DO UPDATE SET 
        used_value = api_quotas.used_value + p_usage_value,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- RLSポリシー
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_quotas ENABLE ROW LEVEL SECURITY;

-- API使用量ログのポリシー
CREATE POLICY "Users can view their own API usage logs" ON api_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API usage logs" ON api_usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- APIクォータのポリシー
CREATE POLICY "Users can view their own API quotas" ON api_quotas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own API quotas" ON api_quotas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API quotas" ON api_quotas
    FOR INSERT WITH CHECK (auth.uid() = user_id); 