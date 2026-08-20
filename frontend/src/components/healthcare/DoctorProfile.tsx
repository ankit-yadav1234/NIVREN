import Link from "next/link";
import { Star, Video, MapPin, GraduationCap, Languages, Briefcase } from "lucide-react";
import type { Department, Doctor, Locale } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function DoctorProfile({
  doctor,
  department,
  dict,
  locale,
}: {
  doctor: Doctor;
  department?: Department;
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <Card className="p-6 text-center lg:col-span-1">
        <Avatar src={doctor.image} name={doctor.name} size={120} className="mx-auto" />
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
        <Link
          href={localePath(`/appointment?doctor=${doctor.id}`, locale)}
          className={cn(buttonVariants({ fullWidth: true }), "mt-6")}
        >
          {dict.doctors.bookWith} {doctor.name}
        </Link>
      </Card>

      <div className="space-y-6 lg:col-span-2">
        <section>
          <h2 className="mb-2 text-lg font-semibold">{dict.doctors.aboutDoctor}</h2>
          <p className="text-muted-foreground">{doctor.bio}</p>
        </section>

        <dl className="grid gap-4 sm:grid-cols-2">
          <InfoRow icon={<Briefcase className="h-4 w-4" />} label={dict.common.labels.experience}>
            {doctor.experience}+ {dict.common.labels.years}
          </InfoRow>
          {department && (
            <InfoRow icon={<MapPin className="h-4 w-4" />} label={dict.common.labels.department}>
              <Link href={localePath(`/departments/${department.slug}`, locale)} className="text-primary hover:underline">
                {department.name}
              </Link>
            </InfoRow>
          )}
          <InfoRow icon={<GraduationCap className="h-4 w-4" />} label={dict.common.labels.qualifications}>
            {doctor.qualification.join(", ")}
          </InfoRow>
          <InfoRow icon={<Languages className="h-4 w-4" />} label={dict.common.labels.languages}>
            {doctor.languages.join(", ")}
          </InfoRow>
        </dl>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border p-4">
      <dt className="mb-1 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
