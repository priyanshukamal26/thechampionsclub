"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  PackageCheck,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";
import { EmptyState, PageHeader, Panel, Stat, StatusPill } from "@/components/ui/kit";
import { Drawer, Segmented } from "@/components/ui/overlay";
import { useAuth } from "@/lib/auth-context";
import { MEMBERSHIP_PLANS } from "@/lib/membership";
import { formatDate, formatTime, inr } from "@/lib/store";
import {
  createOrder,
  getOrders,
  getProducts,
  priceCart,
  PRODUCT_CATEGORIES,
  type Order,
  type PaymentMode,
  type Product,
} from "@/lib/orders";
import { OrderStatusPill, PriceRows, QtyStepper } from "@/components/commerce/common";
import { OrderTimeline } from "@/components/commerce/OrderTimeline";
import { PaymentMethodDetails } from "@/components/commerce/PaymentMethodDetails";

const FULFILMENT_OPTIONS: { value: "pickup" | "delivery"; label: string }[] = [
  { value: "pickup", label: "Club pickup" },
  { value: "delivery", label: "Delivery · ₹99" },
];

const PAY_OPTIONS: { value: PaymentMode; label: string }[] = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
];

const POS_ROLES = ["owner", "manager", "shop_manager"];

export default function ShopPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [payMode, setPayMode] = useState<PaymentMode>("upi");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setProducts(getProducts());
    if (!user) {
      setMyOrders([]);
      return;
    }
    const key = user.fullName.toLowerCase();
    setMyOrders(
      getOrders()
        .filter((order) => order.channel === "shop" && (order.memberId === user.id || order.memberName.toLowerCase() === key))
        .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
    );
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const plan = MEMBERSHIP_PLANS[user?.planId || "silver"] ?? MEMBERSHIP_PLANS.silver;
  const discountPct = plan.shopDiscountPct;
  const isShopOwner = user?.role === "shop_manager" || user?.role === "owner";

  const lowStock = useMemo(() => products.filter((p) => p.stock <= p.lowStockAt), [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    for (const product of products) counts[product.category] = (counts[product.category] ?? 0) + 1;
    return counts;
  }, [products]);

  const categoryOptions: { value: string; label: string; count?: number }[] = useMemo(
    () => PRODUCT_CATEGORIES.map((cat) => ({ value: cat, label: cat, count: categoryCounts[cat] ?? 0 })),
    [categoryCounts]
  );

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (category !== "All" && product.category !== category) return false;
      if (!query) return true;
      return [product.name, product.brand, product.sku, product.sport, product.category]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [products, category, searchQuery]);

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const product = products.find((p) => p.id === id);
          return product ? { product, qty } : null;
        })
        .filter((line): line is { product: Product; qty: number } => line !== null),
    [cart, products]
  );

  const priced = useMemo(
    () => priceCart("shop", cartLines.map((line) => ({ refId: line.product.id, qty: line.qty })), plan.id),
    [cartLines, plan.id]
  );

  const cartCount = cartLines.reduce((sum, line) => sum + line.qty, 0);
  const deliveryFee = fulfilment === "delivery" ? 99 : 0;
  const grandTotal = priced.total + deliveryFee;
  const openOrders = myOrders.filter((order) => !["completed", "cancelled", "delivered"].includes(order.status)).length;
  const shelfUnits = products.reduce((sum, product) => sum + product.stock, 0);
  const canPos = user ? POS_ROLES.includes(user.role) : false;

  if (!user) return null;

  const addToCart = (product: Product) =>
    setCart((current) => {
      const next = (current[product.id] ?? 0) + 1;
      if (next > product.stock) return current;
      return { ...current, [product.id]: next };
    });

  const removeFromCart = (id: string) =>
    setCart((current) => {
      const next = (current[id] ?? 0) - 1;
      if (next <= 0) {
        const copy = { ...current };
        delete copy[id];
        return copy;
      }
      return { ...current, [id]: next };
    });

  const closeCart = () => {
    setShowCart(false);
    setPlacedOrder(null);
    setError("");
  };

  const placeOrder = () => {
    setError("");
    if (user?.status === "pending_consent") {
      setError("Under DPDP Act 2023, gear orders are locked pending parental consent verification.");
      return;
    }
    if (!cartLines.length) {
      setError("Your cart is empty.");
      return;
    }
    if (fulfilment === "delivery") {
      if (address.trim().length < 10) {
        setError("Add a delivery address — house, street, area, city and PIN.");
        return;
      }
      if (phone.replace(/\D/g, "").length < 10) {
        setError("Add a contact phone number for the delivery OTP.");
        return;
      }
    }
    const result = createOrder({
      channel: "shop",
      lines: cartLines.map((line) => ({ refId: line.product.id, qty: line.qty })),
      memberId: user.id,
      memberName: user.fullName,
      planId: plan.id,
      paymentMode: payMode,
      fulfilment,
      address: fulfilment === "delivery" ? address.trim() : undefined,
      phone: fulfilment === "delivery" ? phone.trim() : undefined,
    });
    if (!result.ok || !result.order) {
      setError(result.error ?? "The order could not be placed.");
      load();
      return;
    }
    setPlacedOrder(result.order);
    setCart({});
    load();
  };

  const memberPrice = (price: number) => price * (1 - discountPct / 100);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="The Pro Shop · C1–C6"
        title="The Pro Shop"
        description={
          <>
            One shelf for the whole club. Every line is live stock — online orders and the counter POS draw from it.{" "}
            {plan.name} members take {discountPct}% off, delivered to your door or boxed for the counter.
          </>
        }
        meta={
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="chip chip-court">{plan.name} · {discountPct}% off</span>
            <span className="chip">{products.length} catalogue lines</span>
            <span className="chip">Pickup 20 min · Delivery 60 min</span>
          </div>
        }
        actions={
          <>
            {canPos && (
              <Link href="/dashboard/pos" className="btn btn-outline btn-sm">
                <Store className="h-3.5 w-3.5" /> Counter POS
              </Link>
            )}
            <button type="button" onClick={() => setShowCart(true)} className="btn btn-ink btn-sm">
              <ShoppingCart className="h-3.5 w-3.5" /> Cart{cartCount > 0 ? ` · ${cartCount}` : ""}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Your privilege" value={`${discountPct}%`} unit="off" note={plan.name} />
        <Stat label="On the shelf" value={shelfUnits} unit="units" note={`${products.length} catalogue lines`} />
        <Stat label="Running low" value={lowStock.length} unit="lines" note="At or below reorder level" />
        <Stat label="Open orders" value={openOrders} unit="live" note={myOrders.length ? "Track them below" : "No orders yet"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Panel tone="deep" className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search brand, SKU, sport…"
                  aria-label="Search the pro shop catalogue"
                  className="input pl-9"
                />
              </div>
              <div className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted" aria-live="polite">
                {filtered.length} of {products.length} lines
              </div>
            </div>
            <Segmented options={categoryOptions} value={category} onChange={setCategory} size="sm" />
          </Panel>

          <Panel padded={false}>
            <div className="flex items-end justify-between gap-3 px-5 pt-5">
              <div>
                <div className="u-eyebrow text-clay">The shelf</div>
                <div className="u-display mt-1 text-xl text-ink">Product ledger</div>
              </div>
              <div className="hidden text-right sm:block">
                <div className="u-eyebrow text-muted">Member price</div>
                <div className="u-mono text-[10px] text-muted">GST at checkout</div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="px-5 py-8">
                <EmptyState
                  title="No lines match"
                  description="Try a different category or search the brand, SKU or sport."
                  action={
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setCategory("All");
                        setSearchQuery("");
                      }}
                    >
                      Reset filters
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="u-table min-w-[720px]">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th className="text-right">Stock</th>
                      <th className="text-right">Price</th>
                      <th className="text-right">Cart</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product) => {
                      const qty = cart[product.id] ?? 0;
                      const low = product.stock <= product.lowStockAt;
                      return (
                        <tr key={product.id}>
                          <td>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="u-mono text-[9px] uppercase tracking-[0.12em] text-muted">{product.sku}</span>
                              {product.tag && <span className="chip">{product.tag}</span>}
                            </div>
                            <div className="mt-0.5 text-[13px] font-semibold text-ink">{product.name}</div>
                            <div className="text-[10.5px] text-muted">{product.brand} · {product.sport}</div>
                          </td>
                          <td>
                            <span className="chip">{product.category}</span>
                          </td>
                          <td className="text-right">
                            <div className="u-value text-[13px] text-ink">{product.stock}</div>
                            {product.stock === 0 ? (
                              <StatusPill tone="danger" className="mt-1">
                                Out
                              </StatusPill>
                            ) : isShopOwner && low ? (
                              <StatusPill tone="warn" className="mt-1">
                                Low stock
                              </StatusPill>
                            ) : isShopOwner ? (
                              <div className="mt-1 text-[9.5px] text-muted">reorder at {product.lowStockAt}</div>
                            ) : null}
                          </td>
                          <td className="text-right">
                            <div className="u-value text-[13.5px] text-ink">{inr(memberPrice(product.price))}</div>
                            {discountPct > 0 && <div className="u-mono text-[10px] text-muted line-through">{inr(product.price)}</div>}
                          </td>
                          <td className="text-right">
                            {qty > 0 ? (
                              <QtyStepper
                                qty={qty}
                                onAdd={() => addToCart(product)}
                                onRemove={() => removeFromCart(product.id)}
                                canAdd={qty < product.stock}
                                addLabel={`Add one more ${product.name}`}
                                removeLabel={`Remove one ${product.name}`}
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => addToCart(product)}
                                disabled={product.stock === 0}
                                aria-label={`Add ${product.name} to cart`}
                                className="btn btn-outline btn-sm"
                              >
                                <Plus className="h-3 w-3" /> Add
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel className="space-y-4">
            <div>
              <div className="u-eyebrow text-clay">Your privilege</div>
              <div className="u-display mt-1 text-xl text-ink">{plan.name}</div>
            </div>
            <div className="space-y-2 text-[11.5px]">
              <div className="flex items-center justify-between gap-2 border-b border-line-soft pb-2">
                <span className="text-muted">Shop privilege</span>
                <span className="u-value text-court">−{discountPct}%</span>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-line-soft pb-2">
                <span className="text-muted">Club pickup</span>
                <span className="u-value text-ink">Free · 20 min</span>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-line-soft pb-2">
                <span className="text-muted">Home delivery</span>
                <span className="u-value text-ink">₹99 · 60 min</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted">GST</span>
                <span className="u-value text-ink">18% at checkout</span>
              </div>
            </div>
            <div className="rounded-xl border border-court/25 bg-court/5 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-court" />
                <span className="u-eyebrow text-court">Authenticity guarantee</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                100% genuine equipment sourced directly from authorized brand distributors. Full manufacturer warranty on all racquets and gear.
              </p>
            </div>
          </Panel>

          {isShopOwner ? (
            <Panel className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="u-eyebrow text-clay">Running low</div>
                <span className="u-value text-[11px] text-muted">{lowStock.length}</span>
              </div>
              {lowStock.length === 0 ? (
                <p className="text-[11.5px] text-muted">Everything is above its reorder level.</p>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {lowStock.slice(0, 6).map((product) => (
                    <li key={product.id} className="flex items-center justify-between gap-2 py-2">
                      <span className="min-w-0">
                        <span className="block truncate text-[11.5px] text-ink">{product.name}</span>
                        <span className="u-mono text-[9px] uppercase tracking-[0.12em] text-muted">{product.sku}</span>
                      </span>
                      <StatusPill tone={product.stock === 0 ? "danger" : "warn"}>
                        {product.stock === 0 ? "Out" : `${product.stock} left`}
                      </StatusPill>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          ) : (
            <Panel className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="u-eyebrow text-clay">Pro shop services</div>
                <span className="chip">Desk pickup</span>
              </div>
              <div className="space-y-2.5 text-[11.5px]">
                <div className="border-b border-line-soft pb-2">
                  <div className="font-semibold text-ink">Racquet Restringing</div>
                  <div className="text-[10.5px] text-muted">Drop before 18:00 IST for 24h precision stringing on our electronic machine.</div>
                </div>
                <div className="border-b border-line-soft pb-2">
                  <div className="font-semibold text-ink">Demo Racket Programme</div>
                  <div className="text-[10.5px] text-muted">Members can test any frame on Court 1 for 30 minutes free of charge.</div>
                </div>
                <div>
                  <div className="font-semibold text-ink">Grips & Lead Tape Tuning</div>
                  <div className="text-[10.5px] text-muted">Free installation at the counter with any grip purchase.</div>
                </div>
              </div>
            </Panel>
          )}

          <Panel tone="ink" className="space-y-3">
            <div className="u-eyebrow text-clay-soft">Need it today?</div>
            <p className="text-[11.5px] leading-relaxed text-chalk/60">
              Choose club pickup at the counter and collect in about 20 minutes. A pickup code is generated on every order.
            </p>
            <button type="button" onClick={() => setShowCart(true)} className="btn btn-outline-inv btn-sm btn-block">
              Review cart <ChevronRight className="h-3 w-3" />
            </button>
          </Panel>
        </aside>
      </div>

      <section id="my-orders" className="scroll-mt-20">
        <Panel className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="u-eyebrow text-clay">After the sale</div>
              <div className="u-display mt-1 text-xl text-ink">My orders</div>
            </div>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">{myOrders.length} shop order(s)</span>
          </div>
          {myOrders.length === 0 ? (
            <EmptyState
              title="No shop orders yet"
              description="Every pickup and delivery will appear here with a live status timeline and its pickup code or OTP."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setShowCart(true);
                  }}
                  className="btn btn-clay btn-sm"
                >
                  Start a cart
                </button>
              }
            />
          ) : (
            <div className="max-h-[560px] overflow-y-auto pr-1">
              <div className="grid gap-4 lg:grid-cols-2">
                {myOrders.map((order) => {
                  const unpaid = !order.paid;
                  return (
                    <article key={order.id} className="rounded-xl border border-line bg-paper-soft p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="u-value text-[15px] text-ink">{order.code}</div>
                          <div className="u-mono mt-1 text-[9.5px] uppercase tracking-[0.12em] text-muted">
                            {formatDate(order.placedAt.slice(0, 10), { day: "numeric", month: "short" })} · {formatTime(order.placedAt)} IST
                          </div>
                        </div>
                        <OrderStatusPill status={order.status} />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="chip chip-ink">
                          {order.fulfilment === "delivery" ? <Truck className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                          {order.fulfilment === "delivery" ? "Delivery" : "Club pickup"}
                        </span>
                        <span className="chip">{order.lines.reduce((sum, line) => sum + line.qty, 0)} items</span>
                        {order.fulfilment === "delivery" && order.otp && <span className="chip chip-clay">OTP {order.otp}</span>}
                        {order.fulfilment !== "delivery" && order.pickupCode && <span className="chip chip-court">Pickup {order.pickupCode}</span>}
                        {order.etaMin && <span className="chip">ETA {order.etaMin}m</span>}
                      </div>
                      <div className="mt-3 space-y-1">
                        {order.lines.map((line, index) => (
                          <div key={`${order.id}-${index}`} className="flex items-center justify-between gap-2 text-[11.5px]">
                            <span className="truncate text-ink">{line.qty}× {line.name}</span>
                            <span className="u-value shrink-0 text-muted">{inr(line.unitPrice * line.qty)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2">
                        <span className="text-[11px] text-muted">{unpaid ? "Payment pending" : `Paid · ${order.paymentMode.toUpperCase()}`}</span>
                        <span className="u-value text-[14px] text-ink">{inr(order.total)}</span>
                      </div>
                      <OrderTimeline order={order} className="mt-3" />
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </Panel>
      </section>

      <Drawer
        open={showCart}
        onClose={closeCart}
        eyebrow="Pro shop checkout"
        title={placedOrder ? "Order placed" : `Your cart${cartCount > 0 ? ` · ${cartCount}` : ""}`}
        footer={
          placedOrder ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  window.setTimeout(() => document.getElementById("my-orders")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
                }}
                className="btn btn-ink btn-block"
              >
                View my orders
              </button>
              <button type="button" onClick={closeCart} className="btn btn-outline btn-block btn-sm">
                Keep shopping
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {user?.status === "pending_consent" && (
                <p className="rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1.5 text-[10.5px] text-[#7d5d17] leading-relaxed">
                  Parental consent verification required under DPDP Act 2023. Gear purchases are locked.
                </p>
              )}
              {error && (
                <p role="alert" className="flex items-start gap-2 text-[11.5px] text-clay-deep">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={placeOrder}
                disabled={!cartLines.length || user?.status === "pending_consent"}
                className="btn btn-clay btn-block"
              >
                {user?.status === "pending_consent" ? "Locked (Consent Pending)" : `Place order · ${inr(grandTotal)}`}
              </button>
              <button type="button" onClick={closeCart} className="btn btn-outline btn-block btn-sm">
                Keep browsing
              </button>
            </div>
          )
        }
      >
        {placedOrder ? (
          <div className="space-y-4">
            <Panel tone="court" className="space-y-1">
              <div className="u-eyebrow text-clay-soft">Order code</div>
              <div className="u-display text-2xl text-chalk">{placedOrder.code}</div>
              <p className="text-[11.5px] text-chalk/70">
                {placedOrder.fulfilment === "delivery" ? "Courier from the club to your door." : "Boxed and waiting at the Pro Shop counter."}
              </p>
            </Panel>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-paper-soft p-3">
                <div className="u-eyebrow text-muted">{placedOrder.fulfilment === "delivery" ? "Delivery OTP" : "Pickup code"}</div>
                <div className="u-value mt-1 text-2xl text-ink">
                  {placedOrder.fulfilment === "delivery" ? placedOrder.otp : placedOrder.pickupCode}
                </div>
              </div>
              <div className="rounded-xl border border-line bg-paper-soft p-3">
                <div className="u-eyebrow text-muted">Ready in</div>
                <div className="u-value mt-1 text-2xl text-ink">
                  {placedOrder.etaMin ?? 20}
                  <span className="ml-1 text-[10px] text-muted">min</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-line p-4">
              <div className="u-eyebrow mb-2 text-muted">Order summary</div>
              <div className="space-y-1">
                {placedOrder.lines.map((line, index) => (
                  <div key={`${placedOrder.id}-${index}`} className="flex items-center justify-between gap-2 text-[11.5px]">
                    <span className="truncate text-ink">{line.qty}× {line.name}</span>
                    <span className="u-value shrink-0 text-muted">{inr(line.unitPrice * line.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-line pt-3">
                <PriceRows
                  subtotal={placedOrder.subtotal}
                  discountPct={placedOrder.discountPct}
                  discount={placedOrder.discount}
                  gst={placedOrder.gst}
                  deliveryFee={placedOrder.deliveryFee}
                  total={placedOrder.total}
                  discountLabel="Privilege"
                />
              </div>
            </div>
            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted">
              <Phone className="mt-0.5 h-3 w-3 shrink-0" />
              {placedOrder.fulfilment === "delivery"
                ? "The courier will ask for this OTP at handover. Stock has been reserved from the club shelf."
                : "Show this pickup code at the counter. Stock has been reserved from the club shelf."}
            </p>
          </div>
        ) : cartLines.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Add a racket, a can of balls or a tee from the shelf and it will show up here."
            action={
              <button type="button" onClick={closeCart} className="btn btn-clay btn-sm">
                Back to the shelf
              </button>
            }
          />
        ) : (
          <div className="space-y-5">
            <div className="space-y-3">
              {cartLines.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-soft p-3">
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-semibold text-ink">{product.name}</div>
                    <div className="u-mono mt-0.5 text-[9.5px] uppercase tracking-[0.12em] text-muted">
                      {product.sku} · {inr(memberPrice(product.price))} each
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted">{product.stock} on shelf</div>
                  </div>
                  <QtyStepper
                    qty={qty}
                    onAdd={() => addToCart(product)}
                    onRemove={() => removeFromCart(product.id)}
                    canAdd={qty < product.stock}
                    addLabel={`Add one more ${product.name}`}
                    removeLabel={`Remove one ${product.name}`}
                  />
                </div>
              ))}
            </div>

            <div>
              <div className="u-eyebrow mb-2 text-muted">Fulfilment</div>
              <Segmented options={FULFILMENT_OPTIONS} value={fulfilment} onChange={(value) => setFulfilment(value)} />
              {fulfilment === "delivery" ? (
                <div className="mt-3 space-y-3">
                  <label className="block">
                    <span className="u-label">Delivery address</span>
                    <textarea
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="Flat, building, street, area, city, PIN"
                      className="input min-h-[76px] resize-y"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="u-label">Contact phone</span>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+91 98xxx xxxxx"
                      inputMode="tel"
                      className="input"
                      required
                    />
                  </label>
                  <p className="text-[10.5px] text-muted">Delivery requires both an address and a phone number for the OTP handover. ₹99 fee applies.</p>
                </div>
              ) : (
                <p className="mt-2 text-[11px] leading-relaxed text-muted">
                  Free collection at the Pro Shop counter, 7am–10pm IST. A pickup code is generated the moment you order.
                </p>
              )}
            </div>

            <div>
              <div className="u-eyebrow mb-2 text-muted">Payment</div>
              <Segmented options={PAY_OPTIONS} value={payMode} onChange={(value) => setPayMode(value)} />
              <div className="mt-2.5">
                <PaymentMethodDetails mode={payMode} amount={grandTotal} />
              </div>
            </div>

            <div className="rounded-xl border border-line bg-paper-soft p-4">
              <PriceRows
                subtotal={priced.subtotal}
                discountPct={priced.discountPct}
                discount={priced.discount}
                gst={priced.gst}
                deliveryFee={deliveryFee}
                total={grandTotal}
                discountLabel={`${plan.name} privilege`}
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
