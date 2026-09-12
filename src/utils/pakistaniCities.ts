import type { PakistaniProvince } from '../types/contact';

export interface PakistaniCity {
  name: string;
  urduName: string;
  province: PakistaniProvince;
}

export const PAKISTANI_PROVINCES: PakistaniProvince[] = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan',
  'Other',
];

export const PAKISTANI_CITIES: PakistaniCity[] = [
  // Punjab
  { name: 'Lahore', urduName: 'لاہور', province: 'Punjab' },
  { name: 'Faisalabad', urduName: 'فیصل آباد', province: 'Punjab' },
  { name: 'Rawalpindi', urduName: 'راولپنڈی', province: 'Punjab' },
  { name: 'Gujranwala', urduName: 'گوجرانوالہ', province: 'Punjab' },
  { name: 'Multan', urduName: 'ملتان', province: 'Punjab' },
  { name: 'Sialkot', urduName: 'سیالکوٹ', province: 'Punjab' },
  { name: 'Bahawalpur', urduName: 'بہاولپور', province: 'Punjab' },
  { name: 'Sargodha', urduName: 'سرگودھا', province: 'Punjab' },
  { name: 'Sheikhupura', urduName: 'شیخوپورہ', province: 'Punjab' },
  { name: 'Jhang', urduName: 'جھنگ', province: 'Punjab' },
  { name: 'Rahim Yar Khan', urduName: 'رحیم یار خان', province: 'Punjab' },
  { name: 'Gujrat', urduName: 'گجرات', province: 'Punjab' },
  { name: 'Kasur', urduName: 'قصور', province: 'Punjab' },
  { name: 'Sahiwal', urduName: 'ساہیوال', province: 'Punjab' },
  { name: 'Okara', urduName: 'اوکاڑہ', province: 'Punjab' },

  // Sindh
  { name: 'Karachi', urduName: 'کراچی', province: 'Sindh' },
  { name: 'Hyderabad', urduName: 'حیدرآباد', province: 'Sindh' },
  { name: 'Sukkur', urduName: 'سکھر', province: 'Sindh' },
  { name: 'Larkana', urduName: 'لاڑکانہ', province: 'Sindh' },
  { name: 'Nawabshah', urduName: 'نواب شاہ', province: 'Sindh' },
  { name: 'Mirpur Khas', urduName: 'میرپور خاص', province: 'Sindh' },

  // Khyber Pakhtunkhwa
  { name: 'Peshawar', urduName: 'پشاور', province: 'Khyber Pakhtunkhwa' },
  { name: 'Mardan', urduName: 'مردان', province: 'Khyber Pakhtunkhwa' },
  { name: 'Abbottabad', urduName: 'ایبٹ آباد', province: 'Khyber Pakhtunkhwa' },
  { name: 'Swat / Mingora', urduName: 'سوات / مینگورہ', province: 'Khyber Pakhtunkhwa' },
  { name: 'Dera Ismail Khan', urduName: 'ڈیرہ اسماعیل خان', province: 'Khyber Pakhtunkhwa' },
  { name: 'Kohat', urduName: 'کوہاٹ', province: 'Khyber Pakhtunkhwa' },
  { name: 'Haripur', urduName: 'ہری پور', province: 'Khyber Pakhtunkhwa' },

  // Balochistan
  { name: 'Quetta', urduName: 'کوئٹہ', province: 'Balochistan' },
  { name: 'Turbat', urduName: 'تربت', province: 'Balochistan' },
  { name: 'Khuzdar', urduName: 'خضدار', province: 'Balochistan' },
  { name: 'Gwadar', urduName: 'گوادر', province: 'Balochistan' },
  { name: 'Chaman', urduName: 'چمن', province: 'Balochistan' },

  // Federal Capital
  { name: 'Islamabad', urduName: 'اسلام آباد', province: 'Islamabad Capital Territory' },

  // Azad Jammu & Kashmir
  { name: 'Muzaffarabad', urduName: 'مظفر آباد', province: 'Azad Jammu & Kashmir' },
  { name: 'Mirpur (AJK)', urduName: 'میرپور', province: 'Azad Jammu & Kashmir' },
  { name: 'Rawalakot', urduName: 'راولا کوٹ', province: 'Azad Jammu & Kashmir' },

  // Gilgit-Baltistan
  { name: 'Gilgit', urduName: 'گلگت', province: 'Gilgit-Baltistan' },
  { name: 'Skardu', urduName: 'سکردو', province: 'Gilgit-Baltistan' },
  { name: 'Hunza', urduName: 'ہنزہ', province: 'Gilgit-Baltistan' },
];
