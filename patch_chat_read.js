import fs from 'fs';
let content = fs.readFileSync('src/app/(app)/chat/[orderId]/page.tsx', 'utf-8');

const target = "      try {\n" +
"        const res = await api.get(`/customer-portal/orders/${orderId}/requests`, {\n" +
"          /* no params needed */\n" +
"        });\n" +
"        const data = res.data?.data || res.data;\n" +
"        setMessages(Array.isArray(data) ? data : []);";

const replacement = "      try {\n" +
"        const res = await api.get(`/customer-portal/orders/${orderId}/requests`, {\n" +
"          /* no params needed */\n" +
"        });\n" +
"        const data = res.data?.data || res.data;\n" +
"        setMessages(Array.isArray(data) ? data : []);\n\n" +
"        if (contextOutfitId) {\n" +
"          api.post(`/customer-portal/orders/${orderId}/outfits/${contextOutfitId}/requests/read`).catch(console.error);\n" +
"        }";

content = content.replace("setMessages(Array.isArray(data) ? data : []);", "setMessages(Array.isArray(data) ? data : []);\n        if (contextOutfitId) { api.post(`/customer-portal/orders/${orderId}/outfits/${contextOutfitId}/requests/read`).catch(console.error); }");
fs.writeFileSync('src/app/(app)/chat/[orderId]/page.tsx', content);
