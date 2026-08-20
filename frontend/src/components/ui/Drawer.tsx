"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useFocusTrap, useOnEscape, useLockBodyScroll } from "@/lib/accessibility";

export function Drawer({
  open,
  onClose,
  label,
  side = "end",
  children,
  className,
  closeLabel = "Close",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  side?: "start" | "end";
  children: React.ReactNode;
  className?: string;
  closeLabel?: string;
}) {
  const ref = useFocusTrap<HTMLDivElement>(open);
  useOnEscape(onClose, open);
  useLockBodyScroll(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          "absolute inset-y-0 flex w-[85%] max-w-sm flex-col bg-card shadow-xl animate-slide-up",
          side === "end" ? "end-0" : "start-0",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <span className="font-semibold">{label}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
