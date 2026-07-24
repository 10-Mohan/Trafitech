import React, { useState, useEffect, useRef } from 'react';
import { Sliders, AlertCircle, ShieldAlert, Bot, Truck, Sun, CloudRain, CloudFog, Leaf, Volume2 } from 'lucide-react';
import IntersectionMap from '../components/traffic/IntersectionMap';
import SignalControl from '../components/traffic/SignalControl';
import { clsx } from 'clsx';
import { useIoT } from '../hooks/useIoT';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../components/notifications/NotificationSystem';

const TrafficDashboard = () => {
    const { iotData, connected } = useIoT();
    const { emergencyMode, toggleEmergency } = useApp();
    const { info } = useNotifications();
    const [signals, setSignals] = useState({ N: 'red', S: 'red', E: 'green', W: 'green' });
    const [densities, setDensities] = useState({ N: 40, S: 35, E: 80, W: 60 });
    const [durations, setDurations] = useState({ N: 45, S: 45, E: 30, W: 30 });
    const [autoPilot, setAutoPilot] = useState(false);
    
    // New Features: Weather, CO2, Emergency route routing, Voice, and Audit Logs
    const [weather, setWeather] = useState('sunny');
    const [co2Saved, setCo2Saved] = useState(248.52);
    const [emergencyDir, setEmergencyDir] = useState('N'); // N, S, E, W
    const [auditLogs, setAuditLogs] = useState([
        { id: 1, time: '13:20:05', msg: 'System initialized. Autopilot standing by.' }
    ]);
    const logContainerRef = useRef(null);

    // Helper to announce alerts using Browser Text-to-Speech
    const announceVoice = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.05;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Helper to log administrative actions
    const logAction = (msg) => {
        const time = new Date().toTimeString().split(' ')[0];
        setAuditLogs(prev => [
            ...prev,
            { id: Date.now(), time, msg }
        ]);
        // Auto scroll logs
        setTimeout(() => {
            if (logContainerRef.current) {
                logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
            }
        }, 100);
    };

    // Simulate flowing traffic densities
    useEffect(() => {
        const interval = setInterval(() => {
            setDensities(prev => ({
                N: Math.max(10, Math.min(100, prev.N + (Math.random() * 20 - 10))),
                S: Math.max(10, Math.min(100, prev.S + (Math.random() * 20 - 10))),
                E: Math.max(10, Math.min(100, prev.E + (Math.random() * 20 - 10))),
                W: Math.max(10, Math.min(100, prev.W + (Math.random() * 20 - 10)))
            }));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Live CO2 saved counter increment
    useEffect(() => {
        const interval = setInterval(() => {
            setCo2Saved(prev => prev + 0.02);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Auto-cycle simulation (updates transition timing based on weather)
    useEffect(() => {
        if (emergencyMode) return;

        const reactionTime = weather === 'sunny' ? 3000 : weather === 'rainy' ? 4500 : 6000;

        const interval = setInterval(() => {
            if (autoPilot) {
                setSignals(prev => {
                    const nsDensity = densities.N + densities.S;
                    const ewDensity = densities.E + densities.W;
                    if (nsDensity > ewDensity) return { N: 'green', S: 'green', E: 'red', W: 'red' };
                    return { N: 'red', S: 'red', E: 'green', W: 'green' };
                });
            } else {
                setSignals(prev => {
                    if (prev.N === 'green') return { N: 'red', S: 'red', E: 'green', W: 'green' };
                    return { N: 'green', S: 'green', E: 'red', W: 'red' };
                });
            }
        }, autoPilot ? reactionTime : reactionTime + 2000); 
        return () => clearInterval(interval);
    }, [emergencyMode, autoPilot, densities, weather]);

    // Response to global emergency toggle
    useEffect(() => {
        if (emergencyMode) {
            const greenSignals = { N: 'red', S: 'red', E: 'red', W: 'red' };
            if (emergencyDir === 'N' || emergencyDir === 'S') {
                greenSignals.N = 'green';
                greenSignals.S = 'green';
            } else {
                greenSignals.E = 'green';
                greenSignals.W = 'green';
            }
            setSignals(greenSignals);
            setAutoPilot(false); // Force off autopilot
            
            const alertMsg = `Emergency Preemption Corridor Active on ${emergencyDir === 'N' || emergencyDir === 'S' ? 'North-South' : 'East-West'} route.`;
            info('EMERGENCY PREEMPTION ACTIVE', alertMsg);
            announceVoice(`Emergency preemption active. Clearing lanes on the ${emergencyDir === 'N' || emergencyDir === 'S' ? 'North South' : 'East West'} corridor.`);
            logAction(`🚨 EMT CORRIDOR override activated starting from ${emergencyDir === 'N' ? 'North' : emergencyDir === 'S' ? 'South' : emergencyDir === 'E' ? 'East' : 'West'}.`);
        } else {
            setSignals({ N: 'red', S: 'red', E: 'green', W: 'green' });
            info('Emergency Mode Deactivated', 'Resuming normal traffic operations.');
            announceVoice('Emergency corridor cleared. Resuming standard traffic cycle.');
            logAction('🍀 Emergency preemption override cleared. Resuming standard cycles.');
        }
    }, [emergencyMode]);

    // Autopilot toggle audit logger
    const handleAutopilotToggle = () => {
        const nextState = !autoPilot;
        setAutoPilot(nextState);
        logAction(`🤖 Autopilot mode toggled ${nextState ? 'ON' : 'OFF'}.`);
        announceVoice(`Autopilot mode ${nextState ? 'enabled' : 'disabled'}.`);
    };

    // Weather selector alert
    const handleWeatherChange = (mode) => {
        setWeather(mode);
        const labels = {
            sunny: 'Sunny Weather: Standard speed limits (60 km/h) active.',
            rainy: 'Rainy Weather: Wet road precaution. Speed limit reduced to 45 km/h.',
            foggy: 'Foggy Weather: Low visibility. Speed limit reduced to 30 km/h. High visibility mode active.'
        };
        const voiceAnnouncements = {
            sunny: 'Weather updated to Sunny. Normal speed limits restored.',
            rainy: 'Warning. Weather updated to Rain. Speed limits reduced to 45 kilometers per hour for wet roads.',
            foggy: 'Warning. Weather updated to Fog. Visibility low. Speed limits reduced to 30 kilometers per hour.'
        };
        info('Weather Environment Update', labels[mode]);
        announceVoice(voiceAnnouncements[mode]);
        logAction(`🌧️ Weather condition shifted to ${mode.toUpperCase()}. Speed limit calibrated to ${mode === 'sunny' ? '60' : mode === 'rainy' ? '45' : '30'} km/h.`);
    };

    // Local handler (triggers global toggle)
    const handleEmergencyToggle = () => {
        toggleEmergency();
    };

    const applyOptimization = () => {
        setDurations(prev => ({
            ...prev,
            E: prev.E + 15,
            W: prev.W + 15
        }));

        setSignals({
            E: 'green',
            W: 'green',
            N: 'red',
            S: 'red'
        });

        announceVoice('Applying custom AI corridor optimization.');
        logAction('💡 AI optimization applied: Increased East-West green cycle phase by 15s.');
        alert('✅ Optimization Applied!\n\n🟢 East-West signals set to GREEN\n⏱️ Duration increased by 15 seconds');
    };

    const getSpeedLimit = () => {
        if (weather === 'sunny') return '60 km/h';
        if (weather === 'rainy') return '45 km/h';
        return '30 km/h';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent italic">Trafi Tech Control Center</h1>
                        {connected && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-brand-green/10 border border-brand-green/20 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
                                </span>
                                <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest">Live IoT Stream</span>
                            </div>
                        )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage signals, monitor flow, and handle weather anomalies.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={handleEmergencyToggle}
                    className={clsx(
                        "py-4 rounded-2xl font-black text-lg transition-all duration-500 flex items-center justify-center gap-4 border-2 shadow-2xl",
                        emergencyMode
                            ? "bg-brand-red text-white border-brand-red shadow-[0_0_30px_rgba(255,0,85,0.4)] animate-pulse"
                            : "bg-brand-red/10 text-brand-red border-brand-red/20 hover:bg-brand-red/20 hover:border-brand-red/40"
                    )}
                >
                    <AlertCircle size={24} />
                    {emergencyMode ? "DEACTIVATE EMERGENCY" : "ACTIVATE EMERGENCY CORRIDOR"}
                </button>

                {/* Speed Limit Indicator Badge */}
                <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-4 border-red-500 flex items-center justify-center font-bold text-lg bg-white text-slate-800 shadow-md">
                            {getSpeedLimit().split(' ')[0]}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Speed Limit</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {weather === 'sunny' && 'Optimal Road Status'}
                                {weather === 'rainy' && 'Wet Surface Warning'}
                                {weather === 'foggy' && 'Hazard visibility active'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Map Visualization */}
                <div className="lg:col-span-2 space-y-4">
                    <IntersectionMap
                        signals={signals}
                        density={densities}
                        emergencySource={emergencyMode ? emergencyDir : null}
                    />

                    {/* Interactive Emergency Route Selector Simulator */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Volume2 size={20} className="text-brand-blue" />
                                Interactive Emergency Dispatcher
                            </h3>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Preemption Routing Simulation</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['N', 'S', 'E', 'W'].map((dir) => {
                                const labels = { N: 'North Entrance', S: 'South Exit', E: 'East Gate', W: 'West Link' };
                                return (
                                    <button
                                        key={dir}
                                        onClick={() => {
                                            setEmergencyDir(dir);
                                            logAction(`Selected ${labels[dir]} corridor route for next emergency dispatch.`);
                                            if (emergencyMode) {
                                                // Trigger update dynamically if active
                                                toggleEmergency();
                                                setTimeout(() => toggleEmergency(), 100);
                                            }
                                        }}
                                        className={clsx(
                                            "py-2 px-3 rounded-lg border text-xs font-semibold transition-all",
                                            emergencyDir === dir
                                                ? "bg-brand-red/10 border-brand-red text-brand-red"
                                                : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10"
                                        )}
                                    >
                                        {labels[dir]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Controls Panel */}
                <div className="space-y-4">
                    {/* Signal Management Panel */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-brand-blue">
                                <Sliders size={20} />
                                <h3 className="font-bold">Signal Management</h3>
                            </div>
                            <button
                                onClick={handleAutopilotToggle}
                                className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all", autoPilot ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30" : "bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10")}
                            >
                                <Bot size={16} /> {autoPilot ? "Auto-Pilot ON" : "Auto-Pilot OFF"}
                            </button>
                        </div>

                        <div className="space-y-3 transition-opacity" style={{ opacity: autoPilot ? 0.5 : 1, pointerEvents: autoPilot ? 'none' : 'auto' }}>
                            <SignalControl signalId="North" currentLight={signals.N} setLight={(val) => setSignals({ ...signals, N: val })} duration={durations.N} />
                            <SignalControl signalId="South" currentLight={signals.S} setLight={(val) => setSignals({ ...signals, S: val })} duration={durations.S} />
                            <SignalControl signalId="East" currentLight={signals.E} setLight={(val) => setSignals({ ...signals, E: val })} duration={durations.E} />
                            <SignalControl signalId="West" currentLight={signals.W} setLight={(val) => setSignals({ ...signals, W: val })} duration={durations.W} />
                        </div>
                    </div>

                    {/* Weather Adaptation Control Panel */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="font-bold text-brand-purple flex items-center gap-2 mb-3">
                            <CloudRain size={20} />
                            Weather Adaptation
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => handleWeatherChange('sunny')}
                                className={clsx(
                                    "py-2 px-1.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all",
                                    weather === 'sunny'
                                        ? "bg-brand-yellow/10 border-brand-yellow text-brand-yellow"
                                        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10"
                                )}
                            >
                                <Sun size={16} />
                                Sunny
                            </button>
                            <button
                                onClick={() => handleWeatherChange('rainy')}
                                className={clsx(
                                    "py-2 px-1.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all",
                                    weather === 'rainy'
                                        ? "bg-brand-blue/10 border-brand-blue text-brand-blue"
                                        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10"
                                )}
                            >
                                <CloudRain size={16} />
                                Rainy
                            </button>
                            <button
                                onClick={() => handleWeatherChange('foggy')}
                                className={clsx(
                                    "py-2 px-1.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all",
                                    weather === 'foggy'
                                        ? "bg-brand-purple/10 border-brand-purple text-brand-purple"
                                        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10"
                                )}
                            >
                                <CloudFog size={16} />
                                Foggy
                            </button>
                        </div>
                    </div>

                    {/* Municipal Activity Audit Logs Terminal Widget */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-950 font-mono text-[10px]">
                        <h4 className="font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2 mb-2">Municipal Activity Log</h4>
                        <div ref={logContainerRef} className="space-y-1.5 h-[100px] overflow-y-auto custom-scrollbar select-text text-slate-300">
                            {auditLogs.map((log) => (
                                <p key={log.id} className="leading-tight">
                                    <span className="text-slate-500">[{log.time}]</span> {log.msg}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* CO2 Eco-Savings Tracker Panel */}
                    <div className="glass-panel p-6 rounded-2xl border-l-4 border-brand-green">
                        <div className="flex items-center gap-2 mb-2 text-brand-green">
                            <Leaf size={20} />
                            <h3 className="font-bold">Eco Savings Ticker</h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            Estimated reduction in greenhouse gas emissions from decreased engine idling.
                        </p>
                        <div className="p-3 rounded-lg bg-brand-green/5 border border-brand-green/20 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Emissions Saved:</span>
                            <span className="text-lg font-mono font-black text-brand-green">{co2Saved.toFixed(2)} kg</span>
                        </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="glass-panel p-6 rounded-2xl border-l-4 border-brand-yellow">
                        <div className="flex items-center gap-2 mb-2 text-brand-yellow">
                            <AlertCircle size={20} />
                            <h3 className="font-bold">AI Recommendations</h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            High density detected on <strong>East-West</strong> corridor. Suggest increasing Green signal duration by <strong>15s</strong>.
                        </p>
                        <button
                            onClick={applyOptimization}
                            className="mt-3 w-full py-2 bg-brand-yellow/10 text-brand-yellow rounded-lg hover:bg-brand-yellow/20 transition-colors text-sm font-semibold hover:shadow-lg hover:shadow-brand-yellow/20"
                        >
                            Apply Optimization
                        </button>
                    </div>

                    {/* Freight & Logistics Pass */}
                    <div className="glass-panel p-6 rounded-2xl border-l-4 border-brand-blue">
                        <div className="flex items-center gap-2 mb-2 text-brand-blue">
                            <Truck size={20} />
                            <h3 className="font-bold">Freight & Logistics Pass</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Real-time corridor priority for registered delivery trucks.
                            </p>
                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Amazon #421 (Northbound)</span>
                                    <span className="px-2 py-0.5 rounded bg-brand-green/20 text-brand-green font-bold uppercase text-[9px]">Priority Green</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">FedEx #109 (Westbound)</span>
                                    <span className="px-2 py-0.5 rounded bg-brand-green/20 text-brand-green font-bold uppercase text-[9px]">Priority Green</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrafficDashboard;
