import re

with open('src/app/(app)/home/page.tsx', 'r') as f:
    content = f.read()

# I need to change how dismissedPopup works.
# Instead of a boolean, we can make it a set of dismissed IDs, or just check localStorage.
# We can use a useEffect to read from localStorage.

old_state = "const [dismissedPopup, setDismissedPopup] = useState(false);"
new_state = """const [dismissedPopup, setDismissedPopup] = useState(false);
  const [dismissedBannerId, setDismissedBannerId] = useState<number | null>(null);
  
  useEffect(() => {
    // Check localStorage for previously dismissed banner
    if (typeof window !== 'undefined') {
      const dismissedId = localStorage.getItem('sewvee_dismissed_popup');
      if (dismissedId) {
        setDismissedBannerId(parseInt(dismissedId, 10));
      }
    }
  }, []);"""

content = content.replace(old_state, new_state)

# Now find the popup banner rendering logic
# It currently says: {banners.find(b => b.type === "POPUP") && !dismissedPopup && (
# We need to change it to check if the banner ID is in dismissedBannerId

old_render = "{banners.find(b => b.type === \"POPUP\") && !dismissedPopup && ("
new_render = "{banners.find(b => b.type === \"POPUP\" && b.id !== dismissedBannerId) && !dismissedPopup && ("

content = content.replace(old_render, new_render)

# Now find the close button click handler
# onClick={() => setDismissedPopup(true)}
# We need to change it to also save to localStorage

old_click = "onClick={() => setDismissedPopup(true)}"
new_click = """onClick={() => {
                setDismissedPopup(true);
                const popup = banners.find(b => b.type === "POPUP");
                if (popup && typeof window !== 'undefined') {
                  localStorage.setItem('sewvee_dismissed_popup', popup.id.toString());
                  setDismissedBannerId(popup.id);
                }
              }}"""

content = content.replace(old_click, new_click)

with open('src/app/(app)/home/page.tsx', 'w') as f:
    f.write(content)

