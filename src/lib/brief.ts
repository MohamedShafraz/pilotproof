import type { ApprovedBrief, EvaluationRun, Money, PilotOffer } from "./types";

export interface ApprovalInput {
  projectName: string;
  offer: PilotOffer;
  evaluationRun: EvaluationRun;
  price?: Money;
  id?: string;
  approvedAt?: string;
}

export function createApprovedBrief(input: ApprovalInput): ApprovedBrief {
  if (!input.offer.eligible) {
    throw new Error(input.offer.eligibilityReason ?? "This offer is not eligible for approval.");
  }
  if (input.offer.evaluationRunId !== input.evaluationRun.id) {
    throw new Error("The offer must be approved against the evaluation run that generated it.");
  }

  const selectedOffer = deepClone(input.offer);
  const agreedPrice = deepClone(input.price ?? selectedOffer.price);
  selectedOffer.price = deepClone(agreedPrice);
  const brief: ApprovedBrief = {
    id: input.id ?? createId("brief"),
    projectName: input.projectName.trim() || "Untitled pilot",
    approvedAt: input.approvedAt ?? new Date().toISOString(),
    selectedOffer,
    agreedPrice,
    evaluationRun: deepClone(input.evaluationRun),
    reviewResponsibilities: [...selectedOffer.reviewResponsibilities],
    successCriteria: [...selectedOffer.successCriteria],
  };
  return deepFreeze(brief);
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach((nested) => deepFreeze(nested));
  }
  return value;
}

function createId(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  return `${prefix}-${uuid}`;
}
