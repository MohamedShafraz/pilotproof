import { CheckIcon, ShieldIcon } from "./icons";
import type { ViewKey } from "./types";

const steps: { key: ViewKey; label: string; number: string }[] = [
  { key: "samples", label: "Samples", number: "01" },
  { key: "results", label: "Results", number: "02" },
  { key: "offers", label: "Pilot offers", number: "03" },
  { key: "brief", label: "Project brief", number: "04" },
];

export function AppHeader({ activeView, availableViews, projectName, onNavigate }: { activeView: ViewKey; availableViews: ViewKey[]; projectName?: string; onNavigate: (view: ViewKey) => void }) {
  const activeIndex = steps.findIndex((step) => step.key === activeView);

  return (
    <header className="border-b border-ink/10 bg-[#f9f7f1]/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-5 px-4 py-4 sm:px-7 lg:px-10">
        <div className="flex shrink-0 items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-ink text-white shadow-sm"><ShieldIcon size={20} /></span>
          <div>
            <p className="font-display text-lg font-bold leading-none tracking-[-0.025em]">PilotProof</p>
            <p className="mt-1 hidden text-[11px] font-medium text-ink/50 sm:block">Evidence before commitment</p>
          </div>
        </div>

        <div className="hidden min-w-0 text-right xl:block">
          <p className="truncate text-xs font-semibold text-ink/45">{projectName || "New pilot"}</p>
          <p className="mt-1 flex items-center justify-end gap-1.5 text-xs font-semibold text-moss"><span className="size-1.5 rounded-full bg-moss" />Local demo saved</p>
        </div>
      </div>

      <nav aria-label="Pilot workflow" className="mx-auto max-w-[1480px] overflow-x-auto px-4 sm:px-7 lg:px-10">
        <ol className="flex min-w-[600px]">
          {steps.map((step, index) => {
            const allowed = availableViews.includes(step.key);
            const complete = index < activeIndex;
            const active = step.key === activeView;
            return (
              <li className="relative flex-1" key={step.key}>
                <button
                  aria-current={active ? "step" : undefined}
                  className={`group flex w-full items-center gap-3 border-b-2 px-1 pb-3 pt-1 text-left transition ${active ? "border-moss text-ink" : "border-transparent text-ink/45 hover:text-ink"}`}
                  disabled={!allowed}
                  onClick={() => onNavigate(step.key)}
                  type="button"
                >
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${active ? "bg-moss text-white" : complete ? "bg-mint text-moss" : "bg-ink/5"}`}>
                    {complete ? <CheckIcon size={14} /> : step.number}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">{step.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}
