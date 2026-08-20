export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  quote: string;
  rating: number;
  image?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  logo: string;
}
