import re

with open('src/app/(app)/stitching/page.tsx', 'r') as f:
    content = f.read()

# Add state
if "const [viewingPastOrderId, setViewingPastOrderId]" not in content:
    content = content.replace("const [measurementDrawerOpen, setMeasurementDrawerOpen] = useState(false);", "const [measurementDrawerOpen, setMeasurementDrawerOpen] = useState(false);\n  const [viewingPastOrderId, setViewingPastOrderId] = useState<string | null>(null);")

# Find the onClick for View Order
old_onclick = """                    onClick={(e) => {
                      e.stopPropagation();
                      setMeasurementDrawerOpen(false);
                      router.push(`/orders/${o.id}`);
                    }}"""
new_onclick = """                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingPastOrderId(o.id.toString());
                    }}"""
content = content.replace(old_onclick, new_onclick)


# Create the new BottomSheet for viewing the order details
# We need to find the selected order from pastStitchingOrders
view_order_sheet = """
      {/* Past Order Details Drawer */}
      <BottomSheet open={!!viewingPastOrderId} onClose={() => setViewingPastOrderId(null)} title="Order Details">
        {(() => {
          const o = pastStitchingOrders.find(ord => ord.id.toString() === viewingPastOrderId);
          if (!o) return null;
          const outfits = o.outfits || o.items || [];
          const totalAmount = o.totalAmount || o.total || o.paid_amount || 0;
          
          return (
            <div className="pb-8 px-2 max-h-[80vh] overflow-y-auto">
              <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4 border border-[#E2E8F0]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Order No</span>
                  <span className="text-[14px] font-bold text-[#0F172A]">{o.billNo || `ORD-${o.id}`}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Date</span>
                  <span className="text-[14px] font-bold text-[#0F172A]">{new Date(o.createdAt || o.date || new Date()).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Total Amount</span>
                  <span className="text-[14px] font-bold text-[#5B43EE]">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Status</span>
                  <span className="text-[12px] font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">{o.status || 'Received'}</span>
                </div>
              </div>

              <h4 className="text-[14px] font-bold text-[#0F172A] mb-3 px-1">Outfits ({outfits.length})</h4>
              <div className="space-y-3">
                {outfits.map((outfit: any, idx: number) => (
                  <div key={outfit.id || idx} className="border border-gray-200 rounded-xl p-4 bg-white">
                    <h5 className="text-[14px] font-bold text-[#0F172A] mb-2">{outfit.outfit_type || outfit.name || `Outfit ${idx + 1}`}</h5>
                    {(outfit.measurements || outfit.customer_measurements) && (
                      <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Measurements</span>
                        <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{outfit.measurements || outfit.customer_measurements}</p>
                      </div>
                    )}
                    {(outfit.notes || outfit.customer_notes) && (
                      <div className="mt-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Notes</span>
                        <p className="text-[13px] text-gray-700">{outfit.notes || outfit.customer_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
                {outfits.length === 0 && (
                  <p className="text-[13px] text-gray-500 text-center py-4 bg-gray-50 rounded-xl">No outfit details found.</p>
                )}
              </div>
              
              <button
                onClick={() => {
                  setFormData({ ...formData, selected_past_order_id: o.id.toString() });
                  setViewingPastOrderId(null);
                  setMeasurementDrawerOpen(false);
                }}
                className="w-full mt-6 bg-[#5B43EE] hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                Use This Order's Measurements
              </button>
            </div>
          );
        })()}
      </BottomSheet>
"""

# Append it right before the last closing tags
# We can just inject it before {/* COLLAGE MAKER */}
content = content.replace("{/* COLLAGE MAKER */}", view_order_sheet + "\n      {/* COLLAGE MAKER */}")


with open('src/app/(app)/stitching/page.tsx', 'w') as f:
    f.write(content)

