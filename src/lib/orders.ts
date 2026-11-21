// =============================================================================
// Pro-shop inventory + POS, bar & kitchen orders, tables, tabs
// Requirements: C1–C6, D1–D8
// One shelf: counter sales, online pickup/delivery and POS all decrement the
// same persisted stock. Kitchen and bar orders share one queue.
// =============================================================================

import { MEMBERSHIP_PLANS } from "./membership";
import { recordTransaction, registerOpenTabCountProvider } from "./finance";
import {
  addDaysISO,
  formatDate,
  hashString,
  makeId,
  mulberry32,
  readStore,
  round2,
  todayISO,
  writeStore,
} from "./store";

export type PlanId = "gold" | "silver" | "junior";
export type PaymentMode = "upi" | "card" | "cash" | "tab";

/* ─────────────────────────── catalogue ─────────────────────────── */

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: "Rackets" | "Balls" | "Shuttlecocks" | "Accessories" | "Apparel" | "Footwear" | "Nutrition";
  price: number;
  stock: number;
  lowStockAt: number;
  tag?: string;
  brand: string;
  sport: "Tennis" | "Padel" | "Badminton" | "Cricket" | "All";
}

const SEED_PRODUCTS: Product[] = [
  { id: "prd-01", sku: "TCC-RK-001", name: "Wilson Pro Staff V14", category: "Rackets", price: 18499, stock: 6, lowStockAt: 4, brand: "Wilson", sport: "Tennis", tag: "Pro favourite" },
  { id: "prd-02", sku: "TCC-RK-002", name: "Babolat Pure Aero 98", category: "Rackets", price: 19999, stock: 3, lowStockAt: 4, brand: "Babolat", sport: "Tennis", tag: "Low stock" },
  { id: "prd-03", sku: "TCC-RK-003", name: "Head Speed MP Padel", category: "Rackets", price: 21999, stock: 5, lowStockAt: 3, brand: "Head", sport: "Padel" },
  { id: "prd-04", sku: "TCC-RK-004", name: "Yonex Astrox 100 ZZ", category: "Rackets", price: 17299, stock: 2, lowStockAt: 3, brand: "Yonex", sport: "Badminton", tag: "Low stock" },
  { id: "prd-05", sku: "TCC-BL-001", name: "Wilson US Open Balls (4)", category: "Balls", price: 680, stock: 48, lowStockAt: 12, brand: "Wilson", sport: "Tennis" },
  { id: "prd-06", sku: "TCC-BL-002", name: "Head Padel Pro Balls (3)", category: "Balls", price: 520, stock: 36, lowStockAt: 10, brand: "Head", sport: "Padel" },
  { id: "prd-07", sku: "TCC-SH-001", name: "Yonex AS-30 Shuttlecock (Tin)", category: "Shuttlecocks", price: 1450, stock: 22, lowStockAt: 8, brand: "Yonex", sport: "Badminton" },
  { id: "prd-08", sku: "TCC-SH-002", name: "Victor Champion No.1 (Tin)", category: "Shuttlecocks", price: 1180, stock: 7, lowStockAt: 8, brand: "Victor", sport: "Badminton", tag: "Low stock" },
  { id: "prd-09", sku: "TCC-AC-001", name: "Tourna Grip Original (3)", category: "Accessories", price: 420, stock: 40, lowStockAt: 15, brand: "Tourna", sport: "All" },
  { id: "prd-10", sku: "TCC-AC-002", name: "Racket Vibration Dampener", category: "Accessories", price: 260, stock: 28, lowStockAt: 10, brand: "Babolat", sport: "All" },
  { id: "prd-11", sku: "TCC-AP-001", name: "Club Training Tee · Court Green", category: "Apparel", price: 1290, stock: 34, lowStockAt: 10, brand: "TCC", sport: "All" },
  { id: "prd-12", sku: "TCC-AP-002", name: "Club Woven Shorts", category: "Apparel", price: 1490, stock: 19, lowStockAt: 8, brand: "TCC", sport: "All" },
  { id: "prd-13", sku: "TCC-FW-001", name: "Yonex Power Cushion Eclipsion Z", category: "Footwear", price: 11499, stock: 9, lowStockAt: 4, brand: "Yonex", sport: "All", tag: "All court" },
  { id: "prd-14", sku: "TCC-FW-002", name: "Asics Court FF 3", category: "Footwear", price: 10999, stock: 4, lowStockAt: 4, brand: "Asics", sport: "Tennis" },
  { id: "prd-15", sku: "TCC-NU-001", name: "Fast&Up Reload Electrolyte", category: "Nutrition", price: 340, stock: 60, lowStockAt: 20, brand: "Fast&Up", sport: "All" },
  { id: "prd-16", sku: "TCC-NU-002", name: "Whey Isolate · Café Mocha", category: "Nutrition", price: 2890, stock: 15, lowStockAt: 6, brand: "TCC", sport: "All" },
];

export const PRODUCT_CATEGORIES = ["All", "Rackets", "Balls", "Shuttlecocks", "Accessories", "Apparel", "Footwear", "Nutrition"] as const;

const PRODUCTS_KEY = "champions_products_v1";

export function getProducts(): Product[] {
  const stored = readStore<Product[] | null>(PRODUCTS_KEY, null);
  if (stored && stored.length) return stored;
  writeStore(PRODUCTS_KEY, SEED_PRODUCTS);
  return SEED_PRODUCTS;
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function lowStockProducts(): Product[] {
  return getProducts().filter((p) => p.stock <= p.lowStockAt).sort((a, b) => a.stock - b.stock);
}

export function restockProduct(id: string, qty: number): void {
  const products = getProducts().map((p) => (p.id === id ? { ...p, stock: p.stock + qty } : p));
  writeStore(PRODUCTS_KEY, products);
}

function deductStock(lines: { productId: string; qty: number }[]): string | null {
  const products = getProducts();
  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) return "A product in the cart no longer exists.";
    if (product.stock < line.qty) return `Only ${product.stock} left of ${product.name}.`;
  }
  const next = products.map((p) => {
    const line = lines.find((l) => l.productId === p.id);
    return line ? { ...p, stock: p.stock - line.qty } : p;
  });
  writeStore(PRODUCTS_KEY, next);
  return null;
}

/* ─────────────────────────── bar menu ─────────────────────────── */

export interface MenuItem {
  id: string;
  name: string;
  category: "Beverages" | "Mains" | "Snacks" | "Bar";
  price: number;
  veg: boolean;
  description: string;
  station: "bar" | "kitchen";
  prepMin: number;
}

export const BAR_MENU: MenuItem[] = [
  { id: "mn-01", name: "Whey Isolate Shake", category: "Beverages", price: 340, veg: true, description: "Café mocha, 25g protein, cold", station: "bar", prepMin: 4 },
  { id: "mn-02", name: "Electrolyte Cooler", category: "Beverages", price: 220, veg: true, description: "Lime, sea salt, mint, soda", station: "bar", prepMin: 3 },
  { id: "mn-03", name: "Cold Brew", category: "Beverages", price: 260, veg: true, description: "18-hour steep, single origin", station: "bar", prepMin: 3 },
  { id: "mn-04", name: "Masala Chai", category: "Beverages", price: 120, veg: true, description: "Assam leaf, ginger, cardamom", station: "bar", prepMin: 4 },
  { id: "mn-05", name: "Sourdough Club Sandwich", category: "Mains", price: 420, veg: false, description: "Chicken, cheddar, herb aioli", station: "kitchen", prepMin: 12 },
  { id: "mn-06", name: "Paneer Tikka Bowl", category: "Mains", price: 380, veg: true, description: "Charred paneer, quinoa, mint", station: "kitchen", prepMin: 14 },
  { id: "mn-07", name: "Pesto Pasta", category: "Mains", price: 440, veg: true, description: "Basil, parmesan, cherry tomato", station: "kitchen", prepMin: 13 },
  { id: "mn-08", name: "Grilled Chicken Wrap", category: "Mains", price: 360, veg: false, description: "Smoked chicken, slaw, yogurt", station: "kitchen", prepMin: 10 },
  { id: "mn-09", name: "Truffle Fries", category: "Snacks", price: 280, veg: true, description: "Parmesan, chive, truffle oil", station: "kitchen", prepMin: 8 },
  { id: "mn-10", name: "Chicken Satay (6)", category: "Snacks", price: 390, veg: false, description: "Peanut sauce, pickled cucumber", station: "kitchen", prepMin: 12 },
  { id: "mn-11", name: "Peri Peri Paneer Sticks", category: "Snacks", price: 320, veg: true, description: "House peri peri, lime", station: "kitchen", prepMin: 9 },
  { id: "mn-12", name: "Hummus & Lavash", category: "Snacks", price: 260, veg: true, description: "Beetroot hummus, toasted lavash", station: "kitchen", prepMin: 6 },
  { id: "mn-13", name: "Kingfisher Ultra (330ml)", category: "Bar", price: 350, veg: true, description: "Chilled draught bottle", station: "bar", prepMin: 2 },
  { id: "mn-14", name: "House Red · Glass", category: "Bar", price: 480, veg: true, description: "Shiraz, 150ml pour", station: "bar", prepMin: 2 },
  { id: "mn-15", name: "Classic Gin & Tonic", category: "Bar", price: 520, veg: true, description: "London dry, tonic, citrus", station: "bar", prepMin: 4 },
  { id: "mn-16", name: "Zero-Proof Spritz", category: "Bar", price: 290, veg: true, description: "Aperitivo, soda, orange", station: "bar", prepMin: 4 },
];

export function getMenuItem(id: string): MenuItem | undefined {
  return BAR_MENU.find((m) => m.id === id);
}

/* ─────────────────────────── tables ─────────────────────────── */

export type TableStatus = "available" | "reserved" | "occupied";

export interface ClubTable {
  id: string;
  label: string;
  seats: number;
  zone: "Lounge" | "Terrace" | "Bar";
  status: TableStatus;
  seatedAt?: string;
  server?: string;
}

const TABLES_KEY = "champions_tables_v1";

function seedTables(): ClubTable[] {
  const rand = mulberry32(hashString(`tables-${todayISO()}`));
  const zones: ClubTable["zone"][] = ["Lounge", "Terrace", "Bar"];
  return Array.from({ length: 12 }, (_, i) => {
    const roll = rand();
    const status: TableStatus = roll > 0.72 ? "occupied" : roll > 0.55 ? "reserved" : "available";
    return {
      id: `tbl-${i + 1}`,
      label: `T${String(i + 1).padStart(2, "0")}`,
      seats: i % 4 === 0 ? 6 : i % 3 === 0 ? 2 : 4,
      zone: zones[i % 3],
      status,
      seatedAt: status === "occupied" ? new Date(Date.now() - (20 + i * 12) * 60000).toISOString() : undefined,
      server: i % 2 === 0 ? "Chef Vikram" : "Meera Nair",
    };
  });
}

export function getTables(): ClubTable[] {
  const stored = readStore<ClubTable[] | null>(TABLES_KEY, null);
  if (stored && stored.length) return stored;
  const seeded = seedTables();
  writeStore(TABLES_KEY, seeded);
  return seeded;
}

export function setTableStatus(id: string, status: TableStatus): void {
  const tables = getTables().map((t) =>
    t.id === id ? { ...t, status, seatedAt: status === "occupied" ? new Date().toISOString() : undefined } : t
  );
  writeStore(TABLES_KEY, tables);
}

/* ─────────────────────────── orders ─────────────────────────── */

export type OrderChannel = "shop" | "bar";
export type OrderStatus =
  | "placed"
  | "preparing"
  | "ready"
  | "dispatched"
  | "delivered"
  | "completed"
  | "cancelled";
export type Fulfilment = "pickup" | "delivery" | "dine_in";

export interface OrderLine {
  refId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  code: string;
  channel: OrderChannel;
  lines: OrderLine[];
  memberId?: string;
  memberName: string;
  planId?: PlanId;
  subtotal: number;
  discountPct: number;
  discount: number;
  deliveryFee: number;
  gst: number;
  total: number;
  paymentMode: PaymentMode;
  status: OrderStatus;
  fulfilment?: Fulfilment;
  tableId?: string;
  address?: string;
  phone?: string;
  otp?: string;
  pickupCode?: string;
  placedAt: string;
  etaMin?: number;
  staff?: string;
  paid: boolean;
}

const ORDERS_KEY = "champions_orders_v2";
const TABS_KEY = "champions_tabs_v1";

function seedOrders(): Order[] {
  const today = todayISO();
  const yesterday = addDaysISO(today, -1);
  const rand = mulberry32(hashString(`orders-${today}`));
  const seeded: Order[] = [];

  const barPeople = ["Rohan Mehra", "Priya Sharma", "Kabir Khan", "Ananya Deshmukh", "Sunita Roy", "Zoya Ali"];
  for (let i = 0; i < 6; i++) {
    const item = BAR_MENU[Math.floor(rand() * BAR_MENU.length)];
    const qty = 1 + Math.floor(rand() * 2);
    const subtotal = item.price * qty;
    const status: OrderStatus = (["placed", "preparing", "ready", "preparing", "completed", "completed"] as OrderStatus[])[i];
    seeded.push({
      id: `seed-ord-${i}`,
      code: `#TCC-${240 + i}`,
      channel: "bar",
      lines: [{ refId: item.id, name: item.name, qty, unitPrice: item.price }],
      memberName: barPeople[i % barPeople.length],
      subtotal,
      discountPct: 15,
      discount: round2(subtotal * 0.15),
      deliveryFee: 0,
      gst: round2((subtotal - subtotal * 0.15) * 0.18),
      total: round2(subtotal - subtotal * 0.15 + (subtotal - subtotal * 0.15) * 0.18),
      paymentMode: i % 3 === 0 ? "tab" : "upi",
      status,
      fulfilment: "dine_in",
      tableId: `tbl-${(i % 8) + 1}`,
      placedAt: new Date(Date.now() - (i * 9 + 4) * 60000).toISOString(),
      etaMin: 10 + i * 3,
      staff: "Chef Vikram",
      paid: status === "completed",
    });
  }

  seeded.push({
    id: "seed-ord-shop-1",
    code: "#TCC-231",
    channel: "shop",
    lines: [
      { refId: "prd-05", name: "Wilson US Open Balls (4)", qty: 2, unitPrice: 680 },
      { refId: "prd-09", name: "Tourna Grip Original (3)", qty: 1, unitPrice: 420 },
    ],
    memberName: "Rohan Mehra",
    planId: "gold",
    subtotal: 1780,
    discountPct: 15,
    discount: 267,
    deliveryFee: 0,
    gst: 272.34,
    total: 1785.34,
    paymentMode: "upi",
    status: "ready",
    fulfilment: "pickup",
    pickupCode: "4821",
    placedAt: new Date(Date.now() - 55 * 60000).toISOString(),
    staff: "Neha Kapoor",
    paid: true,
  });

  seeded.push({
    id: "seed-ord-shop-2",
    code: "#TCC-212",
    channel: "shop",
    lines: [{ refId: "prd-13", name: "Yonex Power Cushion Eclipsion Z", qty: 1, unitPrice: 11499 }],
    memberName: "Priya Sharma",
    planId: "silver",
    subtotal: 11499,
    discountPct: 5,
    discount: 574.95,
    deliveryFee: 99,
    gst: 1968.31,
    total: 12991.36,
    paymentMode: "card",
    status: "dispatched",
    fulfilment: "delivery",
    address: "B-42, Greater Kailash II, New Delhi 110048",
    phone: "+91 98722 11984",
    otp: "6043",
    placedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    staff: "Neha Kapoor",
    paid: true,
  });

  seeded.push({
    id: "seed-ord-past",
    code: "#TCC-198",
    channel: "bar",
    lines: [{ refId: "mn-13", name: "Kingfisher Ultra (330ml)", qty: 3, unitPrice: 350 }],
    memberName: "Kabir Khan",
    planId: "silver",
    subtotal: 1050,
    discountPct: 5,
    discount: 52.5,
    deliveryFee: 0,
    gst: 179.55,
    total: 1177.05,
    paymentMode: "tab",
    status: "completed",
    fulfilment: "dine_in",
    tableId: "tbl-7",
    placedAt: `${yesterday}T20:10:00`,
    staff: "Chef Vikram",
    paid: false,
  });

  return seeded;
}

export function getOrders(): Order[] {
  const stored = readStore<Order[] | null>(ORDERS_KEY, null);
  if (stored && stored.length) return stored;
  const seeded = seedOrders();
  writeStore(ORDERS_KEY, seeded);
  return seeded;
}

function saveOrders(orders: Order[]): void {
  writeStore(ORDERS_KEY, orders);
}

export function getOrderByCode(code: string): Order | undefined {
  return getOrders().find((o) => o.code.toLowerCase() === code.toLowerCase());
}

export function kitchenQueue(): Order[] {
  return getOrders()
    .filter((o) => o.channel === "bar" && ["placed", "preparing", "ready"].includes(o.status))
    .sort((a, b) => a.placedAt.localeCompare(b.placedAt));
}

export function shopQueue(): Order[] {
  return getOrders()
    .filter((o) => o.channel === "shop" && ["placed", "preparing", "ready", "dispatched"].includes(o.status))
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export function activeOrdersForMember(identifier: string): Order[] {
  const key = identifier.toLowerCase();
  return getOrders().filter(
    (o) => (o.memberId?.toLowerCase() === key || o.memberName.toLowerCase() === key) && o.status !== "completed" && o.status !== "cancelled"
  );
}

export interface CreateOrderInput {
  channel: OrderChannel;
  lines: { refId: string; qty: number }[];
  memberId?: string;
  memberName: string;
  planId?: PlanId;
  paymentMode: PaymentMode;
  fulfilment?: Fulfilment;
  tableId?: string;
  address?: string;
  phone?: string;
  staff?: string;
}

export function priceCart(channel: OrderChannel, lines: { refId: string; qty: number }[], planId?: PlanId) {
  const items =
    channel === "shop"
      ? lines.map((l) => {
          const p = getProduct(l.refId);
          return p ? { refId: p.id, name: p.name, qty: l.qty, unitPrice: p.price } : null;
        })
      : lines.map((l) => {
          const m = getMenuItem(l.refId);
          return m ? { refId: m.id, name: m.name, qty: l.qty, unitPrice: m.price } : null;
        });
  const resolved = items.filter(Boolean) as OrderLine[];
  const subtotal = round2(resolved.reduce((s, l) => s + l.unitPrice * l.qty, 0));
  const plan = planId ? MEMBERSHIP_PLANS[planId] : undefined;
  const discountPct = plan ? (channel === "shop" ? plan.shopDiscountPct : plan.barDiscountPct) : 0;
  const discount = round2((subtotal * discountPct) / 100);
  const deliveryFee = 0;
  const taxable = round2(subtotal - discount);
  const gst = round2(taxable * 0.18);
  return { items: resolved, subtotal, discountPct, discount, deliveryFee, gst, total: round2(taxable + gst + deliveryFee) };
}

export function createOrder(input: CreateOrderInput): { ok: boolean; order?: Order; error?: string } {
  if (!input.lines.length) return { ok: false, error: "Cart is empty." };
  if (input.channel === "shop") {
    const error = deductStock(input.lines.map((l) => ({ productId: l.refId, qty: l.qty })));
    if (error) return { ok: false, error };
  }
  const priced = priceCart(input.channel, input.lines, input.planId);
  const deliveryFee = input.fulfilment === "delivery" ? 99 : 0;
  const total = round2(priced.total + deliveryFee);
  const orders = getOrders();
  const order: Order = {
    id: makeId("ord"),
    code: `#TCC-${String(300 + orders.length).padStart(3, "0")}`,
    channel: input.channel,
    lines: priced.items,
    memberId: input.memberId,
    memberName: input.memberName,
    planId: input.planId,
    subtotal: priced.subtotal,
    discountPct: priced.discountPct,
    discount: priced.discount,
    deliveryFee,
    gst: priced.gst,
    total,
    paymentMode: input.paymentMode,
    status: "placed",
    fulfilment: input.fulfilment,
    tableId: input.tableId,
    address: input.address,
    phone: input.phone,
    otp: input.fulfilment === "delivery" ? String(1000 + Math.floor(Math.random() * 9000)) : undefined,
    pickupCode: input.fulfilment === "pickup" ? String(1000 + Math.floor(Math.random() * 9000)) : undefined,
    placedAt: new Date().toISOString(),
    etaMin: input.channel === "bar" ? 12 : input.fulfilment === "delivery" ? 60 : 20,
    staff: input.staff,
    paid: input.paymentMode !== "tab",
  };
  orders.push(order);
  saveOrders(orders);

  if (input.tableId) setTableStatus(input.tableId, "occupied");

  if (input.paymentMode === "tab") {
    addToTab(order);
  } else {
    recordTransaction({
      source: input.channel === "shop" ? "shop" : "bar",
      description: `${input.channel === "shop" ? "Pro shop" : "Bar"} order ${order.code} · ${priced.items.length} line(s)`,
      gross: total,
      paymentMode: input.paymentMode,
      taxCode: input.channel === "shop" ? "HSN 9506" : "SAC 996331",
      memberName: input.memberName,
      ref: order.id,
    });
  }

  return { ok: true, order };
}

export function updateOrderStatus(id: string, status: OrderStatus): void {
  const orders = getOrders().map((o) => {
    if (o.id !== id) return o;
    const paid = o.paid || status === "completed";
    return { ...o, status, paid };
  });
  saveOrders(orders);
  const order = orders.find((o) => o.id === id);
  if (order && status === "completed" && order.tableId) setTableStatus(order.tableId, "available");
}

export function markOrderPaid(id: string, mode: PaymentMode): void {
  if (mode === "tab") return;
  const orders = getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order || order.paid) return;
  order.paid = true;
  order.paymentMode = mode;
  saveOrders(orders);
  recordTransaction({
    source: order.channel === "shop" ? "shop" : "bar",
    description: `Settled order ${order.code}`,
    gross: order.total,
    paymentMode: mode,
    taxCode: order.channel === "shop" ? "HSN 9506" : "SAC 996331",
    memberName: order.memberName,
    ref: order.id,
  });
  if (order.tableId) setTableStatus(order.tableId, "available");
}

/* ─────────────────────────── tabs ─────────────────────────── */

export interface MemberTab {
  id: string;
  memberName: string;
  memberId?: string;
  tableId?: string;
  orderCodes: string[];
  total: number;
  openedAt: string;
  status: "open" | "settled";
}

export function getTabs(): MemberTab[] {
  const stored = readStore<MemberTab[] | null>(TABS_KEY, null);
  if (stored && stored.length) return stored;
  const seeded: MemberTab[] = [
    { id: "tab-001", memberName: "Kabir Khan", tableId: "tbl-7", orderCodes: ["#TCC-198"], total: 1240, openedAt: `${addDaysISO(todayISO(), -1)}T20:10:00`, status: "open" },
    { id: "tab-002", memberName: "Sunita Roy", tableId: "tbl-3", orderCodes: ["#TCC-206"], total: 860, openedAt: new Date(Date.now() - 90 * 60000).toISOString(), status: "open" },
  ];
  writeStore(TABS_KEY, seeded);
  return seeded;
}

export function getOpenTabs(): MemberTab[] {
  return getTabs().filter((t) => t.status === "open");
}

function addToTab(order: Order): void {
  const tabs = getTabs();
  const existing = tabs.find((t) => t.status === "open" && t.memberName === order.memberName);
  if (existing) {
    existing.orderCodes.push(order.code);
    existing.total = round2(existing.total + order.total);
    if (order.tableId) existing.tableId = order.tableId;
  } else {
    tabs.push({
      id: makeId("tab"),
      memberName: order.memberName,
      memberId: order.memberId,
      tableId: order.tableId,
      orderCodes: [order.code],
      total: order.total,
      openedAt: new Date().toISOString(),
      status: "open",
    });
  }
  writeStore(TABS_KEY, tabs);
}

export function settleTab(id: string, mode: PaymentMode = "upi"): { ok: boolean; total?: number } {
  const tabs = getTabs();
  const tab = tabs.find((t) => t.id === id);
  if (!tab || tab.status === "settled") return { ok: false };
  tab.status = "settled";
  writeStore(TABS_KEY, tabs);
  if (tab.tableId) setTableStatus(tab.tableId, "available");
  if (mode !== "tab") {
    recordTransaction({
      source: "bar",
      description: `Member tab settled · ${tab.memberName}`,
      gross: tab.total,
      paymentMode: mode,
      taxCode: "SAC 996331",
      memberName: tab.memberName,
      ref: tab.id,
    });
  }
  return { ok: true, total: tab.total };
}

registerOpenTabCountProvider(() => getOpenTabs().length);

/* ─────────────────────────── reports ─────────────────────────── */

export function barRevenueToday(): number {
  return round2(
    getOrders()
      .filter((o) => o.channel === "bar" && o.placedAt.slice(0, 10) === todayISO() && o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0)
  );
}

export function shopRevenueToday(): number {
  return round2(
    getOrders()
      .filter((o) => o.channel === "shop" && o.placedAt.slice(0, 10) === todayISO() && o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0)
  );
}

export function orderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    placed: "Placed",
    preparing: "Preparing",
    ready: "Ready",
    dispatched: "Dispatched",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status];
}

export function orderDayLabel(iso: string): string {
  return formatDate(iso.slice(0, 10), { day: "numeric", month: "short" });
}
