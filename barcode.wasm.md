# Barcode.wasm

## WebAssembly バーコード生成ライブラリ

### ユーザーズマニュアル

---

**バージョン 1.0**

**2026年1月**

---

**有限会社 パオ・アット・オフィス**

https://www.pao.ac/

---

<div style="page-break-after: always;"></div>

# 目次

1. [はじめに](#1-はじめに)
   - 1.1 [Barcode.wasmとは](#11-barcodewasmとは)
   - 1.2 [特長](#12-特長)
   - 1.3 [対応バーコード一覧](#13-対応バーコード一覧)

2. [できること](#2-できること)
   - 2.1 [PNG画像出力（Base64）](#21-png画像出力base64)
   - 2.2 [SVGベクター出力](#22-svgベクター出力)
   - 2.3 [カスタマイズ機能](#23-カスタマイズ機能)

3. [導入方法](#3-導入方法)
   - 3.1 [ダウンロード](#31-ダウンロード)
   - 3.2 [HTML + JavaScript での導入](#32-html--javascript-での導入)
   - 3.3 [TypeScript + Vite での導入](#33-typescript--vite-での導入)
   - 3.4 [npm パッケージでの導入](#34-npm-パッケージでの導入)

4. [クイックスタート](#4-クイックスタート)
   - 4.1 [JavaScript + PNG出力](#41-javascript--png出力)
   - 4.2 [JavaScript + SVG出力](#42-javascript--svg出力)
   - 4.3 [TypeScript + PNG出力](#43-typescript--png出力)
   - 4.4 [TypeScript + SVG出力](#44-typescript--svg出力)

5. [サンプルコード集](#5-サンプルコード集)
   - 5.1 [1次元バーコード](#51-1次元バーコード)
   - 5.2 [2次元バーコード](#52-2次元バーコード)
   - 5.3 [GS1系バーコード](#53-gs1系バーコード)
   - 5.4 [特殊バーコード](#54-特殊バーコード)

6. [APIリファレンス](#6-apiリファレンス)
   - 6.1 [共通メソッド（全バーコード）](#61-共通メソッド全バーコード)
   - 6.2 [1次元バーコード共通メソッド](#62-1次元バーコード共通メソッド)
   - 6.3 [Code39](#63-code39)
   - 6.4 [Code93](#64-code93)
   - 6.5 [Code128](#65-code128)
   - 6.6 [GS1-128](#66-gs1-128)
   - 6.7 [NW-7（Codabar）](#67-nw-7codabar)
   - 6.8 [Matrix 2of5](#68-matrix-2of5)
   - 6.9 [NEC 2of5](#69-nec-2of5)
   - 6.10 [JAN-8（EAN-8）](#610-jan-8ean-8)
   - 6.11 [JAN-13（EAN-13）](#611-jan-13ean-13)
   - 6.12 [UPC-A](#612-upc-a)
   - 6.13 [UPC-E](#613-upc-e)
   - 6.14 [GS1 DataBar 標準型](#614-gs1-databar-標準型)
   - 6.15 [GS1 DataBar 限定型](#615-gs1-databar-限定型)
   - 6.16 [GS1 DataBar 拡張型](#616-gs1-databar-拡張型)
   - 6.17 [郵便カスタマバーコード](#617-郵便カスタマバーコード)
   - 6.18 [QRコード](#618-qrコード)
   - 6.19 [DataMatrix](#619-datamatrix)
   - 6.20 [PDF417](#620-pdf417)

7. [動作環境](#7-動作環境)

8. [ライセンス・お問い合わせ](#8-ライセンスお問い合わせ)

---

<div style="page-break-after: always;"></div>

# 1. はじめに

## 1.1 Barcode.wasmとは

**Barcode.wasm** は、WebAssembly（WASM）で動作するバーコード生成ライブラリです。

C++で開発された高性能なバーコードエンジンをWebAssemblyにコンパイルすることで、**サーバーに依存せず、ブラウザ上だけでバーコードを生成**できます。

JavaScript / TypeScript から簡単に呼び出すことができ、生成したバーコードは **PNG画像（Base64）** または **SVGベクター** として出力できます。

## 1.2 特長

| 特長 | 説明 |
|------|------|
| 🌐 **ブラウザ完結** | サーバー通信不要。ブラウザだけでバーコード生成が完結します |
| ⚡ **高速描画** | C++からコンパイルされたWASMにより、ネイティブに近い高速描画を実現 |
| 🎨 **2種類の出力形式** | PNG画像（Base64）とSVGベクターの両方に対応 |
| 📝 **JavaScript / TypeScript対応** | どちらの環境でも利用可能。型定義ファイル付き |
| 📦 **npmパッケージ** | npm経由でのインストールに対応。Vite等のモダンな開発環境で利用可能 |
| 🔧 **豊富なカスタマイズ** | 色、サイズ、テキスト表示など細かく調整可能 |

## 1.3 対応バーコード一覧

### 1次元バーコード（15種類）

| バーコード | クラス名 | 用途・特徴 |
|------------|----------|------------|
| Code39 | `Code39` | 工業用途で広く使用。英数字対応 |
| Code93 | `Code93` | Code39の高密度版。ASCII全文字対応 |
| Code128 | `Code128` | 高密度。ASCII全文字対応。物流で多用 |
| GS1-128 | `GS1_128` | 物流・医療。AI（アプリケーション識別子）対応 |
| NW-7 (Codabar) | `NW7` | 宅配便、図書館で使用 |
| Matrix 2of5 | `Matrix2of5` | 工業用途 |
| NEC 2of5 | `NEC2of5` | 日本の工業用途 |
| JAN-8 (EAN-8) | `Jan8` | 小型商品用。8桁 |
| JAN-13 (EAN-13) | `Jan13` | 日本の商品コード。13桁 |
| UPC-A | `UPC_A` | 北米の商品コード。12桁 |
| UPC-E | `UPC_E` | UPC-Aの短縮版。小型商品用 |
| GS1 DataBar 標準型 | `GS1DataBar14` | 生鮮食品。Omni/Stacked対応 |
| GS1 DataBar 限定型 | `GS1DataBarLimited` | 小型商品。先頭0または1 |
| GS1 DataBar 拡張型 | `GS1DataBarExpanded` | 可変長データ対応 |
| 郵便カスタマバーコード | `YubinCustomer` | 日本郵便の住所バーコード |

### 2次元バーコード（3種類）

| バーコード | クラス名 | 用途・特徴 |
|------------|----------|------------|
| QRコード | `QR` | 最も普及。日本語対応。大容量 |
| DataMatrix | `DataMatrix` | 小型部品のマーキング。GS1対応 |
| PDF417 | `PDF417` | 運転免許証、航空券。大容量 |

---

<div style="page-break-after: always;"></div>

# 2. できること

## 2.1 PNG画像出力（Base64）

バーコードを **PNG形式のBase64文字列** として出力します。

生成された文字列は `<img>` タグの `src` 属性に直接設定できます。

```javascript
// PNG出力（デフォルト）
const barcode = new module.Code39();
barcode.setOutputFormat('png');  // 省略可（デフォルトはPNG）
const base64 = barcode.draw('HELLO', 300, 100);

// imgタグに直接設定
document.getElementById('barcode').src = base64;
// 結果: "data:image/png;base64,iVBORw0KGgo..."
```

**PNG出力の特徴：**
- ラスター形式（ピクセル単位）
- どのブラウザでも表示可能
- ファイルサイズは解像度に比例

## 2.2 SVGベクター出力

バーコードを **SVG形式の文字列** として出力します。

ベクター形式のため、**拡大しても劣化しません**。印刷用途に最適です。

```javascript
// SVG出力
const barcode = new module.Code39();
barcode.setOutputFormat('svg');  // SVGモードを指定
const svg = barcode.draw('HELLO', 300, 100);

// HTMLに直接挿入
document.getElementById('container').innerHTML = svg;
// 結果: "<svg xmlns="http://www.w3.org/2000/svg">...</svg>"
```

**SVG出力の特徴：**
- ベクター形式（拡大しても劣化なし）
- 印刷に最適
- CSSでスタイル変更可能
- ファイルサイズが小さい（シンプルなバーコードの場合）

## 2.3 カスタマイズ機能

### 色のカスタマイズ

```javascript
// 前景色（バーの色）
barcode.setForegroundColor(0, 0, 128, 255);  // 紺色

// 背景色
barcode.setBackgroundColor(255, 255, 240, 255);  // アイボリー
```

### テキスト表示のカスタマイズ

```javascript
// テキスト表示ON/OFF
barcode.setShowText(true);

// テキストサイズ倍率（1.0 = 標準）
barcode.setTextFontScale(1.5);

// バーコードとテキストの隙間（1.0 = 標準）
barcode.setTextGap(0.8);
```

### バー幅の微調整

```javascript
// 黒バー幅の調整（印刷時のにじみ補正）
barcode.setPxAdjustBlack(-1);  // 1ピクセル細く

// 白スペース幅の調整
barcode.setPxAdjustWhite(1);   // 1ピクセル広く
```

### 幅ぴったり描画

```javascript
// 指定幅にぴったり収める（小数ピクセル使用）
barcode.setFitWidth(true);
```

---

<div style="page-break-after: always;"></div>

# 3. 導入方法

## 3.1 ダウンロード

以下のURLからダウンロードできます：

**https://www.pao.ac/barcode.wasm/#download**

### ダウンロード内容

| パッケージ | 内容 | 用途 |
|------------|------|------|
| HTML単体版 | `barcode_wasm.html`, `barcode.js`, `barcode.wasm`, `README.md` | シンプルな導入。HTMLファイル1つで動作 |
| TypeScript + Vite版 | Viteプロジェクト一式 | モダンな開発環境向け |

### npmパッケージ

npmからもインストールできます：

```bash
npm install @pao-at-office/barcode-wasm
```

パッケージURL: https://www.npmjs.com/package/@pao-at-office/barcode-wasm

---

## 3.2 HTML + JavaScript での導入

最もシンプルな導入方法です。

### ファイル構成

```
my-project/
├── index.html
└── wasm/
    ├── barcode.js
    └── barcode.wasm
```

### index.html

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Barcode.wasm サンプル</title>
</head>
<body>
    <h1>バーコード生成</h1>
    <img id="barcode" alt="バーコード">

    <script type="module">
        // WASMモジュールをインポート
        import createBarcodeModule from './wasm/barcode.js';

        // モジュールを初期化
        const module = await createBarcodeModule({
            locateFile: (path) => {
                if (path.endsWith('.wasm')) {
                    return './wasm/barcode.wasm';
                }
                return path;
            }
        });

        // バーコード生成
        const barcode = new module.Code39();
        barcode.setShowText(true);
        const base64 = barcode.draw('HELLO123', 400, 100);
        document.getElementById('barcode').src = base64;
        
        // メモリ解放（重要！）
        barcode.delete();
    </script>
</body>
</html>
```

### ローカルでの実行方法

HTMLファイルを直接ブラウザで開くと、セキュリティ制限でWASMが読み込めません。
**ローカルサーバーを起動する必要があります。**

#### 方法1: VS Code + Live Server（推奨）

1. VS Codeで「Live Server」拡張機能をインストール
2. HTMLファイルを右クリック →「Open with Live Server」

#### 方法2: Python（Python 3がインストールされている場合）

```bash
# プロジェクトフォルダで実行
python -m http.server 8080

# ブラウザで http://localhost:8080 を開く
```

#### 方法3: Node.js（Node.jsがインストールされている場合）

```bash
# http-serverをインストール（初回のみ）
npm install -g http-server

# プロジェクトフォルダで実行
http-server -p 8080

# ブラウザで http://localhost:8080 を開く
```

---

## 3.3 TypeScript + Vite での導入

TypeScriptとViteを使ったモダンな開発環境での導入方法です。

### 1. プロジェクト作成

```bash
# Viteプロジェクトを作成
npm create vite@latest barcode-demo -- --template vanilla-ts

# プロジェクトに移動
cd barcode-demo

# 依存関係をインストール
npm install
```

### 2. WASMファイルの配置

```
barcode-demo/
├── src/
│   ├── wasm/
│   │   ├── barcode.js      ← ここに配置
│   │   └── barcode.wasm    ← ここに配置
│   └── main.ts
├── index.html
├── package.json
└── vite.config.ts
```

### 3. vite.config.ts の設定

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['./src/wasm/barcode.js']
  },
  assetsInclude: ['**/*.wasm']
})
```

### 4. main.ts の実装

```typescript
// WASMモジュールの型定義
interface BarcodeModule {
  Code39: new () => Code39;
  QR: new () => QR;
  // ... 他のバーコードクラス
}

interface Code39 {
  setShowText(show: boolean): void;
  setOutputFormat(format: string): void;
  draw(data: string, width: number, height: number): string;
  delete(): void;
}

// モジュール初期化
async function init(): Promise<void> {
  const Module = await import('./wasm/barcode.js');
  const module: BarcodeModule = await Module.default();

  // バーコード生成
  const barcode = new module.Code39();
  barcode.setShowText(true);
  barcode.setOutputFormat('png');
  
  const result = barcode.draw('HELLO123', 400, 100);
  
  const img = document.getElementById('barcode') as HTMLImageElement;
  img.src = result;
  
  barcode.delete();
}

document.addEventListener('DOMContentLoaded', init);
```

### 5. 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

---

## 3.4 npm パッケージでの導入

npmパッケージとして提供されているため、より簡単に導入できます。

### インストール

```bash
npm install @pao-at-office/barcode-wasm
```

### 使用方法

```typescript
import { initBarcodeModule } from '@pao-at-office/barcode-wasm';

async function generateBarcode(): Promise<void> {
  // モジュールを初期化
  const module = await initBarcodeModule({
    wasmPath: '/barcode.wasm'
  });

  // バーコード生成
  const barcode = new module.Code39();
  barcode.setShowText(true);
  const base64 = barcode.draw('HELLO123', 400, 100);
  
  document.getElementById('barcode').src = base64;
  
  // メモリ解放（必須）
  barcode.delete();
}
```

---

<div style="page-break-after: always;"></div>

# 4. クイックスタート

## 4.1 JavaScript + PNG出力

```html
<script type="module">
import createBarcodeModule from './wasm/barcode.js';

const module = await createBarcodeModule();

// Code39バーコードをPNG出力
const barcode = new module.Code39();
barcode.setShowText(true);
barcode.setOutputFormat('png');  // PNG出力（省略可）

const base64 = barcode.draw('HELLO123', 400, 100);
document.getElementById('barcode').src = base64;

barcode.delete();
</script>

<img id="barcode" alt="Code39">
```

**出力結果:**
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEU...
```

## 4.2 JavaScript + SVG出力

```html
<script type="module">
import createBarcodeModule from './wasm/barcode.js';

const module = await createBarcodeModule();

// Code39バーコードをSVG出力
const barcode = new module.Code39();
barcode.setShowText(true);
barcode.setOutputFormat('svg');  // SVG出力を指定

const svg = barcode.draw('HELLO123', 400, 100);

// SVGは直接HTMLに挿入
document.getElementById('container').innerHTML = svg;

// ダウンロード用にBlobを作成
const blob = new Blob([svg], { type: 'image/svg+xml' });
const url = URL.createObjectURL(blob);
document.getElementById('download').href = url;

barcode.delete();
</script>

<div id="container"></div>
<a id="download" download="barcode.svg">SVGをダウンロード</a>
```

**出力結果:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100">
  <rect x="0" y="0" width="400" height="100" fill="#ffffff"/>
  <rect x="10" y="5" width="2" height="70" fill="#000000"/>
  ...
</svg>
```

## 4.3 TypeScript + PNG出力

```typescript
// main.ts
interface BarcodeModule {
  Code39: new () => Barcode1D;
}

interface Barcode1D {
  setShowText(show: boolean): void;
  setOutputFormat(format: string): void;
  draw(data: string, width: number, height: number): string;
  delete(): void;
}

async function generatePNG(): Promise<void> {
  const Module = await import('./wasm/barcode.js');
  const module: BarcodeModule = await Module.default();

  const barcode = new module.Code39();
  barcode.setShowText(true);
  barcode.setOutputFormat('png');

  const base64: string = barcode.draw('HELLO123', 400, 100);
  
  const img = document.getElementById('barcode') as HTMLImageElement;
  img.src = base64;

  barcode.delete();
}

generatePNG();
```

## 4.4 TypeScript + SVG出力

```typescript
// main.ts
interface BarcodeModule {
  Code39: new () => Barcode1D;
}

interface Barcode1D {
  setShowText(show: boolean): void;
  setOutputFormat(format: string): void;
  draw(data: string, width: number, height: number): string;
  delete(): void;
}

async function generateSVG(): Promise<void> {
  const Module = await import('./wasm/barcode.js');
  const module: BarcodeModule = await Module.default();

  const barcode = new module.Code39();
  barcode.setShowText(true);
  barcode.setOutputFormat('svg');

  const svg: string = barcode.draw('HELLO123', 400, 100);
  
  // SVGをコンテナに挿入
  const container = document.getElementById('container') as HTMLDivElement;
  container.innerHTML = svg;

  // ダウンロードリンクを作成
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.getElementById('download') as HTMLAnchorElement;
  link.href = url;
  link.download = 'barcode.svg';

  barcode.delete();
}

generateSVG();
```

---

<div style="page-break-after: always;"></div>

# 5. サンプルコード集

## 5.1 1次元バーコード

### Code39

```javascript
const barcode = new module.Code39();
barcode.setShowText(true);
barcode.setShowStartStop(true);  // スタート/ストップコード表示
const result = barcode.draw('HELLO123', 400, 100);
barcode.delete();
```

**入力可能文字:** 数字（0-9）、英大文字（A-Z）、記号（- . $ / + % スペース）

### Code93

```javascript
const barcode = new module.Code93();
barcode.setShowText(true);
const result = barcode.draw('Hello123', 400, 100);
barcode.delete();
```

**入力可能文字:** ASCII全文字

### Code128

```javascript
const barcode = new module.Code128();
barcode.setShowText(true);
barcode.setCodeMode('AUTO');  // AUTO / A / B / C
const result = barcode.draw('Hello123', 400, 100);
barcode.delete();
```

**コードモード:**
| モード | 説明 |
|--------|------|
| AUTO | 自動選択（最短） |
| A | 制御文字 + 数字 + 英大文字 |
| B | 数字 + 英大文字 + 英小文字 + 記号 |
| C | 数字のみ（2桁ずつ高密度） |

**制御文字の入力:** `{CR}`, `{LF}`, `{TAB}` など

### NW-7 (Codabar)

```javascript
const barcode = new module.NW7();
barcode.setShowText(true);
barcode.setShowStartStop(true);
const result = barcode.draw('A1234567A', 400, 100);
barcode.delete();
```

**スタート/ストップコード:** A, B, C, D

## 5.2 2次元バーコード

### QRコード

```javascript
const qr = new module.QR();
qr.setStringEncoding('utf-8');     // 日本語対応
qr.setErrorCorrectionLevel('M');   // L/M/Q/H
qr.setVersion(0);                  // 0=自動
const result = qr.draw('https://www.pao.ac/', 300);
qr.delete();
```

**誤り訂正レベル:**
| レベル | 復元能力 | 用途 |
|--------|----------|------|
| L | 約7% | データ量優先 |
| M | 約15% | 標準（推奨） |
| Q | 約25% | 品質重視 |
| H | 約30% | 最高品質 |

### DataMatrix

```javascript
const dm = new module.DataMatrix();
dm.setStringEncoding('utf-8');
dm.setCodeSize('AUTO');       // AUTO / 10x10 / 12x12 / ... / 144x144
dm.setEncodeScheme('AUTO');   // AUTO / ASCII / C40 / TEXT / X12 / EDIFACT / BASE256
const result = dm.draw('Hello World', 200);
dm.delete();
```

### PDF417

```javascript
const pdf = new module.PDF417();
pdf.setStringEncoding('utf-8');
pdf.setErrorLevel(2);     // 0-8
pdf.setColumns(3);        // 列数
pdf.setRows(0);           // 0=自動
pdf.setAspectRatio(3.0);  // 縦横比
pdf.setYHeight(3);        // Y方向の高さ
const result = pdf.draw('Hello World 日本語', 400);
pdf.delete();
```

## 5.3 GS1系バーコード

### GS1-128

```javascript
const gs1 = new module.GS1_128();
gs1.setShowText(true);

// 通常描画（FNC1、AI括弧を手動指定）
const data = '{FNC1}0100012345678905{AI}10ABC123';
const result = gs1.draw(data, 500, 120);
gs1.delete();
```

**特殊文字:**
| 記法 | 意味 |
|------|------|
| `{FNC1}` | ファンクション1（可変長フィールドの区切り） |
| `{AI}` | AI括弧表示（括弧をバーコード下のテキストに表示） |

### 標準料金代理収納用コンビニバーコード

```javascript
const gs1 = new module.GS1_128();
gs1.setShowText(true);

// コンビニバーコード専用メソッド
const data = '{FNC1}9191234500000000000000452087500401310029500';
const result = gs1.drawConvenience(data, 500, 150);
gs1.delete();
```

### GS1 DataBar 標準型

```javascript
const db = new module.GS1DataBar14();
db.setShowText(true);

// シンボルタイプを選択
db.setSymbolType('OMNIDIRECTIONAL');  // 標準型
// db.setSymbolType('STACKED');        // 二層型
// db.setSymbolType('STACKED_OMNIDIRECTIONAL');  // 標準二層型

const result = db.draw('1234567890128', 200, 80);
db.delete();
```

### GS1 DataBar 拡張型

```javascript
const db = new module.GS1DataBarExpanded();
db.setShowText(true);

// 一層型
db.setSymbolType('UNSTACKED');
const result1 = db.draw('0100012345678905{AI}10ABC123', 400, 80);

// 多層型
db.setSymbolType('STACKED');
db.setNoOfColumns(4);  // セグメント数
const result2 = db.drawStacked('0100012345678905{AI}10ABC123', 300, 100);

db.delete();
```

## 5.4 特殊バーコード

### 郵便カスタマバーコード

```javascript
const yubin = new module.YubinCustomer();

// ※ 郵便カスタマは幅が自動計算されるため、高さのみ指定
const result = yubin.draw('27500263-29-2-401', 25);
yubin.delete();
```

**入力形式:** 郵便番号7桁 + 住所表示番号（ハイフン区切り可）

### JAN/EAN バーコード

```javascript
// JAN-13
const jan13 = new module.Jan13();
jan13.setShowText(true);
jan13.setExtendedGuard(true);  // ガードバー拡張
const result = jan13.draw('491234567890', 300, 100);
jan13.delete();

// JAN-8
const jan8 = new module.Jan8();
jan8.setShowText(true);
jan8.setExtendedGuard(true);
const result2 = jan8.draw('4901234', 200, 100);
jan8.delete();
```

**チェックディジット:** 自動計算されます

### UPC バーコード

```javascript
// UPC-A
const upcA = new module.UPC_A();
upcA.setShowText(true);
upcA.setExtendedGuard(true);
const result = upcA.draw('01234567890', 300, 100);
upcA.delete();

// UPC-E
const upcE = new module.UPC_E();
upcE.setShowText(true);
upcE.setExtendedGuard(true);
const result2 = upcE.draw('425261', 200, 100);
upcE.delete();
```

---

<div style="page-break-after: always;"></div>

# 6. APIリファレンス

## 6.1 共通メソッド（全バーコード）

全てのバーコードクラスで使用できるメソッドです。

### setOutputFormat(format)

出力形式を設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| format | string | `'png'` または `'svg'` |

```javascript
barcode.setOutputFormat('png');  // PNG出力（Base64）
barcode.setOutputFormat('svg');  // SVG出力
```

**戻り値:** なし

**備考:** 設定しない場合のデフォルトは `'png'` です。

---

### setForegroundColor(r, g, b, a)

前景色（バーの色）を設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| r | number | 赤成分（0-255） |
| g | number | 緑成分（0-255） |
| b | number | 青成分（0-255） |
| a | number | 透明度（0-255、255=不透明） |

```javascript
barcode.setForegroundColor(0, 0, 0, 255);      // 黒
barcode.setForegroundColor(0, 0, 128, 255);    // 紺色
barcode.setForegroundColor(255, 0, 0, 128);    // 半透明の赤
```

**戻り値:** なし

---

### setBackgroundColor(r, g, b, a)

背景色を設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| r | number | 赤成分（0-255） |
| g | number | 緑成分（0-255） |
| b | number | 青成分（0-255） |
| a | number | 透明度（0-255、255=不透明） |

```javascript
barcode.setBackgroundColor(255, 255, 255, 255);  // 白
barcode.setBackgroundColor(255, 255, 240, 255);  // アイボリー
barcode.setBackgroundColor(0, 0, 0, 0);          // 透明
```

**戻り値:** なし

---

### delete()

バーコードオブジェクトのメモリを解放します。

```javascript
const barcode = new module.Code39();
// ... バーコード生成処理 ...
barcode.delete();  // 必ず呼び出す
```

**戻り値:** なし

**⚠️ 重要:** WASMオブジェクトは自動的にガベージコレクションされません。使用後は必ず `delete()` を呼び出してメモリを解放してください。

---

## 6.2 1次元バーコード共通メソッド

1次元バーコードで共通して使用できるメソッドです。
（郵便カスタマバーコードを除く）

### draw(data, width, height)

バーコードを生成します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| data | string | バーコードにエンコードするデータ |
| width | number | 画像の幅（ピクセル） |
| height | number | 画像の高さ（ピクセル） |

```javascript
const result = barcode.draw('HELLO123', 400, 100);
```

**戻り値:** 
- PNG出力時: `data:image/png;base64,...` 形式の文字列
- SVG出力時: `<svg xmlns="...">...</svg>` 形式の文字列
- 失敗時: 空文字列 `""`

---

### setShowText(show)

バーコード下部にテキストを表示するかどうかを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| show | boolean | `true`: 表示, `false`: 非表示 |

```javascript
barcode.setShowText(true);   // テキスト表示
barcode.setShowText(false);  // テキスト非表示
```

**戻り値:** なし

**デフォルト:** `true`

---

### setTextFontScale(scale)

テキストのフォントサイズ倍率を設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| scale | number | 倍率（0.5〜3.0推奨） |

```javascript
barcode.setTextFontScale(1.0);  // 標準サイズ
barcode.setTextFontScale(1.5);  // 1.5倍
barcode.setTextFontScale(0.8);  // 0.8倍
```

**戻り値:** なし

**デフォルト:** `1.0`

---

### setTextGap(scale)

バーコードとテキストの間隔（隙間）を設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| scale | number | 倍率（0.0〜3.0推奨） |

```javascript
barcode.setTextGap(1.0);  // 標準の隙間
barcode.setTextGap(0.5);  // 狭い隙間
barcode.setTextGap(2.0);  // 広い隙間
```

**戻り値:** なし

**デフォルト:** `1.0`

---

### setFitWidth(fit)

指定した幅にぴったり収めるかどうかを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| fit | boolean | `true`: ぴったり収める, `false`: 整数ピクセルで描画 |

```javascript
barcode.setFitWidth(true);   // 小数ピクセルを使用して幅ぴったり
barcode.setFitWidth(false);  // 整数ピクセルのみ使用
```

**戻り値:** なし

**デフォルト:** `true`

**備考:** `true` の場合、バーの幅に小数ピクセルを使用して指定幅にぴったり収めます。`false` の場合、整数ピクセルのみ使用するため、指定幅より若干小さくなることがあります。

---

### setPxAdjustBlack(px)

黒バーの幅を調整します（印刷時のにじみ補正用）。

| パラメータ | 型 | 説明 |
|------------|------|------|
| px | number | 調整値（ピクセル、-10〜10推奨） |

```javascript
barcode.setPxAdjustBlack(0);   // 調整なし
barcode.setPxAdjustBlack(-1);  // 1ピクセル細く
barcode.setPxAdjustBlack(1);   // 1ピクセル太く
```

**戻り値:** なし

**デフォルト:** `0`

**備考:** 印刷時にインクがにじんで太くなる場合、負の値を設定して補正できます。

---

### setPxAdjustWhite(px)

白スペースの幅を調整します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| px | number | 調整値（ピクセル、-10〜10推奨） |

```javascript
barcode.setPxAdjustWhite(0);   // 調整なし
barcode.setPxAdjustWhite(1);   // 1ピクセル広く
barcode.setPxAdjustWhite(-1);  // 1ピクセル狭く
```

**戻り値:** なし

**デフォルト:** `0`

---

## 6.3 Code39

### クラス: `Code39`

工業用途で広く使用されるバーコードです。

### コンストラクタ

```javascript
const barcode = new module.Code39();
```

### 入力可能文字

- 数字: `0-9`
- 英大文字: `A-Z`
- 記号: `- . $ / + % スペース`

### 固有メソッド

#### setShowStartStop(show)

スタート/ストップコード（*）をテキストに表示するかどうかを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| show | boolean | `true`: 表示, `false`: 非表示 |

```javascript
barcode.setShowStartStop(true);   // *HELLO* と表示
barcode.setShowStartStop(false);  // HELLO と表示
```

**デフォルト:** `true`

### 使用例

```javascript
const barcode = new module.Code39();
barcode.setShowText(true);
barcode.setShowStartStop(true);
barcode.setOutputFormat('png');
const result = barcode.draw('HELLO123', 400, 100);
barcode.delete();
```

---

## 6.4 Code93

### クラス: `Code93`

Code39の高密度版です。ASCII全文字を表現できます。

### コンストラクタ

```javascript
const barcode = new module.Code93();
```

### 入力可能文字

- ASCII全文字（0x00〜0x7F）

### 固有メソッド

なし（共通メソッドのみ）

### 使用例

```javascript
const barcode = new module.Code93();
barcode.setShowText(true);
barcode.setOutputFormat('png');
const result = barcode.draw('Hello123!@#', 400, 100);
barcode.delete();
```

---

## 6.5 Code128

### クラス: `Code128`

高密度バーコードです。物流で広く使用されます。

### コンストラクタ

```javascript
const barcode = new module.Code128();
```

### 入力可能文字

- ASCII全文字（0x00〜0x7F）
- 制御文字は `{...}` 形式で入力

### 制御文字の入力

| 記法 | 意味 |
|------|------|
| `{NUL}` | NUL文字 |
| `{SOH}` | SOH文字 |
| `{CR}` | キャリッジリターン |
| `{LF}` | ラインフィード |
| `{TAB}` | タブ |
| `{FNC1}` | ファンクション1 |
| `{FNC2}` | ファンクション2 |
| `{FNC3}` | ファンクション3 |
| `{FNC4}` | ファンクション4 |

### 固有メソッド

#### setCodeMode(mode)

コードモードを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| mode | string | `'AUTO'`, `'A'`, `'B'`, `'C'` |

```javascript
barcode.setCodeMode('AUTO');  // 自動選択（最短）
barcode.setCodeMode('A');     // CODE-A
barcode.setCodeMode('B');     // CODE-B
barcode.setCodeMode('C');     // CODE-C（数字のみ、高密度）
```

| モード | 対応文字 |
|--------|----------|
| AUTO | 自動選択（最短になるよう最適化） |
| A | 制御文字 + 数字 + 英大文字 + 一部記号 |
| B | 数字 + 英大文字 + 英小文字 + 記号 |
| C | 数字のみ（2桁ずつエンコード、高密度） |

**デフォルト:** `'AUTO'`

### 使用例

```javascript
const barcode = new module.Code128();
barcode.setShowText(true);
barcode.setCodeMode('AUTO');
barcode.setOutputFormat('png');
const result = barcode.draw('Hello123', 400, 100);
barcode.delete();
```

---

## 6.6 GS1-128

### クラス: `GS1_128`

GS1標準に準拠したバーコードです。物流・医療分野で使用されます。

### コンストラクタ

```javascript
const barcode = new module.GS1_128();
```

### 入力形式

AI（アプリケーション識別子）とデータを組み合わせて入力します。

### 特殊文字

| 記法 | 意味 |
|------|------|
| `{FNC1}` | ファンクション1（可変長AIの区切り） |
| `{AI}` | AI括弧表示（テキスト表示時にAIを括弧で囲む） |

### 固有メソッド

#### draw(data, width, height)

通常のバーコードを生成します。（共通メソッドと同じ）

```javascript
const result = barcode.draw('{FNC1}0100012345678905{AI}10ABC123', 500, 120);
```

#### drawConvenience(data, width, height)

標準料金代理収納用コンビニバーコードを生成します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| data | string | コンビニバーコードデータ（{FNC1}で開始） |
| width | number | 画像の幅（ピクセル） |
| height | number | 画像の高さ（ピクセル） |

```javascript
const data = '{FNC1}9191234500000000000000452087500401310029500';
const result = barcode.drawConvenience(data, 500, 150);
```

**戻り値:** PNG Base64文字列 または SVG文字列

### 使用例

```javascript
// 通常のGS1-128
const gs1 = new module.GS1_128();
gs1.setShowText(true);
gs1.setOutputFormat('png');
const result1 = gs1.draw('{FNC1}0100012345678905{AI}10ABC123', 500, 120);
gs1.delete();

// コンビニバーコード
const gs1c = new module.GS1_128();
gs1c.setShowText(true);
gs1c.setOutputFormat('png');
const result2 = gs1c.drawConvenience(
  '{FNC1}9191234500000000000000452087500401310029500', 500, 150
);
gs1c.delete();
```

---

## 6.7 NW-7（Codabar）

### クラス: `NW7`

宅配便の送り状や図書館で使用されるバーコードです。

### コンストラクタ

```javascript
const barcode = new module.NW7();
```

### 入力可能文字

- 数字: `0-9`
- 記号: `- $ : / . +`
- スタート/ストップコード: `A`, `B`, `C`, `D`

### データ形式

先頭と末尾にスタート/ストップコード（A/B/C/D）を付けます。

```
A1234567A
B9876543B
```

### 固有メソッド

#### setShowStartStop(show)

スタート/ストップコードをテキストに表示するかどうかを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| show | boolean | `true`: 表示, `false`: 非表示 |

```javascript
barcode.setShowStartStop(true);   // A1234567A と表示
barcode.setShowStartStop(false);  // 1234567 と表示
```

**デフォルト:** `true`

### 使用例

```javascript
const barcode = new module.NW7();
barcode.setShowText(true);
barcode.setShowStartStop(true);
barcode.setOutputFormat('png');
const result = barcode.draw('A1234567A', 400, 100);
barcode.delete();
```

---

## 6.8 Matrix 2of5

### クラス: `Matrix2of5`

工業用途で使用されるバーコードです。

### コンストラクタ

```javascript
const barcode = new module.Matrix2of5();
```

### 入力可能文字

- 数字のみ: `0-9`

### 固有メソッド

なし（共通メソッドのみ）

### 使用例

```javascript
const barcode = new module.Matrix2of5();
barcode.setShowText(true);
barcode.setOutputFormat('png');
const result = barcode.draw('1234567890', 400, 100);
barcode.delete();
```

---

## 6.9 NEC 2of5

### クラス: `NEC2of5`

日本の工業用途で使用されるバーコードです。

### コンストラクタ

```javascript
const barcode = new module.NEC2of5();
```

### 入力可能文字

- 数字のみ: `0-9`

### 固有メソッド

なし（共通メソッドのみ）

### 使用例

```javascript
const barcode = new module.NEC2of5();
barcode.setShowText(true);
barcode.setOutputFormat('png');
const result = barcode.draw('1234567890', 400, 100);
barcode.delete();
```

---

## 6.10 JAN-8（EAN-8）

### クラス: `Jan8`

小型商品用の8桁バーコードです。

### コンストラクタ

```javascript
const barcode = new module.Jan8();
```

### 入力可能文字

- 数字のみ: `0-9`
- 7桁入力（チェックディジットは自動計算）

### 固有メソッド

#### setExtendedGuard(extend)

ガードバーを拡張するかどうかを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| extend | boolean | `true`: 拡張, `false`: 標準 |

```javascript
barcode.setExtendedGuard(true);   // ガードバー拡張
barcode.setExtendedGuard(false);  // 標準
```

**デフォルト:** `true`

### 使用例

```javascript
const barcode = new module.Jan8();
barcode.setShowText(true);
barcode.setExtendedGuard(true);
barcode.setOutputFormat('png');
const result = barcode.draw('4901234', 200, 100);  // 7桁入力
barcode.delete();
```

---

## 6.11 JAN-13（EAN-13）

### クラス: `Jan13`

日本の商品コード（13桁）です。

### コンストラクタ

```javascript
const barcode = new module.Jan13();
```

### 入力可能文字

- 数字のみ: `0-9`
- 12桁入力（チェックディジットは自動計算）

### 固有メソッド

#### setExtendedGuard(extend)

ガードバーを拡張するかどうかを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| extend | boolean | `true`: 拡張, `false`: 標準 |

**デフォルト:** `true`

### 使用例

```javascript
const barcode = new module.Jan13();
barcode.setShowText(true);
barcode.setExtendedGuard(true);
barcode.setOutputFormat('png');
const result = barcode.draw('491234567890', 300, 100);  // 12桁入力
barcode.delete();
```

---

## 6.12 UPC-A

### クラス: `UPC_A`

北米の商品コード（12桁）です。

### コンストラクタ

```javascript
const barcode = new module.UPC_A();
```

### 入力可能文字

- 数字のみ: `0-9`
- 11桁入力（チェックディジットは自動計算）

### 固有メソッド

#### setExtendedGuard(extend)

ガードバーを拡張するかどうかを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| extend | boolean | `true`: 拡張, `false`: 標準 |

**デフォルト:** `true`

### 使用例

```javascript
const barcode = new module.UPC_A();
barcode.setShowText(true);
barcode.setExtendedGuard(true);
barcode.setOutputFormat('png');
const result = barcode.draw('01234567890', 300, 100);  // 11桁入力
barcode.delete();
```

---

## 6.13 UPC-E

### クラス: `UPC_E`

UPC-Aの短縮版（8桁）です。小型商品用です。

### コンストラクタ

```javascript
const barcode = new module.UPC_E();
```

### 入力可能文字

- 数字のみ: `0-9`
- 6桁入力（チェックディジットは自動計算）

### 固有メソッド

#### setExtendedGuard(extend)

ガードバーを拡張するかどうかを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| extend | boolean | `true`: 拡張, `false`: 標準 |

**デフォルト:** `true`

### 使用例

```javascript
const barcode = new module.UPC_E();
barcode.setShowText(true);
barcode.setExtendedGuard(true);
barcode.setOutputFormat('png');
const result = barcode.draw('425261', 200, 100);  // 6桁入力
barcode.delete();
```

---

## 6.14 GS1 DataBar 標準型

### クラス: `GS1DataBar14`

生鮮食品などで使用されるコンパクトなバーコードです。

### コンストラクタ

```javascript
const barcode = new module.GS1DataBar14();
```

### 入力可能文字

- 数字のみ: `0-9`
- 8〜13桁入力（チェックディジットは自動計算）

### 固有メソッド

#### setSymbolType(type)

シンボルタイプを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| type | string | シンボルタイプ |

| 値 | 説明 |
|------|------|
| `'OMNIDIRECTIONAL'` | 標準型（Omni-directional） |
| `'STACKED'` | 二層型（Stacked） |
| `'STACKED_OMNIDIRECTIONAL'` | 標準二層型（Stacked Omni-directional） |

```javascript
barcode.setSymbolType('OMNIDIRECTIONAL');
barcode.setSymbolType('STACKED');
barcode.setSymbolType('STACKED_OMNIDIRECTIONAL');
```

**デフォルト:** `'OMNIDIRECTIONAL'`

#### getSymbolType()

現在のシンボルタイプを取得します。

| 戻り値 | 型 | 説明 |
|--------|------|------|
| (戻り値) | number | 0: Omni, 1: Stacked |

```javascript
const type = barcode.getSymbolType();
```

#### encode(data)

データをエンコードします。

| パラメータ | 型 | 説明 |
|------------|------|------|
| data | string | エンコードするデータ |

| 戻り値 | 型 | 説明 |
|--------|------|------|
| (戻り値) | boolean | 成功: true, 失敗: false |

```javascript
const success = barcode.encode('01234567890123');
```

#### calculateCheckDigit(data) [静的メソッド]

チェックディジットを計算します。クラスメソッドとして呼び出します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| data | string | 13桁のデータ |

| 戻り値 | 型 | 説明 |
|--------|------|------|
| (戻り値) | string | チェックディジットを含む14桁のデータ |

```javascript
const dataWithCheck = module.GS1DataBar14.calculateCheckDigit('0123456789012');
```

### 使用例

```javascript
const barcode = new module.GS1DataBar14();
barcode.setShowText(true);
barcode.setSymbolType('OMNIDIRECTIONAL');
barcode.setOutputFormat('png');
const result = barcode.draw('1234567890128', 200, 80);
barcode.delete();

// チェックディジット計算（静的メソッド）
const dataWithCheck = module.GS1DataBar14.calculateCheckDigit('0123456789012');
console.log(dataWithCheck);  // チェックディジット付きデータ
```

---

## 6.15 GS1 DataBar 限定型

### クラス: `GS1DataBarLimited`

先頭桁が0または1に限定されたコンパクトなバーコードです。

### コンストラクタ

```javascript
const barcode = new module.GS1DataBarLimited();
```

### 入力可能文字

- 数字のみ: `0-9`
- 8〜13桁入力
- **先頭桁は0または1のみ**

### 固有メソッド

なし（共通メソッドのみ）

### 使用例

```javascript
const barcode = new module.GS1DataBarLimited();
barcode.setShowText(true);
barcode.setOutputFormat('png');
const result = barcode.draw('0123456789012', 200, 60);  // 先頭0
barcode.delete();
```

---

## 6.16 GS1 DataBar 拡張型

### クラス: `GS1DataBarExpanded`

可変長データを格納できる拡張バーコードです。

### コンストラクタ

```javascript
const barcode = new module.GS1DataBarExpanded();
```

### 入力形式

AI（アプリケーション識別子）とデータを組み合わせて入力します。

### 特殊文字

| 記法 | 意味 |
|------|------|
| `{FNC1}` | ファンクション1（自動挿入されるため通常は不要） |
| `{AI}` | AI括弧表示（テキスト表示時にAIを括弧で囲む） |

### 固有メソッド

#### setSymbolType(type)

シンボルタイプを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| type | string | `'UNSTACKED'` または `'STACKED'` |

```javascript
barcode.setSymbolType('UNSTACKED');  // 一層型
barcode.setSymbolType('STACKED');    // 多層型
```

**デフォルト:** `'UNSTACKED'`

#### setNoOfColumns(columns)

多層型の場合のセグメント数（列数）を設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| columns | number | セグメント数（偶数を推奨） |

```javascript
barcode.setNoOfColumns(4);  // 4セグメント
```

**デフォルト:** `2`

#### drawStacked(data, width, height)

多層型バーコードを生成します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| data | string | エンコードするデータ |
| width | number | 画像の幅（ピクセル） |
| height | number | 画像の高さ（ピクセル） |

```javascript
barcode.setSymbolType('STACKED');
barcode.setNoOfColumns(4);
const result = barcode.drawStacked('0100012345678905{AI}10ABC123', 300, 100);
```

### 使用例

```javascript
// 一層型
const barcode1 = new module.GS1DataBarExpanded();
barcode1.setShowText(true);
barcode1.setSymbolType('UNSTACKED');
barcode1.setOutputFormat('png');
const result1 = barcode1.draw('0100012345678905{AI}10ABC123', 400, 80);
barcode1.delete();

// 多層型
const barcode2 = new module.GS1DataBarExpanded();
barcode2.setShowText(true);
barcode2.setSymbolType('STACKED');
barcode2.setNoOfColumns(4);
barcode2.setOutputFormat('png');
const result2 = barcode2.drawStacked('0100012345678905{AI}10ABC123', 300, 100);
barcode2.delete();
```

---

## 6.17 郵便カスタマバーコード

### クラス: `YubinCustomer`

日本郵便の住所バーコードです。

### コンストラクタ

```javascript
const barcode = new module.YubinCustomer();
```

### 入力形式

郵便番号（7桁）+ 住所表示番号

ハイフン区切りで入力できます。

```
27500263-29-2-401
```

### 固有メソッド

#### draw(data, height)

郵便カスタマバーコードを生成します。

**⚠️ 注意:** 他のバーコードと異なり、幅は自動計算されるため高さのみ指定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| data | string | 郵便番号 + 住所表示番号 |
| height | number | 画像の高さ（ピクセル） |

```javascript
const result = barcode.draw('27500263-29-2-401', 25);
```

**戻り値:** PNG Base64文字列 または SVG文字列

### 使用例

```javascript
const barcode = new module.YubinCustomer();
barcode.setOutputFormat('png');
const result = barcode.draw('27500263-29-2-401', 25);
barcode.delete();
```

**備考:** 
- `setShowText()`, `setFitWidth()`, `setTextFontScale()` などのテキスト関連メソッドは使用できません。
- `setForegroundColor()`, `setBackgroundColor()` は使用可能です。

---

## 6.18 QRコード

### クラス: `QR`

最も普及している2次元バーコードです。日本語にも対応しています。

### コンストラクタ

```javascript
const qr = new module.QR();
```

### 入力可能文字

- 数字
- 英数字
- 8ビットバイナリ
- 漢字（Shift-JIS）

### 固有メソッド

#### draw(data, size)

QRコードを生成します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| data | string | エンコードするデータ |
| size | number | 画像のサイズ（ピクセル、正方形） |

```javascript
const result = qr.draw('https://www.pao.ac/', 300);
```

**戻り値:** PNG Base64文字列 または SVG文字列

#### setStringEncoding(encoding)

文字エンコーディングを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| encoding | string | `'utf-8'` または `'shift-jis'` |

```javascript
qr.setStringEncoding('utf-8');     // UTF-8（推奨）
qr.setStringEncoding('shift-jis'); // Shift-JIS
```

**デフォルト:** `'utf-8'`

#### setErrorCorrectionLevel(level)

誤り訂正レベルを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| level | string | `'L'`, `'M'`, `'Q'`, `'H'` |

| レベル | 復元能力 | 用途 |
|--------|----------|------|
| L | 約7% | データ量優先 |
| M | 約15% | 標準（推奨） |
| Q | 約25% | 品質重視 |
| H | 約30% | 最高品質 |

```javascript
qr.setErrorCorrectionLevel('M');
```

**デフォルト:** `'M'`

#### setVersion(version)

QRコードのバージョン（サイズ）を設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| version | number | 0〜40（0=自動） |

```javascript
qr.setVersion(0);   // 自動（データに応じて最小バージョン）
qr.setVersion(10);  // バージョン10を強制
```

**デフォルト:** `0`（自動）

#### setEncodeMode(mode)

エンコードモードを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| mode | string | エンコードモード |

| 値 | 説明 |
|------|------|
| `'AUTO'` | 自動選択 |
| `'NUMERIC'` | 数字モード |
| `'ALPHANUMERIC'` | 英数字モード |
| `'BYTE'` | バイトモード |
| `'KANJI'` | 漢字モード |

```javascript
qr.setEncodeMode('AUTO');
```

**デフォルト:** `'AUTO'`

#### setFitWidth(fit)

指定サイズにフィットさせるかどうかを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| fit | boolean | true: フィットさせる, false: させない |

```javascript
qr.setFitWidth(true);
```

**デフォルト:** `false`

### 使用例

```javascript
const qr = new module.QR();
qr.setStringEncoding('utf-8');
qr.setErrorCorrectionLevel('M');
qr.setVersion(0);
qr.setFitWidth(true);
qr.setOutputFormat('svg');  // SVG出力
const result = qr.draw('https://www.pao.ac/ 日本語OK', 300);
qr.delete();
```

---

## 6.19 DataMatrix

### クラス: `DataMatrix`

小型部品のマーキングに使用される2次元バーコードです。GS1に対応しています。

### コンストラクタ

```javascript
const dm = new module.DataMatrix();
```

### 入力可能文字

- ASCII文字
- 8ビットバイナリ
- GS1データ（`{FNC1}` で開始）

### 固有メソッド

#### draw(data, size)

DataMatrixを生成します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| data | string | エンコードするデータ |
| size | number | 画像のサイズ（ピクセル、正方形） |

```javascript
const result = dm.draw('Hello World', 200);
```

#### setStringEncoding(encoding)

文字エンコーディングを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| encoding | string | `'utf-8'` または `'shift-jis'` |

**デフォルト:** `'utf-8'`

#### setCodeSize(size)

コードサイズを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| size | string | コードサイズ |

| 値 | 説明 |
|------|------|
| `'AUTO'` | 自動（データに応じて最小サイズ） |
| `'10x10'` | 10×10セル |
| `'12x12'` | 12×12セル |
| `'14x14'` | 14×14セル |
| ... | ... |
| `'144x144'` | 144×144セル |
| `'8x18'` | 8×18セル（矩形） |
| `'8x32'` | 8×32セル（矩形） |
| ... | ... |

```javascript
dm.setCodeSize('AUTO');
dm.setCodeSize('24x24');
```

**デフォルト:** `'AUTO'`

#### setEncodeScheme(scheme)

エンコードスキームを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| scheme | string | エンコードスキーム |

| 値 | 説明 |
|------|------|
| `'AUTO'` | 自動選択 |
| `'ASCII'` | ASCII |
| `'C40'` | C40（英数字） |
| `'TEXT'` | テキスト（小文字優先） |
| `'X12'` | X12（ANSI X12 EDI） |
| `'EDIFACT'` | EDIFACT |
| `'BASE256'` | Base256（バイナリ） |

```javascript
dm.setEncodeScheme('AUTO');
```

**デフォルト:** `'AUTO'`

#### setFitWidth(fit)

指定サイズにフィットさせるかどうかを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| fit | boolean | true: フィットさせる, false: させない |

```javascript
dm.setFitWidth(true);
```

**デフォルト:** `false`

### GS1-DataMatrix

GS1データを格納する場合は、データの先頭に `{FNC1}` を付けます。

```javascript
dm.draw('{FNC1}0100012345678905{FNC1}10ABC123', 200);
```

### 使用例

```javascript
const dm = new module.DataMatrix();
dm.setStringEncoding('utf-8');
dm.setCodeSize('AUTO');
dm.setEncodeScheme('AUTO');
dm.setFitWidth(true);
dm.setOutputFormat('svg');
const result = dm.draw('Hello World', 200);
dm.delete();

// GS1-DataMatrix
const gsdm = new module.DataMatrix();
gsdm.setOutputFormat('png');
const result2 = gsdm.draw('{FNC1}0100012345678905{FNC1}10ABC123', 200);
gsdm.delete();
```

---

## 6.20 PDF417

### クラス: `PDF417`

運転免許証や航空券で使用される大容量2次元バーコードです。

### コンストラクタ

```javascript
const pdf = new module.PDF417();
```

### 入力可能文字

- テキスト
- 数字
- バイナリデータ

### 固有メソッド

#### draw(data, width)

PDF417を生成します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| data | string | エンコードするデータ |
| width | number | 画像の幅（ピクセル） |

```javascript
const result = pdf.draw('Hello World 日本語', 400);
```

**備考:** 高さは自動計算されます。

#### setStringEncoding(encoding)

文字エンコーディングを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| encoding | string | `'utf-8'` または `'shift-jis'` |

**デフォルト:** `'utf-8'`

#### setErrorLevel(level)

誤り訂正レベルを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| level | number | 0〜8 |

| レベル | 訂正能力 |
|--------|----------|
| 0 | 最小 |
| 1 | 低 |
| 2 | 標準（推奨） |
| 3〜8 | 高〜最大 |

```javascript
pdf.setErrorLevel(2);
```

**デフォルト:** `2`

#### setColumns(columns)

列数を設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| columns | number | 1〜30（0=自動） |

```javascript
pdf.setColumns(0);  // 自動
pdf.setColumns(4);  // 4列
```

**デフォルト:** `0`（自動）

#### setRows(rows)

行数を設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| rows | number | 3〜90（0=自動） |

```javascript
pdf.setRows(0);   // 自動
pdf.setRows(10);  // 10行
```

**デフォルト:** `0`（自動）

#### setAspectRatio(ratio)

縦横比を設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| ratio | number | 縦横比（1.0〜10.0） |

```javascript
pdf.setAspectRatio(3.0);  // 横長
pdf.setAspectRatio(1.0);  // 正方形に近い
```

**デフォルト:** `3.0`

#### setYHeight(height)

Y方向（縦）の高さ係数を設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| height | number | 高さ係数（1〜10） |

```javascript
pdf.setYHeight(3);
```

**デフォルト:** `3`

#### setFitWidth(fit)

指定幅にフィットさせるかどうかを設定します。

| パラメータ | 型 | 説明 |
|------------|------|------|
| fit | boolean | true: フィットさせる, false: させない |

```javascript
pdf.setFitWidth(true);
```

**デフォルト:** `false`

### 使用例

```javascript
const pdf = new module.PDF417();
pdf.setStringEncoding('utf-8');
pdf.setErrorLevel(2);
pdf.setColumns(4);
pdf.setRows(0);
pdf.setAspectRatio(3.0);
pdf.setYHeight(3);
pdf.setFitWidth(true);
pdf.setOutputFormat('svg');
const result = pdf.draw('Hello World 日本語テスト', 400);
pdf.delete();
```

---

<div style="page-break-after: always;"></div>

# 7. 動作環境

## 対応ブラウザ

WebAssemblyに対応したモダンブラウザで動作します。

| ブラウザ | バージョン |
|----------|------------|
| Google Chrome | 57以降 |
| Mozilla Firefox | 53以降 |
| Safari | 11以降 |
| Microsoft Edge | 16以降 |
| Opera | 44以降 |

## 開発環境（TypeScript版）

| 項目 | 要件 |
|------|------|
| Node.js | 16以降 |
| npm | 8以降 |
| バンドラー | Vite, Webpack 等 |

## ファイルサイズ

| ファイル | サイズ（目安） |
|----------|----------------|
| barcode.wasm | 約1.5MB |
| barcode.js | 約50KB |

---

<div style="page-break-after: always;"></div>

# 8. ライセンス・お問い合わせ

## ライセンス

Barcode.wasm は有限会社パオ・アット・オフィスの製品です。

**試用版について:**
- 生成されるバーコードに「SAMPLE」の透かしが表示されます。
- 機能制限はありません。

**製品版について:**
- 透かしなしでバーコードを生成できます。
- ライセンスの詳細は弊社Webサイトをご確認ください。

## お問い合わせ

**有限会社 パオ・アット・オフィス**

- Webサイト: https://www.pao.ac/
- 製品ページ: https://www.pao.ac/barcode.wasm/
- メール: info@pao.ac

## 関連製品

- **Barcode.net** - .NET用バーコードライブラリ
- **Barcode.jar** - Java用バーコードライブラリ
- **Barcode.php** - PHP用バーコードライブラリ

---

**Barcode.wasm ユーザーズマニュアル**

**バージョン 1.0**

**© 2026 有限会社 パオ・アット・オフィス**

---