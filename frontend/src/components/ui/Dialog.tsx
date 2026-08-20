"use client";

import * as React from "react";
import { Modal } from "./Modal";

/** Semantic dialog: titled Modal with description + actions slot. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose} label={title}>
      <h2 className="pe-8 text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
      {actions && <div className="mt-6 flex justify-end gap-2">{actions}</div>}
    </Modal>
  );
}
