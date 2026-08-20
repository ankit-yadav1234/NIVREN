import type { Dictionary } from "@/content/schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { HospitalInfo } from "@/components/healthcare/HospitalInfo";
import { ContactForm } from "./ContactForm";

export function Contact({ dict }: { dict: Dictionary }) {
  return (
    <Section muted>
      <SectionHeading title={dict.home.contact.title} description={dict.home.contact.description} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <h3 className="mb-4 font-semibold">{dict.contact.info.phone}</h3>
          <HospitalInfo dict={dict} />
        </Card>
        <Card className="p-6 lg:col-span-2">
          <ContactForm dict={dict} />
        </Card>
      </div>
    </Section>
  );
}
