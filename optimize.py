import os
import re
from PIL import Image

def optimize_html(filepath):
    print(f"Optimizing HTML: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Add loading="lazy" to imgs that don't have it
    def add_lazy(match):
        img_tag = match.group(0)
        # Skip if already has loading=
        if 'loading="lazy"' in img_tag or 'loading="eager"' in img_tag:
            return img_tag
        return img_tag.replace('<img ', '<img loading="lazy" ')

    optimized_html = re.sub(r'<img [^>]+>', add_lazy, html)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(optimized_html)
    print("HTML optimization complete.")

def compress_images(directory):
    print(f"Compressing images in {directory}...")
    valid_extensions = {'.png', '.jpg', '.jpeg'}
    for root, _, files in os.walk(directory):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in valid_extensions:
                filepath = os.path.join(root, file)
                try:
                    img = Image.open(filepath)
                    # Compress and overwrite
                    if ext == '.png':
                        img.save(filepath, optimize=True)
                    else:
                        img.save(filepath, optimize=True, quality=80)
                    print(f"Compressed: {file}")
                except Exception as e:
                    print(f"Could not compress {file}: {e}")

if __name__ == "__main__":
    optimize_html("index.html")
    try:
        compress_images(".")
    except ImportError:
        print("PIL not installed. Skipping image compression. Run 'pip install Pillow' to enable.")
