import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

# Add isCancelled computation near `const order = ...`
target = "const order = freshOrder || storeOrder;"
replace = "const order = freshOrder || storeOrder;\n  const isCancelled = String(order?.status).toUpperCase() === 'CANCELLED' || (order?.status as any)?.id === 4 || (order?.status as any)?.name === 'CANCELLED';"

content = content.replace(target, replace)

# Update Input Area
input_target = """      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 shrink-0 flex items-end gap-2 pb-safe relative">"""

input_replace = """      {/* Input Area */}
      {isCancelled ? (
        <div className="bg-white border-t border-gray-200 p-4 shrink-0 flex flex-col items-center justify-center gap-1 pb-safe bg-red-50/30">
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Inquiry Cancelled
          </span>
          <p className="text-sm text-slate-500 font-medium">This inquiry is closed and cannot receive new messages.</p>
        </div>
      ) : (
        <div className="bg-white border-t border-gray-200 p-3 shrink-0 flex items-end gap-2 pb-safe relative">"""

content = content.replace(input_target, input_replace)

# Close the div at the end of the input area
end_target = """          </button>
        )}
      </div>

      {/* Message Options Drawer */}"""

end_replace = """          </button>
        )}
      </div>
      )}

      {/* Message Options Drawer */}"""

content = content.replace(end_target, end_replace)

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)

print("Chat patch applied")
