import { AlertIcon, CheckIcon } from "./icons";
import { Card, Pill } from "./primitives";
import type { EvidenceRowModel, EvidenceStatus, ResultDocumentModel, ResultMetricModel } from "./types";

const statusStyles: Record<EvidenceStatus, string> = {
  match: "bg-mint text-moss",
  incorrect: "bg-[#fde8e1] text-[#a5412d]",
  missing: "bg-[#f3ede0] text-[#765f37]",
};

export function ResultBadge({ status }: { status: EvidenceStatus }) {
  return <span className={`inline-flex min-w-[76px] items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyles[status]}`}>{status === "match" ? <CheckIcon className="mr-1" size={12} /> : null}{status}</span>;
}

export function ResultMetrics({ metrics }: { metrics: ResultMetricModel[] }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <Card className={`p-5 shadow-none ${metric.tone === "success" ? "border-moss/20 bg-mint/25" : metric.tone === "warning" ? "border-amber/30 bg-[#fff9e9]" : ""}`} key={metric.label}><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/45">{metric.label}</p><p className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">{metric.value}</p><p className="mt-1 text-xs leading-5 text-ink/55">{metric.detail}</p></Card>)}</div>;
}

export function EvidenceTable({ rows }: { rows: EvidenceRowModel[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-left">
        <thead><tr className="border-b border-ink/10 text-[10px] font-bold uppercase tracking-[0.15em] text-ink/40"><th className="px-5 py-3">Required field</th><th className="px-5 py-3">Verified value</th><th className="px-5 py-3">Extracted value</th><th className="px-5 py-3 text-right">Result</th></tr></thead>
        <tbody>{rows.map((row) => <tr className="border-b border-ink/5 last:border-b-0" key={row.key}><th className="px-5 py-4 text-sm font-semibold text-ink">{row.label}</th><td className="px-5 py-4 font-mono text-xs text-ink/65">{row.verified}</td><td className={`px-5 py-4 font-mono text-xs ${row.status === "incorrect" ? "font-bold text-coral" : "text-ink/65"}`}>{row.extracted ?? <span className="font-sans italic text-ink/35">Not returned</span>}</td><td className="px-5 py-4 text-right"><ResultBadge status={row.status} /></td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function DocumentResult({ result }: { result: ResultDocumentModel }) {
  return (
    <Card className="overflow-hidden shadow-none">
      <div className="flex flex-col justify-between gap-3 border-b border-ink/10 bg-[#fbfaf6] px-5 py-4 sm:flex-row sm:items-center">
        <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-ink">{result.supplier}</h3><Pill>{result.kind}</Pill></div><p className="mt-1 text-xs text-ink/45">{result.filename}</p></div>
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${result.passed ? "bg-mint text-moss" : "bg-[#fde8e1] text-[#9d402c]"}`}>{result.passed ? <CheckIcon size={14} /> : <AlertIcon size={14} />}{result.passed ? "Document passed" : "Needs attention"}</span>
      </div>
      {result.extractionError ? <div className="m-4 flex items-start gap-3 rounded-xl border border-coral/25 bg-[#fff1ec] p-4 text-sm text-[#8f3825]"><AlertIcon className="mt-0.5 shrink-0" size={17} /><div><p className="font-bold">Extraction error</p><p className="mt-1 text-xs leading-5 opacity-80">{result.extractionError}</p></div></div> : <EvidenceTable rows={result.evidence} />}
    </Card>
  );
}
