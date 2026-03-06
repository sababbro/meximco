import re
import os

filepath = 'index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove the old Future section from 
# <!-- Future Section — Interactive Rocket Roadmap -->
# down to the </svg> before <!-- Future Section — Cinematic Space Rocket Journey -->
pattern = re.compile(
    r'(\n[\s]*<!-- Future Section.*?Interactive Rocket Roadmap -->.*?<\/svg>)',
    re.DOTALL
)

# check if we find it
match = pattern.search(text)
if match:
    text = text[:match.start()] + text[match.end():]
    print("Successfully removed old Future section.")
else:
    print("Could not find old Future section.")

# 2. Replace " — ", "—", and "&ndash;" according to user request "remove the -- from the texts"
# We replace " — " and "—" with a space, and "&ndash;" with a hyphen.
text = text.replace(' — ', ' ')
text = text.replace('—', ' ')
text = text.replace('&ndash;', '-')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print("Finished replacements.")
