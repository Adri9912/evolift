"""Décline le logo fourni en icônes PWA (ImageMagick requis, sans dépendance JS)."""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'assets/branding/evolift-cat-original.png'
OUT = ROOT / 'public/icons'
OUT.mkdir(parents=True, exist_ok=True)

def resize(size, filename, maskable=False):
    command = ['magick', str(SOURCE), '-resize', f'{352 if maskable else size}x{352 if maskable else size}']
    if maskable:
        command += ['-background', '#22272b', '-gravity', 'center', '-extent', f'{size}x{size}']
    subprocess.run(command + [str(OUT / filename)], check=True)

for size in (64, 192, 512):
    resize(size, f'cat-{size}.png')
resize(512, 'cat-maskable-512.png', True)
resize(180, 'cat-apple-touch.png')
subprocess.run(['magick', str(SOURCE), '-resize', '256x256', '-quality', '90', str(ROOT / 'public/images/logo-cat.webp')], check=True)
