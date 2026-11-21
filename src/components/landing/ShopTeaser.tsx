"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getProducts, type Product } from "@/lib/orders";
import { inr } from "@/lib/store";
import { SectionIntro } from "@/components/ui/kit";

export default function ShopTeaser() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProducts().slice(0, 5));
  }, []);

  const hero = products.find((p) => p.category === "Rackets") ?? products[0];
  const rest = products.filter((p) => p.id !== hero?.id);
  const href = user ? "/dashboard/shop" : "/login";

  return (
    <section id="shop" className="border-b border-line bg-paper-deep py-16 md:py-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionIntro
            index="05"
            kicker="The pro shop"
            title={<>Gear that <span className="u-serif italic text-clay">shows up.</span></>}
            description="Rackets, balls, shuttles, shoes and the small things that save a match. Buy at the counter or from home — both draw from the same shelf."
          />
          <Link href={href} className="btn btn-ink btn-sm self-start">
            <ShoppingBag className="h-3.5 w-3.5" /> Browse the shop
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-6">
            {hero ? (
              <Link
                href={href}
                className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-ink bg-chalk p-6 transition hover:shadow-[6px_6px_0_0_var(--color-ink)] sm:p-8"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="u-eyebrow text-clay">{hero.brand} · {hero.category}</div>
                    <span className="chip chip-court">{hero.stock} in stock</span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <h3 className="u-display max-w-md text-[clamp(1.9rem,3.8vw,3rem)] leading-[0.92] text-ink">{hero.name}</h3>
                  </div>
                  <p className="mt-3 max-w-sm text-[12.5px] leading-relaxed text-muted">
                    Strung at the club by our racket desk, ready to collect before your next session. Member pricing applies automatically at checkout.
                  </p>
                </div>
                <div className="mt-8 flex items-end justify-between border-t border-line pt-5">
                  <div>
                    <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted">Retail</div>
                    <div className="u-value mt-1 text-3xl text-ink">{inr(hero.price)}</div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-clay">
                    Order it <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            ) : (
              <div className="h-full rounded-2xl border border-line bg-chalk p-8" />
            )}
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-ink bg-chalk">
              <div className="flex items-center justify-between border-b border-line bg-paper-soft px-5 py-3">
                <span className="u-eyebrow text-muted">On the shelf</span>
                <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted">Live stock</span>
              </div>
              <div>
                {(rest.length ? rest : Array.from({ length: 4 })).map((product, i) => {
                  const p = product as Product | undefined;
                  return (
                    <Link
                      key={p?.id ?? i}
                      href={href}
                      className="group flex items-center justify-between gap-4 border-b border-line-soft px-5 py-4 last:border-b-0 hover:bg-paper-soft/60"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="font-mono text-[9px] text-muted/60">0{i + 2}</span>
                        <div className="min-w-0">
                          <div className="truncate text-[12.5px] font-semibold text-ink group-hover:text-clay">{p?.name ?? "Loading"}</div>
                          <div className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">
                            {p ? p.category + " · " + p.stock + " in stock" : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="u-value text-[13px] text-ink">{p ? inr(p.price) : "—"}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted transition group-hover:text-clay" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, title: "One shelf", note: "Counter & online stock in sync" },
                { icon: ShoppingBag, title: "Tier pricing", note: "Gold 15% · Junior 10%" },
                { icon: Truck, title: "Pickup or delivery", note: "OTP-verified local courier" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-line bg-chalk px-4 py-3">
                    <Icon className="h-4 w-4 text-clay" />
                    <div className="mt-2 text-[11px] font-semibold text-ink">{item.title}</div>
                    <div className="mt-0.5 text-[10px] leading-snug text-muted">{item.note}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
