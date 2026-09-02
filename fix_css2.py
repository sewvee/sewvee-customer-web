import re
with open('src/app/globals.css', 'r') as f:
    css = f.read()

new_theme = """@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-inter: var(--font-sans);
}"""

css = re.sub(r"@theme inline \{.*?\}", new_theme, css, flags=re.DOTALL)

with open('src/app/globals.css', 'w') as f:
    f.write(css)
