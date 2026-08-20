"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/states";
import { useLocale } from "@/hooks/useLocale";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const { dict } = useLocale();
  return (
    <Container className="py-24">
      <ErrorState
        title={dict.common.labels.error}
        description={dict.common.labels.errorBody}
        action={
          <Button variant="outline" onClick={reset} className="mt-2">
            {dict.common.labels.retry}
          </Button>
        }
      />
    </Container>
  );
}
