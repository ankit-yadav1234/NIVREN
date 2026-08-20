import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/ui/states";

export default function Loading() {
  return (
    <Container className="py-24">
      <LoadingState />
    </Container>
  );
}
