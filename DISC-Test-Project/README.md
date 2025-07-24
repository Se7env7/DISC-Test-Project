# 專業版 DISC 適性測驗互動網頁

這是一個基於網頁的互動式 DISC 適性測驗工具，旨在幫助使用者深入了解自己的行為風格與特質。專案使用 HTML, CSS, 和 JavaScript 實現，並透過 Chart.js 將結果視覺化。

## ✨ 主要功能

- **個人化資料填寫**：在測驗開始前收集姓名、性別、出生日期等資訊。
- **專業問卷設計**：採用 40 題「四選二」（最像/最不像）模式，提供更精準的分析。
- **複雜計分模型**：根據使用者的選擇動態計算 D, I, S, C 四個維度的分數。
- **結果視覺化**：使用雷達圖（Radar Chart）清晰呈現各項特質的分數分佈。
- **12 種組合分析**：提供基於主要和次要特質的 12 種組合人格分析。
- **深度分析報告**：包含工作風格、優勢、潛在挑戰及壓力下的反應等詳細內容。

## 📁 專案結構

```
DISC-Test-Project/
├── index.html          # 主要的 HTML 檔案
├── css/
│   └── style.css       # 樣式表檔案
├── js/
│   ├── data.js         # 測驗題目與結果數據
│   └── script.js       # 主要互動邏輯
└── README.md           # 專案說明檔案
```

## 🚀 如何運行

這是一個純前端專案，無需複雜的設定。

1.  **下載或 Clone 專案**：
    ```bash
    git clone [https://github.com/YourUsername/DISC-Test-Project.git](https://github.com/YourUsername/DISC-Test-Project.git)
    ```
2.  **在瀏覽器中開啟**：
    直接用您的網頁瀏覽器（如 Chrome, Firefox）打開專案資料夾中的 `index.html` 檔案即可開始使用。

## 🔧 未來擴充

本專案預留了與後端連接的函數 `sendDataToBackend`。若要將測驗結果儲存至資料庫，您可以：

1.  建立一個後端 API 端點（例如使用 Node.js, Python, PHP）。
2.  在 `js/script.js` 中，修改 `sendDataToBackend` 函數，將 `fetch` 請求的 URL 指向您的 API 位址。
3.  後端接收到包含 `userInfo` 和 `scores` 的 JSON 數據後，即可將其存入資料庫。