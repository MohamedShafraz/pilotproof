"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

import { AlertIcon, FileIcon } from "./icons";
import { Button, Card, Pill } from "./primitives";
import type { DocumentKind } from "./types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_SESSION_IMAGES = 8;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface BrowserImage {
  id: string;
  filename: string;
  documentType: DocumentKind;
  previewUrl: string;
  size: number;
}

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createImageId(file: File) {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
}

export function ManualUploads() {
  const inputId = useId();
  const [documentType, setDocumentType] = useState<DocumentKind>("scan");
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<BrowserImage[]>([]);
  const imagesRef = useRef<BrowserImage[]>([]);

  useEffect(() => () => {
    for (const image of imagesRef.current) URL.revokeObjectURL(image.previewUrl);
  }, []);

  function addImages(files: File[]) {
    setError(null);

    const remainingSlots = MAX_SESSION_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError(`Remove an image before adding another. This preview supports up to ${MAX_SESSION_IMAGES} images per tab.`);
      return;
    }

    const accepted: BrowserImage[] = [];
    const problems: string[] = [];

    for (const file of files.slice(0, remainingSlots)) {
      if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
        problems.push(`${file.name}: use a JPG, PNG, or WebP image.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        problems.push(`${file.name}: the image is larger than 8 MB.`);
        continue;
      }

      accepted.push({
        id: createImageId(file),
        filename: file.name,
        documentType,
        previewUrl: URL.createObjectURL(file),
        size: file.size,
      });
    }

    if (files.length > remainingSlots) {
      problems.push(`Only the first ${remainingSlots} selected image${remainingSlots === 1 ? "" : "s"} could be added.`);
    }

    if (accepted.length) {
      const nextImages = [...images, ...accepted];
      imagesRef.current = nextImages;
      setImages(nextImages);
    }
    if (problems.length) setError(problems.join(" "));
  }

  function removeImage(id: string) {
    const image = images.find((item) => item.id === id);
    if (image) URL.revokeObjectURL(image.previewUrl);
    const nextImages = images.filter((item) => item.id !== id);
    imagesRef.current = nextImages;
    setImages(nextImages);
    setError(null);
  }

  return (
    <Card className="overflow-hidden shadow-none">
      <div className="flex flex-col justify-between gap-4 border-b border-ink/10 bg-[#fbfaf6] p-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-bold text-ink">Manual Sri Lankan document pictures</h3>
            <Pill className="border-moss/15 bg-mint/60 text-moss">Browser memory only</Pill>
          </div>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-ink/55">
            Add a JPG, PNG, or WebP image up to 8 MB. It stays temporarily in this page&apos;s browser memory and is removed when you refresh or close the page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label>
            <span className="sr-only">Document type for new pictures</span>
            <select
              className="min-h-11 rounded-full border border-ink/15 bg-white px-4 text-sm font-semibold outline-none focus:border-moss focus:ring-2 focus:ring-moss/15"
              onChange={(event) => setDocumentType(event.target.value as DocumentKind)}
              value={documentType}
            >
              <option value="scan">Scanned document</option>
              <option value="digital">Digital document image</option>
            </select>
          </label>
          <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-moss" htmlFor={inputId}>
            <FileIcon size={16} /> Add pictures
          </label>
          <input
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="sr-only"
            id={inputId}
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length) addImages(files);
              event.target.value = "";
            }}
            type="file"
          />
        </div>
      </div>

      <div className="flex items-start gap-3 border-b border-ink/10 bg-[#fff7df] p-4 text-xs leading-5 text-[#6f4d1d] sm:px-6">
        <AlertIcon className="mt-0.5 shrink-0 text-amber" size={16} />
        <p><strong>Local preview only.</strong> These images never leave your browser and are not included in simulated extraction. The evaluation continues to use the bundled synthetic fixtures.</p>
      </div>

      {error ? (
        <div className="m-5 flex items-start gap-3 rounded-xl border border-coral/25 bg-[#fff1ec] p-4 text-xs leading-5 text-[#8f3825] sm:mx-6" role="alert">
          <AlertIcon className="mt-0.5 shrink-0" size={16} />
          <p>{error}</p>
        </div>
      ) : null}

      {images.length ? (
        <ul className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
          {images.map((image) => (
            <li className="overflow-hidden rounded-2xl border border-ink/10 bg-white" key={image.id}>
              <div className="relative aspect-[4/3] bg-[#ece8dc]">
                <Image alt={`Local document preview: ${image.filename}`} className="object-contain" fill sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw" src={image.previewUrl} unoptimized />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{image.filename}</p>
                    <p className="mt-1 text-[11px] text-ink/45">{image.documentType === "scan" ? "Scanned document" : "Digital document image"} / {formatFileSize(image.size)}</p>
                  </div>
                  <Button aria-label={`Remove ${image.filename}`} className="min-h-9 shrink-0 px-3 py-1.5 text-xs" onClick={() => removeImage(image.id)} variant="ghost">Remove</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-6 text-center text-sm text-ink/45">No local pictures added in this browser tab yet.</p>
      )}
    </Card>
  );
}
