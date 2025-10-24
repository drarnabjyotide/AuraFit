import React, { useState } from 'react';

interface LoggerFormProps {
    placeholder: string;
    onLog: (description: string) => void;
    loading: boolean;
}

const LoggerForm: React.FC<LoggerFormProps> = ({ placeholder, onLog, loading }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLog(input);
        setInput('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    disabled={loading}
                />
                <button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? '...' : 'Log'}
                </button>
            </div>
        </form>
    );
};

export default LoggerForm;