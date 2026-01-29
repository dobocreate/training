import os
from PIL import Image

def remove_white(image_path):
    print(f"Processing {image_path}...")
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # If the pixel is very white (allowing for some compression noise)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(image_path, "PNG")

mascots_dir = "public/mascots"
for filename in os.listdir(mascots_dir):
    if filename.endswith(".png"):
        remove_white(os.path.join(mascots_dir, filename))
