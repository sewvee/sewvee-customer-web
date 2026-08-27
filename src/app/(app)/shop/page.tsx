'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { URL_CUSTOMER_PORTAL_SHOP, URL_CUSTOMER_PORTAL_ORDERS, BASE_URL } from '@/lib/env';
import { ShoppingBag, MapPin, Store, ChevronDown, X, Plus, Minus, Trash2 } from 'lucide-react';
import type { Product, Boutique } from '@/types';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useToast } from '@/hooks/useToast';

// Helper to format image URL from the API response (same as mobile)
const formatImageUrl = (urlStr: string) => {
  if (!urlStr) return null;
  const rootUrl = BASE_URL.replace('/mobile/', '/');
  let firstUrl = urlStr.split(',')[0].trim();
  if (firstUrl.startsWith('http')) return encodeURI(firstUrl);
  if (firstUrl.startsWith('/')) return encodeURI(rootUrl + firstUrl.substring(1));
  return encodeURI(rootUrl + firstUrl);
};

export default function ShopPage() {
  const { user, token } = useAuthStore();
  const { orders } = useOrdersStore();
  const { showToast } = useToast();

  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [selectedBoutique, setSelectedBoutique] = useState<Boutique | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isBoutiqueModalOpen, setBoutiqueModalOpen] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState<any[]>([]);
  const [isCartModalOpen, setCartModalOpen] = useState(false);
  
  const [deliveryMethod, setDeliveryMethod] = useState<'STORE_PICKUP' | 'COURIER'>('STORE_PICKUP');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Product Details Modal state
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Extract boutiques from past orders
  useEffect(() => {
    const bMap = new Map<string, Boutique>();
    orders.forEach((o) => {
      if (o.boutiqueId && o.boutiqueName) {
        bMap.set(o.boutiqueId, {
          id: o.boutiqueId,
          name: o.boutiqueName,
          phone: o.companyPhone,
          address: o.companyAddress,
        });
      }
    });
    const bList = Array.from(bMap.values());
    setBoutiques(bList);
    if (bList.length > 0 && !selectedBoutique) {
      setSelectedBoutique(bList[0]);
    }
  }, [orders, selectedBoutique]);

  useEffect(() => {
    if (selectedBoutique) {
      fetchProducts(selectedBoutique.id);
    }
  }, [selectedBoutique]);

  const fetchProducts = async (companyId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${URL_CUSTOMER_PORTAL_SHOP}?companyId=${companyId}`);
      const json = await res.json();
      if (json.success) {
        const mapped = (json.data ?? []).map((p: any) => ({
          ...p,
          id: p.id,
          name: p.name,
          category: p.readymade_category?.name || 'Uncategorized',
          price: p.selling_price || 0,
          image: formatImageUrl(p.image_url),
          description: p.description || 'No description available',
          stock: Number(p.current_stock || 0)
        }));
        setProducts(mapped);
      }
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} added to cart`, 'success');
  };
  
  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.id === productId) {
        const newQ = p.quantity + delta;
        if (newQ > 0) return { ...p, quantity: newQ };
      }
      return p;
    }).filter(p => p.quantity > 0));
  };
  
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !selectedBoutique || !user || !token) return;
    if (deliveryMethod === 'COURIER' && !shippingAddress.trim()) {
      showToast('Please enter a shipping address', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const total = cart.reduce((acc, c) => acc + (Number(c.price) * (c.quantity || 1)), 0);
      
      const res = await fetch(URL_CUSTOMER_PORTAL_ORDERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_id: (user as any).customer_id || user.id,
          customer_mobile: user.mobile,
          customer_name: user.name || 'App Customer',
          company_id: selectedBoutique.id,
          order_type: 'SALE_ORDER',
          order_date: new Date().toISOString(),
          final_amount: total,
          total_amount: total,
          total_outfits: cart.length,
          order_notes: 'Online App Order',
          delivery_method: deliveryMethod,
          shipping_address: deliveryMethod === 'COURIER' ? shippingAddress : null,
          outfits: cart.map(c => ({
            name: c.name,
            quantity: c.quantity || 1,
            total_amount: Number(c.price) * (c.quantity || 1),
            items: [{
              item_type: 'READYMADE',
              readymade_id: c.id,
              qty: c.quantity || 1,
              price: Number(c.price),
              total_price: Number(c.price) * (c.quantity || 1)
            }]
          }))
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast('Order Request Sent Successfully!', 'success');
        setCart([]);
        setCartModalOpen(false);
      } else {
        showToast(json.message || 'Failed to place order', 'error');
      }
    } catch (e) {
      showToast('Error placing order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartTotal = cart.reduce((acc, c) => acc + (Number(c.price) * (c.quantity || 1)), 0);
  const cartCount = cart.reduce((acc, c) => acc + (c.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={() => setBoutiqueModalOpen(true)}
          className="flex items-center gap-2 max-w-[80%]"
        >
          <div className="bg-indigo-50 p-2 rounded-full">
            <Store className="w-5 h-5 text-[#5B43EE]" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shopping At</p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold text-gray-900 truncate">
                {selectedBoutique?.boutique_name ?? 'Select Boutique'}
              </p>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </button>
        
        {/* Cart Icon in Header */}
        <button className="relative p-2" onClick={() => setCartModalOpen(true)}>
          <ShoppingBag className="w-6 h-6 text-gray-700" />
          {cartCount > 0 && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
              {cartCount}
            </div>
          )}
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center p-10"><div className="w-8 h-8 rounded-full border-4 border-[#5B43EE] border-t-transparent animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-bold text-gray-900">No products available</p>
            <p className="text-gray-500 mt-1">This boutique hasn't added any readymades.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((p) => {
              const isOut = p.stock <= 0;
              return (
                <div 
                  key={p.id} 
                  className="bg-white rounded-[20px] overflow-hidden border border-[#F1F5F9] shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer"
                  onClick={() => setSelectedProduct(p)}
                >
                  <div className="h-[160px] bg-[#F8FAFC] relative">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className={`w-full h-full object-cover ${isOut ? 'opacity-50' : ''}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    {isOut && (
                      <div className="absolute top-[45%] left-0 right-0 bg-[#0F172A]/70 py-1.5 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold tracking-widest">OUT OF STOCK</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] text-[#94A3B8] font-medium uppercase font-inter">{p.category}</p>
                    <h3 className="text-[14px] font-bold text-[#0F172A] line-clamp-1 font-inter">{p.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-[14px] text-[#5B43EE] font-bold font-inter">₹{p.price}</p>
                      <button 
                        className="bg-[#F8FAFC] py-1.5 px-3 rounded-[16px] border border-[#EDE9FE] disabled:opacity-50"
                        onClick={(e) => addToCart(p, e)}
                        disabled={isOut}
                      >
                        <span className="text-[11px] text-[#5B43EE] font-bold font-inter">Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-24 right-4 z-20">
          <button 
            onClick={() => setCartModalOpen(true)}
            className="bg-[#5B43EE] text-white px-5 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 border-2 border-white transition-transform active:scale-95"
          >
            <ShoppingBag className="w-5 h-5" />
            View Cart ({cartCount})
          </button>
        </div>
      )}

      {/* Cart Modal */}
      <BottomSheet
        open={isCartModalOpen}
        onClose={() => setCartModalOpen(false)}
        title="Your Cart"
      >
        <div className="flex flex-col max-h-[80vh]">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[16px] font-bold text-gray-900">Your cart is empty</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-6">
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center border-b border-[#F1F5F9] pb-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F8FAFC] shrink-0 border border-[#E2E8F0]">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#0F172A] truncate">{item.name}</p>
                      <p className="text-[13px] text-[#5B43EE] font-bold mt-0.5">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 bg-[#F1F5F9] rounded-full flex items-center justify-center active:bg-[#E2E8F0]">
                        <Minus className="w-4 h-4 text-[#64748B]" />
                      </button>
                      <span className="text-[14px] font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 bg-[#F1F5F9] rounded-full flex items-center justify-center active:bg-[#E2E8F0]">
                        <Plus className="w-4 h-4 text-[#64748B]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] text-[#64748B]">Subtotal</span>
                  <span className="text-[13px] font-bold text-[#0F172A]">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#E2E8F0] pt-2 mt-2">
                  <span className="text-[15px] font-bold text-[#0F172A]">Total</span>
                  <span className="text-[16px] font-bold text-[#5B43EE]">₹{cartTotal}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[14px] font-bold text-[#0F172A] mb-3">Delivery Method</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeliveryMethod('STORE_PICKUP')}
                    className={`flex-1 py-3 px-2 rounded-xl border font-bold text-[13px] transition-colors ${deliveryMethod === 'STORE_PICKUP' ? 'bg-[#5B43EE] text-white border-[#5B43EE]' : 'bg-white text-[#64748B] border-[#E2E8F0]'}`}
                  >
                    Store Pickup
                  </button>
                  <button 
                    onClick={() => setDeliveryMethod('COURIER')}
                    className={`flex-1 py-3 px-2 rounded-xl border font-bold text-[13px] transition-colors ${deliveryMethod === 'COURIER' ? 'bg-[#5B43EE] text-white border-[#5B43EE]' : 'bg-white text-[#64748B] border-[#E2E8F0]'}`}
                  >
                    Courier / Delivery
                  </button>
                </div>
              </div>
              
              {deliveryMethod === 'COURIER' && (
                <div className="mb-6">
                  <h3 className="text-[14px] font-bold text-[#0F172A] mb-2">Shipping Address</h3>
                  <textarea 
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your complete delivery address..."
                    className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-3 text-[14px] outline-none focus:border-[#5B43EE] min-h-[80px] resize-none"
                  />
                </div>
              )}
              
              <Button 
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-4 text-[15px] rounded-xl font-bold flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Place Order • ₹${cartTotal}`
                )}
              </Button>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Select Boutique Modal */}
      <BottomSheet
        open={isBoutiqueModalOpen}
        onClose={() => setBoutiqueModalOpen(false)}
        title="Select Boutique"
      >
        <div className="space-y-3">
          {boutiques.map((b) => (
            <button
              key={b.id}
              onClick={() => { setSelectedBoutique(b); setBoutiqueModalOpen(false); }}
              className={`w-full flex items-center p-4 rounded-2xl border mb-3 ${selectedBoutique?.id === b.id ? 'border-[#5B43EE] bg-[#EEF2FF]' : 'border-[#E2E8F0] bg-[#F8FAFC]'}`}
            >
              <Store className={`w-5 h-5 mr-3 ${selectedBoutique?.id === b.id ? 'text-[#5B43EE]' : 'text-[#94A3B8]'}`} />
              <p className={`flex-1 text-left text-[15px] font-inter ${selectedBoutique?.id === b.id ? 'text-[#5B43EE] font-bold' : 'text-[#0F172A] font-semibold'}`}>
                {b.name}
              </p>
              {selectedBoutique?.id === b.id && (
                <div className="w-5 h-5 rounded-full bg-[#5B43EE] flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              )}
            </button>
          ))}
          {boutiques.length === 0 && (
            <p className="text-center text-gray-500 py-4">No boutiques found in your order history.</p>
          )}
        </div>
      </BottomSheet>

      {/* Product Details Modal */}
      <BottomSheet
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name || 'Product Details'}
      >
        {selectedProduct && (
          <div className="pb-6">
            <div className="w-full h-[260px] rounded-[20px] overflow-hidden bg-[#F8FAFC] mb-4">
              {selectedProduct.image ? (
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>
            
            <p className="text-[12px] font-bold text-[#5B43EE] uppercase tracking-wide mb-1">{selectedProduct.category}</p>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-[18px] font-bold text-[#0F172A] flex-1 mr-4">{selectedProduct.name}</h2>
              <span className="text-[18px] font-bold text-[#5B43EE]">₹{selectedProduct.price}</span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-[14px] font-bold text-[#0F172A] mb-2">Description</h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>
            
            <div className="pt-4 border-t border-[#F1F5F9]">
              <Button 
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                disabled={selectedProduct.stock <= 0}
                className="w-full py-4 text-[15px] rounded-xl font-bold"
              >
                {selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
