export type ViewKey = "samples" | "results" | "offers" | "brief";

export type DocumentKind = "digital" | "scan";

export interface InvoiceValues {
  invoiceNumber: string;
  invoiceDate: string;
  total: string;
  currency: string;
}

export interface SampleEditorModel {
  id: string;
  filename: string;
  supplier: string;
  kind: DocumentKind;
  expected: InvoiceValues;
  confirmed: boolean;
  isBlurry?: boolean;
  documentLabel?: string;
  referenceLabel?: string;
  dateLabel?: string;
  totalLabel?: string;
  locality?: string;
  registrationLabel?: string;
  lineItems?: Array<{ description: string; quantity: number; amount: string }>;
}

export type EvidenceStatus = "match" | "incorrect" | "missing";

export interface EvidenceRowModel {
  key: string;
  label: string;
  verified: string;
  extracted: string | null;
  status: EvidenceStatus;
}

export interface ResultDocumentModel {
  id: string;
  filename: string;
  supplier: string;
  kind: DocumentKind;
  passed: boolean;
  evidence: EvidenceRowModel[];
  extractionError?: string | null;
}

export interface ResultMetricModel {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "success" | "warning";
}

export interface OfferModel {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  includedTypes: string[];
  reviewWorkload: string;
  proposedVolume: string;
  successCriteria: string[];
  reviewPolicy: string;
  price: string;
  currency: string;
  eligible: boolean;
  recommended?: boolean;
  ineligibilityReason?: string;
}

export interface ProjectBriefModel {
  briefId: string;
  approvedAt: string;
  projectName: string;
  offerName: string;
  price: string;
  currency: string;
  evaluationLabel: string;
  evaluationSummary: string;
  includedTypes: string[];
  proposedVolume: string;
  reviewPolicy: string;
  reviewResponsibilities: string[];
  successCriteria: string[];
}

