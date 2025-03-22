# アニメ情報 GIF ジェネレーター

### 本日のアニメ配信開始・放送情報

![アニメ情報](https://github.com/OHMORIYUSUKE/anime-info-gif/blob/artifact/gif/rss_today.gif?raw=true)

### 本日誕生日のアイドルマスターのアイドル

![アイマス誕生日情報](https://github.com/OHMORIYUSUKE/anime-info-gif/blob/artifact/gif/imas_today.gif?raw=true)

## これは何？

アニメ関連情報を流れる形式の GIF 画像で表示するツールです。

- 今日放送・配信されるアニメ情報（[しょぼかる](https://cal.syoboi.jp/)から取得）
- アイマスキャラの誕生日情報（ローカルの[im@sparql](https://github.com/OHMORIYUSUKE/local-imasparql)から取得）

毎日 0 時に自動更新されます！

## セットアップ

1. リポジトリのクローンとサブモジュールの初期化：

```bash
git clone https://github.com/OHMORIYUSUKE/anime-info-gif.git
cd anime-info-gif
git submodule update --init --recursive
```

2. 依存関係のインストール：

```bash
npm install
```

3. local-imasparql の起動：

```bash
cd local-imasparql
docker compose up -d
cd ..
```

4. GIF 生成の実行：

```bash
npm start
```

## 必要要件

- Node.js
- Docker
- Docker Compose
- Git

## どこで使われてるの？

[エンジニアニメ](https://engineers-anime.connpass.com/)のコミュニティページで使ってます。
エンジニアがアニメについて語り合うコミュニティなので、ぜひ遊びに来てください！

## 使ってる技術

- Node.js
- TypeScript
- GitHub Actions
- Canvas API
- GIF Encoder
- Docker
- SPARQL

## 感謝

- [しょぼいカレンダー](https://cal.syoboi.jp/)
- [im@sparql](https://sparql.crssnky.xyz/imas/)

情報提供してくれてるサービスの皆様、ありがとうございます！

## トラブルシューティング

### im@sparql の問題

もし im@sparql の接続に問題がある場合：

1. Docker コンテナの状態確認：

```bash
cd local-imasparql
docker compose ps
```

2. ログの確認：

```bash
docker compose logs
```

3. コンテナの再起動：

```bash
docker compose down
docker compose up -d
```

## ライセンス

ソースコードは、MIT です。

取得している情報については、各サービスのライセンスに従います。ご利用の際は以下のサービスの利用規約をご確認ください：

- [しょぼいカレンダー](https://cal.syoboi.jp/)
- [im@sparql](https://sparql.crssnky.xyz/imas/)
