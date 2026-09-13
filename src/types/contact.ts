export type TelecomOperator =
  | 'jazz'
  | 'zong'
  | 'telenor'
  | 'ufone'
  | 'scom'
  | 'onic'
  | 'other';

export interface TelecomInfo {
  operator: TelecomOperator;
  displayName: string;
  urduName: string;
  brandColor: string;
  textColor: string;
  badgeBg: string;
  logoText: string;
}

export type PhoneType = 'mobile' | 'work' | 'home' | 'whatsapp' | 'other';

export interface PhoneNumber {
  id: string;
  number: string;
  type: PhoneType;
  operator?: TelecomOperator;
  isPrimary?: boolean;
  isPorted?: boolean;
}

export type EmailType = 'personal' | 'work' | 'other';

export interface EmailAddress {
  id: string;
  email: string;
  type: EmailType;
}

export type PakistaniProvince =
  | 'Punjab'
  | 'Sindh'
  | 'Khyber Pakhtunkhwa'
  | 'Balochistan'
  | 'Islamabad Capital Territory'
  | 'Azad Jammu & Kashmir'
  | 'Gilgit-Baltistan'
  | 'Other';

export interface Address {
  street?: string;
  area?: string;
  city?: string;
  province?: PakistaniProvince;
  postalCode?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  urduName?: string;
  nickname?: string;
  company?: string;
  jobTitle?: string;
  phones: PhoneNumber[];
  emails: EmailAddress[];
  cnic?: string;
  cnicProvince?: string;
  cnicGender?: 'Male' | 'Female';
  address?: Address;
  labels: string[]; // Label IDs
  notes?: string;
  birthday?: string;
  website?: string;
  isStarred: boolean;
  isFrequent?: boolean;
  isEmergency?: boolean;
  avatarColor?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null; // null if active, timestamp if in Trash
}

export interface Label {
  id: string;
  name: string;
  urduName?: string;
  color: string;
  isSystem?: boolean;
}

export type ViewFilter =
  | { type: 'all' }
  | { type: 'starred' }
  | { type: 'frequent' }
  | { type: 'emergency' }
  | { type: 'trash' }
  | { type: 'operator'; operator: TelecomOperator }
  | { type: 'city'; city: string }
  | { type: 'label'; labelId: string };

export interface DuplicateGroup {
  id: string;
  reason: 'Matching Phone Number' | 'Matching CNIC' | 'Matching Name';
  matchedValue: string;
  contacts: Contact[];
}

export interface EmergencyService {
  id: string;
  name: string;
  urduName: string;
  shortCode: string;
  fullPhone?: string;
  category: 'Medical' | 'Police & Security' | 'Rescue & Fire' | 'Utility' | 'Human Rights' | 'Highway';
  description: string;
  badgeColor: string;
  isAvailable24_7: boolean;
}
