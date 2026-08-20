import { palette } from "./colors";

/**
 * Semantic theme maps. Each key becomes a CSS variable (`--<key>`) applied in
 * globals.css for light and dark. Values are HSL channel triplets.
 */
export const lightTheme = {
  background: palette.slate[50],
  foreground: palette.slate[900],
  card: "0 0% 100%",
  "card-foreground": palette.slate[900],
  primary: palette.primary[600],
  "primary-foreground": "0 0% 100%",
  secondary: palette.teal[500],
  "secondary-foreground": "0 0% 100%",
  accent: palette.primary[100],
  "accent-foreground": palette.primary[800],
  muted: palette.slate[100],
  "muted-foreground": palette.slate[500],
  border: palette.slate[200],
  input: palette.slate[200],
  ring: palette.primary[500],
  success: palette.status.success,
  warning: palette.status.warning,
  destructive: palette.status.destructive,
  emergency: palette.status.emergency,
} as const;

export const darkTheme = {
  background: palette.slate[950],
  foreground: palette.slate[100],
  card: palette.slate[900],
  "card-foreground": palette.slate[100],
  primary: palette.primary[400],
  "primary-foreground": palette.slate[950],
  secondary: palette.teal[500],
  "secondary-foreground": palette.slate[950],
  accent: palette.slate[800],
  "accent-foreground": palette.primary[200],
  muted: palette.slate[800],
  "muted-foreground": palette.slate[400],
  border: palette.slate[800],
  input: palette.slate[800],
  ring: palette.primary[400],
  success: palette.status.success,
  warning: palette.status.warning,
  destructive: palette.status.destructive,
  emergency: palette.status.emergency,
} as const;

export type ThemeTokens = typeof lightTheme;
