import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { ArrowIcon } from "./icons";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  trailingArrow?: boolean;
};

export function Button({ className = "", variant = "primary", trailingArrow, children, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-ink text-white hover:bg-moss focus-visible:ring-ink disabled:bg-stone-300",
    secondary: "border border-ink/15 bg-white text-ink hover:border-ink/35 hover:bg-paper/50 focus-visible:ring-moss",
    ghost: "text-ink hover:bg-ink/5 focus-visible:ring-moss",
    danger: "bg-coral text-white hover:bg-[#b94f37] focus-visible:ring-coral",
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {trailingArrow ? <ArrowIcon size={16} /> : null}
    </button>
  );
}

export function Pill({ children, className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-flex items-center rounded-full border border-ink/10 bg-white/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/65 ${className}`} {...props}>{children}</span>;
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-moss">{eyebrow}</p> : null}
        <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">{title}</h2>
        {description ? <p className="mt-3 max-w-xl text-sm leading-6 text-ink/60 sm:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-[1.5rem] border border-ink/10 bg-white shadow-card ${className}`} {...props}>{children}</div>;
}
