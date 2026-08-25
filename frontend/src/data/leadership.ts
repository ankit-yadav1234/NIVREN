export interface LeadershipMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
}

/** Illustrative leadership profiles — fictional names/photos (portrait stock images), not real people. */
export const leadershipTeam: LeadershipMember[] = [
  {
    id: "l-1",
    name: "Karan Mehta",
    title: "Chief Executive Officer",
    bio: "Two decades in healthcare operations, including running NIVREN's own hospital network before taking that same discipline to RCM clients.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "l-2",
    name: "Sunita Rao",
    title: "VP, Revenue Cycle Operations",
    bio: "Leads the coding and billing teams day to day, with a background in payer-side claims adjudication that shapes how we build clean claims.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "l-3",
    name: "Aditya Singh",
    title: "Head of Compliance & Security",
    bio: "Owns HIPAA compliance and data security across every client engagement, from access controls to audit readiness.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "l-4",
    name: "Priya Nair",
    title: "Director, Client Success",
    bio: "The point of contact for every client relationship — onboarding, ongoing reporting, and making sure results stay visible, not just promised.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80",
  },
];
