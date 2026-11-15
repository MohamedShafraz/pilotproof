import type { EvaluationRun, Money, OfferId, PilotOffer } from "./types";

export interface OfferPrices {
  "digital-only"?: Money;
  "digital-and-scans-review"?: Money;
}

const DEFAULT_PRICES: Record<OfferId, Money> = {
  "digital-only": { amount: "2,500", currency: "USD" },
  "digital-and-scans-review": { amount: "4,800", currency: "USD" },
};

export function generateOffers(run: EvaluationRun, prices: OfferPrices = {}): PilotOffer[] {
  const digital = run.documents.filter((document) => document.documentType === "digital");
  const scans = run.documents.filter((document) => document.documentType === "scan");
  const failedDigital = digital.filter((document) => !document.passed);
  const eligible = digital.length > 0 && failedDigital.length === 0;
  const eligibilityReason = !digital.length
    ? "Run an evaluation with confirmed digital samples before approval."
    : failedDigital.length
      ? `${failedDigital.length} digital sample${failedDigital.length === 1 ? " is" : "s are"} failing. Resolve ${failedDigital.length === 1 ? "it" : "them"} before approval.`
      : undefined;

  return [
    {
      id: "digital-only",
      name: "Digital Sri Lankan documents only",
      includedDocumentTypes: ["digital"],
      sampleCoverage: { inScope: digital.length, total: run.documents.length, routedToReview: 0 },
      proposedPilotVolume: 250,
      successCriteria: [
        "At least 95% of in-scope digital documents pass all three required fields.",
        "Document reference, document date, and total with currency are returned for every processed document.",
        "Extraction errors are reported separately and do not count as correct results.",
      ],
      reviewPolicy: "No routine human review is included for supported digital documents.",
      reviewResponsibilities: [
        "Customer supplies representative Sri Lankan digital documents.",
        "Delivery team investigates extraction errors during the pilot.",
      ],
      price: cloneMoney(prices["digital-only"] ?? DEFAULT_PRICES["digital-only"]),
      eligible,
      eligibilityReason,
      evaluationRunId: run.id,
    },
    {
      id: "digital-and-scans-review",
      name: "Digital and scanned Sri Lankan documents with human review",
      includedDocumentTypes: ["digital", "scan"],
      sampleCoverage: { inScope: digital.length + scans.length, total: run.documents.length, routedToReview: scans.length },
      proposedPilotVolume: 500,
      successCriteria: [
        "At least 95% of in-scope digital documents pass all three required fields.",
        "100% of in-scope scans are routed to human review before results are accepted.",
        "Reviewed documents leave the workflow with reference, date, and total with currency confirmed.",
      ],
      reviewPolicy: "Every in-scope scan is routed to human review, whether extraction matches or not.",
      reviewResponsibilities: [
        "Customer supplies representative Sri Lankan digital documents and scans.",
        "Customer reviewer confirms or corrects every scanned document.",
        "Delivery team monitors extraction errors and review routing.",
      ],
      price: cloneMoney(prices["digital-and-scans-review"] ?? DEFAULT_PRICES["digital-and-scans-review"]),
      eligible,
      eligibilityReason,
      evaluationRunId: run.id,
    },
  ];
}

function cloneMoney(money: Money): Money {
  return { amount: money.amount, currency: money.currency.toUpperCase() };
}
