import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { 
  Search, 
  MapPin, 
  Bus as BusIcon, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  Bell, 
  Navigation,
  Info,
  Menu,
  X,
  TrendingUp,
  Users,
  ShieldCheck,
  Zap,
  Star,
  Smartphone,
  CloudSun,
  Shield,
  Lightbulb,
  Mail,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';
import { districts, buses, routes, Bus, Route, districtData } from './data';
import { MapView } from './components/MapView';

export default function App() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isDistrictPulsing, setIsDistrictPulsing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const districtRef = useRef<HTMLSelectElement>(null);

  // Sync dark mode class with document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#020617'; // slate-950
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc'; // slate-50
    }
  }, [isDarkMode]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tnbt_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('tnbt_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (busId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const isFavorite = prev.includes(busId);
      if (isFavorite) {
        addNotification(`Removed Bus ${buses.find(b => b.busId === busId)?.busNumber} from favorites`);
        return prev.filter(id => id !== busId);
      } else {
        addNotification(`Added Bus ${buses.find(b => b.busId === busId)?.busNumber} to favorites`);
        return [...prev, busId];
      }
    });
  };

  const favoriteBuses = useMemo(() => 
    buses.filter(b => favorites.includes(b.busId)),
  [favorites]);

  const filteredBuses = useMemo(() => {
    let result = buses;
    if (selectedDistrict) {
      result = result.filter(b => b.district === selectedDistrict);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => {
        const route = routes[b.routeId];
        return b.busNumber.toLowerCase().includes(q) || 
               route.routeName.toLowerCase().includes(q) ||
               route.stops.some(s => s.name.toLowerCase().includes(q));
      });
    }
    return result;
  }, [selectedDistrict, searchQuery]);

  const selectedBus = useMemo(() => 
    buses.find(b => b.busId === selectedBusId), 
  [selectedBusId]);

  const selectedRoute = useMemo(() => 
    selectedBus ? routes[selectedBus.routeId] : null, 
  [selectedBus]);

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(m => m !== msg));
    }, 5000);
  };

  const handleBusSelect = (busId: string) => {
    setSelectedBusId(busId);
    addNotification(`Tracking Bus ${buses.find(b => b.busId === busId)?.busNumber}`);
  };

  const handleStartTracking = () => {
    setIsSidebarOpen(true);
    setIsDistrictPulsing(true);
    
    // Small delay to ensure the sidebar transition has started before focusing
    setTimeout(() => {
      if (districtRef.current) {
        districtRef.current.focus();
        districtRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    // Reset pulse after a longer duration for better visibility
    setTimeout(() => setIsDistrictPulsing(false), 3000);
    
    addNotification("Select a district to begin tracking");
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-teal-700 border-teal-600'} backdrop-blur-md border-b text-white shadow-lg sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-teal-600'}`}
            >
              {isSidebarOpen ? <X /> : <Menu />}
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-lg">
                <BusIcon className="w-6 h-6 text-teal-700" />
              </div>
              <h1 className="text-xl font-bold tracking-tight hidden sm:block">TN Bus Tracker</h1>
              <h1 className="text-xl font-bold tracking-tight sm:hidden">TNBT</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden lg:block">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-teal-200' : 'text-teal-100'}`} />
              <input 
                type="text" 
                placeholder="Search bus, route, or stop..."
                className={`${isDarkMode ? 'bg-slate-800 text-slate-200 placeholder:text-slate-500' : 'bg-teal-800 text-white placeholder:text-teal-300'} border-none rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-teal-400 w-64 transition-colors duration-300`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className={`flex items-center p-1 rounded-full border transition-all duration-300 ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-teal-800 border-teal-600'
            }`}>
              <button 
                onClick={() => setIsDarkMode(false)}
                className={`p-1.5 rounded-full transition-all duration-300 ${!isDarkMode ? 'bg-white text-teal-700 shadow-sm' : 'text-teal-200 hover:text-white'}`}
                title="Light Mode"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsDarkMode(true)}
                className={`p-1.5 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-slate-700 text-yellow-400 shadow-sm' : 'text-teal-200 hover:text-white'}`}
                title="Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            <button className={`relative p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-teal-600'}`}>
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className={`absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 ${isDarkMode ? 'border-slate-900' : 'border-teal-700'}`}></span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full flex relative">
        {/* Sidebar / District Selector */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-72 border-r transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
        `}>
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div>
              <label className={`text-xs font-bold uppercase tracking-widest mb-2 block transition-all duration-500 ${
                isDistrictPulsing ? 'text-teal-400 translate-x-1' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
              }`}>
                Select District
              </label>
              <select 
                ref={districtRef}
                className={`w-full border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-teal-500 transition-all duration-700 ${
                  isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-900'
                } ${
                  isDistrictPulsing 
                    ? 'ring-4 ring-teal-500/30 scale-105 shadow-[0_0_40px_rgba(20,184,166,0.15)]' 
                    : ''
                }`}
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="">All Districts</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="md:hidden">
              <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Quick Search</label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className={`w-full border-none rounded-xl pl-10 pr-4 py-2.5 text-sm transition-colors duration-300 ${
                    isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-900'
                  }`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Favorites Section */}
            {favoriteBuses.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Favorites
                  </h2>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border transition-colors duration-300 ${
                    isDarkMode ? 'bg-amber-900/30 text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {favoriteBuses.length}
                  </span>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-64 pr-2">
                  {favoriteBuses.map(bus => (
                    <motion.button
                      layoutId={`fav-${bus.busId}`}
                      key={`fav-${bus.busId}`}
                      onClick={() => {
                        handleBusSelect(bus.busId);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
                        selectedBusId === bus.busId 
                          ? (isDarkMode ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200') 
                          : (isDarkMode ? 'bg-slate-800/40 border-slate-800 hover:border-teal-800' : 'bg-white border-slate-100 hover:border-teal-200')
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                            selectedBusId === bus.busId 
                              ? 'bg-teal-600 text-white' 
                              : (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')
                          }`}>
                            <BusIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-sm font-black transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{bus.busNumber}</p>
                            <p className={`text-[10px] font-bold uppercase transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{bus.district}</p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => toggleFavorite(bus.busId, e)}
                          className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </button>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Available Buses</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border transition-colors duration-300 ${
                  isDarkMode ? 'bg-teal-900/50 text-teal-400 border-teal-800' : 'bg-teal-50 text-teal-700 border-teal-100'
                }`}>
                  {filteredBuses.length}
                </span>
              </div>
              
              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-2">
                {filteredBuses.map(bus => (
                  <motion.button
                    layoutId={bus.busId}
                    key={bus.busId}
                    onClick={() => {
                      handleBusSelect(bus.busId);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group ${
                      selectedBusId === bus.busId 
                        ? (isDarkMode ? 'bg-teal-900/20 border-teal-800 shadow-sm' : 'bg-teal-50 border-teal-200 shadow-sm') 
                        : (isDarkMode ? 'bg-slate-800/40 border-slate-800 hover:border-teal-800 hover:bg-slate-800' : 'bg-white border-slate-100 hover:border-teal-200 hover:bg-slate-50')
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden transition-colors duration-300 ${
                          selectedBusId === bus.busId 
                            ? 'bg-teal-600 text-white' 
                            : (isDarkMode ? 'bg-slate-700 text-slate-400 group-hover:bg-teal-900/50 group-hover:text-teal-400' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-700')
                        }`}>
                          <BusIcon className="w-5 h-5 z-10" />
                          <div className={`absolute inset-0 opacity-20 ${
                            bus.status === 'Running' ? 'bg-green-500' :
                            bus.status === 'Delayed' ? 'bg-amber-500' :
                            'bg-slate-500'
                          }`}></div>
                        </div>
                        <div>
                          <p className={`text-lg font-black leading-none transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{bus.busNumber}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-tighter transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{bus.district}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 transition-colors duration-300 ${
                          bus.status === 'Running' ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700') :
                          bus.status === 'Delayed' ? (isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-700') :
                          (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            bus.status === 'Running' ? 'bg-green-500 animate-pulse' :
                            bus.status === 'Delayed' ? 'bg-amber-500' :
                            'bg-slate-400'
                          }`}></span>
                          {bus.status}
                        </div>
                        <button 
                          onClick={(e) => toggleFavorite(bus.busId, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            favorites.includes(bus.busId) 
                              ? 'bg-amber-500/10 text-amber-500' 
                              : (isDarkMode ? 'text-slate-600 hover:bg-slate-700' : 'text-slate-300 hover:bg-slate-100')
                          }`}
                        >
                          <Star className={`w-4 h-4 ${favorites.includes(bus.busId) ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <p className={`text-xs font-medium line-clamp-1 transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {routes[bus.routeId].routeName}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Theme Toggle */}
          <div className={`p-4 border-t transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`flex items-center justify-between p-2 rounded-2xl border transition-all duration-300 ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-3 px-2">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-teal-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isDarkMode ? 'bg-teal-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className={`flex-1 p-4 md:p-6 overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 lg:bg-transparent' : 'bg-slate-50 lg:bg-transparent'}`}>
          <AnimatePresence mode="wait">
            {selectedBusId && selectedBus && selectedRoute ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedBusId(null)}
                      className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}
                    >
                      <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                    </button>
                    <div className="flex-1">
                      <h2 className={`text-2xl font-black transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Bus {selectedBus.busNumber}</h2>
                      <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedRoute.routeName}</p>
                    </div>
                    <button 
                      onClick={() => toggleFavorite(selectedBus.busId)}
                      className={`p-3 rounded-2xl transition-all duration-300 border ${
                        favorites.includes(selectedBus.busId)
                          ? (isDarkMode ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-amber-50 border-amber-200 text-amber-600')
                          : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300')
                      }`}
                    >
                      <Star className={`w-6 h-6 ${favorites.includes(selectedBus.busId) ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Map View */}
                  <div className={`lg:col-span-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-3xl border overflow-hidden h-[400px] md:h-[500px] relative transition-colors duration-300`}>
                    <MapView route={selectedRoute} isSimulating={selectedBus.status === 'Running'} isDarkMode={isDarkMode} />
                  </div>

                  {/* Schedule & Info */}
                  <div className="space-y-6">
                    <div className={`p-6 rounded-3xl border transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Clock className="w-4 h-4" /> Route Stops
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors duration-300 ${
                          isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {selectedRoute.stops.length} STOPS
                        </span>
                      </div>
                      
                      <div className={`space-y-0 relative before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-0.5 transition-colors duration-300 ${
                        isDarkMode ? 'before:bg-slate-800' : 'before:bg-slate-200'
                      }`}>
                        {selectedRoute.stops.map((stop, idx) => (
                          <div key={idx} className="group flex items-start gap-4 relative py-3 first:pt-0 last:pb-0">
                            <div className={`w-6 h-6 rounded-full border-4 shadow-sm flex-shrink-0 z-10 transition-all duration-300 group-hover:scale-110 ${
                              isDarkMode ? 'border-slate-900' : 'border-white'
                            } ${
                              idx === 0 ? 'bg-teal-500' : 
                              idx === selectedRoute.stops.length - 1 ? 'bg-red-500' : 
                              (isDarkMode ? 'bg-slate-700' : 'bg-slate-300')
                            }`}></div>
                            <div className="flex-1 flex items-center justify-between">
                              <div>
                                <p className={`text-sm font-bold transition-colors duration-300 group-hover:text-teal-400 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{stop.name}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {idx === 0 ? 'Origin' : idx === selectedRoute.stops.length - 1 ? 'Destination' : `Stop ${idx + 1}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-xs font-black transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>{stop.time}</p>
                                <p className={`text-[10px] font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Scheduled</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`p-6 rounded-3xl shadow-lg text-white transition-colors duration-300 ${isDarkMode ? 'bg-teal-700' : 'bg-teal-600'}`}>
                      <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-teal-200' : 'text-teal-50'}`}>
                        <Info className="w-4 h-4" /> Bus Info
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-teal-100' : 'text-teal-50'}`}>District</span>
                          <span className="font-bold">{selectedBus.district}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-teal-100' : 'text-teal-50'}`}>Status</span>
                          <span className="bg-white/20 px-2 py-1 rounded-md text-xs font-bold">{selectedBus.status}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-teal-100' : 'text-teal-50'}`}>Type</span>
                          <span className="font-bold">Town Bus</span>
                        </div>
                      </div>
                    </div>

                    {/* District Info Section */}
                    {districtData[selectedBus.district] && (
                      <div className={`p-6 rounded-3xl border transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          <MapPin className="w-4 h-4" /> About {selectedBus.district}
                        </h3>
                        <p className={`text-sm leading-relaxed mb-4 transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {districtData[selectedBus.district].description}
                        </p>
                        <div className="space-y-2">
                          <p className={`text-[10px] font-bold uppercase tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Major Landmarks</p>
                          <div className="flex flex-wrap gap-2">
                            {districtData[selectedBus.district].landmarks.map((landmark, idx) => (
                              <span key={idx} className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors duration-300 ${
                                isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {landmark}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center text-center space-y-12 pb-12"
              >
                {/* Live Activity Ticker */}
                <div className={`w-full max-w-6xl border rounded-2xl p-4 flex items-center gap-4 overflow-hidden transition-colors duration-300 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex-shrink-0 bg-teal-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded tracking-tighter">Live Activity</div>
                  <div className="flex-1 overflow-hidden whitespace-nowrap">
                    <motion.div 
                      animate={{ x: ["100%", "-100%"] }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className={`flex gap-12 text-xs font-bold transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      <span>Bus 21G reached T Nagar (Chennai)</span>
                      <span>Bus 1A started from Gandhipuram (Coimbatore)</span>
                      <span>Bus 11 delayed by 5 mins at Goripalayam (Madurai)</span>
                      <span>Bus 5 arriving at Salem Junction in 3 mins</span>
                      <span>Bus K1 reached Srirangam (Trichy)</span>
                    </motion.div>
                  </div>
                </div>

                {/* Hero Banner */}
                <div className="w-full relative h-[400px] rounded-[40px] overflow-hidden shadow-2xl group">
                  <img 
                    src="/new-Chennai-MTC-ULE-Bus-Routes.png"
                    alt="Tamil Nadu Bus" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute inset-0 transition-colors duration-300 ${
                    isDarkMode ? 'bg-gradient-to-t from-teal-900/90 via-teal-900/40 to-transparent' : 'bg-gradient-to-t from-teal-900/70 via-teal-900/20 to-transparent'
                  }`}></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-6">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
                        Track Your Journey <br />
                        <span className="text-teal-400">Across Tamil Nadu</span>
                      </h2>
                      <p className="text-teal-50 max-w-xl mx-auto mt-4 text-lg md:text-xl font-medium drop-shadow-md">
                        Real-time bus tracking and smart alerts for a seamless travel experience.
                      </p>
                    </motion.div>

                    <motion.button 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      onClick={handleStartTracking}
                      className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:bg-teal-500 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 group"
                    >
                      <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Start Tracking Now
                    </motion.button>
                  </div>
                </div>

                {/* Statistics Dashboard */}
                <div className="w-full max-w-6xl px-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {[
                    { icon: <BusIcon className="w-5 h-5" />, label: "Active Buses", value: "1,240+", color: "teal" },
                    { icon: <Users className="w-5 h-5" />, label: "Daily Users", value: "45K+", color: "blue" },
                    { icon: <MapPin className="w-5 h-5" />, label: "Districts", value: "38", color: "indigo" },
                    { icon: <Zap className="w-5 h-5" />, label: "Live Updates", value: "0.5s", color: "amber" }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className={`p-6 rounded-3xl border shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300 ${
                        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className={`p-3 rounded-2xl mb-3 group-hover:scale-110 transition-transform ${
                        isDarkMode ? `bg-${stat.color}-900/30 text-${stat.color}-400` : `bg-${stat.color}-50 text-${stat.color}-600`
                      }`}>
                        {stat.icon}
                      </div>
                      <p className={`text-2xl font-black transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{stat.value}</p>
                      <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                  {[
                    { 
                      icon: <MapPin className="w-6 h-6" />, 
                      title: "Live Tracking", 
                      desc: "Simulated real-time GPS",
                      detail: "184 Buses Active",
                      color: "teal",
                      image: "/bus tracking image.jpg"
                    },
                    { 
                      icon: <Clock className="w-6 h-6" />, 
                      title: "Accurate Timings", 
                      desc: "Official TN schedules",
                      detail: "1,240 Stops Syncing",
                      color: "blue",
                      image: "/OIP-_1_.jpg"
                    },
                    { 
                      icon: <Bell className="w-6 h-6" />, 
                      title: "Smart Alerts", 
                      desc: "Arrival notifications",
                      detail: "99.9% Uptime",
                      color: "amber",
                      image: "/OIP.jpg"
                    }
                  ].map((feat, i) => (
                    <motion.button 
                      key={i} 
                      whileHover={{ y: -12, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartTracking}
                      className={`rounded-[32px] border shadow-sm hover:shadow-2xl transition-all text-left relative overflow-hidden group cursor-pointer flex flex-col duration-300 ${
                        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="h-48 w-full overflow-hidden">
                        <img 
                          src={feat.image} 
                          alt={feat.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className={`mb-4 p-3 rounded-2xl w-fit group-hover:rotate-6 transition-transform ${
                          isDarkMode ? `bg-${feat.color}-900/30 text-${feat.color}-400` : `bg-${feat.color}-50 text-${feat.color}-600`
                        }`}>
                          {feat.icon}
                        </div>
                        <h3 className={`font-bold text-xl mb-2 transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{feat.title}</h3>
                        <p className={`text-sm mb-6 flex-1 transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{feat.desc}</p>
                        
                        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest w-fit px-3 py-1.5 rounded-full border transition-colors duration-300 ${
                          isDarkMode ? 'bg-teal-900/30 text-teal-400 border-teal-800' : 'bg-teal-50 text-teal-700 border-teal-100'
                        }`}>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                          </span>
                          {feat.detail}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Popular Routes Section */}
                <div className="w-full max-w-6xl px-4 space-y-8">
                  <div className="flex items-end justify-between">
                    <div className="text-left">
                      <h3 className={`text-2xl font-black flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        <TrendingUp className="w-6 h-6 text-teal-500" /> Popular Routes
                      </h3>
                      <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Most tracked routes in the last 24 hours</p>
                    </div>
                    <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="text-teal-400 font-bold text-sm hover:underline flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { from: "T Nagar", to: "Tambaram", district: "Chennai", time: "45 mins", rating: 4.8 },
                      { from: "Gandhipuram", to: "Singanallur", district: "Coimbatore", time: "30 mins", rating: 4.9 },
                      { from: "Mattuthavani", to: "Periyar", district: "Madurai", time: "25 mins", rating: 4.7 }
                    ].map((route, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ x: 8 }}
                        className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all flex items-center gap-4 group cursor-pointer duration-300 ${
                          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                        }`}
                        onClick={() => {
                          setSearchQuery(route.from);
                          setIsSidebarOpen(true);
                        }}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                          isDarkMode ? 'bg-slate-800 text-slate-500 group-hover:bg-teal-900/50 group-hover:text-teal-400' : 'bg-slate-100 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600'
                        }`}>
                          <Navigation className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`text-sm font-bold transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{route.from} ↔ {route.to}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold uppercase transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{route.district}</span>
                            <span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></span>
                            <span className="text-[10px] font-bold text-teal-400">{route.time}</span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors duration-300 ${
                          isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50'
                        }`}>
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className={`text-xs font-black ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>{route.rating}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Access Districts */}
                <div className="w-full max-w-6xl px-4 space-y-6">
                  <h3 className={`text-xl font-black text-left transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Quick Access by District</h3>
                  <div className="flex flex-wrap gap-3">
                    {["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Erode"].map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedDistrict(city);
                          setIsSidebarOpen(true);
                          addNotification(`Showing buses in ${city}`);
                        }}
                        className={`px-6 py-3 rounded-2xl border shadow-sm font-bold text-sm transition-all hover:scale-105 active:scale-95 duration-300 ${
                          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-teal-500 hover:text-teal-400' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                    <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all border duration-300 ${
                        isDarkMode ? 'bg-teal-900/50 text-teal-400 hover:bg-teal-900 border-teal-800' : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-100'
                      }`}
                    >
                      + 32 More
                    </button>
                  </div>
                </div>

                {/* How it Works Section */}
                <div className={`w-full max-w-6xl px-4 py-12 border rounded-[40px] text-white overflow-hidden relative transition-colors duration-300 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-teal-700 border-teal-600 shadow-xl'
                }`}>
                  <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50 ${
                    isDarkMode ? 'bg-teal-900/20' : 'bg-white/10'
                  }`}></div>
                  <div className="relative z-10 space-y-12">
                    <div className="text-center space-y-2">
                      <h3 className="text-3xl font-black">How it Works</h3>
                      <p className={`${isDarkMode ? 'text-teal-400' : 'text-teal-100'} font-medium`}>Track your bus in three simple steps</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                      {[
                        { step: "01", title: "Select District", desc: "Choose your current location or destination district from the list." },
                        { step: "02", title: "Find Your Bus", desc: "Search for your bus number or route name in our live database." },
                        { step: "03", title: "Track Live", desc: "Monitor the real-time location and estimated arrival time on the map." }
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center space-y-4">
                          <div className={`text-5xl font-black ${isDarkMode ? 'text-teal-900/50' : 'text-white/20'}`}>{item.step}</div>
                          <h4 className="text-xl font-bold">{item.title}</h4>
                          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-teal-50'}`}>{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weather & Travel Tips Grid */}
                <div className="w-full max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Weather Widget */}
                  <div className={`lg:col-span-1 p-8 rounded-[32px] border shadow-sm space-y-6 transition-colors duration-300 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-black flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        <CloudSun className="w-5 h-5 text-blue-400" /> Weather Update
                      </h3>
                      <span className={`text-[10px] font-bold uppercase transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Live</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { city: "Chennai", temp: "32°C", condition: "Sunny" },
                        { city: "Coimbatore", temp: "28°C", condition: "Cloudy" },
                        { city: "Madurai", temp: "34°C", condition: "Clear" }
                      ].map((w, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-2xl transition-colors duration-300 ${
                          isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                        }`}>
                          <span className={`font-bold transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{w.city}</span>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{w.condition}</span>
                            <span className={`font-black transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{w.temp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Travel Tips */}
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { icon: <Shield className="w-5 h-5" />, title: "Safety First", desc: "Always keep your belongings secure and stay behind the yellow line at bus bays." },
                      { icon: <Lightbulb className="w-5 h-5" />, title: "Smart Travel", desc: "Use the 'Smart Alerts' feature to get notified 5 minutes before your bus arrives." }
                    ].map((tip, i) => (
                      <div key={i} className={`p-8 rounded-[32px] border shadow-sm space-y-4 group transition-all duration-300 ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-teal-500/50' : 'bg-white border-slate-100 hover:border-teal-200'
                      }`}>
                        <div className={`p-3 rounded-2xl w-fit group-hover:scale-110 transition-transform ${
                          isDarkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-600'
                        }`}>
                          {tip.icon}
                        </div>
                        <h4 className={`font-bold text-lg transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{tip.title}</h4>
                        <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tip.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newsletter Section */}
                <div className={`w-full max-w-4xl px-4 py-12 border rounded-[40px] text-center space-y-6 transition-colors duration-300 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className={`p-4 rounded-full w-fit mx-auto shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <Mail className="w-8 h-8 text-teal-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className={`text-2xl font-black transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Stay Updated</h3>
                    <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Get live updates on new routes and schedule changes directly in your inbox.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input 
                      type="email" 
                      placeholder="Enter your email address" 
                      className={`flex-1 border rounded-2xl px-6 py-4 text-sm shadow-sm focus:ring-2 focus:ring-teal-500 transition-colors duration-300 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <button className="bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-teal-500 transition-all shadow-lg hover:shadow-teal-900/20">
                      Subscribe
                    </button>
                  </div>
                  <div className={`flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3 h-3 text-teal-500" /> No spam, only transport updates
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Notification Toast */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-6 right-6 z-[100] space-y-2 pointer-events-none"
          >
            {notifications.map((msg, i) => (
              <div key={i} className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-lg transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="bg-teal-500 p-1 rounded-md">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium">{msg}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className={`border-t py-4 px-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200'
      }`}>
        <p className={`text-center text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          &copy; 2026 Tamil Nadu Bus Tracker System. All rights reserved.
        </p>
  </footer>
    </div>
  
  );
}

export default App;
