# 📊 Business Strategy Automation

**事業戦略自動化システム** - Gemini AIを活用した包括的な事業戦略策定プラットフォーム

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC)](https://tailwindcss.com/)

## 🎯 概要

Business Strategy Automationは、38項目にわたる体系的な事業戦略調査を自動化するプラットフォームです。マッキンゼー品質のコンサルティングフレームワークをベースに、Gemini AIが高品質な戦略レポートを自動生成し、Notionに整理して保存します。

### ✨ 主な特徴

- **🤖 完全自動化**: 設定後は38項目の調査が自動実行
- **👥 チーム対応**: ワークスペース機能でチーム全体で利用可能
- **📝 カスタマイズ**: プロンプトの編集・追加が可能
- **📊 進捗管理**: リアルタイムでの実行状況確認
- **📋 Notion連携**: 結果を自動的にNotionに整理・保存
- **🔄 段階実行**: 3フェーズに分けた詳細な分析
- **📈 エビデンス重視**: 全ての分析に出典とエビデンスを付記

## 🏗️ システム構成

### フェーズ別調査項目（38項目）

#### 📍 フェーズⅠ：現状把握と事業基盤（6項目）
1. 内部環境・自社アセット評価レポート
2. ビジネスモデル診断と再構築プラン
3. 市場規模・成長性分析レポート
4. PESTLE分析とマクロ環境機会レポート
5. 競合インテリジェンス・スイッチング要因分析
6. テクノロジートレンド・セキュリティ機会分析

#### 🎯 フェーズⅡ：顧客理解と戦略の核（5項目）
7. 顧客セグメンテーション・ペルソナ定義
8. 顧客インサイト・メッセージング戦略
9. カスタマージャーニー・体験マッピング
10. プロダクト仮説検証プロセス設計
11. ブランド・アイデンティティ戦略の策定

#### 🚀 フェーズⅢ：市場参入と成長戦略（6項目）
12. Go-to-Market戦略・セールスプラン
13. パートナーシップ・エコシステム戦略
14. グローバル展開・ローカライゼーション戦略
15. 成長ドライバー・リテンション改善戦略
16. ユニットエコノミクス（LTV/CAC）分析
17. フリーミアム戦略の導入計画

#### 📢 フェーズⅣ：マーケティング・コミュニケーション（11項目）
18. コンテンツ＆チャネル戦略の策定
19. クリエイティブ改善・学習プロセス構築
20. 広報・PR戦略
21. 広告メディアプランニング
22. YouTube運用戦略
23. Instagram運用戦略
24. X(Twitter)運用戦略
25. TikTok運用戦略
26. アフィリエイト・マーケティング戦略
27. インフルエンサーマーケティング戦略
28. ポストセールス・コミュニティ戦略

#### 🏢 フェーズⅤ：事業推進基盤とリスク管理（9項目）
29. マーケティングテクノロジー基盤設計
30. セールス・イネーブルメント体制の構築
31. KPI設計とモニタリングダッシュボード構築
32. 戦略的人員・予算計画の策定
33. データ駆動型意思決定プロセスの導入
34. 「学習する組織」への変革プラン
35. ESG・サステナビリティ戦略策定
36. 事業リスク・シナリオプランニング
37. クライシス・マネジメント・プレイブック

#### 📋 最終成果物
38. 事業戦略 全体サマリーレポート

## 🛠️ 技術スタック

### フロントエンド・バックエンド
- **Next.js 14** (App Router) - フルスタックWebアプリケーション
- **TypeScript** - 型安全性とコード品質
- **Tailwind CSS** - モダンなスタイリング
- **shadcn/ui** - 高品質なUIコンポーネント

### データベース・認証
- **Supabase** - PostgreSQLデータベース + 認証
- **Row Level Security (RLS)** - セキュアなデータアクセス

### AI・外部API
- **Google Gemini AI** - 高品質な戦略レポート生成
- **Notion API** - 結果の自動整理・保存

### デプロイ・インフラ
- **Vercel** - ワンクリックデプロイ
- **GitHub** - ソースコード管理

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/business-strategy-automation.git
cd business-strategy-automation
```

### 2. 依存関係のインストール

```bash
npm install
# または
yarn install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env.local`を作成：

```bash
cp .env.example .env.local
```

必要な環境変数を設定：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini API設定
GEMINI_API_KEY=your_gemini_api_key

# Next.js設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 4. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com)でプロジェクト作成
2. SQLエディタで`supabase/migrations/001_initial_schema.sql`を実行
3. 初期データを投入：`supabase/migrations/002_insert_initial_prompts.sql`

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 📖 使い方

### 初回セットアップ

1. **アカウント作成**: メールアドレスでサインアップ
2. **ワークスペース作成**: チーム用のワークスペースを設定
3. **API設定**: GeminiとNotionのAPIキーを設定

### プロジェクト作成

1. ダッシュボードで「新規プロジェクト」をクリック
2. 企業情報を入力：
   - 企業名、業界、主要製品・サービス
   - ターゲット市場、競合企業
   - 予算規模

### 調査実行

#### 手動実行
- 特定の項目を選択して個別実行
- 3フェーズずつ段階的に実行

#### 自動実行
- 全38項目を自動実行
- 実行間隔とエラー処理を設定可能

### 結果確認

- **ダッシュボード**: 進捗状況をリアルタイム表示
- **Notion**: 自動作成されたページで詳細確認
- **履歴**: 過去の実行結果を時系列で表示

## 🔧 API設定ガイド

### Gemini AI API

1. [Google AI Studio](https://aistudio.google.com/)でAPIキー取得
2. システム設定でAPIキーを入力
3. 利用制限に注意（無料枠：15 requests/minute）

### Notion API

1. [Notion Developers](https://developers.notion.com/)でインテグレーション作成
2. データベースIDをコピー
3. システム設定で両方を入力

## 🌐 デプロイ手順

### Vercelデプロイ（推奨）

1. GitHubにリポジトリをプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ完了

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/business-strategy-automation)

### 手動デプロイ

```bash
npm run build
npm start
```

## 🔐 セキュリティ

- **Row Level Security**: Supabaseで実装済み
- **API Key管理**: 環境変数で安全に管理
- **チーム分離**: ワークスペース単位でデータ分離
- **認証**: Supabase Authで安全なユーザー管理

## 📊 料金・制限

### Gemini AI
- **無料枠**: 15 requests/minute, 1,500 requests/day
- **有料プラン**: [Google AI Pricing](https://ai.google.dev/pricing)

### Supabase
- **無料枠**: 500MB、50,000 monthly active users
- **有料プラン**: [Supabase Pricing](https://supabase.com/pricing)

### Notion API
- **無料**: 制限なし（通常の利用範囲）

## 🤝 コントリビューション

### 開発への参加

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. プッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### バグ報告

[Issues](https://github.com/your-username/business-strategy-automation/issues)でバグを報告してください。

### 機能要望

新機能のアイデアは[Discussions](https://github.com/your-username/business-strategy-automation/discussions)で議論しましょう。

## 📝 カスタマイズ

### プロンプトの編集

1. ダッシュボードの「調査項目」タブ
2. 編集したい項目を選択
3. リッチエディタで内容を変更
4. 変数（[自社名]など）の追加・編集

### 新規項目の追加

1. 「カスタム項目追加」をクリック
2. 3フェーズのプロンプトを作成
3. 変数と実行順序を設定

## 🔍 トラブルシューティング

### よくある問題

**Q: Gemini APIエラーが発生する**
- APIキーの確認
- 利用制限の確認
- インターネット接続の確認

**Q: Notionページが作成されない**
- NotionトークンとデータベースIDの確認
- Notionインテグレーションの権限確認

**Q: プロジェクトが作成できない**
- Supabase接続の確認
- 必須フィールドの入力確認

### ログの確認

```bash
# 開発環境
npm run dev

# ブラウザのコンソールでエラー確認
F12 > Console
```

## 📚 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Notion API Documentation](https://developers.notion.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照

## 🙏 謝辞

- **マッキンゼー・アンド・カンパニー**: フレームワークの参考
- **Google**: Gemini AIの提供
- **Notion**: APIの提供
- **Supabase**: バックエンドインフラの提供
- **Vercel**: ホスティングプラットフォームの提供

---

**Made with ❤️ for strategic business planning**

[🌟 Star us on GitHub](https://github.com/your-username/business-strategy-automation) | [📖 Documentation](https://docs.your-domain.com) | [💬 Community](https://discord.gg/your-invite)# marketing-research-system
