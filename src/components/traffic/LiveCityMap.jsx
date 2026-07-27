
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { divIcon } from 'leaflet';
import { clsx } from 'clsx';
import { LocateFixed, Loader2, MapPin, Building2, Star, Navigation, Clock, ExternalLink } from 'lucide-react';

import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
} from "../ui/map";
import { Button } from "../ui/button";
import Image from "next/image";

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

const places = [
  {
    id: 1,
    name: "The Metropolitan Museum of Art",
    label: "Museum",
    category: "Museum",
    rating: 4.8,
    reviews: 12453,
    hours: "10:00 AM - 5:00 PM",
    image:
      "https://images.unsplash.com/photo-1575223970966-76ae61ee7838?w=300&h=200&fit=crop",
    lng: -73.9632,
    lat: 40.7794,
  },
  {
    id: 2,
    name: "Brooklyn Bridge",
    label: "Landmark",
    category: "Landmark",
    rating: 4.9,
    reviews: 8234,
    hours: "Open 24 hours",
    image:
      "https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=300&h=200&fit=crop",
    lng: -73.9969,
    lat: 40.7061,
  },
  {
    id: 3,
    name: "Grand Central Terminal",
    label: "Transit",
    category: "Transit",
    rating: 4.7,
    reviews: 5621,
    hours: "5:15 AM - 2:00 AM",
    image:
      "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=300&h=200&fit=crop",
    lng: -73.9772,
    lat: 40.7527,
  },
];

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
    const [mapMode, setMapMode] = useState('places'); // 'places' or 'signals'
    const [userPosition, setUserPosition] = useState([12.9716, 77.5946]); // Default: Bangalore
    const [parkingSpots, setParkingSpots] = useState([]);
    const [status, setStatus] = useState('initializing');

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
                        { id: 'p3', pos: [latitude + 0.001, longitude - 0.002], label: "Public Park Lot", available: 0 },
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
        <div className="w-full rounded-xl relative z-0 bg-slate-900 ring-1 ring-white/10 flex flex-col overflow-hidden">
            {/* View Mode Switcher Header */}
            <div className="p-3 bg-slate-950/80 border-b border-white/10 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMapMode('places')}
                        className={clsx(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                            mapMode === 'places'
                                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                                : "bg-white/5 text-slate-400 hover:text-white"
                        )}
                    >
                        <Building2 size={14} />
                        Landmarks & Places
                    </button>
                    <button
                        onClick={() => setMapMode('signals')}
                        className={clsx(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                            mapMode === 'signals'
                                ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30"
                                : "bg-white/5 text-slate-400 hover:text-white"
                        )}
                    >
                        <MapPin size={14} />
                        Live Signals Network
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                        {mapMode === 'places' ? 'Interactive Rich Card Popups' : 'Encrypted GPS Nodes'}
                    </span>
                </div>
            </div>

            {/* Render Selected Map Mode */}
            {mapMode === 'places' ? (
                <div className="h-[460px] w-full relative">
                    <Map center={[-73.98, 40.74]} zoom={11}>
                        {places.map((place) => (
                            <MapMarker key={place.id} longitude={place.lng} latitude={place.lat}>
                                <MarkerContent>
                                    <div className="size-5 cursor-pointer rounded-full border-2 border-white bg-rose-500 shadow-lg transition-transform hover:scale-110" />
                                    <MarkerLabel position="bottom">{place.label}</MarkerLabel>
                                </MarkerContent>
                                <MarkerPopup className="w-64 p-0">
                                    <div className="relative h-32 overflow-hidden rounded-t-md">
                                        <Image
                                            fill
                                            src={place.image}
                                            alt={place.name}
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="space-y-2 p-3">
                                        <div>
                                            <p className="text-slate-400 pb-0.5 text-[11px] font-medium tracking-wide uppercase">
                                                {place.category}
                                            </p>
                                            <h3 className="text-slate-100 leading-tight font-semibold text-sm">
                                                {place.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                                <span className="font-medium text-slate-200">{place.rating}</span>
                                                <span className="text-slate-400">
                                                    ({place.reviews.toLocaleString()})
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-slate-400 flex items-center gap-1.5 text-xs">
                                            <Clock className="size-3.5" />
                                            <span>{place.hours}</span>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <Button size="sm" className="flex-1 bg-rose-500 hover:bg-rose-600 text-xs">
                                                <Navigation className="size-3.5" />
                                                Directions
                                            </Button>
                                            <Button size="icon-sm" variant="outline" className="border-slate-700">
                                                <ExternalLink className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </MarkerPopup>
                            </MapMarker>
                        ))}
                    </Map>
                </div>
            ) : (
                <div className="w-full h-96 min-h-[400px] relative overflow-hidden">
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
                        <div className="glass-panel px-3 py-2 rounded-xl flex items-center gap-3 border border-white/20 shadow-2xl">
                            {status === 'locating' && <Loader2 size={16} className="animate-spin text-brand-blue" />}
                            {status === 'ready' && <LocateFixed size={16} className="text-brand-green animate-pulse-fast" />}
                            {status === 'error' && <span className="w-3 h-3 rounded-full bg-brand-red shadow-[0_0_10px_#ff0055]"></span>}
                            <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-white uppercase">
                                {status === 'locating' ? "Bypassing Firewall..." : status === 'ready' ? "Encrypted GPS Link" : "Signal Jammed"}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveCityMap;

