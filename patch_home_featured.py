import re

with open('src/app/(app)/home/page.tsx', 'r') as f:
    content = f.read()

# I will find the first occurrence of the BottomSheet and remove it.
# The BottomSheet starts with `{/* Product Details Modal */}` and ends with `</BottomSheet>\n    </div>\n  );\n}`
# I will only remove the FIRST one (which is in StripBanners).

first_modal_start = content.find("{/* Product Details Modal */}")
if first_modal_start != -1:
    first_modal_end = content.find("</BottomSheet>", first_modal_start) + len("</BottomSheet>\n")
    # check if it's inside StripBanners (line 90-150)
    # The second one is near the end of the file
    content = content[:first_modal_start] + content[first_modal_end:]

with open('src/app/(app)/home/page.tsx', 'w') as f:
    f.write(content)

