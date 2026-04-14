import React, { useState, useEffect } from 'react';
import { History, Calendar, MapPin, Clock, Car, DollarSign, X, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { bookingAPI } from '../../services/api';

const BookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const data = await bookingAPI.getAll();
                setBookings(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const getBookingStatus = (booking) => {
        const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
        const now = new Date();

        if (booking.cancelled) return 'cancelled';
        if (bookingDateTime > now) return 'upcoming';
        return 'completed';
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return getBookingStatus(booking) === filter;
    });

    const cancelBooking = (bookingId) => {
        const updatedBookings = bookings.map(b =>
            b.bookingId === bookingId ? { ...b, cancelled: true } : b
        );
        setBookings(updatedBookings);
        localStorage.setItem('parkingBookings', JSON.stringify(updatedBookings));
    };

    const statusConfig = {
        upcoming: { color: 'brand-blue', label: 'Upcoming', bg: 'bg-brand-blue/10', border: 'border-brand-blue/20' },
        completed: { color: 'brand-green', label: 'Completed', bg: 'bg-brand-green/10', border: 'border-brand-green/20' },
        cancelled: { color: 'brand-red', label: 'Cancelled', bg: 'bg-brand-red/10', border: 'border-brand-red/20' }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-purple/10 rounded-xl text-brand-purple">
                        <History size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Booking History</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{bookings.length} total bookings</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { value: 'all', label: 'All Bookings' },
                    { value: 'upcoming', label: 'Upcoming' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' }
                ].map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={clsx(
                            "px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                            filter === tab.value
                                ? "bg-brand-blue text-brand-dark"
                                : "bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            {loading ? (
                <div className="glass-panel rounded-2xl p-12 text-center animate-pulse">
                    <Loader2 size={48} className="mx-auto text-blue-500 mb-4 animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Fetching your bookings...</p>
                </div>
            ) : error ? (
                <div className="glass-panel rounded-2xl p-12 text-center border-red-500/20">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <p className="text-red-400 font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <History size={48} className="mx-auto text-slate-600 dark:text-slate-300 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No bookings found</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Your booking history will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.reverse().map((booking, index) => {
                        const status = getBookingStatus(booking);
                        const config = statusConfig[status];

                        return (
                            <motion.div
                                key={booking.bookingId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={clsx(
                                    "glass-panel rounded-xl p-5 border",
                                    config.border
                                )}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("p-2 rounded-lg", config.bg)}>
                                            <Calendar size={20} className={`text-${config.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white">{booking.parkingZone?.label || 'Parking Zone'}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Booking ID: {booking.bookingId}</p>
                                        </div>
                                    </div>
                                    <span className={clsx(
                                        "px-3 py-1 rounded-full text-xs font-bold",
                                        config.bg,
                                        `text-${config.color}`
                                    )}>
                                        {config.label}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                            <MapPin size={12} />
                                            Slot
                                        </p>
                                        <p className="text-slate-800 dark:text-white font-bold">{booking.slot?.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                            <Calendar size={12} />
                                            Date
                                        </p>
                                        <p className="text-slate-800 dark:text-white font-bold">
                                            {new Date(booking.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                            <Clock size={12} />
                                            Time
                                        </p>
                                        <p className="text-slate-800 dark:text-white font-bold">
                                            {booking.startTime} - {booking.endTime}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                            <Car size={12} />
                                            Vehicle
                                        </p>
                                        <p className="text-slate-800 dark:text-white font-bold">{booking.vehicleNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-brand-blue">
                                            ₹{booking.totalPrice?.toFixed(0)}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            ({booking.duration}h)
                                        </span>
                                    </div>

                                    {status === 'upcoming' && !booking.cancelled && (
                                        <button
                                            onClick={() => cancelBooking(booking.bookingId)}
                                            className="px-4 py-2 bg-red-500/10 text-red-500 text-sm font-medium rounded-lg hover:bg-red-500/20 transition-all"
                                        >
                                            Cancel Booking
                                        </button>
                                    )}

                                    {status === 'completed' && (
                                        <button className="px-4 py-2 bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-2">
                                            View Receipt
                                            <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BookingHistory;
