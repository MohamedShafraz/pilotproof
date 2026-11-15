export const REQUIRED_FIELDS = ["invoiceNumber", "invoiceDate", "total"] as const;

export type RequiredField = (typeof REQUIRED_FIELDS)[number];
export type DocumentType = "digital" | "scan";
export type DocumentCategory = "tax-invoice" | "utility-bill" | "retail-receipt" | "purchase-order" | "customs-declaration";
export type ExtractionStatus = "success" | "error";
export type FieldResult = "match" | "incorrect" | "missing";
export type CurrencyCode = string;

export interface InvoiceFields {
  invoiceNumber: string;
  invoiceDate: string;
  total: string;
  currency: CurrencyCode;
}

export interface InvoicePreview {
  supplier: string;
  customer: string;
  filename: string;
  accent: string;
  documentCategory: DocumentCategory;
  documentLabel: string;
  referenceLabel: string;
  dateLabel: string;
  totalLabel: string;
  locality: string;
  registrationLabel?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    amount: string;
  }>;
}

export interface InvoiceSample {
  id: string;
  fixtureId: string;
  documentType: DocumentType;
  expected: InvoiceFields;
  confirmed: boolean;
  optional?: boolean;
  simulateExtractionError?: boolean;
  preview: InvoicePreview;
}

export interface ExtractedInvoiceFields {
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  total?: string | null;
  currency?: CurrencyCode | null;
}

export type ExtractionResult =
  | {
      status: "success";
      fields: ExtractedInvoiceFields;
      provider: "fixture";
    }
  | {
      status: "error";
      provider: "fixture";
      error: { code: string; message: string };
    };

export interface ExtractionProvider {
  extract(sample: InvoiceSample): Promise<ExtractionResult>;
}

export interface FieldComparison {
  field: RequiredField;
  label: string;
  verifiedValue: string;
  extractedValue: string | null;
  result: FieldResult;
  detail?: string;
}

export interface EvaluatedDocument {
  sampleId: string;
  fixtureId: string;
  filename: string;
  documentType: DocumentType;
  extractionStatus: ExtractionStatus;
  passed: boolean;
  fields: FieldComparison[];
  extractionError?: { code: string; message: string };
}

export interface ResultGroup {
  documentType: DocumentType;
  passed: number;
  total: number;
  extractionErrors: number;
}

export interface EvaluationRun {
  id: string;
  label: "Simulated extraction";
  createdAt: string;
  documents: EvaluatedDocument[];
  groups: ResultGroup[];
  extractionErrorCount: number;
}

export type OfferId = "digital-only" | "digital-and-scans-review";

export interface Money {
  amount: string;
  currency: CurrencyCode;
}

export interface PilotOffer {
  id: OfferId;
  name: string;
  includedDocumentTypes: DocumentType[];
  sampleCoverage: { inScope: number; total: number; routedToReview: number };
  proposedPilotVolume: number;
  successCriteria: string[];
  reviewPolicy: string;
  reviewResponsibilities: string[];
  price: Money;
  eligible: boolean;
  eligibilityReason?: string;
  evaluationRunId: string;
}

export interface ApprovedBrief {
  id: string;
  projectName: string;
  approvedAt: string;
  selectedOffer: PilotOffer;
  agreedPrice: Money;
  evaluationRun: EvaluationRun;
  reviewResponsibilities: string[];
  successCriteria: string[];
}
