import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

old_block = """  const displayId = order ? (order.order_number || order.billNo || order.id) : orderId;
  const headerTitle = order ? `${displayId}` : `Order #${orderId}`;
  const headerSubtitle = order?.boutiqueName || '';"""

new_block = """  let displayId = order ? (order.order_number || order.billNo || order.id) : orderId;
  let targetOrderId = orderId;
  
  if (order?.order_notes?.startsWith('CONVERTED_TO_')) {
    const parts = order.order_notes.split('_');
    if (parts.length >= 3) {
      const convertedId = parts[2];
      targetOrderId = convertedId;
      const convertedOrder = orders.find(o => String(o.id) === convertedId);
      if (convertedOrder) {
        displayId = convertedOrder.order_number || convertedOrder.billNo || convertedOrder.id;
      } else {
        displayId = `Converted (${convertedId})`;
      }
    }
  }

  const headerTitle = order ? `${displayId}` : `Order #${orderId}`;
  const headerSubtitle = order?.boutiqueName || '';"""

content = content.replace(old_block, new_block)

old_link = """        <Link 
          href={`/orders/${orderId}`}
          className="ml-2 flex items-center justify-center px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-[11px] font-bold text-white transition-colors whitespace-nowrap"
        >"""

new_link = """        <Link 
          href={`/orders/${targetOrderId}`}
          className="ml-2 flex items-center justify-center px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-[11px] font-bold text-white transition-colors whitespace-nowrap"
        >"""

content = content.replace(old_link, new_link)

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)
