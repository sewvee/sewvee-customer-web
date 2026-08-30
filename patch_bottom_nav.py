import re

with open('src/components/layout/BottomNav.tsx', 'r') as f:
    content = f.read()

if "import { useChatStore }" not in content:
    content = content.replace("import { usePathname } from 'next/navigation';", "import { usePathname } from 'next/navigation';\nimport { useChatStore } from '@/store/chatStore';\nimport { useAuthStore } from '@/store/authStore';\nimport { useEffect } from 'react';")

# Add the hooks to BottomNav
hooks = """export function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);
  const { unreadCount, fetchThreads } = useChatStore();
  
  useEffect(() => {
    if (user?.mobile) {
      fetchThreads(user.mobile);
    }
  }, [user?.mobile, fetchThreads]);
"""

content = content.replace("export function BottomNav() {\n  const pathname = usePathname();", hooks)

# Add the bubble to the Chat icon
icon_render = """<Icon
                  size={22}
                  className={active ? 'text-white' : 'text-slate-400'}
                />"""
new_icon_render = """<div className="relative">
                  <Icon
                    size={22}
                    className={active ? 'text-white' : 'text-slate-400'}
                  />
                  {href === '/chat' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#EF4444] text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border border-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>"""

content = content.replace(icon_render, new_icon_render)

with open('src/components/layout/BottomNav.tsx', 'w') as f:
    f.write(content)

