import { ShieldCheck } from "lucide-react";
import type { InsuranceProvider } from "@/types";
import { Card } from "@/components/ui/Card";

export function InsuranceCard({ provider }: { provider: InsuranceProvider }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        <ShieldCheck className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-sm font-medium">{provider.name}</span>
    </Card>
  );
}
