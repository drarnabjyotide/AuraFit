export interface Nutrients {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface Meal extends Nutrients {
    id: number;
    description: string;
}

export interface Workout {
    id: number;
    description: string;
    duration: number; // in minutes
    caloriesBurned: number;
}

export interface DailyLog {
    date: Date;
    meals: Meal[];
    workouts: Workout[];
    waterIntake: number; // in glasses
    sleepHours: number;
    baseWeight: number; // in kg
    currentWeight: number; // in kg
    goal: string;
}
