import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { VillageLocation, BASE_CENTER, ConsciousYouth } from '../data/villageData';
import { 
  Layers, 
  Crosshair, 
  Search, 
  Home, 
  Compass, 
  MapPin, 
  PhoneCall, 
  AlertTriangle,
  UserCheck,
  PlusCircle,
  Eye,
  Maximize2
} from 'lucide-react';

interface VillageMapProps {
  locations: VillageLocation[];
  onSelectLocation: (location: VillageLocation) => void;
  onCallYouth: (youth: ConsciousYouth, location: VillageLocation) => void;
  onQuickAlertAtLocation: (location: VillageLocation) => void;
  onAddLocationAtCoord?: (lat: number, lng: number) => void;
  activeAlarmLoc?: { lat?: number; lng?: number; locationName?: string } | null;
}

type MapLayerType = 'google_hybrid' | 'esri_satellite' | 'osm_road';

export const VillageMap: React.FC<VillageMapProps> = ({
  locations,
  onSelectLocation,
  onCallYouth,
  onQuickAlertAtLocation,
  onAddLocationAtCoord,
  activeAlarmLoc
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const alarmMarkerRef = useRef<L.Marker | null>(null);

  const [currentLayer, setCurrentLayer] = useState<MapLayerType>('google_hybrid');
  const [searchQuery, setSearchQuery] = useState('');
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestYouths, setNearestYouths] = useState<Array<{ youth: ConsciousYouth; loc: VillageLocation; dist: number }>>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Compute distance in meters between two lat/lng
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Helper to create custom HTML DivIcon based on type
  const createCustomMarkerIcon = (loc: VillageLocation, isDev: boolean) => {
    let bgGradient = 'from-emerald-500 to-green-600';
    let iconChar = '🏠';
    let borderColor = 'border-white';

    if (isDev) {
      bgGradient = 'from-amber-400 to-yellow-600 animate-pulse';
      iconChar = '⭐';
      borderColor = 'border-yellow-200 ring-4 ring-yellow-400/40';
    } else if (loc.type === 'mosque') {
      bgGradient = 'from-teal-500 to-emerald-700';
      iconChar = '🕌';
    } else if (loc.type === 'temple') {
      bgGradient = 'from-orange-500 to-red-600';
      iconChar = '🛕';
    } else if (loc.type === 'shop') {
      bgGradient = 'from-blue-500 to-cyan-600';
      iconChar = '🏪';
    } else if (loc.type === 'road_point') {
      bgGradient = 'from-purple-500 to-indigo-600';
      iconChar = '🛣️';
    }

    const youthCount = loc.youths.length;

    const html = `
      <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-full">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr ${bgGradient} border-2 ${borderColor} shadow-xl flex items-center justify-center text-lg text-white font-bold transition-transform duration-200 group-hover:scale-125">
          <span>${iconChar}</span>
          ${
            youthCount > 0
              ? `<span class="absolute -top-2 -right-2 bg-red-600 text-white text-[11px] font-extrabold rounded-full h-5 w-5 flex items-center justify-center border border-white shadow">
                  ${youthCount}
                </span>`
              : ''
          }
        </div>
        <div class="w-2.5 h-2.5 bg-black rotate-45 mx-auto -mt-1 rounded-xs border-r border-b border-white/50"></div>
        <div class="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 whitespace-nowrap bg-slate-900/95 text-white text-xs px-2.5 py-1 rounded-md shadow-lg border border-slate-700 z-50 pointer-events-none">
          <p class="font-bold text-amber-300">${loc.name}</p>
          <p class="text-[11px] text-slate-300">${loc.roadOrArea}</p>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-village-marker',
      iconSize: [40, 44],
      iconAnchor: [20, 44],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: BASE_CENTER,
      zoom: 17,
      maxZoom: 20,
      minZoom: 14,
      zoomControl: false,
    });

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Click anywhere on map to identify spot in fields, gardens, roads
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setClickedCoord({ lat, lng });

      // Find nearest youths
      const list: Array<{ youth: ConsciousYouth; loc: VillageLocation; dist: number }> = [];
      locations.forEach(loc => {
        const d = calculateDistance(lat, lng, loc.lat, loc.lng);
        loc.youths.forEach(y => {
          list.push({ youth: y, loc, dist: d });
        });
      });

      list.sort((a, b) => a.dist - b.dist);
      setNearestYouths(list.slice(0, 3));
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Layer change (Google Earth Hybrid / Esri Satellite / OSM)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    let attribution = '&copy; Google Earth Satellite';
    let maxNativeZoom = 20;

    if (currentLayer === 'esri_satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri World Imagery Satellite';
      maxNativeZoom = 19;
    } else if (currentLayer === 'osm_road') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
      maxNativeZoom = 19;
    }

    const tile = L.tileLayer(url, {
      attribution,
      maxZoom: 20,
      maxNativeZoom,
    }).addTo(map);

    tileLayerRef.current = tile;
  }, [currentLayer]);

  // Update Markers when locations or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const filtered = locations.filter(loc => {
      if (filterType !== 'all' && loc.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = loc.name.toLowerCase().includes(q);
        const matchesRoad = loc.roadOrArea.toLowerCase().includes(q);
        const matchesYouth = loc.youths.some(
          y => y.name.toLowerCase().includes(q) || y.phone.includes(q)
        );
        return matchesName || matchesRoad || matchesYouth;
      }
      return true;
    });

    filtered.forEach(loc => {
      const isDev = loc.youths.some(y => y.isDeveloper);
      const icon = createCustomMarkerIcon(loc, isDev);
      const marker = L.marker([loc.lat, loc.lng], { icon });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setClickedCoord(null);
        onSelectLocation(loc);
      });

      markersGroup.addLayer(marker);
    });
  }, [locations, filterType, searchQuery]);

  // Active Alarm animation marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (alarmMarkerRef.current) {
      map.removeLayer(alarmMarkerRef.current);
      alarmMarkerRef.current = null;
    }

    if (activeAlarmLoc?.lat && activeAlarmLoc?.lng) {
      const alarmIcon = L.divIcon({
        html: `
          <div class="relative -translate-x-1/2 -translate-y-1/2">
            <div class="absolute -inset-4 bg-red-600 rounded-full animate-ping opacity-75"></div>
            <div class="w-12 h-12 bg-red-600 border-4 border-white text-white rounded-full flex items-center justify-center font-extrabold text-xl shadow-2xl animate-bounce">
              🚨
            </div>
          </div>
        `,
        className: 'alarm-pulse-marker',
        iconSize: [48, 48],
      });

      const m = L.marker([activeAlarmLoc.lat, activeAlarmLoc.lng], { icon: alarmIcon }).addTo(map);
      alarmMarkerRef.current = m;
      map.flyTo([activeAlarmLoc.lat, activeAlarmLoc.lng], 18, { animate: true });
    }
  }, [activeAlarmLoc]);

  // Reset to central village spot
  const handleCenterVillage = () => {
    mapInstanceRef.current?.flyTo(BASE_CENTER, 17, { animate: true });
  };

  // Find My Location
  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      alert('আপনার ডিভাইসে জিপিএস সমর্থন করছে না');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current?.flyTo([latitude, longitude], 18, { animate: true });

        // Add temporary user location marker
        const userIcon = L.divIcon({
          html: `
            <div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold animate-pulse">
              📍
            </div>
          `,
          className: 'user-pos-marker',
          iconSize: [32, 32],
        });
        L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstanceRef.current!);
      },
      err => {
        alert('জিপিএস লোকেশন নেওয়া সম্ভব হয়নি: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'h-[68vh] sm:h-[72vh]'} bg-slate-950 overflow-hidden`}>
      {/* Search & Filter Header Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="relative flex-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl flex items-center px-3 py-2">
            <Search className="w-5 h-5 text-amber-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="বাড়ি, রাস্তা, বা সচেতন যুবকের নাম খুঁজুন..."
              className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full hover:bg-slate-700"
              >
                মুছুন
              </button>
            )}
          </div>

          {/* Layer switcher button */}
          <div className="relative group">
            <button
              onClick={() => {
                if (currentLayer === 'google_hybrid') setCurrentLayer('esri_satellite');
                else if (currentLayer === 'esri_satellite') setCurrentLayer('osm_road');
                else setCurrentLayer('google_hybrid');
              }}
              className="bg-slate-900/90 hover:bg-slate-800 text-amber-400 p-2.5 rounded-xl border border-slate-700 shadow-xl flex items-center gap-1.5 text-xs font-medium backdrop-blur-md"
              title="ম্যাপ ভিউ পরিবর্তন (স্যাটেলাইট / রোড)"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">
                {currentLayer === 'google_hybrid'
                  ? 'গুগল হাইব্রিড'
                  : currentLayer === 'esri_satellite'
                  ? 'ইসরি স্যাটেলাইট'
                  : 'রোড ম্যাপ'}
              </span>
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-slate-900/90 text-slate-300 hover:text-white p-2.5 rounded-xl border border-slate-700 shadow-xl backdrop-blur-md"
            title="পূর্ণ পর্দা (Fullscreen)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto py-1">
          {[
            { id: 'all', label: 'সকল স্থান', icon: '📍' },
            { id: 'house', label: 'বাড়ি ও বসতভিটা', icon: '🏠' },
            { id: 'shop', label: 'দোকান ও মোড়', icon: '🏪' },
            { id: 'mosque', label: 'মসজিদ সংলগ্ন', icon: '🕌' },
            { id: 'temple', label: 'মন্দির ও আদিবাসী পাড়া', icon: '🛕' },
            { id: 'road_point', label: 'সড়ক পয়েন্ট', icon: '🛣️' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all shadow-md flex items-center gap-1 border ${
                filterType === f.id
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-amber-500/20'
                  : 'bg-slate-900/85 backdrop-blur-md text-slate-300 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons Right Side */}
      <div className="absolute right-3 bottom-20 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleCenterVillage}
          className="bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md transition-all active:scale-95 group flex items-center justify-center"
          title="তুহিনের দোকান ও শান্তদের বাড়ি (মূল গ্রাম কেন্দ্র)"
        >
          <Home className="w-5 h-5 text-emerald-400" />
        </button>

        <button
          onClick={handleFindMyLocation}
          className="bg-slate-900/90 hover:bg-slate-800 text-blue-400 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md transition-all active:scale-95 group flex items-center justify-center"
          title="আমার বর্তমান অবস্থান জিপিএস"
        >
          <Crosshair className="w-5 h-5 text-blue-400" />
        </button>
      </div>

      {/* Leaflet Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

      {/* Satellite Imagery Info Badge */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-slate-950/80 backdrop-blur-md text-[11px] text-slate-400 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1.5 shadow">
        <Eye className="w-3.5 h-3.5 text-emerald-400" />
        <span>গুগল আর্থ স্যাটেলাইট ভিউ (বাড়ি, মাঠ, বাগান, রাস্তা স্পষ্ট দৃশ্যমান)</span>
      </div>

      {/* Clicked Unknown Spot Modal (Clicked in field/garden/road) */}
      {clickedCoord && (
        <div className="absolute bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-[1001] bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl text-white">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                <Compass className="w-4 h-4" />
                <span>ম্যাপে চিহ্নিত স্থান (মাঠ / বাগান / রাস্তা)</span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {clickedCoord.lat.toFixed(6)}°N, {clickedCoord.lng.toFixed(6)}°E
              </p>
            </div>
            <button
              onClick={() => setClickedCoord(null)}
              className="text-slate-400 hover:text-white text-lg p-1"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-3">
            আপনি স্যাটেলাইটে একটি নির্দিষ্ট স্থান স্পর্শ করেছেন। এই স্থানের নিকটবর্তী সচেতন যুবকদের সাথে যোগাযোগ করুন:
          </p>

          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
            {nearestYouths.map(({ youth, loc, dist }, idx) => (
              <div
                key={youth.id || idx}
                className="bg-slate-800/80 border border-slate-700/70 p-2.5 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">{youth.name}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
                      {dist} মি দূরে
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{loc.name}</p>
                </div>

                {youth.phone ? (
                  <button
                    onClick={() => onCallYouth(youth, loc)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>কল দিন</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-amber-400">নাম্বার নেই</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (nearestYouths[0]) {
                  onQuickAlertAtLocation(nearestYouths[0].loc);
                  setClickedCoord(null);
                }
              }}
              className="flex-1 bg-red-600/90 hover:bg-red-600 text-white text-xs py-2 rounded-xl font-bold flex items-center justify-center gap-1 shadow-lg shadow-red-600/30"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>এই পয়েন্টে বিপদ সংকেত</span>
            </button>

            {onAddLocationAtCoord && (
              <button
                onClick={() => {
                  onAddLocationAtCoord(clickedCoord.lat, clickedCoord.lng);
                  setClickedCoord(null);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl font-medium flex items-center gap-1 border border-slate-700"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>স্পট সেভ</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
