import os, glob

preloader_html = """
    <!-- Psychedelic Preloader -->
    <div id="psychedelic-preloader">
        <!-- SVG Filter for the "Breathing / Melting" Hallucination Effect -->
        <svg style="width:0; height:0; position:absolute;" aria-hidden="true">
            <filter id="hallucination" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise">
                    <!-- Animates the turbulence to make it breathe -->
                    <animate attributeName="baseFrequency" values="0.015;0.025;0.015" dur="6s" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G">
                    <animate attributeName="scale" values="5;18;5" dur="6s" repeatCount="indefinite" />
                </feDisplacementMap>
            </filter>
        </svg>

        <!-- Sacred Geometry Halos (Mycelial Network / Aura) -->
        <div class="sacred-halo halo-1"></div>
        <div class="sacred-halo halo-2"></div>
        <div class="sacred-halo halo-3"></div>

        <!-- The Magic Mushroom -->
        <div class="mushroom-container">
            <svg class="magic-mushroom" viewBox="-20 -20 140 140" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="shroomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff00ff" />
                        <stop offset="50%" stop-color="#00ffff" />
                        <stop offset="100%" stop-color="#ffff00" />
                    </linearGradient>
                    <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#ffffff" />
                        <stop offset="100%" stop-color="#999999" />
                    </linearGradient>
                </defs>
                <g filter="url(#hallucination)">
                    <!-- Stem -->
                    <path d="M40,55 C40,85 32,95 32,100 L68,100 C68,95 60,85 60,55 Z" fill="url(#stemGrad)" />
                    <!-- Underskirt / Gills -->
                    <path d="M15,53 Q50,68 85,53 Q50,60 15,53 Z" fill="#b300b3" opacity="0.8" />
                    <!-- Cap -->
                    <path d="M10,55 C10,10 90,10 90,55 Q50,65 10,55 Z" fill="url(#shroomGrad)" />
                    <!-- Mushroom Spots -->
                    <circle cx="35" cy="30" r="6" fill="#ffffff" opacity="0.9"/>
                    <circle cx="65" cy="35" r="5" fill="#ffffff" opacity="0.9"/>
                    <circle cx="50" cy="20" r="7" fill="#ffffff" opacity="0.9"/>
                    <circle cx="25" cy="42" r="4" fill="#ffffff" opacity="0.9"/>
                    <circle cx="75" cy="46" r="4" fill="#ffffff" opacity="0.9"/>
                </g>
            </svg>
        </div>

        <!-- Floating Spores System -->
        <div class="spores">
            <div class="spore"></div><div class="spore"></div>
            <div class="spore"></div><div class="spore"></div>
            <div class="spore"></div><div class="spore"></div>
        </div>

        <!-- Thematic Loading Text -->
        <div class="loading-text">AWAKENING MYCELIUM</div>
    </div>
"""

preloader_js = """
    <!-- Psychedelic Preloader Failsafe Script -->
    <script>
        function removePreloader() {
            const preloader = document.getElementById('psychedelic-preloader');
            if (preloader) {
                // Guarantee it stays for at least 800ms to show off the cool animation
                setTimeout(() => {
                    preloader.classList.add('hidden');
                    
                    // Remove the node from the DOM entirely after the 1-second CSS fade finishes
                    setTimeout(() => {
                        preloader.remove();
                    }, 1000); 
                }, 800); 
            }
        }

        // Failsafe: if the document is already loaded, run immediately, otherwise wait for window load.
        if (document.readyState === 'complete') {
            removePreloader();
        } else {
            window.addEventListener('load', removePreloader);
        }
    </script>
</body>
"""

files = glob.glob('*.html')
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove existing preloader if any exists, this is to make sure we don't duplicate
    if 'id="psychedelic-preloader"' in content:
        continue # Skip if already has it just in case

    if '<div class="preloader"' in content:
         # Need to manually strip out old preloaders but for now we'll just inject at body
         print(f"File {file} might have old preloader, check manually")

    # Insert HTML after <body>
    content = content.replace('<body>', f'<body>{preloader_html}')
    
    # Insert JS before </body>
    content = content.replace('</body>', preloader_js)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Preloader injected into all HTML files.")
