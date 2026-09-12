import type { PakistaniProvince } from '../types/contact';

export interface CNICAnalysis {
  isValid: boolean;
  formatted: string;
  province?: PakistaniProvince;
  gender?: 'Male' | 'Female';
  divisionCode?: string;
  error?: string;
}

const PROVINCE_CODES: Record<string, PakistaniProvince> = {
  '1': 'Khyber Pakhtunkhwa',
  '2': 'Khyber Pakhtunkhwa', // Formerly FATA
  '3': 'Punjab',
  '4': 'Sindh',
  '5': 'Balochistan',
  '6': 'Islamabad Capital Territory',
  '7': 'Azad Jammu & Kashmir',
  '8': 'Gilgit-Baltistan',
};

/**
 * Strips all non-digit characters from raw CNIC string.
 */
export function cleanCNIC(raw: string): string {
  if (!raw) return '';
  return raw.replace(/[^0-9]/g, '');
}

/**
 * Formats a CNIC into standard XXXXX-XXXXXXX-X display format.
 */
export function formatCNIC(raw: string): string {
  const digits = cleanCNIC(raw);
  if (!digits) return '';

  if (digits.length <= 5) {
    return digits;
  }
  if (digits.length <= 12) {
    return `${digits.substring(0, 5)}-${digits.substring(5)}`;
  }
  return `${digits.substring(0, 5)}-${digits.substring(5, 12)}-${digits.substring(12, 13)}`;
}

/**
 * Analyzes and validates a Pakistani CNIC.
 */
export function validatePakistaniCNIC(raw: string): CNICAnalysis {
  const digits = cleanCNIC(raw);

  if (!digits) {
    return {
      isValid: false,
      formatted: '',
      error: 'CNIC cannot be empty',
    };
  }

  if (digits.length !== 13) {
    return {
      isValid: false,
      formatted: formatCNIC(digits),
      error: `CNIC must have exactly 13 digits (currently ${digits.length})`,
    };
  }

  const provinceDigit = digits[0];
  const province = PROVINCE_CODES[provinceDigit] || 'Other';
  const divisionCode = digits.substring(0, 5);

  const lastDigit = parseInt(digits[12], 10);
  const gender: 'Male' | 'Female' = lastDigit % 2 !== 0 ? 'Male' : 'Female';

  return {
    isValid: true,
    formatted: formatCNIC(digits),
    province,
    gender,
    divisionCode,
  };
}
