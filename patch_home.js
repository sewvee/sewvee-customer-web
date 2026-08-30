const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/home/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const stripBannerComponent = `
function StripBanners({ strips }: { strips: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (strips.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % strips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [strips.length]);

  if (strips.length === 0) return null;
  const activeBanner = strips[currentIndex];
  
  const handleCta = (e: any) => {
    e.stopPropagation();
    if (activeBanner.cta_action_value) {
      window.open(activeBanner.cta_action_value, '_blank');
    }
  };

  return (
    <div
      style={{ backgroundColor: activeBanner.bg_color || '#4F46E5' }}
      className="w-full flex items-center justify-between px-4 md:px-6 py-2 gap-3 transition-all duration-500 cursor-pointer overflow-hidden"
      onClick={handleCta}
    >
      <div style={{ color: activeBanner.text_color || '#FFFFFF' }} className="flex items-center gap-2 flex-1 min-w-0 text-[12px] font-semibold h-[24px]">
        {strips.length > 1 && (
          <div className="flex gap-1 mr-1 flex-shrink-0 z-10 p-1 rounded">
            {strips.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                className={\`w-1.5 h-1.5 rounded-full transition-all \${currentIndex === i ? 'bg-white opacity-100 scale-110' : 'bg-white opacity-40 hover:opacity-60'}\`}
              />
            ))}
          </div>
        )}
        
        {/* Container for text */}
        <div className="flex-1 h-full flex items-center relative overflow-hidden group">
           {activeBanner.is_scrollable ? (
              <div className="absolute whitespace-nowrap animate-[marquee_15s_linear_infinite] group-hover:[animation-play-state:paused]">
                 {activeBanner.title}
                 <span className="inline-block w-10"></span>
                 {activeBanner.title}
              </div>
           ) : (
              <p className="truncate absolute w-full pr-4">{activeBanner.title}</p>
           )}
        </div>
      </div>
      
      {/* Call to Action Button */}
      {activeBanner.cta_label && (
        <button 
           className="bg-white text-black px-3 py-1 rounded-full text-[10px] uppercase font-bold shrink-0 transition-transform hover:scale-105 shadow-sm"
           onClick={handleCta}
           style={{ color: activeBanner.bg_color || '#000' }}
        >
           {activeBanner.cta_label}
        </button>
      )}
      
      <style dangerouslySetInnerHTML={{__html: \`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      \`}} />
    </div>
  );
}
`;

if (!code.includes('function StripBanners')) {
  code = code.replace('export default function HomePage', stripBannerComponent + '\\nexport default function HomePage');
}

const newStripBlock = \`        {/* STRIP BANNER */}
        <StripBanners strips={banners.filter(b => b.type === "STRIP")} />\`;

code = code.replace(/\{\/\* STRIP BANNER \*\/\}\s*\{banners\.filter[\s\S]*?\)\}/, newStripBlock);

fs.writeFileSync(file, code);
