import React, { useState } from 'react';
import { VillageLocation, ConsciousYouth, NATIONAL_EMERGENCY_NUMBERS } from '../data/villageData';
import { 
  Search, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Star, 
  Edit3, 
  Plus, 
  Send, 
  ShieldCheck, 
  PhoneCall, 
  Users,
  Compass
} from 'lucide-react';

interface YouthDirectoryProps {
  locations: VillageLocation[];
  onFlyToLocationOnMap: (location: VillageLocation) => void;
  onUpdateYouthPhone: (locationId: string, youthId: string, newPhone: string, name?: string) => Promise<void>;
  onTriggerAlarmAtLocation: (location: VillageLocation) => void;
}

export const YouthDirectory: React.FC<YouthDirectoryProps> = ({
  locations,
  onFlyToLocationOnMap,
  onUpdateYouthPhone,
  onTriggerAlarmAtLocation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoad, setSelectedRoad] = useState('all');
  const [editingYouth, setEditingYouth] = useState<{ locId: string; youthId: string; phone: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Flatten all youths with their parent location
  const allYouthEntries: Array<{ youth: ConsciousYouth; location: VillageLocation }> = [];
  locations.forEach(loc => {
    loc.youths.forEach(y => {
      allYouthEntries.push({ youth: y, location: loc });
    });
  });

  const totalYouthCount = allYouthEntries.length;
  const withPhoneCount = allYouthEntries.filter(e => !!e.youth.phone).length;

  const filteredEntries = allYouthEntries.filter(({ youth, location }) => {
    if (selectedRoad !== 'all') {
      if (!location.roadOrArea.toLowerCase().includes(selectedRoad.toLowerCase())) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = youth.name.toLowerCase().includes(q);
      const matchPhone = youth.phone.includes(q);
      const matchLoc = location.name.toLowerCase().includes(q) || location.roadOrArea.toLowerCase().includes(q);
      return matchName || matchPhone || matchLoc;
    }

    return true;
  });

  const handleSavePhone = async () => {
    if (!editingYouth) return;
    setSaving(true);
    try {
      await onUpdateYouthPhone(editingYouth.locId, editingYouth.youthId, editingYouth.phone.trim());
      setEditingYouth(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Directory Header & Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                গ্রামের সচেতন যুবকদের ডিরেক্টরি
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              জরুরি প্রয়োজনে যেকোনো সচেতন ভাইয়ের সাথে সরাসরি কল বা মেসেজে যোগাযোগ করুন।
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-center px-2">
              <p className="text-lg font-black text-amber-400 font-mono">{totalYouthCount}</p>
              <p className="text-[10px] text-slate-400">মোট যুবক</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div className="text-center px-2">
              <p className="text-lg font-black text-emerald-400 font-mono">{withPhoneCount}</p>
              <p className="text-[10px] text-slate-400">সক্রিয় নাম্বার</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div className="text-center px-2">
              <p className="text-lg font-black text-cyan-400 font-mono">{locations.length}</p>
              <p className="text-[10px] text-slate-400">রক্ষিত বাড়ি</p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search className="w-5 h-5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="সচেতন যুবকের নাম, ফোন নাম্বার বা বাড়ির নাম লিখে খুঁজুন..."
            className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg"
            >
              রিসেট
            </button>
          )}
        </div>

        {/* Road/Area Filter Pills */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'সকল এলাকা' },
            { id: 'পোড়াপারা', label: 'পোড়াপারা রোড' },
            { id: 'মেছুয়াঘাটা', label: 'মেছুয়াঘাটা এলাকা' },
            { id: 'চড়দক্ষিনবাড়ি', label: 'চড়দক্ষিনবাড়ি রোড' },
            { id: 'আদিবাসী', label: 'আদিবাসী পাড়া / মন্দির' },
            { id: 'তুহিন', label: 'তুহিনের দোকান সংলগ্ন' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRoad(r.id)}
              className={`text-xs px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all border ${
                selectedRoad === r.id
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick National Helpline Numbers Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {NATIONAL_EMERGENCY_NUMBERS.map(num => (
          <a
            key={num.number}
            href={`tel:${num.number}`}
            className="bg-slate-900 border border-slate-800 hover:border-red-500/50 p-3 rounded-2xl flex items-center justify-between shadow transition-all hover:bg-slate-850"
          >
            <div>
              <p className="text-xs text-slate-400">{num.name}</p>
              <p className="text-xs text-slate-500">{num.note}</p>
            </div>
            <span className="font-mono text-base font-extrabold text-red-400 bg-red-950/80 px-2.5 py-1 rounded-xl border border-red-900">
              📞 {num.number}
            </span>
          </a>
        ))}
      </div>

      {/* Youths Cards Grid */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
            কোনো সচেতন যুবক পাওয়া যায়নি। সার্চ কিওয়ার্ড পরিবর্তন করে আবার চেষ্টা করুন।
          </div>
        ) : (
          filteredEntries.map(({ youth, location }) => {
            const isEditing = editingYouth?.youthId === youth.id;
            const cleanPhone = youth.phone.replace(/[^0-9]/g, '');

            return (
              <div
                key={`${location.id}-${youth.id}`}
                className={`p-4 rounded-3xl border transition-all ${
                  youth.isDeveloper
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-amber-500/60 shadow-xl ring-1 ring-amber-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-white">
                        {youth.name}
                      </span>

                      {youth.isDeveloper && (
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                          <Star className="w-3 h-3 fill-slate-950" />
                          <span>অ্যাপ প্রস্তুতকারক</span>
                        </span>
                      )}

                      <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700">
                        {youth.role || 'সচেতন সদস্য'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{location.name}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{location.roadOrArea}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View on Satellite Map */}
                    <button
                      onClick={() => onFlyToLocationOnMap(location)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-transform active:scale-95"
                      title="স্যাটেলাইট ম্যাপে এই বাড়ি দেখুন"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>ম্যাপে অবস্থান</span>
                    </button>

                    {/* Phone button if available */}
                    {youth.phone ? (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>কল ({youth.phone})</span>
                        </a>

                        <a
                          href={`https://wa.me/88${cleanPhone.startsWith('88') ? cleanPhone.slice(2) : cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-green-700 hover:bg-green-600 text-white text-xs font-bold p-2 rounded-xl shadow transition-transform active:scale-95"
                          title="হোয়াটসঅ্যাপ"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => setEditingYouth({ locId: location.id, youthId: youth.id, phone: youth.phone })}
                          className="text-slate-400 hover:text-white p-2"
                          title="নাম্বার পরিবর্তন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingYouth({ locId: location.id, youthId: youth.id, phone: '' })}
                        className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-xl font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>মোবাইল নাম্বার যোগ করুন</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline edit phone drawer */}
                {isEditing && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
                    <input
                      type="tel"
                      value={editingYouth.phone}
                      onChange={e => setEditingYouth({ ...editingYouth, phone: e.target.value })}
                      placeholder="মোবাইল নাম্বার লিখুন (যেমন: 01822...)"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      autoFocus
                    />
                    <button
                      onClick={handleSavePhone}
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-1.5 rounded-xl font-bold"
                    >
                      {saving ? 'সংরক্ষণ হচ্ছে...' : 'সেভ'}
                    </button>
                    <button
                      onClick={() => setEditingYouth(null)}
                      className="text-slate-400 hover:text-white text-xs px-2"
                    >
                      বাতিল
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
