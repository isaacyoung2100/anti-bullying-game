import sys, glob
from PIL import Image, ImageDraw
tag, cols, w = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
files = sorted(glob.glob(f'shot_sw_{tag}_*.png'))
ims = []
for f in files:
    im = Image.open(f).convert('RGB'); im = im.resize((w, int(im.height * w / im.width)))
    d = ImageDraw.Draw(im); lab = f.split(f'sw_{tag}_')[1][:-4]
    d.rectangle([0, 0, len(lab) * 7 + 6, 14], fill='black'); d.text((3, 1), lab, fill='yellow')
    ims.append(im)
h = max(i.height for i in ims); rows = (len(ims) + cols - 1) // cols
s = Image.new('RGB', (cols * (w + 6), rows * (h + 6)), 'white')
for i, im in enumerate(ims): s.paste(im, ((i % cols) * (w + 6), (i // cols) * (h + 6)))
s.save(f'sheet_{tag}.png'); print(len(ims), s.size)
