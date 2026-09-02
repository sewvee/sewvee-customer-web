import re

with open('src/app/layout.tsx', 'r') as f:
    content = f.read()

# Add Geist import
content = content.replace("import './globals.css';", "import './globals.css';\nimport { Geist } from 'next/font/google';\n\nconst geist = Geist({\n  subsets: ['latin'],\n  variable: '--font-sans',\n});")

# Update body className
content = content.replace(
    '<body className={`font-sans bg-[#F8FAFC] text-gray-900 antialiased`}>',
    '<body className={`${geist.variable} ${geist.className} font-sans bg-[#F8FAFC] text-gray-900 antialiased`}>'
)

with open('src/app/layout.tsx', 'w') as f:
    f.write(content)

print("Layout patched")
