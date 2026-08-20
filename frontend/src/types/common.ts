export type Locale = "en" | "hi" | "ar";
export type Direction = "ltr" | "rtl";
export type Theme = "light" | "dark" | "system";

export interface LocaleMeta {
  code: Locale;
  name: string;
  nativeName: string;
  direction: Direction;
}

export interface NavigationItem {
  /** i18n key resolved from content.common.nav, falls back to `label` */
  labelKey?: string;
  label: string;
  href: string;
  children?: NavigationItem[];
  external?: boolean;
  /** Icon registry key (see components/ui/Icon.tsx) for dropdown/menu rows. */
  icon?: string;
  /** Short one-line description shown under the label in dropdown/menu rows. */
  description?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface OpeningHour {
  /** 0 = Sunday ... 6 = Saturday */
  day: number;
  opens: string; // "09:00"
  closes: string; // "18:00"
  closed?: boolean;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}
