import React from 'react';

interface CardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
    return (
        <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg flex flex-col h-full card-glow ${className}`}>
            <div className="flex items-center p-4 border-b border-gray-700">
                <div className="text-emerald-400 mr-3">{icon}</div>
                <h2 className="text-lg font-semibold text-gray-200">{title}</h2>
            </div>
            <div className="flex-grow flex flex-col">
                {children}
            </div>
        </div>
    );
};

export default Card;
