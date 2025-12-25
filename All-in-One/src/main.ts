/**
 * =============================================================================
 * Barcode.WASM デモアプリケーション
 * =============================================================================
 * 
 * このファイルは、Barcode.WASM ライブラリのデモ・サンプルプログラムです。
 * WebAssembly (WASM) を使用して、ブラウザ上で高速にバーコードを生成します。
 * 
 * 【対応バーコード】
 * - 1次元バーコード: CODE39, CODE93, CODE128, GS1-128, NW-7, JAN, UPC, GS1 DataBar等
 * - 2次元バーコード: QR, DataMatrix, PDF417
 * - 特殊バーコード: コンビニ標準料金代理収納用バーコード, コンビニバーコード
 * 
 * 【出力形式】
 * - PNG: ラスター画像形式
 * - SVG: ベクター画像形式（印刷・拡大に最適）
 * 
 * 【出力先】
 * - ブラウザ表示
 * - PDF出力（jsPDFを使用）
 * 
 * @version 1.0.0
 * @license MIT
 */

// =============================================================================
// PDF出力用ライブラリインポート
// =============================================================================

import { jsPDF } from 'jspdf';

// =============================================================================
// 型定義
// =============================================================================

/** RGB色を表すインターフェース */
interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/** バーコード種別ごとの設定（サンプルデータとヒント） */
interface BarcodeSettings {
  value: string;
  hint: string;
}

/**
 * WASMモジュールの型定義
 * 各バーコードクラスのコンストラクタを定義
 */
interface BarcodeWasmModule {
  // 1次元バーコード
  Code39: new () => any;
  Code93: new () => any;
  Code128: new () => any;
  GS1_128: new () => any;
  NW7: new () => any;
  Matrix2of5: new () => any;
  NEC2of5: new () => any;
  Jan8: new () => any;
  Jan13: new () => any;
  UPC_A: new () => any;
  UPC_E: new () => any;
  GS1DataBar14: new () => any;
  GS1DataBarLimited: new () => any;
  GS1DataBarExpanded: new () => any;
  YubinCustomer: new () => any;
  // 2次元バーコード
  QR: new () => any;
  DataMatrix: new () => any;
  PDF417: new () => any;
  [key: string]: any;
}

// =============================================================================
// グローバル変数
// =============================================================================

/** WASMモジュールのインスタンス（初期化後に設定） */
let barcodeModule: BarcodeWasmModule | null = null;

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * 16進数カラーコードをRGBに変換
 * 
 * @param hex - 16進数カラーコード（例: "#FF0000" または "FF0000"）
 * @returns RGBColorオブジェクト
 * 
 * @example
 * // 使用例
 * const color = hexToRgb("#FF5500");
 * // color = { r: 255, g: 85, b: 0 }
 */
function hexToRgb(hex: string): RGBColor {
  hex = hex.replace(/^#/, '');
  // 3文字形式を6文字形式に展開
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * デバッグログを画面とコンソールに出力
 * 
 * @param message - ログメッセージ
 * @param isError - エラーフラグ（trueの場合、赤色で表示）
 */
function addLog(message: string, isError: boolean = false): void {
  const logContent = document.getElementById('logContent');
  if (!logContent) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const color = isError ? '#e74c3c' : '#333';
  logContent.innerHTML += `<div style="color: ${color}; margin-bottom: 4px;">[${timestamp}] ${message}</div>`;
  logContent.scrollTop = logContent.scrollHeight;
  
  if (isError) {
    console.error(message);
  } else {
    console.log(message);
  }
}

/** 型安全なgetElementById */
function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

/** input要素のvalue取得ヘルパー */
function getInputValue(id: string): string {
  const el = getElement<HTMLInputElement>(id);
  return el?.value ?? '';
}

/** input要素から整数を取得 */
function getInputNumber(id: string): number {
  return parseInt(getInputValue(id)) || 0;
}

/** input要素から浮動小数点数を取得 */
function getInputFloat(id: string): number {
  return parseFloat(getInputValue(id)) || 0;
}

/** チェックボックスの状態を取得 */
function getCheckboxValue(id: string): boolean {
  const el = getElement<HTMLInputElement>(id);
  return el?.checked ?? false;
}

/** select要素の選択値を取得 */
function getSelectValue(id: string): string {
  const el = getElement<HTMLSelectElement>(id);
  return el?.value ?? '';
}

// =============================================================================
// PDF出力用グローバル変数とヘルパー関数
// =============================================================================

/** 最後に生成したPDFのBlobURL（ダウンロード用） */
let lastPdfBlobUrl: string | null = null;
/** PDFダウンロード時のファイル名 */
let lastPdfFilename: string = 'barcode.pdf';

/**
 * ピクセルからミリメートルへ変換（96dpi基準）
 * PDFは通常mm単位で指定するため、この変換が必要
 * 
 * @param px - ピクセル値
 * @returns ミリメートル値
 */
function pxToMm(px: number): number {
  return px * 25.4 / 96;
}

/**
 * PNG画像からPDFを生成（回転対応）
 * バーコードのPNG出力をPDFに埋め込む
 * 
 * @param base64Data - Base64エンコードされたPNG画像データ
 * @param widthPx - 画像の幅（ピクセル）
 * @param heightPx - 画像の高さ（ピクセル）
 * @param barcodeType - バーコード種別（ファイル名に使用）
 * @param rotateAngle - 回転角度（0, 90, 180, 270）
 * @returns PDFのBlobURL
 */
async function generatePdfFromPng(
  base64Data: string,
  widthPx: number,
  heightPx: number,
  barcodeType: string,
  rotateAngle: number = 0,
  xPosPx: number = 0,
  yPosPx: number = 0
): Promise<string> {
  // A4サイズでPDF作成
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // px → mm 変換
  const widthMm = pxToMm(widthPx);
  const heightMm = pxToMm(heightPx);
  
  // 回転時のサイズ計算（90°/270°では幅と高さが入れ替わる）
  const isRotated90or270 = (rotateAngle === 90 || rotateAngle === 270);
  const finalWidthMm = isRotated90or270 ? heightMm : widthMm;
  const finalHeightMm = isRotated90or270 ? widthMm : heightMm;
  
  // 配置位置（ピクセル→mm変換）
  const x = pxToMm(xPosPx);
  const y = pxToMm(yPosPx);

  if (rotateAngle !== 0) {
    // 回転が必要な場合：Canvas経由で回転処理
    const img = new Image();
    img.src = base64Data;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('画像の読み込みに失敗'));
    });
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D コンテキストを取得できません');
    
    // 回転後のサイズ
    if (isRotated90or270) {
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 左下を軸に時計回り回転
    ctx.save();
    if (rotateAngle === 90) {
      ctx.translate(img.height, 0);
      ctx.rotate(90 * Math.PI / 180);
    } else if (rotateAngle === 180) {
      ctx.translate(img.width, img.height);
      ctx.rotate(180 * Math.PI / 180);
    } else if (rotateAngle === 270) {
      ctx.translate(0, img.width);
      ctx.rotate(270 * Math.PI / 180);
    }
    ctx.drawImage(img, 0, 0);
    ctx.restore();
    
    const rotatedImage = canvas.toDataURL('image/png');
    pdf.addImage(rotatedImage, 'PNG', x, y, finalWidthMm, finalHeightMm);
  } else {
    // 回転なし：そのまま追加
    pdf.addImage(base64Data, 'PNG', x, y, widthMm, heightMm);
  }

  // BlobURLを生成
  const pdfBlobUrl = pdf.output('bloburl') as unknown as string;
  
  // ダウンロード用に保持
  lastPdfBlobUrl = pdfBlobUrl;
  lastPdfFilename = `barcode_${barcodeType}.pdf`;

  addLog(`PDF生成完了: ${finalWidthMm.toFixed(1)}mm x ${finalHeightMm.toFixed(1)}mm (回転: ${rotateAngle}°)`);
  
  return pdfBlobUrl;
}

/**
 * SVG画像からPDFを生成（回転対応）
 * ブラウザネイティブのImage要素を使用してSVG→Canvas→PNG変換後、PDFに追加
 * 
 * @param svgString - SVG文字列
 * @param widthPx - 画像の幅（ピクセル）
 * @param heightPx - 画像の高さ（ピクセル）
 * @param barcodeType - バーコード種別（ファイル名に使用）
 * @param rotateAngle - 回転角度（0, 90, 180, 270）
 * @returns PDFのBlobURL
 */
async function generatePdfFromSvg(
  svgString: string,
  widthPx: number,
  heightPx: number,
  barcodeType: string,
  rotateAngle: number = 0,
  xPosPx: number = 0,
  yPosPx: number = 0
): Promise<string> {
  // px → mm 変換
  const widthMm = pxToMm(widthPx);
  const heightMm = pxToMm(heightPx);
  
  // 回転時のサイズ計算（90°/270°では幅と高さが入れ替わる）
  const isRotated90or270 = (rotateAngle === 90 || rotateAngle === 270);
  const finalWidthMm = isRotated90or270 ? heightMm : widthMm;
  const finalHeightMm = isRotated90or270 ? widthMm : heightMm;
  
  // 配置位置（ピクセル→mm変換）
  const x = pxToMm(xPosPx);
  const y = pxToMm(yPosPx);

  // A4サイズでPDF作成（単位はmm）
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // SVGをBase64エンコードしてImage要素に読み込む
  const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + svgBase64;
  
  // 画像読み込みを待機
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(new Error('SVG画像の読み込みに失敗しました'));
  });

  // Canvas要素を作成
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas 2D コンテキストを取得できません');
  }

  // 回転後のサイズ設定
  if (isRotated90or270) {
    canvas.width = heightPx;
    canvas.height = widthPx;
  } else {
    canvas.width = widthPx;
    canvas.height = heightPx;
  }

  // 背景を白で塗りつぶし
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 回転処理（左下を軸に時計回り）
  ctx.save();
  if (rotateAngle === 90) {
    ctx.translate(heightPx, 0);
    ctx.rotate(90 * Math.PI / 180);
  } else if (rotateAngle === 180) {
    ctx.translate(widthPx, heightPx);
    ctx.rotate(180 * Math.PI / 180);
  } else if (rotateAngle === 270) {
    ctx.translate(0, widthPx);
    ctx.rotate(270 * Math.PI / 180);
  }
  ctx.drawImage(img, 0, 0, widthPx, heightPx);
  ctx.restore();

  // CanvasをPNG base64に変換
  const pngBase64 = canvas.toDataURL('image/png');

  // PNG画像をPDFに追加
  pdf.addImage(pngBase64, 'PNG', x, y, finalWidthMm, finalHeightMm);

  // BlobURLを生成
  const pdfBlobUrl = pdf.output('bloburl') as unknown as string;
  
  // ダウンロード用に保持
  lastPdfBlobUrl = pdfBlobUrl;
  lastPdfFilename = `barcode_${barcodeType}.pdf`;

  addLog(`PDF生成完了 (SVG→PNG→PDF): ${finalWidthMm.toFixed(1)}mm x ${finalHeightMm.toFixed(1)}mm (回転: ${rotateAngle}°)`);
  
  return pdfBlobUrl;
}

/**
 * PDFダウンロード処理
 * 最後に生成したPDFをダウンロードする
 */
function downloadPdf(): void {
  if (!lastPdfBlobUrl) {
    alert('ダウンロード可能なPDFがありません');
    return;
  }
  
  const a = document.createElement('a');
  a.href = lastPdfBlobUrl;
  a.download = lastPdfFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// =============================================================================
// バーコード設定
// 各バーコード種別のサンプルデータと入力ヒント
// =============================================================================

/**
 * 1次元バーコードのサンプルデータとヒント
 * バーコード種別選択時に自動的にサンプルデータが入力される
 */
const barcodeSettings: Record<string, BarcodeSettings> = {
  'Code39': {
    value: 'HELLO123',
    hint: '数字（0-9）、英字大文字（A-Z）、記号（- . スペース $ / + %）が使用可能です'
  },
  'Code93': {
    value: 'HELLO123',
    hint: 'ASCII文字全般が使用可能です（数字、英字大文字/小文字、記号）'
  },
  'Code128': {
    value: 'Hello123',
    hint: 'ASCII文字全般が使用可能です。制御文字は {CR}, {LF} 等の形式で入力できます'
  },
  'GS1_128': {
    value: '{FNC1}0100012345678905{AI}10ABC123',
    hint: 'GS1-128: 可変長フィールドの前に{FNC1}を入力。固定長AIで括弧表示が必要な場合は{AI}XXを使用'
  },
  'ConvenienceStore': {
    value: '{FNC1}9191234500000000000000452087500401310029500',
    hint: 'コンビニ標準料金代理収納用バーコード: 先頭に{FNC1}が必要。43桁の数字'
  },
  'NW7': {
    value: 'A1234567A',
    hint: '数字（0-9）、記号（- $ : / . +）が使用可能。スタート/ストップコードはA/B/C/Dから選択'
  },
  'Matrix2of5': {
    value: '1234567890',
    hint: '数字のみ（0-9）を入力してください'
  },
  'NEC2of5': {
    value: '1234567890',
    hint: '数字のみ（0-9）を入力してください'
  },
  'Jan8': {
    value: '4901234',
    hint: '7桁の数字を入力。8桁目のチェックディジットは自動計算'
  },
  'Jan13': {
    value: '491234567890',
    hint: '12桁の数字を入力。13桁目のチェックディジットは自動計算'
  },
  'UPC_A': {
    value: '01234567890',
    hint: 'UPC-A: 11桁または12桁の数字。11桁の場合チェックディジット自動付与'
  },
  'UPC_E': {
    value: '425261',
    hint: 'UPC-E: 6~7桁の数字。6桁の場合チェックディジット自動付与'
  },
  'GS1DataBar14': {
    value: '1234567890128',
    hint: 'GS1 DataBar 標準型: 8-13桁の数字。チェックディジット自動計算'
  },
  'GS1DataBarLimited': {
    value: '0123456789012',
    hint: 'GS1 DataBar 限定型: 8-13桁の数字。先頭桁は0または1のみ'
  },
  'GS1DataBarExpanded': {
    value: '0100012345678905{AI}10ABC123',
    hint: 'GS1 DataBar 拡張型: {AI}XXでAI括弧表示、{FNC1}は自動挿入'
  },
  'YubinCustomer': {
    value: '27500263-29-2-401',
    hint: '郵便カスタマバーコード: 郵便番号7桁 + 住所表示番号（ハイフン区切り可）'
  }
};

/**
 * 2次元バーコードのサンプルデータとヒント
 */
const barcode2DSettings: Record<string, BarcodeSettings> = {
  'QR': {
    value: 'HELLO WORLD 日本語',
    hint: 'QRコード: 数字、英数字、漢字、バイナリデータに対応'
  },
  'DataMatrix': {
    value: 'HELLO WORLD',
    hint: 'DataMatrix: ASCII文字が使用可能。GS1-DataMatrixの場合は{FNC1}でGS1モード'
  },
  'PDF417': {
    value: 'HELLO WORLD 日本語',
    hint: 'PDF417: テキスト、数字、バイナリデータに対応'
  }
};

// =============================================================================
// UI制御関数
// =============================================================================

/**
 * メインタブ切り替え
 * 1次元バーコード / 2次元バーコードの表示を切り替える
 * 
 * @param tab - タブ識別子 ('1d' または '2d')
 */
function switchMainTab(tab: string): void {
  // 全タブの非アクティブ化
  document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.main-tab-content').forEach(t => t.classList.remove('active'));
  
  // クリックされたタブをアクティブ化
  const clickedTab = event?.target as HTMLElement;
  clickedTab?.classList.add('active');
  
  // 対応するコンテンツを表示
  const content = document.getElementById(tab + '-content');
  content?.classList.add('active');
}

/**
 * 1次元バーコードのプロパティUI更新
 * バーコード種別に応じて、固有プロパティの入力フォームを動的に生成
 * 
 * 【WASMライブラリの使い方】
 * 各バーコードには共通プロパティと固有プロパティがあります：
 * 
 * - 共通プロパティ: setForegroundColor, setBackgroundColor, setFitWidth, setShowText等
 * - 固有プロパティ: バーコード種別によって異なる
 *   - Code39/NW7: setShowStartStop（スタート/ストップコード表示）
 *   - Code128: setCodeMode（コードモード A/B/C/AUTO）
 *   - JAN/UPC系: setExtendedGuard（ガードバー拡張）
 *   - GS1 DataBar: setSymbolType（シンボルタイプ）
 */
function update1DProps(): void {
  const type = getSelectValue('barcode1dType');
  const propsDiv = getElement<HTMLDivElement>('specificProps1d');
  const content = getElement<HTMLDivElement>('specificPropsContent1d');
  const dataInput = getElement<HTMLInputElement>('data1d');
  const hintDiv = getElement<HTMLDivElement>('barcodeHint');
  const widthInput = getElement<HTMLInputElement>('width1d');
  const heightInput = getElement<HTMLInputElement>('height1d');

  // サンプルデータとヒントを適用
  const setting = barcodeSettings[type];
  if (setting && dataInput) {
    dataInput.value = setting.value;
    if (hintDiv) {
      hintDiv.innerHTML = setting.hint;
    }
  }

  // 幅・高さデフォルト設定（バーコード種別による）
  if (type === 'ConvenienceStore') {
    if (widthInput) widthInput.value = '500';
    if (heightInput) heightInput.value = '150';
  } else if (type === 'YubinCustomer') {
    if (heightInput) heightInput.value = '25';
  } else {
    if (widthInput) widthInput.value = '400';
    if (heightInput) heightInput.value = '150';
  }

  // 固有プロパティのタイトルを動的に変更
  const propsTitle = getElement<HTMLHeadingElement>('specificPropsTitle1d');
  if (propsTitle) {
    const typeOption = document.querySelector(`#barcode1dType option[value="${type}"]`) as HTMLOptionElement;
    const typeName = typeOption?.textContent || type;
    propsTitle.textContent = `${typeName} の固有プロパティ`;
  }

  // 制御文字UIの表示制御（CODE128のみ）
  const controlCharUI = getElement<HTMLDivElement>('controlCharUI');
  if (controlCharUI) {
    controlCharUI.style.display = (type === 'Code128') ? 'block' : 'none';
  }

  // GS1入力補助UIの表示制御
  const gs1AssistUI = getElement<HTMLDivElement>('gs1AssistUI');
  const gs1Types = ['GS1_128', 'ConvenienceStore', 'GS1DataBar14', 'GS1DataBarLimited', 'GS1DataBarExpanded', 'YubinCustomer'];
  
  if (gs1AssistUI) {
    const showAssistUI = gs1Types.includes(type);
    gs1AssistUI.style.display = showAssistUI ? 'block' : 'none';
    
    // 全パターン選択を非表示にしてから、該当するものだけ表示
    gs1Types.forEach(t => {
      const select = getElement<HTMLSelectElement>(`gs1PatternSelect_${t}`);
      if (select) select.style.display = 'none';
    });
    
    if (showAssistUI) {
      const select = getElement<HTMLSelectElement>(`gs1PatternSelect_${type}`);
      if (select) select.style.display = 'block';
    }
  }

  // DataBar14タイプ選択UIの表示制御
  const grpTypeDatabar14 = getElement<HTMLDivElement>('grp_typeDatabar14');
  if (grpTypeDatabar14) {
    grpTypeDatabar14.style.display = (type === 'GS1DataBar14') ? 'block' : 'none';
  }

  // DataBarExpandedタイプ選択UIの表示制御
  const grpTypeDatabarExpanded = getElement<HTMLDivElement>('grp_typeDatabarExpanded');
  if (grpTypeDatabarExpanded) {
    grpTypeDatabarExpanded.style.display = (type === 'GS1DataBarExpanded') ? 'block' : 'none';
  }

  // 郵便カスタマバーコード選択時の特殊処理（一部UI非表示）
  const isYubinCustomer = (type === 'YubinCustomer');
  const grpWidth = getElement<HTMLDivElement>('grp_width1d');
  const grpFitWidth = getElement<HTMLDivElement>('grp_fitWidth1d');
  const grpShowText = getElement<HTMLDivElement>('grp_showText1d');
  const grpTextSettings = getElement<HTMLDivElement>('grp_textSettings1d');
  
  if (grpWidth) grpWidth.style.display = isYubinCustomer ? 'none' : '';
  if (grpFitWidth) grpFitWidth.style.display = isYubinCustomer ? 'none' : '';
  if (grpShowText) grpShowText.style.display = isYubinCustomer ? 'none' : '';
  if (grpTextSettings) grpTextSettings.style.display = isYubinCustomer ? 'none' : '';

  // 固有プロパティの表示（動的生成）
  if (!propsDiv || !content) return;
  propsDiv.style.display = 'none';
  content.innerHTML = '';

  // ========================================
  // Code39 / NW-7: スタート/ストップコード表示
  // ========================================
  // 【WASMメソッド】setShowStartStop(boolean)
  // true: スタート/ストップコードをテキストに表示
  // false: 表示しない
  if (type === 'Code39' || type === 'NW7') {
    propsDiv.style.display = 'block';
    content.innerHTML = `
      <div class="form-group">
        <div class="checkbox-group">
          <input type="checkbox" id="showStartStop1d" checked>
          <label for="showStartStop1d" style="margin: 0;">スタート/ストップコード表示</label>
        </div>
      </div>
    `;
  }

  // ========================================
  // Code128: コードモード選択
  // ========================================
  // 【WASMメソッド】setCodeMode(string)
  // 'AUTO': 自動選択（最短コード）
  // 'A': CODE-A（制御文字+大文字+数字）
  // 'B': CODE-B（大文字+小文字+数字+記号）
  // 'C': CODE-C（数字ペアのみ、最もコンパクト）
  if (type === 'Code128') {
    propsDiv.style.display = 'block';
    content.innerHTML = `
      <div class="form-group">
        <label for="codeMode1d">コードモード</label>
        <select id="codeMode1d">
          <option value="AUTO" selected>自動（最短）</option>
          <option value="A">CODE-A</option>
          <option value="B">CODE-B</option>
          <option value="C">CODE-C（数字のみ）</option>
        </select>
      </div>
    `;
  }

  // ========================================
  // JAN/UPC系: ガードバー拡張
  // ========================================
  // 【WASMメソッド】setExtendedGuard(boolean)
  // true: ガードバーを延長して標準JAN/UPC表示にする
  // false: ガードバー延長なし
  if (['Jan8', 'Jan13', 'UPC_A', 'UPC_E'].includes(type)) {
    propsDiv.style.display = 'block';
    content.innerHTML = `
      <div class="form-group">
        <div class="checkbox-group">
          <input type="checkbox" id="extendedGuard1d" checked>
          <label for="extendedGuard1d" style="margin: 0;">ガードバー拡張（標準JAN/UPC表示）</label>
        </div>
      </div>
    `;
  }
}

/**
 * 2次元バーコードのプロパティUI更新
 * バーコード種別に応じて、固有プロパティの入力フォームを動的に生成
 * 
 * 【WASMライブラリの使い方 - 2次元バーコード固有プロパティ】
 * 
 * ■ QRコード
 *   - setErrorCorrectionLevel('L'|'M'|'Q'|'H'): 誤り訂正レベル
 *   - setVersion(0-40): バージョン（0=自動）
 *   - setEncodeMode('NUMERIC'|'ALPHANUMERIC'|'BYTE'|'KANJI'): エンコードモード
 * 
 * ■ DataMatrix
 *   - setCodeSize('AUTO'|'10x10'|...|'144x144'|'8x18'|...): シンボルサイズ
 *   - setEncodeScheme('AUTO'|'ASCII'|'C40'|'TEXT'|'X12'|'EDIFACT'|'BASE256'): エンコードスキーム
 * 
 * ■ PDF417
 *   - setErrorLevel(-1～8): エラー訂正レベル（-1=自動）
 *   - setColumns(0-30): 列数（0=自動）
 *   - setRows(0-90): 行数（0=自動）
 *   - setAspectRatio(0.5-10.0): アスペクト比
 *   - setYHeight(1-10): Y方向の高さ係数
 */
function update2DProps(): void {
  const type = getSelectValue('barcode2dType');
  const dataInput = getElement<HTMLInputElement>('data2d');
  const hintDiv = getElement<HTMLDivElement>('barcodeHint2d');

  // サンプルデータとヒントを適用
  const setting = barcode2DSettings[type];
  if (setting && dataInput) {
    dataInput.value = setting.value;
    if (hintDiv) {
      hintDiv.innerHTML = setting.hint;
    }
  }

  // GS1-DataMatrix入力補助UI（DataMatrix選択時のみ表示）
  const gs1AssistUI2D = getElement<HTMLDivElement>('gs1AssistUI_2D');
  if (gs1AssistUI2D) {
    gs1AssistUI2D.style.display = (type === 'DataMatrix') ? 'block' : 'none';
  }

  const propsDiv = getElement<HTMLDivElement>('specificProps2d');
  const content = getElement<HTMLDivElement>('specificPropsContent2d');
  
  if (!propsDiv || !content) return;
  propsDiv.style.display = 'none';
  content.innerHTML = '';

  // ========================================
  // QRコード固有プロパティ
  // ========================================
  if (type === 'QR') {
    propsDiv.style.display = 'block';
    content.innerHTML = `
      <!-- 誤り訂正レベル & バージョン -->
      <div class="form-row double">
        <div class="form-group">
          <label for="qrErrorLevel">誤り訂正レベル</label>
          <select id="qrErrorLevel">
            <option value="L">L (7%) - 低</option>
            <option value="M" selected>M (15%) - 中</option>
            <option value="Q">Q (25%) - 準高</option>
            <option value="H">H (30%) - 高</option>
          </select>
          <small style="color: #666; font-size: 11px;">汚れや破損に対する復元能力</small>
        </div>
        <div class="form-group">
          <label for="qrVersion">バージョン</label>
          <select id="qrVersion">
            <option value="0" selected>自動</option>
            ${Array.from({length: 40}, (_, i) => `<option value="${i+1}">${i+1}</option>`).join('')}
          </select>
          <small style="color: #666; font-size: 11px;">1-40（大きいほど多くのデータを格納可能）</small>
        </div>
      </div>
      <!-- エンコードモード -->
      <div class="form-row single">
        <div class="form-group">
          <label for="qrEncodeMode">エンコードモード</label>
          <select id="qrEncodeMode">
            <option value="BYTE" selected>BYTE（バイナリ/UTF-8）</option>
            <option value="NUMERIC">NUMERIC（数字のみ）</option>
            <option value="ALPHANUMERIC">ALPHANUMERIC（英数字大文字）</option>
            <option value="KANJI">KANJI（漢字/Shift-JIS）</option>
          </select>
          <small style="color: #666; font-size: 11px;">データ種別に応じた最適なエンコード方式</small>
        </div>
      </div>
    `;
  }

  // ========================================
  // DataMatrix固有プロパティ
  // ========================================
  if (type === 'DataMatrix') {
    propsDiv.style.display = 'block';
    content.innerHTML = `
      <!-- シンボルサイズ -->
      <div class="form-row single">
        <div class="form-group">
          <label for="dmCodeSize">シンボルサイズ</label>
          <select id="dmCodeSize">
            <option value="AUTO" selected>自動</option>
            <optgroup label="正方形">
              <option value="10x10">10x10</option>
              <option value="12x12">12x12</option>
              <option value="14x14">14x14</option>
              <option value="16x16">16x16</option>
              <option value="18x18">18x18</option>
              <option value="20x20">20x20</option>
              <option value="22x22">22x22</option>
              <option value="24x24">24x24</option>
              <option value="26x26">26x26</option>
              <option value="32x32">32x32</option>
              <option value="36x36">36x36</option>
              <option value="40x40">40x40</option>
              <option value="44x44">44x44</option>
              <option value="48x48">48x48</option>
              <option value="52x52">52x52</option>
              <option value="64x64">64x64</option>
              <option value="72x72">72x72</option>
              <option value="80x80">80x80</option>
              <option value="88x88">88x88</option>
              <option value="96x96">96x96</option>
              <option value="104x104">104x104</option>
              <option value="120x120">120x120</option>
              <option value="132x132">132x132</option>
              <option value="144x144">144x144</option>
            </optgroup>
            <optgroup label="矩形（横長）">
              <option value="8x18">8x18</option>
              <option value="8x32">8x32</option>
              <option value="12x26">12x26</option>
              <option value="12x36">12x36</option>
              <option value="16x36">16x36</option>
              <option value="16x48">16x48</option>
            </optgroup>
          </select>
          <small style="color: #666; font-size: 11px;">データ量に応じて自動選択、または固定サイズを指定</small>
        </div>
      </div>
      <!-- エンコードスキーム -->
      <div class="form-row single">
        <div class="form-group">
          <label for="dmEncodeScheme">エンコードスキーム</label>
          <select id="dmEncodeScheme">
            <option value="AUTO" selected>自動</option>
            <option value="ASCII">ASCII（基本）</option>
            <option value="C40">C40（英数字大文字最適化）</option>
            <option value="TEXT">TEXT（英数字小文字最適化）</option>
            <option value="X12">X12（ANSI X12 EDI）</option>
            <option value="EDIFACT">EDIFACT（国際EDI）</option>
            <option value="BASE256">BASE256（バイナリ）</option>
          </select>
          <small style="color: #666; font-size: 11px;">データ種別に応じた圧縮方式（通常は自動推奨）</small>
        </div>
      </div>
    `;
  }

  // ========================================
  // PDF417固有プロパティ
  // ========================================
  if (type === 'PDF417') {
    propsDiv.style.display = 'block';
    content.innerHTML = `
      <!-- エラー訂正レベル & 列数 -->
      <div class="form-row double">
        <div class="form-group">
          <label for="pdf417ErrorLevel">エラー訂正レベル</label>
          <select id="pdf417ErrorLevel">
            <option value="-1" selected>自動</option>
            <option value="0">0 (最小)</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8 (最大)</option>
          </select>
          <small style="color: #666; font-size: 11px;">0-8（大きいほど復元能力が高い）</small>
        </div>
        <div class="form-group">
          <label for="pdf417Columns">列数</label>
          <input type="number" id="pdf417Columns" value="0" min="0" max="30">
          <small style="color: #666; font-size: 11px;">0=自動、1-30（データ列の数）</small>
        </div>
      </div>
      <!-- 行数 & アスペクト比 -->
      <div class="form-row double">
        <div class="form-group">
          <label for="pdf417Rows">行数</label>
          <input type="number" id="pdf417Rows" value="0" min="0" max="90">
          <small style="color: #666; font-size: 11px;">0=自動、3-90</small>
        </div>
        <div class="form-group">
          <label for="pdf417AspectRatio">アスペクト比</label>
          <input type="number" id="pdf417AspectRatio" value="0.5" min="0.1" max="5.0" step="0.1">
          <small style="color: #666; font-size: 11px;">0.1-5.0（幅/高さの比率）</small>
        </div>
      </div>
      <!-- Y方向高さ -->
      <div class="form-row single">
        <div class="form-group">
          <label for="pdf417YHeight">Y方向高さ係数</label>
          <input type="number" id="pdf417YHeight" value="3" min="1" max="10">
          <small style="color: #666; font-size: 11px;">1-10（行の高さ倍率）</small>
        </div>
      </div>
    `;
  }
}

/**
 * 制御文字挿入（CODE128用）
 * セレクトボックスで選択した制御文字を、データ入力欄のカーソル位置に挿入
 */
function insertControlChar(): void {
  const select = getElement<HTMLSelectElement>('controlCharSelect');
  const dataInput = getElement<HTMLInputElement>('data1d');
  
  if (!select || !dataInput || !select.value) return;
  
  const cursorPos = dataInput.selectionStart || 0;
  const textBefore = dataInput.value.substring(0, cursorPos);
  const textAfter = dataInput.value.substring(cursorPos);
  
  dataInput.value = textBefore + select.value + textAfter;
  
  const newPos = cursorPos + select.value.length;
  dataInput.setSelectionRange(newPos, newPos);
  dataInput.focus();
  select.value = '';
}

/**
 * GS1パターン適用（1次元バーコード用）
 * セレクトボックスで選択したGS1パターンをデータ入力欄に設定
 */
function applyGS1Pattern(): void {
  const type = getSelectValue('barcode1dType');
  const select = getElement<HTMLSelectElement>(`gs1PatternSelect_${type}`);
  const dataInput = getElement<HTMLInputElement>('data1d');
  
  if (!select || !dataInput || !select.value) return;
  
  dataInput.value = select.value;
  select.value = '';
}

/**
 * GS1パターン適用（2次元バーコード用 - DataMatrix）
 */
function applyGS1Pattern2D(): void {
  const select = getElement<HTMLSelectElement>('gs1PatternSelect_DataMatrix');
  const dataInput = getElement<HTMLInputElement>('data2d');
  
  if (!select || !dataInput || !select.value) return;
  
  dataInput.value = select.value;
  select.value = '';
}

// =============================================================================
// バーコード生成関数
// =============================================================================

/**
 * 1次元バーコード生成
 * 
 * 【WASMライブラリの基本的な使い方】
 * 
 * ```typescript
 * // 1. バーコードインスタンスを作成
 * const barcode = new barcodeModule.Code128();
 * 
 * // 2. 共通プロパティを設定
 * barcode.setOutputFormat('png');  // 'png' または 'svg'
 * barcode.setForegroundColor(0, 0, 0, 255);  // r, g, b, a
 * barcode.setBackgroundColor(255, 255, 255, 255);
 * barcode.setFitWidth(true);  // 幅ぴったり描画
 * barcode.setShowText(true);  // テキスト表示
 * 
 * // 3. 固有プロパティを設定（バーコード種別による）
 * barcode.setCodeMode('AUTO');  // Code128の場合
 * 
 * // 4. バーコードを生成
 * const result = barcode.draw(data, width, height);
 * // resultにはBase64エンコードされたPNG、またはSVG文字列が返る
 * 
 * // 5. リソース解放（重要！）
 * barcode.delete();
 * ```
 */
async function generate1D(): Promise<void> {
  const debugLog = getElement<HTMLDivElement>('debugLog');
  const logContent = getElement<HTMLDivElement>('logContent');
  const resultDiv = getElement<HTMLDivElement>('result');
  
  // デバッグログを表示
  if (debugLog) debugLog.style.display = 'block';
  if (logContent) logContent.innerHTML = '';
  
  addLog('=== 1次元バーコード生成開始 ===');
  
  const type = getSelectValue('barcode1dType');
  
  // WASMモジュールのチェック
  if (!barcodeModule) {
    addLog('❌ WASMモジュールが読み込まれていません', true);
    if (resultDiv) {
      resultDiv.innerHTML = '<p class="error">WASMモジュールがまだ読み込まれていません</p>';
    }
    return;
  }

  const data = getInputValue('data1d');
  const width = getInputNumber('width1d');
  const height = getInputNumber('height1d');
  
  // XY座標・回転パラメータの取得
  const xPos = getInputNumber('x1d') || 0;
  const yPos = getInputNumber('y1d') || 0;
  const rotateAngle = getInputNumber('rotateAngle1d') || 0;

  if (!data) {
    addLog('❌ データが空です', true);
    alert('バーコードデータを入力してください');
    return;
  }

  if (resultDiv) {
    resultDiv.innerHTML = '<p class="loading">生成中...</p>';
  }

  try {
    // 特殊バーコード種別の判定
    const isConvenienceStore = (type === 'ConvenienceStore');
    const isYubinCustomer = (type === 'YubinCustomer');
    const isGS1DataBar14 = (type === 'GS1DataBar14');
    const isGS1DataBarLimited = (type === 'GS1DataBarLimited');
    const isGS1DataBarExpanded = (type === 'GS1DataBarExpanded');
    
    // コンビニバーコードはGS1-128として生成
    const wasmType = isConvenienceStore ? 'GS1_128' : type;
    
    // ========================================
    // Step 1: バーコードインスタンス作成
    // ========================================
    const barcode = new barcodeModule[wasmType]();

    // ========================================
    // Step 2: 共通プロパティ設定
    // ========================================
    
    // 色設定
    const foreColor = hexToRgb(getInputValue('foreColor1d'));
    const backColor = hexToRgb(getInputValue('backColor1d'));
    
    // 出力形式設定（PNG/SVG）
    const outputFormat = (document.querySelector('input[name="outputFormat"]:checked') as HTMLInputElement)?.value || 'png';
    if (typeof barcode.setOutputFormat === 'function') {
      barcode.setOutputFormat(outputFormat);
      addLog(`出力形式: ${outputFormat.toUpperCase()}`);
    } else {
      addLog('⚠️ setOutputFormat未実装 - WASMを再ビルドしてください');
    }
    
    // 前景色・背景色（RGBA）
    barcode.setForegroundColor(foreColor.r, foreColor.g, foreColor.b, 255);
    barcode.setBackgroundColor(backColor.r, backColor.g, backColor.b, 255);
    
    // 黒バー・白スペース調整
    const pxAdjustBlack = getInputNumber('pxAdjustBlack1d');
    const pxAdjustWhite = getInputNumber('pxAdjustWhite1d');
    barcode.setPxAdjustBlack(pxAdjustBlack);
    barcode.setPxAdjustWhite(pxAdjustWhite);
    
    // 郵便カスタマ以外はテキスト表示設定をサポート
    if (!isYubinCustomer) {
      barcode.setFitWidth(getCheckboxValue('fitWidth1d'));
      barcode.setShowText(getCheckboxValue('showText1d'));
      barcode.setTextFontScale(getInputFloat('textFontScale1d'));
      // テキスト隙間調整
      if (typeof barcode.setTextGap === 'function') {
        barcode.setTextGap(getInputFloat('textGap1d'));
      }
    }

    // ========================================
    // Step 3: 固有プロパティ設定
    // ========================================
    
    // Code39 / NW-7: スタート/ストップコード表示
    if (type === 'Code39' || type === 'NW7') {
      barcode.setShowStartStop(getCheckboxValue('showStartStop1d'));
      addLog(`スタート/ストップコード表示: ${getCheckboxValue('showStartStop1d')}`);
    }

    // Code128: コードモード
    if (type === 'Code128') {
      const codeMode = getSelectValue('codeMode1d');
      if (codeMode) {
        barcode.setCodeMode(codeMode);
        addLog(`コードモード: ${codeMode}`);
      }
    }

    // JAN/UPC系: ガードバー拡張
    if (['Jan8', 'Jan13', 'UPC_A', 'UPC_E'].includes(type)) {
      barcode.setExtendedGuard(getCheckboxValue('extendedGuard1d'));
      addLog(`ガードバー拡張: ${getCheckboxValue('extendedGuard1d')}`);
    }

    // GS1 DataBar 標準型: シンボルタイプ
    if (isGS1DataBar14) {
      const symbolType = getSelectValue('typeDatabar14');
      barcode.setSymbolType(symbolType);
      addLog(`シンボルタイプ: ${symbolType}`);
    }

    // GS1 DataBar 拡張型: シンボルタイプ & 列数
    if (isGS1DataBarExpanded) {
      const symbolType = getSelectValue('typeDatabarExpanded');
      barcode.setSymbolType(symbolType);
      addLog(`シンボルタイプ: ${symbolType}`);
      if (symbolType === 'STACKED') {
        barcode.setNoOfColumns(2);
        addLog('列数: 2');
      }
    }

    // ========================================
    // Step 4: バーコード生成
    // ========================================
    let result: string;
    if (isConvenienceStore) {
      // コンビニバーコード専用メソッド
      result = barcode.drawConvenience(data, width, height);
    } else if (isYubinCustomer) {
      // 郵便カスタマは高さのみ指定
      result = barcode.draw(data, height);
    } else if (isGS1DataBarExpanded && getSelectValue('typeDatabarExpanded') === 'STACKED') {
      // DataBar拡張型スタックは専用メソッド
      result = barcode.drawStacked(data, width, height);
    } else {
      // 通常の描画
      result = barcode.draw(data, width, height);
    }

    // 生成失敗チェック - getLastError()でエラー詳細を取得
    if (!result || result.length === 0) {
      // エラーメッセージを取得（WASMにメソッドがある場合）
      let errorDetail = 'バーコードの生成に失敗しました';
      if (typeof barcode.getLastError === 'function') {
        const lastError = barcode.getLastError();
        if (lastError && lastError.length > 0) {
          errorDetail = lastError;
        }
      }
      
      addLog(`❌ 生成失敗: ${errorDetail}`, true);
      if (resultDiv) {
        resultDiv.innerHTML = `<p class="error" style="white-space: pre-line;">${errorDetail}</p>`;
      }
      barcode.delete();
      return;
    }

    // ========================================
    // Step 5: 結果表示
    // ========================================
    const outputMode = (document.querySelector('input[name="outputMode1d"]:checked') as HTMLInputElement)?.value || 'browser';
    addLog(`出力先: ${outputMode === 'pdf' ? 'PDF' : 'ブラウザ'}`);
    addLog(`X座標: ${xPos}, Y座標: ${yPos}, 回転角度: ${rotateAngle}°`);

    if (resultDiv) {
      if (outputMode === 'pdf') {
        // === PDF出力モード（統一レイアウト）===
        let pdfBlobUrl: string;
        
        if (outputFormat === 'svg') {
          pdfBlobUrl = await generatePdfFromSvg(result, width, height, type, rotateAngle, xPos, yPos);
        } else {
          pdfBlobUrl = await generatePdfFromPng(result, width, height, type, rotateAngle, xPos, yPos);
        }
        
        const formatLabel = outputFormat === 'svg' ? 'SVGベクター' : 'PNG画像';
        
        resultDiv.innerHTML = `
          <div class="toolbar">
            <span class="format-label" style="color: #9c27b0;">📄 PDF出力（${formatLabel}埋め込み）</span>
            <span class="info-text">サイズ: ${width}x${height}px | 位置: (${xPos}, ${yPos}) | 回転: ${rotateAngle}°</span>
          </div>
          <iframe src="${pdfBlobUrl}" title="Generated PDF"></iframe>
          <div class="action-bar">
            <a href="${pdfBlobUrl}" download="barcode_${type}.pdf" class="action-btn download">💾 ダウンロード</a>
            <button class="action-btn open-tab" onclick="window.open('${pdfBlobUrl}', '_blank')">🔗 別タブで開く</button>
          </div>
        `;
      } else {
        // === ブラウザ表示モード（統一レイアウト）===
        const rotateStyle = rotateAngle !== 0 ? `transform: rotate(${rotateAngle}deg);` : '';
        const formatLabel = outputFormat === 'svg' ? '✅ SVGベクター画像' : '📷 PNG画像';
        const formatClass = outputFormat === 'svg' ? 'svg' : 'png';
        const fileExt = outputFormat === 'svg' ? 'svg' : 'png';
        
        let downloadUrl = result;
        if (outputFormat === 'svg') {
          const svgBlob = new Blob([result], { type: 'image/svg+xml' });
          downloadUrl = URL.createObjectURL(svgBlob);
        }
        
        const contentHtml = outputFormat === 'svg' 
          ? result 
          : `<img src="${result}" alt="生成されたバーコード" style="image-rendering: pixelated;">`;
        
        resultDiv.innerHTML = `
          <div class="toolbar">
            <span class="format-label ${formatClass}">${formatLabel}</span>
            <span class="info-text">サイズ: ${width}x${height}px | 位置: (${xPos}, ${yPos}) | 回転: ${rotateAngle}°</span>
          </div>
          <div class="canvas-container">
            <div class="canvas-inner">
              <div class="barcode-element" style="left:${xPos}px; top:${yPos}px; ${rotateStyle}">
                ${contentHtml}
              </div>
            </div>
          </div>
          <div class="action-bar">
            <a href="${downloadUrl}" download="barcode_${type}.${fileExt}" class="action-btn download">💾 ダウンロード</a>
            
          </div>
        `;
      }
    }

    // ========================================
    // Step 6: リソース解放（重要）
    // ========================================
    barcode.delete();
    addLog('=== 1次元バーコード生成完了 ===');

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    addLog(`❌ エラー: ${errorMsg}`, true);
    if (resultDiv) {
      resultDiv.innerHTML = `<p class="error">${errorMsg}</p>`;
    }
  }
}

/**
 * 2次元バーコード生成
 * 
 * 【WASMライブラリの基本的な使い方 - 2次元バーコード】
 * 
 * ```typescript
 * // QRコードの例
 * const qr = new barcodeModule.QR();
 * qr.setOutputFormat('svg');
 * qr.setForegroundColor(0, 0, 0, 255);
 * qr.setBackgroundColor(255, 255, 255, 255);
 * qr.setErrorCorrectionLevel('M');  // L, M, Q, H
 * qr.setVersion(0);  // 0=自動
 * qr.setEncodeMode('BYTE');  // NUMERIC, ALPHANUMERIC, BYTE, KANJI
 * const result = qr.draw(data, size);
 * qr.delete();
 * 
 * // DataMatrixの例
 * const dm = new barcodeModule.DataMatrix();
 * dm.setCodeSize('AUTO');  // または '10x10' ～ '144x144', '8x18' 等
 * dm.setEncodeScheme('AUTO');  // ASCII, C40, TEXT, X12, EDIFACT, BASE256
 * const result = dm.draw(data, size);
 * dm.delete();
 * 
 * // PDF417の例
 * const pdf = new barcodeModule.PDF417();
 * pdf.setErrorLevel(2);  // -1～8
 * pdf.setColumns(0);  // 0=自動, 1～30
 * pdf.setRows(0);  // 0=自動, 3～90
 * pdf.setAspectRatio(3.0);  // 0.5～10.0
 * pdf.setYHeight(3);  // 1～10
 * const result = pdf.draw(data, size);
 * pdf.delete();
 * ```
 */
async function generate2D(): Promise<void> {
  const debugLog = getElement<HTMLDivElement>('debugLog');
  const logContent = getElement<HTMLDivElement>('logContent');
  const resultDiv = getElement<HTMLDivElement>('result');
  
  // デバッグログを表示
  if (debugLog) debugLog.style.display = 'block';
  if (logContent) logContent.innerHTML = '';
  
  addLog('=== 2次元バーコード生成開始 ===');
  
  const type = getSelectValue('barcode2dType');
  
  // WASMモジュールのチェック
  if (!barcodeModule) {
    addLog('❌ WASMモジュールが読み込まれていません', true);
    if (resultDiv) {
      resultDiv.innerHTML = '<p class="error">WASMモジュールがまだ読み込まれていません</p>';
    }
    return;
  }

  const data = getInputValue('data2d');
  const size = getInputNumber('size2d');
  
  // XY座標・回転・FitWidthパラメータの取得
  const xPos = getInputNumber('x2d') || 0;
  const yPos = getInputNumber('y2d') || 0;
  const rotateAngle = getInputNumber('rotateAngle2d') || 0;
  const fitWidth = getCheckboxValue('fitWidth2d');

  if (!data) {
    alert('バーコードデータを入力してください');
    return;
  }

  if (resultDiv) {
    resultDiv.innerHTML = '<p class="loading">生成中...</p>';
  }

  try {
    // ========================================
    // Step 1: バーコードインスタンス作成
    // ========================================
    const barcode = new barcodeModule[type]();

    // ========================================
    // Step 2: 共通プロパティ設定
    // ========================================
    const foreColor = hexToRgb(getInputValue('foreColor2d'));
    const backColor = hexToRgb(getInputValue('backColor2d'));
    
    // 出力形式設定（PNG/SVG）
    const outputFormat = (document.querySelector('input[name="outputFormat"]:checked') as HTMLInputElement)?.value || 'png';
    if (typeof barcode.setOutputFormat === 'function') {
      barcode.setOutputFormat(outputFormat);
      addLog(`出力形式: ${outputFormat.toUpperCase()}`);
    } else {
      addLog('⚠️ setOutputFormat未実装 - WASMを再ビルドしてください');
    }
    
    // 前景色・背景色（RGBA）
    barcode.setForegroundColor(foreColor.r, foreColor.g, foreColor.b, 255);
    barcode.setBackgroundColor(backColor.r, backColor.g, backColor.b, 255);
    
    // FitWidth設定（2次元バーコード用）
    if (typeof barcode.setFitWidth === 'function') {
      barcode.setFitWidth(fitWidth);
      addLog(`幅ぴったり: ${fitWidth ? 'ON' : 'OFF'}`);
    }
    
    // 文字エンコーディング（2次元バーコード専用）
    const encoding = getSelectValue('encoding2d');
    if (encoding) {
      barcode.setStringEncoding(encoding);
      addLog(`文字エンコーディング: ${encoding}`);
    }

    // ========================================
    // Step 3: 固有プロパティ設定
    // ========================================

    // --- QRコード固有プロパティ ---
    if (type === 'QR') {
      // 誤り訂正レベル: L(7%), M(15%), Q(25%), H(30%)
      const errorLevel = getSelectValue('qrErrorLevel');
      if (errorLevel) {
        barcode.setErrorCorrectionLevel(errorLevel);
        addLog(`誤り訂正レベル: ${errorLevel}`);
      }
      
      // バージョン: 0=自動, 1-40
      const version = getInputNumber('qrVersion');
      barcode.setVersion(version);
      addLog(`バージョン: ${version === 0 ? '自動' : version}`);
      
      // エンコードモード: NUMERIC, ALPHANUMERIC, BYTE, KANJI
      const encodeMode = getSelectValue('qrEncodeMode');
      if (encodeMode && typeof barcode.setEncodeMode === 'function') {
        barcode.setEncodeMode(encodeMode);
        addLog(`エンコードモード: ${encodeMode}`);
      }
    }

    // --- DataMatrix固有プロパティ ---
    if (type === 'DataMatrix') {
      // シンボルサイズ: AUTO, 10x10～144x144, 8x18～16x48
      const codeSize = getSelectValue('dmCodeSize');
      if (codeSize && typeof barcode.setCodeSize === 'function') {
        barcode.setCodeSize(codeSize);
        addLog(`シンボルサイズ: ${codeSize}`);
      }
      
      // エンコードスキーム: AUTO, ASCII, C40, TEXT, X12, EDIFACT, BASE256
      const encodeScheme = getSelectValue('dmEncodeScheme');
      if (encodeScheme && typeof barcode.setEncodeScheme === 'function') {
        barcode.setEncodeScheme(encodeScheme);
        addLog(`エンコードスキーム: ${encodeScheme}`);
      }
    }

    // --- PDF417固有プロパティ ---
    if (type === 'PDF417') {
      // エラー訂正レベル: -1=自動, 0-8
      const errorLevel = getInputNumber('pdf417ErrorLevel');
      barcode.setErrorLevel(errorLevel);
      addLog(`エラー訂正レベル: ${errorLevel === -1 ? '自動' : errorLevel}`);
      
      // 列数: 0=自動, 1-30
      const columns = getInputNumber('pdf417Columns');
      barcode.setColumns(columns);
      addLog(`列数: ${columns === 0 ? '自動' : columns}`);
      
      // 行数: 0=自動, 3-90
      const rows = getInputNumber('pdf417Rows');
      if (typeof barcode.setRows === 'function') {
        barcode.setRows(rows);
        addLog(`行数: ${rows === 0 ? '自動' : rows}`);
      }
      
      // アスペクト比: 0.5-10.0
      const aspectRatio = getInputFloat('pdf417AspectRatio');
      if (typeof barcode.setAspectRatio === 'function') {
        barcode.setAspectRatio(aspectRatio);
        addLog(`アスペクト比: ${aspectRatio}`);
      }
      
      // Y方向高さ: 1-10
      const yHeight = getInputNumber('pdf417YHeight');
      if (typeof barcode.setYHeight === 'function') {
        barcode.setYHeight(yHeight);
        addLog(`Y方向高さ: ${yHeight}`);
      }
    }

    // ========================================
    // Step 4: バーコード生成
    // ========================================
    const result: string = barcode.draw(data, size);

    // 生成失敗チェック - getLastError()でエラー詳細を取得
    if (!result || result.length === 0) {
      // エラーメッセージを取得（WASMにメソッドがある場合）
      let errorDetail = 'バーコードの生成に失敗しました';
      if (typeof barcode.getLastError === 'function') {
        const lastError = barcode.getLastError();
        if (lastError && lastError.length > 0) {
          errorDetail = lastError;
        }
      }
      
      // DataMatrixでシンボルサイズが固定の場合、データ量超過の可能性を示唆
      if (type === 'DataMatrix') {
        const codeSize = getSelectValue('dmCodeSize');
        if (codeSize && codeSize !== 'AUTO') {
          errorDetail += `\n（シンボルサイズ「${codeSize}」に対してデータが長すぎる可能性があります。\n「自動」を選択するか、データを短くしてください）`;
        }
      }
      
      addLog(`❌ 生成失敗: ${errorDetail}`, true);
      if (resultDiv) {
        resultDiv.innerHTML = `<p class="error" style="white-space: pre-line;">${errorDetail}</p>`;
      }
      barcode.delete();
      return;
    }

    // ========================================
    // Step 5: 結果表示
    // ========================================
    const outputMode = (document.querySelector('input[name="outputMode2d"]:checked') as HTMLInputElement)?.value || 'browser';
    addLog(`出力先: ${outputMode === 'pdf' ? 'PDF' : 'ブラウザ'}`);
    addLog(`X座標: ${xPos}, Y座標: ${yPos}, 回転角度: ${rotateAngle}°`);

    if (resultDiv) {
      if (outputMode === 'pdf') {
        // === PDF出力モード（統一レイアウト）===
        let pdfBlobUrl: string;
        
        if (outputFormat === 'svg') {
          pdfBlobUrl = await generatePdfFromSvg(result, size, size, type, rotateAngle, xPos, yPos);
        } else {
          pdfBlobUrl = await generatePdfFromPng(result, size, size, type, rotateAngle, xPos, yPos);
        }
        
        const formatLabel = outputFormat === 'svg' ? 'SVGベクター' : 'PNG画像';
        
        resultDiv.innerHTML = `
          <div class="toolbar">
            <span class="format-label" style="color: #9c27b0;">📄 PDF出力（${formatLabel}埋め込み）</span>
            <span class="info-text">サイズ: ${size}x${size}px | 位置: (${xPos}, ${yPos}) | 回転: ${rotateAngle}°</span>
          </div>
          <iframe src="${pdfBlobUrl}" title="Generated PDF"></iframe>
          <div class="action-bar">
            <a href="${pdfBlobUrl}" download="barcode_${type}.pdf" class="action-btn download">💾 ダウンロード</a>
            <button class="action-btn open-tab" onclick="window.open('${pdfBlobUrl}', '_blank')">🔗 別タブで開く</button>
          </div>
        `;
      } else {
        // === ブラウザ表示モード（統一レイアウト）===
        const rotateStyle = rotateAngle !== 0 ? `transform: rotate(${rotateAngle}deg);` : '';
        const formatLabel = outputFormat === 'svg' ? '✅ SVGベクター画像' : '📷 PNG画像';
        const formatClass = outputFormat === 'svg' ? 'svg' : 'png';
        const fileExt = outputFormat === 'svg' ? 'svg' : 'png';
        
        let downloadUrl = result;
        if (outputFormat === 'svg') {
          const svgBlob = new Blob([result], { type: 'image/svg+xml' });
          downloadUrl = URL.createObjectURL(svgBlob);
        }
        
        const contentHtml = outputFormat === 'svg' 
          ? result 
          : `<img src="${result}" alt="生成されたバーコード" style="image-rendering: pixelated;">`;
        
        resultDiv.innerHTML = `
          <div class="toolbar">
            <span class="format-label ${formatClass}">${formatLabel}</span>
            <span class="info-text">サイズ: ${size}x${size}px | 位置: (${xPos}, ${yPos}) | 回転: ${rotateAngle}°</span>
          </div>
          <div class="canvas-container">
            <div class="canvas-inner">
              <div class="barcode-element" style="left:${xPos}px; top:${yPos}px; ${rotateStyle}">
                ${contentHtml}
              </div>
            </div>
          </div>
          <div class="action-bar">
            <a href="${downloadUrl}" download="barcode_${type}.${fileExt}" class="action-btn download">💾 ダウンロード</a>
            
          </div>
        `;
      }
    }

    // ========================================
    // Step 6: リソース解放（重要）
    // ========================================
    barcode.delete();
    addLog('=== 2次元バーコード生成完了 ===');

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    addLog(`❌ エラー: ${errorMsg}`, true);
    if (resultDiv) {
      resultDiv.innerHTML = `<p class="error">${errorMsg}</p>`;
    }
  }
}

// =============================================================================
// 特殊バーコード生成
// =============================================================================

/**
 * 特殊バーコードUI更新
 * バーコード種類変更時にヒントと入力補助UIを更新
 */
function updateSpecialProps(): void {
  const type = getSelectValue('barcodeSpecialType');
  const hintDiv = getElement<HTMLDivElement>('specialBarcodeHint');
  const dataInput = getElement<HTMLInputElement>('dataSpecial');
  const widthInput = getElement<HTMLInputElement>('widthSpecial');
  const heightInput = getElement<HTMLInputElement>('heightSpecial');
  
  // サンプル選択UIの表示切り替え
  const convSelect = getElement<HTMLSelectElement>('gs1PatternSelect_ConvenienceStore_Special');
  const yubinSelect = getElement<HTMLSelectElement>('gs1PatternSelect_YubinCustomer_Special');
  
  if (convSelect) convSelect.style.display = type === 'ConvenienceStore' ? 'block' : 'none';
  if (yubinSelect) yubinSelect.style.display = type === 'YubinCustomer' ? 'block' : 'none';
  
  // 郵便カスタマバーコード選択時の特殊処理（幅・幅ぴったり非表示）
  const isYubinCustomer = (type === 'YubinCustomer');
  const grpWidth = getElement<HTMLDivElement>('grp_widthSpecial');
  const grpFitWidth = getElement<HTMLDivElement>('grp_fitWidthSpecial');
  
  if (grpWidth) grpWidth.style.display = isYubinCustomer ? 'none' : 'flex';
  if (grpFitWidth) grpFitWidth.style.display = isYubinCustomer ? 'none' : 'flex';
  
  // ヒントとデフォルト値を更新
  if (type === 'ConvenienceStore') {
    // コンビニバーコード: 幅500、高さ150
    if (widthInput) widthInput.value = '500';
    if (heightInput) heightInput.value = '150';
    if (hintDiv) hintDiv.textContent = 'コンビニ標準料金代理収納用バーコード: GS1-128形式。先頭に{FNC1}が必要。';
    if (dataInput) {
      dataInput.placeholder = '例: {FNC1}9191234500000000000000452087500401310029500';
      dataInput.value = '{FNC1}9191234500000000000000452087500401310029500';
    }
  } else if (type === 'YubinCustomer') {
    // 郵便カスタマ: 高さ25（幅は非表示）
    if (heightInput) heightInput.value = '25';
    if (hintDiv) hintDiv.textContent = '郵便カスタマバーコード: 郵便番号（7桁）+住所表示番号。ハイフン区切り可。';
    if (dataInput) {
      dataInput.placeholder = '例: 27500263-29-2-401';
      dataInput.value = '27500263-29-2-401';
    }
  }
}

/**
 * 特殊バーコード用GS1パターン適用
 */
function applyGS1PatternSpecial(): void {
  const type = getSelectValue('barcodeSpecialType');
  const dataInput = getElement<HTMLInputElement>('dataSpecial');
  
  let selectedValue = '';
  if (type === 'ConvenienceStore') {
    const select = getElement<HTMLSelectElement>('gs1PatternSelect_ConvenienceStore_Special');
    selectedValue = select?.value || '';
  } else if (type === 'YubinCustomer') {
    const select = getElement<HTMLSelectElement>('gs1PatternSelect_YubinCustomer_Special');
    selectedValue = select?.value || '';
  }
  
  if (selectedValue && dataInput) {
    dataInput.value = selectedValue;
  }
}

/**
 * 特殊バーコード生成
 * コンビニバーコード・郵便カスタマバーコードを生成
 */
async function generateSpecial(): Promise<void> {
  const debugLog = getElement<HTMLDivElement>('debugLog');
  const logContent = getElement<HTMLDivElement>('logContent');
  const resultDiv = getElement<HTMLDivElement>('result');
  
  // デバッグログを表示
  if (debugLog) debugLog.style.display = 'block';
  if (logContent) logContent.innerHTML = '';
  
  addLog('=== 特殊バーコード生成開始 ===');
  
  const type = getSelectValue('barcodeSpecialType');
  
  // WASMモジュールのチェック
  if (!barcodeModule) {
    addLog('❌ WASMモジュールが読み込まれていません', true);
    if (resultDiv) {
      resultDiv.innerHTML = '<p class="error">WASMモジュールがまだ読み込まれていません</p>';
    }
    return;
  }

  const data = getInputValue('dataSpecial');
  const width = getInputNumber('widthSpecial');
  const height = getInputNumber('heightSpecial');
  
  // XY座標・回転パラメータの取得
  const xPos = getInputNumber('xSpecial') || 0;
  const yPos = getInputNumber('ySpecial') || 0;
  const rotateAngle = getInputNumber('rotateAngleSpecial') || 0;
  const fitWidth = getCheckboxValue('fitWidthSpecial');

  if (!data) {
    addLog('❌ データが空です', true);
    alert('バーコードデータを入力してください');
    return;
  }

  if (resultDiv) {
    resultDiv.innerHTML = '<p class="loading">生成中...</p>';
  }

  try {
    const isConvenienceStore = (type === 'ConvenienceStore');
    const isYubinCustomer = (type === 'YubinCustomer');
    
    // コンビニバーコードはGS1-128として生成
    const wasmType = isConvenienceStore ? 'GS1_128' : type;
    
    addLog(`バーコード種別: ${type} (WASM: ${wasmType})`);
    
    // ========================================
    // Step 1: バーコードインスタンス作成
    // ========================================
    const barcode = new barcodeModule[wasmType]();

    // ========================================
    // Step 2: 共通プロパティ設定
    // ========================================
    const foreColor = hexToRgb(getInputValue('foreColorSpecial'));
    const backColor = hexToRgb(getInputValue('backColorSpecial'));
    
    // 出力形式設定（PNG/SVG）
    const outputFormat = (document.querySelector('input[name="outputFormat"]:checked') as HTMLInputElement)?.value || 'png';
    if (typeof barcode.setOutputFormat === 'function') {
      barcode.setOutputFormat(outputFormat);
      addLog(`出力形式: ${outputFormat.toUpperCase()}`);
    }
    
    // 前景色・背景色（RGBA）
    barcode.setForegroundColor(foreColor.r, foreColor.g, foreColor.b, 255);
    barcode.setBackgroundColor(backColor.r, backColor.g, backColor.b, 255);
    
    // 黒バー・白スペース調整
    const pxAdjustBlack = getInputNumber('pxAdjustBlackSpecial');
    const pxAdjustWhite = getInputNumber('pxAdjustWhiteSpecial');
    barcode.setPxAdjustBlack(pxAdjustBlack);
    barcode.setPxAdjustWhite(pxAdjustWhite);
    
    // 郵便カスタマ以外はFitWidth設定
    if (!isYubinCustomer && typeof barcode.setFitWidth === 'function') {
      barcode.setFitWidth(fitWidth);
      addLog(`幅ぴったり: ${fitWidth ? 'ON' : 'OFF'}`);
    }
    
    // コンビニバーコードはテキスト非表示
    if (isConvenienceStore) {
      barcode.setShowText(false);
    }

    // ========================================
    // Step 3: バーコード生成
    // ========================================
    addLog(`データ: ${data}`);
    addLog(`サイズ: ${width} x ${height} px`);
    
    // バーコード種類別のdraw呼び出し
    let result: string;
    if (isConvenienceStore) {
      // コンビニバーコード: GS1_128.drawConvenience()
      addLog(`drawConvenience("${data}", ${width}, ${height}) 実行`);
      result = barcode.drawConvenience(data, width, height);
    } else if (isYubinCustomer) {
      // 郵便カスタマ: draw(code, height) ← 引数2つのみ
      addLog(`draw("${data}", ${height}) 実行 (郵便カスタマは高さのみ指定)`);
      result = barcode.draw(data, height);
    } else {
      result = barcode.draw(data, width, height);
    }
    
    // 結果の検証
    const isValidResult = result && result !== '' && 
      !result.startsWith('Error') && 
      (result.startsWith('data:image') || result.includes('<svg') || result.startsWith('<?xml'));
    
    // 数値のみの場合はエラーコード
    const isErrorCode = /^\d+$/.test(result);
    
    if (!isValidResult || isErrorCode) {
      const errorDetail = isErrorCode ? `エラーコード: ${result}` : (result || '生成結果が空です');
      
      addLog(`❌ 生成失敗: ${errorDetail}`, true);
      if (resultDiv) {
        resultDiv.innerHTML = `<p class="error" style="white-space: pre-line;">${errorDetail}</p>`;
      }
      barcode.delete();
      return;
    }

    // ========================================
    // Step 4: 結果表示
    // ========================================
    const outputMode = (document.querySelector('input[name="outputModeSpecial"]:checked') as HTMLInputElement)?.value || 'browser';
    addLog(`出力先: ${outputMode === 'pdf' ? 'PDF' : 'ブラウザ'}`);
    addLog(`X座標: ${xPos}, Y座標: ${yPos}, 回転角度: ${rotateAngle}°`);

    // 郵便カスタマの実際のサイズを計算
    // WASM計算式: calcWidth = xPitch * 67 + xBar + 1 = (height/3)*67 + (height/6) + 1
    let actualWidth = width;
    let actualHeight = height;
    if (isYubinCustomer) {
      actualHeight = height;
      actualWidth = Math.round(actualHeight / 3 * 67 + actualHeight / 6 + 1);
      addLog(`郵便カスタマ: 実際のサイズ ${actualWidth}x${actualHeight}px`);
    }

    if (resultDiv) {
      if (outputMode === 'pdf') {
        // === PDF出力モード（統一レイアウト）===
        let pdfBlobUrl: string;
        
        if (outputFormat === 'svg') {
          pdfBlobUrl = await generatePdfFromSvg(result, actualWidth, actualHeight, type, rotateAngle, xPos, yPos);
        } else {
          pdfBlobUrl = await generatePdfFromPng(result, actualWidth, actualHeight, type, rotateAngle, xPos, yPos);
        }
        
        const formatLabel = outputFormat === 'svg' ? 'SVGベクター' : 'PNG画像';
        
        resultDiv.innerHTML = `
          <div class="toolbar">
            <span class="format-label" style="color: #9c27b0;">📄 PDF出力（${formatLabel}埋め込み）</span>
            <span class="info-text">サイズ: ${actualWidth}x${actualHeight}px | 位置: (${xPos}, ${yPos}) | 回転: ${rotateAngle}°</span>
          </div>
          <iframe src="${pdfBlobUrl}" title="Generated PDF"></iframe>
          <div class="action-bar">
            <a href="${pdfBlobUrl}" download="barcode_${type}.pdf" class="action-btn download">💾 ダウンロード</a>
            <button class="action-btn open-tab" onclick="window.open('${pdfBlobUrl}', '_blank')">🔗 別タブで開く</button>
          </div>
        `;
      } else {
        // === ブラウザ表示モード（統一レイアウト）===
        const rotateStyle = rotateAngle !== 0 ? `transform: rotate(${rotateAngle}deg);` : '';
        const formatLabel = outputFormat === 'svg' ? '✅ SVGベクター画像' : '📷 PNG画像';
        const formatClass = outputFormat === 'svg' ? 'svg' : 'png';
        const fileExt = outputFormat === 'svg' ? 'svg' : 'png';
        
        let downloadUrl = result;
        if (outputFormat === 'svg') {
          const svgBlob = new Blob([result], { type: 'image/svg+xml' });
          downloadUrl = URL.createObjectURL(svgBlob);
        }
        
        const contentHtml = outputFormat === 'svg' 
          ? result 
          : `<img src="${result}" alt="生成されたバーコード" style="image-rendering: pixelated;">`;
        
        resultDiv.innerHTML = `
          <div class="toolbar">
            <span class="format-label ${formatClass}">${formatLabel}</span>
            <span class="info-text">サイズ: ${actualWidth}x${actualHeight}px | 位置: (${xPos}, ${yPos}) | 回転: ${rotateAngle}°</span>
          </div>
          <div class="canvas-container">
            <div class="canvas-inner">
              <div class="barcode-element" style="left:${xPos}px; top:${yPos}px; ${rotateStyle}">
                ${contentHtml}
              </div>
            </div>
          </div>
          <div class="action-bar">
            <a href="${downloadUrl}" download="barcode_${type}.${fileExt}" class="action-btn download">💾 ダウンロード</a>
            
          </div>
        `;
      }
    }

    // ========================================
    // Step 5: リソース解放
    // ========================================
    barcode.delete();
    addLog('=== 特殊バーコード生成完了 ===');

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    addLog(`❌ エラー: ${errorMsg}`, true);
    if (resultDiv) {
      resultDiv.innerHTML = `<p class="error">${errorMsg}</p>`;
    }
  }
}

// =============================================================================
// 初期化
// =============================================================================

/**
 * アプリケーション初期化
 * DOMContentLoaded時に呼び出される
 * 
 * 【WASMモジュールの読み込み方法】
 * ```typescript
 * // 1. WASMモジュールをインポート
 * const Module = await import("./wasm/barcode.js");
 * 
 * // 2. モジュールを初期化（非同期）
 * const barcodeModule = await Module.default();
 * 
 * // 3. 各バーコードクラスが利用可能に
 * // barcodeModule.Code128, barcodeModule.QR, barcodeModule.DataMatrix 等
 * ```
 */
async function initApp(): Promise<void> {
  console.log('🚀 Barcode.WASM デモアプリ初期化開始...');
  
  try {
    // WASMモジュールを初期化（publicフォルダから読み込み）
    // @ts-ignore
    const Module = await import("./wasm/barcode.js");
    barcodeModule = await Module.default();
    console.log('✅ WASMモジュール読み込み完了');
    
  } catch (err) {
    console.error('❌ WASMモジュール読み込み失敗:', err);
    const resultDiv = getElement<HTMLDivElement>('result');
    if (resultDiv) {
      resultDiv.innerHTML = '<p class="error">WASMモジュールの読み込みに失敗しました</p>';
    }
  }
  
  // 色変更時のテキスト更新（リアルタイムプレビュー）
  ['foreColor1d', 'backColor1d', 'foreColor2d', 'backColor2d', 'foreColorSpecial', 'backColorSpecial'].forEach(id => {
    const input = getElement<HTMLInputElement>(id);
    const text = getElement<HTMLInputElement>(id.replace('Color', 'ColorText'));
    if (input && text) {
      input.addEventListener('input', () => {
        text.value = input.value;
      });
    }
  });
  
  // 初期プロパティ更新
  update1DProps();
  update2DProps();
  updateSpecialProps();
  
  console.log('✅ 初期化完了');
}

// =============================================================================
// グローバル関数のエクスポート（HTML側から呼び出し用）
// =============================================================================

declare global {
  interface Window {
    switchMainTab: typeof switchMainTab;
    update1DProps: typeof update1DProps;
    update2DProps: typeof update2DProps;
    updateSpecialProps: typeof updateSpecialProps;
    insertControlChar: typeof insertControlChar;
    applyGS1Pattern: typeof applyGS1Pattern;
    applyGS1Pattern2D: typeof applyGS1Pattern2D;
    applyGS1PatternSpecial: typeof applyGS1PatternSpecial;
    generate1D: typeof generate1D;
    generate2D: typeof generate2D;
    generateSpecial: typeof generateSpecial;
    downloadPdf: typeof downloadPdf;
  }
}

// HTML側のonclick等から呼び出せるようにwindowオブジェクトに登録
window.switchMainTab = switchMainTab;
window.update1DProps = update1DProps;
window.update2DProps = update2DProps;
window.updateSpecialProps = updateSpecialProps;
window.insertControlChar = insertControlChar;
window.applyGS1Pattern = applyGS1Pattern;
window.applyGS1Pattern2D = applyGS1Pattern2D;
window.applyGS1PatternSpecial = applyGS1PatternSpecial;
window.generate1D = generate1D;
window.generate2D = generate2D;
window.generateSpecial = generateSpecial;
window.downloadPdf = downloadPdf;

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', initApp);