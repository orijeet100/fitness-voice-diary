
export interface ExerciseDetail {
  name: string;
  muscleGroup: string;
  weight?: string;
  reps?: number;
  sets?: number;
  notes?: string;
}

export interface Workout {
  id: string;
  date: string;
  title: string;
  description: string;
  duration: string;
  exercises: string[];
  muscleGroups: string[];
  exerciseDetails: ExerciseDetail[];
  voiceTranscript?: string; // Keep for reference but don't display
  timestamp: number;
}
