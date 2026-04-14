import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const SlotGrid = ({ slots, onSlotClick }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {slots.map((slot) => (
                <motion.button
                    key={slot.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSlotClick(slot)}
                    className={clsx(
                        "aspect-[3/4] rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-300 relative overflow-hidden group",
                        slot.status === 'free'
                            ? "bg-brand-green/10 border-brand-green/30 hover:bg-brand-green/20"
                            : slot.status === 'occupied'
                                ? "bg-brand-red/10 border-brand-red/30 hover:bg-brand-red/20 opacity-90"
                                : "bg-brand-yellow/10 border-brand-yellow/30 hover:bg-brand-yellow/20" // Reserved
                    )}
                >
                    {/* Status Indicator Glow */}
                    <div className={clsx(
                        "absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity",
                        slot.status === 'free' ? "bg-gradient-to-b from-transparent to-brand-green" :
                            slot.status === 'occupied' ? "bg-gradient-to-b from-transparent to-brand-red" :
                                "bg-gradient-to-b from-transparent to-brand-yellow"
                    )}></div>

                    <span className={clsx(
                        "text-2xl font-bold z-10",
                        slot.status === 'free' ? "text-brand-green drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]" :
                            slot.status === 'occupied' ? "text-brand-red" :
                                "text-brand-yellow"
                    )}>
                        {slot.title}
                    </span>

                    <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-2 z-10 font-medium">
                        {slot.status}
                    </span>

                    {slot.status === 'occupied' && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">Occupied<br />{slot.vehicleId || '---'}</span>
                        </div>
                    )}
                </motion.button>
            ))}
        </div>
    );
};

export default SlotGrid;
