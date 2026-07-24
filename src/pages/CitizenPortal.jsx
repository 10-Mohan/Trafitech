import React, { useState } from 'react';
import { Smartphone, Zap, Award, QrCode, TrendingDown, Leaf, History, CreditCard } from 'lucide-react';
import { clsx } from 'clsx';

const CitizenPortal = () => {
  const [activeTab, setActiveTab] = useState('wallet');

  // Simulated Eco-Credits achievements
  const achievements = [
    { title: 'Eco Navigator', desc: 'Used automated route optimization to avoid gridlocks.', points: '+500 pts', icon: Leaf, color: 'text-brand-green bg-brand-green/10' },
    { title: 'Off-Peak Commuter', desc: 'Parked during off-peak hours (12 PM - 3 PM).', points: '+350 pts', icon: TrendingDown, color: 'text-brand-blue bg-brand-blue/10' },
    { title: 'Charge Master', desc: 'Completed 5 EV charging slot sessions.', points: '+800 pts', icon: Zap, color: 'text-brand-purple bg-brand-purple/10' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          Citizen Companion App
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Simulated mobile app interface for drivers. Earn Eco-Credits and manage active parking passes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Mobile Device Mockup Frame */}
        <div className="flex justify-center">
          <div className="relative w-[340px] h-[640px] bg-slate-900 rounded-[48px] border-[8px] border-slate-800 dark:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
            
            {/* Speaker/Camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
            </div>

            {/* Mobile Header status bar */}
            <div className="pt-8 px-6 pb-2 flex justify-between items-center text-[10px] text-slate-400 font-mono select-none">
              <span>9:41 AM</span>
              <div className="flex gap-1.5 items-center">
                <span>5G</span>
                <span className="w-4 h-2 bg-slate-400 rounded-xs"></span>
              </div>
            </div>

            {/* Mobile Body Content */}
            <div className="flex-1 px-5 overflow-y-auto custom-scrollbar space-y-4 pb-20">
              
              {/* Profile Card / Eco Credits */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 border border-white/10 text-center space-y-2 mt-2">
                <p className="text-[10px] text-brand-blue uppercase tracking-widest font-black">Citizen Wallet</p>
                <h3 className="text-3xl font-black text-white tracking-tight">2,450</h3>
                <p className="text-[10px] text-slate-400">Total Eco-Credits Earned</p>
                
                <div className="flex items-center gap-1.5 justify-center py-1.5 px-3 bg-white/5 rounded-full border border-white/5 w-fit mx-auto text-[10px] text-brand-green font-bold">
                  <Leaf size={12} />
                  <span>Offsets: 18.4 kg CO₂</span>
                </div>
              </div>

              {/* Tabs Selector inside App */}
              <div className="grid grid-cols-3 gap-1 bg-white/5 border border-white/5 p-1 rounded-xl text-center">
                <button
                  onClick={() => setActiveTab('wallet')}
                  className={clsx(
                    "py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    activeTab === 'wallet' ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
                  )}
                >
                  Passes
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={clsx(
                    "py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    activeTab === 'achievements' ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
                  )}
                >
                  Badges
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={clsx(
                    "py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    activeTab === 'history' ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
                  )}
                >
                  EV Log
                </button>
              </div>

              {/* Tab: Wallet Passes */}
              {activeTab === 'wallet' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <p className="text-[11px] font-bold text-slate-400">Active Digital QR Pass</p>
                  
                  <div className="p-4 rounded-2xl bg-white text-slate-800 space-y-4 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-sm tracking-tight leading-none text-slate-800">City Mall Parking</h4>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">Slot P-12 (EV)</span>
                      </div>
                      <span className="px-2 py-0.5 bg-brand-green/20 text-brand-green rounded text-[8px] font-bold uppercase">CONFIRMED</span>
                    </div>

                    <div className="flex justify-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        {/* Mock QR graphic representation */}
                        <QrCode size={120} className="text-slate-800" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono border-t border-slate-100 pt-3">
                      <span>Rate: ₹75/hr</span>
                      <span>Pass ID: TX-87291-C</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Achievements Badges */}
              {activeTab === 'achievements' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <p className="text-[11px] font-bold text-slate-400">Eco badges unlocked</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                      <Award size={24} className="mx-auto text-brand-yellow" />
                      <p className="text-[10px] font-bold text-white">Green Navigator</p>
                      <p className="text-[8px] text-slate-500">Completed 10 optimized trips</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                      <Award size={24} className="mx-auto text-brand-blue" />
                      <p className="text-[10px] font-bold text-white">Gridlock Dodger</p>
                      <p className="text-[8px] text-slate-500">Avoided 5 bottleneck zones</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: EV charging session logs */}
              {activeTab === 'history' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <p className="text-[11px] font-bold text-slate-400">EV charging receipts</p>
                  
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Session #EV-803</span>
                      <span>Yesterday</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-white">Central Garage</p>
                        <p className="text-[9px] text-slate-500">18.4 kWh consumed</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-brand-blue">₹220.80</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Mobile Footer Navigation Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 dark:border-white/5 flex items-center justify-around text-slate-500 z-50">
              <Smartphone size={20} className="text-brand-blue" />
              <History size={20} />
              <CreditCard size={20} />
            </div>

          </div>
        </div>

        {/* Dashboard Side Details */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <Award size={20} className="text-brand-yellow" />
              Eco-Credits Incentive Engine
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              TraffiTech uses gamified loyalty points (Eco-Credits) to encourage citizens to make sustainable transportation decisions. Points are earned by picking off-peak parking times, charging electric vehicles, and choosing AI-optimized routes.
            </p>

            <div className="space-y-3">
              {achievements.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className={clsx("p-2 rounded-lg", item.color)}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-brand-green">{item.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CitizenPortal;
