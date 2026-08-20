/** Centralized, typed access to public environment variables. */
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
  googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
  /** When false, api services return local static data. */
  get useRemoteApi() {
    return Boolean(this.apiUrl);
  },
};
