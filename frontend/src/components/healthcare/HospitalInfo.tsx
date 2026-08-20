import { Phone, Mail, Ambulance } from "lucide-react";
import { siteConfig } from "@/config/site";
import { telHref } from "@/lib/utils/format";
import type { Dictionary } from "@/content/schema";

export function HospitalInfo({ dict }: { dict: Dictionary }) {
  return (
    <ul className="space-y-3 text-sm">
      <li className="flex items-center gap-3">
        <Phone className="h-4 w-4 text-primary" aria-hidden />
        <a href={telHref(siteConfig.phone)} className="hover:text-primary">
          {siteConfig.phone}
        </a>
      </li>
      <li className="flex items-center gap-3">
        <Mail className="h-4 w-4 text-primary" aria-hidden />
        <a href={`mailto:${siteConfig.email}`} className="hover:text-primary">
          {siteConfig.email}
        </a>
      </li>
      <li className="flex items-center gap-3">
        <Ambulance className="h-4 w-4 text-emergency" aria-hidden />
        <span>
          {dict.common.footer.emergency}:{" "}
          <a href={telHref(siteConfig.emergencyPhone)} className="font-medium hover:text-primary">
            {siteConfig.emergencyPhone}
          </a>
        </span>
      </li>
    </ul>
  );
}
