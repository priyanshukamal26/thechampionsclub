"use client";

import { motion } from "framer-motion";
import { ShoppingBag, ArrowUpRight, Flame, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface ProductItem {
  name: string;
  category: string;
  price: number;
  stock: number;
  tag: string;
  imageIcon: string;
}

const products: ProductItem[] = [
  {
    name: "Wilson Pro Staff V14 Racket",
    category: "Tennis Rackets",
    price: 18499,
    stock: 6,
    tag: "Pro Favorite",
    imageIcon: "🎾",
  },
  {
    name: "Babolat Counter Viper 2024",
    category: "Padel Racquets",
    price: 21999,
    stock: 4,
    tag: "High Demand",
    imageIcon: "🏓",
  },
  {
    name: "Yonex Power Cushion Eclipsion Z",
    category: "Indoor Footwear",
    price: 11499,
    stock: 9,
    tag: "All Court",
    imageIcon: "👟",
  },
  {
    name: "SG Player Ultimate Cricket Bat",
    category: "English Willow",
    price: 24999,
    stock: 3,
    tag: "Handcrafted",
    imageIcon: "🏏",
  },
];

export default function ShopTeaser() {
  return (
    <section id="shop" className="py-28 bg-[#0A0A0A] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#CCFF00] font-bold mb-3">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Single Unified Physical & Digital Shelf</span>
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase text-white">
              The Pro <span className="text-[#CCFF00]">Gear Shop</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#888888]">
            Rackets, match balls, precision shoes & custom stringing. Order online for clubhouse locker pickup or local express dispatch.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group bg-[#141414] border border-[#1F1F1F] hover:border-[#333333] rounded-3xl p-6 flex flex-col justify-between transition-all duration-300"
            >
              <div>
                {/* Product Image Area */}
                <div className="w-full aspect-square rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F] flex items-center justify-center text-6xl relative overflow-hidden mb-5 group-hover:scale-[1.02] transition-transform">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#CCFF00]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{item.imageIcon}</span>
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#CCFF00]">
                    {item.tag}
                  </span>
                </div>

                <div className="text-[11px] uppercase tracking-widest text-[#888888] font-semibold mb-1">
                  {item.category}
                </div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white leading-snug mb-3">
                  {item.name}
                </h3>
              </div>

              <div>
                <div className="flex items-center justify-between pt-4 border-t border-[#1F1F1F]">
                  <div>
                    <div className="text-lg font-extrabold text-white font-[family-name:var(--font-space-grotesk)]">
                      ₹{item.price.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-[#888888]">
                      {item.stock} units left in stock
                    </div>
                  </div>

                  <Link
                    href="/register"
                    className="w-9 h-9 rounded-full bg-[#1F1F1F] group-hover:bg-[#CCFF00] text-white group-hover:text-[#0A0A0A] flex items-center justify-center transition-colors shadow-md"
                    title="Order item"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Strip */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#141414]/50 border border-[#1F1F1F] flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#CCFF00]" />
            <div className="text-xs text-[#888888]">
              <span className="text-white font-bold block">Unified Stock Engine</span>
              Counter POS & Online cart share exact real-time inventory
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-[#141414]/50 border border-[#1F1F1F] flex items-center gap-3">
            <Flame className="w-5 h-5 text-[#FF4D00]" />
            <div className="text-xs text-[#888888]">
              <span className="text-white font-bold block">Member Tier Discounts</span>
              Gold (15%) and Junior (10%) auto-applied at checkout
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-[#141414]/50 border border-[#1F1F1F] flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#00B4FF]" />
            <div className="text-xs text-[#888888]">
              <span className="text-white font-bold block">Club Pickup or OTP Delivery</span>
              Zero-friction pickup or verified local staff courier
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
