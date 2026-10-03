"""保留原片，使用高品質插值放大；不宣稱生成原片不存在的細節。
執行：python -m pip install imageio-ffmpeg opencv-python
      python tools/enhance-video.py
"""
from pathlib import Path
import subprocess
import cv2
import imageio_ffmpeg

root = Path(__file__).resolve().parent.parent
original = root / 'assets/birthday-original.mp4'
output = root / 'assets/birthday-enhanced.mp4'
subprocess.run([
    imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-i', str(original),
    '-vf', 'hqdn3d=0.7:0.5:1.0:0.7,scale=1820:1024:flags=lanczos,unsharp=5:5:0.38:3:3:0.0',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
    '-c:a', 'copy', '-movflags', '+faststart', str(output)
], check=True)
capture=cv2.VideoCapture(str(output))
ok,frame=capture.read()
if not ok:
    raise RuntimeError('增強影片無法解碼')
encoded_ok, encoded = cv2.imencode('.png', frame)
if not encoded_ok:
    raise RuntimeError('無法編碼第一幀圖片')
(root / 'assets/door-frame-enhanced.png').write_bytes(encoded.tobytes())
capture.release()
print('完成：1820 × 1024 輕度去噪、Lanczos 放大與柔和銳化；原片已保留。')
