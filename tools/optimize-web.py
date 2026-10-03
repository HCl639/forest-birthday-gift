"""從本機保留的高品質素材建立輕量網頁版本。"""
from pathlib import Path
from PIL import Image
import subprocess
import imageio_ffmpeg

root = Path(__file__).resolve().parent.parent
for name, size, quality in [('forest-cinematic', (1672, 941), 84),
                            ('door-frame-enhanced', (1820, 1024), 90),
                            ('video-reference', (640, 360), 86),
                            ('woodland-props', (1200, 800), 90)]:
    image = Image.open(root / f'assets/{name}.png')
    image.thumbnail(size, Image.Resampling.LANCZOS)
    target = root / f'assets/{name}.webp'
    image.save(target, 'WEBP', quality=quality, method=6)
    print(name, target.stat().st_size)
image = Image.open(root / 'assets/woodland-props.png').resize((720,480),Image.Resampling.LANCZOS)
image.save(root / 'assets/woodland-props-small.webp','WEBP',quality=84,method=6)
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-y',
    '-i', str(root / 'assets/birthday-enhanced.mp4'), '-c:v', 'libx264',
    '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-c:a', 'copy',
    '-movflags', '+faststart', str(root / 'assets/birthday-web.mp4')], check=True)
print('birthday-web.mp4', (root / 'assets/birthday-web.mp4').stat().st_size)
