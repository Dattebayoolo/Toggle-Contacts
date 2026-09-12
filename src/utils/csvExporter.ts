import type { Contact } from '../types/contact';
import { detectPakistaniOperator, formatPakistaniPhone } from './pakistaniTelecom';

/**
 * Exports contacts to Google Contacts compatible CSV.
 */
export function contactsToGoogleCsv(contacts: Contact[]): string {
  const headers = [
    'Name',
    'Given Name',
    'Family Name',
    'Nickname',
    'Urdu Name',
    'Organization Name',
    'Organization Title',
    'Phone 1 - Value',
    'Phone 1 - Type',
    'Phone 1 - Operator',
    'Phone 2 - Value',
    'Phone 2 - Type',
    'E-mail 1 - Value',
    'E-mail 1 - Type',
    'CNIC',
    'Address 1 - Formatted',
    'Address 1 - City',
    'Address 1 - Region',
    'Group Membership',
    'Notes',
  ];

  const escapeCsv = (val: string | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = contacts.map((c) => {
    const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ');
    const p1 = c.phones[0];
    const p2 = c.phones[1];
    const e1 = c.emails[0];
    const addr = c.address;
    const formattedAddr = addr
      ? [addr.street, addr.area, addr.city, addr.province].filter(Boolean).join(', ')
      : '';

    return [
      escapeCsv(fullName),
      escapeCsv(c.firstName),
      escapeCsv(c.lastName),
      escapeCsv(c.nickname),
      escapeCsv(c.urduName),
      escapeCsv(c.company),
      escapeCsv(c.jobTitle),
      escapeCsv(p1 ? formatPakistaniPhone(p1.number) : ''),
      escapeCsv(p1 ? p1.type : ''),
      escapeCsv(p1 ? p1.operator?.toUpperCase() : ''),
      escapeCsv(p2 ? formatPakistaniPhone(p2.number) : ''),
      escapeCsv(p2 ? p2.type : ''),
      escapeCsv(e1 ? e1.email : ''),
      escapeCsv(e1 ? e1.type : ''),
      escapeCsv(c.cnic),
      escapeCsv(formattedAddr),
      escapeCsv(addr?.city),
      escapeCsv(addr?.province),
      escapeCsv(c.labels.join(' ::: ')),
      escapeCsv(c.notes),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Parses CSV text into contact candidates.
 */
export function parseCsvContacts(csvText: string): Partial<Contact>[] {
  const lines = csvText.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse CSV line taking quotes into account
  const parseLine = (line: string): string[] => {
    const res: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        res.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    res.push(cur.trim());
    return res;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const contacts: Partial<Contact>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    const getVal = (possibleHeaders: string[]): string => {
      for (const h of possibleHeaders) {
        const idx = headers.indexOf(h.toLowerCase());
        if (idx !== -1 && vals[idx]) return vals[idx];
      }
      return '';
    };

    let firstName = getVal(['given name', 'first name', 'firstname', 'name']);
    let lastName = getVal(['family name', 'last name', 'lastname']);
    if (!lastName && firstName && firstName.includes(' ')) {
      const parts = firstName.split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }

    const phone1 = getVal(['phone 1 - value', 'phone', 'mobile', 'cell', 'telephone']);
    const email1 = getVal(['e-mail 1 - value', 'email', 'e-mail']);
    const cnic = getVal(['cnic', 'national id']);
    const company = getVal(['organization name', 'company', 'organization']);
    const jobTitle = getVal(['organization title', 'job title', 'title']);
    const city = getVal(['address 1 - city', 'city']);
    const province = getVal(['address 1 - region', 'province', 'state']) as any;
    const notes = getVal(['notes', 'note', 'description']);

    if (firstName || lastName || phone1) {
      const newContact: Partial<Contact> = {
        firstName: firstName || 'Unnamed',
        lastName: lastName || '',
        company,
        jobTitle,
        cnic,
        notes,
        phones: phone1
          ? [
              {
                id: Math.random().toString(36).substring(2, 9),
                number: phone1,
                type: 'mobile',
                operator: detectPakistaniOperator(phone1),
                isPrimary: true,
              },
            ]
          : [],
        emails: email1
          ? [
              {
                id: Math.random().toString(36).substring(2, 9),
                email: email1,
                type: 'personal',
              },
            ]
          : [],
        address: city || province ? { city, province } : undefined,
        labels: [],
        isStarred: false,
      };
      contacts.push(newContact);
    }
  }

  return contacts;
}

/**
 * Triggers a file download in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
