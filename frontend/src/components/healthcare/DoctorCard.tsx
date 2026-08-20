import Link from "next/link";
import { Star, Video, MapPin } from "lucide-react";
import type { Doctor, Locale } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { buttonVariants } from "@/components/ui/Button";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function DoctorCard({
  doctor,
  locale,
  dict,
  showAppointmentButton = true,
}: {
  doctor: Doctor;
  locale: Locale;
  dict: Dictionary;
  showAppointmentButton?: boolean;
}) {
  return (
    <Card className="flex h-full flex-col p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <Link
        href={localePath(`/doctors/${doctor.slug}`, locale)}
        className="mx-auto rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar src={doctor.image} name={doctor.name} size={88} />
      </Link>
      <h3 className="mt-4 font-semibold">
        <Link href={localePath(`/doctors/${doctor.slug}`, locale)} className="hover:text-primary">
          {doctor.name}
        </Link>
      </h3>
      <p className="text-sm text-primary">{doctor.specialty}</p>

      <div className="mt-2 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <span>
          {doctor.experience}+ {dict.common.labels.years}
        </span>
        {typeof doctor.rating === "number" && (
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden />
            {doctor.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {doctor.consultation.online && (
          <Badge variant="success">
            <Video className="h-3 w-3" aria-hidden /> {dict.doctors.consultation.online}
          </Badge>
        )}
        {doctor.consultation.inPerson && (
          <Badge variant="primary">
            <MapPin className="h-3 w-3" aria-hidden /> {dict.doctors.consultation.inPerson}
          </Badge>
        )}
      </div>

      {showAppointmentButton && (
        <Link
          href={localePath(`/appointment?doctor=${doctor.id}`, locale)}
          className={cn(buttonVariants({ size: "sm", variant: "outline", fullWidth: true }), "mt-5 uppercase tracking-wide")}
        >
          {dict.common.actions.bookAppointment}
        </Link>
      )}
    </Card>
  );
}
