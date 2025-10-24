import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface GoalProgressProps {
    label: string;
    current: number;
    goal: number;
    unit: string;
    color: string;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ label, current, goal, unit, color }) => {
    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    const hasFiredConfetti = useRef(false);

    useEffect(() => {
        const isCompleted = percentage >= 100;
        
        if (isCompleted && !hasFiredConfetti.current) {
            hasFiredConfetti.current = true;
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                zIndex: 1000,
                colors: ['#34D399', '#60A5FA', '#FBBF24', '#A78BFA', '#F87171']
            });
        } else if (!isCompleted) {
            // Reset if goal becomes un-completed (e.g., if goal changes)
            hasFiredConfetti.current = false;
        }
    }, [percentage]);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-semibold text-gray-200">{label}</span>
                <span className="font-medium text-gray-400">{Math.round(current)} / {goal} {unit}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 group overflow-hidden">
                <div 
                    className={`h-3 rounded-full transition-all duration-700 ease-in-out ${color} ${percentage >= 100 ? 'animate-pulse' : ''}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default GoalProgress;