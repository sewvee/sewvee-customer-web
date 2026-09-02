import re

with open('src/components/CollageMaker.tsx', 'r') as f:
    code = f.read()

# Add onError handler to the img in SlotView
code = code.replace(
    '<img src={images[i]} className="w-full h-full object-cover" alt={`Slot ${i+1}`} />',
    '<img src={images[i]} className="w-full h-full object-cover" alt={`Slot ${i+1}`} onError={() => { alert("This image format is not supported by your browser (e.g. HEIC). Please choose a JPG or PNG."); onDeleteSlot(i); }} />'
)

with open('src/components/CollageMaker.tsx', 'w') as f:
    f.write(code)

print("Patched image error handler")
