import re

with open('src/app/(app)/chat/page.tsx', 'r') as f:
    content = f.read()

# Replace everything from useState<ChatThread[]> to fetchThreads(); }, [user?.mobile]);

start_idx = content.find("const [threads, setThreads] = useState<ChatThread[]>([]);")
end_idx = content.find("}, [user?.mobile]);") + len("}, [user?.mobile]);")

new_state = """  const { threads, loading, fetchThreads } = useChatStore();

  // New Chat Bottom Sheet State
  const [newChatDrawerOpen, setNewChatDrawerOpen] = useState(false);
  const { orders, fetchOrders } = useOrdersStore();

  useEffect(() => {
    if (user?.mobile) {
      fetchThreads(user.mobile);
    }
  }, [user?.mobile, fetchThreads]);"""

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_state + content[end_idx:]

with open('src/app/(app)/chat/page.tsx', 'w') as f:
    f.write(content)

