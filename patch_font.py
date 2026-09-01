import re

with open('src/app/layout.tsx', 'r') as f:
    layout = f.read()

# Remove Inter imports
layout = re.sub(r"import \{ Inter \} from 'next/font/google';\n", "", layout)
layout = re.sub(r"const inter = Inter\(\{ subsets: \['latin'\], variable: '--font-inter' \}\);\n", "", layout)

# Update body className
layout = layout.replace(
    '<body className={`${inter.variable} ${inter.className} bg-[#F8FAFC] text-gray-900 antialiased`}>',
    '<body className={`font-sans bg-[#F8FAFC] text-gray-900 antialiased`}>'
)

with open('src/app/layout.tsx', 'w') as f:
    f.write(layout)

with open('src/app/globals.css', 'r') as f:
    css = f.read()

# Update font-sans
css = re.sub(
    r"--font-sans: var\(--font-inter\), ui-sans-serif, system-ui, sans-serif;",
    '--font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
    css
)
css = re.sub(r"--font-inter: var\(--font-inter\);\n", "", css)

with open('src/app/globals.css', 'w') as f:
    f.write(css)

print("Font patched successfully!")
