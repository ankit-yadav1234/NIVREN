import { Ambulance, Phone } from "lucide-react";
import { healthcareConfig } from "@/config/healthcare";
import { telHref } from "@/lib/utils/format";
import { Container } from "@/components/ui/Container";

export function EmergencyBanner({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: string;
}) {
  if (!healthcareConfig.emergency.enabled) return null;
  const phone = healthcareConfig.emergency.phone;

  return (
    <div className="bg-emergency text-white">
      <Container className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <Ambulance className="h-8 w-8 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-white/85">{description}</p>
          </div>
        </div>
        <a
          href={telHref(phone)}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-white px-5 py-2.5 text-sm font-semibold text-emergency hover:bg-white/90"
        >
          <Phone className="h-4 w-4" aria-hidden />
          {action}
        </a>
      </Container>
    </div>
  );
}
