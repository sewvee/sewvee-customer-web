import { readFileSync, writeFileSync } from 'fs';
let content = readFileSync('src/app/(app)/chat/[orderId]/page.tsx', 'utf-8');

content = content.replace(
  'placeholder={contextOutfitId ? "Type a message..." : "Select a topic first..."}',
  'placeholder={(order?.outfits?.length > 1 || order?.items?.length > 1) && !contextOutfitId ? "Select a topic first..." : "Type a message..."}'
);

writeFileSync('src/app/(app)/chat/[orderId]/page.tsx', content);
