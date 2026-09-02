import re

with open('src/app/globals.css', 'r') as f:
    css = f.read()

# Make font-inter alias to font-sans
css = re.sub(
    r"--font-sans: (.*);",
    r"--font-sans: \1\n  --font-inter: var(--font-sans);",
    css
)

with open('src/app/globals.css', 'w') as f:
    f.write(css)

print("CSS patched with inter alias")
