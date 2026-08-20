export interface LegalSection {
  heading: string;
  body: string;
}

/** Powers the Privacy, Terms, and Accessibility pages. */
export const privacySections: LegalSection[] = [
  {
    heading: "Introduction",
    body: "NIVREN (\"we\", \"us\", or \"our\") respects your privacy and is committed to protecting the personal information you share with us. This policy explains what information we collect through this website, how we use it, and the choices you have.",
  },
  {
    heading: "Information We Collect",
    body: "We collect information you provide directly, such as your name, phone number, and email address when you request an appointment or contact our care team. We also collect limited technical information automatically, such as browser type and pages visited, to help us improve the website.",
  },
  {
    heading: "How We Use Your Information",
    body: "We use the information you provide to respond to appointment requests and inquiries, coordinate care with our clinical teams, and send you confirmations relevant to your request. We do not sell your personal information to third parties.",
  },
  {
    heading: "Protected Health Information",
    body: "Medical records, diagnoses, treatment history, and other protected health information are handled separately from this website through our clinical systems, under the safeguards required by applicable healthcare privacy regulations — never through public web forms.",
  },
  {
    heading: "Data Security",
    body: "We use reasonable administrative and technical safeguards to protect the information submitted through this site. No method of transmission over the internet is completely secure, so we encourage you to avoid sending sensitive medical details through the contact or appointment forms — call us directly for anything urgent or sensitive.",
  },
  {
    heading: "Cookies",
    body: "This website may use essential cookies to remember basic preferences, such as your selected language or theme. We do not use cookies for third-party advertising.",
  },
  {
    heading: "Your Rights",
    body: "You may ask us to correct or delete personal information you've submitted through this website by contacting our care team. Requests related to your medical records are handled through our patient records process rather than this website.",
  },
  {
    heading: "Changes to This Policy",
    body: "We may update this policy from time to time to reflect changes in our practices. The date of the most recent revision will be noted at the top of this page once published.",
  },
  {
    heading: "Contact Us",
    body: "If you have questions about this Privacy Policy or how your information is handled, please reach out through our Contact page and our team will respond promptly.",
  },
];

export const termsSections: LegalSection[] = [
  {
    heading: "Acceptance of Terms",
    body: "By accessing or using the NIVREN website, you agree to these Terms of Service. If you do not agree with any part of these terms, please do not use this website.",
  },
  {
    heading: "Use of This Website",
    body: "This website is provided for general information about NIVREN, our departments, doctors, and services, and to help you request appointments. It is not a substitute for professional medical advice, diagnosis, or treatment — see our Medical Disclaimer for details.",
  },
  {
    heading: "Appointment Requests",
    body: "Submitting an appointment request through this website does not guarantee a confirmed booking. Our care team will contact you to confirm the date, time, and details. For medical emergencies, do not use this website — call your local emergency number or go to the nearest emergency department.",
  },
  {
    heading: "Accounts",
    body: "Certain features of this website may require creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.",
  },
  {
    heading: "Intellectual Property",
    body: "All content on this website, including text, graphics, logos, and design, is the property of NIVREN or its licensors and is protected by applicable intellectual property laws. You may not reproduce or redistribute this content without permission.",
  },
  {
    heading: "Limitation of Liability",
    body: "NIVREN provides this website on an \"as is\" basis and makes no warranties, express or implied, regarding its accuracy or availability. To the fullest extent permitted by law, NIVREN is not liable for any damages arising from your use of this website.",
  },
  {
    heading: "Changes to These Terms",
    body: "We may update these Terms of Service from time to time. Continued use of the website after changes are posted constitutes acceptance of the revised terms.",
  },
  {
    heading: "Contact Us",
    body: "Questions about these Terms of Service can be directed to our team through the Contact page.",
  },
];

export const accessibilitySections: LegalSection[] = [
  {
    heading: "Our Commitment",
    body: "NIVREN is committed to ensuring digital accessibility for all patients, including people with disabilities. We continually work to improve the usability and accessibility of this website for everyone.",
  },
  {
    heading: "Conformance Status",
    body: "We aim to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. This includes sufficient color contrast, keyboard navigation support, descriptive labels for interactive elements, and compatibility with assistive technologies.",
  },
  {
    heading: "Accessibility Features",
    body: "This website supports keyboard navigation throughout, includes a skip-to-content link, respects your operating system's reduced-motion preference, and offers both light and dark themes. Text can be resized using your browser's zoom controls without loss of content or functionality.",
  },
  {
    heading: "Known Limitations",
    body: "We are continually auditing and improving this website. If you encounter any content or functionality that is not accessible to you, please let us know using the contact details below so we can address it.",
  },
  {
    heading: "Feedback",
    body: "We welcome your feedback on the accessibility of this website. If you experience any difficulty accessing information or completing a task, please contact our care team through the Contact page or by phone, and we will do our best to assist you directly.",
  },
];
