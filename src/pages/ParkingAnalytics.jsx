import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, MapPin, DollarSign, Users, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

const ParkingAnalytics = () => {
    const [dateRange, setDateRange] = useState('week'); // week, month, year
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        // Generate mock analytics data
        const mockData = generateAnalyticsData(dateRange);
        setAnalytics(mockData);
    }, [dateRange]);

    if (!analytics) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Parking Analytics
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Insights and trends for parking usage</p>
                </div>

                {/* Date Range Selector */}
                <div className="flex gap-2">
                    {['week', 'month', 'year'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={clsx(
                                "px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize",
                                dateRange === range
                                    ? "bg-brand-blue text-brand-dark"
                                    : "bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    title="Total Bookings"
                    value={analytics.totalBookings}
                    change="+12%"
                    color="blue"
                />
                <StatCard
                    icon={DollarSign}
                    title="Revenue"
                    value={`₹${analytics.revenue.toFixed(0)}`}
                    change="+8%"
                    color="green"
                />
                <StatCard
                    icon={Clock}
                    title="Avg Duration"
                    value={`${analytics.avgDuration}h`}
                    change="-5%"
                    color="purple"
                />
                <StatCard
                    icon={TrendingUp}
                    title="Occupancy Rate"
                    value={`${analytics.occupancyRate}%`}
                    change="+15%"
                    color="yellow"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Peak Hours Chart */}
                <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-brand-blue" />
                        Peak Hours
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.peakHours}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="hour" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Bar dataKey="bookings" fill="#00f3ff" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Occupancy Trends */}
                <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-brand-green" />
                        Occupancy Trends
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.occupancyTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="day" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="occupancy"
                                stroke="#00ff9d"
                                strokeWidth={3}
                                dot={{ fill: '#00ff9d', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Zone Distribution & Vehicle Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Zone Heatmap */}
                <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-brand-purple" />
                        Busy Zones
                    </h3>
                    <div className="space-y-3">
                        {analytics.zoneData.map((zone, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-800 dark:text-white font-medium">{zone.name}</span>
                                    <span className="text-brand-blue font-bold">{zone.bookings} bookings</span>
                                </div>
                                <div className="w-full bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full transition-all duration-500"
                                        style={{ width: `${(zone.bookings / analytics.totalBookings) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vehicle Type Distribution */}
                <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Vehicle Type Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={analytics.vehicleTypes}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {analytics.vehicleTypes.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-brand-${color}/10 blur-xl group-hover:bg-brand-${color}/20 transition-all`}></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-xl bg-brand-${color}/10 text-brand-${color}`}>
                <Icon size={24} />
            </div>
            {change && (
                <div className={clsx(
                    "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                    change.startsWith('+') ? 'text-brand-green bg-brand-green/10' : 'text-brand-red bg-brand-red/10'
                )}>
                    <TrendingUp size={12} />
                    {change}
                </div>
            )}
        </div>

        <div className="relative z-10">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide">{title}</h3>
            <div className="text-3xl font-bold text-slate-800 dark:text-white mt-1 text-glow">{value}</div>
        </div>
    </div>
);

// Generate mock analytics data
const generateAnalyticsData = (range) => {
    const peakHours = [
        { hour: '6AM', bookings: 12 },
        { hour: '8AM', bookings: 45 },
        { hour: '10AM', bookings: 38 },
        { hour: '12PM', bookings: 52 },
        { hour: '2PM', bookings: 41 },
        { hour: '4PM', bookings: 48 },
        { hour: '6PM', bookings: 67 },
        { hour: '8PM', bookings: 35 },
    ];

    const occupancyTrend = [
        { day: 'Mon', occupancy: 65 },
        { day: 'Tue', occupancy: 72 },
        { day: 'Wed', occupancy: 68 },
        { day: 'Thu', occupancy: 78 },
        { day: 'Fri', occupancy: 85 },
        { day: 'Sat', occupancy: 92 },
        { day: 'Sun', occupancy: 58 },
    ];

    const zoneData = [
        { name: 'City Mall Parking', bookings: 245 },
        { name: 'Metro Station Lot', bookings: 189 },
        { name: 'Central Park Garage', bookings: 156 },
        { name: 'General Hospital', bookings: 134 },
        { name: 'Sports Stadium', bookings: 98 },
    ];

    const vehicleTypes = [
        { name: 'Car', value: 450, color: '#00f3ff' },
        { name: 'SUV', value: 180, color: '#bc13fe' },
        { name: 'Motorcycle', value: 120, color: '#00ff9d' },
        { name: 'Electric', value: 72, color: '#ffd700' },
    ];

    return {
        totalBookings: 822,
        revenue: 4567,
        avgDuration: 2.4,
        occupancyRate: 74,
        peakHours,
        occupancyTrend,
        zoneData,
        vehicleTypes,
    };
};

export default ParkingAnalytics;
