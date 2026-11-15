import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ManualUploads } from "./manual-uploads";

const createObjectURL = vi.fn((file: File) => `blob:${file.name}`);
const revokeObjectURL = vi.fn();

describe("ManualUploads", () => {
  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("previews an accepted image in browser memory and revokes it when removed", () => {
    render(<ManualUploads />);
    const image = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "invoice.png", { type: "image/png" });

    fireEvent.change(screen.getByLabelText("Add pictures"), { target: { files: [image] } });

    expect(createObjectURL).toHaveBeenCalledWith(image);
    expect(screen.getByAltText("Local document preview: invoice.png")).toBeTruthy();
    expect(screen.getByText(/Scanned document \/ 0.0 MB/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Remove invoice.png" }));

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:invoice.png");
    expect(screen.queryByAltText("Local document preview: invoice.png")).toBeNull();
  });

  it("rejects unsupported and oversized files without creating previews", () => {
    render(<ManualUploads />);
    const unsupported = new File(["not an image"], "invoice.txt", { type: "text/plain" });
    const oversized = new File(["image"], "large.png", { type: "image/png" });
    Object.defineProperty(oversized, "size", { configurable: true, value: 8 * 1024 * 1024 + 1 });

    fireEvent.change(screen.getByLabelText("Add pictures"), { target: { files: [unsupported, oversized] } });

    expect(screen.getByRole("alert").textContent).toContain("invoice.txt: use a JPG, PNG, or WebP image.");
    expect(screen.getByRole("alert").textContent).toContain("large.png: the image is larger than 8 MB.");
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});
