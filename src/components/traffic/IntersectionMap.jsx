import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const TrafficLight = ({ state }) => (
    <div className="w-4 h-12 bg-black rounded-lg flex flex-col justify-between p-1 border border-slate-700 shadow-lg relative z-20">
        <div className={clsx("w-2 h-2 rounded-full", state === 'red' ? "bg-red-500 shadow-[0_0_8px_#ef4444]" : "bg-red-900/30")}></div>
        <div className={clsx("w-2 h-2 rounded-full", state === 'yellow' ? "bg-yellow-400 shadow-[0_0_8px_#facc15]" : "bg-yellow-900/30")}></div>
        <div className={clsx("w-2 h-2 rounded-full", state === 'green' ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-green-900/30")}></div>
    </div>
);

const IntersectionMap = ({ signals, density, emergencySource }) => {
    return (
        <div className="relative w-full h-[500px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 dark:border-white/10">
            {/* Background Texture (Asphalt) */}
            <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* Emergency Intersection Strobe Overlay */}
            {emergencySource && (
                <div className="absolute inset-0 z-10 bg-red-500/10 pointer-events-none mix-blend-screen animate-pulse">
                    <div className="absolute inset-0 bg-blue-500/10 delay-75"></div>
                </div>
            )}

            {/* Roads */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-32 bg-slate-800 border-x-2 border-slate-600">
                {/* Vertical Road Markings */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-yellow-500/50"></div>
            </div>
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-32 bg-slate-800 border-y-2 border-slate-600">
                {/* Horizontal Road Markings */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 border-t-2 border-dashed border-yellow-500/50"></div>
            </div>

            {/* Crosswalks */}
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-32 h-6 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,white_10px,white_20px)] opacity-30"></div>
            <div className="absolute bottom-[38%] left-1/2 -translate-x-1/2 w-32 h-6 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,white_10px,white_20px)] opacity-30"></div>
            <div className="absolute left-[38%] top-1/2 -translate-y-1/2 h-32 w-6 bg-[repeating-linear-gradient(0deg,transparent,transparent_10px,white_10px,white_20px)] opacity-30"></div>
            <div className="absolute right-[38%] top-1/2 -translate-y-1/2 h-32 w-6 bg-[repeating-linear-gradient(0deg,transparent,transparent_10px,white_10px,white_20px)] opacity-30"></div>

            {/* Traffic Lights Positioning */}
            <div className="absolute top-[32%] left-[40%]"><TrafficLight state={signals['N']} /></div>
            <div className="absolute bottom-[32%] right-[40%] rotate-180"><TrafficLight state={signals['S']} /></div>
            <div className="absolute left-[34%] bottom-[40%] -rotate-90"><TrafficLight state={signals['W']} /></div>
            <div className="absolute right-[34%] top-[40%] rotate-90"><TrafficLight state={signals['E']} /></div>

            {/* Emergency Vehicle */}
            {emergencySource === 'N' && (
                <motion.div
                    className="absolute top-0 left-[48%] w-8 h-12 bg-white rounded-md border-2 border-slate-200 z-30 flex flex-col items-center justify-between py-1 shadow-[0_0_30px_rgba(239,68,68,0.8)]"
                    animate={{ y: [-50, 600] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                    <div className="flex w-full px-1 justify-between">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-[ping_0.5s_infinite] shadow-[0_0_10px_#ef4444]"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-[ping_0.5s_infinite_0.1s] shadow-[0_0_10px_#3b82f6]"></div>
                    </div>
                    <div className="w-4 h-4 text-[8px] font-bold text-red-600 flex items-center justify-center">EMT</div>
                </motion.div>
            )}

            {/* Simulated Cars (Animation based on Density) */}
            <motion.div
                className="absolute top-0 left-[52%] w-6 h-10 bg-blue-500 rounded-sm shadow-[0_0_10px_#3b82f6]"
                animate={{ y: signals['N'] === 'red' ? 160 : [0, 500] }}
                transition={{ duration: signals['N'] === 'red' ? (520 / (density['N'] * 10 || 1)) * 0.3 : 520 / (density['N'] * 10 || 1), repeat: signals['N'] === 'red' ? 0 : Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute bottom-0 right-[52%] w-6 h-10 bg-red-500 rounded-sm shadow-[0_0_10px_#ef4444]"
                animate={{ y: signals['S'] === 'red' ? -160 : [0, -500] }}
                transition={{ duration: signals['S'] === 'red' ? (500 / (density['S'] * 10 || 1)) * 0.3 : 500 / (density['S'] * 10 || 1), repeat: signals['S'] === 'red' ? 0 : Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute left-0 top-[52%] w-10 h-6 bg-green-500 rounded-sm shadow-[0_0_10px_#22c55e]"
                animate={{ x: signals['E'] === 'red' ? 200 : [0, 800] }}
                transition={{ duration: signals['E'] === 'red' ? (500 / (density['E'] * 10 || 1)) * 0.3 : 500 / (density['E'] * 10 || 1), repeat: signals['E'] === 'red' ? 0 : Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute right-0 bottom-[52%] w-10 h-6 bg-yellow-500 rounded-sm shadow-[0_0_10px_#eab308]"
                animate={{ x: signals['W'] === 'red' ? -200 : [0, -800] }}
                transition={{ duration: signals['W'] === 'red' ? (500 / (density['W'] * 10 || 1)) * 0.3 : 500 / (density['W'] * 10 || 1), repeat: signals['W'] === 'red' ? 0 : Infinity, ease: "linear" }}
            />

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded text-xs text-slate-500 dark:text-slate-400">
                Live Simulation • 4-Way
            </div>
        </div>
    );
};

export default IntersectionMap;
