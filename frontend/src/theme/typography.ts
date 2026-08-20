/** Fluid typography scale (used to document the CSS clamp() vars in globals.css). */
export const typography = {
  display: "clamp(2.5rem, 5vw, 4.5rem)",
  h1: "clamp(2rem, 4vw, 3.5rem)",
  h2: "clamp(1.75rem, 3vw, 2.75rem)",
  h3: "clamp(1.375rem, 2vw, 1.875rem)",
  h4: "clamp(1.125rem, 1.5vw, 1.375rem)",
  body: "clamp(1rem, 1.2vw, 1.0625rem)",
  bodySmall: "0.9375rem",
  caption: "0.8125rem",
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;
