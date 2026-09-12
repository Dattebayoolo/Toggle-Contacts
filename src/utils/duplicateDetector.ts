import type { Contact, DuplicateGroup, PhoneNumber, EmailAddress } from '../types/contact';
import { cleanPhoneNumber } from './pakistaniTelecom';
import { cleanCNIC } from './cnicValidator';

/**
 * Finds all potential duplicate contacts in the active list.
 */
export function findDuplicates(contacts: Contact[]): DuplicateGroup[] {
  const activeContacts = contacts.filter((c) => !c.deletedAt);
  const groups: DuplicateGroup[] = [];
  const processedPairs = new Set<string>();

  const getPairKey = (id1: string, id2: string) => [id1, id2].sort().join(':::');

  // 1. Check Phone Numbers
  const phoneMap = new Map<string, Contact[]>();
  for (const contact of activeContacts) {
    for (const phone of contact.phones) {
      const cleaned = cleanPhoneNumber(phone.number);
      // Only check meaningful numbers (at least 7 digits)
      if (cleaned.length >= 7) {
        // Normalize 923... or 03... to standard 10 digit local
        const normalized = cleaned.startsWith('92')
          ? cleaned.substring(2)
          : cleaned.startsWith('0')
          ? cleaned.substring(1)
          : cleaned;

        const list = phoneMap.get(normalized) || [];
        if (!list.some((c) => c.id === contact.id)) {
          list.push(contact);
        }
        phoneMap.set(normalized, list);
      }
    }
  }

  for (const [phone, matches] of phoneMap.entries()) {
    if (matches.length > 1) {
      // Create duplicate group
      groups.push({
        id: `dup-phone-${phone}`,
        reason: 'Matching Phone Number',
        matchedValue: `0${phone}`,
        contacts: matches,
      });
      for (let i = 0; i < matches.length; i++) {
        for (let j = i + 1; j < matches.length; j++) {
          processedPairs.add(getPairKey(matches[i].id, matches[j].id));
        }
      }
    }
  }

  // 2. Check CNIC
  const cnicMap = new Map<string, Contact[]>();
  for (const contact of activeContacts) {
    if (contact.cnic) {
      const cleaned = cleanCNIC(contact.cnic);
      if (cleaned.length === 13) {
        const list = cnicMap.get(cleaned) || [];
        if (!list.some((c) => c.id === contact.id)) {
          list.push(contact);
        }
        cnicMap.set(cleaned, list);
      }
    }
  }

  for (const [cnic, matches] of cnicMap.entries()) {
    if (matches.length > 1) {
      const newDuplicates = matches.filter((m1, idx) =>
        matches.slice(idx + 1).some((m2) => !processedPairs.has(getPairKey(m1.id, m2.id)))
      );
      if (newDuplicates.length > 0 || !groups.some((g) => g.matchedValue === cnic)) {
        groups.push({
          id: `dup-cnic-${cnic}`,
          reason: 'Matching CNIC',
          matchedValue: cnic,
          contacts: matches,
        });
        for (let i = 0; i < matches.length; i++) {
          for (let j = i + 1; j < matches.length; j++) {
            processedPairs.add(getPairKey(matches[i].id, matches[j].id));
          }
        }
      }
    }
  }

  // 3. Check Exact Full Name
  const nameMap = new Map<string, Contact[]>();
  for (const contact of activeContacts) {
    const fullName = `${contact.firstName.trim().toLowerCase()} ${contact.lastName.trim().toLowerCase()}`.trim();
    if (fullName.length > 2) {
      const list = nameMap.get(fullName) || [];
      list.push(contact);
      nameMap.set(fullName, list);
    }
  }

  for (const [name, matches] of nameMap.entries()) {
    if (matches.length > 1) {
      const hasUnprocessed = matches.some((m1, idx) =>
        matches.slice(idx + 1).some((m2) => !processedPairs.has(getPairKey(m1.id, m2.id)))
      );
      if (hasUnprocessed) {
        groups.push({
          id: `dup-name-${encodeURIComponent(name)}`,
          reason: 'Matching Name',
          matchedValue: matches[0].firstName + ' ' + matches[0].lastName,
          contacts: matches,
        });
      }
    }
  }

  return groups;
}

/**
 * Merges multiple contacts into a single consolidated contact.
 */
export function mergeContacts(primary: Contact, duplicates: Contact[]): {
  mergedContact: Contact;
  mergedContactIds: string[];
} {
  const allPhones: PhoneNumber[] = [...primary.phones];
  const allEmails: EmailAddress[] = [...primary.emails];
  const allLabels = new Set<string>(primary.labels);
  let mergedNotes = primary.notes || '';

  const mergedIds = duplicates.map((d) => d.id);

  for (const dup of duplicates) {
    // Merge phones (skip if same digits exist)
    for (const p of dup.phones) {
      const cleanP = cleanPhoneNumber(p.number);
      const exists = allPhones.some((existing) => cleanPhoneNumber(existing.number) === cleanP);
      if (!exists && p.number.trim()) {
        allPhones.push(p);
      }
    }

    // Merge emails
    for (const e of dup.emails) {
      const exists = allEmails.some(
        (existing) => existing.email.toLowerCase() === e.email.toLowerCase()
      );
      if (!exists && e.email.trim()) {
        allEmails.push(e);
      }
    }

    // Merge labels
    for (const l of dup.labels) {
      allLabels.add(l);
    }

    // Combine notes
    if (dup.notes && dup.notes !== primary.notes) {
      mergedNotes = mergedNotes ? `${mergedNotes}\n\n[Merged Note]: ${dup.notes}` : dup.notes;
    }
  }

  const mergedContact: Contact = {
    ...primary,
    urduName: primary.urduName || duplicates.find((d) => d.urduName)?.urduName,
    company: primary.company || duplicates.find((d) => d.company)?.company,
    jobTitle: primary.jobTitle || duplicates.find((d) => d.jobTitle)?.jobTitle,
    cnic: primary.cnic || duplicates.find((d) => d.cnic)?.cnic,
    cnicProvince: primary.cnicProvince || duplicates.find((d) => d.cnicProvince)?.cnicProvince,
    address: primary.address || duplicates.find((d) => d.address)?.address,
    phones: allPhones,
    emails: allEmails,
    labels: Array.from(allLabels),
    notes: mergedNotes,
    isStarred: primary.isStarred || duplicates.some((d) => d.isStarred),
    updatedAt: new Date().toISOString(),
  };

  return { mergedContact, mergedContactIds: mergedIds };
}
