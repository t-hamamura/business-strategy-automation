// Railwayの環境変数に対応
process.env.HOSTNAME = '0.0.0.0';
process.env.PORT = process.env.PORT || '3000';

// standaloneサーバーを起動
require('./.next/standalone/server.js');
