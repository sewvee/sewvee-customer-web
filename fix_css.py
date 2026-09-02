with open('src/app/globals.css', 'r') as f:
    css = f.read()

# Replace the whole @theme block
css = css.replace("""@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
  --font-inter: var(--font-sans);
  --font-inter: var(--font-inter), 'Inter', ui-sans-serif, system-ui, sans-serif;
  }""", """@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-inter: var(--font-sans);
}""")

with open('src/app/globals.css', 'w') as f:
    f.write(css)
