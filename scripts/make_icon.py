"""Genere une icone carree (favicon + PWA) a partir de Fantome-styled.png."""
from PIL import Image
SRC = r"public/Fantome-styled.png"
img = Image.open(SRC).convert("RGBA")
w, h = img.size
side = int(max(w, h) * 1.08)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(img, ((side - w) // 2, (side - h) // 2), img)

for size in (512, 192, 32):
    out = canvas.resize((size, size), Image.LANCZOS)
    name = "ghost-frame-icon-%d.png" % size
    out.save("public/" + name)
    print("wrote public/%s" % name)

Image.open("public/ghost-frame-icon-32.png").save(
    "public/favicon.ico", format="ICO", sizes=[(32, 32)]
)
print("wrote public/favicon.ico")
