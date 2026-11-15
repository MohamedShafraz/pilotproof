import { describe, expect, it } from "vitest";

import { createDigitalSamples } from "@/lib";

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/extract", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/extract", () => {
  it("returns fixture results in request order", async () => {
    const samples = createDigitalSamples().slice(0, 2);
    const response = await POST(request({ samples }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.label).toBe("Simulated extraction");
    expect(payload.results.map((entry: { sampleId: string }) => entry.sampleId)).toEqual(
      samples.map((sample) => sample.id),
    );
    expect(payload.results[0].result.status).toBe("success");
  });

  it("rejects fixtures outside the synthetic demo set", async () => {
    const sample = { ...createDigitalSamples()[0], fixtureId: "customer-upload.pdf" };
    const response = await POST(request({ sample }));
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.error.code).toBe("UNSUPPORTED_FIXTURE");
    expect(payload.results[0].result.error.code).toBe("UNSUPPORTED_FIXTURE");
  });

  it("keeps an extraction failure distinct from an incorrect extracted field", async () => {
    const sample = { ...createDigitalSamples()[0], simulateExtractionError: true };
    const response = await POST(request({ sample }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.results[0].result).toMatchObject({
      status: "error",
      error: { code: "FIXTURE_UNREADABLE" },
    });
  });

  it("returns a clear error for malformed requests", async () => {
    const response = await POST(request({ samples: [] }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("SAMPLES_REQUIRED");
  });
});
