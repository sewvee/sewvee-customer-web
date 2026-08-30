import os

path = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/customer-portal/customer-portal.service.ts'
with open(path, 'r') as f:
    lines = f.readlines()

out_lines = []
for line in lines:
    out_lines.append(line)
    
    if 'const measurementsByOutfit = new Map<number, any[]>();' in line:
        out_lines.append('    const servicesByOutfit = new Map<number, any[]>();\n')
        out_lines.append('    const itemsByOutfit = new Map<number, any[]>();\n')
        
    if '        value: m.value,' in line:
        pass # just context
        
    if 'measurements: measurementsByOutfit.get(oo.id) || [],' in line:
        out_lines.append('        services: servicesByOutfit.get(oo.id) || [],\n')
        out_lines.append('        items: itemsByOutfit.get(oo.id) || [],\n')

# Add the forEach loops before outfits.forEach
final_lines = []
for i, line in enumerate(out_lines):
    if 'outfits.forEach((oo: any) => {' in line:
        final_lines.append('    services.forEach((s: any) => {\n')
        final_lines.append('      if (!servicesByOutfit.has(s.outfit_id)) servicesByOutfit.set(s.outfit_id, []);\n')
        final_lines.append('      servicesByOutfit.get(s.outfit_id)!.push(s);\n')
        final_lines.append('    });\n')
        final_lines.append('    items.forEach((i: any) => {\n')
        final_lines.append('      if (!itemsByOutfit.has(i.outfit_id)) itemsByOutfit.set(i.outfit_id, []);\n')
        final_lines.append('      itemsByOutfit.get(i.outfit_id)!.push(i);\n')
        final_lines.append('    });\n')
    final_lines.append(line)

with open(path, 'w') as f:
    f.writelines(final_lines)

print("Patched carefully!")
