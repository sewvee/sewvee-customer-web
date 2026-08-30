const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/[orderId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const markReadEffect = `
  useEffect(() => {
    if (!contextOutfitId || !orderId || messages.length === 0) return;
    
    const unreadMessages = messages.filter(m => 
      String(m.order_outfit_id) === String(contextOutfitId) && 
      m.sender_type !== 'CUSTOMER' && 
      !m.is_read_by_customer
    );
    
    if (unreadMessages.length > 0) {
      // Mark local state as read immediately
      setMessages(prev => prev.map(m => 
        (String(m.order_outfit_id) === String(contextOutfitId) && m.sender_type !== 'CUSTOMER')
          ? { ...m, is_read_by_customer: true } 
          : m
      ));
      
      // Call API
      api.post(\`/customer-portal/orders/\${orderId}/outfits/\${contextOutfitId}/requests/read\`)
        .catch(err => console.error('Failed to mark read', err));
    }
  }, [contextOutfitId, messages.length, orderId]);
`;

code = code.replace(
  "endRef.current?.scrollIntoView({ behavior: 'smooth' });\n  }, [messages]);",
  "endRef.current?.scrollIntoView({ behavior: 'smooth' });\n  }, [messages]);\n\n" + markReadEffect
);

fs.writeFileSync(file, code);
console.log("Added mark read effect");
