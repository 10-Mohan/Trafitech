import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { divIcon } from 'leaflet';
import { clsx } from 'clsx';

// Fix default Leaflet icon paths
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

// Component to dynamically recenter map on center prop changes
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.flyTo(center, zoom || map.getZoom());
    }
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
};

// Normalize coordinates helper: GeoJSON / Mapbox [lng, lat] vs Leaflet [lat, lng]
export const normalizeCoords = (coord1, coord2) => {
  let lat = 40.74;
  let lng = -73.98;

  if (Array.isArray(coord1) && coord1.length === 2) {
    const c0 = Number(coord1[0]);
    const c1 = Number(coord1[1]);
    // GeoJSON / Mapbox format: [lng, lat] where c0 is lng (e.g. -73.98) and c1 is lat (e.g. 40.74)
    if (Math.abs(c0) > 90 || (c0 < 0 && Math.abs(c0) > Math.abs(c1))) {
      lat = c1;
      lng = c0;
    } else {
      lat = c0;
      lng = c1;
    }
  } else if (coord1 !== undefined && coord2 !== undefined) {
    const val1 = Number(coord1);
    const val2 = Number(coord2);
    if (Math.abs(val1) > 90 || (val1 < 0 && Math.abs(val1) > Math.abs(val2))) {
      lng = val1;
      lat = val2;
    } else {
      lat = val1;
      lng = val2;
    }
  }

  return [lat, lng];
};

export const Map = ({
  center = [-73.98, 40.74],
  zoom = 11,
  children,
  className = '',
  style = {}
}) => {
  const leafletCenter = normalizeCoords(center);

  return (
    <div
      className={clsx("relative w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10", className)}
      style={style}
    >
      <MapContainer
        center={leafletCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ width: '100%', height: '100%', minHeight: '400px', background: '#0f172a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={leafletCenter} zoom={zoom} />
        {children}
      </MapContainer>
    </div>
  );
};

export const MarkerContent = ({ children, className = '' }) => {
  return (
    <div className={clsx("flex flex-col items-center justify-center cursor-pointer group", className)}>
      {children}
    </div>
  );
};

export const MarkerLabel = ({ children, position = 'bottom', className = '' }) => {
  const positionClasses = {
    top: '-translate-y-full mb-1',
    bottom: 'mt-1',
    left: '-translate-x-full mr-1',
    right: 'ml-1',
  };

  return (
    <span
      className={clsx(
        "px-2 py-0.5 text-[11px] font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-md shadow-md border border-slate-200 dark:border-slate-700 whitespace-nowrap",
        positionClasses[position] || positionClasses.bottom,
        className
      )}
    >
      {children}
    </span>
  );
};

export const MarkerPopup = ({ children, className = '' }) => {
  return (
    <Popup className={clsx("custom-marker-popup", className)}>
      <div className={clsx("w-64 p-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl overflow-hidden shadow-2xl", className)}>
        {children}
      </div>
    </Popup>
  );
};

export const MapMarker = ({ longitude, latitude, lng, lat, children }) => {
  const finalLng = longitude ?? lng ?? -73.98;
  const finalLat = latitude ?? lat ?? 40.74;

  const position = [finalLat, finalLng];

  // Separate popup child from marker pin/label content
  let markerPopupChild = null;
  let labelText = '';

  React.Children.forEach(children, child => {
    if (!child) return;
    if (child.type === MarkerPopup || child.type?.name === 'MarkerPopup') {
      markerPopupChild = child;
    } else if (child.type === MarkerContent || child.type?.name === 'MarkerContent') {
      React.Children.forEach(child.props.children, subChild => {
        if (subChild && (subChild.type === MarkerLabel || subChild.type?.name === 'MarkerLabel')) {
          labelText = subChild.props.children;
        }
      });
    }
  });

  const markerHtml = `
    <div class="flex flex-col items-center justify-center cursor-pointer group transform transition-transform hover:scale-110">
      <div class="size-5 rounded-full border-2 border-white bg-rose-500 shadow-lg shadow-rose-500/50"></div>
      ${labelText ? `<span class="mt-1 px-2 py-0.5 text-[11px] font-semibold bg-slate-900 text-white rounded-md shadow-md border border-slate-700 whitespace-nowrap">${labelText}</span>` : ''}
    </div>
  `;

  const customMarkerIcon = divIcon({
    className: 'custom-leaflet-marker-pin',
    html: markerHtml,
    iconSize: [28, 48],
    iconAnchor: [14, 24]
  });

  return (
    <Marker position={position} icon={customMarkerIcon}>
      {markerPopupChild}
    </Marker>
  );
};
