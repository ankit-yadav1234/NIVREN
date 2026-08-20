import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Ambulance } from "lucide-react";
import type { Location, Locale } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { localePath, telHref } from "@/lib/utils/format";

export function LocationCard({
  location,
  locale,
  dict,
}: {
  location: Location;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <div className="relative aspect-[16/10] w-full">
        <Image src={location.image} alt={location.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">
          <Link
            href={localePath(`/locations/${location.slug}`, locale)}
            className="hover:text-primary"
          >
            {location.name}
          </Link>
        </h3>
        {location.emergencyAvailable && (
          <Badge variant="warning">
            <Ambulance className="h-3 w-3" aria-hidden /> {dict.locations.emergencyAvailable}
          </Badge>
        )}
      </div>
      <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        {location.address}, {location.city}, {location.state}
      </p>
      <a
        href={telHref(location.phone)}
        className="mt-2 inline-flex items-center gap-2 text-sm hover:text-primary"
      >
        <Phone className="h-4 w-4" aria-hidden /> {location.phone}
      </a>
      <div className="mt-5 flex gap-2">
        <a
          href={location.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          {dict.locations.directions}
        </a>
        <Link
          href={localePath(`/locations/${location.slug}`, locale)}
          className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
        >
          {dict.common.actions.learnMore}
        </Link>
      </div>
      </div>
    </Card>
  );
}
