# Barcode.WASM (TypeScript + Vite)

**WebAssembly バーコード生成ライブラリ**

ブラウザだけで18種類のバーコードを生成できます。サーバー不要。

---

## 🚀 まずはこれを試してください

### Step 1: コードを理解する

```bash
cd Easy-8-Steps
npm install
npm run dev
```

ブラウザが開いたら、ボタンを押してバーコードが生成されることを確認してください。  
次に `src/main.ts` を見てください。**たった8ステップ**でBarcode.WASMの使い方がわかります。

### Step 2: 全機能を体験する

```bash
cd All-in-One
npm install
npm run dev
```

Barcode.WASMのすべての機能を体験できます。  
TypeScript + Vite で、これだけのバーコード機能を実現できます。  
18種類のバーコード、PNG/SVG出力、色・サイズ・テキストのカスタマイズ、PDF出力まで。

---

## 📁 フォルダ構成

```
barcode-demo/
├── Easy-8-Steps/        ← 使い方を理解する（動くドキュメント）
│   ├── src/
│   │   ├── wasm/        ← barcode.js, barcode.wasm
│   │   └── main.ts      ← メインコード
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── All-in-One/          ← 全機能を体験する（18種類のバーコード）
│   ├── src/
│   │   ├── wasm/
│   │   └── main.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── barcode.wasm.md      ← 詳細リファレンス
└── README.md            ← このファイル
```

---

## 🛠️ 必要な環境

| 項目 | バージョン |
|------|------------|
| Node.js | 16以降 |
| npm | 8以降 |

```bash
# バージョン確認
node -v
npm -v
```

---

## 📦 起動方法

### Easy-8-Steps（使い方を理解する）

```bash
cd Easy-8-Steps
npm install
npm run dev
```

### All-in-One（全機能を体験する）

```bash
cd All-in-One
npm install
npm run dev
```

ブラウザで `http://localhost:3000` が自動的に開きます。

---

## 🔲 対応バーコード（18種類）

### 1次元バーコード（15種類）

Code39, Code93, Code128, GS1-128, NW-7,  
Matrix 2of5, NEC 2of5, JAN-8, JAN-13, UPC-A, UPC-E,  
GS1 DataBar (標準/限定/拡張), 郵便カスタマバーコード

### 2次元バーコード（3種類）

QRコード, DataMatrix, PDF417

---

## 📖 ドキュメント

| ファイル | 内容 |
|----------|------|
| **Easy-8-Steps/** | 使い方の基本（動くドキュメント） |
| **All-in-One/** | 全18種類のバーコードを試せるデモ |
| **barcode.wasm.md** | 全API詳細リファレンス |

---

## 📦 npmパッケージ

```bash
npm install @pao-at-office/barcode-wasm
```

https://www.npmjs.com/package/@pao-at-office/barcode-wasm

---

## 📝 ライセンス

Barcode.WASM は有限会社パオ・アット・オフィスの製品です。

- **試用版**: 「SAMPLE」透かしが表示されます
- **製品版**: 透かしなし

---

**有限会社 パオ・アット・オフィス**  
https://www.pao.ac/barcode.wasm/