import GifEncoder from "gif-encoder";
import { createCanvas } from "canvas";
import fs from "fs";
import RSSParser from "rss-parser";
import axios from "axios";

const width = 800; // GIFの幅
const height = 70; // GIFの高さ
const delay = 100; // フレーム遅延 (ms)
const fontSize = 20; // フォントサイズ

type RSSItem = {
  title: string;
  "dc:date": string;
  "dc:publisher": string;
};

type RSSFeed = {
  description: string;
  items: RSSItem[];
};

async function fetchRSSData(
  url: string
): Promise<{ todayText: string; todayItemsCount: number }> {
  const response = await axios.get(url);
  // RSSParserをカスタマイズしてインスタンスを作成
  const parser = new RSSParser({
    customFields: {
      item: ["dc:date", "dc:publisher"], // itemレベルでdc:publisherを追加
    },
  });
  const feed = (await parser.parseString(response.data)) as RSSFeed;
  // ルートレベルのdescriptionを取得
  const feedDescription = (feed.description || "").replace(/\s+/g, "");

  // 今日の番組を取得
  const allItems = feed.items;
  const displayItems = allItems.slice(0, 10);
  const hasMoreItems = allItems.length > 10;

  // タイトルを結合して返す
  let todayText = `アニメ配信開始・放送情報 ${feedDescription} / `;
  todayText =
    todayText +
    displayItems
      .map((item) => `${item.title} [${item["dc:publisher"] || "不明"}]`)
      .join(" / ");

  // 10件以上ある場合、追加メッセージを表示
  if (hasMoreItems) {
    todayText += ` / 続きはしょぼいカレンダー(https://cal.syoboi.jp/)で確認してください`;
  }

  // todayItemsの数を返す（表示件数を返す）
  return { todayText, todayItemsCount: displayItems.length };
}

async function createGIF(text: string, todayItemsCount: number): Promise<void> {
  const gif = new GifEncoder(width, height);
  const file = fs.createWriteStream("gif/rss_today.gif");
  gif.pipe(file);

  // GIFヘッダーを設定
  gif.writeHeader();
  gif.setRepeat(0); // 無限ループ
  gif.setDelay(delay);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.font = `${fontSize}px Arial`;

  // テキストの幅を計算
  const textWidth = ctx.measureText(text).width;

  // フレーム数をtodayItemsの100倍 + 100に設定
  const totalFrames = todayItemsCount * 100 + 100; // todayItemsの数に100を掛けたフレーム数

  for (let i = 0; i < totalFrames; i++) {
    ctx.clearRect(0, 0, width, height); // 画面をクリア
    ctx.fillStyle = "white"; // 背景色を設定
    ctx.fillRect(0, 0, width, height); // 背景を描画

    ctx.fillStyle = "black"; // テキスト色を設定

    // テキストの流れをスムーズにするために位置を動かす
    const x = (i * 10) % (width + textWidth); // テキストの開始位置を決める

    // テキストを描画
    ctx.fillText(text, width - x, height / 2 + fontSize / 2);

    // 現在のフレームの画像データを取得
    const imageData = ctx.getImageData(0, 0, width, height).data;

    // フレームを追加
    gif.addFrame(imageData);

    // メモリを解放するためにread()を呼び出す
    gif.read();
  }

  gif.finish();
  console.log("rss_today.gif が生成されました！");
}

(async () => {
  try {
    const rssURL = "https://cal.syoboi.jp/rss.php";
    const { todayText, todayItemsCount } = await fetchRSSData(rssURL);
    console.log("取得した今日の情報:", todayText);
    await createGIF(todayText, todayItemsCount); // todayItemsCountを渡す
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
})();
