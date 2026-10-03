# 森林裡的生日秘密

純 HTML / CSS / JavaScript 互動生日網頁。無前端套件、無網路字型、無 CDN；所有素材在專案內，可離線執行。

線上版本：https://hcl639.github.io/forest-birthday-gift/ 。GitHub Pages 從 main 分支的根目錄發布，之後更新並推送 main 即會重新部署。公開儲存庫只包含目前使用的網頁素材；原始影片備份、先前版本音效和預覽截圖保留在本機，不上傳。

## 1. 如何啟動

直接雙擊 index.html，用 Chrome、Edge、Safari 或 Firefox 開啟。
本機預覽也可執行 python tools/preview.py，再開啟 http://127.0.0.1:8081。這個 QA 服務僅提供本專案網頁與媒體，且支援影片 Range。

首頁依瀏覽器可見高度配置成一屏，畫框自動使用標題和關卡入口之間的剩餘空間。手機採兩欄入口，低高度橫向畫面採左右構圖；關卡視窗也在可見高度內配置場景與操作區，不需上下捲動。開門影片仍會展開至滿版。

## 2. 影片路徑與畫質

線上版使用 assets/birthday-web.mp4，保留 1820 × 1024、30 fps 和原音訊，以 H.264 CRF 24 與 faststart 將影片約 9.9 MB 降至 3.6 MB。圖片改用 WebP，四張使用中的圖片約 7.8 MB 降至 0.91 MB。首頁優先載入森林背景；初次進入關卡時才預載影片，已有進度的回訪者則在首頁 load 後準備影片。原始 PNG 和高品質增強版 MP4 保留在本機，執行 python tools/optimize-web.py 可重建線上素材。

頁面目前播放 assets/birthday-enhanced.mp4，1820 × 1024、30 fps、10 秒；原音訊完整保留。這是原始 910 × 512 影片的輕度去噪、Lanczos 高品質放大、柔和銳化及低壓縮輸出，改善滿版播放觀感；不是 AI 超解析度，也不會還原原片不存在的細節。

assets/birthday.mp4 與 assets/birthday-original.mp4 均保留原始影片。增強版的第一幀為 assets/door-frame-enhanced.png，與目前影片第一個解碼影格逐像素一致。

播放時保留影片原有的聲音，不疊加或循環額外音效。影片結束後畫面維持最後一幀，聲音隨原片自然結束。

## 3. 更換影片

頁尾「更換生日影片」可選擇本機 MP4，不上傳檔案，並即時以 canvas 擷取第一幀。此次選片只作用於目前頁面，重新整理後恢復專案影片。

永久更換時，更新 index.html 中 video 的 src / poster，以及 script.js 中 setDoorImage 的初始素材路徑。影片建議為 H.264 MP4 + AAC。

若要重做相同增強流程，把新原片放在 assets/birthday-original.mp4，安裝開發工具依賴 python -m pip install imageio-ffmpeg opencv-python，再執行 python tools/enhance-video.py。一般使用網頁不需要這些 Python 套件。

## 4. 更換門的第一幀

門的圖片必須直接來自目前播放影片，不能換成不同構圖。從專案目錄執行：

```python
import cv2
from pathlib import Path
capture = cv2.VideoCapture('assets/birthday-enhanced.mp4')
ok, frame = capture.read()
if not ok:
    raise RuntimeError('影片无法解碼')
encoded_ok, encoded = cv2.imencode('.png', frame)
if not encoded_ok:
    raise RuntimeError('圖片無法編碼')
Path('assets/door-frame-enhanced.png').write_bytes(encoded.tobytes())
capture.release()
```

使用 PNG 保留像素；靜態拼圖與影片共用比例及位置。點門後約 1.4 秒從原畫框展開滿版，隱藏木框與介面。影片及結尾 canvas 使用相同的 object-fit: cover；直向手機裁切兩側，保持等比例、不拉伸。影片結尾自然暫停在 duration，以 canvas 保留最後影格，不跳頁、不出現 popup。

## 5. 四關玩法與修改

進度由 script.js 的 gameState.levels 管理；依序解鎖並在允許時以 localStorage 記憶。頁尾「重新探索」可重新開始。

- 森林尋物：enhanced-levels.js 的 setupSearch()。六個素材來自 woodland-props.png 的 3 × 2 透明圖集，CSS 直接取用，不須切成六個檔案。探索木箱會開蓋並冒出橡果，蜂蜜罐有蜜蜂，植物與石頭提供線索。樹洞藏著拼圖，覆蓋的葉子移開後出現微光。修改 objects 調整物件位置，atlas 對應圖集位置。
- 視角對齊：setupParallax() 與 geometry.js 的 cameraPolygons()。四片木雕置於不同深度，依同一透視相機的水平位置投影；正確視角下成為一個拼圖輪廓。判定根據頂點重合誤差，非任意分數。容錯內停留後，視角微調至精確角度，再完整重算所有投影。
- 黃昏光影：setupShadows() 與 geometry.js。四個有相同真實輪廓的木雕懸於不同高度，固定不動。以同一平行日光方向計算每個頂點與地面 Y=0 的交點：shadow.x = source.x - height × light.x；shadow.z = source.z - height × light.z。物件越高，影子隨光向移動越多。地面的淡色刻痕是目標輪廓，虛線連接物件頂點與實際投影點。四片輪廓透過反向投影安排固定位置，目標夕陽刻度為 36。判定使用地面頂點 RMS 距離；不是四張無關影子用 CSS 搬動。容錯成立後微調實際日光，再完整求交，不會直接搬影子。
- 星空連線：setupStars()。α → β → γ → σ → α 為天秤座主要星示意輪廓，並非精確天球座標圖。錯誤線淡出但保留已完成的星光。微亮下一顆星、逐步顯示星名，完成後出現 Libra 與祝福。可修改 stars 與 order。

主文案在 script.js 的 levels。原創素材、場景構成在 enhanced-levels.js；自然材質與光影樣式在 cinematic.css。原有 style.css 保留共同排版與滿版轉場。所有互動支援 Pointer Events（滑鼠 / 觸控）以及刻度的鍵盤操作。

## 6. 手機測試

手機和電腦連接同一 Wi-Fi，在專案目錄執行 python -m http.server 8080 --bind 0.0.0.0，用 ipconfig 查電腦區域網路 IPv4 位址。手機 Safari / Chrome 開啟 http://電腦IP:8080。若無法連線，檢查防火牆是否允許此測試服務。不要在聊天軟體的 HTML 檔案預覽器中測試。

檢查直向 / 橫向、觸控拖曳、關卡返回重入、四關獎勵、點門帶聲音播放、滿版與最後停格。瀏覽器的手機尺寸模擬可查版面；實機觸控與音訊政策仍需在手機確認。

## 幾何驗證

執行 node tools/check-geometry.js，驗證平行光射線求交、固定物體的高度差影響、目標輪廓完全重合、初始分離，以及相機的視差對齊。

## 原創素材與檔案

環境、原始小熊與道具由內建 imagegen 工具生成，提示詞見 assets/ARTWORK.md。依使用者後續要求，目前陪伴角色改為維尼，直接使用生日影片第 6 秒的既有截圖 assets/video-reference.png，以 CSS 肖像框呈現；原始小熊素材仍保留。使用者提供的影片內容保持原樣。

```text
index.html
style.css
cinematic.css
script.js
enhanced-levels.js
geometry.js
assets/
  birthday.mp4
  birthday-original.mp4
  birthday-enhanced.mp4
  door-frame.png
  door-frame-enhanced.png
  forest-cinematic.png
  forest-friends.png
  woodland-props.png
  ARTWORK.md
tools/
  enhance-video.py
  check-geometry.js
  preview.py
README.md
```

遵循 prefers-reduced-motion。網頁使用不需要額外安裝；Python 工具只用於重做素材或開發預覽。
