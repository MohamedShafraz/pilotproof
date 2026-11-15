import type { ExtractedInvoiceFields, InvoiceSample } from "./types";

/**
 * Fictional Sri Lankan documents for product demonstration only. Names, TINs,
 * references, account numbers and transactions do not identify real entities.
 */
export const DIGITAL_INVOICE_FIXTURES: InvoiceSample[] = [
  {
    id: "sample-ceylon-meridian-tax",
    fixtureId: "fixture-ceylon-meridian-tax",
    documentType: "digital",
    confirmed: false,
    expected: { invoiceNumber: "26NOV_CMB1_00042", invoiceDate: "2026-11-03", total: "147,500.00", currency: "LKR" },
    preview: {
      supplier: "Ceylon Meridian Supplies (Pvt) Ltd", customer: "PilotProof Demo Company", filename: "tax-invoice-cmb-00042.pdf", accent: "#385f4b",
      documentCategory: "tax-invoice", documentLabel: "Tax Invoice", referenceLabel: "Invoice serial no.", dateLabel: "Invoice date", totalLabel: "Total consideration",
      locality: "Colombo 03, Sri Lanka", registrationLabel: "Synthetic TIN 123456789",
      lineItems: [
        { description: "Office equipment", quantity: 5, amount: "125,000.00" },
        { description: "VAT", quantity: 1, amount: "22,500.00" },
      ],
    },
  },
  {
    id: "sample-south-coast-utility",
    fixtureId: "fixture-south-coast-utility",
    documentType: "digital",
    confirmed: false,
    expected: { invoiceNumber: "ELEC-014-883920", invoiceDate: "2026-10-31", total: "18,742.65", currency: "LKR" },
    preview: {
      supplier: "South Coast Utility Services", customer: "PilotProof Demo Company", filename: "electricity-bill-oct-2026.pdf", accent: "#35697a",
      documentCategory: "utility-bill", documentLabel: "Electricity Bill", referenceLabel: "Account / bill no.", dateLabel: "Billing date", totalLabel: "Amount due",
      locality: "Matara, Sri Lanka", registrationLabel: "Synthetic account 014-883920",
      lineItems: [
        { description: "Energy charge", quantity: 1, amount: "16,980.45" },
        { description: "Fixed and adjustment charges", quantity: 1, amount: "1,762.20" },
      ],
    },
  },
  {
    id: "sample-lotus-grocery-receipt",
    fixtureId: "fixture-lotus-grocery-receipt",
    documentType: "digital",
    confirmed: false,
    expected: { invoiceNumber: "RCPT-000184", invoiceDate: "2026-11-05", total: "8,960.00", currency: "LKR" },
    preview: {
      supplier: "Lotus Lane Grocers", customer: "Walk-in customer", filename: "retail-receipt-000184.pdf", accent: "#8a5b35",
      documentCategory: "retail-receipt", documentLabel: "Retail Receipt", referenceLabel: "Receipt no.", dateLabel: "Transaction date", totalLabel: "Net total",
      locality: "Nugegoda, Sri Lanka", registrationLabel: "Synthetic POS terminal 03",
      lineItems: [
        { description: "Groceries and provisions", quantity: 1, amount: "8,420.00" },
        { description: "Other taxable items", quantity: 1, amount: "540.00" },
      ],
    },
  },
  {
    id: "sample-hill-country-po",
    fixtureId: "fixture-hill-country-po",
    documentType: "digital",
    confirmed: false,
    expected: { invoiceNumber: "PO/CMB/26/0048", invoiceDate: "2026-11-07", total: "385,200.00", currency: "LKR" },
    preview: {
      supplier: "Hill Country Equipment (Pvt) Ltd", customer: "PilotProof Demo Company", filename: "purchase-order-cmb-0048.pdf", accent: "#586b3f",
      documentCategory: "purchase-order", documentLabel: "Purchase Order", referenceLabel: "Purchase order no.", dateLabel: "Order date", totalLabel: "Order total",
      locality: "Kandy, Sri Lanka", registrationLabel: "Synthetic procurement record",
      lineItems: [
        { description: "Warehouse equipment", quantity: 2, amount: "340,000.00" },
        { description: "Delivery and installation", quantity: 1, amount: "45,200.00" },
      ],
    },
  },
  {
    id: "sample-serendib-cusdec",
    fixtureId: "fixture-serendib-cusdec",
    documentType: "digital",
    confirmed: false,
    expected: { invoiceNumber: "CUSDEC-CMB-26-09117", invoiceDate: "2026-11-09", total: "214,750.00", currency: "LKR" },
    preview: {
      supplier: "Serendib Trade Documentation Services", customer: "PilotProof Demo Importer", filename: "cusdec-import-09117.pdf", accent: "#694f70",
      documentCategory: "customs-declaration", documentLabel: "Customs Declaration", referenceLabel: "CusDec reference", dateLabel: "Declaration date", totalLabel: "Duties and levies",
      locality: "Colombo Port, Sri Lanka", registrationLabel: "Synthetic ASYCUDA-style record",
      lineItems: [
        { description: "Customs duty and levies", quantity: 1, amount: "186,500.00" },
        { description: "VAT and processing charges", quantity: 1, amount: "28,250.00" },
      ],
    },
  },
];

export const BLURRY_SCAN_FIXTURE: InvoiceSample = {
  id: "sample-galle-hardware-scan",
  fixtureId: "fixture-galle-hardware-scan",
  documentType: "scan",
  confirmed: false,
  optional: true,
  expected: { invoiceNumber: "26NOV_GAL1_00007", invoiceDate: "2026-11-11", total: "64,500.00", currency: "LKR" },
  preview: {
    supplier: "Galle Harbour Hardware", customer: "PilotProof Demo Company", filename: "phone-scan-tax-invoice-00007.jpg", accent: "#776a58",
    documentCategory: "tax-invoice", documentLabel: "Scanned Tax Invoice", referenceLabel: "Invoice serial no.", dateLabel: "Invoice date", totalLabel: "Total consideration",
    locality: "Galle, Sri Lanka", registrationLabel: "Synthetic TIN 987654321",
    lineItems: [
      { description: "Building materials", quantity: 1, amount: "58,000.00" },
      { description: "Tax and delivery", quantity: 1, amount: "6,500.00" },
    ],
  },
};

/** Independent fixture output table: never derived from mutable expected answers. */
export const FIXTURE_EXTRACTION_OUTPUTS: Readonly<Record<string, Readonly<ExtractedInvoiceFields>>> = Object.freeze({
  "fixture-ceylon-meridian-tax": Object.freeze({ invoiceNumber: "26NOV_CMB1_00042", invoiceDate: "November 3, 2026", total: "Rs. 147,500.00", currency: "lkr" }),
  "fixture-south-coast-utility": Object.freeze({ invoiceNumber: "ELEC-014-883920", invoiceDate: "31/10/2026", total: "18,742.65", currency: "LKR" }),
  "fixture-lotus-grocery-receipt": Object.freeze({ invoiceNumber: "RCPT-000184", invoiceDate: "2026/11/05", total: "8 960.00", currency: "LKR" }),
  "fixture-hill-country-po": Object.freeze({ invoiceNumber: "PO/CMB/26/0048", invoiceDate: "Nov 7 2026", total: "385200.0", currency: "LKR" }),
  "fixture-serendib-cusdec": Object.freeze({ invoiceNumber: "CUSDEC-CMB-26-09117", invoiceDate: "09-11-2026", total: "LKR 214,750.00", currency: "LKR" }),
  "fixture-galle-hardware-scan": Object.freeze({ invoiceNumber: "26NOV_GAL1_00007", invoiceDate: "11/11/2026", total: "46,500.00", currency: "LKR" }),
});

function cloneSample(sample: InvoiceSample): InvoiceSample {
  return {
    ...sample,
    expected: { ...sample.expected },
    preview: { ...sample.preview, lineItems: sample.preview.lineItems.map((item) => ({ ...item })) },
  };
}

export function createDigitalSamples(): InvoiceSample[] {
  return DIGITAL_INVOICE_FIXTURES.map(cloneSample);
}

export function createBlurryScanSample(): InvoiceSample {
  return cloneSample(BLURRY_SCAN_FIXTURE);
}
