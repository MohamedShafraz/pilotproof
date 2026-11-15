"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AppHeader, Button, Card, DemoModeBanner, DocumentResult, EmptyState,
  ErrorState, InvoicePreview, LoadingState, ManualUploads, OfferCard, ProjectBrief,
  ResultMetrics, SampleEditor, SectionHeading,
  type OfferModel, type ProjectBriefModel, type ResultDocumentModel,
  type ResultMetricModel, type SampleEditorModel, type ViewKey,
} from "@/components";
import {
  createApprovedBrief, createBlurryScanSample, createDigitalSamples,
  generateOffers, runEvaluation,
  type ApprovedBrief, type EvaluationRun, type ExtractionProvider,
  type ExtractionResult, type InvoiceSample, type Money, type OfferId,
  type OfferPrices, type PilotOffer,
} from "@/lib";

const STORAGE_KEY = "pilotproof:mvp:v1";
const EMPTY_PRICES: Record<OfferId, Money> = {
  "digital-only": { amount: "", currency: "USD" },
  "digital-and-scans-review": { amount: "", currency: "USD" },
};

interface SavedWorkspace {
  projectName: string;
  samples: InvoiceSample[];
  run: EvaluationRun | null;
  offers: PilotOffer[];
  briefs: ApprovedBrief[];
  prices: Record<OfferId, Money>;
  activeBriefId: string | null;
  activeView: ViewKey;
}

interface ApiExtractionResponse {
  results?: Array<{ sampleId: string; result: ExtractionResult }>;
  error?: { message?: string };
}

export default function Home() {
  const [projectName, setProjectName] = useState("");
  const [samples, setSamples] = useState<InvoiceSample[]>([]);
  const [run, setRun] = useState<EvaluationRun | null>(null);
  const [offers, setOffers] = useState<PilotOffer[]>([]);
  const [briefs, setBriefs] = useState<ApprovedBrief[]>([]);
  const [prices, setPrices] = useState<Record<OfferId, Money>>(EMPTY_PRICES);
  const [activeBriefId, setActiveBriefId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewKey>("samples");
  const [hydrated, setHydrated] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const workspace = JSON.parse(saved) as Partial<SavedWorkspace>;
          if (typeof workspace.projectName === "string") setProjectName(workspace.projectName);
          if (Array.isArray(workspace.samples)) setSamples(workspace.samples);
          if (workspace.run) setRun(workspace.run);
          if (Array.isArray(workspace.offers)) setOffers(workspace.offers);
          if (Array.isArray(workspace.briefs)) setBriefs(workspace.briefs);
          if (workspace.prices) setPrices(workspace.prices);
          if (typeof workspace.activeBriefId === "string") setActiveBriefId(workspace.activeBriefId);
          if (["samples", "results", "offers", "brief"].includes(workspace.activeView ?? "")) {
            setActiveView(workspace.activeView as ViewKey);
          }
        }
      } catch {
        setError("The saved demo workspace could not be read. You can start a fresh sample set.");
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const workspace: SavedWorkspace = {
      projectName, samples, run, offers, briefs, prices, activeBriefId, activeView,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [activeBriefId, activeView, briefs, hydrated, offers, prices, projectName, run, samples]);

  const availableViews = useMemo<ViewKey[]>(() => {
    const views: ViewKey[] = ["samples"];
    if (run) views.push("results", "offers");
    if (briefs.length) views.push("brief");
    return views;
  }, [briefs.length, run]);

  const currentView = availableViews.includes(activeView) ? activeView : "samples";

  const allConfirmed = samples.length > 0 && samples.every((sample) => sample.confirmed);
  const scan = samples.find((sample) => sample.optional && sample.documentType === "scan");
  const activeBrief = briefs.find((brief) => brief.id === activeBriefId) ?? briefs.at(-1) ?? null;

  function loadDigitalSamples() {
    if (!projectName.trim()) return;
    setSamples(createDigitalSamples());
    setRun(null);
    setOffers([]);
    setError(null);
    setActiveView("samples");
  }

  function invalidateEvidence() {
    setRun(null);
    setOffers([]);
    setActiveView("samples");
    setError(null);
  }

  function updateSample(sampleId: string, update: (sample: InvoiceSample) => InvoiceSample) {
    setSamples((current) => current.map((item) => item.id === sampleId ? update(item) : item));
    invalidateEvidence();
  }

  function addScan() {
    if (scan) return;
    setSamples((current) => [...current, createBlurryScanSample()]);
    invalidateEvidence();
  }

  function removeScan() {
    setSamples((current) => current.filter((item) => !item.optional));
    invalidateEvidence();
  }

  async function evaluate() {
    if (!allConfirmed || running) return;
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ samples }),
      });
      const payload = (await response.json()) as ApiExtractionResponse;
      if (!response.ok || !payload.results) {
        throw new Error(payload.error?.message ?? "The simulated extraction request failed.");
      }
      const results = new Map(payload.results.map((item) => [item.sampleId, item.result]));
      const serverProvider: ExtractionProvider = {
        async extract(sample) {
          return results.get(sample.id) ?? {
            status: "error", provider: "fixture",
            error: { code: "MISSING_RESULT", message: "The simulated extractor returned no result for this sample." },
          };
        },
      };
      const nextRun = await runEvaluation(samples, serverProvider);
      const nextOffers = generateOffers(nextRun, prices as OfferPrices);
      setRun(nextRun);
      setOffers(nextOffers);
      setActiveView("results");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The evaluation could not be completed.");
    } finally {
      setRunning(false);
    }
  }

  function updateOfferPrice(id: OfferId, update: Partial<Money>) {
    const nextMoney = { ...prices[id], ...update };
    setPrices((current) => ({ ...current, [id]: nextMoney }));
    setOffers((current) => current.map((offer) =>
      offer.id === id ? { ...offer, price: { ...offer.price, ...update } } : offer));
  }

  function approveOffer(offer: PilotOffer) {
    if (!run) return;
    try {
      const brief = createApprovedBrief({ projectName, offer, evaluationRun: run, price: offer.price });
      setBriefs((current) => [...current, brief]);
      setActiveBriefId(brief.id);
      setActiveView("brief");
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The offer could not be approved.");
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <AppHeader activeView={currentView} availableViews={availableViews} onNavigate={setActiveView} projectName={projectName} />
      <DemoModeBanner />
      <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-7 sm:py-12 lg:px-10">
        {!hydrated ? <LoadingState label="Opening your demo workspace…" /> : null}
        {hydrated ? (
          <div hidden={currentView !== "samples"}>
            <SamplesView
              allConfirmed={allConfirmed} error={error} onAddScan={addScan}
              onConfirmAll={() => setSamples((current) => current.map((item) => ({ ...item, confirmed: true })))}
              onEvaluate={evaluate} onLoad={loadDigitalSamples} onProjectNameChange={setProjectName}
              onRemoveScan={removeScan} onUpdateSample={updateSample} projectName={projectName}
              running={running} samples={samples} scan={scan}
            />
          </div>
        ) : null}
        {hydrated && currentView === "results" ? (
          <ResultsView error={error} onContinue={() => setActiveView("offers")} onEdit={() => setActiveView("samples")} run={run} samples={samples} />
        ) : null}
        {hydrated && currentView === "offers" ? (
          <OffersView error={error} offers={offers} onApprove={approveOffer} onEditPrice={updateOfferPrice} run={run} />
        ) : null}
        {hydrated && currentView === "brief" ? (
          <BriefView activeBrief={activeBrief} activeBriefId={activeBriefId} briefs={briefs} onSelectBrief={setActiveBriefId} />
        ) : null}
      </main>
    </div>
  );
}

function SamplesView({
  allConfirmed, error, onAddScan, onConfirmAll, onEvaluate, onLoad,
  onProjectNameChange, onRemoveScan, onUpdateSample, projectName, running,
  samples, scan,
}: {
  allConfirmed: boolean; error: string | null; onAddScan: () => void;
  onConfirmAll: () => void; onEvaluate: () => void; onLoad: () => void;
  onProjectNameChange: (value: string) => void; onRemoveScan: () => void;
  onUpdateSample: (id: string, update: (sample: InvoiceSample) => InvoiceSample) => void;
  projectName: string; running: boolean; samples: InvoiceSample[]; scan?: InvoiceSample;
}) {
  if (!samples.length) {
    return (
      <div className="grid gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <Card className="overflow-hidden !bg-ink p-7 text-white sm:p-10 lg:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">Sri Lankan document extraction · working MVP</p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.04] tracking-[-0.04em] sm:text-6xl">Turn sample evidence into an offer worth approving.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">Verify the answers, run a transparent simulated extraction, compare two pilot shapes, and lock the selected offer into a delivery-ready brief.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {["5 Sri Lankan document types", "1 revealing scan edge case", "2 explicit pilot offers"].map((item, index) => (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4" key={item}><p className="text-[10px] font-bold text-mint/70">0{index + 1}</p><p className="mt-2 text-sm font-semibold leading-5">{item}</p></div>
            ))}
          </div>
        </Card>
        <Card className="flex flex-col justify-center p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Start a pilot</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Name the customer project</h2>
          <p className="mt-3 text-sm leading-6 text-ink/55">This name follows the evidence into the approved project brief.</p>
          <label className="mt-7 text-xs font-bold text-ink/65">Project name
            <input autoFocus className="mt-2 min-h-12 w-full rounded-xl border border-ink/15 bg-white px-4 text-base font-semibold outline-none focus:border-moss focus:ring-2 focus:ring-moss/15" onChange={(event) => onProjectNameChange(event.target.value)} placeholder="e.g. Sri Lanka AP document pilot" value={projectName} />
          </label>
          <Button className="mt-5 w-full" disabled={!projectName.trim()} onClick={onLoad} trailingArrow>Load Sri Lankan sample pack</Button>
          <div className="mt-6 border-t border-ink/10 pt-5">
            <p className="text-center text-xs leading-5 text-ink/45">Load the sample pack first, then add browser-only document pictures for a local preview.</p>
          </div>
          {error ? <div className="mt-5"><ErrorState description={error} onRetry={onLoad} /></div> : null}
        </Card>
      </div>
    );
  }

  return <SamplesLoaded allConfirmed={allConfirmed} error={error} onAddScan={onAddScan} onConfirmAll={onConfirmAll} onEvaluate={onEvaluate} onProjectNameChange={onProjectNameChange} onRemoveScan={onRemoveScan} onUpdateSample={onUpdateSample} projectName={projectName} running={running} samples={samples} scan={scan} />;
}

function SamplesLoaded({
  allConfirmed, error, onAddScan, onConfirmAll, onEvaluate,
  onProjectNameChange, onRemoveScan, onUpdateSample, projectName, running,
  samples, scan,
}: {
  allConfirmed: boolean; error: string | null; onAddScan: () => void;
  onConfirmAll: () => void; onEvaluate: () => void;
  onProjectNameChange: (value: string) => void; onRemoveScan: () => void;
  onUpdateSample: (id: string, update: (sample: InvoiceSample) => InvoiceSample) => void;
  projectName: string; running: boolean; samples: InvoiceSample[]; scan?: InvoiceSample;
}) {
  return (
    <div>
      <SectionHeading
        action={<div className="flex flex-wrap gap-2"><Button onClick={onConfirmAll} variant="secondary">Confirm all shown values</Button>{scan ? <Button onClick={onRemoveScan} variant="ghost">Remove blurry scan</Button> : <Button onClick={onAddScan} variant="secondary">Add blurry scan</Button>}</div>}
        description="Check the ground truth before extraction runs. Editing a value after a run clears only the current evidence—approved briefs remain fixed."
        eyebrow="01 · Ground truth" title="Verify sample answers"
      />
      <div className="mb-7 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <Card className="p-5 shadow-none">
          <label className="text-xs font-bold text-ink/60">Project name
            <input className="mt-2 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-sm font-semibold outline-none focus:border-moss" onChange={(event) => onProjectNameChange(event.target.value)} value={projectName} />
          </label>
        </Card>
        <div className="rounded-2xl border border-amber/25 bg-[#fff7df] p-4 text-xs leading-5 text-[#6f4d1d] lg:max-w-sm"><strong>Evaluation boundary.</strong> Manual pictures stay in this browser for preview only. Simulated extraction remains limited to the bundled fixtures.</div>
      </div>

      <div className="mb-8">
        <ManualUploads />
      </div>

      <div className="space-y-8">
        {samples.map((sample, index) => {
          const model = toSampleModel(sample);
          return (
            <section aria-labelledby={`sample-${sample.id}`} className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]" key={sample.id}>
              <div>
                <h2 className="sr-only" id={`sample-${sample.id}`}>Sample {index + 1}: {sample.preview.filename}</h2>
                <InvoicePreview sample={model} />
              </div>
              <div className="space-y-3">
                <SampleEditor
                  index={index}
                  onConfirm={() => { if (!sample.confirmed) onUpdateSample(sample.id, (current) => ({ ...current, confirmed: true })); }}
                  onKindChange={(kind) => onUpdateSample(sample.id, (current) => ({ ...current, documentType: kind, confirmed: false }))}
                  onValuesChange={(values) => onUpdateSample(sample.id, (current) => ({ ...current, expected: values, confirmed: false }))}
                  sample={model}
                />
                {sample.documentType === "scan" ? (
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 bg-white/55 p-4 text-xs leading-5 text-ink/60">
                    <input checked={Boolean(sample.simulateExtractionError)} className="mt-0.5 accent-[#315c43]" onChange={(event) => onUpdateSample(sample.id, (current) => ({ ...current, simulateExtractionError: event.target.checked, confirmed: false }))} type="checkbox" />
                    <span><strong className="block text-ink">Demo control: simulate an extraction failure</strong>Use this to see a provider error reported separately from the fixture&apos;s normal incorrect total.</span>
                  </label>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      {error ? <div className="mt-7"><ErrorState description={error} onRetry={onEvaluate} /></div> : null}
      <div className="sticky bottom-4 z-20 mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-[#fbfaf6]/95 p-4 shadow-card backdrop-blur sm:flex-row sm:px-6 print:hidden">
        <div><p className="text-sm font-bold">{samples.filter((item) => item.confirmed).length} of {samples.length} samples confirmed</p><p className="mt-1 text-xs text-ink/45">Every expected answer must be confirmed before evaluation.</p></div>
        <Button disabled={!allConfirmed || running || !projectName.trim()} onClick={onEvaluate} trailingArrow>{running ? "Running simulated extraction…" : "Run simulated extraction"}</Button>
      </div>
    </div>
  );
}

function ResultsView({ error, onContinue, onEdit, run, samples }: {
  error: string | null; onContinue: () => void; onEdit: () => void;
  run: EvaluationRun | null; samples: InvoiceSample[];
}) {
  if (!run) return <EmptyState description="Confirm the samples and run the evaluation to see field-level evidence." title="No evaluation yet" />;
  const passed = run.documents.filter((document) => document.passed).length;
  const metrics: ResultMetricModel[] = [
    { label: "Documents passed", value: `${passed} / ${run.documents.length}`, detail: "All three required fields must match", tone: passed === run.documents.length ? "success" : "warning" },
    ...run.groups.map((group) => ({
      label: group.documentType === "digital" ? "Digital documents" : "Scanned documents",
      value: `${group.passed} / ${group.total}`,
      detail: `${group.extractionErrors} extraction error${group.extractionErrors === 1 ? "" : "s"}`,
      tone: group.passed === group.total ? "success" as const : "warning" as const,
    })),
    { label: "Extraction errors", value: String(run.extractionErrorCount), detail: "Reported separately from incorrect values", tone: run.extractionErrorCount ? "warning" : "default" },
  ];
  const resultModels = run.documents.map((document): ResultDocumentModel => {
    const sample = samples.find((item) => item.id === document.sampleId);
    return {
      id: document.sampleId, filename: document.filename,
      supplier: sample?.preview.supplier ?? document.filename,
      kind: document.documentType, passed: document.passed,
      evidence: document.fields.map((field) => ({ key: field.field, label: field.label, verified: field.verifiedValue, extracted: field.extractedValue, status: field.result })),
      extractionError: document.extractionError ? `${document.extractionError.code}: ${document.extractionError.message}` : null,
    };
  });
  return (
    <div>
      <SectionHeading action={<span className="rounded-full bg-mint px-4 py-2 text-xs font-bold text-moss">{run.label}</span>} description="Every required field is compared with its verified answer. Equivalent date and money formatting is normalized before scoring." eyebrow="02 · Evaluation evidence" title="What matched—and what did not" />
      {error ? <div className="mb-6"><ErrorState description={error} /></div> : null}
      <ResultMetrics metrics={metrics} />
      <div className="mt-7 space-y-4">{resultModels.map((result) => <DocumentResult key={result.id} result={result} />)}</div>
      <div className="mt-8 flex flex-col-reverse justify-between gap-3 sm:flex-row"><Button onClick={onEdit} variant="secondary">Edit verified answers</Button><Button onClick={onContinue} trailingArrow>Compare pilot offers</Button></div>
    </div>
  );
}

function OffersView({ error, offers, onApprove, onEditPrice, run }: {
  error: string | null; offers: PilotOffer[];
  onApprove: (offer: PilotOffer) => void;
  onEditPrice: (id: OfferId, update: Partial<Money>) => void;
  run: EvaluationRun | null;
}) {
  if (!run || !offers.length) return <EmptyState description="Run an evaluation to generate offers from the evidence." title="No offers yet" />;
  const hasScans = run.documents.some((document) => document.documentType === "scan");
  return (
    <div>
      <SectionHeading description="These options are generated from the latest evaluation. Enter the commercial price, then approve the customer’s selected scope." eyebrow="03 · Commercial options" title="Compare pilot offers" />
      {error ? <div className="mb-6"><ErrorState description={error} /></div> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        {offers.map((offer, index) => (
          <OfferCard
            key={offer.id}
            offer={toOfferModel(offer, hasScans ? offer.id === "digital-and-scans-review" : index === 0)}
            onApprove={() => onApprove(offer)}
            onCurrencyChange={(currency) => onEditPrice(offer.id, { currency })}
            onPriceChange={(amount) => onEditPrice(offer.id, { amount })}
          />
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-ink/45">Approval records the customer-selected offer as a fixed snapshot. Payment collection is outside this MVP.</p>
    </div>
  );
}

function BriefView({ activeBrief, activeBriefId, briefs, onSelectBrief }: {
  activeBrief: ApprovedBrief | null; activeBriefId: string | null;
  briefs: ApprovedBrief[]; onSelectBrief: (id: string) => void;
}) {
  if (!activeBrief) return <EmptyState description="Approve a priced offer to create a fixed project brief." title="No approved brief" />;
  return (
    <div>
      <div className="mb-8 print:hidden">
        <SectionHeading description="Each approval is preserved as its own snapshot, even when answers are edited and the evaluation is run again." eyebrow="04 · Customer selection" title="Approved project brief" />
        {briefs.length > 1 ? (
          <div aria-label="Approval history" className="flex flex-wrap gap-2" role="list">
            {briefs.map((brief, index) => (
              <button
                aria-pressed={(activeBriefId ?? activeBrief.id) === brief.id}
                className={`min-h-10 rounded-full border px-4 text-xs font-bold ${brief.id === activeBrief.id ? "border-moss bg-mint text-moss" : "border-ink/10 bg-white text-ink/55"}`}
                key={brief.id} onClick={() => onSelectBrief(brief.id)} type="button"
              >Approval {index + 1} · {new Date(brief.approvedAt).toLocaleDateString()}</button>
            ))}
          </div>
        ) : null}
      </div>
      <ProjectBrief brief={toBriefModel(activeBrief)} onPrint={() => window.print()} />
    </div>
  );
}

function toSampleModel(sample: InvoiceSample): SampleEditorModel {
  return {
    id: sample.id, filename: sample.preview.filename, supplier: sample.preview.supplier,
    kind: sample.documentType, expected: { ...sample.expected },
    confirmed: sample.confirmed, isBlurry: sample.documentType === "scan",
    documentLabel: sample.preview.documentLabel,
    referenceLabel: sample.preview.referenceLabel,
    dateLabel: sample.preview.dateLabel,
    totalLabel: sample.preview.totalLabel,
    locality: sample.preview.locality,
    registrationLabel: sample.preview.registrationLabel,
    lineItems: sample.preview.lineItems.map((item) => ({ ...item })),
  };
}

function toOfferModel(offer: PilotOffer, recommended: boolean): OfferModel {
  return {
    id: offer.id, name: offer.name,
    eyebrow: offer.id === "digital-only" ? "Focused scope" : "Broader coverage",
    description: offer.id === "digital-only"
      ? "Automate the proven digital document path with no routine review step."
      : "Include scanned documents while protecting quality with an explicit human-review route.",
    includedTypes: offer.includedDocumentTypes.map((type) => type === "digital" ? "Digital documents" : "Scanned documents"),
    reviewWorkload: `${offer.sampleCoverage.routedToReview} of ${offer.sampleCoverage.inScope} samples routed to review`,
    proposedVolume: `${offer.proposedPilotVolume.toLocaleString()} documents`,
    successCriteria: offer.successCriteria, reviewPolicy: offer.reviewPolicy,
    price: offer.price.amount, currency: offer.price.currency, eligible: offer.eligible,
    recommended, ineligibilityReason: offer.eligibilityReason,
  };
}

function toBriefModel(brief: ApprovedBrief): ProjectBriefModel {
  const passed = brief.evaluationRun.documents.filter((document) => document.passed).length;
  return {
    briefId: brief.id,
    approvedAt: new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeStyle: "short" }).format(new Date(brief.approvedAt)),
    projectName: brief.projectName, offerName: brief.selectedOffer.name,
    price: brief.agreedPrice.amount, currency: brief.agreedPrice.currency,
    evaluationLabel: brief.evaluationRun.label,
    evaluationSummary: `${passed} of ${brief.evaluationRun.documents.length} evaluated samples passed all required fields; ${brief.evaluationRun.extractionErrorCount} extraction errors were recorded separately.`,
    includedTypes: brief.selectedOffer.includedDocumentTypes.map((type) => type === "digital" ? "Digital documents" : "Scanned documents"),
    proposedVolume: `${brief.selectedOffer.proposedPilotVolume.toLocaleString()} documents`,
    reviewPolicy: brief.selectedOffer.reviewPolicy,
    reviewResponsibilities: brief.reviewResponsibilities,
    successCriteria: brief.successCriteria,
  };
}
