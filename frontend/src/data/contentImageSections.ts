export interface ContentImageSectionData {
  id: string;
  icon: string;
  image: string;
  heading: string;
  body: string;
  imagePosition: "left" | "right";
}

/** Powers components/sections/ContentImageSection.tsx on the About page. */
export const contentImageSections: ContentImageSectionData[] = [
  {
    id: "legacy",
    icon: "HeartHandshake",
    image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1200&q=80",
    heading: "A legacy built on trust and compassion",
    body: "For over two decades, NIVREN has grown from a single clinic into a connected network of hospitals — but our founding promise has never changed. Every physician, nurse, and care coordinator here is trained to treat patients like family, not just the next appointment on the schedule.",
    imagePosition: "right",
  },
  {
    id: "care-teams",
    icon: "Stethoscope",
    image: "https://images.unsplash.com/photo-1690306816872-91063f6de36b?auto=format&fit=crop&w=1200&q=80",
    heading: "Investing in our care teams",
    body: "We invest heavily in continuing medical education, nurse mentorship programs, and cross-department training, so every member of our care team brings the latest clinical knowledge to your bedside — expertise that keeps growing alongside their experience.",
    imagePosition: "left",
  },
];
