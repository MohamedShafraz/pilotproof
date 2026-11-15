import { FileIcon } from "./icons";
import { Pill } from "./primitives";
import type { SampleEditorModel } from "./types";

export function InvoicePreview({ sample, compact = false }: { sample: SampleEditorModel; compact?: boolean }) {
  const amount = `${sample.expected.currency} ${sample.expected.total}`;
  const items = sample.lineItems ?? [];
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-ink/10 bg-[#ece8dc] ${compact ? "p-3" : "p-5 sm:p-6"}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-ink/55"><FileIcon className="shrink-0" size={15} /><span className="truncate">{sample.filename}</span></div>
        <Pill className={sample.kind === "scan" ? "border-amber/40 bg-[#fff6db] text-[#7d551a]" : "border-moss/15 bg-mint/60 text-moss"}>{sample.kind === "scan" ? "Scan" : "Digital"}</Pill>
      </div>

      <div className={`invoice-sheet relative mx-auto max-w-md overflow-hidden rounded-sm bg-white shadow-[0_13px_35px_rgba(39,49,42,0.14)] ${compact ? "min-h-[230px] p-5" : "min-h-[420px] p-7 sm:p-9"}`}>
        <div className={sample.isBlurry ? "select-none blur-[0.8px] opacity-85" : ""}>
          <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-5">
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-ink">{sample.supplier}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-ink/40">{sample.locality ?? "Sri Lanka"}</p>
              {sample.registrationLabel ? <p className="mt-1 text-[8px] font-semibold text-ink/35">{sample.registrationLabel}</p> : null}
            </div>
            <div className="text-right"><p className="max-w-[150px] font-display text-lg font-semibold uppercase tracking-[0.09em] text-ink/70">{sample.documentLabel ?? "Invoice"}</p><p className="mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-coral">Synthetic demo</p></div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
            <div><dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/35">{sample.referenceLabel ?? "Invoice no."}</dt><dd className="mt-1 break-all font-semibold text-ink">{sample.expected.invoiceNumber}</dd></div>
            <div><dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/35">{sample.dateLabel ?? "Invoice date"}</dt><dd className="mt-1 font-semibold text-ink">{sample.expected.invoiceDate}</dd></div>
          </dl>
          <div className="mt-7 border-y border-ink/10 py-3">
            <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-3 text-[8px] font-bold uppercase tracking-[0.13em] text-ink/35"><span>Description</span><span>Qty</span><span>Amount</span></div>
            <div className="space-y-2.5">
              {items.map((item) => <div className="grid grid-cols-[1fr_auto_auto] gap-3 text-[9px] text-ink/65" key={item.description}><span>{item.description}</span><span>{item.quantity}</span><span className="min-w-16 text-right font-semibold">{item.amount}</span></div>)}
            </div>
          </div>
          <div className="mt-6 flex items-end justify-between gap-4"><span className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink/40">{sample.totalLabel ?? "Amount due"}</span><span className="text-right font-display text-2xl font-bold tracking-tight text-ink">{amount}</span></div>
          {!compact ? <div className="absolute inset-x-8 bottom-6 h-px bg-ink/10" /> : null}
        </div>
        {sample.isBlurry ? <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-25 [background-image:repeating-linear-gradient(8deg,transparent,transparent_3px,rgba(49,43,31,.18)_4px)]" /> : null}
      </div>
    </div>
  );
}
