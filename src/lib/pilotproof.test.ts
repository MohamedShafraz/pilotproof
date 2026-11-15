import { describe, expect, it } from "vitest";
import {
  amountToMinorUnits,
  compareExtraction,
  createApprovedBrief,
  createBlurryScanSample,
  createDigitalSamples,
  fixtureExtractor,
  generateOffers,
  normalizeDate,
  runEvaluation,
} from ".";

function confirmedDigitalSamples() {
  return createDigitalSamples().map((sample) => ({ ...sample, confirmed: true }));
}

describe("normalization", () => {
  it("normalizes equivalent dates without accepting invalid calendar dates", () => {
    expect(normalizeDate("14/02/2025")).toBe("2025-02-14");
    expect(normalizeDate("February 14, 2025")).toBe("2025-02-14");
    expect(normalizeDate("2025-02-30")).toBeNull();
  });

  it("compares formatted money in currency minor units", () => {
    expect(amountToMinorUnits("$1,250.00", "USD")).toBe(125000);
    expect(amountToMinorUnits("842,70", "EUR")).toBe(84270);
    expect(amountToMinorUnits("96,400", "JPY")).toBe(96400);
    expect(amountToMinorUnits("not an amount", "USD")).toBeNull();
  });
});

describe("fixture evaluation", () => {
  it("covers the five requested Sri Lankan document categories in LKR", () => {
    const samples = createDigitalSamples();
    expect(samples.map((sample) => sample.preview.documentCategory)).toEqual([
      "tax-invoice",
      "utility-bill",
      "retail-receipt",
      "purchase-order",
      "customs-declaration",
    ]);
    expect(samples.every((sample) => sample.expected.currency === "LKR")).toBe(true);
    expect(samples.every((sample) => sample.preview.locality.endsWith("Sri Lanka"))).toBe(true);
  });

  it("passes all five digital invoices and keeps fixture outputs independent", async () => {
    const samples = confirmedDigitalSamples();
    const run = await runEvaluation(samples, fixtureExtractor, { id: "run-digital", createdAt: "2025-05-01T00:00:00.000Z" });
    expect(run.label).toBe("Simulated extraction");
    expect(run.documents).toHaveLength(5);
    expect(run.documents.every((document) => document.passed)).toBe(true);
    expect(run.groups).toEqual([{ documentType: "digital", passed: 5, total: 5, extractionErrors: 0 }]);

    samples[0].expected.total = "1,251.00";
    const changedRun = await runEvaluation(samples, fixtureExtractor, { id: "run-changed" });
    expect(changedRun.documents[0].fields.find((field) => field.field === "total")?.result).toBe("incorrect");
  });

  it("preserves meaningful invoice number characters and leading zeros", () => {
    const sample = { ...confirmedDigitalSamples()[1] };
    sample.expected = { ...sample.expected, invoiceNumber: "01-2025" };
    const result = compareExtraction(sample, {
      status: "success", provider: "fixture",
      fields: { invoiceNumber: "1-2025", invoiceDate: "2025-02-14", total: "842.70", currency: "EUR" },
    });
    expect(result.fields[0].result).toBe("incorrect");
  });

  it("marks the blurry scan total incorrect while retaining matched fields", async () => {
    const scan = { ...createBlurryScanSample(), confirmed: true };
    const run = await runEvaluation([...confirmedDigitalSamples(), scan], fixtureExtractor);
    const scanResult = run.documents.find((document) => document.documentType === "scan");
    expect(scanResult?.passed).toBe(false);
    expect(scanResult?.fields.map((field) => field.result)).toEqual(["match", "match", "incorrect"]);
    expect(run.groups.find((group) => group.documentType === "scan")).toMatchObject({ passed: 0, total: 1, extractionErrors: 0 });
  });

  it("distinguishes extraction errors from incorrect and missing values", async () => {
    const [first, second] = confirmedDigitalSamples();
    first.simulateExtractionError = true;
    const run = await runEvaluation([first, second], fixtureExtractor);
    expect(run.extractionErrorCount).toBe(1);
    expect(run.documents[0]).toMatchObject({
      extractionStatus: "error", passed: false, fields: [], extractionError: { code: "FIXTURE_UNREADABLE" },
    });

    const missing = compareExtraction(second, {
      status: "success", provider: "fixture",
      fields: { invoiceNumber: null, invoiceDate: "not a date", total: "1", currency: "EUR" },
    });
    expect(missing.extractionStatus).toBe("success");
    expect(missing.fields.map((field) => field.result)).toEqual(["missing", "incorrect", "incorrect"]);
  });
});

describe("offers and approved brief snapshots", () => {
  it("generates the required 0 of 5 and 1 of 6 review workloads", async () => {
    const digitalRun = await runEvaluation(confirmedDigitalSamples(), fixtureExtractor, { id: "run-five" });
    const digitalOffers = generateOffers(digitalRun);
    expect(digitalOffers[0].sampleCoverage).toMatchObject({ inScope: 5, routedToReview: 0 });

    const scan = { ...createBlurryScanSample(), confirmed: true };
    const fullRun = await runEvaluation([...confirmedDigitalSamples(), scan], fixtureExtractor, { id: "run-six" });
    const fullOffers = generateOffers(fullRun);
    expect(fullOffers[0].sampleCoverage).toMatchObject({ inScope: 5, routedToReview: 0 });
    expect(fullOffers[1].sampleCoverage).toMatchObject({ inScope: 6, routedToReview: 1 });
    expect(fullOffers.every((offer) => offer.eligible)).toBe(true);
  });

  it("blocks both offers when any digital sample fails", async () => {
    const samples = confirmedDigitalSamples();
    samples[0].expected.total = "9.99";
    const offers = generateOffers(await runEvaluation(samples, fixtureExtractor));
    expect(offers.every((offer) => !offer.eligible)).toBe(true);
    expect(offers[0].eligibilityReason).toContain("1 digital sample is failing");
  });

  it("creates an immutable snapshot that survives later answer and offer edits", async () => {
    const samples = confirmedDigitalSamples();
    const scan = { ...createBlurryScanSample(), confirmed: true };
    const run = await runEvaluation([...samples, scan], fixtureExtractor, { id: "approved-run" });
    const offer = generateOffers(run, {
      "digital-and-scans-review": { amount: "6,250", currency: "USD" },
    })[1];
    const brief = createApprovedBrief({
      projectName: "Acme invoice pilot", offer, evaluationRun: run,
      id: "brief-1", approvedAt: "2025-05-12T09:00:00.000Z",
    });

    offer.price.amount = "1";
    samples[0].expected.total = "0";
    const rerun = await runEvaluation(samples, fixtureExtractor, { id: "later-run" });
    expect(brief.agreedPrice).toEqual({ amount: "6,250", currency: "USD" });
    expect(brief.evaluationRun.id).toBe("approved-run");
    expect(brief.selectedOffer.reviewPolicy).toContain("Every in-scope scan");
    expect(rerun.id).toBe("later-run");
    expect(Object.isFrozen(brief)).toBe(true);
  });
});
