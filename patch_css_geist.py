import re

with open('src/app/globals.css', 'r') as f:
    css = f.read()

# Remove @import
css = re.sub(r"@import url\('https://fonts\.googleapis\.com[^\n]+;\n", "", css)

# Update font-sans
css = re.sub(
    r"--font-sans: 'Geist', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;",
    "--font-sans: var(--font-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;",
    css
)

with open('src/app/globals.css', 'w') as f:
    f.write(css)

print("CSS patched")
