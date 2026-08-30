const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Business-Web/src/app/dashboard/orders/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const deleteFunc = `
  const handleDeletePhoto = async (orderId: number, photoId: number) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      const res = await fetch(\`\${URL_API_URL}/mobile/orders/\${orderId}/photos/\${photoId}\`, {
        method: 'DELETE',
        headers: {
          'Authorization': \`Bearer \${token}\`,
        },
      });
      if (res.ok) {
        toast.success("Photo deleted successfully");
        fetchOrders();
      } else {
        toast.error("Failed to delete photo");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };
`;
content = content.replace("  const handleSaveCosts = async () => {", deleteFunc + "\n  const handleSaveCosts = async () => {");

const regex = /<button[^>]*?key=\{`photo-\$\{group\.category\}-\$\{i\}`\}[^]*?<img src=\{getImageUrl\(photo\.file_url\)\}[^>]*?>\s*<\/button>/g;
const newPhotoUI = `<button
                                                key={\`photo-\${group.category}-\${i}\`}
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  setLightboxPhoto(getImageUrl(photo.file_url));
                                                }}
                                                type="button"
                                                className="relative group h-16 w-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-[#5B43EE] hover:scale-105 transition-all duration-200 shadow-xs cursor-zoom-in shrink-0"
                                              >
                                                <img src={getImageUrl(photo.file_url)} alt={group.title} className="h-full w-full object-cover pointer-events-none" />
                                                <div 
                                                  className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center cursor-pointer"
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDeletePhoto(detail.id, photo.id);
                                                  }}
                                                >
                                                  <X className="w-3 h-3 text-white" />
                                                </div>
                                              </button>`;

content = content.replace(regex, newPhotoUI);
fs.writeFileSync(file, content);
console.log("Business Web patched final");
