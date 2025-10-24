import React, { useState, useMemo, useCallback } from 'react';
import { DailyLog, Meal, Workout, Nutrients } from './types';
import { analyzeMeal, analyzeWorkout, getDailySummary } from './services/geminiService';
import Dashboard from './components/Dashboard';
import { ToastContainer, toast } from 'react-toastify';

const App: React.FC = () => {
    const [dailyLog, setDailyLog] = useState<DailyLog>({
        date: new Date(),
        meals: [],
        workouts: [],
        waterIntake: 0,
        sleepHours: 7.5,
        baseWeight: 70,
        currentWeight: 70,
        goal: 'Lose belly fat and gain lean muscle',
    });

    const [loadingStates, setLoadingStates] = useState({
        meal: false,
        workout: false,
        summary: false,
    });
    
    const [aiSummary, setAiSummary] = useState<string | null>(null);

    const updateLoadingState = (key: 'meal' | 'workout' | 'summary', value: boolean) => {
        setLoadingStates(prev => ({ ...prev, [key]: value }));
    };

    const handleAddMeal = async (description: string) => {
        if (!description) {
            toast.warn("Please enter a meal description.");
            return;
        }
        updateLoadingState('meal', true);
        try {
            const nutrients = await analyzeMeal(description);
            const newMeal: Meal = { id: Date.now(), description, ...nutrients };
            setDailyLog(prev => ({ ...prev, meals: [...prev.meals, newMeal] }));
            toast.success("Meal added successfully!");
        } catch (error) {
            console.error("Failed to analyze meal:", error);
            toast.error("AI couldn't analyze the meal. Please try again.");
        } finally {
            updateLoadingState('meal', false);
        }
    };

    const handleAddWorkout = async (description: string) => {
        if (!description) {
            toast.warn("Please enter a workout description.");
            return;
        }
        updateLoadingState('workout', true);
        try {
            const workoutData = await analyzeWorkout(description);
            const newWorkout: Workout = { id: Date.now(), description, ...workoutData };
            setDailyLog(prev => ({ ...prev, workouts: [...prev.workouts, newWorkout] }));
            toast.success("Workout added successfully!");
        } catch (error) {
            console.error("Failed to analyze workout:", error);
            toast.error("AI couldn't analyze the workout. Please try again.");
        } finally {
            updateLoadingState('workout', false);
        }
    };
    
    const handleGenerateSummary = async () => {
        updateLoadingState('summary', true);
        setAiSummary(null);
        try {
            const summary = await getDailySummary(dailyLog);
            setAiSummary(summary);
            toast.info("Daily summary unlocked!");
        } catch (error) {
            console.error("Failed to generate summary:", error);
            toast.error("AI failed to generate a summary. Please try again later.");
        } finally {
            updateLoadingState('summary', false);
        }
    };

    const totals = useMemo(() => {
        const totalCalories = dailyLog.meals.reduce((sum, meal) => sum + meal.calories, 0);
        const totalProtein = dailyLog.meals.reduce((sum, meal) => sum + meal.protein, 0);
        const totalCarbs = dailyLog.meals.reduce((sum, meal) => sum + meal.carbs, 0);
        const totalFat = dailyLog.meals.reduce((sum, meal) => sum + meal.fat, 0);
        const totalCaloriesBurned = dailyLog.workouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);

        return { totalCalories, totalProtein, totalCarbs, totalFat, totalCaloriesBurned };
    }, [dailyLog.meals, dailyLog.workouts]);

    const handleWaterChange = useCallback((amount: number) => {
        setDailyLog(prev => ({ ...prev, waterIntake: Math.max(0, prev.waterIntake + amount) }));
    }, []);

    const handleSleepChange = useCallback((amount: number) => {
        setDailyLog(prev => ({ ...prev, sleepHours: Math.max(0, prev.sleepHours + amount) }));
    }, []);

    const handleWeightChange = useCallback((newWeight: number) => {
        setDailyLog(prev => ({ ...prev, currentWeight: newWeight }));
    }, []);


    return (
        <>
            <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                        AuraFit: AI Health Quest
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">Your personalized AI companion for a healthier you.</p>
                </header>
                <main>
                    <Dashboard
                        dailyLog={dailyLog}
                        totals={totals}
                        loadingStates={loadingStates}
                        aiSummary={aiSummary}
                        onAddMeal={handleAddMeal}
                        onAddWorkout={handleAddWorkout}
                        onWaterChange={handleWaterChange}
                        onSleepChange={handleSleepChange}
                        onWeightChange={handleWeightChange}
                        onGenerateSummary={handleGenerateSummary}
                    />
                </main>
            </div>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </>
    );
};

export default App;