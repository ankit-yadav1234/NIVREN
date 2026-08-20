import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import type { Locale } from "@/types";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { localePath } from "@/lib/utils/format";
import type { ButtonProps } from "@/components/ui/Button";

export function AppointmentButton({
  locale,
  label,
  variant = "primary",
  size = "md",
  className,
}: {
  locale: Locale;
  label: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  return (
    <Link
      href={localePath("/appointment", locale)}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      <CalendarPlus className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
