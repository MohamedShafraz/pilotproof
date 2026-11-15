import { SparkIcon } from "./icons";

export function DemoModeBanner() {
  return (
    <aside aria-label="Demo mode notice" className="border-b border-amber/25 bg-[#fff7df] print:hidden">
      <div className="mx-auto flex max-w-[1480px] items-start gap-3 px-4 py-3 text-sm text-[#694b1f] sm:items-center sm:px-7 lg:px-10">
        <SparkIcon className="mt-0.5 shrink-0 text-[#a66d1f] sm:mt-0" size={17} />
        <p>
          <strong className="font-bold">Browser-only demo.</strong>{" "}
          Workspace data stays in this browser. Manual image previews remain in the current page session, and extraction uses deterministic fixtures.
        </p>
      </div>
    </aside>
  );
}
