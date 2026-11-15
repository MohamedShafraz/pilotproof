import { fixtureExtractor, type InvoiceSample } from "@/lib";

const MAX_BATCH_SIZE = 24;

type RequestBody = {
  sample?: unknown;
  samples?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSampleCandidate(value: unknown): value is InvoiceSample {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.fixtureId === "string" &&
    value.fixtureId.trim().length > 0
  );
}

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    const parsed: unknown = await request.json();
    if (!isRecord(parsed)) {
      return jsonError(400, "INVALID_REQUEST", "The request body must be a JSON object.");
    }
    body = parsed;
  } catch {
    return jsonError(400, "INVALID_JSON", "The request body must contain valid JSON.");
  }

  const requestedSamples = Array.isArray(body.samples)
    ? body.samples
    : body.sample === undefined
      ? null
      : [body.sample];

  if (!requestedSamples || requestedSamples.length === 0) {
    return jsonError(400, "SAMPLES_REQUIRED", "Provide one sample or a non-empty samples array.");
  }

  if (requestedSamples.length > MAX_BATCH_SIZE) {
    return jsonError(
      413,
      "BATCH_TOO_LARGE",
      `Simulated extraction supports at most ${MAX_BATCH_SIZE} samples per request.`,
    );
  }

  if (!requestedSamples.every(isSampleCandidate)) {
    return jsonError(
      400,
      "INVALID_SAMPLE",
      "Every sample must include a non-empty id and supported synthetic fixtureId.",
    );
  }

  const results = await Promise.all(
    requestedSamples.map(async (sample) => ({
      sampleId: sample.id,
      result: await fixtureExtractor.extract(sample),
    })),
  );

  const hasUnsupportedFixture = results.some(({ result }) => {
    if (result.status !== "error") return false;
    return result.error.code === "UNSUPPORTED_FIXTURE";
  });

  if (hasUnsupportedFixture) {
    return Response.json(
      {
        error: {
          code: "UNSUPPORTED_FIXTURE",
          message: "Only bundled synthetic fixtures can be evaluated in local demo mode.",
        },
        label: "Simulated extraction",
        results,
      },
      { status: 422 },
    );
  }

  return Response.json({
    label: "Simulated extraction",
    mode: "local-demo",
    results,
  });
}
