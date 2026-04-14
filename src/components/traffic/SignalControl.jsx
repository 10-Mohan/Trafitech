import React from 'react';
import { clsx } from 'clsx';
import { Clock } from 'lucide-react';

const SignalControl = ({ signalId, currentLight, setLight, duration }) => {
    const lights = [
        { color: 'red', label: 'STOP', value: 'red' },
        { color: 'yellow', label: 'WAIT', value: 'yellow' },
        { color: 'green', label: 'GO', value: 'green' },
    ];

    return (
        <div className="glass-card p-4 rounded-xl border-l-4 border-l-slate-500">
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-slate-800 dark:text-white tracking-wide">Signal {signalId}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 px-2 py-1 rounded-full">
                    <Clock size={12} />
                    <span>{duration}s</span>
                </div>
            </div>

            <div className="flex gap-2">
                {lights.map((l) => (
                    <button
                        key={l.value}
                        onClick={() => setLight(l.value)}
                        className={clsx(
                            "flex-1 text-xs font-bold py-2 rounded-lg transition-all duration-300 border border-transparent",
                            currentLight === l.value
                                ? l.value === 'red' ? "bg-red-500 text-white shadow-[0_0_10px_#ef4444]"
                                    : l.value === 'yellow' ? "bg-yellow-400 text-black shadow-[0_0_10px_#facc15]"
                                        : "bg-green-500 text-white shadow-[0_0_10px_#22c55e]"
                                : "bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10"
                        )}
                    >
                        {l.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SignalControl;
