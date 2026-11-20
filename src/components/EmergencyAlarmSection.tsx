import React, { useState } from 'react';
import { VillageLocation } from '../data/villageData';
import { sirenPlayer } from '../utils/sirenAudio';
import { 
  BellRing, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  AlertOctagon, 
  PhoneCall, 
  CheckCircle2, 
  History, 
  Radio, 
  Flame, 
  Users, 
  Zap,
  Info
} from 'lucide-react';

interface ActiveAlarmData {
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

interface EmergencyAlarmSectionProps {
  locations: VillageLocation[];
  activeAlarm: ActiveAlarmData | null;
  connectedDevices: number;
  alertHistory: Array<{
    id: string;
    senderName: string;
    locationName: string;
    emergencyType: string;
    triggeredAt: number;
    stoppedAt?: number;
    resolvedBy?: string;
  }>;
  onTriggerAlarm: (data: {
    senderName: string;
    senderPhone: string;
    locationName: string;
    emergencyType: string;
    details: string;
    lat?: number;
    lng?: number;
  }) => Promise<void>;
  onStopAlarm: (resolvedBy: string) => Promise<void>;
  selectedLocationFromMap?: VillageLocation | null;
}

export const EmergencyAlarmSection: React.FC<EmergencyAlarmSectionProps> = ({
  locations,
  activeAlarm,
  connectedDevices,
  alertHistory,
  onTriggerAlarm,
  onStopAlarm,
  selectedLocationFromMap
}) => {
  const [senderName, setSenderName] = useState(() => localStorage.getItem('village_user_name') || '');
  const [senderPhone, setSenderPhone] = useState(() => localStorage.getItem('village_user_phone') || '');
  const [locationName, setLocationName] = useState(
    selectedLocationFromMap ? selectedLocationFromMap.name : 'পোড়াপারা রোড, শান্তদের বাড়ি'
  );
  const [emergencyType, setEmergencyType] = useState('ডাকাত বা চোরের উপদ্রব');
  const [details, setDetails] = useState('');
  const [isTestPlaying, setIsTestPlaying] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [stopping, setStopping] = useState(false);

  const emergencyTypes = [
    { label: 'ডাকাত বা চোরের উপদ্রব', icon: '🚨', desc: 'গ্রামে সন্দেহভাজন বা ডাকাতের আক্রমণ' },
    { label: 'অগ্নিকাণ্ড বা আগুন', icon: '🔥', desc: 'বাড়ি বা দোকানে আগুন লেগেছে' },
    { label: 'মারামারি বা বহিরাগত হামলা', icon: '⚔️', desc: 'শান্তি বিঘ্নকারী সংঘর্ষ' },
    { label: 'জরুরি উদ্ধার ও অ্যাম্বুলেন্স', icon: '🚑', desc: 'জরুরি রোগী বা জীবন বিপন্ন' },
    { label: 'অন্যান্য গুরুতর বিপদ', icon: '⚠️', desc: 'জরুরি গণজমায়েত প্রয়োজন' },
  ];

  const handleTestSound = () => {
    if (isTestPlaying) {
      sirenPlayer.stopSiren();
      setIsTestPlaying(false);
    } else {
      sirenPlayer.startSiren();
      setIsTestPlaying(true);
      setTimeout(() => {
        sirenPlayer.stopSiren();
        setIsTestPlaying(false);
      }, 4000);
    }
  };

  const handleConfirmTrigger = async () => {
    setIsTriggering(true);
    setConfirmModalOpen(false);

    if (senderName) localStorage.setItem('village_user_name', senderName);
    if (senderPhone) localStorage.setItem('village_user_phone', senderPhone);

    const targetLoc = locations.find(l => l.name === locationName);

    try {
      await onTriggerAlarm({
        senderName: senderName || 'গ্রামের সচেতন নাগরিক',
        senderPhone,
        locationName,
        emergencyType,
        details,
        lat: targetLoc?.lat,
        lng: targetLoc?.lng,
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const handleResolveAlarm = async () => {
    setStopping(true);
    try {
      await onStopAlarm(senderName || 'গ্রামবাসী');
    } finally {
      setStopping(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Real-time Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>জরুরি নেটওয়ার্ক সম্প্রচার সক্রিয়</span>
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            </h4>
            <p className="text-xs text-slate-400">
              বর্তমানে গ্রামের <strong className="text-emerald-400 font-mono">{connectedDevices}টি</strong> মোবাইল ডিভাইস সংযুক্ত আছে
            </p>
          </div>
        </div>

        <button
          onClick={handleTestSound}
          className={`text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            isTestPlaying
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
          }`}
        >
          {isTestPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isTestPlaying ? 'টেস্ট থামান' : 'সাইরেন টেস্ট'}</span>
        </button>
      </div>

      {/* ACTIVE ALARM STATE (if ringing right now!) */}
      {activeAlarm && activeAlarm.active ? (
        <div className="bg-gradient-to-b from-red-600 via-rose-700 to-red-900 text-white rounded-3xl p-6 shadow-2xl border-4 border-red-500 animate-pulse relative overflow-hidden">
          <div className="absolute top-2 right-3 bg-red-950/80 text-red-200 text-xs px-3 py-1 rounded-full border border-red-500/50 flex items-center gap-1">
            <BellRing className="w-3.5 h-3.5 animate-bounce" />
            <span>সবার মোবাইলে বাজছে!</span>
          </div>

          <div className="text-center space-y-3 mb-6">
            <div className="inline-block p-4 bg-white/20 rounded-full backdrop-blur-md">
              <AlertOctagon className="w-16 h-16 text-white animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              ⚠️ গ্রামের জরুরি বিপদ সংকেত!
            </h2>
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-md mx-auto text-left space-y-2">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs text-red-200">বিপদের ধরন:</span>
                <span className="font-bold text-yellow-300 text-sm">{activeAlarm.emergencyType}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs text-red-200">ঘটনাস্থল:</span>
                <span className="font-bold text-white text-sm">{activeAlarm.locationName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs text-red-200">সংকেতদাতা:</span>
                <span className="font-bold text-white text-sm">
                  {activeAlarm.senderName} {activeAlarm.senderPhone ? `(${activeAlarm.senderPhone})` : ''}
                </span>
              </div>
              {activeAlarm.details && (
                <div className="pt-1 text-xs text-slate-100">
                  <span className="text-red-200">বিবরণ: </span>
                  {activeAlarm.details}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {activeAlarm.senderPhone && (
              <a
                href={`tel:${activeAlarm.senderPhone}`}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
              >
                <PhoneCall className="w-5 h-5" />
                <span>সংকেতদাতাকে কল করুন</span>
              </a>
            )}

            <button
              onClick={handleResolveAlarm}
              disabled={stopping}
              className="flex-1 bg-white hover:bg-slate-100 text-red-700 font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-black/40"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{stopping ? 'বন্ধ হচ্ছে...' : 'এলার্ম বন্ধ করুন (বিপদ মুক্ত)'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* IDLE TRIGGER FORM & MAIN EMERGENCY SWITCH */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold">
              <Zap className="w-4 h-4 text-red-400" />
              <span>এক ক্লিকে সকল মোবাইলে বিপদ সংকেত</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              গ্রামের প্রধান জরুরি এলার্ম সুইচ
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              কোনো বাড়ি, মাঠ বা রাস্তায় ডাকাত, আগুন বা দুর্ঘটনা ঘটলে নিচের সুইচ চাপুন। তাৎক্ষণিক সবার ফোনে বিকট সাইরেন বেজে উঠবে।
            </p>
          </div>

          {/* Form details */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                ১. বিপদের ধরন নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {emergencyTypes.map(t => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setEmergencyType(t.label)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      emergencyType === t.label
                        ? 'bg-red-950/50 border-red-500 text-white shadow-lg shadow-red-500/10 ring-1 ring-red-500'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{t.icon}</span>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-white">{t.label}</p>
                      <p className="text-[11px] text-slate-400">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ২. ঘটনাস্থল / বাড়ি নির্বাচন করুন:
              </label>
              <select
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-red-500"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({loc.roadOrArea})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  আপনার নাম (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  placeholder="আপনার নাম"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  আপনার মোবাইল নাম্বার:
                </label>
                <input
                  type="tel"
                  placeholder="018... বা 017..."
                  value={senderPhone}
                  onChange={e => setSenderPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                সংক্ষিপ্ত তথ্য বা বার্তা (যদি থাকে):
              </label>
              <input
                type="text"
                placeholder="যেমন: ৩ জন লোক মাঠের দিকে গেছে..."
                value={details}
                onChange={e => setDetails(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* THE GIANT EMERGENCY ALARM TRIGGER SWITCH */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setConfirmModalOpen(true)}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black py-5 px-6 rounded-3xl shadow-2xl shadow-red-600/40 border-2 border-red-400 flex flex-col items-center justify-center transition-all transform active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
                <span className="text-xl sm:text-2xl tracking-wide">
                  🚨 জরুরি এলার্ম সুইচ চালু করুন
                </span>
              </div>
              <span className="text-xs text-red-100 font-normal mt-1 opacity-90">
                চাপলে অবিলম্বে গ্রামের সকল সচেতন যুবকদের ফোনে সাইরেন বেজে উঠবে
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Safeguard Modal to prevent accidental press */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-[2500] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500 rounded-3xl p-6 max-w-md w-full space-y-4 text-white shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white">
              আপনি কি নিশ্চিতভাবে এলার্ম বাজাতে চান?
            </h3>

            <p className="text-xs text-slate-300">
              এই সুইচ চাপলে গ্রামের সকলের ফোনে তাৎক্ষণিক বিকট এলার্ম সাইরেন বাজবে এবং 
              <strong className="text-amber-400"> "{locationName}"</strong> স্থানে বিপদের বার্তা যাবে।
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-sm"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleConfirmTrigger}
                disabled={isTriggering}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-2xl font-extrabold text-sm shadow-lg shadow-red-600/30"
              >
                {isTriggering ? 'সম্প্রচার হচ্ছে...' : 'হ্যাঁ, এলার্ম বাজান!'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Log History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <History className="w-4 h-4 text-amber-400" />
          <span>সাম্প্রতিক এলার্ম ও বিপদের রেকর্ড</span>
        </div>

        {alertHistory.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            এখনো পর্যন্ত কোনো সক্রিয় বিপদ সংকেত রেকর্ড করা হয়নি। গ্রাম নিরাপদ আছে।
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alertHistory.map(h => (
              <div
                key={h.id}
                className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{h.emergencyType}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(h.triggeredAt).toLocaleTimeString('bn-BD')}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">{h.locationName} • সংকেতদাতা: {h.senderName}</p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    h.stoppedAt ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {h.stoppedAt ? 'বিপদ মুক্ত' : 'চলমান'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
