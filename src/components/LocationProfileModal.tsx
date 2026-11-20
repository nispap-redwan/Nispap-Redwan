import React, { useState } from 'react';
import { VillageLocation, ConsciousYouth } from '../data/villageData';
import { 
  Phone, 
  MessageSquare, 
  Send, 
  AlertTriangle, 
  X, 
  MapPin, 
  UserCheck, 
  Plus, 
  Star, 
  Edit3, 
  Share2,
  Compass,
  Check
} from 'lucide-react';

interface LocationProfileModalProps {
  location: VillageLocation | null;
  onClose: () => void;
  onTriggerAlarmAtLocation: (location: VillageLocation) => void;
  onUpdateYouthPhone: (locationId: string, youthId: string, newPhone: string, name?: string) => Promise<void>;
  onAddNewYouthToLocation: (locationId: string, name: string, phone: string, role: string) => Promise<void>;
}

export const LocationProfileModal: React.FC<LocationProfileModalProps> = ({
  location,
  onClose,
  onTriggerAlarmAtLocation,
  onUpdateYouthPhone,
  onAddNewYouthToLocation
}) => {
  const [editingYouthId, setEditingYouthId] = useState<string | null>(null);
  const [inputPhone, setInputPhone] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('সচেতন যুবক');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!location) return null;

  const handleStartEditPhone = (youth: ConsciousYouth) => {
    setEditingYouthId(youth.id);
    setInputPhone(youth.phone || '');
  };

  const handleSavePhone = async (youthId: string) => {
    if (!inputPhone.trim()) return;
    setSubmitting(true);
    try {
      await onUpdateYouthPhone(location.id, youthId, inputPhone.trim());
      setEditingYouthId(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNewYouth = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      await onAddNewYouthToLocation(location.id, newName.trim(), newPhone.trim(), newRole.trim());
      setIsAddingNew(false);
      setNewName('');
      setNewPhone('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCoord = () => {
    const text = location.mapCode || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-start justify-between">
          <div className="space-y-1 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {location.type === 'mosque' ? '🕌' : location.type === 'temple' ? '🛕' : location.type === 'shop' ? '🏪' : '🏠'}
              </span>
              <h2 className="text-lg font-bold text-amber-400 leading-snug">
                {location.name}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                {location.roadOrArea}
              </span>
              {location.mapCode && (
                <span className="bg-slate-800 text-amber-300 font-mono text-[11px] px-2 py-0.5 rounded border border-slate-700">
                  {location.mapCode}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Quick Info & Coords */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 flex items-center justify-between">
            <div className="text-xs space-y-0.5">
              <span className="text-slate-400">স্যাটেলাইট স্থানাঙ্ক (GPS):</span>
              <p className="font-mono text-slate-200">
                {location.lat.toFixed(6)}°N, {location.lng.toFixed(6)}°E
              </p>
            </div>
            <button
              onClick={handleCopyCoord}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
            </button>
          </div>

          {/* Section: Conscious Youths */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  এই স্থানের সচেতন যুবকগণ ({location.youths.length} জন)
                </h3>
              </div>
              <button
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>সদস্য যোগ</span>
              </button>
            </div>

            {/* Inline Add New Youth Form */}
            {isAddingNew && (
              <div className="bg-slate-800 border border-amber-500/40 p-3 rounded-2xl mb-3 space-y-2.5 animate-in slide-in-from-top-2">
                <p className="text-xs font-bold text-amber-400">নতুন সচেতন যুবক যুক্ত করুন</p>
                <input
                  type="text"
                  placeholder="যুবকের নাম"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500"
                />
                <input
                  type="tel"
                  placeholder="মোবাইল নাম্বার (যেমন: 017...)"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsAddingNew(false)}
                    className="text-xs text-slate-400 px-3 py-1.5 rounded-lg"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleSaveNewYouth}
                    disabled={submitting || !newName.trim()}
                    className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    {submitting ? 'যোগ হচ্ছে...' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </div>
            )}

            {/* Youths List */}
            <div className="space-y-2.5">
              {location.youths.length === 0 ? (
                <div className="p-4 bg-slate-800/40 rounded-2xl text-center text-sm text-slate-400">
                  এখনো কোনো সচেতন যুবকের নাম নিবন্ধিত নেই। উপরের বাটন দিয়ে যোগ করুন।
                </div>
              ) : (
                location.youths.map(youth => {
                  const isEditing = editingYouthId === youth.id;
                  const cleanPhone = youth.phone.replace(/[^0-9]/g, '');

                  return (
                    <div
                      key={youth.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        youth.isDeveloper
                          ? 'bg-gradient-to-r from-amber-950/40 via-slate-800 to-amber-950/30 border-amber-500/50 shadow-lg ring-1 ring-amber-500/30'
                          : 'bg-slate-800/80 border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-white text-base">
                              {youth.name}
                            </span>
                            {youth.isDeveloper && (
                              <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                                <Star className="w-3 h-3 fill-slate-950" />
                                <span>অ্যাপ প্রস্তুতকারক</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {youth.role || 'সচেতন যুবক'}
                          </p>
                        </div>

                        {!isEditing && (
                          <button
                            onClick={() => handleStartEditPhone(youth)}
                            className="text-slate-400 hover:text-amber-400 p-1"
                            title="নাম্বার পরিবর্তন বা যোগ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Phone Display or Edit */}
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60">
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="tel"
                              value={inputPhone}
                              onChange={e => setInputPhone(e.target.value)}
                              placeholder="মোবাইল নাম্বার লিখুন (যেমন: 018...)"
                              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePhone(youth.id)}
                              disabled={submitting}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                            >
                              {submitting ? '...' : 'সেভ'}
                            </button>
                            <button
                              onClick={() => setEditingYouthId(null)}
                              className="text-slate-400 text-xs px-2 py-1.5"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : youth.phone ? (
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="font-mono text-sm text-emerald-400 font-bold tracking-wide">
                              📞 {youth.phone}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {/* Direct Phone Call */}
                              <a
                                href={`tel:${cleanPhone}`}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-transform active:scale-95"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>সরাসরি কল</span>
                              </a>

                              {/* WhatsApp */}
                              <a
                                href={`https://wa.me/88${cleanPhone.startsWith('88') ? cleanPhone.slice(2) : cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-green-700 hover:bg-green-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-md transition-transform active:scale-95"
                                title="হোয়াটসঅ্যাপ মেসেজ"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>

                              {/* SMS */}
                              <a
                                href={`sms:${cleanPhone}`}
                                className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-transform active:scale-95"
                                title="এসএমএস পাঠান"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-amber-400 italic">
                              মোবাইল নাম্বার দেওয়া হয়নি
                            </span>
                            <button
                              onClick={() => handleStartEditPhone(youth)}
                              className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>নাম্বার যোগ করুন</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions: Emergency Alarm for this location */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
          <button
            onClick={() => {
              onTriggerAlarmAtLocation(location);
              onClose();
            }}
            className="flex-1 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold py-3 px-4 rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <AlertTriangle className="w-5 h-5 animate-bounce" />
            <span>এই স্থানে জরুরি সাইরেন বাজান</span>
          </button>
        </div>

      </div>
    </div>
  );
};
