import { CheckIcon, PrinterIcon, ShieldIcon } from "./icons";
import { Button, Pill } from "./primitives";
import type { ProjectBriefModel } from "./types";
import type { ReactNode } from "react";

export function ProjectBrief({ brief, onPrint }: { brief: ProjectBriefModel; onPrint?: () => void }) {
  return (
    <article className="brief-page mx-auto max-w-4xl overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white shadow-card print:max-w-none print:rounded-none print:border-0 print:shadow-none">
      <header className="border-b border-ink/10 bg-ink px-6 py-7 text-white sm:px-10 sm:py-9 print:bg-white print:px-0 print:text-ink">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div><div className="flex items-center gap-2 text-mint print:text-moss"><ShieldIcon size={20} /><span className="text-xs font-bold uppercase tracking-[0.2em]">PilotProof</span></div><h1 className="mt-5 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Project brief</h1><p className="mt-2 text-sm text-white/60 print:text-ink/55">A fixed snapshot of the approved pilot offer.</p></div>
          <div className="sm:text-right"><Pill className="border-white/15 bg-white/10 text-white print:border-ink/10 print:bg-white print:text-ink">Approved</Pill><p className="mt-3 text-xs text-white/55 print:text-ink/55">{brief.approvedAt}</p><p className="mt-1 font-mono text-[10px] text-white/35 print:text-ink/40">{brief.briefId}</p></div>
        </div>
      </header>

      <div className="p-6 sm:p-10 print:px-0">
        <div className="flex flex-col justify-between gap-5 border-b border-ink/10 pb-8 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40">Project</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">{brief.projectName}</h2><p className="mt-2 text-sm font-semibold text-moss">{brief.offerName}</p></div><div className="sm:text-right"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40">Agreed price</p><p className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">{brief.currency} {brief.price}</p></div></div>

        <div className="grid gap-8 py-8 sm:grid-cols-2">
          <BriefSection title="Scope"><BriefRow label="Document types" value={brief.includedTypes.join(", ")} /><BriefRow label="Pilot volume" value={brief.proposedVolume} /><BriefRow label="Evaluation" value={brief.evaluationLabel} /></BriefSection>
          <BriefSection title="Evidence"><p className="rounded-xl border border-moss/15 bg-mint/35 p-4 text-sm leading-6 text-ink/70">{brief.evaluationSummary}</p></BriefSection>
          <BriefSection title="Review policy"><p className="text-sm leading-6 text-ink/65">{brief.reviewPolicy}</p><ul className="mt-4 space-y-2">{brief.reviewResponsibilities.map((item) => <CheckedItem key={item}>{item}</CheckedItem>)}</ul></BriefSection>
          <BriefSection title="Success criteria"><ul className="space-y-2">{brief.successCriteria.map((item) => <CheckedItem key={item}>{item}</CheckedItem>)}</ul></BriefSection>
        </div>

        <footer className="mt-2 flex flex-col justify-between gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center"><p className="max-w-lg text-xs leading-5 text-ink/45">This brief records the customer-selected offer and its evaluation evidence. Payment collection is outside the pilot scope.</p>{onPrint ? <Button className="print:hidden" onClick={onPrint} variant="secondary"><PrinterIcon size={16} />Print brief</Button> : null}</footer>
      </div>
    </article>
  );
}

function BriefSection({ title, children }: { title: string; children: ReactNode }) { return <section><h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-moss">{title}</h3>{children}</section>; }
function BriefRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-ink/10 py-3 first:pt-0"><span className="text-xs text-ink/45">{label}</span><span className="text-right text-xs font-bold text-ink">{value}</span></div>; }
function CheckedItem({ children }: { children: ReactNode }) { return <li className="flex gap-2 text-xs leading-5 text-ink/65"><CheckIcon className="mt-0.5 shrink-0 text-moss" size={14} />{children}</li>; }
