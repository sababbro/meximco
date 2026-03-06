import re
import codecs

with codecs.open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with codecs.open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Fix space background in styles.css
# In .rocket-roadmap, change "var(--near-black);" to "transparent;" inside the background definition
css = css.replace(
    ",\n        var(--near-black);",
    ",\n        transparent;"
)
# Ensure .future-vision-section is not overriding with var(--near-black) initially
css = css.replace(
    ".future-vision-section {\n    background: var(--near-black);",
    ".future-vision-section {\n    background: transparent;"
)
with codecs.open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Add metallic gradient def to the top of body in index.html for general use
metallic_def = """
    <!-- Global Monochrome Gradients -->
    <svg style="width:0;height:0;position:absolute;" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E0E0E0" />
          <stop offset="50%" stop-color="#9E9E9E" />
          <stop offset="100%" stop-color="#616161" />
        </linearGradient>
        <linearGradient id="silverGradientLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#BDBDBD" />
        </linearGradient>
        <filter id="metalDrop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.4"/>
        </filter>
      </defs>
    </svg>
"""

if "id=\"silverGradient\"" not in html:
    html = html.replace('<body>', '<body>\n' + metallic_def)

# Replace the 6 colorful SVGs in "What We Do"

svg_1 = """<svg viewBox="0 0 64 64" fill="none" width="52" height="52" filter="url(#metalDrop)">
<circle cx="32" cy="32" r="30" fill="url(#silverGradient)" opacity="0.15" stroke="url(#silverGradientLight)" stroke-width="1"/>
<rect x="14" y="32" width="36" height="20" rx="4" fill="url(#silverGradient)"/>
<line x1="22" y1="32" x2="22" y2="52" stroke="#424242" stroke-width="1.5"/>
<line x1="30" y1="32" x2="30" y2="52" stroke="#424242" stroke-width="1.5"/>
<line x1="38" y1="32" x2="38" y2="52" stroke="#424242" stroke-width="1.5"/>
<line x1="14" y1="40" x2="50" y2="40" stroke="#424242" stroke-width="1.5"/>
<line x1="14" y1="46" x2="50" y2="46" stroke="#424242" stroke-width="1.5"/>
<path d="M20 32 Q32 18 44 32" stroke="url(#silverGradientLight)" stroke-width="3" fill="none" stroke-linecap="round"/>
<ellipse cx="32" cy="29" rx="10" ry="5" fill="url(#silverGradientLight)"/>
<rect x="29" y="29" width="6" height="6" rx="1" fill="#757575"/>
</svg>"""

svg_2 = """<svg viewBox="0 0 64 64" fill="none" width="52" height="52" filter="url(#metalDrop)">
<circle cx="32" cy="32" r="30" fill="url(#silverGradient)" opacity="0.15" stroke="url(#silverGradientLight)" stroke-width="1"/>
<rect x="12" y="14" width="40" height="9" rx="4" fill="url(#silverGradientLight)"/>
<rect x="16" y="28" width="32" height="9" rx="4" fill="url(#silverGradient)"/>
<rect x="20" y="42" width="24" height="9" rx="4" fill="#616161"/>
<circle cx="49" cy="15" r="8" fill="url(#silverGradientLight)"/>
<polygon points="49,10 50.5,14 55,14 51.5,16.5 53,21 49,18 45,21 46.5,16.5 43,14 47.5,14" fill="#BDBDBD"/>
</svg>"""

svg_3 = """<svg viewBox="0 0 64 64" fill="none" width="52" height="52" filter="url(#metalDrop)">
<circle cx="32" cy="32" r="30" fill="url(#silverGradient)" opacity="0.15" stroke="url(#silverGradientLight)" stroke-width="1"/>
<path d="M32 10 L50 18 L50 34 C50 44 32 54 32 54 C32 54 14 44 14 34 L14 18 Z" fill="url(#silverGradient)"/>
<path d="M32 15 L46 22 L46 34 C46 42 32 50 32 50 C32 50 18 42 18 34 L18 22 Z" fill="url(#silverGradientLight)"/>
<path d="M24 32 L30 38 L42 26" stroke="#424242" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>"""

svg_4 = """<svg viewBox="0 0 64 64" fill="none" width="52" height="52" filter="url(#metalDrop)">
<circle cx="32" cy="32" r="30" fill="url(#silverGradient)" opacity="0.15" stroke="url(#silverGradientLight)" stroke-width="1"/>
<path d="M26 10 L26 28 L16 46 C14 50 17 54 22 54 L42 54 C47 54 50 50 48 46 L38 28 L38 10 Z" fill="url(#silverGradient)"/>
<path d="M18 46 C16 49 18 53 22 53 L42 53 C46 53 48 49 46 46 L36 30 L28 30 Z" fill="url(#silverGradientLight)"/>
<circle cx="26" cy="43" r="2.5" fill="#424242"/>
<circle cx="34" cy="48" r="1.8" fill="#424242"/>
<rect x="26" y="8" width="12" height="5" rx="2" fill="#757575"/>
</svg>"""

svg_5 = """<svg viewBox="0 0 64 64" fill="none" width="52" height="52" filter="url(#metalDrop)">
<circle cx="32" cy="32" r="30" fill="url(#silverGradient)" opacity="0.15" stroke="url(#silverGradientLight)" stroke-width="1"/>
<rect x="10" y="26" width="44" height="28" rx="3" fill="url(#silverGradient)"/>
<path d="M10 26 L32 18 L54 26" fill="url(#silverGradientLight)"/>
<path d="M32 18 L54 26 L54 30 L32 22 Z" fill="#E0E0E0" opacity="0.7"/>
<path d="M10 26 L32 22 L32 18 L10 26" fill="#BDBDBD"/>
<rect x="18" y="34" width="28" height="14" rx="2" fill="#FAFAFA"/>
<rect x="21" y="37" width="22" height="2" rx="1" fill="#9E9E9E"/>
<rect x="21" y="41" width="16" height="2" rx="1" fill="#E0E0E0"/>
</svg>"""

svg_6 = """<svg viewBox="0 0 64 64" fill="none" width="52" height="52" filter="url(#metalDrop)">
<circle cx="32" cy="32" r="30" fill="url(#silverGradient)" opacity="0.15" stroke="url(#silverGradientLight)" stroke-width="1"/>
<circle cx="32" cy="32" r="18" fill="url(#silverGradient)"/>
<ellipse cx="32" cy="32" rx="8" ry="18" stroke="url(#silverGradientLight)" stroke-width="1.5" fill="none"/>
<line x1="14" y1="32" x2="50" y2="32" stroke="url(#silverGradientLight)" stroke-width="1.5"/>
<line x1="16" y1="24" x2="48" y2="24" stroke="url(#silverGradientLight)" stroke-width="1" opacity="0.7"/>
<circle cx="47" cy="17" r="9" fill="url(#silverGradientLight)"/>
<path d="M47 10 C44 10 41 13 41 16 C41 20 47 26 47 26 C47 26 53 20 53 16 C53 13 50 10 47 10Z" fill="#9E9E9E"/>
<circle cx="47" cy="16" r="2.5" fill="#424242"/>
</svg>"""

pattern = re.compile(r'<svg viewBox="0 0 64 64" fill="none" width="52" height="52">.*?</svg>', re.DOTALL)
matches = pattern.findall(html)
if len(matches) == 6:
    html = html.replace(matches[0], svg_1)
    html = html.replace(matches[1], svg_2)
    html = html.replace(matches[2], svg_3)
    html = html.replace(matches[3], svg_4)
    html = html.replace(matches[4], svg_5)
    html = html.replace(matches[5], svg_6)

# Rocket Journey - monochrome/silver themes
html = html.replace('<stop offset="0%" stop-color="#FF6B6B" />', '<stop offset="0%" stop-color="#FAFAFA" />')
html = html.replace('<stop offset="33%" stop-color="#FFD93D" />', '<stop offset="33%" stop-color="#E0E0E0" />')
html = html.replace('<stop offset="66%" stop-color="#6BCB77" />', '<stop offset="66%" stop-color="#9E9E9E" />')
html = html.replace('<stop offset="100%" stop-color="#4D96FF" />', '<stop offset="100%" stop-color="#616161" />')

html = html.replace('<stop offset="0%" stop-color="#FF8A65" />', '<stop offset="0%" stop-color="#FAFAFA" />')
html = html.replace('<stop offset="100%" stop-color="#E64A19" />', '<stop offset="100%" stop-color="#9E9E9E" />')

html = html.replace('<stop offset="0%" stop-color="#81C784" />', '<stop offset="0%" stop-color="#E0E0E0" />')
html = html.replace('<stop offset="100%" stop-color="#2E7D32" />', '<stop offset="100%" stop-color="#757575" />')

html = html.replace('<stop offset="0%" stop-color="#64B5F6" />', '<stop offset="0%" stop-color="#BDBDBD" />')
html = html.replace('<stop offset="100%" stop-color="#1565C0" />', '<stop offset="100%" stop-color="#616161" />')

html = html.replace('<stop offset="0%" stop-color="#CE93D8" />', '<stop offset="0%" stop-color="#9E9E9E" />')
html = html.replace('<stop offset="100%" stop-color="#6A1B9A" />', '<stop offset="100%" stop-color="#424242" />')

html = html.replace('<stop offset="0%" stop-color="#EF5350" />', '<stop offset="0%" stop-color="#E0E0E0" />')
html = html.replace('<stop offset="100%" stop-color="#B71C1C" />', '<stop offset="100%" stop-color="#616161" />')

html = html.replace('fill="#C62828"', 'fill="#757575"')

with codecs.open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Icons fixed successfully.")
