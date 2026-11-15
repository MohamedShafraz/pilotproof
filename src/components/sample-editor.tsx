"use client";

import { CheckIcon } from "./icons";
import { Button, Card } from "./primitives";
import type { DocumentKind, InvoiceValues, SampleEditorModel } from "./types";

const fieldClass = "mt-1.5 block min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:text-ink/30 focus:border-moss focus:ring-2 focus:ring-moss/15";

export function SampleEditor({ sample, index, onValuesChange, onKindChange, onConfirm }: { sample: SampleEditorModel; index: number; onValuesChange: (values: InvoiceValues) => void; onKindChange: (kind: DocumentKind) => void; onConfirm: () => void }) {
  const change = (key: keyof InvoiceValues, value: string) => onValuesChange({ ...sample.expected, [key]: value });
  return (
    <Card className="overflow-hidden shadow-none">
      <div className="flex items-center justify-between gap-4 border-b border-ink/10 bg-[#fbfaf6] px-5 py-4 sm:px-6">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40">Sample {String(index + 1).padStart(2, "0")}</p><h3 className="mt-1 text-sm font-bold text-ink">Verify expected values</h3></div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${sample.confirmed ? "bg-mint text-moss" : "bg-amber/15 text-[#835b1d]"}`}>{sample.confirmed ? <CheckIcon size={13} /> : <span className="size-1.5 rounded-full bg-amber" />}{sample.confirmed ? "Confirmed" : "Needs confirmation"}</span>
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <label className="text-xs font-bold text-ink/65">{sample.referenceLabel ?? "Document number"}<input className={fieldClass} onChange={(event) => change("invoiceNumber", event.target.value)} value={sample.expected.invoiceNumber} /></label>
        <label className="text-xs font-bold text-ink/65">{sample.dateLabel ?? "Document date"}<input className={fieldClass} onChange={(event) => change("invoiceDate", event.target.value)} type="date" value={sample.expected.invoiceDate} /></label>
        <label className="text-xs font-bold text-ink/65">{sample.totalLabel ?? "Total amount"}<input className={fieldClass} inputMode="decimal" onChange={(event) => change("total", event.target.value)} value={sample.expected.total} /></label>
        <label className="text-xs font-bold text-ink/65">Currency<select className={fieldClass} onChange={(event) => change("currency", event.target.value)} value={sample.expected.currency}><option>USD</option><option>EUR</option><option>GBP</option><option>LKR</option></select></label>
        <fieldset className="sm:col-span-2">
          <legend className="text-xs font-bold text-ink/65">Document type</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["digital", "scan"] as DocumentKind[]).map((kind) => <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${sample.kind === kind ? "border-moss bg-mint/50 text-moss" : "border-ink/10 text-ink/55 hover:border-ink/25"}`} key={kind}><input checked={sample.kind === kind} className="accent-[#315c43]" name={`kind-${sample.id}`} onChange={() => onKindChange(kind)} type="radio" />{kind === "digital" ? "Digital document" : "Scanned document"}</label>)}
          </div>
        </fieldset>
        <Button className="sm:col-span-2" onClick={onConfirm} variant={sample.confirmed ? "secondary" : "primary"}><CheckIcon size={16} />{sample.confirmed ? "Values confirmed" : "Confirm expected values"}</Button>
      </div>
    </Card>
  );
}
