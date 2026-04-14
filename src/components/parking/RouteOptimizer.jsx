import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Clock, TrendingUp, Route, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// Generate turn-by-turn directions
const generateDirections = (userPos, parkingPos, parkingName) => {
    const distance = calculateDistance(userPos[0], userPos[1], parkingPos[0], parkingPos[1]);
    const bearing = Math.atan2(
        parkingPos[1] - userPos[1],
        parkingPos[0] - userPos[0]
    ) * 180 / Math.PI;

    // Determine cardinal direction
    let direction = 'north';
    if (bearing >= -45 && bearing < 45) direction = 'east';
    else if (bearing >= 45 && bearing < 135) direction = 'north';
    else if (bearing >= 135 || bearing < -135) direction = 'west';
    else direction = 'south';

    // Generate realistic directions
    const steps = [
        { instruction: 'Head ' + direction + ' on your current road', distance: 0.1, icon: '🚗' },
        { instruction: 'Continue straight for ' + (distance * 0.4).toFixed(1) + ' km', distance: distance * 0.4, icon: '⬆️' },
        { instruction: 'Turn right onto Main Street', distance: distance * 0.3, icon: '➡️' },
        { instruction: 'Turn left at the traffic signal', distance: distance * 0.2, icon: '⬅️' },
        { instruction: `Arrive at ${parkingName}`, distance: distance * 0.1, icon: '🎯' }
    ];

    return steps;
};

const RouteOptimizer = ({ userPosition, parkingSpot, onClose }) => {
    const [route, setRoute] = useState(null);
    const [isCalculating, setIsCalculating] = useState(true);

    useEffect(() => {
        if (userPosition && parkingSpot) {
            setIsCalculating(true);

            // Simulate route calculation
            setTimeout(() => {
                const distance = calculateDistance(
                    userPosition[0], userPosition[1],
                    parkingSpot.pos[0], parkingSpot.pos[1]
                );

                const avgSpeed = 30; // km/h in city traffic
                const estimatedTime = (distance / avgSpeed) * 60; // minutes

                const directions = generateDirections(userPosition, parkingSpot.pos, parkingSpot.label);

                setRoute({
                    distance: distance,
                    duration: estimatedTime,
                    directions: directions,
                    trafficLevel: Math.random() > 0.5 ? 'moderate' : 'light'
                });

                setIsCalculating(false);
            }, 1500);
        }
    }, [userPosition, parkingSpot]);

    if (!parkingSpot) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue">
                            <Navigation size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Route to Parking</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{parkingSpot.label}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {isCalculating ? (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-blue/20 border-t-brand-blue mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Calculating optimal route...</p>
                    </div>
                ) : route ? (
                    <div className="space-y-6">
                        {/* Route Summary */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-xl p-4 text-center">
                                <MapPin size={20} className="text-brand-purple mx-auto mb-2" />
                                <div className="text-2xl font-bold text-slate-800 dark:text-white">{route.distance.toFixed(1)}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">km</div>
                            </div>
                            <div className="bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-xl p-4 text-center">
                                <Clock size={20} className="text-brand-green mx-auto mb-2" />
                                <div className="text-2xl font-bold text-slate-800 dark:text-white">{Math.ceil(route.duration)}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">mins</div>
                            </div>
                            <div className="bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-xl p-4 text-center">
                                <TrendingUp size={20} className="text-brand-yellow mx-auto mb-2" />
                                <div className={clsx(
                                    "text-sm font-bold uppercase",
                                    route.trafficLevel === 'light' ? 'text-brand-green' : 'text-brand-yellow'
                                )}>
                                    {route.trafficLevel}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Traffic</div>
                            </div>
                        </div>

                        {/* Alternative Route Info */}
                        <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Route size={16} className="text-brand-blue" />
                                <span className="text-sm font-bold text-brand-blue">Fastest Route</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                Via Main Street • Avoiding construction on 5th Avenue
                            </p>
                        </div>

                        {/* Turn-by-Turn Directions */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
                                Turn-by-Turn Directions
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                {route.directions.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                            {step.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-800 dark:text-white font-medium">{step.instruction}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {step.distance.toFixed(1)} km • {Math.ceil(step.distance / 30 * 60)} min
                                            </p>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-600 dark:text-slate-300 group-hover:text-brand-blue transition-colors flex-shrink-0 mt-1" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                            <button className="flex-1 py-3 bg-brand-blue text-brand-dark font-bold rounded-xl hover:bg-brand-blue/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                <Navigation size={18} />
                                Start Navigation
                            </button>
                            <button className="px-6 py-3 bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-white font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                                Share
                            </button>
                        </div>
                    </div>
                ) : null}
            </motion.div>
        </AnimatePresence>
    );
};

export default RouteOptimizer;
