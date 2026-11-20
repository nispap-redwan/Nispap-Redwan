/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  INITIAL_LOCATIONS, 
  VillageLocation, 
  ConsciousYouth, 
  DEVELOPER_INFO 
} from './data/villageData';
import { VillageMap } from './components/VillageMap';
import { LocationProfileModal } from './components/LocationProfileModal';
import { EmergencyAlarmSection } from './components/EmergencyAlarmSection';
import { YouthDirectory } from './components/YouthDirectory';
import { AboutVillageAndDeveloper } from './components/AboutVillageAndDeveloper';
import { sirenPlayer } from './utils/sirenAudio';
import { 
  Map as MapIcon, 
  Users, 
  ShieldAlert, 
  Info, 
  PhoneCall, 
  VolumeX, 
  Volume2, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

interface ActiveAlarm {
  id: string;
  active: boolean;
  senderName: string;
  senderPhone?: string;
  locationName: string;
  emergencyType: string;
  details?: string;
  lat?: number;
  lng?: number;
  triggeredAt: number;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'map' | 'directory' | 'alarm' | 'about'>('map');
  const [locations, setLocations] = useState<VillageLocation[]>(INITIAL_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<VillageLocation | null>(null);
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<number>(1);
  const [alertHistory, setAlertHistory] = useState<any[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial village locations & alarm state from backend
  const fetchInitialData = useCallback(async () => {
    try {
      const [locRes, alarmRes] = await Promise.all([
        fetch('/api/village/locations'),
        fetch('/api/alarm/status')
      ]);
      if (locRes.ok) {
        const data = await locRes.json();
        if (Array.isArray(data.locations) && data.locations.length > 0) {
          setLocations(data.locations);
        }
      }
      if (alarmRes.ok) {
        const data = await alarmRes.json();
        if (data.activeAlarm) {
          setActiveAlarm(data.activeAlarm);
          if (!isAudioMuted) {
            sirenPlayer.startSiren();
          }
        }
        if (Array.isArray(data.alertHistory)) {
          setAlertHistory(data.alertHistory);
        }
        if (data.connectedDevices) {
          setConnectedDevices(data.connectedDevices);
        }
      }
    } catch (err) {
      console.warn('API fetch fallback to local initial state', err);
    }
  }, [isAudioMuted]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Connect to SSE (Server-Sent Events) for real-time siren broadcast
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/alarm/stream');

      eventSource.addEventListener('init', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.activeAlarm) {
            setActiveAlarm(data.activeAlarm);
            if (!isAudioMuted) {
              sirenPlayer.startSiren();
            }
          }
          if (data.clientCount) {
            setConnectedDevices(data.clientCount);
          }
        } catch {
          // ignore
        }
      });

      eventSource.addEventListener('alarm_triggered', (e: MessageEvent) => {
        try {
          const newAlarm: ActiveAlarm = JSON.parse(e.data);
          setActiveAlarm(newAlarm);
          showToast(`🚨 জরুরি সতর্কতা: ${newAlarm.locationName} এ ${newAlarm.emergencyType}!`);
          if (!isAudioMuted) {
            sirenPlayer.startSiren();
          }
        } catch {
          // ignore
        }
      });

      eventSource.addEventListener('alarm_stopped', () => {
        setActiveAlarm(null);
        sirenPlayer.stopSiren();
        showToast('✅ বিপদ সংকেত প্রত্যাহার করা হয়েছে। গ্রাম নিরাপদ।');
      });

      eventSource.addEventListener('clients_count', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.count) setConnectedDevices(data.count);
        } catch {
          // ignore
        }
      });

      eventSource.addEventListener('locations_updated', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (Array.isArray(data.locations)) {
            setLocations(data.locations);
          }
        } catch {
          // ignore
        }
      });
    } catch (err) {
      console.warn('SSE connection failed', err);
    }

    return () => {
      eventSource?.close();
    };
  }, [isAudioMuted]);

  // Trigger emergency alarm API
  const handleTriggerAlarm = async (data: {
    senderName: string;
    senderPhone: string;
    locationName: string;
    emergencyType: string;
    details: string;
    lat?: number;
    lng?: number;
  }) => {
    try {
      const res = await fetch('/api/alarm/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        setActiveAlarm(json.alarm);
        sirenPlayer.startSiren();
        showToast('🚨 এলার্ম সফলভাবে সকল মোবাইলে সম্প্রচারিত হয়েছে!');
      }
    } catch {
      // Local fallback
      const fallbackAlarm: ActiveAlarm = {
        id: `local-${Date.now()}`,
        active: true,
        senderName: data.senderName,
        senderPhone: data.senderPhone,
        locationName: data.locationName,
        emergencyType: data.emergencyType,
        details: data.details,
        lat: data.lat,
        lng: data.lng,
        triggeredAt: Date.now()
      };
      setActiveAlarm(fallbackAlarm);
      sirenPlayer.startSiren();
    }
  };

  // Stop emergency alarm
  const handleStopAlarm = async (resolvedBy: string) => {
    try {
      await fetch('/api/alarm/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolvedBy })
      });
    } catch {
      // ignore
    }
    setActiveAlarm(null);
    sirenPlayer.stopSiren();
    showToast('এলার্ম বন্ধ করা হয়েছে।');
  };

  // Update youth phone number
  const handleUpdateYouthPhone = async (locationId: string, youthId: string, newPhone: string, name?: string) => {
    try {
      const res = await fetch('/api/village/locations/update-youth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, youthId, phone: newPhone, name })
      });
      if (res.ok) {
        showToast('সচেতন যুবকের নাম্বার সফলভাবে হালনাগাদ করা হয়েছে!');
      }
    } catch {
      // local update
    }

    setLocations(prev =>
      prev.map(loc => {
        if (loc.id === locationId) {
          const updatedYouths = loc.youths.map(y => (y.id === youthId ? { ...y, phone: newPhone } : y));
          return { ...loc, youths: updatedYouths };
        }
        return loc;
      })
    );

    if (selectedLocation && selectedLocation.id === locationId) {
      setSelectedLocation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          youths: prev.youths.map(y => (y.id === youthId ? { ...y, phone: newPhone } : y))
        };
      });
    }
  };

  // Add new youth to location
  const handleAddNewYouthToLocation = async (locationId: string, name: string, phone: string, role: string) => {
    try {
      await fetch('/api/village/locations/update-youth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, name, phone, role })
      });
      showToast('নতুন সদস্য সফলভাবে যুক্ত হয়েছেন!');
    } catch {
      // ignore
    }

    const newY: ConsciousYouth = {
      id: `y-${Date.now()}`,
      name,
      phone,
      role
    };

    setLocations(prev =>
      prev.map(loc => (loc.id === locationId ? { ...loc, youths: [...loc.youths, newY] } : loc))
    );

    if (selectedLocation && selectedLocation.id === locationId) {
      setSelectedLocation(prev => (prev ? { ...prev, youths: [...prev.youths, newY] } : null));
    }
  };

  // Add new location
  const handleAddNewLocation = async (data: {
    name: string;
    roadOrArea: string;
    lat: number;
    lng: number;
    type: 'house' | 'shop' | 'mosque' | 'temple' | 'road_point';
    youthName?: string;
    youthPhone?: string;
  }) => {
    const youths: ConsciousYouth[] = [];
    if (data.youthName) {
      youths.push({
        id: `y-${Date.now()}`,
        name: data.youthName,
        phone: data.youthPhone || '',
        role: 'সচেতন সদস্য'
      });
    }

    try {
      const res = await fetch('/api/village/locations/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          roadOrArea: data.roadOrArea,
          lat: data.lat,
          lng: data.lng,
          type: data.type,
          youths
        })
      });
      if (res.ok) {
        showToast('নতুন স্থান সফলভাবে মানচিত্রে যুক্ত করা হয়েছে!');
      }
    } catch {
      // local
    }

    const newLoc: VillageLocation = {
      id: `loc-${Date.now()}`,
      name: data.name,
      roadOrArea: data.roadOrArea,
      lat: data.lat,
      lng: data.lng,
      type: data.type,
      youths
    };
    setLocations(prev => [...prev, newLoc]);
  };

  // Call youth handler
  const handleCallYouth = (youth: ConsciousYouth, location: VillageLocation) => {
    if (youth.phone) {
      window.location.href = `tel:${youth.phone.replace(/[^0-9]/g, '')}`;
    } else {
      setSelectedLocation(location);
    }
  };

  // Trigger quick alert for a specific location
  const handleQuickAlertAtLocation = (loc: VillageLocation) => {
    setSelectedLocation(null);
    setCurrentTab('alarm');
  };

  // Toggle Mute Audio
  const toggleMute = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      if (activeAlarm) {
        sirenPlayer.startSiren();
      }
    } else {
      setIsAudioMuted(true);
      sirenPlayer.stopSiren();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Hind_Siliguri',sans-serif]">
      
      {/* GLOBAL ACTIVE ALARM STROBE BANNER */}
      {activeAlarm && activeAlarm.active && (
        <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between shadow-2xl animate-pulse sticky top-0 z-[3000] border-b-2 border-yellow-300">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xl animate-bounce">🚨</span>
            <div className="truncate">
              <span className="font-extrabold text-yellow-200">জরুরি সাইরেন সক্রিয়: </span>
              <span className="font-bold">{activeAlarm.locationName}</span> - {activeAlarm.emergencyType}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCurrentTab('alarm')}
              className="bg-black/40 hover:bg-black/60 text-yellow-300 text-xs px-3 py-1 rounded-lg font-bold border border-yellow-300/40"
            >
              বিস্তারিত দেখুন
            </button>
            <button
              onClick={() => handleStopAlarm('ব্যবহারকারী')}
              className="bg-white hover:bg-slate-200 text-red-700 text-xs px-2.5 py-1 rounded-lg font-bold"
            >
              থামান
            </button>
          </div>
        </div>
      )}

      {/* Top Application Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-[1500] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo & Village Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-green-700 flex items-center justify-center text-xl shadow-lg border border-emerald-400/40">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
                  গ্রাম সুরক্ষা ও জরুরি এলার্ম
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>লাইভ নেটওয়ার্ক</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                পোড়াপারা • মেছুয়াঘাটা • চড়দক্ষিনবাড়ি • আদিবাসী পাড়া
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Audio Mute/Unmute */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                isAudioMuted
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
              }`}
              title={isAudioMuted ? 'সাউন্ড আনমিউট করুন' : 'সাউন্ড মিউট করুন'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Quick 999 Call Button */}
            <a
              href="tel:999"
              className="bg-red-600/90 hover:bg-red-600 text-white text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition-transform"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>৯৯৯</span>
            </a>
          </div>

        </div>
      </header>

      {/* Main App Content Viewport */}
      <main className="flex-1 relative overflow-x-hidden pb-20">
        {currentTab === 'map' && (
          <div className="w-full h-full">
            <VillageMap
              locations={locations}
              onSelectLocation={loc => setSelectedLocation(loc)}
              onCallYouth={handleCallYouth}
              onQuickAlertAtLocation={handleQuickAlertAtLocation}
              onAddLocationAtCoord={(lat, lng) => {
                handleAddNewLocation({
                  name: 'নতুন চিহ্নিত বাড়ি বা স্থান',
                  roadOrArea: 'গ্রাম্য সড়ক',
                  lat,
                  lng,
                  type: 'house'
                });
              }}
              activeAlarmLoc={
                activeAlarm
                  ? {
                      lat: activeAlarm.lat,
                      lng: activeAlarm.lng,
                      locationName: activeAlarm.locationName
                    }
                  : null
              }
            />

            {/* Quick Map Guide Bar */}
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> বাড়ি
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" /> মসজিদ
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> মন্দির
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> দোকান/মোড়
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block animate-pulse" /> প্রস্তুতকারক
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                যেকোনো বাড়ি বা রাস্তায় ক্লিক করে সচেতন যুবকের বিস্তারিত প্রোফাইল দেখুন।
              </p>
            </div>
          </div>
        )}

        {currentTab === 'directory' && (
          <YouthDirectory
            locations={locations}
            onFlyToLocationOnMap={loc => {
              setSelectedLocation(loc);
              setCurrentTab('map');
            }}
            onUpdateYouthPhone={handleUpdateYouthPhone}
            onTriggerAlarmAtLocation={loc => {
              setSelectedLocation(loc);
              setCurrentTab('alarm');
            }}
          />
        )}

        {currentTab === 'alarm' && (
          <EmergencyAlarmSection
            locations={locations}
            activeAlarm={activeAlarm}
            connectedDevices={connectedDevices}
            alertHistory={alertHistory}
            onTriggerAlarm={handleTriggerAlarm}
            onStopAlarm={handleStopAlarm}
            selectedLocationFromMap={selectedLocation}
          />
        )}

        {currentTab === 'about' && (
          <AboutVillageAndDeveloper
            locations={locations}
            onAddNewLocation={handleAddNewLocation}
          />
        )}
      </main>

      {/* Location Detail Profile Modal (When clicking marker on map) */}
      <LocationProfileModal
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
        onTriggerAlarmAtLocation={loc => {
          setSelectedLocation(loc);
          setCurrentTab('alarm');
        }}
        onUpdateYouthPhone={handleUpdateYouthPhone}
        onAddNewYouthToLocation={handleAddNewYouthToLocation}
      />

      {/* Toast Notification Floating Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[3500] bg-slate-900 border border-amber-400/80 text-amber-200 px-4 py-2.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[1500] bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl">
        <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5">
          
          {/* Tab 1: Map */}
          <button
            onClick={() => setCurrentTab('map')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
              currentTab === 'map'
                ? 'text-amber-400 font-bold bg-slate-800/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">স্যাটেলাইট</span>
          </button>

          {/* Tab 2: Directory */}
          <button
            onClick={() => setCurrentTab('directory')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
              currentTab === 'directory'
                ? 'text-amber-400 font-bold bg-slate-800/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">সচেতন যুবক</span>
          </button>

          {/* Tab 3: Emergency Alarm Switch (Highlighted) */}
          <button
            onClick={() => setCurrentTab('alarm')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all relative ${
              currentTab === 'alarm'
                ? 'text-red-400 font-black bg-red-950/40 ring-1 ring-red-500/50'
                : 'text-red-500 hover:text-red-400'
            }`}
          >
            {activeAlarm && activeAlarm.active && (
              <span className="absolute top-1 right-3 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
            <ShieldAlert className="w-5 h-5 mb-0.5 animate-pulse" />
            <span className="text-[11px] font-bold">জরুরি সুইচ</span>
          </button>

          {/* Tab 4: About & Developer */}
          <button
            onClick={() => setCurrentTab('about')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
              currentTab === 'about'
                ? 'text-amber-400 font-bold bg-slate-800/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">প্রস্তুতকারক</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
