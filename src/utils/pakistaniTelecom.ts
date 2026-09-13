import type { TelecomInfo, TelecomOperator } from '../types/contact';

export const TELECOM_OPERATORS: Record<TelecomOperator, TelecomInfo> = {
  jazz: {
    operator: 'jazz',
    displayName: 'Jazz',
    urduName: 'جاز',
    brandColor: '#E11926',
    textColor: '#FFFFFF',
    badgeBg: 'rgba(225, 25, 38, 0.12)',
    logoText: 'Jazz',
  },
  zong: {
    operator: 'zong',
    displayName: 'Zong 4G',
    urduName: 'زونگ',
    brandColor: '#7DBA00',
    textColor: '#0F2900',
    badgeBg: 'rgba(125, 186, 0, 0.15)',
    logoText: 'Zong',
  },
  telenor: {
    operator: 'telenor',
    displayName: 'Telenor',
    urduName: 'ٹیلی نار',
    brandColor: '#00A9E0',
    textColor: '#00334E',
    badgeBg: 'rgba(0, 169, 224, 0.15)',
    logoText: 'Telenor',
  },
  ufone: {
    operator: 'ufone',
    displayName: 'Ufone 4G',
    urduName: 'یو فون',
    brandColor: '#F58220',
    textColor: '#3A1E00',
    badgeBg: 'rgba(245, 130, 32, 0.15)',
    logoText: 'Ufone',
  },
  scom: {
    operator: 'scom',
    displayName: 'SCOM (AJK/GB)',
    urduName: 'ایس کام',
    brandColor: '#005C30',
    textColor: '#FFFFFF',
    badgeBg: 'rgba(0, 92, 48, 0.15)',
    logoText: 'SCOM',
  },
  onic: {
    operator: 'onic',
    displayName: 'Onic',
    urduName: 'اونِک',
    brandColor: '#6B21A8',
    textColor: '#FFFFFF',
    badgeBg: 'rgba(107, 33, 168, 0.15)',
    logoText: 'Onic',
  },
  other: {
    operator: 'other',
    displayName: 'Landline / Other',
    urduName: 'دیگر',
    brandColor: '#64748B',
    textColor: '#0F172A',
    badgeBg: 'rgba(100, 116, 139, 0.12)',
    logoText: 'PK',
  },
};

/**
 * Normalizes any phone string to clean digits, handling +92, 0092, 03XX, etc.
 */
export function cleanPhoneNumber(raw: string): string {
  if (!raw) return '';
  return raw.replace(/[^0-9]/g, '');
}

/**
 * Detects Pakistani Telecom Operator based on 4-digit mobile prefix (03XX).
 */
export function detectPakistaniOperator(rawPhone: string): TelecomOperator {
  const digits = cleanPhoneNumber(rawPhone);
  if (!digits) return 'other';

  // Normalize to 03XX format
  let prefix = '';
  if (digits.startsWith('923') && digits.length >= 5) {
    prefix = '0' + digits.substring(2, 5); // 92300... -> 0300
  } else if (digits.startsWith('00923') && digits.length >= 7) {
    prefix = '0' + digits.substring(4, 7);
  } else if (digits.startsWith('03') && digits.length >= 4) {
    prefix = digits.substring(0, 4);
  } else if (digits.startsWith('3') && digits.length >= 3) {
    prefix = '0' + digits.substring(0, 3);
  }

  if (!prefix) {
    return 'other';
  }

  // SCOM (0355 in AJK / Gilgit Baltistan)
  if (prefix === '0355') return 'scom';

  // Onic (0319)
  if (prefix === '0319') return 'onic';

  // Jazz / Mobilink (0300 - 0309) & Warid (0320 - 0325)
  if (/^030[0-9]$/.test(prefix) || /^032[0-5]$/.test(prefix)) {
    return 'jazz';
  }

  // Zong / CMPak (0310 - 0318)
  if (/^031[0-8]$/.test(prefix)) {
    return 'zong';
  }

  // Ufone (0330 - 0337)
  if (/^033[0-7]$/.test(prefix)) {
    return 'ufone';
  }

  // Telenor (0340 - 0349)
  if (/^034[0-9]$/.test(prefix)) {
    return 'telenor';
  }

  return 'other';
}

export const PAKISTANI_LANDLINE_AREA_CODES: Record<string, string> = {
  '021': 'Karachi',
  '042': 'Lahore',
  '051': 'Islamabad / Rawalpindi',
  '041': 'Faisalabad',
  '061': 'Multan',
  '091': 'Peshawar',
  '081': 'Quetta',
  '052': 'Sialkot',
  '055': 'Gujranwala',
  '053': 'Gujrat',
  '048': 'Sargodha',
  '062': 'Bahawalpur',
  '071': 'Sukkur',
  '022': 'Hyderabad',
  '0992': 'Abbottabad',
  '05822': 'Muzaffarabad',
  '05811': 'Gilgit',
};

/**
 * Detects if a phone number corresponds to a Pakistani landline with city name.
 */
export function detectPakistaniLandline(rawPhone: string): {
  isLandline: boolean;
  city?: string;
  areaCode?: string;
} {
  const digits = cleanPhoneNumber(rawPhone);
  if (!digits) return { isLandline: false };

  let standardDigits = digits;
  if (standardDigits.startsWith('92')) {
    standardDigits = '0' + standardDigits.substring(2);
  } else if (standardDigits.startsWith('0092')) {
    standardDigits = '0' + standardDigits.substring(4);
  }

  if (standardDigits.startsWith('03')) {
    return { isLandline: false };
  }

  for (const len of [5, 4, 3]) {
    if (standardDigits.length >= len + 5) {
      const code = standardDigits.substring(0, len);
      if (PAKISTANI_LANDLINE_AREA_CODES[code]) {
        return {
          isLandline: true,
          city: PAKISTANI_LANDLINE_AREA_CODES[code],
          areaCode: code,
        };
      }
    }
  }

  return { isLandline: false };
}

/**
 * Formats a Pakistani phone number into standard human-friendly format:
 * e.g. 0300 1234567 or +92 300 1234567, or 042 35889900 for landlines
 */
export function formatPakistaniPhone(raw: string, includeCountryCode = false): string {
  if (!raw) return '';
  const digits = cleanPhoneNumber(raw);

  let local = '';
  if (digits.startsWith('92') && digits.length >= 10) {
    local = digits.substring(2);
  } else if (digits.startsWith('0') && digits.length >= 9) {
    local = digits.substring(1);
  } else {
    local = digits;
  }

  // Mobile numbers (starts with 3, 10 digits)
  if (local.length === 10 && local.startsWith('3')) {
    const prefix = '0' + local.substring(0, 3);
    const suffix = local.substring(3);
    if (includeCountryCode) {
      return `+92 ${local.substring(0, 3)} ${suffix}`;
    }
    return `${prefix} ${suffix}`;
  }

  // Landline detection
  const landlineInfo = detectPakistaniLandline(raw);
  if (landlineInfo.isLandline && landlineInfo.areaCode) {
    const areaCodeLen = landlineInfo.areaCode.length;
    const std = digits.startsWith('92') ? '0' + digits.substring(2) : (digits.startsWith('0') ? digits : '0' + digits);
    const code = std.substring(0, areaCodeLen);
    const rest = std.substring(areaCodeLen);
    if (includeCountryCode) {
      return `+92 ${code.substring(1)} ${rest}`;
    }
    return `${code} ${rest}`;
  }

  // Short codes (e.g., 1122, 15)
  if (digits.length <= 5) {
    return digits;
  }

  return raw;
}

/**
 * Formats number for WhatsApp URL (923XXXXXXXXX)
 */
export function getWhatsAppUrl(rawPhone: string, defaultText = ''): string | null {
  const digits = cleanPhoneNumber(rawPhone);
  if (!digits) return null;

  let waNumber = '';
  if (digits.startsWith('923') && digits.length === 12) {
    waNumber = digits;
  } else if (digits.startsWith('03') && digits.length === 11) {
    waNumber = '92' + digits.substring(1);
  } else if (digits.startsWith('3') && digits.length === 10) {
    waNumber = '92' + digits;
  } else if (digits.length > 8) {
    waNumber = digits;
  } else {
    return null; // emergency short code or invalid
  }

  const encoded = defaultText ? `?text=${encodeURIComponent(defaultText)}` : '';
  return `https://wa.me/${waNumber}${encoded}`;
}
