import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, Award, Download, Leaf } from 'lucide-react';

const data = [
    { time: '08:00', vehicles: 400, parking: 240 },
    { time: '10:00', vehicles: 850, parking: 120 },
    { time: '12:00', vehicles: 1200, parking: 50 },
    { time: '14:00', vehicles: 980, parking: 180 },
    { time: '16:00', vehicles: 1100, parking: 90 },
    { time: '18:00', vehicles: 1400, parking: 20 },
    { time: '20:00', vehicles: 600, parking: 300 },
];

const co2ComparisonData = [
    { day: 'Mon', cpuEmissions: 1420, gpuEmissions: 980 },
    { day: 'Tue', cpuEmissions: 1480, gpuEmissions: 910 },
    { day: 'Wed', cpuEmissions: 1530, gpuEmissions: 950 },
    { day: 'Thu', cpuEmissions: 1390, gpuEmissions: 840 },
    { day: 'Fri', cpuEmissions: 1610, gpuEmissions: 1020 },
    { day: 'Sat', cpuEmissions: 1100, gpuEmissions: 680 },
    { day: 'Sun', cpuEmissions: 1050, gpuEmissions: 620 },
];

const parkingStats = [
    { name: 'Zone A', filled: 80, empty: 20 },
    { name: 'Zone B', filled: 45, empty: 55 },
    { name: 'Zone C', filled: 90, empty: 10 },
    { name: 'Zone D', filled: 30, empty: 70 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-brand-dark/95 p-3 rounded-lg border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-md text-xs">
                <p className="text-slate-600 dark:text-slate-300 font-bold mb-2">{label}</p>
                {payload.map((p, index) => (
                    <div key={index} className="text-sm font-semibold" style={{ color: p.color }}>
                        {p.name}: <span className="font-bold">{p.value} {p.name.includes('Emissions') ? 'kg' : ''}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const Analytics = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">System Analytics</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Data insights for urban planning optimization.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg text-sm text-slate-600 dark:text-slate-300 transition-colors">
                    <Download size={16} />
                    Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Traffic Trend */}
                <div className="glass-panel p-6 rounded-2xl col-span-1 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-brand-blue" />
                            Traffic vs Parking Trends (24h)
                        </h3>
                        <div className="flex gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-brand-blue/10 text-brand-blue font-bold">Traffic Flow</span>
                            <span className="text-xs px-2 py-1 rounded bg-brand-purple/10 text-brand-purple font-bold">Parking Availability</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="vehicles"
                                    name="Vehicles Count"
                                    stroke="#00f3ff"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#0a0f1c', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#00f3ff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="parking"
                                    name="Available Spots"
                                    stroke="#bc13fe"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#0a0f1c', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#bc13fe' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* GPU vs CPU Carbon Offset Area Chart */}
                <div className="glass-panel p-6 rounded-2xl col-span-1 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Leaf size={20} className="text-brand-green" />
                            GPU Autopilot vs CPU Carbon Offset Analysis (Weekly)
                        </h3>
                        <div className="flex gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-slate-500/10 text-slate-400 font-bold">CPU Scheduling</span>
                            <span className="text-xs px-2 py-1 rounded bg-brand-green/10 text-brand-green font-bold">GPU Autopilot</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                        Compares total simulated CO₂ emissions generated under standard timer signal plans (CPU) against real-time queue length optimizations (NVIDIA cuDF Autopilot).
                    </p>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={co2ComparisonData}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorGpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="cpuEmissions"
                                    name="CPU Emissions"
                                    stroke="#64748b"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorCpu)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="gpuEmissions"
                                    name="GPU Emissions"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorGpu)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Parking Zone Distribution */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Parking Zone Occupancy</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={parkingStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#64748b" hide />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="filled" name="Occupied" stackId="a" fill="#00ff9d" radius={[0, 4, 4, 0]} barSize={20} />
                                <Bar dataKey="empty" name="Empty" stackId="a" fill="#334155" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Environmental Impact Card (SDG Alignment) */}
                <div className="glass-panel p-6 rounded-2xl border border-brand-green/20">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Award size={20} className="text-brand-green" />
                        Sustainability Impact
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-brand-green/5">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">CO2 Reduction</span>
                            <span className="text-xl font-bold text-brand-green">12.5%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-brand-green/5">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">Fuel Saved (Estimated)</span>
                            <span className="text-xl font-bold text-brand-green">840 Gal</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            *Based on traffic flow optimization reducing idle time at signals.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
