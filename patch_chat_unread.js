import { readFileSync, writeFileSync } from 'fs';
let content = readFileSync('src/app/(app)/chat/page.tsx', 'utf-8');

// Add unread_count to interface
content = content.replace(
  'latest_message_timestamp: string;',
  'latest_message_timestamp: string;\n  unread_count?: number;'
);

const oldParagraph = `<p className="text-[13px] text-gray-500 truncate">
                    {t.latest_message_text || (t.latest_message_attachment ? '📷 Image' : 'Started a conversation')}
                  </p>`;

const newParagraph = `<div className="flex justify-between items-center">
                    <p className={\`text-[13px] truncate \${t.unread_count ? 'text-[#0F172A] font-medium' : 'text-gray-500'}\`}>
                      {t.latest_message_text || (t.latest_message_attachment ? '📷 Image' : 'Started a conversation')}
                    </p>
                    {t.unread_count ? (
                      <span className="bg-[#5B43EE] text-white text-[11px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full ml-2 shrink-0">
                        {t.unread_count}
                      </span>
                    ) : null}
                  </div>`;

content = content.replace(oldParagraph, newParagraph);

writeFileSync('src/app/(app)/chat/page.tsx', content);
