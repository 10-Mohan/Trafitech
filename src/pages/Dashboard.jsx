import React from 'react';
import { Activity, Car, CircleParking, AlertTriangle, TrendingUp, Award, MapPin, Navigation } from 'lucide-react';
import LiveCityMap from '../components/traffic/LiveCityMap';
import { useNotifications } from '../components/notifications/NotificationSystem';

const StatCard = ({ icon: Icon, title, value, subtext, color, trend }) => (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-brand-blue/10 blur-xl group-hover:bg-brand-blue/20 transition-all`}></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-xl bg-brand-blue/10 text-brand-blue`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-xs font-semibold text-brand-green bg-brand-green/10 px-2 py-1 rounded-full">
                    <TrendingUp size={12} /> {trend}
                </div>
            )}
        </div>

        <div className="relative z-10">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide">{title}</h3>
            <div className="text-3xl font-bold text-slate-800 dark:text-white mt-1 text-glow">{value}</div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">{subtext}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const [time, setTime] = React.useState(new Date());
    const { success, info } = useNotifications();

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">City Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time monitoring system active</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Current Time</p>
                    <p className="text-xl font-mono text-brand-blue">{time.toLocaleTimeString()}</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                <StatCard
                    icon={Award}
                    title="Loyalty Points"
                    value="1,450"
                    subtext="Gold Tier Member"
                    color="yellow"
                    trend="+150"
                />
                <StatCard
                    icon={Activity}
                    title="Avg. Traffic Density"
                    value="42%"
                    subtext="Moderate flow - Main St."
                    color="blue"
                    trend="+5%"
                />
                <StatCard
                    icon={CircleParking}
                    title="Parking Available"
                    value="128"
                    subtext="Total slots: 500"
                    color="purple"
                    trend="-12 spots"
                />
                <StatCard
                    icon={Car}
                    title="Active Vehicles"
                    value="1,245"
                    subtext="Detected across 12 zones"
                    color="green"
                />
                <StatCard
                    icon={AlertTriangle}
                    title="Active Alerts"
                    value="3"
                    subtext="2 Congestion, 1 Violation"
                    color="red"
                />
            </div>

            {/* Main Visual Area Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[30rem]">
                <div className="lg:col-span-2 glass-panel rounded-2xl p-1 relative overflow-hidden h-full flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2 bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 border-b border-slate-100 dark:border-white/5">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide uppercase flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            Live Traffic Feed
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Cam-01 • Main Intersection</span>
                    </div>
                    <div className="flex-1 relative h-full">
                        <LiveCityMap />
                    </div>
                </div>

                <div className="flex flex-col gap-6 h-full overflow-hidden">
                    <div className="glass-panel rounded-2xl p-6 flex-1 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Recent Alerts</h3>
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 border-l-2 border-brand-red border-l-red-500">
                                    <AlertTriangle size={16} className="text-red-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-slate-200 font-medium">Congestion Detected</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Zone A-12 • {i * 2} mins ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-5 border border-brand-blue/20 bg-brand-blue/5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-md font-semibold text-brand-blue flex items-center gap-2">
                                <MapPin size={18} /> Find My Car
                            </h3>
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Parked at 09:14 AM</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Central Plaza • Zone B-04</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">~200m walking distance</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => success('Navigation Started', 'GPS route to Zone B-04 synced to your device.')}
                                className="flex-1 bg-brand-blue hover:bg-brand-blue/80 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <Navigation size={14} /> Navigate
                            </button>
                            <button
                                onClick={() => info('Session Extended', 'Parking session manually extended by 1 hour. Wallet charged ₹50.')}
                                className="flex-1 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                Extend
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

