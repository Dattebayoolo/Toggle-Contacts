import type { EmergencyService, Label } from '../types/contact';

/**
 * Default label categories pre-seeded for every new account.
 * These are real labels users need — not mock data.
 */
export const INITIAL_LABELS: Label[] = [
  { id: 'family',    name: 'Family',    urduName: 'خاندان',         color: '#10B981', isSystem: true },
  { id: 'friends',   name: 'Friends',   urduName: 'دوست',           color: '#3B82F6', isSystem: true },
  { id: 'work',      name: 'Work',      urduName: 'دفتر',           color: '#8B5CF6', isSystem: true },
  { id: 'business',  name: 'Business',  urduName: 'دکان / کاروبار', color: '#F59E0B', isSystem: true },
  { id: 'emergency', name: 'Emergency', urduName: 'ہنگامی رابطہ',  color: '#EF4444', isSystem: true },
];

/**
 * Official Pakistani emergency & public service helplines.
 * These are factual government / welfare numbers — not demo data.
 */
export const PAKISTANI_EMERGENCY_SERVICES: EmergencyService[] = [
  {
    id: 'rescue-1122',
    name: 'Rescue 1122 (Medical & Fire)',
    urduName: 'ریسکیو 1122 ایمرجنسی سروس',
    shortCode: '1122',
    fullPhone: '042-1122',
    category: 'Rescue & Fire',
    description: 'Emergency ambulance, fire rescue, and disaster relief across Punjab, KPK, & AJK.',
    badgeColor: '#EF4444',
    isAvailable24_7: true,
  },
  {
    id: 'edhi-115',
    name: 'Edhi Ambulance Foundation',
    urduName: 'ایدھی فاؤنڈیشن ایمبولینس',
    shortCode: '115',
    fullPhone: '021-32413232',
    category: 'Medical',
    description: "Pakistan's largest 24/7 free/low-cost nationwide emergency ambulance network.",
    badgeColor: '#10B981',
    isAvailable24_7: true,
  },
  {
    id: 'police-15',
    name: 'Police Emergency Helpline (Madadgar)',
    urduName: 'پولیس مددگار 15',
    shortCode: '15',
    fullPhone: '15',
    category: 'Police & Security',
    description: 'Immediate police response, crime reporting, and city emergency dispatch.',
    badgeColor: '#3B82F6',
    isAvailable24_7: true,
  },
  {
    id: 'chhipa-1020',
    name: 'Chhipa Ambulance Service',
    urduName: 'چھیپا ویلفیئر ایمبولینس',
    shortCode: '1020',
    fullPhone: '021-111-111-020',
    category: 'Medical',
    description: 'Rapid 24/7 emergency response and free ambulance fleet in Sindh and major cities.',
    badgeColor: '#F59E0B',
    isAvailable24_7: true,
  },
  {
    id: 'motorway-130',
    name: 'National Highways & Motorway Police',
    urduName: 'موٹروے پولیس ہیلپ لائن 130',
    shortCode: '130',
    fullPhone: '051-9320293',
    category: 'Highway',
    description: '24/7 highway assistance, accidents, vehicle breakdowns, and travel advisories.',
    badgeColor: '#059669',
    isAvailable24_7: true,
  },
  {
    id: 'fire-16',
    name: 'Fire Brigade Emergency',
    urduName: 'فائر بریگیڈ 16',
    shortCode: '16',
    fullPhone: '16',
    category: 'Rescue & Fire',
    description: 'City municipal fire fighting and building hazard rescue.',
    badgeColor: '#DC2626',
    isAvailable24_7: true,
  },
  {
    id: 'fia-9911',
    name: 'FIA Cyber Crime Reporting',
    urduName: 'ایف آئی اے سائبر کرائم ونگ',
    shortCode: '9911',
    fullPhone: '051-9106384',
    category: 'Police & Security',
    description: 'Reporting online harassment, financial fraud, blackmail, and cyber crimes.',
    badgeColor: '#6366F1',
    isAvailable24_7: false,
  },
  {
    id: 'women-1099',
    name: 'National Women Protection Helpline',
    urduName: 'قومی خواتین تحفظ ہیلپ لائن',
    shortCode: '1099',
    fullPhone: '1099',
    category: 'Human Rights',
    description: 'Ministry of Human Rights helpline for women legal assistance and crisis support.',
    badgeColor: '#EC4899',
    isAvailable24_7: true,
  },
  {
    id: 'railway-117',
    name: 'Pakistan Railways Enquiry',
    urduName: 'پاکستان ریلویز معلوماتی ہیلپ لائن',
    shortCode: '117',
    fullPhone: '117',
    category: 'Utility',
    description: 'Train timings, reservation status, and passenger assistance.',
    badgeColor: '#0284C7',
    isAvailable24_7: true,
  },
];
