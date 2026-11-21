"use client";

import { useState } from "react";
import { Coffee, Utensils, Zap, Plus, Minus, Check, Users, ChefHat } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { MEMBERSHIP_PLANS, getMemberById, SEED_MEMBERS } from "@/lib/membership";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  emoji: string;
  popular?: boolean;
  veg: boolean;
}

const MENU: MenuItem[] = [
  { id: "m1", name: "Double Espresso", category: "Beverages", price: 180, description: "Rich dark roast, served hot or iced", emoji: "☕", popular: true, veg: true },
  { id: "m2", name: "Electrolyte Power Cooler", category: "Beverages", price: 220, description: "Orange + coconut water + essential salts", emoji: "🥤", popular: true, veg: true },
  { id: "m3", name: "Whey Isolate Protein Shake", category: "Beverages", price: 350, description: "Chocolate / Vanilla / Banana · 30g protein", emoji: "💪", popular: true, veg: true },
  { id: "m4", name: "Fresh Mint Lime Soda", category: "Beverages", price: 120, description: "Sweet or salted with crushed mountain ice", emoji: "🍋", veg: true },
  { id: "m5", name: "Paneer Tikka Protein Wrap", category: "Mains", price: 320, description: "Grilled cottage cheese, mint salsa, whole wheat wrap", emoji: "🌯", popular: true, veg: true },
  { id: "m6", name: "Grilled Chicken Club Sandwich", category: "Mains", price: 380, description: "Multigrain bread, roasted chicken breast, egg white", emoji: "🥪", veg: false },
  { id: "m7", name: "Athlete Quinoa Power Bowl", category: "Mains", price: 420, description: "Edamame, avocado, sprouts, roasted nuts, tahini", emoji: "🥗", popular: true, veg: true },
  { id: "m8", name: "Sourdough Toast & Guacamole", category: "Mains", price: 280, description: "Artisanal sourdough, smashed hass avocado, chili flakes", emoji: "🍞", veg: true },
  { id: "m9", name: "Peri-Peri Sweet Potato Wedges", category: "Snacks", price: 180, description: "Air-fried with Himalayan pink salt", emoji: "🍟", veg: true },
  { id: "m10", name: "Loaded Post-Match Nachos", category: "Snacks", price: 350, description: "Corn chips, black beans, jalapeños, low-fat queso", emoji: "🧀", veg: true },
  { id: "m11", name: "Craft Wheat Beer (Pint)", category: "Bar", price: 350, description: "Locally brewed Belgian witbier on tap", emoji: "🍺", veg: true },
  { id: "m12", name: "Virgin Citrus Mojito", category: "Bar", price: 250, description: "Crushed kaffir lime, spearmint leaves, club soda", emoji: "🍹", veg: true },
];

const CATEGORIES = ["All", "Beverages", "Mains", "Snacks", "Bar"];

const TABLES = Array.from({ length: 12 }, (_, i) => ({
  id: `t${i + 1}`,
  name: `Table ${i + 1}`,
  seats: i < 4 ? 2 : i < 8 ? 4 : 6,
  status: i === 6 ? ("occupied" as const) : i === 3 ? ("reserved" as const) : ("available" as const),
}));

export default function BarPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState("All");
  const [order, setOrder] = useState<Record<string, number>>({});
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "tables">("menu");

  if (!user) return null;

  const plan = MEMBERSHIP_PLANS[user.planId || "silver"] || MEMBERSHIP_PLANS.silver;
  const discount = plan.barDiscountPct;

  const currentMember =
    (user.email && getMemberById(user.email)) ||
    (user.planId && SEED_MEMBERS.find((m) => m.planId === user.planId)) ||
    SEED_MEMBERS[0];

  const filtered = MENU.filter((m) => category === "All" || m.category === category);

  const addItem = (id: string) => setOrder((o) => ({ ...o, [id]: (o[id] || 0) + 1 }));
  const removeItem = (id: string) =>
    setOrder((o) => {
      const n = (o[id] || 0) - 1;
      if (n <= 0) {
        const { [id]: _, ...rest } = o;
        return rest;
      }
      return { ...o, [id]: n };
    });

  const orderItems = Object.entries(order)
    .map(([id, qty]) => ({ item: MENU.find((m) => m.id === id)!, qty }))
    .filter((i) => i.item);

  const subtotal = orderItems.reduce((s, i) => s + i.item.price * i.qty, 0);
  const discountAmt = Math.round((subtotal * discount) / 100);
  const total = subtotal - discountAmt;
  const itemCount = Object.values(order).reduce((s, v) => s + v, 0);

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      setOrder({});
      setOrderPlaced(false);
    }, 2800);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-orange-400 block mb-1">
          Post-Match Bar & Cafeteria (D1–D8)
        </span>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-extrabold uppercase text-white">
          Lounge & Recovery Fuel
        </h1>
        <p className="text-xs text-[#888888] mt-1">
          {plan.name} privilege: <span className="text-orange-400 font-bold">{discount}% discount on tabs</span> · Order to court or reserve table
        </p>
      </div>

      {/* Unsettled Tab Banner */}
      {currentMember.duesPending > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-red-300">
            <Coffee className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <span className="font-bold">Active Cafeteria Tab:</span>{" "}
              <span className="font-mono text-white font-bold">₹{currentMember.duesPending.toFixed(2)}</span> pending settlement.
            </div>
          </div>
          <button className="text-xs font-bold uppercase bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl transition-colors">
            Clear With Cashier
          </button>
        </div>
      )}

      {/* Sub-nav: Menu vs Floor Plan */}
      <div className="inline-flex p-1.5 rounded-2xl bg-[#141414] border border-[#222222]">
        <button
          onClick={() => setActiveTab("menu")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === "menu"
              ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              : "text-[#888888] hover:text-white"
          }`}
        >
          <Utensils className="w-3.5 h-3.5" /> Food & Drink Menu
        </button>
        <button
          onClick={() => setActiveTab("tables")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === "tables"
              ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              : "text-[#888888] hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Table Floor Map ({TABLES.filter((t) => t.status === "available").length} Free)
        </button>
      </div>

      {activeTab === "menu" && (
        <>
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  category === cat
                    ? "bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                    : "bg-[#141414] border border-[#222222] text-[#888888] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const memberPrice = Math.round(item.price * (1 - discount / 100));
              const qty = order[item.id] || 0;
              return (
                <div key={item.id} className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5 hover:border-[#333333] transition-all group relative">
                  {item.popular && (
                    <span className="absolute top-3 right-3 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                      Top Choice
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm border ${item.veg ? "border-green-500" : "border-red-500"}`}>
                          <div className={`w-1.5 h-1.5 rounded-full m-0.5 ${item.veg ? "bg-green-500" : "bg-red-500"}`} />
                        </div>
                        <div className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">{item.name}</div>
                      </div>
                      <div className="text-[10px] text-[#777777] mt-0.5">{item.description}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-end gap-2">
                      <span className="text-base font-extrabold text-white font-mono">₹{memberPrice}</span>
                      {discount > 0 && <span className="text-[10px] text-[#555555] line-through font-mono">₹{item.price}</span>}
                    </div>
                    {qty > 0 ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-lg bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">{qty}</span>
                        <button onClick={() => addItem(item.id)} className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addItem(item.id)} className="inline-flex items-center gap-1.5 bg-[#0D0D0D] border border-[#333333] text-white hover:border-orange-500 hover:bg-orange-500/10 font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition-all">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "tables" && (
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Table for Service</h3>
            <div className="flex items-center gap-3 text-[10px] text-[#888888]">
              <span className="flex items-center gap-1">🟢 Available</span>
              <span className="flex items-center gap-1">🟡 Reserved</span>
              <span className="flex items-center gap-1">🔴 Occupied</span>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {TABLES.map((table) => (
              <button
                key={table.id}
                onClick={() => table.status === "available" && setSelectedTable(table.id)}
                disabled={table.status !== "available"}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  selectedTable === table.id
                    ? "bg-orange-500/15 border-orange-500 text-orange-400"
                    : table.status === "available"
                    ? "bg-[#0D0D0D] border-[#222222] text-white hover:border-[#444444]"
                    : "bg-[#0D0D0D] border-[#1A1A1A] text-[#444444] cursor-not-allowed"
                }`}
              >
                <div className="text-xl mb-1">{table.status === "occupied" ? "🔴" : table.status === "reserved" ? "🟡" : "🟢"}</div>
                <div className="text-xs font-bold">{table.name}</div>
                <div className="text-[10px] text-[#777777]">{table.seats} seats</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Order Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 lg:left-64 z-20 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-[#1F1F1F] p-4 shadow-2xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white">{itemCount} items ordered</div>
              <div className="text-xs text-[#888888]">
                {selectedTable ? `Delivering to ${TABLES.find((t) => t.id === selectedTable)?.name}` : "Pickup at Lounge Counter"} ·{" "}
                {discount > 0 && <span className="text-orange-400 font-bold">{discount}% discount applied</span>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-lg font-extrabold text-[#CCFF00] font-mono">₹{total}</div>
              {orderPlaced ? (
                <div className="inline-flex items-center gap-2 bg-green-500/15 text-green-400 font-bold text-xs uppercase px-6 py-3 rounded-xl border border-green-500/30">
                  <Check className="w-4 h-4" /> Order Sent to Kitchen!
                </div>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-95"
                >
                  <ChefHat className="w-4 h-4" /> Place Lounge Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
