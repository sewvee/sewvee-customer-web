const fs = require('fs');
const file = 'src/app/(app)/chat/[orderId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCard = `                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 my-2 text-center shadow-sm w-full">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <ImageIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h4 className="font-bold text-indigo-900 text-[15px] mb-1">Action Required</h4>
                        <p className="text-indigo-800 text-[13.5px] leading-snug mb-4">
                          Boutique owner requested photos to be sent.
                        </p>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCollageMakerOutfitId(msg.order_outfit_id); }}
                          className="w-full bg-[#5B43EE] hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <ImageIcon className="w-5 h-5" />
                          Upload Photos
                        </button>
                      </div>`;

const newCard = `                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 my-2 text-center shadow-sm w-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-orange-400"></div>
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <ImageIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-orange-900 text-[15px] mb-1">Action Required</h4>
                        <p className="text-orange-800 text-[13.5px] leading-snug mb-4">
                          Boutique owner requested photos to be sent.
                        </p>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCollageMakerOutfitId(msg.order_outfit_id); }}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <ImageIcon className="w-5 h-5" />
                          Upload Photos
                        </button>
                      </div>`;

if (code.includes(oldCard)) {
  code = code.replace(oldCard, newCard);
  fs.writeFileSync(file, code);
  console.log('Successfully updated customer ACTION_REQUIRED card to orange!');
} else {
  console.log('Could not find old card');
}
