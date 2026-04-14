import React, { useState } from 'react';
import { X, Calendar, Clock, DollarSign, Car, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const BookingModal = ({ slot, parkingZone, onClose, onConfirm }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState('14:00');
    const [duration, setDuration] = useState(2); // hours
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [vehicleType, setVehicleType] = useState('car');
    const [step, setStep] = useState(1); // 1: Details, 2: Confirmation

    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

    const durations = [
        { value: 1, label: '1 Hour', price: parkingZone?.price || 50 },
        { value: 2, label: '2 Hours', price: (parkingZone?.price || 50) * 2 },
        { value: 4, label: '4 Hours', price: (parkingZone?.price || 50) * 4 },
        { value: 8, label: 'Full Day', price: (parkingZone?.price || 50) * 8 * 0.9 }, // 10% discount
    ];

    const vehicleTypes = [
        { value: 'car', label: 'Car', icon: '🚗' },
        { value: 'suv', label: 'SUV', icon: '🚙' },
        { value: 'bike', label: 'Motorcycle', icon: '🏍️' },
        { value: 'ev', label: 'Electric', icon: '⚡' },
    ];

    const calculateEndTime = () => {
        const [hours, minutes] = selectedTime.split(':');
        const endHour = (parseInt(hours) + duration) % 24;
        return `${endHour.toString().padStart(2, '0')}:${minutes}`;
    };

    const totalPrice = durations.find(d => d.value === duration)?.price || 0;

    const handleNext = () => {
        if (!vehicleNumber.trim()) {
            alert('Please enter vehicle number');
            return;
        }
        setStep(2);
    };

    const handleConfirm = () => {
        const booking = {
            slot: slot,
            parkingZone: parkingZone,
            date: selectedDate,
            startTime: selectedTime,
            endTime: calculateEndTime(),
            duration: duration,
            vehicleNumber: vehicleNumber,
            vehicleType: vehicleType,
            totalPrice: totalPrice,
            bookingId: `BK${Date.now()}`,
            timestamp: new Date().toISOString()
        };

        // Save to localStorage
        const existingBookings = JSON.parse(localStorage.getItem('parkingBookings') || '[]');
        existingBookings.push(booking);
        localStorage.setItem('parkingBookings', JSON.stringify(existingBookings));

        onConfirm(booking);
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-panel rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {step === 1 ? 'Book Parking Slot' : 'Confirm Booking'}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {parkingZone?.label || 'Parking Zone'} • Slot {slot?.title}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-lg transition-colors"
                        >
                            <X size={24} className="text-slate-500 dark:text-slate-400" />
                        </button>
                    </div>

                    {step === 1 ? (
                        <div className="space-y-6">
                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-wider">
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 border  rounded-xl text-slate-800 dark:text-white focus:border-brand-blue focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Time Slot Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-800 dark:text-white mb-3 uppercase tracking-wider">
                                    Select Time Slot
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {timeSlots.map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={clsx(
                                                "px-4 py-2 rounded-lg font-medium transition-all",
                                                selectedTime === time
                                                    ? "bg-brand-blue text-brand-dark"
                                                    : "bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
                                            )}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-800 dark:text-white mb-3 uppercase tracking-wider">
                                    Parking Duration
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {durations.map((d) => (
                                        <button
                                            key={d.value}
                                            onClick={() => setDuration(d.value)}
                                            className={clsx(
                                                "p-4 rounded-xl border-2 transition-all text-left",
                                                duration === d.value
                                                    ? "border-brand-blue bg-brand-blue/10"
                                                    : "border-slate-200 dark:border-white/10 bg-white shadow-sm border  hover:border-white/20"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-slate-800 dark:text-white font-bold">{d.label}</span>
                                                <Clock size={16} className="text-brand-blue" />
                                            </div>
                                            <div className="text-2xl font-bold text-brand-blue">
                                                ₹{d.price.toFixed(0)}
                                            </div>
                                            {d.value === 8 && (
                                                <span className="text-xs text-brand-green">10% discount</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Vehicle Type */}
                            <div>
                                <label className="block text-sm font-bold text-slate-800 dark:text-white mb-3 uppercase tracking-wider">
                                    Vehicle Type
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {vehicleTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => setVehicleType(type.value)}
                                            className={clsx(
                                                "p-3 rounded-xl border transition-all",
                                                vehicleType === type.value
                                                    ? "border-brand-blue bg-brand-blue/10"
                                                    : "border-slate-200 dark:border-white/10 bg-white shadow-sm border  hover:border-white/20"
                                            )}
                                        >
                                            <div className="text-2xl mb-1">{type.icon}</div>
                                            <div className="text-xs text-slate-800 dark:text-white font-medium">{type.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Vehicle Number */}
                            <div>
                                <label className="block text-sm font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-wider">
                                    Vehicle Number
                                </label>
                                <div className="relative">
                                    <Car size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                                    <input
                                        type="text"
                                        value={vehicleNumber}
                                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                                        placeholder="e.g., KA-01-AB-1234"
                                        className="w-full pl-12 pr-4 py-3 bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 border  rounded-xl text-slate-800 dark:text-white placeholder-slate-500 focus:border-brand-blue focus:outline-none transition-colors uppercase"
                                    />
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-xl p-4">
                                <h3 className="text-sm font-bold text-brand-blue mb-3 uppercase tracking-wider">
                                    Booking Summary
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                        <span>Date & Time:</span>
                                        <span className="text-slate-800 dark:text-white font-medium">
                                            {new Date(selectedDate).toLocaleDateString()} • {selectedTime} - {calculateEndTime()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                        <span>Duration:</span>
                                        <span className="text-slate-800 dark:text-white font-medium">{duration} hour{duration > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-white/10">
                                        <span className="font-bold">Total Amount:</span>
                                        <span className="text-2xl font-bold text-brand-blue">                                        ₹{totalPrice.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleNext}
                                className="w-full py-4 bg-brand-blue text-brand-dark font-bold rounded-xl hover:bg-brand-blue/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                Continue to Payment
                                <CheckCircle2 size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Confirmation Details */}
                            <div className="bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-xl p-6 space-y-4">
                                <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
                                    <CheckCircle2 size={24} className="text-brand-green" />
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Booking Details</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Parking Zone</p>
                                        <p className="text-slate-800 dark:text-white font-bold">{parkingZone?.label}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Slot Number</p>
                                        <p className="text-slate-800 dark:text-white font-bold">{slot?.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Date</p>
                                        <p className="text-slate-800 dark:text-white font-bold">{new Date(selectedDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Time</p>
                                        <p className="text-slate-800 dark:text-white font-bold">{selectedTime} - {calculateEndTime()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Vehicle</p>
                                        <p className="text-slate-800 dark:text-white font-bold">{vehicleNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Type</p>
                                        <p className="text-slate-800 dark:text-white font-bold capitalize">{vehicleType}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 dark:text-slate-400">Total Amount</span>
                                        <span className="text-3xl font-bold text-brand-blue">                                        ₹{totalPrice.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Important Notice */}
                            <div className="bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl p-4 flex gap-3">
                                <AlertCircle size={20} className="text-brand-yellow flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                    <p className="font-bold text-slate-800 dark:text-white mb-1">Important Information</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li>Please arrive within 15 minutes of your booking time</li>
                                        <li>Cancellation allowed up to 1 hour before booking</li>
                                        <li>Keep your booking ID for entry verification</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-white font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 py-3 bg-brand-green text-brand-dark font-bold rounded-xl hover:bg-brand-green/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={20} />
                                    Confirm Booking
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BookingModal;
