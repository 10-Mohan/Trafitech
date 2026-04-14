import React, { useState, useEffect } from 'react';
import { Sliders, AlertCircle, ShieldAlert, Bot } from 'lucide-react';
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

    // Auto-cycle simulation
    useEffect(() => {
        if (emergencyMode) return;

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
        }, autoPilot ? 3000 : 5000); // Faster reaction in autopilot
        return () => clearInterval(interval);
    }, [emergencyMode, autoPilot, densities]);

    // Response to global emergency toggle
    useEffect(() => {
        if (emergencyMode) {
            setSignals({ N: 'green', S: 'green', E: 'red', W: 'red' });
            setAutoPilot(false); // Force off autopilot
            info('EMERGENCY PREEMPTION ACTIVE', 'Clearing North-South corridor for EMT vehicle.');
        } else {
            setSignals({ N: 'red', S: 'red', E: 'green', W: 'green' });
            info('Emergency Mode Deactivated', 'Resuming normal traffic operations.');
        }
    }, [emergencyMode]);

    // Local handler (triggers global toggle)
    const handleEmergencyToggle = () => {
        toggleEmergency();
    };

    const applyOptimization = () => {
        console.log('🚀 Apply Optimization clicked!');

        // Apply AI recommendation: Increase East-West green duration by 15s
        setDurations(prev => {
            const newDurations = {
                ...prev,
                E: prev.E + 15,
                W: prev.W + 15
            };
            console.log('✅ Updated durations:', newDurations);
            return newDurations;
        });

        // Set East-West corridor to green
        setSignals(prev => {
            const newSignals = {
                ...prev,
                E: 'green',
                W: 'green',
                N: 'red',
                S: 'red'
            };
            console.log('✅ Updated signals:', newSignals);
            return newSignals;
        });

        // Visual feedback
        alert('✅ Optimization Applied!\n\n🟢 East-West signals set to GREEN\n⏱️ Duration increased by 15 seconds');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">Trafi Tech Control Center</h1>
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
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage signals, monitor flow, and handle emergencies.</p>
                </div>
            </div>
            <button
                onClick={handleEmergencyToggle}
                className={clsx(
                    "w-full py-4 rounded-2xl font-black text-lg transition-all duration-500 flex items-center justify-center gap-4 border-2 shadow-2xl",
                    emergencyMode
                        ? "bg-brand-red text-white border-brand-red shadow-[0_0_30px_rgba(255,0,85,0.4)] animate-pulse"
                        : "bg-brand-red/10 text-brand-red border-brand-red/20 hover:bg-brand-red/20 hover:border-brand-red/40"
                )}
            >
                <AlertCircle size={24} />
                {emergencyMode ? "DEACTIVATE EMERGENCY" : "ACTIVATE EMERGENCY CORRIDOR"}
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Map Visualization */}
                <div className="lg:col-span-2">
                    <IntersectionMap
                        signals={signals}
                        density={densities}
                        emergencySource={emergencyMode ? 'N' : null}
                    />
                </div>

                {/* Controls Panel */}
                <div className="space-y-4">
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-brand-blue">
                                <Sliders size={20} />
                                <h3 className="font-bold">Signal Management</h3>
                            </div>
                            <button
                                onClick={() => setAutoPilot(!autoPilot)}
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
                </div>
            </div>
        </div>
    );
};

export default TrafficDashboard;
