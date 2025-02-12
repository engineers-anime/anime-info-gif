import GifEncoder from "gif-encoder";
import { createCanvas } from "canvas";
import fs from "fs";
import axios from "axios";

const width = 800; // GIFの幅
const height = 70; // GIFの高さ
const delay = 100; // フレーム遅延 (ms)
const fontSize = 20; // フォントサイズ

// 今日の日付を取得 (YYYY-MM-DD形式)
const today = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
);

type Idol = {
  name: string;
  color: string;
};

async function fetchIdolData(): Promise<{
  idols: Idol[];
}> {
  const todayDate = today
    .toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tokyo",
    })
    .replace("/", "-"); // "MM-DD"形式に変換

  const query = `
      PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX schema: <http://schema.org/>
      PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
  
      SELECT (sample(?o) as ?date) (sample(?n) as ?name) (sample(?c) as ?color)
      WHERE { 
      ?sub schema:birthDate ?o; 
          rdfs:label ?n; 
      OPTIONAL { 
          ?sub imas:Color ?c. 
      }
      FILTER(regex(str(?o), "--${todayDate}")) 
      } 
      GROUP BY (?n) 
      ORDER BY (?name)
    `;
  const url = `https://sparql.crssnky.xyz/spql/imas/query?query=${encodeURIComponent(
    query
  )}`;
  const response = await axios.get(url);
  const data = response.data.results.bindings;

  // データを抽出して処理
  const idols: Idol[] = data.map((item: any) => ({
    name: item.name.value,
    color: item.color?.value || "000000", // 色がない場合は黒
  }));

  return { idols };
}

// GIF作成関数
async function createGIF(idols: Idol[]): Promise<void> {
  const gif = new GifEncoder(width, height);
  const file = fs.createWriteStream("gif/imas_today.gif");
  gif.pipe(file);

  // 表示する文字列
  const todayTextDate = `${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}月${String(today.getDate()).padStart(2, "0")}日`;
  let text =
    idols.map((idol) => idol.name).join(" / ") ||
    `${todayTextDate}誕生日の人おめでとう!`;

  // GIFヘッダーを設定
  gif.writeHeader();
  gif.setRepeat(0); // 無限ループ
  gif.setDelay(delay);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.font = `${fontSize}px Arial`;

  // フレーム数をtodayItemsの150倍 + 100に設定
  const totalFrames = idols.length * 150 + 100; // todayItemsの数に100を掛けたフレーム数

  for (let i = 0; i < totalFrames; i++) {
    ctx.clearRect(0, 0, width, height); // 画面をクリア
    ctx.fillStyle = "white"; // 背景色を設定
    ctx.fillRect(0, 0, width, height); // 背景を描画

    // テキストの流れをスムーズにするために位置を動かす
    const textWidth = ctx.measureText(text).width;
    const x = width - ((i * 10) % (width + textWidth)); // 右から流れるように計算

    let xOffset = x;

    // 誕生日のアイドルがいない
    if (idols.length === 0) {
      ctx.fillStyle = "#000000";
      ctx.fillText(text, xOffset, height / 2 + fontSize / 2);
    }

    // アイドル名と黒色の '/' を描画
    idols.forEach((idol, index) => {
      ctx.fillStyle = "#" + idol.color; // アイドルに対応する色を設定
      ctx.fillText(idol.name, xOffset, height / 2 + fontSize / 2);
      xOffset += ctx.measureText(idol.name).width + 20; // 名前の幅を考慮して位置を移動

      // 最後のアイドルでなければ、名前の後に黒色の '/' を描画
      if (index < idols.length - 1) {
        ctx.fillStyle = "#000000"; // 黒色で '/' を描画
        ctx.fillText(" / ", xOffset, height / 2 + fontSize / 2);
        xOffset += ctx.measureText(" / ").width + 20; // '/' の幅分だけ位置を移動
      }
    });

    // 現在のフレームの画像データを取得
    const imageData = ctx.getImageData(0, 0, width, height).data;

    // フレームを追加
    gif.addFrame(imageData);

    // メモリを解放するためにread()を呼び出す
    gif.read();
  }

  gif.finish();
  console.log("imas_today.gif が生成されました！");
}

// メイン処理
(async () => {
  try {
    const { idols } = await fetchIdolData();
    await createGIF(idols); // todayItemsCountを渡す
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
})();
