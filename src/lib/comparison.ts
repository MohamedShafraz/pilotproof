import type {
  DocumentType,
  EvaluatedDocument,
  EvaluationRun,
  ExtractedInvoiceFields,
  ExtractionProvider,
  ExtractionResult,
  FieldComparison,
  InvoiceSample,
  ResultGroup,
} from "./types";

const CURRENCY_EXPONENTS: Readonly<Record<string, number>> = Object.freeze({
  BHD: 3, CLP: 0, JPY: 0, KWD: 3, OMR: 3, VND: 0,
});

export function normalizeInvoiceNumber(value: string): string {
  return value.normalize("NFC").trim();
}

export function normalizeCurrency(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoLike = /^(\d{4})[-/]([01]?\d)[-/]([0-3]?\d)$/.exec(trimmed);
  if (isoLike) return validIsoDate(isoLike[1], isoLike[2], isoLike[3]);

  const dayFirst = /^([0-3]?\d)[-/]([01]?\d)[-/](\d{4})$/.exec(trimmed);
  if (dayFirst) return validIsoDate(dayFirst[3], dayFirst[2], dayFirst[1]);

  const monthName = /^([A-Za-z]+)\s+([0-3]?\d),?\s+(\d{4})$/.exec(trimmed);
  if (monthName) {
    const month = MONTH_NUMBERS[monthName[1].slice(0, 3).toLowerCase()];
    return month ? validIsoDate(monthName[3], month.toString(), monthName[2]) : null;
  }

  return null;
}

const MONTH_NUMBERS: Readonly<Record<string, number>> = Object.freeze({
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
});

function validIsoDate(year: string, month: string, day: string): string | null {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function amountToMinorUnits(value: string, currency: string): number | null {
  const exponent = CURRENCY_EXPONENTS[normalizeCurrency(currency)] ?? 2;
  let cleaned = value.trim().replace(/[^\d.,+\-]/g, "");
  if (!cleaned || !/\d/.test(cleaned)) return null;

  const sign = cleaned.startsWith("-") ? -1 : 1;
  cleaned = cleaned.replace(/[+\-]/g, "");
  const lastDot = cleaned.lastIndexOf(".");
  const lastComma = cleaned.lastIndexOf(",");
  let decimalSeparator: "." | "," | null = null;

  if (exponent > 0) {
    if (lastDot >= 0 && lastComma >= 0) decimalSeparator = lastDot > lastComma ? "." : ",";
    else {
      const separator = lastDot >= 0 ? "." : lastComma >= 0 ? "," : null;
      if (separator) {
        const digitsAfter = cleaned.length - cleaned.lastIndexOf(separator) - 1;
        if (digitsAfter > 0 && digitsAfter <= exponent) decimalSeparator = separator;
      }
    }
  }

  let whole = cleaned;
  let fraction = "";
  if (decimalSeparator) {
    const decimalIndex = cleaned.lastIndexOf(decimalSeparator);
    whole = cleaned.slice(0, decimalIndex);
    fraction = cleaned.slice(decimalIndex + 1);
  }

  whole = whole.replace(/[.,]/g, "") || "0";
  fraction = fraction.replace(/[.,]/g, "");
  if (!/^\d+$/.test(whole) || (fraction && !/^\d+$/.test(fraction))) return null;
  if (fraction.length > exponent) {
    const discarded = fraction.slice(exponent);
    if (!/^0*$/.test(discarded)) return null;
    fraction = fraction.slice(0, exponent);
  }

  const paddedFraction = fraction.padEnd(exponent, "0");
  const scale = 10 ** exponent;
  const minorUnits = Number(whole) * scale + Number(paddedFraction || "0");
  return Number.isSafeInteger(minorUnits) ? sign * minorUnits : null;
}

export function compareExtraction(sample: InvoiceSample, extraction: ExtractionResult): EvaluatedDocument {
  const base = {
    sampleId: sample.id,
    fixtureId: sample.fixtureId,
    filename: sample.preview.filename,
    documentType: sample.documentType,
  };

  if (extraction.status === "error") {
    return {
      ...base,
      extractionStatus: "error",
      passed: false,
      fields: [],
      extractionError: { ...extraction.error },
    };
  }

  const fields = compareFields(sample, extraction.fields);
  return {
    ...base,
    extractionStatus: "success",
    passed: fields.every((field) => field.result === "match"),
    fields,
  };
}

function compareFields(sample: InvoiceSample, extracted: ExtractedInvoiceFields): FieldComparison[] {
  const invoiceNumber = extracted.invoiceNumber?.trim() || null;
  const invoiceDate = extracted.invoiceDate?.trim() || null;
  const total = extracted.total?.trim() || null;
  const extractedCurrency = extracted.currency?.trim() || null;
  return [
    makeComparison(
      "invoiceNumber", "Document / reference number", sample.expected.invoiceNumber, invoiceNumber,
      invoiceNumber !== null && normalizeInvoiceNumber(sample.expected.invoiceNumber) === normalizeInvoiceNumber(invoiceNumber),
      "Invoice numbers are compared exactly after trimming; punctuation and leading zeros matter.",
    ),
    makeComparison(
      "invoiceDate", "Document date", sample.expected.invoiceDate, invoiceDate,
      invoiceDate !== null && normalizeDate(sample.expected.invoiceDate) !== null && normalizeDate(sample.expected.invoiceDate) === normalizeDate(invoiceDate),
      "Equivalent calendar date formats are treated as a match.",
    ),
    makeComparison(
      "total", "Total with currency", formatMoney(sample.expected.total, sample.expected.currency),
      total && extractedCurrency ? formatMoney(total, extractedCurrency) : total,
      total !== null && extractedCurrency !== null &&
        normalizeCurrency(sample.expected.currency) === normalizeCurrency(extractedCurrency) &&
        amountToMinorUnits(sample.expected.total, sample.expected.currency) !== null &&
        amountToMinorUnits(sample.expected.total, sample.expected.currency) === amountToMinorUnits(total, extractedCurrency),
      "Amounts are compared in minor units together with the ISO currency code.",
    ),
  ];
}

function makeComparison(
  field: FieldComparison["field"], label: string, verifiedValue: string,
  extractedValue: string | null, matches: boolean, detail: string,
): FieldComparison {
  return {
    field, label, verifiedValue, extractedValue,
    result: extractedValue === null ? "missing" : matches ? "match" : "incorrect",
    detail,
  };
}

function formatMoney(amount: string, currency: string): string {
  return `${amount} ${normalizeCurrency(currency)}`;
}

export async function runEvaluation(
  samples: InvoiceSample[], extractor: ExtractionProvider,
  options: { id?: string; createdAt?: string } = {},
): Promise<EvaluationRun> {
  const confirmed = samples.filter((sample) => sample.confirmed);
  const documents = await Promise.all(confirmed.map(async (sample) => compareExtraction(sample, await extractor.extract(sample))));
  return {
    id: options.id ?? createId("run"),
    label: "Simulated extraction",
    createdAt: options.createdAt ?? new Date().toISOString(),
    documents,
    groups: (["digital", "scan"] as DocumentType[])
      .map((documentType) => summarizeGroup(documents, documentType))
      .filter((group) => group.total > 0),
    extractionErrorCount: documents.filter((document) => document.extractionStatus === "error").length,
  };
}

function summarizeGroup(documents: EvaluatedDocument[], documentType: DocumentType): ResultGroup {
  const inGroup = documents.filter((document) => document.documentType === documentType);
  return {
    documentType,
    passed: inGroup.filter((document) => document.passed).length,
    total: inGroup.length,
    extractionErrors: inGroup.filter((document) => document.extractionStatus === "error").length,
  };
}

function createId(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  return `${prefix}-${uuid}`;
}
