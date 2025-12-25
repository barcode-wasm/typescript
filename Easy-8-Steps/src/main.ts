// ============================================================
//  Barcode.WASM Easy-8-Steps (TypeScript版)
// ============================================================

// Step 1: モジュールのインポート
// @ts-ignore
import Module from './wasm/barcode.js';

// ============================================================
//  型定義
// ============================================================

/** 1次元バーコード共通インターフェース */
interface Barcode1D {
    setFitWidth(fit: boolean): void;
    setOutputFormat(format: string): void;
    setShowText(show: boolean): void;
    draw(data: string, width: number, height: number): string;
    delete(): void;
}

/** 2次元バーコード共通インターフェース */
interface Barcode2D {
    setFitWidth(fit: boolean): void;
    setOutputFormat(format: string): void;
    draw(data: string, size: number): string;
    delete(): void;
}

/** WASMモジュールのインターフェース */
interface BarcodeModule {
    // 1次元バーコード
    Code128: new () => Barcode1D;
    Code39: new () => Barcode1D;
    Code93: new () => Barcode1D;
    Jan13: new () => Barcode1D;
    Jan8: new () => Barcode1D;
    // 2次元バーコード
    QR: new () => Barcode2D;
    DataMatrix: new () => Barcode2D;
    // ... 他のバーコードクラス
}

// ============================================================
//  メイン処理
// ============================================================

let barcodeModule: BarcodeModule | null = null;

// DOM要素の取得
const resultElement = document.getElementById('result') as HTMLDivElement;
const btn1D = document.getElementById('btn1D') as HTMLButtonElement;
const btn2D = document.getElementById('btn2D') as HTMLButtonElement;

// Step 2: モジュールの初期化（非同期）
try {
    barcodeModule = await Module() as BarcodeModule;
    resultElement.textContent = '✅ 準備完了！ボタンをクリックしてください';
    console.log('✅ Barcode.WASM 初期化完了');
} catch (error) {
    resultElement.textContent = '❌ 初期化失敗: ' + (error as Error).message;
    console.error('❌ Barcode.WASM 初期化失敗:', error);
}

// 出力形式を取得
function getOutputFormat(): string {
    const radio = document.querySelector('input[name="format"]:checked') as HTMLInputElement;
    return radio.value;
}

// ============================================================
//  1次元バーコード生成（CODE128）
// ============================================================
function generate1D(): void {
    if (!barcodeModule) {
        alert('初期化されていません');
        return;
    }

    resultElement.innerHTML = '';
    const isSvg = getOutputFormat() === 'svg';

    // Step 3: バーコードインスタンス作成
    // ※ Code39 に変更する場合は、データも英大文字・数字に変更してください
    const barcode = new barcodeModule.Code128();

    // Step 4: 指定幅ぴったり調整（省略可）
    barcode.setFitWidth(true);

    // Step 5: 出力形式設定（省略可、デフォルトはPNG）
    if (isSvg) barcode.setOutputFormat('svg');

    // Step 6: バーコード生成
    const result: string = barcode.draw("Hello 12345", 400, 100);

    // Step 7: HTMLに表示
    if (isSvg) {
        resultElement.innerHTML = result;
    } else {
        resultElement.innerHTML = `<img src="${result}">`;
    }

    // Step 8: メモリ解放（重要！）
    barcode.delete();

    console.log('✅ 1次元バーコード生成完了');
}

// ============================================================
//  2次元バーコード生成（QRコード）
// ============================================================
function generate2D(): void {
    if (!barcodeModule) {
        alert('初期化されていません');
        return;
    }

    resultElement.innerHTML = '';
    const isSvg = getOutputFormat() === 'svg';

    // Step 3: バーコードインスタンス作成
    // ※ DataMatrix に変更可能
    const barcode = new barcodeModule.QR();

    // Step 4: 指定幅ぴったり調整（省略可）
    barcode.setFitWidth(true);

    // Step 5: 出力形式設定（省略可、デフォルトはPNG）
    if (isSvg) barcode.setOutputFormat('svg');

    // Step 6: バーコード生成（2次元は size のみ指定）
    const result: string = barcode.draw("https://www.pao.ac/", 200);

    // Step 7: HTMLに表示
    if (isSvg) {
        resultElement.innerHTML = result;
    } else {
        resultElement.innerHTML = `<img src="${result}">`;
    }

    // Step 8: メモリ解放（重要！）
    barcode.delete();

    console.log('✅ 2次元バーコード生成完了');
}

// ============================================================
//  イベントリスナー登録
// ============================================================
btn1D.addEventListener('click', generate1D);
btn2D.addEventListener('click', generate2D);