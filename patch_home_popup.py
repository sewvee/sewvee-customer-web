import re

with open('src/app/(app)/home/page.tsx', 'r') as f:
    content = f.read()

# Add a state for dismissed popup
if "const [dismissedPopup, setDismissedPopup]" not in content:
    content = content.replace("const [selectedProduct, setSelectedProduct] = useState<any>(null);", "const [selectedProduct, setSelectedProduct] = useState<any>(null);\n  const [dismissedPopup, setDismissedPopup] = useState(false);")

# Add the popup modal JSX at the very end of HomePage, just before the closing </div>
popup_modal_jsx = """
      {/* Promotional Popup Banner */}
      {banners.find(b => b.type === "POPUP") && !dismissedPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[24px] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
            {banners.find(b => b.type === "POPUP")?.is_dismissible && (
              <button 
                onClick={() => setDismissedPopup(true)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
            
            {(() => {
              const popup = banners.find(b => b.type === "POPUP");
              const imgUrl = popup.image_url || popup.mobile_image_url;
              return (
                <div 
                  className="w-full cursor-pointer"
                  onClick={() => {
                    if (popup.cta_action_value) {
                      window.open(popup.cta_action_value.startsWith('http') ? popup.cta_action_value : `https://${popup.cta_action_value}`, '_blank');
                    }
                  }}
                >
                  {imgUrl ? (
                    <SafeImage src={formatImageUrl(imgUrl) || imgUrl} alt={popup.title || 'Promotion'} className="w-full h-auto max-h-[70vh] object-contain bg-gray-100" />
                  ) : (
                    <div className="p-8 text-center bg-gray-50">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{popup.title}</h3>
                      {popup.body && <p className="text-gray-500">{popup.body}</p>}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
"""

if "{/* Promotional Popup Banner */}" not in content:
    # replace the LAST </div>
    # we can find the last "    </div>\n  );\n}"
    idx = content.rfind("    </div>\n  );\n}")
    if idx != -1:
        content = content[:idx] + popup_modal_jsx + content[idx:]

with open('src/app/(app)/home/page.tsx', 'w') as f:
    f.write(content)

