import re

with open('src/app/(app)/shop/page.tsx', 'r') as f:
    content = f.read()

# Import useShopStore
content = content.replace("import { useBoutiquesStore } from '@/store/boutiquesStore';", "import { useBoutiquesStore } from '@/store/boutiquesStore';\nimport { useShopStore } from '@/store/shopStore';")

# Replace local state
content = content.replace("const [cart, setCart] = useState<any[]>([]);", "const { cart, addToCart: storeAddToCart, updateQuantity: storeUpdateQuantity, clearCart } = useShopStore();")

# Replace addToCart
old_add_to_cart = """  const addToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      if (existing) {
        return prev.map(c => c.id === product.id ? { ...c, quantity: (c.quantity || 1) + 1 } : c);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    showToast(`${product.name} added to cart`, 'success');
  };"""

new_add_to_cart = """  const addToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    storeAddToCart(product);
    showToast(`${product.name} added to cart`, 'success');
  };"""

content = content.replace(old_add_to_cart, new_add_to_cart)

# Replace updateQuantity
old_update_qty = """  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (!existing) return prev;
      const newQty = (existing.quantity || 1) + delta;
      if (newQty <= 0) return prev.filter(c => c.id !== id);
      return prev.map(c => c.id === id ? { ...c, quantity: newQty } : c);
    });
  };"""

new_update_qty = """  const updateQuantity = (id: number, delta: number) => {
    storeUpdateQuantity(id, delta);
  };"""

content = content.replace(old_update_qty, new_update_qty)

# Replace setCart([]) inside handleCheckout
content = content.replace("setCart([]); // Clear cart", "clearCart(); // Clear cart")

with open('src/app/(app)/shop/page.tsx', 'w') as f:
    f.write(content)

