"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils/cn";
import type { LeadershipMember } from "@/data/leadership";

/**
 * Click-to-select leadership grid: a card grid on one side, a detail panel
 * on the other that shows the full bio for whichever card is selected (the
 * first person is selected by default). Client component for the click
 * state — the page itself stays a Server Component.
 */
export function LeadershipGrid({ members }: { members: LeadershipMember[] }) {
  const [selectedId, setSelectedId] = React.useState(members[0]?.id);
  const selected = members.find((m) => m.id === selectedId) ?? members[0];
  if (!selected) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
      <Reveal className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedId(m.id)}
            aria-pressed={m.id === selectedId}
            className={cn(
              "rounded-[var(--radius-lg)] border-2 p-3 text-left transition-all duration-300",
              m.id === selectedId
                ? "border-primary bg-primary/5 shadow-md"
                : "border-transparent hover:border-border hover:bg-muted/50",
            )}
          >
            <Avatar src={m.image} name={m.name} size={72} className="mx-auto ring-2 ring-background" />
            <p className="mt-3 text-center text-sm font-semibold">{m.name}</p>
            <p className="text-center text-xs text-muted-foreground">{m.title}</p>
          </button>
        ))}
      </Reveal>

      <Reveal delay={0.1}>
        <Card className="flex flex-col gap-5 p-8 sm:flex-row sm:items-start lg:sticky lg:top-24">
          <Avatar
            src={selected.image}
            name={selected.name}
            size={96}
            className="mx-auto shrink-0 ring-4 ring-background sm:mx-0"
          />
          <div>
            <h2 className="text-xl font-bold">{selected.name}</h2>
            <p className="mt-1 font-medium text-primary">{selected.title}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">{selected.bio}</p>
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
