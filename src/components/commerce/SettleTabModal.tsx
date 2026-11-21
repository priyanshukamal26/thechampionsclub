"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal, Segmented } from "@/components/ui/overlay";
import { PaymentMethodDetails } from "@/components/commerce/PaymentMethodDetails";
import { formatTime, inr } from "@/lib/store";
import { settleTab, type MemberTab, type PaymentMode } from "@/lib/orders";

const MODE_OPTIONS: { value: PaymentMode; label: string }[] = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
];

export function SettleTabModal({
  tab,
  tableLabelText,
  onClose,
  onSettled,
}: {
  tab: MemberTab | null;
  tableLabelText?: string;
  onClose: () => void;
  onSettled?: () => void;
}) {
  const [mode, setMode] = useState<PaymentMode>("upi");
  const [settledTotal, setSettledTotal] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setMode("upi");
    setSettledTotal(null);
    setError("");
  }, [tab?.id]);

  const handleSettle = () => {
    if (!tab) return;
    const result = settleTab(tab.id, mode);
    if (!result.ok) {
      setError("This tab has already been settled.");
      return;
    }
    setSettledTotal(result.total ?? tab.total);
    onSettled?.();
  };

  return (
    <Modal
      open={Boolean(tab)}
      onClose={onClose}
      eyebrow="Bar & lounge"
      title={tab ? `Settle tab · ${tab.memberName}` : "Settle tab"}
      footer={
        settledTotal !== null ? (
          <button type="button" onClick={onClose} className="btn btn-ink btn-block">
            Done
          </button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm sm:flex-1">
              Cancel
            </button>
            <button type="button" onClick={handleSettle} className="btn btn-clay btn-sm sm:flex-1">
              Settle {tab ? inr(tab.total) : ""}
            </button>
          </div>
        )
      }
    >
      {tab && settledTotal !== null ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-court" />
          <div className="u-display text-xl text-ink">Tab settled</div>
          <p className="max-w-xs text-[12px] text-muted">
            {tab.memberName} settled {inr(settledTotal)} by {mode.toUpperCase()}. The table has been released.
          </p>
        </div>
      ) : tab ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-paper-soft p-3">
              <div className="u-eyebrow text-muted">Balance due</div>
              <div className="u-value text-xl text-ink">{inr(tab.total)}</div>
            </div>
            <div className="rounded-xl border border-line bg-paper-soft p-3">
              <div className="u-eyebrow text-muted">Table</div>
              <div className="u-mono text-[12px] uppercase tracking-[0.08em] text-ink">{tableLabelText ?? "Counter"}</div>
            </div>
          </div>
          <div>
            <div className="u-eyebrow mb-2 text-muted">Order codes</div>
            <div className="flex flex-wrap gap-1.5">
              {tab.orderCodes.map((code) => (
                <span key={code} className="chip">
                  {code}
                </span>
              ))}
            </div>
          </div>
          <div className="text-[11.5px] text-muted">Opened at {formatTime(tab.openedAt)} IST</div>
          <div>
            <div className="u-eyebrow mb-2 text-muted">Payment mode</div>
            <Segmented options={MODE_OPTIONS} value={mode} onChange={(value) => setMode(value)} />
          </div>
          <PaymentMethodDetails mode={mode} amount={tab.total} />
          {error && <p className="text-[11.5px] text-clay-deep">{error}</p>}
          <p className="text-[11px] text-muted">Settling posts a bar revenue entry and frees the table.</p>
        </div>
      ) : null}
    </Modal>
  );
}
