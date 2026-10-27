<p><img src="../assets/tony.gif" width="112" height="112" alt="Tony 24 · DataTrace"></p>

[简体中文](../../README.md) · **繁體中文** · [English](../../docs/i18n/README.en.md)

# DataTrace

**讓每一次法規變化，都能追溯到來源。**

面向跨境產品與隱私團隊的香港、新加坡法規追蹤工具。透過法規庫、變更時間線和來源狀態，把訊號連接到官方原文。

[線上入口](https://2432antony-13.github.io/data-trace/) · [任務](https://github.com/2432antony-13/data-trace/issues) · [文件](../../docs/README.md)

## 目前狀態

公開靜態示範可用。每日擷取與部署已接通；來源失敗和空結果分別顯示。郵件訂閱與簡報尚未啟用。

## 快速開始

Node.js 22.5+；無須安裝執行相依套件。

```bash
cd data-trace
npm start
# http://localhost:3000
npm run check
npm test
npm run build:demo
```

## 能力與範圍

法規篩選與檢索；版本和來源連結；按法域追蹤變更；來源擷取狀態。

介面翻譯不改變官方原文。2026-08-09 是種子內容核驗基線，不代表今日全部法規已複核。

[原始碼](../../data-trace/) · [文件](../../docs/README.md)

倉庫首頁與產品介面提供 **简体中文 / 繁體中文 / English**。採用 Q 版 **Tony 24** 標識，GitHub 顯示 GIF，產品使用 SVG/CSS 動畫。

[語言覆蓋與原文範圍](../LOCALIZATION.md)
