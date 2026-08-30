import re
with open('/Users/bhuvan/Documents/Bhuvan/Products/sewvee-business-web/src/app/dashboard/messages/page.tsx', 'r') as f:
    content = f.read()

old_dropdown = """              <div className="relative">
                <button 
                  onClick={() => {
                    setShowHeaderDropdown(!showHeaderDropdown);
                    setActiveThreadDropdown(null);
                    setActiveMessageDropdown(null);
                  }}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                
                {showHeaderDropdown && (
                  <div 
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1.5 z-50 text-[14px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={() => {
                        setShowHeaderDropdown(false);
                        if (activeOrder?.customer?.id) {
                          window.open(`/dashboard/customers/${activeOrder.customer.id}`, '_blank');
                        }
                      }} 
                      className="w-full text-left px-4 py-2 hover:bg-[#F5F6F6] text-slate-700 flex items-center gap-3"
                    >
                      <User className="h-4 w-4" /> View contact info
                    </button>
                  </div>
                )}
              </div>"""

new_button = """              {activeThread?.order_type !== 'STITCHING_REQUEST' && (
                <button 
                  onClick={() => router.push(`/dashboard/orders?orderId=${activeThread.order_id}`)}
                  className="px-3 py-1.5 bg-[#F8FAFC] text-slate-700 border border-slate-200 text-[13px] font-medium rounded hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="hidden sm:inline">View Order</span>
                  <span className="sm:hidden">View</span>
                </button>
              )}"""

content = content.replace(old_dropdown, new_button)

with open('/Users/bhuvan/Documents/Bhuvan/Products/sewvee-business-web/src/app/dashboard/messages/page.tsx', 'w') as f:
    f.write(content)
