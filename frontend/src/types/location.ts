import type { Coordinates, OpeningHour } from "./common";

export interface Location {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phone: string;
  email: string;
  coordinates: Coordinates;
  openingHours: OpeningHour[];
  emergencyAvailable: boolean;
  mapUrl: string;
  image: string;
}
