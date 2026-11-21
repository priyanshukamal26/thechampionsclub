"use client";

import { useState } from "react";
import { ShoppingBag, Search, Plus, Minus, ShoppingCart, Check, Star, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { MEMBERSHIP_PLANS } from "@/lib/membership";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  rating: number;
  bestseller?: boolean;
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "Pro Staff 97 V14 Racket", brand: "Wilson", category: "Rackets", price: 22990, stock: 3, image: "🎾", rating: 4.8, bestseller: true },
  { id: "p2", name: "Pure Aero 2024 Racket", brand: "Babolat", category: "Rackets", price: 21500, stock: 5, image: "🎾", rating: 4.7 },
  { id: "p3", name: "Aeronaut 9000i Racket", brand: "Yonex", category: "Rackets", price: 8990, stock: 8, image: "🏸", rating: 4.6 },
  { id: "p4", name: "US Open Extra Duty Balls (4-can)", brand: "Wilson", category: "Balls", price: 799, stock: 24, image: "🟡", rating: 4.5, bestseller: true },
  { id: "p5", name: "Mavis 350 Shuttlecocks (6-tube)", brand: "Yonex", category: "Shuttlecocks", price: 450, stock: 30, image: "🏸", rating: 4.3 },
  { id: "p6", name: "Elite Padel Overgrip (3-pack)", brand: "Head", category: "Accessories", price: 599, stock: 15, image: "🎯", rating: 4.2 },
  { id: "p7", name: "Dri-FIT Court Performance Tee", brand: "Nike", category: "Apparel", price: 2499, stock: 12, image: "👕", rating: 4.4, bestseller: true },
  { id: "p8", name: "Gel-Resolution 9 Clay Shoes", brand: "ASICS", category: "Footwear", price: 10990, stock: 4, image: "👟", rating: 4.9, bestseller: true },
  { id: "p9", name: "Whey Protein Isolate 1kg", brand: "MuscleBlaze", category: "Nutrition", price: 2199, stock: 10, image: "💪", rating: 4.1 },
  { id: "p10", name: "Leather Match Cricket Ball", brand: "SG", category: "Balls", price: 1299, stock: 18, image: "🏏", rating: 4.0 },
];

const CATEGORIES = ["All", "Rackets", "Balls", "Shuttlecocks", "Accessories", "Apparel", "Footwear", "Nutrition"];

export default function ShopPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!user) return null;

  const plan = MEMBERSHIP_PLANS[user.planId || "silver"] || MEMBERSHIP_PLANS.silver;
  const discount = plan.shopDiscountPct;

  const filtered = PRODUCTS
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

  const addToCart = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeFromCart = (id: string) => setCart((c) => {
    const n = (c[id] || 0) - 1;
    if (n <= 0) { const { [id]: _, ...rest } = c; return rest; }
    return { ...c, [id]: n };
  });

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === id)!, qty }))
    .filter((i) => i.product);

  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const discountAmt = Math.round((subtotal * discount) / 100);
  const gst = Math.round((subtotal - discountAmt) * 0.18);
  const total = subtotal - discountAmt + gst;
  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0);

  const handleCheckout = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      setCart({});
      setOrderPlaced(false);
      setShowCart(false);
    }, 2800);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-purple-400 block mb-1">
            Official Pro Shop (C1–C6)
          </span>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-extrabold uppercase text-white">
            Gear & Racquet Services
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            {plan.name} privilege: <span className="text-purple-400 font-bold">{discount}% discount applied</span> · Counter pickup or court delivery
          </p>
        </div>

        {/* Cart Trigger */}
        <button
          onClick={() => setShowCart(true)}
          className="relative p-3 rounded-2xl bg-[#141414] border border-[#222222] hover:border-purple-500/50 transition-colors"
        >
          <ShoppingCart className="w-5 h-5 text-purple-400" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Wilson, Babolat, Yonex, balls, grips, shoes..."
            className="w-full bg-[#0D0D0D] border border-[#222222] focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#555555] outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                category === cat
                  ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : "bg-[#141414] border border-[#222222] text-[#888888] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => {
          const memberPrice = Math.round(product.price * (1 - discount / 100));
          const qty = cart[product.id] || 0;
          return (
            <div key={product.id} className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5 hover:border-[#333333] transition-all group relative">
              {product.bestseller && (
                <span className="absolute top-3 right-3 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
                  Popular
                </span>
              )}
              <div className="text-4xl mb-4">{product.image}</div>
              <div className="text-[10px] uppercase font-bold text-[#777777]">{product.brand}</div>
              <div className="text-sm font-bold text-white mt-0.5 group-hover:text-purple-300 transition-colors">{product.name}</div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[10px] text-[#888888]">{product.rating}</span>
                <span className="text-[10px] text-[#555555]">· {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-lg font-extrabold text-white font-mono">₹{memberPrice.toLocaleString("en-IN")}</span>
                {discount > 0 && (
                  <span className="text-xs text-[#666666] line-through font-mono">₹{product.price.toLocaleString("en-IN")}</span>
                )}
                {discount > 0 && (
                  <span className="text-[9px] font-bold text-purple-400 uppercase">-{discount}%</span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2">
                {qty > 0 ? (
                  <div className="flex items-center gap-2 w-full justify-between bg-[#0D0D0D] border border-[#222222] p-1.5 rounded-xl">
                    <button onClick={() => removeFromCart(product.id)} className="w-7 h-7 rounded-lg bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold text-white">{qty} in cart</span>
                    <button onClick={() => addToCart(product.id)} className="w-7 h-7 rounded-lg bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0D0D0D] border border-[#333333] text-white hover:border-purple-500 hover:bg-purple-500/10 font-bold text-xs uppercase py-2.5 rounded-xl transition-all disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-[#0A0A0A] border-l border-[#1F1F1F] p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-extrabold uppercase text-white">
                Pro Shop Cart ({cartCount})
              </h3>
              <button onClick={() => setShowCart(false)} className="p-2 rounded-lg hover:bg-[#222222] text-[#888888] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-xs text-[#666666]">Your cart is currently empty.</div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cartItems.map(({ product, qty }) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#141414] border border-[#1F1F1F]">
                      <span className="text-2xl">{product.image}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{product.name}</div>
                        <div className="text-[10px] text-[#888888]">₹{Math.round(product.price * (1 - discount / 100)).toLocaleString("en-IN")} × {qty}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => removeFromCart(product.id)} className="w-6 h-6 rounded bg-[#222222] text-white flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold text-white w-4 text-center">{qty}</span>
                        <button onClick={() => addToCart(product.id)} className="w-6 h-6 rounded bg-purple-500 text-white flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 p-4 rounded-xl bg-[#141414] border border-[#1F1F1F] text-xs mb-6">
                  <div className="flex justify-between text-[#888888]"><span>Subtotal (MRP)</span><span className="font-mono text-white">₹{subtotal.toLocaleString("en-IN")}</span></div>
                  {discount > 0 && <div className="flex justify-between text-purple-400"><span>{plan.name} Privilege ({discount}%)</span><span className="font-mono">-₹{discountAmt.toLocaleString("en-IN")}</span></div>}
                  <div className="flex justify-between text-[#888888]"><span>GST (18%)</span><span className="font-mono text-white">₹{gst.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between text-white font-bold border-t border-[#222222] pt-2 mt-2"><span>Total Amount</span><span className="font-mono text-[#CCFF00]">₹{total.toLocaleString("en-IN")}</span></div>
                </div>

                {orderPlaced ? (
                  <div className="w-full inline-flex items-center justify-center gap-2 bg-green-500/15 text-green-400 font-bold text-xs uppercase py-4 rounded-xl border border-green-500/30">
                    <Check className="w-4 h-4" /> Order Reserved! Ready for counter collection.
                  </div>
                ) : (
                  <button onClick={handleCheckout} className="w-full bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    Place Order · ₹{total.toLocaleString("en-IN")}
                  </button>
                )}
                <p className="text-[10px] text-[#555555] text-center mt-3">Payment collected via UPI / Card at front desk or pro shop counter.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
