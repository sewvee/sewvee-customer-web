'use client';
import { useEffect, useState, useMemo } from 'react';
import { ShoppingBag, Search, ChevronDown, Store, X, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useBoutiquesStore } from '@/store/boutiquesStore';
import { useShopStore } from '@/store/shopStore';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { URL_CUSTOMER_STORE_CATALOGUE, URL_CUSTOMER_PORTAL_SHOP, URL_CUSTOMER_PORTAL_ORDERS, BASE_URL } from '@/lib/env';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { BoutiqueDrawer } from '@/components/home/BoutiqueDrawer';

const formatImageUrl = (urlStr: string | null): string | undefined => {
  if (!urlStr) return undefined;
  const firstUrl = urlStr.split(',')[0];
  if (firstUrl.startsWith('http')) return firstUrl;
  const apiDomain = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sewvee.com';
  const cleanUrl = firstUrl.startsWith('/') ? firstUrl.slice(1) : firstUrl;
  return `${apiDomain}/${cleanUrl}`;
};

export default function ShopPage() {
  const { user, token } = useAuthStore();
  
  // Use Global Boutiques Store
  const { boutiques, selectedBoutiqueId, fetchBoutiques } = useBoutiquesStore();

  const [shopMode, setShopMode] = useState<'DIRECT'|'BOUTIQUE'>('DIRECT');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isBoutiqueDrawerOpen, setIsBoutiqueDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // Cart
  const { cart, addToCart: storeAddToCart, updateQuantity: storeUpdateQuantity, clearCart } = useShopStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP'|'COURIER'>('PICKUP');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchBoutiques();
  }, [fetchBoutiques]);

  useEffect(() => {
    if (shopMode === 'DIRECT') {
      fetchProducts();
    } else if (selectedBoutiqueId) {
      fetchProducts(selectedBoutiqueId.toString());
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [shopMode, selectedBoutiqueId]);

  const fetchProducts = async (companyId?: string) => {
    setLoading(true);
    try {
      let url = '';
      if (shopMode === 'DIRECT') {
        url = URL_CUSTOMER_STORE_CATALOGUE;
      } else {
        if (!companyId) {
          setProducts([]);
          setLoading(false);
          return;
        }
        url = `${URL_CUSTOMER_PORTAL_SHOP}?companyId=${companyId}`;
      }
      
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        const data = shopMode === 'DIRECT' ? json.products : json.data;
        setProducts(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any, e: any) => {
    e.stopPropagation();
    storeAddToCart(product);
    showToast(`${product.name} added to cart`, 'success');
  };
  
  const updateQuantity = (productId: string, delta: number) => {
    storeUpdateQuantity(Number(productId), delta);
  };
  
  const removeFromCart = (productId: string) => {
    const item = cart.find(c => c.id.toString() === productId);
    if (item) {
      storeUpdateQuantity(Number(productId), -item.quantity);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !user || !token) return;
    if (shopMode === 'BOUTIQUE' && !selectedBoutiqueId) return;
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
          company_id: shopMode === 'BOUTIQUE' ? selectedBoutiqueId : undefined,
          is_sewvee_direct: shopMode === 'DIRECT',
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

      if (res.ok) {
        showToast('Order placed successfully!', 'success');
        clearCart();
        setIsCartOpen(false);
      } else {
        showToast('Failed to place order', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error placing order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartCount = cart.reduce((acc, c) => acc + (c.quantity || 1), 0);
  const cartTotal = cart.reduce((acc, c) => acc + (Number(c.price) * (c.quantity || 1)), 0);

  const selectedBoutique = boutiques.find(b => b.id === selectedBoutiqueId);

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-20 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-700 bg-gray-50 rounded-full">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                {cartCount}
              </div>
            )}
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setShopMode('DIRECT')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${shopMode === 'DIRECT' ? 'bg-white text-[#5B43EE] shadow-sm' : 'text-gray-500'}`}
          >
            Sewvee Originals
          </button>
          <button 
            onClick={() => setShopMode('BOUTIQUE')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${shopMode === 'BOUTIQUE' ? 'bg-white text-[#5B43EE] shadow-sm' : 'text-gray-500'}`}
          >
            My Boutiques
          </button>
        </div>

        {/* Boutique Selector (Only shown if BOUTIQUE mode) */}
        {shopMode === 'BOUTIQUE' && (
          <button
            onClick={() => setIsBoutiqueDrawerOpen(true)}
            className="flex items-center gap-2 max-w-[100%] w-full mt-3 bg-gray-50 p-2 rounded-xl border border-gray-200"
          >
            <div className="bg-indigo-50 p-2 rounded-full shrink-0">
              <Store className="w-5 h-5 text-[#5B43EE]" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shopping At</p>
              <div className="flex items-center gap-1 overflow-hidden pr-2">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {selectedBoutique ? (selectedBoutique.boutique_name || (selectedBoutique as any).name) : 'Select Boutique'}
                </p>
                <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
              </div>
            </div>
          </button>
        )}
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
              const img = formatImageUrl(p.image_url);
              return (
                <div 
                  key={p.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col cursor-pointer"
                  onClick={() => setSelectedProduct(p)}
                >
                  <div className="h-40 bg-gray-50 w-full relative">
                    {img ? (
                      <img src={img || undefined} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{p.readymade_category?.name || p.category_name || 'RAW SILK'}</p>
                    <p className="font-bold text-[#0F172A] text-sm mt-0.5 line-clamp-1">{p.name}</p>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="font-bold text-[#5B43EE]">₹{p.selling_price || p.price}</span>
                      {(() => {
                        const cartItem = cart.find(c => c.id === p.id);
                        if (cartItem) {
                          return (
                            <div className="flex items-center gap-1 border border-[#5B43EE] rounded-xl p-0.5" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => updateQuantity(p.id, -1)} className="w-6 h-6 flex items-center justify-center text-[#5B43EE] hover:bg-indigo-50 rounded-lg transition-colors">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold w-4 text-center text-[#5B43EE]">{cartItem.quantity}</span>
                              <button onClick={() => updateQuantity(p.id, 1)} className="w-6 h-6 flex items-center justify-center text-[#5B43EE] hover:bg-indigo-50 rounded-lg transition-colors">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        }
                        return (
                          <button 
                            onClick={(e) => addToCart(p, e)}
                            className="px-4 py-1.5 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#5B43EE] hover:bg-indigo-50 transition-colors"
                          >
                            Add
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Modal */}
      <BottomSheet
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Your Cart"
      >
        <div className="flex flex-col min-h-[400px]">
          <div className="flex-1 overflow-y-auto pb-4">
            {cart.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      {item.image_url ? (
                        <img src={formatImageUrl(item.image_url) || undefined} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-gray-300" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-[#0F172A] text-sm truncate pr-2">{item.name}</p>
                        <button onClick={() => removeFromCart(item.id)} className="p-1 text-gray-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[#5B43EE] font-bold text-sm mt-1">₹{item.price}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-sm w-4 text-center text-gray-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-[#5B43EE] hover:bg-indigo-50 transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-auto space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-900">₹{cartTotal}</span>
              </div>
              
              <div>
                <p className="text-sm font-bold text-gray-900 mb-2">Delivery Method</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDeliveryMethod('PICKUP')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border ${deliveryMethod === 'PICKUP' ? 'bg-indigo-50 border-[#5B43EE] text-[#5B43EE]' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    Store Pickup
                  </button>
                  <button 
                    onClick={() => setDeliveryMethod('COURIER')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border ${deliveryMethod === 'COURIER' ? 'bg-indigo-50 border-[#5B43EE] text-[#5B43EE]' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    Courier
                  </button>
                </div>
              </div>
              
              {deliveryMethod === 'COURIER' && (
                <div>
                  <input
                    type="text"
                    placeholder="Enter full shipping address..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#5B43EE] text-gray-900 placeholder:text-gray-400 bg-white"
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

      {/* GLOBAL BOUTIQUE DRAWER */}
      <BoutiqueDrawer
        open={isBoutiqueDrawerOpen}
        onClose={() => setIsBoutiqueDrawerOpen(false)}
      />

      {/* Product Details Modal */}
      <BottomSheet
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name || 'Product Details'}
      >
        {selectedProduct && (
          <div className="pb-safe">
            <div className="w-full h-[220px] bg-gray-50 rounded-[16px] mb-5 overflow-hidden relative shadow-sm border border-gray-100">
              {selectedProduct.image_url ? (
                <img src={formatImageUrl(selectedProduct.image_url) || undefined} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>
            
            <p className="text-[11px] font-bold text-[#5B43EE] uppercase tracking-wider mb-1.5">
              {selectedProduct.readymade_category?.name || selectedProduct.category_name || 'CATEGORY'}
            </p>
            
            <div className="flex items-start justify-between mb-5">
              <h2 className="text-[18px] font-bold text-[#0F172A] pr-4 leading-tight">{selectedProduct.name}</h2>
              <span className="text-[18px] font-bold text-[#5B43EE] whitespace-nowrap">
                ₹{Number(selectedProduct.selling_price || selectedProduct.price).toFixed(2)}
              </span>
            </div>
            
            <h3 className="text-[14px] font-bold text-[#0F172A] mb-1.5">Description</h3>
            <p className="text-[14px] text-[#64748B] mb-6 leading-relaxed">
              {selectedProduct.description || 'No description available.'}
            </p>
            
            <div className="pt-5 border-t border-gray-100">
              <Button 
                onClick={(e) => { addToCart(selectedProduct, e); setSelectedProduct(null); }} 
                className="w-full py-4 rounded-xl font-bold text-[15px] bg-[#5B43EE] text-white hover:bg-[#4f39ce]"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
