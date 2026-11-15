import type { ReactNode } from "react";
import { AlertIcon, FileIcon, SparkIcon } from "./icons";
import { Button } from "./primitives";

export function EmptyState({ title, description, action, icon = "file" }: { title: string; description: string; action?: ReactNode; icon?: "file" | "spark" }) {
  return <div className="grid min-h-[340px] place-items-center rounded-3xl border border-dashed border-ink/20 bg-white/50 p-8 text-center"><div className="max-w-sm"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-mint text-moss">{icon === "spark" ? <SparkIcon /> : <FileIcon />}</span><h3 className="mt-5 font-display text-xl font-bold text-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-ink/55">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</div></div>;
}

export function ErrorState({ title = "Something went wrong", description, onRetry }: { title?: string; description: string; onRetry?: () => void }) {
  return <div className="rounded-2xl border border-coral/25 bg-[#fff1ec] p-5"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-coral/10 text-coral"><AlertIcon size={18} /></span><div><h3 className="text-sm font-bold text-[#803321]">{title}</h3><p className="mt-1 text-xs leading-5 text-[#803321]/70">{description}</p>{onRetry ? <Button className="mt-4" onClick={onRetry} variant="secondary">Try again</Button> : null}</div></div></div>;
}

export function LoadingState({ label = "Running simulated extraction…" }: { label?: string }) {
  return <div aria-live="polite" className="grid min-h-[300px] place-items-center rounded-3xl border border-ink/10 bg-white"><div className="text-center"><span className="relative mx-auto block size-12"><span className="absolute inset-0 rounded-full border-2 border-ink/10" /><span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-moss" /></span><p className="mt-4 text-sm font-semibold text-ink">{label}</p><p className="mt-1 text-xs text-ink/45">Comparing required fields against verified answers</p></div></div>;
}
