"use client";

import * as React from "react";
import { trackEvent } from "@/lib/analytics";

/** A plain <a> that also fires a contact_interaction GA4 event on click — used for footer phone/email links. */
export function TrackedContactLink({
  method,
  ...props
}: { method: "phone" | "email" } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} onClick={() => trackEvent({ name: "contact_interaction", method })} />;
}
