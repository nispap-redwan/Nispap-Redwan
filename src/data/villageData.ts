export interface ConsciousYouth {
  id: string;
  name: string;
  phone: string;
  role?: string;
  isDeveloper?: boolean;
}

export interface VillageLocation {
  id: string;
  name: string;
  roadOrArea: string;
  mapCode?: string;
  lat: number;
  lng: number;
  description?: string;
  type: 'house' | 'shop' | 'mosque' | 'temple' | 'road_point';
  youths: ConsciousYouth[];
}

export const BASE_CENTER: [number, number] = [23.698172, 89.515353]; // 23°41'53.42"N 89°30'55.27"E

export const INITIAL_LOCATIONS: VillageLocation[] = [
  {
    id: 'loc-1',
    name: 'শান্তদের বাড়ি ও তুহিনের দোকান সংলগ্ন',
    roadOrArea: 'পোড়াপারা রোড',
    mapCode: `23°41'53.42"N 89°30'55.27"E`,
    lat: 23.698172,
    lng: 89.515353,
    type: 'house',
    description: 'তুহিনের দোকান সংলগ্ন, পোড়াপারা রোড, শান্তদের বাড়ি (মূল রেফারেন্স পয়েন্ট)',
    youths: [
      { id: 'y-1', name: 'শান্ত', phone: '01625387965', role: 'নিরাপত্তা সংগঠক' },
      { id: 'y-2', name: 'সাকিব', phone: '', role: 'সচেতন সদস্য' }
    ]
  },
  {
    id: 'loc-2',
    name: 'পোড়াপারা রোড মোড়',
    roadOrArea: 'পোড়াপারা রোড',
    lat: 23.698650,
    lng: 89.514800,
    type: 'road_point',
    description: 'পোড়াপারা রোড প্রধান সংযোগস্থল',
    youths: [
      { id: 'y-3', name: 'হাসান', phone: '01825041888', role: 'জরুরি সাড়াদানকারী' }
    ]
  },
  {
    id: 'loc-3',
    name: 'ছাবের শেখের বাড়ি',
    roadOrArea: 'পোড়াপারা রোড',
    lat: 23.699100,
    lng: 89.514300,
    type: 'house',
    description: 'পোড়াপারা রোড, ছাবের শেখের বাড়ি',
    youths: [
      { id: 'y-4', name: 'ছাব্বির শেখ', phone: '01806846919', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-4',
    name: 'জাকির ডাক্তারের বাড়ি',
    roadOrArea: 'পোড়াপারা রোড',
    lat: 23.699550,
    lng: 89.513900,
    type: 'house',
    description: 'পোড়াপারা রোড, জাকির ডাক্তারের বাড়ি',
    youths: [
      { id: 'y-5', name: 'রাব্বি', phone: '01885730583', role: 'চিকিৎসা ও ফার্স্ট এইড সহকারী' },
      { id: 'y-6', name: 'নাহিদ', phone: '', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-5',
    name: 'মেছুয়াঘাটা ২নং মসজিদ সংলগ্ন ছায়েদ মেম্বারের বাড়ি',
    roadOrArea: 'মেছুয়াঘাটা',
    lat: 23.697400,
    lng: 89.516800,
    type: 'mosque',
    description: 'মেছুয়াঘাটা ২নং মসজিদ সংলগ্ন, ছায়েদ মেম্বারের বাড়ি',
    youths: [
      { id: 'y-7', name: 'মাসুদ রানা', phone: '01770163834', role: 'এলাকা সমন্বয়ক' },
      { id: 'y-8', name: 'আল-আমিন', phone: '', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-6',
    name: 'সাহালমের বাড়ি',
    roadOrArea: 'মেছুয়াঘাটা',
    lat: 23.696850,
    lng: 89.517500,
    type: 'house',
    description: 'মেছুয়াঘাটা, সাহালমের বাড়ি',
    youths: [
      { id: 'y-9', name: 'রেজাউল ইসলাম', phone: '01725911840', role: 'সুরক্ষা পেট্রোল' },
      { id: 'y-10', name: 'রমজান', phone: '01874-746388', role: 'সচেতন যুবক' },
      { id: 'y-11', name: 'লিটন ড্রাইভার', phone: '', role: 'জরুরি পরিবহন সাপোর্ট' }
    ]
  },
  {
    id: 'loc-7',
    name: 'তুহিনের দোকান ও ২ নং মসজিদ সংলগ্ন',
    roadOrArea: 'মেছুয়াঘাটা রোড',
    lat: 23.697800,
    lng: 89.516100,
    type: 'shop',
    description: 'তুহিনের দোকান মেছুয়াঘাটা রোড, ২ নং মসজিদ সংলগ্ন',
    youths: [
      { id: 'y-12', name: 'ইদ্রিস শেখ', phone: '01880535649', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-8',
    name: 'তুহিনের দোকান ও কুরবানের দোকান মোড়',
    roadOrArea: 'চড়দক্ষিনবাড়ি রোড',
    lat: 23.697200,
    lng: 89.514600,
    type: 'shop',
    description: 'তুহিনের দোকান সংলগ্ন, কুরবানের দোকান চড়দক্ষিনবাড়ি রোড',
    youths: [
      { id: 'y-13', name: 'রাসেল শেখ', phone: '', role: 'সচেতন যুবক' },
      { id: 'y-14', name: 'রাহাদ শেখ', phone: '01877825914', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-9',
    name: 'ভুট্টর বাড়ি',
    roadOrArea: 'তুহিনের দোকান সংলগ্ন',
    lat: 23.698400,
    lng: 89.515900,
    type: 'house',
    description: 'তুহিনের দোকান সংলগ্ন, ভুট্টর বাড়ি',
    youths: [
      { id: 'y-15', name: 'মহসিন', phone: '01855906164', role: 'নিরাপত্তা প্রহরী' }
    ]
  },
  {
    id: 'loc-10',
    name: 'হাসেমের বাড়ি',
    roadOrArea: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড',
    lat: 23.696400,
    lng: 89.514000,
    type: 'house',
    description: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড, হাসেমের বাড়ি',
    youths: [
      { id: 'y-16', name: 'আল-ইমরান', phone: '01706400052', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-11',
    name: 'গাজীর বাড়ি',
    roadOrArea: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড',
    lat: 23.695800,
    lng: 89.513600,
    type: 'house',
    description: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড, গাজীর বাড়ি',
    youths: [
      { id: 'y-17', name: 'অনিক', phone: '01850314903', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-12',
    name: 'সরকার বাড়ি',
    roadOrArea: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড',
    lat: 23.695300,
    lng: 89.513100,
    type: 'house',
    description: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড, সরকার বাড়ি',
    youths: [
      { id: 'y-18', name: 'সজীব মোল্লা', phone: '01812908525', role: 'সচেতন যুবক' },
      { id: 'y-19', name: 'উৎস মোল্লা', phone: '01767-845693', role: 'সুরক্ষা পেট্রোল' }
    ]
  },
  {
    id: 'loc-13',
    name: 'নুরুজ্জামান মুহুরির বাড়ি (ডেভেলপারের বাড়ি)',
    roadOrArea: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড',
    lat: 23.694800,
    lng: 89.512600,
    type: 'house',
    description: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড, নুরুজ্জামান মুহুরির বাড়ি',
    youths: [
      { 
        id: 'y-20', 
        name: 'মোঃ আব্দুল মমিন রেদোয়ান', 
        phone: '01822059001', 
        role: 'অ্যাপ প্রস্তুতকারক ও প্রযুক্তি সমন্বয়ক', 
        isDeveloper: true 
      },
      { id: 'y-21', name: 'আল-আমিন', phone: '', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-14',
    name: 'কালাম বিশ্বাস এর বাড়ি',
    roadOrArea: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড',
    lat: 23.694200,
    lng: 89.512100,
    type: 'house',
    description: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড, কালাম বিশ্বাস এর বাড়ি',
    youths: [
      { id: 'y-22', name: 'ফজল বিশ্বাস', phone: '', role: 'সচেতন যুবক' },
      { id: 'y-23', name: 'রায়হান বিশ্বাস', phone: '', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-15',
    name: 'জালালের বাড়ি',
    roadOrArea: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড',
    lat: 23.693700,
    lng: 89.511600,
    type: 'house',
    description: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড, জালালের বাড়ি',
    youths: [
      { id: 'y-24', name: 'রুবেল', phone: '', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-16',
    name: 'কুরবানের বাড়ি',
    roadOrArea: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড',
    lat: 23.693200,
    lng: 89.511000,
    type: 'house',
    description: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড, কুরবানের বাড়ি',
    youths: [
      { id: 'y-25', name: 'হাবিব', phone: '', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-17',
    name: 'মেছুয়াঘাটা সর্বজনীন মন্দির ও আদিবাসী পাড়া',
    roadOrArea: 'আদিবাসী পাড়া / মেছুয়াঘাটা',
    lat: 23.696100,
    lng: 89.518300,
    type: 'temple',
    description: 'মেছুয়াঘাটা সর্বজনীন মন্দির, আদিবাসী পাড়া',
    youths: [
      { id: 'y-26', name: 'উতপল রায়', phone: '01624828716', role: 'সমাজ সেবক ও সমন্বয়কারী' },
      { id: 'y-27', name: 'শিমুল বাইক মিকার', phone: '01972831353', role: 'জরুরি মোটর মেকানিক ও বাইক সাপোর্ট' }
    ]
  },
  {
    id: 'loc-18',
    name: 'বিল্লালের বাড়ি (হুজুরের বাড়ি সংলগ্ন)',
    roadOrArea: 'মেছুয়াঘাটা',
    lat: 23.695400,
    lng: 89.517800,
    type: 'house',
    description: 'মেছুয়াঘাটা হুজুরের বাড়ি সংলগ্ন, বিল্লালের বাড়ি',
    youths: [
      { id: 'y-28', name: 'রাফি', phone: '01353748443', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-19',
    name: 'মেছুয়াঘাটা চাঁদার দোকান সংলগ্ন',
    roadOrArea: 'মেছুয়াঘাটা',
    lat: 23.697100,
    lng: 89.518900,
    type: 'shop',
    description: 'মেছুয়াঘাটা চাঁদার দোকান সংলগ্ন পয়েন্ট',
    youths: [
      { id: 'y-29', name: 'রিয়াজ খান', phone: '01643756093', role: 'সচেতন যুবক' }
    ]
  },
  {
    id: 'loc-20',
    name: 'চড়দক্ষিনবাড়ি রোড সংযোগ মোড়',
    roadOrArea: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড',
    lat: 23.692500,
    lng: 89.510400,
    type: 'road_point',
    description: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড দক্ষিণ প্রান্ত',
    youths: [
      { id: 'y-30', name: 'কাওছার', phone: '', role: 'সচেতন যুবক' },
      { id: 'y-31', name: 'মেহেদী', phone: '', role: 'সচেতন যুবক' }
    ]
  }
];

export const NATIONAL_EMERGENCY_NUMBERS = [
  { name: 'জাতীয় জরুরি সেবা', number: '999', note: 'পুলিশ, অ্যাম্বুলেন্স, ফায়ার সার্ভিস (ফ্রি কল)' },
  { name: 'সরকারি জরুরি তথ্যসেবা', number: '333', note: 'সরকারি সাহায্য ও দুর্যোগ বার্তা' },
  { name: 'নারী ও শিশু হেল্পলাইন', number: '109', note: 'নিরাপত্তা ও জরুরি সহায়তা' }
];

export const DEVELOPER_INFO = {
  name: 'মোঃ আব্দুল মমিন রেদোয়ান',
  role: 'অ্যাপ প্রস্তুতকারক ও সচেতন যুবক',
  phone: '01822059001',
  village: 'কুরবানের দোকান টু চড়দক্ষিনবাড়ি রোড, নুরুজ্জামান মুহুরির বাড়ি',
  greetings: 'শুভেচ্ছান্তে ~ মোঃ আব্দুল মমিন রেদোয়ান'
};
