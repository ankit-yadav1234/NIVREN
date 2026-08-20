"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useFocusTrap, useOnEscape, useLockBodyScroll } from "@/lib/accessibility";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
  closeLabel?: string;
}

export function Modal({
  open,
  onClose,
  label,
  children,
  className,
  showClose = true,
  closeLabel = "Close",
}: ModalProps) {
  const ref = useFocusTrap<HTMLDivElement>(open);
  useOnEscape(onClose, open);
  useLockBodyScroll(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          "relative z-10 w-full max-w-lg rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-xl animate-slide-up",
          className,
        )}
      >
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute end-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
