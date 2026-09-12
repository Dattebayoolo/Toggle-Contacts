import { useState, useEffect, useCallback } from 'react';
import type { Contact, Label, PhoneNumber } from '../types/contact';
import { INITIAL_CONTACTS, INITIAL_LABELS } from '../utils/mockData';
import { detectPakistaniOperator } from '../utils/pakistaniTelecom';
import { validatePakistaniCNIC } from '../utils/cnicValidator';
import { mergeContacts } from '../utils/duplicateDetector';

const STORAGE_KEY_CONTACTS = 'toggle_contacts_pk_v1';
const STORAGE_KEY_LABELS = 'toggle_labels_pk_v1';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONTACTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved contacts', e);
    }
    return INITIAL_CONTACTS;
  });

  const [labels, setLabels] = useState<Label[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LABELS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved labels', e);
    }
    return INITIAL_LABELS;
  });

  // Save on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to persist contacts', e);
    }
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LABELS, JSON.stringify(labels));
    } catch (e) {
      console.error('Failed to persist labels', e);
    }
  }, [labels]);

  // Add Contact
  const addContact = useCallback(
    (contactData: Partial<Contact>): Contact => {
      const now = new Date().toISOString();
      const id = `pk-cnt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Auto-detect telecom operator for phones
      const processedPhones: PhoneNumber[] = (contactData.phones || []).map((p, idx) => ({
        id: p.id || `p-${Date.now()}-${idx}`,
        number: p.number || '',
        type: p.type || 'mobile',
        operator: p.operator || detectPakistaniOperator(p.number || ''),
        isPrimary: p.isPrimary ?? idx === 0,
      }));

      // Validate CNIC
      let cnicProvince = contactData.cnicProvince;
      let cnicGender = contactData.cnicGender;
      if (contactData.cnic) {
        const cnicInfo = validatePakistaniCNIC(contactData.cnic);
        if (cnicInfo.isValid) {
          cnicProvince = cnicInfo.province;
          cnicGender = cnicInfo.gender;
        }
      }

      // Pick avatar color
      const avatarPalette = [
        '#059669', // Emerald
        '#2563EB', // Blue
        '#7C3AED', // Purple
        '#D97706', // Amber
        '#DC2626', // Crimson
        '#0D9488', // Teal
        '#EA580C', // Orange
      ];
      const avatarColor =
        contactData.avatarColor ||
        avatarPalette[Math.floor(Math.random() * avatarPalette.length)];

      const newContact: Contact = {
        id,
        firstName: contactData.firstName || '',
        lastName: contactData.lastName || '',
        urduName: contactData.urduName || '',
        nickname: contactData.nickname || '',
        company: contactData.company || '',
        jobTitle: contactData.jobTitle || '',
        phones: processedPhones,
        emails: contactData.emails || [],
        cnic: contactData.cnic || '',
        cnicProvince,
        cnicGender,
        address: contactData.address,
        labels: contactData.labels || [],
        notes: contactData.notes || '',
        birthday: contactData.birthday || '',
        website: contactData.website || '',
        isStarred: !!contactData.isStarred,
        isFrequent: !!contactData.isFrequent,
        avatarColor,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      setContacts((prev) => [newContact, ...prev]);
      return newContact;
    },
    []
  );

  // Update Contact
  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    const now = new Date().toISOString();
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        let processedPhones = updates.phones;
        if (processedPhones) {
          processedPhones = processedPhones.map((p) => ({
            ...p,
            operator: p.operator || detectPakistaniOperator(p.number),
          }));
        }

        let cnicProvince = updates.cnicProvince ?? c.cnicProvince;
        let cnicGender = updates.cnicGender ?? c.cnicGender;
        if (updates.cnic) {
          const cnicInfo = validatePakistaniCNIC(updates.cnic);
          if (cnicInfo.isValid) {
            cnicProvince = cnicInfo.province;
            cnicGender = cnicInfo.gender;
          }
        }

        return {
          ...c,
          ...updates,
          phones: processedPhones || c.phones,
          cnicProvince,
          cnicGender,
          updatedAt: now,
        };
      })
    );
  }, []);

  // Soft Delete (Trash)
  const deleteContact = useCallback((id: string) => {
    const now = new Date().toISOString();
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, deletedAt: now } : c))
    );
  }, []);

  // Restore from Trash
  const restoreContact = useCallback((id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, deletedAt: null } : c))
    );
  }, []);

  // Permanently Delete
  const permanentlyDeleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Empty Trash
  const emptyTrash = useCallback(() => {
    setContacts((prev) => prev.filter((c) => !c.deletedAt));
  }, []);

  // Toggle Star
  const toggleStar = useCallback((id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isStarred: !c.isStarred } : c))
    );
  }, []);

  // Batch Soft Delete
  const batchDelete = useCallback((ids: string[]) => {
    const now = new Date().toISOString();
    const idSet = new Set(ids);
    setContacts((prev) =>
      prev.map((c) => (idSet.has(c.id) ? { ...c, deletedAt: now } : c))
    );
  }, []);

  // Batch Assign Label
  const batchAssignLabel = useCallback((ids: string[], labelId: string) => {
    const idSet = new Set(ids);
    setContacts((prev) =>
      prev.map((c) => {
        if (!idSet.has(c.id)) return c;
        if (c.labels.includes(labelId)) return c;
        return { ...c, labels: [...c.labels, labelId] };
      })
    );
  }, []);

  // Batch Remove Label
  const batchRemoveLabel = useCallback((ids: string[], labelId: string) => {
    const idSet = new Set(ids);
    setContacts((prev) =>
      prev.map((c) => {
        if (!idSet.has(c.id)) return c;
        return { ...c, labels: c.labels.filter((l) => l !== labelId) };
      })
    );
  }, []);

  // Merge Duplicates
  const mergeDuplicatesAction = useCallback(
    (primaryId: string, duplicateIds: string[]) => {
      setContacts((prev) => {
        const primary = prev.find((c) => c.id === primaryId);
        if (!primary) return prev;

        const dups = prev.filter((c) => duplicateIds.includes(c.id));
        const { mergedContact, mergedContactIds } = mergeContacts(primary, dups);

        const mergedIdSet = new Set(mergedContactIds);
        return prev
          .filter((c) => !mergedIdSet.has(c.id))
          .map((c) => (c.id === primaryId ? mergedContact : c));
      });
    },
    []
  );

  // Import Contacts
  const importContacts = useCallback(
    (newItems: Partial<Contact>[]): number => {
      let count = 0;
      for (const item of newItems) {
        addContact(item);
        count++;
      }
      return count;
    },
    [addContact]
  );

  // Add Label
  const addLabel = useCallback((name: string, urduName = '', color = '#10B981') => {
    const id = `label-${Date.now()}`;
    const newLabel: Label = { id, name, urduName, color, isSystem: false };
    setLabels((prev) => [...prev, newLabel]);
    return newLabel;
  }, []);

  // Delete Label
  const deleteLabel = useCallback((labelId: string) => {
    setLabels((prev) => prev.filter((l) => l.id !== labelId));
    // Also remove label from contacts
    setContacts((prev) =>
      prev.map((c) => ({ ...c, labels: c.labels.filter((l) => l !== labelId) }))
    );
  }, []);

  // Reset to Demo Data
  const resetToDemoData = useCallback(() => {
    setContacts(INITIAL_CONTACTS);
    setLabels(INITIAL_LABELS);
    localStorage.removeItem(STORAGE_KEY_CONTACTS);
    localStorage.removeItem(STORAGE_KEY_LABELS);
  }, []);

  return {
    contacts,
    labels,
    addContact,
    updateContact,
    deleteContact,
    restoreContact,
    permanentlyDeleteContact,
    emptyTrash,
    toggleStar,
    batchDelete,
    batchAssignLabel,
    batchRemoveLabel,
    mergeDuplicatesAction,
    importContacts,
    addLabel,
    deleteLabel,
    resetToDemoData,
  };
}
