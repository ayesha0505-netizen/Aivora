import os

from PIL import Image
from rembg import remove

input_path = r"C:\Users\naaza\.gemini\antigravity\brain\0a489c6b-d6ec-4a33-ab8e-9933340d5cec\media__1783179603565.jpg"
output_dir = r"c:\Users\naaza\OneDrive\Desktop\Aivora\frontend\public"
os.makedirs(output_dir, exist_ok=True)

print("Loading image...")
input_img = Image.open(input_path)

print("Removing background with rembg...")
# Using rembg to remove background
transparent_img = remove(input_img)

# Save full transparent logo
full_logo_path = os.path.join(output_dir, "logo.png")
transparent_img.save(full_logo_path, "PNG")
print(f"Saved full logo to {full_logo_path}")

# Let's check dimensions
w, h = transparent_img.size
print(f"Image size: {w}x{h}")

# Find bounding box of non-transparent pixels
bbox = transparent_img.getbbox()
if bbox:
    print(f"Bounding box: {bbox}")
    cropped = transparent_img.crop(bbox)
    cropped.save(os.path.join(output_dir, "logo-trimmed.png"), "PNG")
    
    # Let's create an icon-only version (the top robot/triangle part, usually roughly the top 62% of the bounding box)
    # Let's inspect where the gap between icon and text is by scanning horizontal lines
    img_data = cropped.load()
    cw, ch = cropped.size
    
    # Scan from top to bottom to find where the icon ends and text begins
    # We look for a row with very few non-transparent pixels after the top icon
    min_alpha_row = ch
    for y in range(int(ch * 0.4), int(ch * 0.75)):
        alpha_sum = sum(1 for x in range(cw) if img_data[x, y][3] > 20)
        if alpha_sum < cw * 0.05:  # almost empty row
            min_alpha_row = y
            break
            
    if min_alpha_row < ch:
        print(f"Found icon/text split at y={min_alpha_row} of {ch}")
        icon_img = cropped.crop((0, 0, cw, min_alpha_row))
        # Trim icon bbox
        icon_bbox = icon_img.getbbox()
        if icon_bbox:
            icon_img = icon_img.crop(icon_bbox)
        icon_img.save(os.path.join(output_dir, "logo-icon.png"), "PNG")
        print("Saved logo-icon.png")
        
        text_img = cropped.crop((0, min_alpha_row, cw, ch))
        text_bbox = text_img.getbbox()
        if text_bbox:
            text_img = text_img.crop(text_bbox)
        text_img.save(os.path.join(output_dir, "logo-text.png"), "PNG")
        print("Saved logo-text.png")
    else:
        # Fallback approximate crop if empty row not cleanly found
        split_y = int(ch * 0.62)
        icon_img = cropped.crop((0, 0, cw, split_y))
        icon_bbox = icon_img.getbbox()
        if icon_bbox:
            icon_img = icon_img.crop(icon_bbox)
        icon_img.save(os.path.join(output_dir, "logo-icon.png"), "PNG")
        print("Saved fallback logo-icon.png")

print("Processing complete!")
