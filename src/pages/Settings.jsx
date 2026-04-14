import React, { useState } from 'react';
import { Save, RefreshCw, Bell, Shield, Server, Smartphone, Mail } from 'lucide-react';
import { clsx } from 'clsx';

const Toggle = ({ label, description, active, onToggle }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 border border-slate-100 dark:border-white/5 hover:border-brand-blue/30 transition-all">
        <div>
            <h4 className="text-slate-800 dark:text-white font-medium">{label}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
        <button
            onClick={onToggle}
            className={clsx(
                "w-12 h-6 rounded-full relative transition-colors duration-300",
                active ? "bg-brand-blue" : "bg-slate-700"
            )}
        >
            <div className={clsx(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-md",
                active ? "left-7" : "left-1"
            )} />
        </button>
    </div>
);

const Section = ({ icon: Icon, title, children }) => (
    <div className="glass-panel p-6 rounded-2xl mb-6">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                <Icon size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        autoCorridor: true,
        dynamicTiming: true,
        emailAlerts: false,
        smsAlerts: true,
        dataLogging: true
    });

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">System Configuration</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage simulation parameters and alerts.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-brand-blue text-brand-dark font-bold rounded-xl hover:bg-brand-blue/90 hover:scale-105 transition-all"
                >
                    {loading ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Traffic Logic Settings */}
                <Section icon={Shield} title="Traffic Control Logic">
                    <Toggle
                        label="Auto-Emergency Corridor"
                        description="Automatically switch all lights to Green for ambulances."
                        active={settings.autoCorridor}
                        onToggle={() => setSettings({ ...settings, autoCorridor: !settings.autoCorridor })}
                    />
                    <Toggle
                        label="Adaptive Signal Timing"
                        description="Use AI to adjust signal duration based on density."
                        active={settings.dynamicTiming}
                        onToggle={() => setSettings({ ...settings, dynamicTiming: !settings.dynamicTiming })}
                    />
                    <div className="p-4 rounded-xl bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 border border-slate-100 dark:border-white/5">
                        <label className="text-sm text-slate-600 dark:text-slate-300 block mb-2">Default Green Light Duration (s)</label>
                        <input type="range" min="10" max="120" defaultValue="45" className="w-full accent-brand-blue h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                            <span>10s</span>
                            <span>Default: 45s</span>
                            <span>120s</span>
                        </div>
                    </div>
                </Section>

                {/* Notifications */}
                <Section icon={Bell} title="Alerts & Notifications">
                    <Toggle
                        label="Critical Violation SMS"
                        description="Send SMS to admin for severe traffic violations."
                        active={settings.smsAlerts}
                        onToggle={() => setSettings({ ...settings, smsAlerts: !settings.smsAlerts })}
                    />
                    <Toggle
                        label="Daily Email Reports"
                        description="Summary of traffic stats at 23:59 daily."
                        active={settings.emailAlerts}
                        onToggle={() => setSettings({ ...settings, emailAlerts: !settings.emailAlerts })}
                    />
                </Section>

                {/* System */}
                <Section icon={Server} title="System Maintenance">
                    <Toggle
                        label="Cloud Data Logging"
                        description="Sync all simulation data to the centralized cloud."
                        active={settings.dataLogging}
                        onToggle={() => setSettings({ ...settings, dataLogging: !settings.dataLogging })}
                    />
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                        <h4 className="text-red-400 font-bold text-sm mb-1">Danger Zone</h4>
                        <p className="text-xs text-red-400/70 mb-3">Resetting will clear all parking reservations and traffic history.</p>
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to reset all simulation data? This cannot be undone.")) {
                                    setLoading(true);
                                    setTimeout(() => window.location.reload(), 1000);
                                }
                            }}
                            className="px-4 py-2 bg-red-500/20 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Reset Simulation Data
                        </button>
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default Settings;
