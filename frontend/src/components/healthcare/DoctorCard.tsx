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
    <Card className="flex h-full min-h-[300px] flex-col justify-between p-6 sm:p-7 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <div>
        <Link
          href={localePath(`/doctors/${doctor.slug}`, locale)}
          className="mx-auto block w-fit rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar src={doctor.image} name={doctor.name} size={92} className="ring-2 ring-primary/20" />
        </Link>
        <h3 className="mt-4 font-semibold text-[18px] tracking-tight">
          <Link href={localePath(`/doctors/${doctor.slug}`, locale)} className="hover:text-primary transition-colors">
            {doctor.name}
          </Link>
        </h3>
        <p className="text-[14px] font-medium text-primary mt-0.5">{doctor.specialty}</p>

        <div className="mt-2.5 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span>
            {doctor.experience}+ {dict.common.labels.years}
          </span>
          {typeof doctor.rating === "number" && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
              {doctor.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
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
      </div>

      {showAppointmentButton && (
        <Link
          href={localePath(`/appointment?doctor=${doctor.id}`, locale)}
          className={cn(buttonVariants({ size: "sm", variant: "outline", fullWidth: true }), "mt-6 text-xs uppercase tracking-wider font-bold")}
        >
          {dict.common.actions.bookAppointment}
        </Link>
      )}
    </Card>
  );
}
