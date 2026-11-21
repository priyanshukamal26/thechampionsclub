"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Minus,
  Plus,
  Receipt,
  ScanLine,
  Search,
  ShoppingCart,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/ui/kit";
import { Modal, Segmented } from "@/components/ui/overlay";
import { PaymentMethodDetails } from "@/components/commerce/PaymentMethodDetails";
import { useAuth } from "@/lib/auth-context";
import {
  PRODUCT_CATEGORIES,
  createOrder,
  getOrders,
  getProducts,
  lowStockProducts,
  priceCart,
  type PaymentMode,
  type Product,
} from "@/lib/orders";
import { getLocalMembers, MEMBERSHIP_PLANS, type ClubMember } from "@/lib/membership";
import { recordAuditLog } from "@/lib/audit";
import { inr } from "@/lib/store";
import { cn } from "@/lib/utils";

type CartLine = { refId: string; qty: number };

export default function ShopPosPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [version, setVersion] = useState(0);
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [memberId, setMemberId] = useState<string>("");
  const [mode, setMode] = useState<PaymentMode>("upi");
  const [receipt, setReceipt] = useState<{ code: string; total: number; changeNote: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const products = useMemo(() => (mounted ? getProducts() : []), [mounted, version]);
  const members = useMemo(() => (mounted ? getLocalMembers() : []), [mounted]);
  const member: ClubMember | undefined = members.find((m) => m.id === memberId);
  const plan = member ? MEMBERSHIP_PLANS[member.planId] : undefined;

  const visible = products.filter((product) => {
    const inCategory = category === "All" || product.category === category;
    const q = query.trim().toLowerCase();
    const matches =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q);
    return inCategory && matches;
  });

  const priced = useMemo(
    () => (mounted ? priceCart("shop", cart, member?.planId) : { items: [], subtotal: 0, discount: 0, discountPct: 0, gst: 0, total: 0, deliveryFee: 0 }),
    [mounted, cart, member?.planId, version]
  );

  const add = (product: Product) => {
    const existing = cart.find((l) => l.refId === product.id);
    const nextQty = (existing?.qty ?? 0) + 1;
    if (nextQty > product.stock) return;
    setError(null);
    setCart((prev) =>
      existing
        ? prev.map((l) => (l.refId === product.id ? { ...l, qty: nextQty } : l))
        : [...prev, { refId: product.id, qty: 1 }]
    );
  };

  const remove = (refId: string) => {
    setCart((prev) =>
      prev.flatMap((line) =>
        line.refId !== refId ? [line] : line.qty > 1 ? [{ ...line, qty: line.qty - 1 }] : []
      )
    );
  };

  const charge = () => {
    if (!cart.length) return;
    const result = createOrder({
      channel: "shop",
      lines: cart,
      memberId: member?.id,
      memberName: member?.fullName ?? "Walk-in guest",
      planId: member?.planId,
      paymentMode: mode,
      fulfilment: "pickup",
      staff: user?.fullName,
    });
    if (!result.ok || !result.order) {
      setError(result.error ?? "Could not complete the sale.");
      return;
    }
    recordAuditLog({
      actor: user?.fullName,
      role: user?.role,
      action: "pos.sale",
      entity: "orders",
      entityId: result.order.id,
      details: { code: result.order.code, total: result.order.total, mode, items: cart.length },
    });
    setReceipt({
      code: result.order.code,
      total: result.order.total,
      changeNote: `Paid by ${mode.toUpperCase()} · ${result.order.lines.length} line(s)`,
    });
    setCart([]);
    setError(null);
    setVersion((v) => v + 1);
  };

  const todaySales = useMemo(() => {
    if (!mounted) return { count: 0, gross: 0 };
    const today = new Date().toISOString().slice(0, 10);
    const orders = getOrders().filter(
      (o) => o.channel === "shop" && o.placedAt.slice(0, 10) === today && o.status !== "cancelled"
    );
    return { count: orders.length, gross: orders.reduce((s, o) => s + o.total, 0) };
  }, [mounted, version]);

  const low = useMemo(() => (mounted ? lowStockProducts() : []), [mounted, version]);

  if (!mounted) {
    return <div className="mx-auto max-w-[1400px] p-6"><div className="h-96 animate-pulse rounded-2xl bg-ink/[0.05]" /></div>;
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Counter POS · C4"
        title="Sell from the shelf."
        description="Counter sales draw from the same stock count as online orders. Member discounts apply automatically once a member is attached."
        actions={
          <Link href="/dashboard/shop" className="btn btn-outline btn-sm">
            <ShoppingCart className="h-3.5 w-3.5" />
            Online orders
          </Link>
        }
        meta={
          <>
            <StatusPill tone="success">
              <ScanLine className="h-3 w-3" /> Barcode-ready counter
            </StatusPill>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {todaySales.count} sales today · {inr(todaySales.gross)}
            </span>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {low.length} products low on stock
            </span>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Panel padded={false}>
            <div className="flex flex-col gap-3 border-b border-line p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px] flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                  <input
                    className="input pl-8"
                    placeholder="Scan or search a product, brand or SKU…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Search products"
                  />
                </div>
                <select
                  className="select max-w-[220px]"
                  value={memberId}
                  onChange={(event) => setMemberId(event.target.value)}
                  aria-label="Attach a member"
                >
                  <option value="">Walk-in guest</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} · {MEMBERSHIP_PLANS[m.planId].shortName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
                {PRODUCT_CATEGORIES.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
                      category === item
                        ? "border-ink bg-ink text-chalk"
                        : "border-line text-muted hover:border-ink/40 hover:text-ink"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto p-3">
              {visible.length === 0 ? (
                <EmptyState title="No products match" description="Clear the search or pick another category." />
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((product) => {
                    const out = product.stock <= 0;
                    const inCart = cart.find((l) => l.refId === product.id)?.qty ?? 0;
                    return (
                      <button
                        key={product.id}
                        onClick={() => add(product)}
                        disabled={out || inCart >= product.stock}
                        className={cn(
                          "flex flex-col rounded-xl border bg-paper-soft p-3 text-left transition-colors",
                          out ? "cursor-not-allowed opacity-50" : "hover:border-ink hover:bg-chalk",
                          inCart > 0 && "border-clay/50 bg-clay/[0.04]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="u-eyebrow text-[8.5px]">{product.category}</span>
                          <span
                            className={cn(
                              "u-mono text-[9px]",
                              product.stock <= product.lowStockAt ? "text-clay" : "text-muted"
                            )}
                          >
                            {out ? "Out" : `${product.stock} left`}
                          </span>
                        </div>
                        <span className="mt-1 text-[12px] font-medium leading-tight">{product.name}</span>
                        <span className="text-[10px] text-muted">{product.brand} · {product.sku}</span>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="u-value text-[12.5px]">{inr(product.price)}</span>
                          {inCart > 0 && (
                            <span className="u-mono rounded-full bg-clay px-1.5 py-0.5 text-[9px] text-chalk">
                              {inCart} in cart
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Panel>
        </div>

        <div className="xl:col-span-4">
          <Panel className="sticky top-4" padded={false}>
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <div className="u-display text-[13px]">Current sale</div>
                <div className="text-[10.5px] text-muted">
                  {member ? `${member.fullName} · ${plan?.shortName}` : "Walk-in guest · no discount"}
                </div>
              </div>
              <StatusPill tone={cart.length ? "clay" : "neutral"}>{cart.length} lines</StatusPill>
            </div>

            <div className="max-h-[320px] overflow-y-auto px-4">
              {priced.items.length === 0 ? (
                <div className="py-10 text-center">
                  <ShoppingCart className="mx-auto h-6 w-6 text-muted/50" />
                  <p className="mt-2 text-[11px] text-muted">Tap a product to start the sale.</p>
                </div>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {priced.items.map((line) => (
                    <li key={line.refId} className="flex items-center gap-2 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[11.5px] font-medium">{line.name}</div>
                        <div className="u-mono text-[9.5px] text-muted">
                          {inr(line.unitPrice)} each
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => remove(line.refId)}
                          className="rounded-full border border-line p-1 text-muted hover:border-ink hover:text-ink"
                          aria-label={`Remove one ${line.name}`}
                        >
                          {line.qty > 1 ? <Minus className="h-3 w-3" /> : <Trash2 className="h-3 w-3" />}
                        </button>
                        <span className="u-value w-5 text-center text-[11.5px]">{line.qty}</span>
                        <button
                          onClick={() => {
                            const product = products.find((p) => p.id === line.refId);
                            if (product) add(product);
                          }}
                          className="rounded-full border border-line p-1 text-muted hover:border-ink hover:text-ink"
                          aria-label={`Add one ${line.name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="u-value w-16 text-right text-[11.5px]">
                        {inr(line.unitPrice * line.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-line px-4 py-3">
              <div className="space-y-1.5 text-[11.5px]">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="u-value text-ink">{inr(priced.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Member discount {priced.discountPct > 0 ? `(${priced.discountPct}%)` : ""}</span>
                  <span className={cn("u-value", priced.discount > 0 ? "text-court" : "text-ink")}>
                    −{inr(priced.discount)}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>GST @ 18%</span>
                  <span className="u-value text-ink">{inr(priced.gst)}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-2">
                  <span className="u-display text-[12px]">Total</span>
                  <span className="u-value text-[20px] font-semibold">{inr(priced.total)}</span>
                </div>
              </div>

              <div className="mt-3">
                <span className="u-label">Payment</span>
                <Segmented
                  value={mode}
                  onChange={setMode}
                  size="sm"
                  options={[
                    { value: "upi", label: "UPI" },
                    { value: "card", label: "Card" },
                    { value: "cash", label: "Cash" },
                  ]}
                />
                <div className="mt-2.5">
                  <PaymentMethodDetails mode={mode} amount={priced.total} />
                </div>
              </div>

              {error && (
                <p className="mt-2 rounded-lg border border-clay/30 bg-clay/10 px-2.5 py-1.5 text-[10.5px] text-clay-deep">
                  {error}
                </p>
              )}

              <button
                className="btn btn-clay btn-block mt-3"
                disabled={!cart.length}
                onClick={charge}
              >
                <Receipt className="h-4 w-4" />
                Charge {inr(priced.total)}
              </button>
              <button
                className="btn btn-quiet btn-sm btn-block mt-1"
                onClick={() => {
                  setCart([]);
                  setError(null);
                }}
                disabled={!cart.length}
              >
                Clear sale
              </button>
            </div>
          </Panel>

          <Panel className="mt-4">
            <div className="flex items-center justify-between">
              <div className="u-eyebrow flex items-center gap-1.5 text-muted">
                <TrendingUp className="h-3 w-3" /> Today
              </div>
              <span className="u-value text-[12px]">{inr(todaySales.gross)}</span>
            </div>
            <p className="mt-1 text-[10.5px] text-muted">
              {todaySales.count} counter tickets · average{" "}
              {inr(todaySales.count ? todaySales.gross / todaySales.count : 0)}
            </p>
          </Panel>
        </div>
      </div>

      <Modal
        open={Boolean(receipt)}
        onClose={() => setReceipt(null)}
        eyebrow="Counter sale"
        title="Paid. Pack it up."
        footer={
          <div className="flex justify-end gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => setReceipt(null)}>
              Next sale
            </button>
            <Link href="/dashboard/owner" className="btn btn-ink btn-sm">
              View ledger
            </Link>
          </div>
        }
      >
        {receipt && (
          <div className="space-y-3">
            <div className="rounded-xl border border-line bg-paper-soft p-4 text-center">
              <Check className="mx-auto h-6 w-6 text-court" />
              <div className="u-mono mt-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                {receipt.code}
              </div>
              <div className="u-value mt-1 text-3xl">{inr(receipt.total)}</div>
              <div className="mt-1 text-[10.5px] text-muted">{receipt.changeNote}</div>
            </div>
            <p className="text-[11px] leading-relaxed text-muted">
              Stock has been decremented for every line. The sale appears in the owner ledger under
              Pro Shop and in the GST working under HSN 9506.
            </p>
          </div>
        )}
      </Modal>

      <p className="flex items-center gap-1.5 text-[10.5px] text-muted">
        <Plus className="h-3 w-3" />
        Keyboard: search, arrow to a product, Enter to add. No card data is captured in this build.
      </p>
    </div>
  );
}

