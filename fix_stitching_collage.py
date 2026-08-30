import re

with open('src/app/(app)/stitching/page.tsx', 'r') as f:
    content = f.read()

bad = """        onSave={async (url: string) => {
        const blob = await (await fetch(url)).blob();
          const url = URL.createObjectURL(blob);
          setCollageDataUrl(url);
          setCollageOpen(false);
        }}"""

good = """        onSave={(url: string) => {
          setCollageDataUrl(url);
          setCollageOpen(false);
        }}"""

content = content.replace(bad, good)

with open('src/app/(app)/stitching/page.tsx', 'w') as f:
    f.write(content)
