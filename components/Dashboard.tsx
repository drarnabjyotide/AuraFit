import React from 'react';
import { DailyLog } from '../types';
import Card from './Card';
import LoggerForm from './LoggerForm';
import { WaterIcon, SleepIcon, WeightIcon, FoodIcon, WorkoutIcon, SummaryIcon, QuestIcon } from './Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import GoalProgress from './GoalProgress';
import { useCountUp } from '../hooks/useCountUp';

interface DashboardProps {
    dailyLog: DailyLog;
    totals: {
        totalCalories: number;
        totalProtein: number;
        totalCarbs: number;
        totalFat: number;
        totalCaloriesBurned: number;
    };
    loadingStates: {
        meal: boolean;
        workout: boolean;
        summary: boolean;
    };
    aiSummary: string | null;
    onAddMeal: (description: string) => void;
    onAddWorkout: (description: string) => void;
    onWaterChange: (amount: number) => void;
    onSleepChange: (amount: number) => void;
    onWeightChange: (newWeight: number) => void;
    onGenerateSummary: () => void;
}

const AnimatedStatDisplay: React.FC<{ label: string; value: number; unit: string; color: string }> = ({ label, value, unit, color }) => {
    const animatedValue = useCountUp(value, 1000);
    return (
        <div className="text-center">
            <p className="text-sm text-gray-400">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{animatedValue}<span className="text-base font-normal text-gray-400 ml-1">{unit}</span></p>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({
    dailyLog, totals, loadingStates, aiSummary,
    onAddMeal, onAddWorkout, onWaterChange, onSleepChange, onWeightChange, onGenerateSummary
}) => {
    
    const netCalories = totals.totalCalories - totals.totalCaloriesBurned;
    const nutrientData = [
        { name: 'Protein', value: totals.totalProtein, color: '#34D399' },
        { name: 'Carbs', value: totals.totalCarbs, color: '#60A5FA' },
        { name: 'Fat', value: totals.totalFat, color: '#FBBF24' },
    ];

    // Define daily goals for the Quest progress bars
    const calorieGoal = dailyLog.goal.toLowerCase().includes('gain') ? 2500 : 2000;
    const proteinGoal = Math.round(dailyLog.baseWeight * 1.6); // 1.6g per kg bodyweight
    const waterGoal = 8; // 8 glasses
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Daily Quests Card */}
            <Card title="Daily Quests" icon={<QuestIcon />} className="lg:col-span-3">
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GoalProgress label="Calories" current={totals.totalCalories} goal={calorieGoal} unit="kcal" color="bg-gradient-to-r from-emerald-500 to-cyan-500" />
                    <GoalProgress label="Protein" current={totals.totalProtein} goal={proteinGoal} unit="g" color="bg-gradient-to-r from-green-400 to-emerald-500" />
                    <GoalProgress label="Water" current={dailyLog.waterIntake} goal={waterGoal} unit="glasses" color="bg-gradient-to-r from-blue-400 to-cyan-400" />
                </div>
            </Card>

            {/* AI Coach */}
            <Card title="AI Coach" icon={<SummaryIcon />} className="lg:col-span-2">
                 <div className="p-4 flex flex-col h-full min-h-[300px]">
                    {aiSummary ? (
                        <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/### (.*)/g, '<h3 class="text-lg font-semibold text-cyan-400 mt-4 mb-2">$1</h3>') }} />
                    ) : (
                        <div className="text-center text-gray-400 flex-grow flex flex-col items-center justify-center">
                            <p>Ready for your daily report?</p>
                            <p className="text-sm">Log some activities and get your AI-powered insights!</p>
                        </div>
                    )}
                    <button onClick={onGenerateSummary} disabled={loadingStates.summary} className="mt-auto w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                        {loadingStates.summary ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : 'Unlock Daily Summary'}
                    </button>
                </div>
            </Card>
            
            {/* Summary Card */}
            <Card title="Daily Vitals" icon={<SummaryIcon />} className="lg:col-span-1">
                <div className="flex flex-col gap-4 p-4">
                    <AnimatedStatDisplay label="Calories In" value={Math.round(totals.totalCalories)} unit="kcal" color="text-emerald-400" />
                    <AnimatedStatDisplay label="Calories Out" value={Math.round(totals.totalCaloriesBurned)} unit="kcal" color="text-red-400" />
                    <AnimatedStatDisplay label="Net" value={Math.round(netCalories)} unit="kcal" color={netCalories > 0 ? 'text-yellow-400' : 'text-cyan-400'} />
                </div>
                 <div className="h-40 mt-2 px-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={nutrientData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
                            <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                            <Bar dataKey="value" background={{ fill: '#374151' }} barSize={15}>
                                {nutrientData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Food Logger */}
            <Card title="Log Meal" icon={<FoodIcon />}>
                <LoggerForm placeholder="e.g., Chicken salad with avocado" onLog={onAddMeal} loading={loadingStates.meal} />
                <div className="p-4 max-h-48 overflow-y-auto">
                    {dailyLog.meals.map(meal => <p key={meal.id} className="text-sm text-gray-300 border-b border-gray-700 py-1">{meal.description} - {Math.round(meal.calories)} kcal</p>)}
                </div>
            </Card>
            
            {/* Workout Logger */}
            <Card title="Log Workout" icon={<WorkoutIcon />}>
                <LoggerForm placeholder="e.g., 30 min run" onLog={onAddWorkout} loading={loadingStates.workout} />
                 <div className="p-4 max-h-48 overflow-y-auto">
                    {dailyLog.workouts.map(workout => <p key={workout.id} className="text-sm text-gray-300 border-b border-gray-700 py-1">{workout.description} - {Math.round(workout.caloriesBurned)} kcal</p>)}
                </div>
            </Card>

            {/* Simple Trackers */}
             <Card title="Water Intake" icon={<WaterIcon />}>
                <div className="flex items-center justify-center p-4 gap-4">
                    <button onClick={() => onWaterChange(-1)} className="bg-gray-700 rounded-full p-2 hover:bg-gray-600">-</button>
                    <p className="text-3xl font-bold text-blue-400">{dailyLog.waterIntake} <span className="text-lg text-gray-400">glasses</span></p>
                    <button onClick={() => onWaterChange(1)} className="bg-gray-700 rounded-full p-2 hover:bg-gray-600">+</button>
                </div>
            </Card>
            
             <Card title="Sleep Cycle" icon={<SleepIcon />}>
                <div className="flex items-center justify-center p-4 gap-4">
                    <button onClick={() => onSleepChange(-0.5)} className="bg-gray-700 rounded-full p-2 hover:bg-gray-600">-</button>
                    <p className="text-3xl font-bold text-purple-400">{dailyLog.sleepHours.toFixed(1)} <span className="text-lg text-gray-400">hours</span></p>
                    <button onClick={() => onSleepChange(0.5)} className="bg-gray-700 rounded-full p-2 hover:bg-gray-600">+</button>
                </div>
            </Card>
             <Card title="Weight Journey" icon={<WeightIcon />}>
                 <div className="p-4 text-center">
                    <label htmlFor="weight-input" className="text-gray-400 text-sm">Current Weight (kg)</label>
                    <input
                        id="weight-input"
                        type="number"
                        value={dailyLog.currentWeight}
                        onChange={(e) => onWeightChange(parseFloat(e.target.value))}
                        className="w-full bg-gray-800 text-center text-3xl font-bold text-green-400 p-2 rounded-md mt-2 border-2 border-transparent focus:border-emerald-500 focus:outline-none"
                    />
                    <p className="text-sm text-gray-500 mt-2">Goal: {dailyLog.goal}</p>
                 </div>
            </Card>
        </div>
    );
};

export default Dashboard;