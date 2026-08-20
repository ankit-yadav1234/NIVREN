/**
 * Design-token color scales (HSL channel triplets, e.g. "210 90% 45%").
 * These feed the CSS variables in globals.css. Components never use raw hex —
 * they use semantic Tailwind tokens (bg-background, text-primary, ...).
 */
export const palette = {
  primary: {
    50: "199 89% 96%",
    100: "199 89% 91%",
    200: "199 85% 82%",
    300: "199 82% 70%",
    400: "199 80% 56%",
    500: "199 89% 45%",
    600: "200 90% 38%",
    700: "201 88% 31%",
    800: "201 82% 26%",
    900: "202 78% 22%",
  },
  teal: {
    500: "173 70% 38%",
    600: "174 72% 30%",
  },
  slate: {
    50: "210 40% 98%",
    100: "210 40% 96%",
    200: "214 32% 91%",
    300: "213 27% 84%",
    400: "215 20% 65%",
    500: "215 16% 47%",
    600: "215 19% 35%",
    700: "215 25% 27%",
    800: "217 33% 17%",
    900: "222 47% 11%",
    950: "229 42% 8%",
  },
  status: {
    success: "142 71% 40%",
    warning: "38 92% 50%",
    destructive: "0 72% 51%",
    emergency: "0 84% 55%",
  },
} as const;
