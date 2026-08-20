import type { Department } from "@/types";

export const departments: Department[] = [
  {
    id: "cardiology",
    slug: "cardiology",
    name: "Cardiology",
    description:
      "Comprehensive heart care — from preventive screening to advanced interventional procedures.",
    icon: "HeartPulse",
    image: "https://images.unsplash.com/photo-1758691462268-fbe66c4f3e28?auto=format&fit=crop&w=1200&q=80",
    highlights: ["24/7 cardiac emergency", "Cath lab", "Echocardiography", "Heart failure clinic"],
  },
  {
    id: "neurology",
    slug: "neurology",
    name: "Neurology",
    description:
      "Expert diagnosis and treatment of disorders of the brain, spine, and nervous system.",
    icon: "Brain",
    image: "https://images.unsplash.com/photo-1758691462774-f01ed567f2c4?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Stroke unit", "Epilepsy care", "Neurophysiology lab", "Movement disorders"],
  },
  {
    id: "orthopedics",
    slug: "orthopedics",
    name: "Orthopedics",
    description: "Bone, joint, and muscle care including joint replacement and sports medicine.",
    icon: "Bone",
    image: "https://images.unsplash.com/photo-1649751361457-01d3a696c7e6?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Joint replacement", "Sports injury", "Spine surgery", "Physiotherapy"],
  },
  {
    id: "pediatrics",
    slug: "pediatrics",
    name: "Pediatrics",
    description: "Gentle, specialized care for infants, children, and adolescents.",
    icon: "Baby",
    image: "https://images.unsplash.com/photo-1758691463331-2ac00e6f676f?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Neonatal ICU", "Vaccination", "Child development", "Pediatric emergency"],
  },
  {
    id: "oncology",
    slug: "oncology",
    name: "Oncology",
    description: "Multidisciplinary cancer care with modern diagnostics and compassionate support.",
    icon: "Ribbon",
    image: "https://images.unsplash.com/photo-1763310225009-50214e3c99d9?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Chemotherapy", "Radiation therapy", "Tumor board", "Palliative care"],
  },
  {
    id: "dermatology",
    slug: "dermatology",
    name: "Dermatology",
    description: "Skin, hair, and nail care — medical, surgical, and cosmetic dermatology.",
    icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1683348758447-05c0c0755a2f?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Skin cancer screening", "Laser therapy", "Acne clinic", "Allergy testing"],
  },
];
