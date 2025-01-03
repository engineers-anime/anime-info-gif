import GifEncoder from "gif-encoder";
import { createCanvas } from "canvas";
import fs from "fs";
import RSSParser from "rss-parser";
import axios from "axios";

const width = 800; // GIFの幅
const height = 100; // GIFの高さ
const delay = 100; // フレーム遅延 (ms)
const fontSize = 20; // フォントサイズ

type RSSItem = {
  title: string;
  date: string;
};

type RSSFeed = {
  items: RSSItem[];
};

async function fetchRSSData(
  url: string
): Promise<{ todayText: string; todayItemsCount: number }> {
  const response = await axios.get(url);
  const parser = new RSSParser();
  const feed = (await parser.parseString(response.data)) as RSSFeed;

  // 今日の日付を取得
  const today = new Date().toISOString().slice(0, 10);

  // 今日の番組を取得
  const todayItems = feed.items.filter((item) => {
    const pubDate = new Date(item.date).toISOString().slice(0, 10);
    return pubDate === today;
  });

  // タイトルを結合して返す
  const todayText =
    todayItems.map((item) => item.title).join(" / ") || "No programs today.";

  // todayItemsの数を返す
  return { todayText, todayItemsCount: todayItems.length };
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

  // フレーム数をtodayItemsの100倍に設定
  const totalFrames = todayItemsCount * 100; // todayItemsの数に100を掛けたフレーム数

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
