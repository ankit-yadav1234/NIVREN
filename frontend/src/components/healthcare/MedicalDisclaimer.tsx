import { Info } from "lucide-react";

export function MedicalDisclaimer({ text }: { text: string }) {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-[var(--radius-md)] border border-border bg-muted/50 p-4 text-sm text-muted-foreground"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{text}</p>
    </div>
  );
}
