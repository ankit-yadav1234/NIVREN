export interface Doctor {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  departmentId: string;
  qualification: string[];
  experience: number; // years
  image: string;
  bio: string;
  languages: string[];
  consultation: {
    online: boolean;
    inPerson: boolean;
  };
  locationIds?: string[];
  rating?: number;
}
