import re

with open('src/app/globals.css', 'r') as f:
    css = f.read()

# Add Geist import at the top (after tailwindcss)
css = re.sub(
    r'@import "tailwindcss";',
    "@import \"tailwindcss\";\n@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap');",
    css
)

# Update font-sans to use Geist first
css = re.sub(
    r'--font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
    "--font-sans: 'Geist', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;",
    css
)

with open('src/app/globals.css', 'w') as f:
    f.write(css)

print("Geist font added successfully!")
