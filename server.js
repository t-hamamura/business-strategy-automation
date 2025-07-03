const path = require('path');

// 環境変数の設定
process.env.HOSTNAME = '0.0.0.0';
process.env.PORT = process.env.PORT || '3000';
process.env.NODE_ENV = 'production';

// Next.js standaloneサーバーを起動
require('./.next/standalone/server.js');
