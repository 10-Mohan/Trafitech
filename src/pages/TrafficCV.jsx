import React, { useState, useEffect, useRef } from 'react';
import { Camera, Eye, AlertTriangle, Play, Pause, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';

const CAMERAS = [
  { id: 'cam1', name: 'Camera 01 — North Intersection', location: 'Main Street & Broadway', defaultSpeed: '42 km/h' },
  { id: 'cam2', name: 'Camera 02 — South Highway', location: 'Avenue Link Road', defaultSpeed: '68 km/h' },
  { id: 'cam3', name: 'Camera 03 — East Market Street', location: 'Commercial Bazaar Area', defaultSpeed: '18 km/h' },
  { id: 'cam4', name: 'Camera 04 — West Expressway', location: 'Flyover Exit Corridor', defaultSpeed: '85 km/h' },
];

const TrafficCV = () => {
  const [selectedCam, setSelectedCam] = useState(CAMERAS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [vehicleCount, setVehicleCount] = useState(12);
  const [pedestrianCount, setPedestrianCount] = useState(2);
  const [detectedSpeed, setDetectedSpeed] = useState(42);
  const [violations, setViolations] = useState([]);
  const canvasRef = useRef(null);

  // Simulation parameters for vehicles
  const vehiclesRef = useRef([]);

  // Initialize simulated vehicles
  const initVehicles = (camId) => {
    const list = [];
    const count = camId === 'cam1' ? 8 : camId === 'cam2' ? 14 : camId === 'cam3' ? 5 : 12;
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        type: Math.random() > 0.8 ? 'Truck' : Math.random() > 0.6 ? 'Bus' : 'Car',
        confidence: Math.round(90 + Math.random() * 9),
        x: Math.random() * 600 + 40,
        y: Math.random() * 320 + 40,
        speedX: (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1),
        speedY: (Math.random() * 1.5 + 0.5) * (Math.random() > 0.5 ? 1 : -1),
        width: 65,
        height: 40,
      });
    }
    vehiclesRef.current = list;
  };

  useEffect(() => {
    initVehicles(selectedCam.id);
    setDetectedSpeed(parseInt(selectedCam.defaultSpeed));
  }, [selectedCam]);

  // Animation Loop on Canvas
  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      // Clear
      ctx.fillStyle = '#0f172a'; // dark slate
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid / Lane lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 2;
      for (let i = 0; i < canvas.width; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 60) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw Lanes Lines
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)'; // yellow lanes
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Update & Draw Vehicles
      let currentVehiclesCount = 0;
      vehiclesRef.current.forEach((veh) => {
        if (isPlaying) {
          veh.x += veh.speedX;
          veh.y += veh.speedY;

          // Wrap boundaries
          if (veh.x < -100) veh.x = canvas.width + 50;
          if (veh.x > canvas.width + 100) veh.x = -50;
          if (veh.y < -50) veh.y = canvas.height + 20;
          if (veh.y > canvas.height + 50) veh.y = -20;
        }

        // Draw Bounding Box (Neon cyan/green)
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(veh.x, veh.y, veh.width, veh.height);

        // Bounding Box Label
        ctx.fillStyle = '#00f3ff';
        ctx.font = '10px monospace';
        ctx.fillText(`${veh.type} [${veh.confidence}%]`, veh.x, veh.y - 5);

        // Draw center dot
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(veh.x + veh.width / 2, veh.y + veh.height / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        currentVehiclesCount++;
      });

      // Draw simulated static Pedestrians
      const pedX1 = 150, pedY1 = 80;
      const pedX2 = 450, pedY2 = 280;
      ctx.strokeStyle = '#22c55e'; // green box for pedestrians
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pedX1, pedY1, 20, 35);
      ctx.fillText('Pedestrian [92%]', pedX1, pedY1 - 4);
      ctx.strokeRect(pedX2, pedY2, 20, 35);
      ctx.fillText('Pedestrian [96%]', pedX2, pedY2 - 4);

      // Static overlays (Reticles, Crosshairs, Scanner line)
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Camera banner info
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`REC • LIVE FEED [${selectedCam.id.toUpperCase()}]`, 40, 45);

      // Scan HUD overlay
      if (isPlaying) {
        setVehicleCount(currentVehiclesCount);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedCam, isPlaying]);

  // Periodic simulated violations
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPlaying) return;
      const violationTypes = [
        'Speed Limit Violation detected (Zone 2)',
        'Illegal U-Turn attempt at main intersection',
        'Zebra crossing violation (Vehicle did not yield to Pedestrian)',
      ];
      const randomViolation = violationTypes[Math.floor(Math.random() * violationTypes.length)];
      setViolations((prev) => [
        { id: Date.now(), msg: randomViolation, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4),
      ]);

      // Speech Synthesis announcement
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Alert. ${randomViolation}`);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    }, 9000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          AI Computer Vision Feed
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Real-time object detection, classification, and intersection flow analytics.
        </p>
      </div>

      {/* Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {CAMERAS.map((cam) => (
          <button
            key={cam.id}
            onClick={() => setSelectedCam(cam)}
            className={clsx(
              'p-4 rounded-xl text-left border transition-all duration-300',
              selectedCam.id === cam.id
                ? 'bg-brand-blue/10 border-brand-blue shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                : 'bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Camera size={16} className={selectedCam.id === cam.id ? 'text-brand-blue' : 'text-slate-400'} />
              <span className="font-bold text-sm text-slate-800 dark:text-white">{cam.name.split(' — ')[0]}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{cam.location}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Canvas Monitor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-2 rounded-2xl relative overflow-hidden flex flex-col bg-slate-900 border border-white/5">
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 text-xs">
              <span className="text-white font-mono flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
                </span>
                LIVE OBJECT SCANNER
              </span>
              <span className="text-slate-400 font-semibold">{selectedCam.name}</span>
            </div>

            <div className="relative aspect-[16/9] w-full bg-[#0f172a]">
              <canvas
                ref={canvasRef}
                width={720}
                height={405}
                className="w-full h-full block rounded-b-xl"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-black/60 backdrop-blur border border-white/10 rounded-lg text-white hover:bg-brand-blue hover:text-brand-dark transition-all"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={() => initVehicles(selectedCam.id)}
                  className="p-2 bg-black/60 backdrop-blur border border-white/10 rounded-lg text-white hover:bg-brand-blue hover:text-brand-dark transition-all"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time stats & anomaly report */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-md font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
              <BarChart2 size={18} className="text-brand-blue" />
              Real-time Feed Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vehicles</p>
                <p className="text-2xl font-bold text-brand-blue text-glow">{vehicleCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pedestrians</p>
                <p className="text-2xl font-bold text-brand-green text-glow">{pedestrianCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 col-span-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Estimated Velocity</p>
                <p className="text-2xl font-bold text-brand-yellow text-glow">{detectedSpeed} km/h</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-l-4 border-brand-red">
            <h3 className="text-md font-bold text-brand-red mb-4 flex items-center gap-2 border-b border-brand-red/10 pb-3">
              <ShieldAlert size={18} />
              AI Incident Alerts
            </h3>
            <div className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar">
              {violations.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center italic">No incident violations reported recently.</p>
              ) : (
                violations.map((violation) => (
                  <div
                    key={violation.id}
                    className="flex gap-2 p-3 rounded-lg bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 border-l-2 border-brand-red"
                  >
                    <AlertTriangle size={14} className="text-brand-red mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                        {violation.msg}
                      </p>
                      <span className="text-[10px] text-slate-400">{violation.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficCV;
