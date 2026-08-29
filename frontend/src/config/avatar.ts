/**
 * NIVREN AI Voice & Video Avatar Configuration
 * -------------------------------------------------------------
 * Male Presenter Default (Dr. Dylan / Alex - Healthcare RCM Specialist)
 */
export interface AvatarOption {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  voiceId: string;
}

export const AVATAR_CONFIG = {
  // Default selected avatar: Male
  defaultGender: "male",

  // Avatars list
  avatars: {
    male: {
      id: "male",
      name: "Dr. Dylan",
      role: "Chief RCM Consultant",
      // Sharp Executive Male Presenter (Local High-Resolution Asset)
      imageUrl: "/images/doctors/dr-dylan.png",
      voiceId: "en-US-GuyNeural",
    },
    female: {
      id: "female",
      name: "Emma",
      role: "RCM Specialist",
      imageUrl: "https://clips-presenters.d-id.com/v2/ella_pink_shirt_classroom/wmnCN4_87Q/tNGWKcDea1/image.png",
      voiceId: "en-US-JennyNeural",
    },
  },
};
