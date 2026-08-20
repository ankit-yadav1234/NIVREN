export interface Department {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** lucide-react icon name */
  icon: string;
  image: string;
  highlights?: string[];
}
