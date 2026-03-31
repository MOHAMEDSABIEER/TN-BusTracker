import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Route, Stop } from '../data';
import { BusFront, MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const createStopIcon = (color: string) => L.divIcon({
  html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-md" style="background-color: ${color}"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const OriginIcon = createStopIcon('#0f766e'); // Teal-700
const DestinationIcon = createStopIcon('#ef4444'); // Red-500
const IntermediateIcon = createStopIcon('#94a3b8'); // Slate-400

const BusIcon = L.divIcon({
  html: `<div class="bg-teal-600 p-2 rounded-full border-2 border-white shadow-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s1-1.33 1-4c0-3.33-2.67-4-4-4H6c-1.33 0-4 .67-4 4 0 2.67 1 4 1 4h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
        </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  route: Route;
  isSimulating: boolean;
  isDarkMode: boolean;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export const MapView: React.FC<MapViewProps> = ({ route, isSimulating, isDarkMode }) => {
  const [busPos, setBusPos] = useState<[number, number]>([route.stops[0].lat, route.stops[0].lng]);
  const [progress, setProgress] = useState(0);
  const [nextStopIndex, setNextStopIndex] = useState(1);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.01;
        if (next >= 1) {
          // Move to next segment
          setNextStopIndex((idx) => (idx + 1) % route.stops.length);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isSimulating, route.stops.length]);

  useEffect(() => {
    const startStop = route.stops[(nextStopIndex - 1 + route.stops.length) % route.stops.length];
    const endStop = route.stops[nextStopIndex];

    const lat = startStop.lat + (endStop.lat - startStop.lat) * progress;
    const lng = startStop.lng + (endStop.lng - startStop.lng) * progress;
    setBusPos([lat, lng]);
  }, [progress, nextStopIndex, route.stops]);

  const polylinePositions = route.stops.map(stop => [stop.lat, stop.lng] as [number, number]);

  return (
    <div className="h-full w-full relative">
      <MapContainer center={[route.stops[0].lat, route.stops[0].lng]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution={isDarkMode 
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        <ChangeView center={[route.stops[0].lat, route.stops[0].lng]} />
        
        <Polyline positions={polylinePositions} color={isDarkMode ? "#14b8a6" : "#0f766e"} weight={4} opacity={0.6} dashArray="10, 10" />
        
        {route.stops.map((stop, idx) => {
          const icon = idx === 0 ? OriginIcon : 
                       idx === route.stops.length - 1 ? DestinationIcon : 
                       IntermediateIcon;
          return (
            <Marker key={idx} position={[stop.lat, stop.lng]} icon={icon}>
              <Popup className={isDarkMode ? "dark-popup" : ""}>
                <div className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{stop.name}</div>
                <div className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Scheduled: {stop.time}</div>
              </Popup>
            </Marker>
          );
        })}

        {isSimulating && (
          <Marker position={busPos} icon={BusIcon}>
            <Popup className={isDarkMode ? "dark-popup" : ""}>
              <div className={`font-bold transition-colors duration-300 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>Bus is here</div>
              <div className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Heading to: {route.stops[nextStopIndex].name}</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Legend */}
      <div className={`absolute top-4 right-4 backdrop-blur p-3 rounded-xl shadow-lg z-[1000] border text-[10px] space-y-2 min-w-[120px] transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-100'
      }`}>
        <p className={`font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Legend</p>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-0.5 border-t-2 border-dashed ${isDarkMode ? 'bg-teal-500 border-teal-500' : 'bg-teal-700 border-teal-700'}`}></div>
          <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Route Path</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full border ${isDarkMode ? 'bg-teal-600 border-slate-900' : 'bg-teal-700 border-white'}`}></div>
          <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Origin Stop</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full border ${isDarkMode ? 'bg-red-500 border-slate-900' : 'bg-red-500 border-white'}`}></div>
          <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Destination</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full border ${isDarkMode ? 'bg-slate-500 border-slate-900' : 'bg-slate-400 border-white'}`}></div>
          <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Intermediate</span>
        </div>
        {isSimulating && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-600 rounded-full flex items-center justify-center text-white p-0.5">
              <BusFront className="w-2.5 h-2.5" />
            </div>
            <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Current Bus</span>
          </div>
        )}
      </div>

      {isSimulating && (
        <div className={`absolute bottom-4 left-4 right-4 backdrop-blur p-3 rounded-xl shadow-lg z-[1000] border transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-900/90 border-teal-900/50' : 'bg-white/90 border-teal-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-teal-900/50' : 'bg-teal-100'}`}>
                <BusFront className={`w-5 h-5 animate-pulse ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Next Stop</p>
                <p className={`font-bold transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{route.stops[nextStopIndex].name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">ETA</p>
              <p className={`font-bold transition-colors duration-300 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>{Math.ceil((1 - progress) * 5)} mins</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
