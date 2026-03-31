import React, { useState, useMemo } from 'react';
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
  X
} from 'lucide-react';
import { districts, buses, routes, Bus, Route } from './data';
import { MapView } from './components/MapView';

export default function App() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-teal-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-teal-600 rounded-lg transition-colors"
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

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-200" />
              <input 
                type="text" 
                placeholder="Search bus, route, or stop..."
                className="bg-teal-800 border-none rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-teal-400 w-64 placeholder:text-teal-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="relative p-2 hover:bg-teal-600 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-teal-700"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full flex relative">
        {/* Sidebar / District Selector */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Select District</label>
              <select 
                className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-teal-500"
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Quick Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">Available Buses</h2>
                <span className="text-xs font-medium bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
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
                        ? 'bg-teal-50 border-teal-200 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-teal-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          selectedBusId === bus.busId ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-600'
                        }`}>
                          <BusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-800 leading-none">{bus.busNumber}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{bus.district}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        bus.status === 'Running' ? 'bg-green-100 text-green-700' :
                        bus.status === 'Delayed' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {bus.status}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-600 line-clamp-1">
                      {routes[bus.routeId].routeName}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 bg-white lg:bg-transparent p-4 md:p-6 overflow-y-auto">
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
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Bus {selectedBus.busNumber}</h2>
                    <p className="text-sm font-medium text-slate-500">{selectedRoute.routeName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Map View */}
                  <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-[400px] md:h-[500px] relative">
                    <MapView route={selectedRoute} isSimulating={selectedBus.status === 'Running'} />
                  </div>

                  {/* Schedule & Info */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Route Stops
                        </h3>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          {selectedRoute.stops.length} STOPS
                        </span>
                      </div>
                      
                      <div className="space-y-0 relative before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                        {selectedRoute.stops.map((stop, idx) => (
                          <div key={idx} className="group flex items-start gap-4 relative py-3 first:pt-0 last:pb-0">
                            <div className={`w-6 h-6 rounded-full border-4 border-white shadow-sm flex-shrink-0 z-10 transition-transform group-hover:scale-110 ${
                              idx === 0 ? 'bg-teal-600' : 
                              idx === selectedRoute.stops.length - 1 ? 'bg-red-500' : 
                              'bg-slate-300'
                            }`}></div>
                            <div className="flex-1 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{stop.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                  {idx === 0 ? 'Origin' : idx === selectedRoute.stops.length - 1 ? 'Destination' : `Stop ${idx + 1}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-black text-slate-700">{stop.time}</p>
                                <p className="text-[10px] font-medium text-slate-400">Scheduled</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-teal-700 p-6 rounded-3xl shadow-lg text-white">
                      <h3 className="text-xs font-bold text-teal-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Bus Info
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-teal-100">District</span>
                          <span className="font-bold">{selectedBus.district}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-teal-100">Status</span>
                          <span className="bg-white/20 px-2 py-1 rounded-md text-xs font-bold">{selectedBus.status}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-teal-100">Type</span>
                          <span className="font-bold">Town Bus</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6"
              >
                <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center">
                  <Navigation className="w-12 h-12 text-teal-600 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Track Your Journey</h2>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2">
                    Select a district and choose a bus from the list to see real-time tracking, schedules, and ETA.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                  {[
                    { icon: <MapPin className="w-5 h-5" />, title: "Live Tracking", desc: "Simulated real-time GPS" },
                    { icon: <Clock className="w-5 h-5" />, title: "Accurate Timings", desc: "Official TN bus schedules" },
                    { icon: <Bell className="w-5 h-5" />, title: "Smart Alerts", desc: "Arrival & delay notifications" }
                  ].map((feat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="text-teal-600 mb-2">{feat.icon}</div>
                      <h3 className="font-bold text-slate-800 text-sm">{feat.title}</h3>
                      <p className="text-xs text-slate-500">{feat.desc}</p>
                    </div>
                  ))}
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
              <div key={i} className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-lg">
                <div className="bg-teal-500 p-1 rounded-md">
                  <Bell className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium">{msg}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6">
        <p className="text-center text-xs text-slate-400 font-medium">
          &copy; 2026 Tamil Nadu Bus Tracker System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
