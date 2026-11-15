"use client";

import { AlertIcon, CheckIcon } from "./icons";
import { Button, Card, Pill } from "./primitives";
import type { OfferModel } from "./types";

const inputClass = "min-h-11 rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-moss focus:ring-2 focus:ring-moss/15";

export function OfferCard({ offer, onPriceChange, onCurrencyChange, onApprove }: { offer: OfferModel; onPriceChange: (price: string) => void; onCurrencyChange: (currency: string) => void; onApprove: () => void }) {
  return (
    <Card className={`relative flex h-full flex-col overflow-hidden ${offer.recommended ? "border-moss/30 ring-2 ring-moss/10" : ""}`}>
      {offer.recommended ? <div className="bg-moss px-5 py-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white">Recommended for this sample mix</div> : null}
      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-moss">{offer.eyebrow}</p><h3 className="mt-2 font-display text-2xl font-bold tracking-[-0.025em] text-ink">{offer.name}</h3></div><span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${offer.eligible ? "bg-mint text-moss" : "bg-[#fde8e1] text-[#993b27]"}`}>{offer.eligible ? <CheckIcon size={12} /> : <AlertIcon size={12} />}{offer.eligible ? "Eligible" : "Blocked"}</span></div>
        <p className="mt-3 text-sm leading-6 text-ink/60">{offer.description}</p>

        <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
          <div className="grid grid-cols-[1fr_auto] gap-3 py-3"><dt className="text-xs font-semibold text-ink/50">Included documents</dt><dd className="flex flex-wrap justify-end gap-1">{offer.includedTypes.map((type) => <Pill key={type}>{type}</Pill>)}</dd></div>
          <div className="grid grid-cols-[1fr_auto] gap-3 py-3"><dt className="text-xs font-semibold text-ink/50">Sample review workload</dt><dd className="text-right text-xs font-bold text-ink">{offer.reviewWorkload}</dd></div>
          <div className="grid grid-cols-[1fr_auto] gap-3 py-3"><dt className="text-xs font-semibold text-ink/50">Proposed pilot volume</dt><dd className="text-right text-xs font-bold text-ink">{offer.proposedVolume}</dd></div>
        </dl>

        <div className="mt-5"><p className="text-xs font-bold text-ink">Success criteria</p><ul className="mt-3 space-y-2">{offer.successCriteria.map((criterion) => <li className="flex gap-2 text-xs leading-5 text-ink/60" key={criterion}><CheckIcon className="mt-0.5 shrink-0 text-moss" size={14} />{criterion}</li>)}</ul></div>
        <div className="mt-5 rounded-xl bg-paper/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink/40">Review policy</p><p className="mt-1.5 text-xs leading-5 text-ink/65">{offer.reviewPolicy}</p></div>

        <fieldset className="mt-auto pt-6"><legend className="text-xs font-bold text-ink/65">Pilot price</legend><div className="mt-2 grid grid-cols-[90px_1fr] gap-2"><label><span className="sr-only">Currency</span><select className={`${inputClass} w-full`} onChange={(event) => onCurrencyChange(event.target.value)} value={offer.currency}><option>USD</option><option>EUR</option><option>GBP</option><option>LKR</option></select></label><label><span className="sr-only">Price</span><input className={`${inputClass} w-full`} inputMode="decimal" onChange={(event) => onPriceChange(event.target.value)} placeholder="Enter price" value={offer.price} /></label></div></fieldset>
        {!offer.eligible && offer.ineligibilityReason ? <p className="mt-3 flex gap-2 rounded-xl bg-[#fff1ec] p-3 text-xs leading-5 text-[#8d3624]"><AlertIcon className="mt-0.5 shrink-0" size={14} />{offer.ineligibilityReason}</p> : null}
        <Button className="mt-4 w-full" disabled={!offer.eligible || !offer.price.trim()} onClick={onApprove} trailingArrow>Approve this offer</Button>
      </div>
    </Card>
  );
}
