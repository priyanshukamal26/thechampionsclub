"use client";

import { useState } from "react";
import { CreditCard, QrCode, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import QRCode from "@/components/common/QRCode";
import { inr } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface PaymentMethodDetailsProps {
  mode: "upi" | "card" | "cash" | "tab" | "plan";
  amount?: number;
  upiId?: string;
  className?: string;
}

export function PaymentMethodDetails({
  mode,
  amount = 0,
  upiId = "pay@championsclub",
  className,
}: PaymentMethodDetailsProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(" "));
  };

  const formatExpiry = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=The%20Champions%20Club&am=${amount}&cu=INR`;

  if (mode === "upi") {
    return (
      <div className={cn("rounded-xl border border-line bg-paper-soft p-3.5 space-y-3", className)}>
        <div className="flex items-center justify-between border-b border-line pb-2.5">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-court" />
            <span className="u-eyebrow text-ink font-semibold">UPI Instant Pay</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
            0% SURCHARGE
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="shrink-0 rounded-lg border border-line bg-chalk p-1.5 shadow-sm">
            <QRCode value={upiUri} size={100} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-[11.5px] font-semibold text-ink">Scan with any UPI App</div>
            <div className="font-mono text-[10.5px] text-muted truncate">
              VPA: <span className="text-ink font-medium">{upiId}</span>
            </div>
            {amount > 0 && (
              <div className="u-value text-[14px] text-court font-bold">
                {inr(amount)}
              </div>
            )}
            <div className="flex flex-wrap gap-1 pt-1 text-[9px] uppercase tracking-wider text-muted font-mono">
              <span className="rounded bg-line/60 px-1.5 py-0.5">GPay</span>
              <span className="rounded bg-line/60 px-1.5 py-0.5">PhonePe</span>
              <span className="rounded bg-line/60 px-1.5 py-0.5">Paytm</span>
              <span className="rounded bg-line/60 px-1.5 py-0.5">BHIM</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted">
          <ShieldCheck className="h-3 w-3 text-court shrink-0" />
          <span>NPCI UPI 2.0 verified · Dynamic QR with exact payable amount</span>
        </div>
      </div>
    );
  }

  if (mode === "card") {
    return (
      <div className={cn("rounded-xl border border-line bg-paper-soft p-3.5 space-y-3", className)}>
        <div className="flex items-center justify-between border-b border-line pb-2.5">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-clay" />
            <span className="u-eyebrow text-ink font-semibold">Credit / Debit Card</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-muted">
            <span className="rounded bg-line/60 px-1 py-0.5">RuPay</span>
            <span className="rounded bg-line/60 px-1 py-0.5">Visa</span>
            <span className="rounded bg-line/60 px-1 py-0.5">MC</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div>
            <label className="u-eyebrow block mb-1 text-[9px] text-muted uppercase">Card Number</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="4532 •••• •••• 8921"
              value={cardNumber}
              onChange={(e) => formatCardNumber(e.target.value)}
              className="input font-mono text-[12px] tracking-[0.14em]"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="u-eyebrow block mb-1 text-[9px] text-muted uppercase">Expiry</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM / YY"
                value={cardExpiry}
                onChange={(e) => formatExpiry(e.target.value)}
                className="input font-mono text-[12px] tracking-[0.12em]"
                maxLength={5}
              />
            </div>
            <div>
              <label className="u-eyebrow block mb-1 text-[9px] text-muted uppercase">CVV / CVC</label>
              <input
                type="password"
                inputMode="numeric"
                placeholder="•••"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="input font-mono text-[12px] tracking-[0.2em]"
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <label className="u-eyebrow block mb-1 text-[9px] text-muted uppercase">Cardholder Name</label>
            <input
              type="text"
              placeholder="Name on card"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="input text-[12px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted">
          <ShieldCheck className="h-3 w-3 text-court shrink-0" />
          <span>256-bit TLS encrypted · RBI Compliant Tokenization</span>
        </div>
      </div>
    );
  }

  if (mode === "tab") {
    return (
      <div className={cn("rounded-xl border border-line bg-paper-soft p-3 text-[11px] text-muted flex items-center gap-2", className)}>
        <Wallet className="h-4 w-4 text-gold shrink-0" />
        <span>Added to member running ledger tab. Monthly settlement on 1st of month.</span>
      </div>
    );
  }

  if (mode === "cash") {
    return (
      <div className={cn("rounded-xl border border-line bg-paper-soft p-3 text-[11px] text-muted flex items-center gap-2", className)}>
        <Smartphone className="h-4 w-4 text-ink shrink-0" />
        <span>Collect physical cash at counter and issue thermal POS receipt.</span>
      </div>
    );
  }

  return null;
}
