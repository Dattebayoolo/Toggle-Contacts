import type { Contact } from '../types/contact';
import { detectPakistaniOperator } from './pakistaniTelecom';

/**
 * Generates a standard vCard 3.0 string for one or more contacts.
 */
export function contactsToVCard(contacts: Contact[]): string {
  const cards: string[] = [];

  for (const c of contacts) {
    const lines: string[] = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${c.lastName || ''};${c.firstName || ''};;;`,
      `FN:${[c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed Contact'}`,
    ];

    if (c.urduName) {
      lines.push(`X-URDU-NAME:${c.urduName}`);
    }

    if (c.nickname) {
      lines.push(`NICKNAME:${c.nickname}`);
    }

    if (c.company) {
      lines.push(`ORG:${c.company}`);
    }

    if (c.jobTitle) {
      lines.push(`TITLE:${c.jobTitle}`);
    }

    // Phones
    for (const p of c.phones) {
      if (!p.number) continue;
      const typeStr = p.type === 'mobile' ? 'CELL' : p.type === 'work' ? 'WORK' : 'HOME';
      lines.push(`TEL;TYPE=${typeStr},VOICE:${p.number}`);
    }

    // Emails
    for (const e of c.emails) {
      if (!e.email) continue;
      const typeStr = e.type === 'work' ? 'WORK' : 'HOME';
      lines.push(`EMAIL;TYPE=${typeStr},INTERNET:${e.email}`);
    }

    // Address
    if (c.address && (c.address.city || c.address.province || c.address.street)) {
      const street = c.address.street || '';
      const city = c.address.city || '';
      const province = c.address.province || '';
      const postal = c.address.postalCode || '';
      lines.push(`ADR;TYPE=HOME:;;${street};${city};${province};${postal};Pakistan`);
    }

    // CNIC
    if (c.cnic) {
      lines.push(`X-CNIC:${c.cnic}`);
    }

    // Notes
    if (c.notes) {
      const sanitizedNotes = c.notes.replace(/\n/g, '\\n');
      lines.push(`NOTE:${sanitizedNotes}`);
    }

    if (c.birthday) {
      lines.push(`BDAY:${c.birthday}`);
    }

    if (c.website) {
      lines.push(`URL:${c.website}`);
    }

    if (c.labels && c.labels.length > 0) {
      lines.push(`CATEGORIES:${c.labels.join(',')}`);
    }

    lines.push('END:VCARD');
    cards.push(lines.join('\r\n'));
  }

  return cards.join('\r\n');
}

/**
 * Parses raw vCard string (vCard 2.1 or 3.0) into partial Contact objects.
 */
export function parseVCard(vcardText: string): Partial<Contact>[] {
  const contacts: Partial<Contact>[] = [];
  const rawCards = vcardText.split(/BEGIN:VCARD/i).filter((s) => s.trim().length > 0);

  for (const card of rawCards) {
    const lines = card.split(/\r\n|\r|\n/);
    const contact: Partial<Contact> = {
      firstName: '',
      lastName: '',
      phones: [],
      emails: [],
      labels: [],
      isStarred: false,
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.toUpperCase().startsWith('END:VCARD')) continue;

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;

      const rawKey = trimmed.substring(0, colonIdx);
      const value = trimmed.substring(colonIdx + 1).trim();
      const keyUpper = rawKey.toUpperCase();

      if (keyUpper.startsWith('FN')) {
        const parts = value.split(' ');
        contact.firstName = parts[0] || '';
        contact.lastName = parts.slice(1).join(' ') || '';
      } else if (keyUpper.startsWith('N')) {
        const nParts = value.split(';');
        if (nParts.length > 1) {
          contact.lastName = nParts[0] || contact.lastName || '';
          contact.firstName = nParts[1] || contact.firstName || '';
        }
      } else if (keyUpper.startsWith('X-URDU-NAME')) {
        contact.urduName = value;
      } else if (keyUpper.startsWith('NICKNAME')) {
        contact.nickname = value;
      } else if (keyUpper.startsWith('ORG')) {
        contact.company = value;
      } else if (keyUpper.startsWith('TITLE')) {
        contact.jobTitle = value;
      } else if (keyUpper.startsWith('TEL')) {
        const op = detectPakistaniOperator(value);
        const pType = keyUpper.includes('WORK') ? 'work' : keyUpper.includes('HOME') ? 'home' : 'mobile';
        contact.phones?.push({
          id: Math.random().toString(36).substring(2, 9),
          number: value,
          type: pType,
          operator: op,
        });
      } else if (keyUpper.startsWith('EMAIL')) {
        const eType = keyUpper.includes('WORK') ? 'work' : 'personal';
        contact.emails?.push({
          id: Math.random().toString(36).substring(2, 9),
          email: value,
          type: eType,
        });
      } else if (keyUpper.startsWith('ADR')) {
        const adrParts = value.split(';');
        contact.address = {
          street: adrParts[2] || '',
          city: adrParts[3] || '',
          province: (adrParts[4] as any) || undefined,
          postalCode: adrParts[5] || '',
        };
      } else if (keyUpper.startsWith('X-CNIC')) {
        contact.cnic = value;
      } else if (keyUpper.startsWith('NOTE')) {
        contact.notes = value.replace(/\\n/g, '\n');
      } else if (keyUpper.startsWith('BDAY')) {
        contact.birthday = value;
      } else if (keyUpper.startsWith('URL')) {
        contact.website = value;
      } else if (keyUpper.startsWith('CATEGORIES')) {
        contact.labels = value.split(',').map((l) => l.trim());
      }
    }

    if (contact.firstName || contact.lastName || (contact.phones && contact.phones.length > 0)) {
      contacts.push(contact);
    }
  }

  return contacts;
}
