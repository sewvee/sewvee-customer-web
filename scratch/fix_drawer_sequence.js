const fs = require('fs');
let content = fs.readFileSync('src/app/(app)/home/page.tsx', 'utf8');

const oldEffect = `  useEffect(() => {
    // Automatically open the boutique selection drawer if no boutique is selected,
    // they have boutiques to choose from, and the welcome popup is NOT currently showing.
    if (selectedBoutiqueId === null && boutiques.length > 0 && !showWelcomePopup) {
      // Add a slight delay for a smooth transition after the popup closes
      const timer = setTimeout(() => {
        setDrawerOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedBoutiqueId, boutiques.length, showWelcomePopup]);`;

const newEffect = `  useEffect(() => {
    // Automatically open the boutique selection drawer if no boutique is selected,
    // they have boutiques to choose from, and all popups are closed.
    const hasUnseenPromotionalPopup = banners.some(b => b.type === "POPUP" && b.id !== dismissedBannerId) && !dismissedPopup;
    
    if (selectedBoutiqueId === null && boutiques.length > 0 && !showWelcomePopup && !hasUnseenPromotionalPopup) {
      // Add a slight delay for a smooth transition after the popup closes
      const timer = setTimeout(() => {
        setDrawerOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedBoutiqueId, boutiques.length, showWelcomePopup, banners, dismissedBannerId, dismissedPopup]);`;

content = content.replace(oldEffect, newEffect);
fs.writeFileSync('src/app/(app)/home/page.tsx', content);
console.log('patched drawer sequence');
