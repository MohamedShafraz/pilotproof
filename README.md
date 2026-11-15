# PilotProof

PilotProof turns a small, verified Sri Lankan document sample into evidence and two concrete pilot offers. This MVP is a single-workspace demo covering a VAT-style tax invoice, utility bill, retail receipt, purchase order, Customs declaration (CusDec), and a blurry scanned tax invoice. It runs a deterministic server-side fixture extractor, shows field-level results, prepares offers, and captures an immutable project-brief snapshot when an offer is approved.

## Run locally

Requirements: Node.js 20+ and pnpm 9+.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Before handing off changes, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

No environment variables or external services are required. The current project and approved brief snapshots are stored in browser storage so they survive a refresh.

## Reproduce the demo

1. On **Samples**, name the project and load the five synthetic Sri Lankan digital documents.
2. Review each expected reference number, date, LKR total, and currency, then confirm the answers.
3. Run the **Simulated extraction**. All five digital documents pass; the digital-only offer reports `0 of 5` samples routed to review.
4. Return to Samples, add the blurry Sri Lankan tax-invoice scan, confirm it, and run again. Its deliberately wrong extracted total appears as **Incorrect**, while the digital documents still pass.
5. Open **Pilot Offers**. The digital-only option still covers five samples; the option including scans reports `1 of 6` routed to review. Enter a price and currency, then approve it.
6. On **Project Brief**, print or save the agreed scope. Change an expected value and run again to verify that the earlier approved brief remains unchanged.
7. Use the demo extraction-error control to confirm that a failed extraction is shown separately from a successfully extracted, incorrect value.

## Browser-only document pictures

After loading the sample pack, use **Add pictures** to preview JPEG, PNG, or WebP document images. Images are validated and previewed locally; they are never uploaded or sent to the server. They remain only while the current page is open and are cleared on refresh or close.

Browser-only pictures are not included in **Simulated extraction**. Evaluation continues to use the deterministic Sri Lankan fixtures.

## MVP boundaries

- Only bundled synthetic fixtures are evaluated. Browser-selected pictures are local previews and are not included in simulated extraction.
- Extraction is deterministic and labelled **Simulated extraction**. There is no paid extraction provider integration.
- Payment, multi-tenant administration, and a reviewer work queue are intentionally out of scope.
