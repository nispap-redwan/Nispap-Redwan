import React, { useState } from 'react';
import { DEVELOPER_INFO, VillageLocation } from '../data/villageData';
import { 
  Shield, 
  Heart, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Users, 
  HelpCircle, 
  PlusCircle, 
  CheckCircle,
  AlertTriangle,
  Award,
  Share2
} from 'lucide-react';

interface AboutVillageAndDeveloperProps {
  locations: VillageLocation[];
  onAddNewLocation: (data: {
    name: string;
    roadOrArea: string;
    lat: number;
    lng: number;
    type: 'house' | 'shop' | 'mosque' | 'temple' | 'road_point';
    youthName?: string;
    youthPhone?: string;
  }) => Promise<void>;
}

export const AboutVillageAndDeveloper: React.FC<AboutVillageAndDeveloperProps> = ({
  locations,
  onAddNewLocation
}) => {
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [spotName, setSpotName] = useState('');
  const [roadArea, setRoadArea] = useState('পোড়াপারা রোড');
  const [spotType, setSpotType] = useState<'house' | 'shop' | 'mosque' | 'temple' | 'road_point'>('house');
  const [youthName, setYouthName] = useState('');
  const [youthPhone, setYouthPhone] = useState('');
  const [lat, setLat] = useState('23.698172');
  const [lng, setLng] = useState('89.515353');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const cleanDevPhone = DEVELOPER_INFO.phone.replace(/[^0-9]/g, '');

  const handleSubmitSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotName.trim()) return;
    setSubmitting(true);
    try {
      await onAddNewLocation({
        name: spotName.trim(),
        roadOrArea: roadArea,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        type: spotType,
        youthName: youthName.trim() || undefined,
        youthPhone: youthPhone.trim() || undefined
      });
      setSuccessMsg(true);
      setSpotName('');
      setYouthName('');
      setYouthPhone('');
      setTimeout(() => {
        setSuccessMsg(false);
        setShowAddSpotModal(false);
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Developer Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-3xl shadow-xl border-2 border-amber-200">
              🛡️
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-amber-400 rounded-full p-1 border border-amber-500/50 shadow">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/30 font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>অ্যাপ প্রস্তুতকারক ও প্রযুক্তি উদ্যোক্তা</span>
            </div>

            <h2 className="text-2xl font-black text-white">
              {DEVELOPER_INFO.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300">
              গ্রামের শান্তি, নিরাপত্তা ও পারস্পরিক সুরক্ষার লক্ষ্যে স্যাটেলাইট প্রযুক্তির এই জরুরি এলার্ম নেটওয়ার্ক প্রস্তুত করেছেন।
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                {DEVELOPER_INFO.village}
              </span>
            </div>

            {/* Greetings from user prompt */}
            <p className="text-xs text-amber-400 font-semibold italic pt-1">
              {DEVELOPER_INFO.greetings}
            </p>

            {/* Developer Contact CTA */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <a
                href={`tel:${cleanDevPhone}`}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>সরাসরি কল ({DEVELOPER_INFO.phone})</span>
              </a>

              <a
                href={`https://wa.me/88${cleanDevPhone}`}
                target="_blank"
                rel="noreferrer"
                className="bg-green-700 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-transform active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>হোয়াটসঅ্যাপ চ্যাট</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Village Protection Squad Guidelines */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>গ্রামের নিরাপত্তা ও সচেতন যুবকদের দায়িত্বসমূহ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
            <p className="font-bold text-amber-300 text-sm">১. রাতকালীন পাহারা ও নজরদারি</p>
            <p className="text-slate-300">
              পোড়াপারা রোড, মেছুয়াঘাটা ও চড়দক্ষিনবাড়ি রোডে পর্যায়ক্রমে যুবকরা টহল নিশ্চিত করবেন।
            </p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
            <p className="font-bold text-emerald-400 text-sm">২. জরুরি এলার্মে তাৎক্ষণিক সাড়া</p>
            <p className="text-slate-300">
              এপের সাইরেন বাজা মাত্রই সংকেতদাতার লোকেশনে দলবদ্ধভাবে পৌঁছান এবং লাঠি/টর্চ সাথে রাখুন।
            </p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
            <p className="font-bold text-cyan-400 text-sm">৩. অপরিচিত ব্যক্তি যাচাই</p>
            <p className="text-slate-300">
              গভীর রাতে অচেনা বাহন বা সন্দেহজনক ব্যক্তির দেখা পেলে শালীনভাবে পরিচয় ও কারণ জিজ্ঞাসা করুন।
            </p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
            <p className="font-bold text-rose-400 text-sm">৪. জাতীয় জরুরি সেবা ৯৯৯</p>
            <p className="text-slate-300">
              আইন নিজের হাতে তুলে না নিয়ে গুরুতর পরিস্থিতিতে দ্রুত পুলিশ ও প্রশাসনের সহায়তা নিন।
            </p>
          </div>
        </div>
      </div>

      {/* Add New Spot or House to Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-400" />
            <span>নতুন বাড়ি, দোকান বা পয়েন্ট যুক্ত করতে চান?</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            গ্রামের কোনো বাড়ি বা রাস্তা যদি তালিকায় না থাকে, তবে এখনই যুক্ত করে নিন।
          </p>
        </div>

        <button
          onClick={() => setShowAddSpotModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 whitespace-nowrap transition-transform active:scale-95"
        >
          নতুন স্থান যোগ করুন
        </button>
      </div>

      {/* Modal for adding new spot */}
      {showAddSpotModal && (
        <div className="fixed inset-0 z-[2500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-amber-400">নতুন স্থান ও যুবক অন্তর্ভুক্তিকরণ</h3>
              <button
                onClick={() => setShowAddSpotModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {successMsg ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="font-bold text-white">সফলভাবে যুক্ত হয়েছে!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitSpot} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">স্থানের নাম / বাড়ির নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মনিরের বাড়ি বা তালগাছ তলা মোড়"
                    value={spotName}
                    onChange={e => setSpotName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">এলাকা / রাস্তা</label>
                    <select
                      value={roadArea}
                      onChange={e => setRoadArea(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white"
                    >
                      <option value="পোড়াপারা রোড">পোড়াপারা রোড</option>
                      <option value="মেছুয়াঘাটা">মেছুয়াঘাটা</option>
                      <option value="চড়দক্ষিনবাড়ি রোড">চড়দক্ষিনবাড়ি রোড</option>
                      <option value="আদিবাসী পাড়া">আদিবাসী পাড়া</option>
                      <option value="অন্যান্য গ্রামীণ সড়ক">অন্যান্য সড়ক</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">স্থানের ধরন</label>
                    <select
                      value={spotType}
                      onChange={e => setSpotType(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white"
                    >
                      <option value="house">🏠 বসতবাড়ি</option>
                      <option value="shop">🏪 দোকান / মোড়</option>
                      <option value="mosque">🕌 মসজিদ সংলগ্ন</option>
                      <option value="temple">🛕 মন্দির সংলগ্ন</option>
                      <option value="road_point">🛣️ সড়ক পয়েন্ট</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2 space-y-2">
                  <p className="text-amber-400 font-bold">এই স্থানের সচেতন যুবকের তথ্য (ঐচ্ছিক):</p>
                  <input
                    type="text"
                    placeholder="যুবকের নাম"
                    value={youthName}
                    onChange={e => setYouthName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                  <input
                    type="tel"
                    placeholder="মোবাইল নাম্বার (যেমন: 018...)"
                    value={youthPhone}
                    onChange={e => setYouthPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddSpotModal(false)}
                    className="bg-slate-800 text-slate-400 px-4 py-2 rounded-xl"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl disabled:opacity-50"
                  >
                    {submitting ? 'যুক্ত হচ্ছে...' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer copyright and village solidarity */}
      <div className="text-center text-xs text-slate-500 py-4 border-t border-slate-800/80 space-y-1">
        <p className="text-slate-400 font-medium">
          গ্রামের একতা ও নিরাপত্তা আমাদের অঙ্গীকার • কোনো সংকটে সবাই এগিয়ে আসুন
        </p>
        <p className="text-amber-500/80 font-mono text-[11px]">
          কারিগরী প্রস্তুতকারক: মোঃ আব্দুল মমিন রেদোয়ান (০১৮২২০৫৯০০১)
        </p>
      </div>

    </div>
  );
};
