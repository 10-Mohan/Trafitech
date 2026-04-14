import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle2, CircleParking, Navigation, MapPin, Loader2 } from 'lucide-react';
import SlotGrid from '../components/parking/SlotGrid';
import RouteOptimizer from '../components/parking/RouteOptimizer';
import BookingModal from '../components/parking/BookingModal';
import PaymentModal from '../components/payment/PaymentModal';
import QRCodeGenerator from '../components/parking/QRCodeGenerator';
import { useNotifications } from '../components/notifications/NotificationSystem';
import { clsx } from 'clsx';
import { bookingAPI } from '../services/api';

// Calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const ParkingDashboard = () => {
    const notifications = useNotifications();
    const [userPosition, setUserPosition] = useState(null);
    const [locationStatus, setLocationStatus] = useState('loading');
    const [parkingSpots, setParkingSpots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedParkingZone, setSelectedParkingZone] = useState(null);
    const [showRoute, setShowRoute] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [completedBooking, setCompletedBooking] = useState(null);
    const [sortByDistance, setSortByDistance] = useState(true);

    // Dynamic Surge Pricing Logic
    const currentHour = new Date().getHours();
    // Peak hours: 9 AM - 11 AM and 5 PM - 7 PM
    const isPeakHour = (currentHour >= 9 && currentHour <= 11) || (currentHour >= 17 && currentHour <= 19);
    const surgeMultiplier = isPeakHour ? 1.5 : 1;

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setUserPosition([latitude, longitude]);
                    setLocationStatus('ready');

                    // Generate parking spots near user
                    const spots = [
                        {
                            id: 'mall',
                            pos: [latitude + 0.002, longitude + 0.002],
                            label: "City Mall Parking",
                            available: 12,
                            price: 50,
                            amenities: ['Covered', 'EV Charging', '24/7']
                        },
                        {
                            id: 'metro',
                            pos: [latitude - 0.0015, longitude + 0.001],
                            label: "Metro Station Lot",
                            available: 5,
                            price: 40,
                            amenities: ['Open Air', 'Security']
                        },
                        {
                            id: 'park',
                            pos: [latitude + 0.001, longitude - 0.002],
                            label: "Central Park Garage",
                            available: 18,
                            price: 45,
                            amenities: ['Covered', 'Security', 'Bike Parking']
                        },
                        {
                            id: 'hospital',
                            pos: [latitude + 0.003, longitude - 0.001],
                            label: "General Hospital",
                            available: 8,
                            price: 60,
                            amenities: ['Covered', 'Disabled Access']
                        },
                        {
                            id: 'stadium',
                            pos: [latitude - 0.002, longitude - 0.003],
                            label: "Sports Stadium",
                            available: 25,
                            price: 50,
                            amenities: ['Open Air', 'Large Vehicles']
                        },
                    ];

                    // Calculate distances and apply surge pricing
                    const spotsWithDistance = spots.map(spot => ({
                        ...spot,
                        originalPrice: spot.price,
                        price: Math.round(spot.price * surgeMultiplier),
                        distance: calculateDistance(latitude, longitude, spot.pos[0], spot.pos[1])
                    }));

                    setParkingSpots(spotsWithDistance);
                    setSelectedParkingZone(spotsWithDistance[0]);
                },
                (err) => {
                    console.error("Location access denied", err);
                    setLocationStatus('error');
                    // Fallback to default location (Bangalore)
                    const defaultPos = [12.9716, 77.5946];
                    setUserPosition(defaultPos);

                    const spots = [
                        { id: 'mall', pos: [12.9736, 77.5966], label: "City Mall Parking", available: 12, originalPrice: 50, price: Math.round(50 * surgeMultiplier), amenities: ['Covered', 'EV Charging'], distance: 0.3 },
                        { id: 'metro', pos: [12.9701, 77.5956], label: "Metro Station Lot", available: 5, originalPrice: 40, price: Math.round(40 * surgeMultiplier), amenities: ['Open Air'], distance: 0.2 },
                        { id: 'park', pos: [12.9726, 77.5926], label: "Central Park Garage", available: 18, originalPrice: 45, price: Math.round(45 * surgeMultiplier), amenities: ['Covered'], distance: 0.4 },
                    ];
                    setParkingSpots(spots);
                    setSelectedParkingZone(spots[0]);
                }
            );
        }
    }, []);

    // Update selected zone when spots are loaded (succcess case)
    useEffect(() => {
        if (parkingSpots.length > 0 && !selectedParkingZone) {
            setSelectedParkingZone(parkingSpots[0]);
        }
    }, [parkingSpots]);

    // Mock data generator for parking slots
    const generateSlots = (zoneId) => {
        // Use zoneId to create somewhat deterministic patterns if needed, 
        // or just random for now but refreshed on zone change
        const count = 24;
        return Array.from({ length: count }, (_, i) => {
            const isReserved = Math.random() > 0.8;
            const isOccupied = Math.random() > 0.6;
            // Ensure at least some are free
            const status = isReserved ? 'reserved' : isOccupied ? 'occupied' : 'free';

            return {
                id: `${zoneId}-${i + 1}`,
                title: `P-${i + 1}`,
                status: status,
                vehicleId: status !== 'free' ? `KA-0${Math.floor(Math.random() * 9)}-${1000 + i}` : null
            };
        });
    };

    const [slots, setSlots] = useState([]);

    // Update slots when zone changes
    useEffect(() => {
        if (selectedParkingZone) {
            setSlots(generateSlots(selectedParkingZone.id));
            setSelectedSlot(null); // Reset selection
        }
    }, [selectedParkingZone]);

    const [exitSlot, setExitSlot] = useState(null);

    const releaseSlot = () => {
        if (selectedSlot) {
            // Calculate random duration and price for demo
            const duration = Math.floor(Math.random() * 5) + 1; // 1-6 hours
            const price = selectedParkingZone?.price || 50;
            const amount = duration * price;

            setExitSlot({
                ...selectedSlot,
                duration,
                amount
            });
        }
    };

    const confirmExit = () => {
        if (exitSlot) {
            setSlots(slots.map(s => s.id === exitSlot.id ? { ...s, status: 'free', vehicleId: null } : s));

            notifications.success(
                'Payment Successful',
                `Paid ₹${exitSlot.amount} for ${exitSlot.duration} hours. Slot ${exitSlot.title} is now free.`
            );

            setExitSlot(null);
            setSelectedSlot(null);
        }
    };

    const handleSlotClick = (slot) => {
        setSelectedSlot(slot);
        setShowRoute(false);
    };

    const confirmBooking = () => {
        if (selectedSlot && selectedSlot.status === 'free') {
            // Open booking modal
            setShowBookingModal(true);
        }
    };

    const handleBookingConfirm = (booking) => {
        setCurrentBooking(booking);
        setShowBookingModal(false);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async (booking) => {
        try {
            // Save to backend
            await bookingAPI.create(booking);

            // Update slot status locally
            setSlots(slots.map(s => s.id === selectedSlot.id ? { ...s, status: 'reserved' } : s));
            setCompletedBooking(booking);
            setShowPaymentModal(false);

            notifications.success(
                'Booking Confirmed!',
                `Your parking slot ${selectedSlot.title} has been reserved successfully and saved to your account.`
            );
        } catch (err) {
            notifications.error('Booking Failed', err.message || 'Could not save booking to server.');
        }
    };

    const handleCloseQR = () => {
        setSelectedSlot(null);
        setCurrentBooking(null);
        setCompletedBooking(null);
    };

    const handleGetDirections = (spot) => {
        setSelectedParkingZone(spot);
        // setSelectedSlot({ ...selectedSlot, parkingSpot: spot }); // Don't auto-select slot, just zone
        setShowRoute(true);
    };

    const handleZoneSelect = (spot) => {
        setSelectedParkingZone(spot);
        setShowRoute(false);
    };

    // Sort parking spots by distance
    const sortedSpots = sortByDistance
        ? [...parkingSpots].sort((a, b) => a.distance - b.distance)
        : parkingSpots;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Smart Parking Zone</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Select an available slot to reserve.</p>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm font-medium">
                    {isPeakHour && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-full text-xs animate-pulse border border-red-500/30">
                            ⚡ High Demand: Surge Pricing Active (1.5x)
                        </div>
                    )}
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-green shadow-[0_0_10px_#22c55e]"></span> Available</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-red"></span> Occupied</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-yellow"></span> Reserved</div>
                    </div>
                </div>
            </div>

            {/* Location Status Banner */}
            <div className={clsx(
                "glass-panel p-4 rounded-xl flex items-center gap-3",
                locationStatus === 'ready' ? 'border-brand-green/20' : locationStatus === 'loading' ? 'border-brand-blue/20' : 'border-brand-red/20'
            )}>
                {locationStatus === 'loading' && <Loader2 size={20} className="animate-spin text-brand-blue" />}
                {locationStatus === 'ready' && <MapPin size={20} className="text-brand-green" />}
                {locationStatus === 'error' && <MapPin size={20} className="text-brand-red" />}
                <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {locationStatus === 'loading' && 'Detecting your location...'}
                        {locationStatus === 'ready' && 'Location detected'}
                        {locationStatus === 'error' && 'Location unavailable - Using default'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {locationStatus === 'ready' && `${parkingSpots.length} parking zones found nearby`}
                        {locationStatus === 'error' && 'Enable location for personalized results'}
                    </p>
                </div>
                {locationStatus === 'ready' && (
                    <button
                        onClick={() => setSortByDistance(!sortByDistance)}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                            sortByDistance ? 'bg-brand-blue text-brand-dark' : 'bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 text-slate-500 dark:text-slate-400'
                        )}
                    >
                        Sort by Distance
                    </button>
                )}
            </div>

            {/* Nearby Parking Zones */}
            {parkingSpots.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Navigation size={20} className="text-brand-blue" />
                        Nearby Parking Zones
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedSpots.map((spot) => (
                            <div
                                key={spot.id}
                                onClick={() => handleZoneSelect(spot)}
                                className={clsx(
                                    "p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                                    selectedParkingZone?.id === spot.id
                                        ? "bg-brand-blue/10 border-brand-blue shadow-[0_0_15px_rgba(0,243,255,0.2)]"
                                        : spot.available > 0
                                            ? "bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10  hover:bg-slate-50 dark:hover:bg-white/10 hover:border-brand-blue/50"
                                            : "bg-red-500/5 border-red-500/20 opacity-60"
                                )}
                            >
                                {selectedParkingZone?.id === spot.id && (
                                    <div className="absolute top-0 right-0 p-1.5 bg-brand-blue rounded-bl-xl">
                                        <CheckCircle2 size={12} className="text-brand-dark" />
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{spot.label}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                            <MapPin size={12} />
                                            {spot.distance.toFixed(1)} km away
                                        </p>
                                    </div>
                                    <div className={clsx(
                                        "px-2 py-1 rounded-full text-xs font-bold",
                                        spot.available > 0 ? "bg-brand-green/20 text-brand-green" : "bg-red-500/20 text-red-500"
                                    )}>
                                        {spot.available > 0 ? `${spot.available} Free` : 'Full'}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-3">
                                    {spot.amenities.map((amenity, idx) => (
                                        <span key={idx} className="text-[10px] px-2 py-1 bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-full text-slate-500 dark:text-slate-400">
                                            {amenity}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-brand-blue">₹{spot.price}/hr</span>
                                        {isPeakHour && <span className="text-[10px] text-red-400 uppercase font-bold">Surge Active</span>}
                                    </div>
                                    {spot.available > 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleGetDirections(spot);
                                            }}
                                            className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-lg hover:bg-brand-blue hover:text-brand-dark transition-all flex items-center gap-1"
                                        >
                                            <Navigation size={12} />
                                            Directions
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                <div className="lg:col-span-2 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedParkingZone && (
                        <div className="mb-4 flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                Slots at <span className="text-brand-blue">{selectedParkingZone.label}</span>
                            </h2>
                            <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-slate-500 dark:text-slate-400 font-mono">
                                Zone {selectedParkingZone.id.toUpperCase()}
                            </span>
                        </div>
                    )}
                    <SlotGrid slots={slots} onSlotClick={handleSlotClick} />
                </div>

                {/* Booking Panel */}
                <div className="space-y-4 overflow-y-auto custom-scrollbar">
                    {showRoute && selectedSlot?.parkingSpot && userPosition ? (
                        <RouteOptimizer
                            userPosition={userPosition}
                            parkingSpot={selectedSlot.parkingSpot}
                            onClose={() => setShowRoute(false)}
                        />
                    ) : (
                        <div className="glass-panel p-6 rounded-2xl h-fit">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
                                <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue">
                                    <CircleParking size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Booking Details</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Selected Slot Information</p>
                                </div>
                            </div>

                            {!selectedSlot ? (
                                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    <p>Click on a <span className="text-brand-green font-bold">Green</span> slot<br />to start booking.</p>
                                </div>
                            ) : selectedSlot.status === 'free' ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="flex justify-between items-center bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 p-4 rounded-lg">
                                        <span className="text-slate-500 dark:text-slate-400">Slot Number</span>
                                        <span className="text-2xl font-bold text-slate-800 dark:text-white">{selectedSlot.title}</span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                            <Calendar size={16} className="text-brand-purple" />
                                            <span>Today, 14:00 - 16:00</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                            <CreditCard size={16} className="text-brand-purple" />
                                            <span>₹{selectedParkingZone.price} / hr</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={confirmBooking}
                                        className="w-full py-3 mt-4 bg-brand-blue text-brand-dark font-bold rounded-xl hover:bg-brand-blue/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={20} />
                                        Book Now
                                    </button>

                                    <button
                                        onClick={() => setSelectedSlot(null)}
                                        className="w-full py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="flex justify-between items-center bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 p-4 rounded-lg">
                                        <span className="text-slate-500 dark:text-slate-400">Slot Number</span>
                                        <span className="text-2xl font-bold text-slate-800 dark:text-white">{selectedSlot.title}</span>
                                    </div>

                                    <div className="p-4 bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-xl space-y-2">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Current Status</p>
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "w-3 h-3 rounded-full",
                                                selectedSlot.status === 'occupied' ? "bg-brand-red" : "bg-brand-yellow"
                                            )}></span>
                                            <span className="text-slate-800 dark:text-white font-bold uppercase">{selectedSlot.status}</span>
                                        </div>
                                        {selectedSlot.vehicleId && (
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                                Vehicle: <span className="text-slate-800 dark:text-white font-mono">{selectedSlot.vehicleId}</span>
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={releaseSlot}
                                        className="w-full py-3 mt-4 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={20} />
                                        Release Slot (Clear)
                                    </button>

                                    <button
                                        onClick={() => setSelectedSlot(null)}
                                        className="w-full py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && selectedSlot && (
                <BookingModal
                    slot={selectedSlot}
                    parkingZone={selectedParkingZone}
                    onClose={() => setShowBookingModal(false)}
                    onConfirm={handleBookingConfirm}
                />
            )}

            {/* Payment Modal */}
            {showPaymentModal && currentBooking && (
                <PaymentModal
                    booking={currentBooking}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}

            {/* Exit/Release Payment Preview Modal */}
            {exitSlot && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel rounded-2xl p-6 max-w-sm w-full animate-in zoom-in-95">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard size={32} className="text-brand-blue" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Parking Fee</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Please pay to exit</p>
                        </div>

                        <div className="bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-xl p-4 space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Duration</span>
                                <span className="text-slate-800 dark:text-white font-medium">{exitSlot.duration} Hours</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Rate</span>
                                <span className="text-slate-800 dark:text-white font-medium">₹{selectedParkingZone?.price || 50}/hr</span>
                            </div>
                            <div className="flex justify-between text-sm pt-3 border-t border-slate-200 dark:border-white/10">
                                <span className="text-slate-200 font-bold">Total Amount</span>
                                <span className="text-xl font-bold text-brand-blue">₹{exitSlot.amount}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setExitSlot(null)}
                                className="flex-1 py-3 bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmExit}
                                className="flex-1 py-3 bg-brand-green text-brand-dark font-bold rounded-xl hover:bg-brand-green/90 transition-all flex items-center justify-center gap-2"
                            >
                                Pay & Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Display */}
            {completedBooking && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        <QRCodeGenerator
                            booking={completedBooking}
                            onClose={handleCloseQR}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParkingDashboard;
