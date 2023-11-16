// ==================================================
// ©2023 https://github.com/m-kishi
// ==================================================
var express = require("express");

// アプリケーション
var app = express();

// production環境のフロントエンドの設定
app.use('/css', express.static(__dirname + '/css/'));
app.use('/img', express.static(__dirname + '/img/'));
app.use('/lib', express.static(__dirname + '/lib/'));
app.use('/', express.static(__dirname));
app.get('/', (req, res) => res.sendFile(__dirname + '/AbEasy.html'));

// 3000番ポートで起動
app.listen(3000, () => console.log('AbEasy is running on port 3000.'));
