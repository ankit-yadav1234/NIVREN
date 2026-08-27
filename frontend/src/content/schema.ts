/**
 * The content contract. Every locale must implement this shape, so adding a
 * language = adding one folder that satisfies `Dictionary`. Components read
 * from this via getContent(locale) — never hard-coded strings.
 */
export interface Dictionary {
  assistant: {
    openVoice: string;
    closeVoice: string;
    openChat: string;
    closeChat: string;
    dialogLabel: string;
    title: string;
    emptyHint: string;
    thinking: string;
    errorMessage: string;
    inputPlaceholder: string;
    sendLabel: string;
    doneFallback: string;
  };
  common: {
    nav: {
      home: string;
      departments: string;
      allDepartments: string;
      doctors: string;
      services: string;
      allServices: string;
      locations: string;
      about: string;
      contact: string;
      privacyPolicy: string;
      termsOfService: string;
      medicalDisclaimer: string;
      accessibilityStatement: string;
    };
    actions: {
      bookAppointment: string;
      findDoctor: string;
      learnMore: string;
      viewAll: string;
      callNow: string;
      getDirections: string;
      readMore: string;
      submit: string;
      search: string;
      emergency: string;
      signIn: string;
    };
    labels: {
      menu: string;
      closeMenu: string;
      toggleTheme: string;
      language: string;
      loading: string;
      empty: string;
      error: string;
      retry: string;
      experience: string;
      languages: string;
      specialty: string;
      department: string;
      years: string;
      skipToContent: string;
      close: string;
      qualifications: string;
      backHome: string;
      notFoundTitle: string;
      notFoundBody: string;
      errorBody: string;
    };
    footer: {
      quickLinks: string;
      services: string;
      contactUs: string;
      legal: string;
      emergency: string;
      rights: string;
      tagline: string;
    };
  };
  home: {
    hero: {
      badge: string;
      title: string;
      titleAccent: string;
      description: string;
      primaryAction: string;
      secondaryAction: string;
    };
    emergency: { title: string; description: string; action: string };
    about: { title: string; description: string; points: string[] };
    departments: { title: string; description: string };
    doctors: { title: string; description: string };
    services: { title: string; description: string };
    testimonials: { title: string; description: string };
    appointmentCta: { title: string; description: string; action: string };
    locations: { title: string; description: string };
    faq: { title: string; description: string };
    contact: { title: string; description: string };
    stats: { patients: string; doctors: string; departments: string; years: string };
  };
  about: {
    title: string;
    subtitle: string;
    mission: { title: string; body: string };
    vision: { title: string; body: string };
    values: { title: string; items: { title: string; body: string }[] };
  };
  doctors: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterDepartment: string;
    filterSpecialty: string;
    filterLanguage: string;
    all: string;
    noResults: string;
    bookWith: string;
    aboutDoctor: string;
    consultation: { online: string; inPerson: string };
  };
  departments: {
    title: string;
    subtitle: string;
    ourDoctors: string;
    noDoctors: string;
  };
  services: { title: string; subtitle: string; category: string };
  locations: {
    title: string;
    subtitle: string;
    openingHours: string;
    open24: string;
    emergencyAvailable: string;
    directions: string;
  };
  appointment: {
    title: string;
    subtitle: string;
    fields: {
      name: string;
      phone: string;
      email: string;
      department: string;
      doctor: string;
      date: string;
      time: string;
      reason: string;
      selectOption: string;
    };
    success: { title: string; body: string };
    submitting: string;
    disclaimer: string;
  };
  contact: {
    title: string;
    subtitle: string;
    form: {
      name: string;
      email: string;
      phone: string;
      message: string;
      send: string;
      interestLabel: string;
      interestOptions: { value: string; label: string }[];
      validation: { nameRequired: string; emailInvalid: string; messageMinLength: string };
    };
    info: { address: string; phone: string; email: string; hours: string };
    success: string;
  };
  faq: { title: string; subtitle: string };
  legal: { intro: string; disclaimer: string };
}
