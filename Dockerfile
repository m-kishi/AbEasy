# 現時点で最新のLTSを指定
FROM node:lts-alpine3.18

# プロジェクトフォルダ
WORKDIR /AbEasy

# 必要なパッケージをインストール
RUN apk update

# server を起動
CMD ["npm", "start"]
