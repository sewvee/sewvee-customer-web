import re

with open('src/app/(app)/chat/page.tsx', 'r') as f:
    content = f.read()

# Replace local state with useChatStore
old_imports = "import { useOrdersStore } from '@/store/ordersStore';"
new_imports = "import { useOrdersStore } from '@/store/ordersStore';\nimport { useChatStore } from '@/store/chatStore';"
content = content.replace(old_imports, new_imports)

old_state = """  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);

  // New Chat Bottom Sheet State
  const [newChatDrawerOpen, setNewChatDrawerOpen] = useState(false);
  const { orders, fetchOrders } = useOrdersStore();

  useEffect(() => {
    async function fetchThreads() {
      if (!user?.mobile) return;
      try {
        const res = await api.get('/customer-portal/chat/threads', {
          params: { phone: user.mobile }
        });
        const data = res.data?.data || res.data;
        setThreads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load threads:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchThreads();
  }, [user?.mobile]);"""

new_state = """  const { threads, loading, fetchThreads } = useChatStore();

  // New Chat Bottom Sheet State
  const [newChatDrawerOpen, setNewChatDrawerOpen] = useState(false);
  const { orders, fetchOrders } = useOrdersStore();

  useEffect(() => {
    if (user?.mobile) {
      fetchThreads(user.mobile);
    }
  }, [user?.mobile, fetchThreads]);"""

content = content.replace(old_state, new_state)

with open('src/app/(app)/chat/page.tsx', 'w') as f:
    f.write(content)

