import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, Nutrients } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mealSchema = {
    type: Type.OBJECT,
    properties: {
        calories: { type: Type.NUMBER, description: "Estimated calories" },
        protein: { type: Type.NUMBER, description: "Estimated protein in grams" },
        carbs: { type: Type.NUMBER, description: "Estimated carbohydrates in grams" },
        fat: { type: Type.NUMBER, description: "Estimated fat in grams" },
    },
    required: ["calories", "protein", "carbs", "fat"],
};

const workoutSchema = {
    type: Type.OBJECT,
    properties: {
        duration: { type: Type.NUMBER, description: "Estimated duration of the workout in minutes" },
        caloriesBurned: { type: Type.NUMBER, description: "Estimated calories burned" },
    },
    required: ["duration", "caloriesBurned"],
};

/**
 * Cleans a JSON string that might be wrapped in markdown code blocks.
 * @param jsonString The raw string from the API.
 * @returns A clean JSON string.
 */
function cleanJsonString(jsonString: string): string {
    let cleanedString = jsonString.trim();
    if (cleanedString.startsWith("```json")) {
        cleanedString = cleanedString.substring(7);
    }
    if (cleanedString.startsWith("```")) {
        cleanedString = cleanedString.substring(3);
    }
    if (cleanedString.endsWith("```")) {
        cleanedString = cleanedString.slice(0, -3);
    }
    return cleanedString.trim();
}


export const analyzeMeal = async (description: string): Promise<Nutrients> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the nutritional content of this meal: "${description}". Provide your best estimate.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: mealSchema,
        },
    });

    const jsonText = cleanJsonString(response.text);
    try {
        return JSON.parse(jsonText) as Nutrients;
    } catch (e) {
        console.error("Failed to parse meal analysis JSON:", jsonText);
        throw new Error("Received invalid JSON from API for meal analysis.");
    }
};

export const analyzeWorkout = async (description: string): Promise<{ duration: number; caloriesBurned: number }> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze this workout: "${description}". Estimate the duration in minutes and calories burned.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: workoutSchema,
        },
    });

    const jsonText = cleanJsonString(response.text);
    try {
        return JSON.parse(jsonText) as { duration: number; caloriesBurned: number };
    } catch (e) {
        console.error("Failed to parse workout analysis JSON:", jsonText);
        throw new Error("Received invalid JSON from API for workout analysis.");
    }
};

export const getDailySummary = async (log: DailyLog): Promise<string> => {
    const totalCaloriesIn = log.meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalCaloriesOut = log.workouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);
    const totalProtein = log.meals.reduce((sum, meal) => sum + meal.protein, 0);

    const mealNames = log.meals.map(m => m.description).join(', ') || 'None';
    const workoutNames = log.workouts.map(w => w.description).join(', ') || 'None';
    
    const prompt = `
        Based on the following daily log for a user whose base weight is ${log.baseWeight} kg and goal is to '${log.goal}', provide a summary and analysis.

        User's Goal: ${log.goal}
        Base Weight: ${log.baseWeight} kg
        Current Weight: ${log.currentWeight} kg

        Today's Data:
        - Calorie Intake: ${totalCaloriesIn.toFixed(0)} kcal from meals: ${mealNames}
        - Calories Burned: ${totalCaloriesOut.toFixed(0)} kcal from workouts: ${workoutNames}
        - Net Calorie Balance: ${(totalCaloriesIn - totalCaloriesOut).toFixed(0)} kcal
        - Protein Intake: ${totalProtein.toFixed(0)} g
        - Water Intake: ${log.waterIntake} glasses
        - Sleep: ${log.sleepHours} hours

        Your response must be a single string containing markdown.
        Your response must include these sections with these exact headings:

        ### 🌟 Daily Quest Report
        Give a brief, super positive summary of the day. Frame their efforts as completing a quest. Mention their calorie balance.

        ### 🔬 Weight & Goal Analysis
        Provide an approximate prediction for weight change based on today's data. Explain it simply. Offer specific advice for their goal of '${log.goal}'. For example, if they want muscle gain, comment on their protein intake. If they want fat loss, comment on their calorie deficit.

        ### ✨ Pro-Tip Unlocked!
        Give one actionable, inspiring tip for tomorrow. Make it sound like they've unlocked an achievement.

        Keep the entire response concise, under 200 words. Use emojis to make it engaging and motivational.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            systemInstruction: "You are a highly motivational and knowledgeable fitness and nutrition coach. Your tone is encouraging, positive, and gamified. You are helping a user achieve their health goals. Respond only with the markdown summary."
        }
    });

    return response.text;
};