#!/bin/bash

# Business Strategy Automation - プロダクションビルドテストスクリプト
# Railwayデプロイ前の動作確認用

set -e

echo "🚀 Business Strategy Automation - プロダクションビルドテスト"
echo "=================================================="

# プロジェクトルートディレクトリの確認
if [ ! -f "package.json" ]; then
    echo "❌ エラー: package.jsonが見つかりません"
    echo "   プロジェクトルートディレクトリで実行してください"
    exit 1
fi

echo "✅ プロジェクトルートディレクトリを確認しました"

# 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm install

# プロダクションビルド
echo "🔨 プロダクションビルドを実行中..."
npm run build

# standaloneディレクトリの確認
if [ ! -d ".next/standalone" ]; then
    echo "❌ エラー: .next/standaloneディレクトリが生成されていません"
    echo "   ビルドに失敗した可能性があります"
    exit 1
fi

echo "✅ ビルドが完了しました"

# 既存のプロセスを確認・終了
echo "🔍 ポート3000の使用状況を確認中..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  ポート3000が使用中です。既存のプロセスを終了します..."
    lsof -ti:3000 | xargs kill -9
    sleep 2
fi

# サーバーの起動
echo "🚀 standaloneサーバーを起動中..."
npm start &
SERVER_PID=$!

# サーバーの起動を待機
echo "⏳ サーバーの起動を待機中..."
sleep 10

# ヘルスチェックの実行
echo "🏥 ヘルスチェックを実行中..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/health)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

echo "📊 レスポンス:"
echo "HTTP Status: $HTTP_CODE"
echo "Response Body: $RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ ヘルスチェックが成功しました！"
    echo "🎉 Railwayデプロイの準備が整いました"
else
    echo "❌ ヘルスチェックが失敗しました"
    echo "   エラーコード: $HTTP_CODE"
fi

# サーバーの停止
echo "🛑 サーバーを停止中..."
kill $SERVER_PID

echo "=================================================="
echo "✨ テストが完了しました" 