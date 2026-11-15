import { FIXTURE_EXTRACTION_OUTPUTS } from "./fixtures";
import type {
  ExtractedInvoiceFields,
  ExtractionProvider,
  ExtractionResult,
  InvoiceSample,
} from "./types";

export class FixtureExtractionProvider implements ExtractionProvider {
  async extract(sample: InvoiceSample): Promise<ExtractionResult> {
    if (sample.simulateExtractionError) {
      return {
        status: "error",
        provider: "fixture",
        error: {
          code: "FIXTURE_UNREADABLE",
          message: "The simulated extractor could not read this document.",
        },
      };
    }

    const fixture = FIXTURE_EXTRACTION_OUTPUTS[sample.fixtureId];
    if (!fixture) {
      return {
        status: "error",
        provider: "fixture",
        error: {
          code: "UNSUPPORTED_FIXTURE",
          message: "This demo can evaluate only the supplied synthetic fixtures.",
        },
      };
    }

    return { status: "success", provider: "fixture", fields: cloneFields(fixture) };
  }
}

function cloneFields(fields: Readonly<ExtractedInvoiceFields>): ExtractedInvoiceFields {
  return { ...fields };
}

export const fixtureExtractor = new FixtureExtractionProvider();
