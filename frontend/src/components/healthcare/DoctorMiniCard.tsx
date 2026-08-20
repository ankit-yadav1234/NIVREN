import { Avatar } from "@/components/ui/Avatar";

/** Compact clickable thumbnail used in the department-grouped directory grid. */
export function DoctorMiniCard({
  doctor,
  onSelect,
}: {
  doctor: { name: string; specialty: string; image?: string };
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex flex-col items-center gap-2 rounded-[var(--radius-md)] p-2 text-center transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar
        src={doctor.image}
        name={doctor.name}
        size={72}
        className="text-base ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary/50 group-hover:shadow-md"
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground">{doctor.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{doctor.specialty}</span>
      </span>
    </button>
  );
}
