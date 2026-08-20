export interface RcmService {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** lucide-react icon name (registered in components/ui/Icon.tsx) */
  icon: string;
  benefits: string[];
  process: { title: string; description: string }[];
  stat: { value: string; label: string };
}
