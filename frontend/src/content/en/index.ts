import type { Dictionary } from "../schema";

export const en: Dictionary = {
  common: {
    nav: {
      home: "Home",
      departments: "Departments",
      allDepartments: "All Departments",
      doctors: "Doctors",
      services: "Services",
      allServices: "All Services",
      locations: "Locations",
      about: "About",
      contact: "Contact",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      medicalDisclaimer: "Medical Disclaimer",
      accessibilityStatement: "Accessibility Statement",
    },
    actions: {
      bookAppointment: "Book Now",
      findDoctor: "Find a Doctor",
      learnMore: "Learn More",
      viewAll: "View All",
      callNow: "Call Now",
      getDirections: "Get Directions",
      readMore: "Read More",
      submit: "Submit",
      search: "Search",
      emergency: "Emergency",
      signIn: "Sign In",
    },
    labels: {
      menu: "Open menu",
      closeMenu: "Close menu",
      toggleTheme: "Toggle theme",
      language: "Language",
      loading: "Loading…",
      empty: "Nothing to show here yet.",
      error: "Something went wrong.",
      retry: "Try again",
      experience: "Experience",
      languages: "Languages",
      specialty: "Specialty",
      department: "Department",
      years: "years",
      skipToContent: "Skip to content",
      close: "Close",
      qualifications: "Qualifications",
      backHome: "Back to home",
      notFoundTitle: "Page not found",
      notFoundBody: "The page you are looking for doesn't exist or has been moved.",
      errorBody: "An unexpected error occurred. Please try again.",
    },
    footer: {
      quickLinks: "Quick Links",
      services: "Services",
      contactUs: "Contact Us",
      legal: "Legal",
      emergency: "24/7 Emergency",
      rights: "All rights reserved.",
      tagline: "Revenue cycle management for healthcare organizations, backed by a hospital network we run ourselves.",
    },
  },
  home: {
    hero: {
      badge: "Revenue Cycle Management for Hospitals & Clinics",
      title: "Get paid for the care",
      titleAccent: "you already deliver.",
      description:
        "NIVREN runs a connected hospital network — and helps other healthcare organizations run theirs profitably, with end-to-end billing, coding, and revenue cycle management.",
      primaryAction: "Explore RCM Services",
      secondaryAction: "Book a Patient Visit",
    },
    emergency: {
      title: "Need urgent medical assistance?",
      description: "Our emergency team is available around the clock, every day.",
      action: "Contact Emergency",
    },
    about: {
      title: "Healthcare built around you",
      description:
        "For over two decades we have combined clinical excellence with genuine compassion, treating every patient like family.",
      points: [
        "Board-certified specialists across 20+ departments",
        "Advanced diagnostics and modern operating theatres",
        "Transparent pricing and insurance support",
        "Online and in-person consultations",
      ],
    },
    departments: {
      title: "Our Departments",
      description: "Specialized care across every major medical field.",
    },
    doctors: {
      title: "Meet Our Doctors",
      description: "Experienced specialists dedicated to your wellbeing.",
    },
    services: {
      title: "Our Services",
      description: "From preventive checkups to advanced treatment.",
    },
    testimonials: {
      title: "What Our Patients Say",
      description: "Real stories from the people we care for.",
    },
    appointmentCta: {
      title: "Ready to prioritize your health?",
      description: "Book an appointment in minutes with the specialist of your choice.",
      action: "Book Now",
    },
    locations: {
      title: "Our Locations",
      description: "Quality care close to home.",
    },
    faq: {
      title: "Frequently Asked Questions",
      description: "Everything you need to know before your visit.",
    },
    contact: {
      title: "Get in Touch",
      description: "We're here to help. Reach out any time.",
    },
    stats: {
      patients: "Happy Patients",
      doctors: "Expert Doctors",
      departments: "Departments",
      years: "Years of Care",
    },
  },
  about: {
    title: "About Us",
    subtitle: "A hospital network and RCM partner, built on two decades of running healthcare operations.",
    mission: {
      title: "Our Mission",
      body: "To deliver accessible, high-quality healthcare that treats every patient with dignity, empathy, and clinical excellence.",
    },
    vision: {
      title: "Our Vision",
      body: "To be the most trusted healthcare network in the region, setting the standard for patient-centered care.",
    },
    values: {
      title: "Our Values",
      items: [
        { title: "Compassion", body: "We treat every patient like our own family." },
        { title: "Excellence", body: "We pursue the highest standards in everything we do." },
        { title: "Integrity", body: "We are transparent, honest, and accountable." },
        { title: "Innovation", body: "We embrace technology to improve outcomes." },
      ],
    },
  },
  doctors: {
    title: "Our Doctors",
    subtitle: "Find the right specialist for your needs.",
    searchPlaceholder: "Search doctors by name…",
    filterDepartment: "Department",
    filterSpecialty: "Specialty",
    filterLanguage: "Language",
    all: "All",
    noResults: "No doctors match your filters.",
    bookWith: "Book with",
    aboutDoctor: "About the doctor",
    consultation: { online: "Online consultation", inPerson: "In-person visit" },
  },
  departments: {
    title: "Departments",
    subtitle: "Specialized medical care across every field.",
    ourDoctors: "Doctors in this department",
    noDoctors: "No doctors listed yet.",
  },
  services: {
    title: "Services",
    subtitle: "Comprehensive care at every stage of life.",
    category: "Category",
  },
  locations: {
    title: "Locations",
    subtitle: "Find a facility near you.",
    openingHours: "Opening Hours",
    open24: "Open 24 hours",
    emergencyAvailable: "Emergency available",
    directions: "Get Directions",
  },
  appointment: {
    title: "Book an Appointment",
    subtitle: "Choose a department, doctor, and time that works for you.",
    fields: {
      name: "Full Name",
      phone: "Phone Number",
      email: "Email (optional)",
      department: "Department",
      doctor: "Preferred Doctor (optional)",
      date: "Preferred Date",
      time: "Preferred Time",
      reason: "Reason for Visit (optional)",
      selectOption: "Select…",
    },
    success: {
      title: "Appointment requested!",
      body: "We've received your request and will confirm shortly by phone.",
    },
    submitting: "Submitting…",
    disclaimer:
      "This form is for appointment requests only. For medical emergencies, call our emergency line.",
  },
  contact: {
    title: "Contact Us",
    subtitle: "Questions, feedback, or support — we'd love to hear from you.",
    form: {
      name: "Your Name",
      email: "Your Email",
      phone: "Phone Number",
      message: "Message",
      send: "Send Message",
    },
    info: { address: "Address", phone: "Phone", email: "Email", hours: "Hours" },
    success: "Thanks for reaching out! We'll get back to you soon.",
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Answers to common questions about our care and services.",
  },
  legal: {
    intro:
      "This is placeholder content. Replace it with your organization's official text.",
    disclaimer:
      "The information on this website is for general informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified health provider. In an emergency, call your local emergency number immediately.",
  },
};

export default en;
