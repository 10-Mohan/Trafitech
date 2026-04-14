
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { divIcon } from 'leaflet';
import { clsx } from 'clsx';
import { LocateFixed, Loader2 } from 'lucide-react';

// Fix Leaflet issue completely
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: iconMarker,
    shadowUrl: iconShadow,
});

// Custom Marker Generator
const customIcon = (type) => {
    let colorClass = 'bg-blue-500';
    let shadowClass = 'shadow-blue-500/50';

    if (type === 'red') { colorClass = 'bg-red-500'; shadowClass = 'shadow-red-500/50'; }
    if (type === 'green') { colorClass = 'bg-green-500'; shadowClass = 'shadow-green-500/50'; }
    if (type === 'parking') { colorClass = 'bg-purple-500'; shadowClass = 'shadow-purple-500/50'; }
    if (type === 'user') { colorClass = 'bg-brand-blue animate-pulse'; shadowClass = 'shadow-brand-blue/50'; }

    return divIcon({
        className: 'custom-icon',
        html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-lg ${colorClass} ${shadowClass}"></div>`,
        iconSize: [16, 16]
    });
};

// Component to recenter map when position changes
const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(position, 15);
    }, [position, map]);
    return null;
};

const LiveCityMap = () => {
    const [userPosition, setUserPosition] = useState([12.9716, 77.5946]); // Default: Bangalore
    const [parkingSpots, setParkingSpots] = useState([]);
    const [status, setStatus] = useState('initializing'); // initializing, locating, ready, error

    useEffect(() => {
        setStatus('locating');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = [latitude, longitude];
                    setUserPosition(newPos);
                    setStatus('ready');

                    // Generate "Nearby" parking spots based on real location
                    setParkingSpots([
                        { id: 'p1', pos: [latitude + 0.002, longitude + 0.002], label: "Mall Parking", available: 12 },
                        { id: 'p2', pos: [latitude - 0.0015, longitude + 0.001], label: "Metro Station", available: 5 },
                        { id: 'p3', pos: [latitude + 0.001, longitude - 0.002], label: "Public Park Lot", available: 0 }, // Full
                    ]);
                },
                (err) => {
                    console.error("Location access denied", err);
                    setStatus('error');
                }
            );
        } else {
            setStatus('error');
        }
    }, []);

    const trafficPoints = [
        { id: 1, pos: [userPosition[0] + 0.001, userPosition[1] + 0.001], status: 'red', label: "Junction A" },
        { id: 2, pos: [userPosition[0] - 0.002, userPosition[1] - 0.001], status: 'green', label: "Junction B" },
    ];

    return (
        <div className="w-full h-96 min-h-[400px] rounded-xl overflow-hidden relative z-0 bg-slate-900 ring-1 ring-white/10">
            {/* Map Container */}
            <MapContainer center={userPosition} zoom={15} scrollWheelZoom={true} className="w-full h-full" style={{ background: '#0f172a', height: '100%', minHeight: '400px', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap position={userPosition} />

                {/* User Location */}
                <Marker position={userPosition} icon={customIcon('user')}>
                    <Popup className="glass-popup"><div className="text-brand-blue font-bold">You are Here</div></Popup>
                </Marker>
                <Circle center={userPosition} radius={500} pathOptions={{ color: '#00f3ff', fillColor: '#00f3ff', fillOpacity: 0.1 }} />

                {/* Traffic Signals */}
                {trafficPoints.map(point => (
                    <Marker key={point.id} position={point.pos} icon={customIcon(point.status)}>
                        <Popup className="glass-popup">
                            <div className="text-slate-900 font-bold">{point.label}</div>
                            <div className={clsx("text-xs font-bold uppercase", point.status === 'red' ? "text-red-600" : "text-green-600")}>
                                Signal: {point.status}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Parking Spots */}
                {parkingSpots.map(spot => (
                    <Marker key={spot.id} position={spot.pos} icon={customIcon('parking')}>
                        <Popup className="glass-popup">
                            <div className="text-slate-900 font-bold">{spot.label}</div>
                            <div className="text-purple-700 font-bold text-xs">{spot.available > 0 ? `${spot.available} Slots Free` : 'FULL'}</div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Status Overlays */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col gap-3 items-end">
                {/* GPS Status */}
                <div className="glass-panel px-3 py-2 rounded-xl flex items-center gap-3 border border-white/20 shadow-2xl">
                    {status === 'locating' && <Loader2 size={16} className="animate-spin text-brand-blue" />}
                    {status === 'ready' && <LocateFixed size={16} className="text-brand-green animate-pulse-fast" />}
                    {status === 'error' && <span className="w-3 h-3 rounded-full bg-brand-red shadow-[0_0_10px_#ff0055]"></span>}
                    <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-white uppercase">
                        {status === 'locating' ? "Bypassing Firewall..." : status === 'ready' ? "Encrypted GPS Link" : "Signal Jammed"}
                    </span>
                </div>

                {/* Map Legend */}
                <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl min-w-[180px] animate-in slide-in-from-right-4 duration-500">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3 ml-1">Traffic Intelligence</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 group cursor-help">
                            <div className="w-4 h-4 rounded-full border-2 border-white bg-brand-blue shadow-[0_0_10px_rgba(0,243,255,0.6)] animate-pulse"></div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:text-white transition-colors">Current Ops Center</span>
                        </div>
                        <div className="flex items-center gap-3 group cursor-help">
                            <div className="w-4 h-4 rounded-full border-2 border-white bg-brand-purple shadow-[0_0_10px_rgba(188,19,254,0.6)]"></div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:text-white transition-colors">Tactical Parking</span>
                        </div>
                        <div className="flex items-center gap-3 group cursor-help">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-red shadow-[0_0_5px_#ff0055]"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-green shadow-[0_0_5px_#00ff9d]"></div>
                            </div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:text-white transition-colors">Signal Nodes</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveCityMap;

