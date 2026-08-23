export const healthcareConfig = {
  emergency: {
    // Off: an RCM company positioning doesn't want a hospital-style
    // "call an ambulance" banner on the homepage.
    enabled: false,
    phone: "+91 98765 00000",
    available24x7: true,
  },

  appointment: {
    enabled: true,
    requirePhone: true,
    requireEmail: false,
    /** how many days ahead can be booked */
    maxAdvanceDays: 60,
    timeSlots: [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
    ],
  },

  doctors: {
    enabled: true,
    searchable: true,
    filterByDepartment: true,
    filterBySpecialty: true,
    filterByLanguage: true,
  },

  locations: {
    enabled: true,
    showMap: true,
  },

  insurance: {
    enabled: true,
  },

  patientPortal: {
    enabled: false,
    url: "",
  },
} as const;

export type HealthcareConfig = typeof healthcareConfig;
