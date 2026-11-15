import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PilotProof — Evidence-led AI pilots",
  description:
    "Turn sample invoice evidence into a pilot offer your customer can evaluate.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
