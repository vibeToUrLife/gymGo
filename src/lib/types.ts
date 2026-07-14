export type Exercise = {
  id: string;
  name: string;
  force: string | null;
  level: string; // "beginner" | "intermediate" | "expert"
  mechanic: string | null; // "compound" | "isolation"
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[]; // relative paths, e.g. "3_4_Sit-Up/0.jpg"
};
