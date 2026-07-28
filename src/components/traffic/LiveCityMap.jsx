
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
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

// Component to recenter map when position changes
const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position && Array.isArray(position) && position.length === 2) {
            map.flyTo(position, 15);
        }
    }, [position, map]);
    return null;
};

const LiveCityMap = () => {
    const [mapMode, setMapMode] = useState('places'); // 'places' or 'signals'
    const [userPosition, setUserPosition] = useState([12.9716, 77.5946]); // Default fallback
    const [status, setStatus] = useState('initializing');

    const locateUser = () => {
        setStatus('locating');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = [latitude, longitude];
                    setUserPosition(newPos);
                    setStatus('ready');
                },
                (err) => {
                    console.error("Location access denied", err);
                    setStatus('error');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setStatus('error');
        }
    };

    useEffect(() => {
        locateUser();
    }, []);

    // Generate places relative to real user live position
    const places = [
      {
        id: 1,
        name: "The Metropolitan Art & Cultural Center",
        label: "Museum",
        category: "Museum",
        rating: 4.8,
        reviews: 12453,
        hours: "10:00 AM - 5:00 PM",
        image:
          "https://images.unsplash.com/photo-1575223970966-76ae61ee7838?w=300&h=200&fit=crop",
        lng: userPosition[1] + 0.003,
        lat: userPosition[0] + 0.003,
      },
      {
        id: 2,
        name: "City Landmark Suspension Bridge",
        label: "Landmark",
        category: "Landmark",
        rating: 4.9,
        reviews: 8234,
        hours: "Open 24 hours",
        image:
          "https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=300&h=200&fit=crop",
        lng: userPosition[1] + 0.004,
        lat: userPosition[0] - 0.002,
      },
      {
        id: 3,
        name: "Grand Central Transit Hub",
        label: "Transit",
        category: "Transit",
        rating: 4.7,
        reviews: 5621,
        hours: "5:15 AM - 2:00 AM",
        image:
          "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=300&h=200&fit=crop",
        lng: userPosition[1] - 0.003,
        lat: userPosition[0] + 0.002,
      },
    ];

    const trafficSignalsList = [
        { id: 'sig-N', lat: userPosition[0] + 0.002, lng: userPosition[1] + 0.001, label: "North Junction A", status: 'red', density: 78, queueLength: '14 vehicles' },
        { id: 'sig-S', lat: userPosition[0] - 0.002, lng: userPosition[1] - 0.001, label: "South Junction B", status: 'green', density: 32, queueLength: '3 vehicles' },
        { id: 'sig-E', lat: userPosition[0] + 0.001, lng: userPosition[1] + 0.003, label: "East Express Way C", status: 'green', density: 45, queueLength: '5 vehicles' },
        { id: 'sig-W', lat: userPosition[0] - 0.001, lng: userPosition[1] - 0.003, label: "West Boulevard D", status: 'red', density: 88, queueLength: '19 vehicles' },
    ];

    const parkingNodesList = [
        { id: 'p1', lat: userPosition[0] + 0.003, lng: userPosition[1] + 0.002, label: "Mall Multi-Level Lot", available: 12, total: 50 },
        { id: 'p2', lat: userPosition[0] - 0.0025, lng: userPosition[1] + 0.0015, label: "Central Metro Park", available: 5, total: 30 },
        { id: 'p3', lat: userPosition[0] + 0.0015, lng: userPosition[1] - 0.0025, label: "Public Park Square", available: 0, total: 40 },
    ];

    return (
        <div className="w-full rounded-xl relative z-0 bg-slate-900 ring-1 ring-white/10 flex flex-col overflow-hidden">
            {/* View Mode Switcher Header */}
            <div className="p-3 bg-slate-950/80 border-b border-white/10 flex items-center justify-between z-10 flex-wrap gap-2">
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
                    <button
                        onClick={locateUser}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-blue/20 text-brand-blue border border-brand-blue/30 hover:bg-brand-blue hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
                    >
                        <LocateFixed size={14} className={status === 'locating' ? 'animate-spin' : 'animate-pulse'} />
                        Locate Me
                    </button>
                    <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                        {status === 'ready' ? `GPS: ${userPosition[0].toFixed(2)}°, ${userPosition[1].toFixed(2)}°` : 'Searching GPS...'}
                    </span>
                </div>
            </div>

            {/* Render Selected Map Mode */}
            {mapMode === 'places' ? (
                <div className="h-[460px] w-full relative">
                    <Map center={[userPosition[1], userPosition[0]]} zoom={14}>
                        {/* Live User Location Pin */}
                        <MapMarker longitude={userPosition[1]} latitude={userPosition[0]}>
                            <MarkerContent>
                                <div className="size-6 cursor-pointer rounded-full border-2 border-white bg-blue-500 shadow-lg shadow-blue-500/80 animate-pulse flex items-center justify-center">
                                    <div className="size-2 rounded-full bg-white"></div>
                                </div>
                                <MarkerLabel position="bottom">📍 Your Live Location</MarkerLabel>
                            </MarkerContent>
                            <MarkerPopup className="w-56 p-3">
                                <div className="text-xs font-bold text-brand-blue flex items-center gap-1.5 mb-1">
                                    <LocateFixed size={14} className="text-emerald-400 animate-pulse" />
                                    Your Live GPS Location
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Latitude: {userPosition[0].toFixed(4)}° N<br/>
                                    Longitude: {userPosition[1].toFixed(4)}° E
                                </p>
                            </MarkerPopup>
                        </MapMarker>

                        {/* Nearby Places */}
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
                <div className="h-[460px] w-full relative">
                    <Map center={[userPosition[1], userPosition[0]]} zoom={14}>
                        {/* Live User Location Pin */}
                        <MapMarker longitude={userPosition[1]} latitude={userPosition[0]}>
                            <MarkerContent>
                                <div className="size-6 cursor-pointer rounded-full border-2 border-white bg-blue-500 shadow-lg shadow-blue-500/80 animate-pulse flex items-center justify-center">
                                    <div className="size-2 rounded-full bg-white"></div>
                                </div>
                                <MarkerLabel position="bottom">📍 Your Live Location</MarkerLabel>
                            </MarkerContent>
                            <MarkerPopup className="w-56 p-3">
                                <div className="text-xs font-bold text-brand-blue flex items-center gap-1.5 mb-1">
                                    <LocateFixed size={14} className="text-emerald-400 animate-pulse" />
                                    Your Live GPS Location
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Latitude: {userPosition[0].toFixed(4)}° N<br/>
                                    Longitude: {userPosition[1].toFixed(4)}° E
                                </p>
                            </MarkerPopup>
                        </MapMarker>

                        {/* Traffic Signal Nodes */}
                        {trafficSignalsList.map(signal => (
                            <MapMarker key={signal.id} longitude={signal.lng} latitude={signal.lat}>
                                <MarkerContent>
                                    <div className={clsx(
                                        "size-6 cursor-pointer rounded-full border-2 border-white flex items-center justify-center font-bold text-[10px] text-white shadow-lg transition-transform hover:scale-110",
                                        signal.status === 'red' ? "bg-red-500 shadow-red-500/80 animate-pulse" : "bg-emerald-500 shadow-emerald-500/80"
                                    )}>
                                        {signal.status === 'red' ? 'STOP' : 'GO'}
                                    </div>
                                    <MarkerLabel position="bottom">{signal.label}</MarkerLabel>
                                </MarkerContent>
                                <MarkerPopup className="w-56 p-3">
                                    <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2">
                                        <span className="text-xs font-bold text-slate-100">{signal.label}</span>
                                        <span className={clsx(
                                            "px-2 py-0.5 text-[10px] font-black uppercase rounded",
                                            signal.status === 'red' ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        )}>
                                            {signal.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 text-xs text-slate-300">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Traffic Density:</span>
                                            <span className="font-bold text-slate-200">{signal.density}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Queue Length:</span>
                                            <span className="font-medium text-slate-200">{signal.queueLength}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                            <div
                                                className={clsx("h-full rounded-full", signal.density > 70 ? "bg-red-500" : "bg-emerald-500")}
                                                style={{ width: `${signal.density}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </MarkerPopup>
                            </MapMarker>
                        ))}

                        {/* Tactical Parking Nodes */}
                        {parkingNodesList.map(spot => (
                            <MapMarker key={spot.id} longitude={spot.lng} latitude={spot.lat}>
                                <MarkerContent>
                                    <div className="size-6 cursor-pointer rounded-full border-2 border-white bg-purple-600 shadow-lg shadow-purple-500/80 flex items-center justify-center font-black text-[11px] text-white transition-transform hover:scale-110">
                                        P
                                    </div>
                                    <MarkerLabel position="bottom">{spot.label}</MarkerLabel>
                                </MarkerContent>
                                <MarkerPopup className="w-56 p-3">
                                    <div className="text-xs font-bold text-slate-100 border-b border-slate-700/60 pb-1.5 mb-2 flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                        {spot.label}
                                    </div>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-slate-400">Slots Available:</span>
                                        <span className={clsx("font-bold", spot.available > 0 ? "text-emerald-400" : "text-red-400")}>
                                            {spot.available > 0 ? `${spot.available} / ${spot.total} Free` : 'FULL'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={clsx("h-full rounded-full", spot.available > 0 ? "bg-purple-500" : "bg-red-500")}
                                            style={{ width: `${((spot.total - spot.available) / spot.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </MarkerPopup>
                            </MapMarker>
                        ))}
                    </Map>

                    {/* Status Overlays */}
                    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-3 items-end">
                        <div className="glass-panel px-3 py-2 rounded-xl flex items-center gap-3 border border-white/20 shadow-2xl">
                            {status === 'locating' && <Loader2 size={16} className="animate-spin text-brand-blue" />}
                            {status === 'ready' && <LocateFixed size={16} className="text-brand-green animate-pulse-fast" />}
                            {status === 'error' && <span className="w-3 h-3 rounded-full bg-brand-red shadow-[0_0_10px_#ff0055]"></span>}
                            <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-white uppercase">
                                {status === 'locating' ? "Acquiring GPS Signal..." : status === 'ready' ? "Live GPS Connected" : "GPS Signal Unavailable"}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveCityMap;

