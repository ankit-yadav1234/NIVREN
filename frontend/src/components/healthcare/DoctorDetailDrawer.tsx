import Link from "next/link";
import { Star, Video, MapPin, GraduationCap, Languages, Briefcase } from "lucide-react";
import type { Doctor, Locale } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Drawer } from "@/components/ui/Drawer";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/** ~Half-screen slide-over with a doctor's full detail, opened from DoctorMiniCard. */
export function DoctorDetailDrawer({
  doctor,
  onClose,
  locale,
  dict,
}: {
  doctor: Doctor | null;
  onClose: () => void;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <Drawer
      open={!!doctor}
      onClose={onClose}
      label={doctor?.name ?? ""}
      className="w-full max-w-none sm:w-1/2 sm:max-w-2xl"
    >
      {doctor && (
        <div className="text-center">
          <Avatar src={doctor.image} name={doctor.name} size={100} className="mx-auto text-2xl" />
          <h2 className="mt-4 text-xl font-bold">{doctor.name}</h2>
          <p className="text-primary">{doctor.specialty}</p>
          {typeof doctor.rating === "number" && (
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-warning text-warning" aria-hidden />
              {doctor.rating.toFixed(1)}
            </p>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
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

          <div className="mt-6 space-y-5 text-start">
            <section>
              <h3 className="mb-1.5 text-sm font-semibold">{dict.doctors.aboutDoctor}</h3>
              <p className="text-sm text-muted-foreground">{doctor.bio}</p>
            </section>

            <InfoRow icon={<Briefcase className="h-4 w-4" />} label={dict.common.labels.experience}>
              {doctor.experience}+ {dict.common.labels.years}
            </InfoRow>
            <InfoRow icon={<GraduationCap className="h-4 w-4" />} label={dict.common.labels.qualifications}>
              {doctor.qualification.join(", ")}
            </InfoRow>
            <InfoRow icon={<Languages className="h-4 w-4" />} label={dict.common.labels.languages}>
              {doctor.languages.join(", ")}
            </InfoRow>
          </div>

          <Link
            href={localePath(`/appointment?doctor=${doctor.id}`, locale)}
            className={cn(buttonVariants({ fullWidth: true }), "mt-7")}
          >
            {dict.doctors.bookWith} {doctor.name}
          </Link>
          <Link
            href={localePath(`/doctors/${doctor.slug}`, locale)}
            className="mt-3 block text-sm font-medium text-primary hover:underline"
          >
            View full profile →
          </Link>
        </div>
      )}
    </Drawer>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border p-3">
      <dt className="mb-1 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
