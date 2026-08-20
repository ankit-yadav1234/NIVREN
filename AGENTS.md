# AGENTS.md — Master Architecture & Guidelines for NIVREN Healthcare Project

> **Notice for AI Agents (Antigravity, Claude, ChatGPT, Cursor, Copilot, etc.)**:
> This document is the **Single Source of Truth** for the NIVREN Healthcare project. Read this file carefully before implementing any feature, creating new components, or modifying data.

---

## 1. Project Overview

NIVREN is a modern, fullstack healthcare platform designed to deliver compassionate patient care and a seamless digital experience. It features a marketing & information portal, doctor directory, department showcase, appointment booking system, emergency information, and patient services.

### Core Stack
- **Frontend**: Next.js 15 (App Router, TypeScript, Tailwind CSS) in `/frontend`
- **Backend**: Express.js + TypeScript REST API in `/backend`
- **Orchestration**: Single root command `npm run dev` running both concurrently.

---

## 2. Directory Architecture & Guidelines

All frontend source code resides inside `/frontend/src/`. You must strictly follow this folder organization:

```text
frontend/src/
├── components/
│   ├── ui/             # Reusable base components (Button, Card, Badge, Input, Select, Modal, Container, Section)
│   ├── healthcare/     # Domain-specific components (DoctorCard, DoctorProfile, DepartmentCard, ServiceCard, AppointmentForm, AppointmentButton, EmergencyBanner, HospitalInfo, OpeningHours, LocationCard, InsuranceCard, FAQ)
│   ├── layout/         # Layout components (Navbar, Footer, Header, MobileMenu)
│   ├── sections/       # Page section components (Hero, About, Doctors, Departments, Services, Testimonials, AppointmentCTA, Contact)
│   └── animations/     # Motion wrappers (FadeIn.tsx, SlideUp.tsx, Stagger.tsx, PageTransition.tsx with prefers-reduced-motion)
│
├── content/            # Android strings.xml-style string & text system
│   ├── en/             # English UI text (home.ts, doctors.ts, services.ts, common.ts)
│   ├── hi/             # Hindi UI text (home.ts, doctors.ts, services.ts, common.ts)
│   └── ar/             # Arabic UI text (RTL support)
│
├── data/               # Structured static domain data
│   ├── doctors.ts      # Doctor profiles (id, name, specialty, department, image, experience, qualifications)
│   ├── departments.ts  # Hospital departments (Cardiology, Neurology, Pediatrics, Orthopedics, etc.)
│   ├── services.ts     # Clinical services & treatments
│   ├── locations.ts    # Hospital clinics & emergency addresses
│   └── insurance.ts    # Accepted health insurance providers
│
├── styles/
│   ├── base/           # Base CSS resets & typography
│   ├── tokens/         # Design tokens (10 Healthcare Colors, Clamp Typography, Shadows, Spacing, Radius)
│   └── utilities/      # Custom mixins & helper utilities
│
├── config/
│   ├── site.ts         # Site metadata, navigation links, contact details
│   ├── locales.ts      # Multi-language configuration (EN, HI, AR)
│   ├── themes.ts       # Light/Dark mode theme settings
│   └── healthcare.ts   # Emergency numbers, working hours, hospital credentials
│
├── hooks/              # Custom React hooks (useAppointment, useTheme, useLocale)
├── lib/                # API client, fetcher utilities, helpers
├── types/              # TypeScript interfaces (Doctor, Department, Service, Appointment)
└── providers/          # React context providers (ThemeProvider, LocaleProvider)
```

---

## 3. Key Design Principles

### A. Centralized Content System (Android `strings.xml` Pattern)
- **Rule**: NEVER hardcode text strings inside React JSX components!
- All UI text, headers, hero titles, button labels, and banners MUST be placed inside `src/content/{locale}/`.
- **Example**:
  ```ts
  // content/en/home.ts
  export const homeContent = {
    hero: {
      title: "Compassionate Care. Advanced Medicine.",
      subtitle: "Trusted healthcare for you and your family.",
      primaryCTA: "Book an Appointment",
      secondaryCTA: "Find a Doctor"
    },
    emergency: {
      title: "Need Urgent Medical Assistance?",
      phone: "+1 (800) 555-0199",
      action: "Call Emergency"
    }
  };
  ```

### B. Separation of Content vs. Private Data
- **Public Content & Static Data**: Placed in `src/content/` and `src/data/` (Doctors, Departments, Services, General FAQs).
- **Private & Patient Data**: Appointments, medical records, reports, prescriptions, and user authentication MUST NEVER be stored in client-side static files. They must be processed through the Express API backend (`/backend`) with proper authorization, security, and privacy controls.

### C. Design System & Aesthetics
- **Color Palette**: 10 harmonious healthcare colors (Primary Medical Blue, Emerald Health, Teal Assist, Cyan Care, Rose Emergency, Slate Dark/Light backgrounds).
- **Typography**: Fluid `clamp()` font sizes for perfect responsiveness across mobile, tablet, and desktop.
- **Animations**: Motion must be subtle, dignified, and accessible. Always respect `prefers-reduced-motion` for patient accessibility.

---

## 4. Instructions for AI Agents Working on this Project

1. **Check Component Scope First**: Before creating a new file, check if it belongs in `components/ui/` (generic), `components/healthcare/` (healthcare domain), or `components/sections/` (page section).
2. **No Data Touch in JSX**: If updating a doctor's specialty or name, update `src/data/doctors.ts`, NOT the component.
3. **Use Explicit TypeScript Interfaces**: Always import or define types from `src/types/`.
4. **Follow Dark/Light Theme Tokens**: Use Tailwind CSS variables or color tokens defined in `styles/tokens/`.
5. **Verification**: Run `npm run build:frontend` and `npm run build:backend` after making changes to ensure clean TypeScript compilation.
