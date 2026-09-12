import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Star,
  Check,
} from 'lucide-react';
import type {
  Contact,
  Label,
  PhoneNumber,
  EmailAddress,
  PakistaniProvince,
  PhoneType,
} from '../types/contact';
import {
  detectPakistaniOperator,
  TELECOM_OPERATORS,
} from '../utils/pakistaniTelecom';
import { formatCNIC, validatePakistaniCNIC } from '../utils/cnicValidator';
import { PAKISTANI_CITIES, PAKISTANI_PROVINCES } from '../utils/pakistaniCities';

interface ContactFormModalProps {
  isOpen: boolean;
  contactToEdit: Contact | null;
  labels: Label[];
  onClose: () => void;
  onSave: (contactData: Partial<Contact>) => void;
}

export const ContactFormModal = ({
  isOpen,
  contactToEdit,
  labels,
  onClose,
  onSave,
}: ContactFormModalProps) => {
  if (!isOpen) return null;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phones, setPhones] = useState<PhoneNumber[]>([
    { id: 'p-1', number: '', type: 'mobile', operator: 'other', isPrimary: true },
  ]);
  const [emails, setEmails] = useState<EmailAddress[]>([
    { id: 'e-1', email: '', type: 'personal' },
  ]);
  const [cnic, setCnic] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState<PakistaniProvince>('Punjab');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isStarred, setIsStarred] = useState(false);

  // Initialize form
  useEffect(() => {
    if (contactToEdit) {
      setFirstName(contactToEdit.firstName || '');
      setLastName(contactToEdit.lastName || '');
      setUrduName(contactToEdit.urduName || '');
      setCompany(contactToEdit.company || '');
      setJobTitle(contactToEdit.jobTitle || '');
      setPhones(
        contactToEdit.phones.length > 0
          ? contactToEdit.phones
          : [{ id: 'p-1', number: '', type: 'mobile', isPrimary: true }]
      );
      setEmails(
        contactToEdit.emails.length > 0
          ? contactToEdit.emails
          : [{ id: 'e-1', email: '', type: 'personal' }]
      );
      setCnic(contactToEdit.cnic || '');
      setStreet(contactToEdit.address?.street || '');
      setCity(contactToEdit.address?.city || '');
      setProvince(contactToEdit.address?.province || 'Punjab');
      setSelectedLabels(contactToEdit.labels || []);
      setNotes(contactToEdit.notes || '');
      setIsStarred(!!contactToEdit.isStarred);
    } else {
      setFirstName('');
      setLastName('');
      setUrduName('');
      setCompany('');
      setJobTitle('');
      setPhones([{ id: 'p-1', number: '', type: 'mobile', isPrimary: true }]);
      setEmails([{ id: 'e-1', email: '', type: 'personal' }]);
      setCnic('');
      setStreet('');
      setCity('');
      setProvince('Punjab');
      setSelectedLabels([]);
      setNotes('');
      setIsStarred(false);
    }
  }, [contactToEdit, isOpen]);

  // Phone number handlers
  const handlePhoneChange = (idx: number, val: string) => {
    const updated = [...phones];
    const op = detectPakistaniOperator(val);
    updated[idx] = {
      ...updated[idx],
      number: val,
      operator: op,
    };
    setPhones(updated);
  };

  const handlePhoneTypeChange = (idx: number, type: PhoneType) => {
    const updated = [...phones];
    updated[idx] = { ...updated[idx], type };
    setPhones(updated);
  };

  const handleAddPhone = () => {
    setPhones([
      ...phones,
      { id: `p-${Date.now()}`, number: '', type: 'mobile', operator: 'other' },
    ]);
  };

  const handleRemovePhone = (idx: number) => {
    if (phones.length <= 1) return;
    setPhones(phones.filter((_, i) => i !== idx));
  };

  // Email handlers
  const handleEmailChange = (idx: number, val: string) => {
    const updated = [...emails];
    updated[idx] = { ...updated[idx], email: val };
    setEmails(updated);
  };

  const handleAddEmail = () => {
    setEmails([...emails, { id: `e-${Date.now()}`, email: '', type: 'personal' }]);
  };

  const handleRemoveEmail = (idx: number) => {
    if (emails.length <= 1) return;
    setEmails(emails.filter((_, i) => i !== idx));
  };

  // CNIC handling
  const handleCnicChange = (val: string) => {
    const formatted = formatCNIC(val);
    setCnic(formatted);
  };

  const cnicAnalysis = cnic ? validatePakistaniCNIC(cnic) : null;

  // City selection auto sets province
  const handleCitySelect = (cityName: string) => {
    setCity(cityName);
    const found = PAKISTANI_CITIES.find((c) => c.name === cityName);
    if (found) {
      setProvince(found.province);
    }
  };

  const handleToggleLabel = (id: string) => {
    if (selectedLabels.includes(id)) {
      setSelectedLabels(selectedLabels.filter((l) => l !== id));
    } else {
      setSelectedLabels([...selectedLabels, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() && !lastName.trim() && !phones[0]?.number.trim()) {
      alert('Please provide at least a Name or Phone Number.');
      return;
    }

    const cleanedPhones = phones.filter((p) => p.number.trim());
    const cleanedEmails = emails.filter((e) => e.email.trim());

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      urduName: urduName.trim(),
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      phones: cleanedPhones,
      emails: cleanedEmails,
      cnic: cnic.trim(),
      cnicProvince: cnicAnalysis?.isValid ? cnicAnalysis.province : undefined,
      cnicGender: cnicAnalysis?.isValid ? cnicAnalysis.gender : undefined,
      address:
        city || street || province
          ? { street: street.trim(), city: city.trim(), province }
          : undefined,
      labels: selectedLabels,
      notes: notes.trim(),
      isStarred,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-window wide"
        onClick={(e) => e.stopPropagation()}
        id="contact-form-modal"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3 className="modal-title">
              {contactToEdit ? 'Edit Contact' : 'Create New Contact'}
            </h3>
            <span
              className="badge"
              style={{
                background: 'var(--brand-green-subtle)',
                color: 'var(--brand-green-emerald)',
              }}
            >
              Toggle PK 🇵🇰
            </span>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Name Row */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Muhammad"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                placeholder="e.g. Bilal"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* Urdu Name Input */}
            <div className="form-group full-width">
              <label className="form-label">
                <span>Urdu Script Name (اردو نام)</span>
                <span className="label-urdu-hint">نستعلیق انداز</span>
              </label>
              <input
                type="text"
                placeholder="مثال: محمد بلال طارق"
                value={urduName}
                onChange={(e) => setUrduName(e.target.value)}
                className="urdu-text"
                style={{ fontSize: '1.1rem' }}
              />
            </div>
          </div>

          {/* Company & Job Title */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer / Shop Owner"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company / Business</label>
              <input
                type="text"
                placeholder="e.g. Systems Limited / Shaukat Khanum"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          {/* Pakistani Phone Numbers with Live Operator Indicator */}
          <div className="form-group full-width">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <label className="form-label">
                <span>Phone Numbers (Pakistani Networks)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Auto-detects Jazz, Zong, Telenor, Ufone, SCOM, Onic
                </span>
              </label>
              <button
                type="button"
                onClick={handleAddPhone}
                className="btn-add-label"
                style={{ fontSize: '0.8rem' }}
              >
                <Plus size={14} />
                <span>Add Phone</span>
              </button>
            </div>

            {phones.map((phone, idx) => {
              const op = phone.operator ? TELECOM_OPERATORS[phone.operator] : null;
              return (
                <div
                  key={phone.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    marginBottom: '0.6rem',
                  }}
                >
                  <div className="phone-input-row">
                    <select
                      className="phone-type-select"
                      value={phone.type}
                      onChange={(e) =>
                        handlePhoneTypeChange(idx, e.target.value as PhoneType)
                      }
                    >
                      <option value="mobile">Mobile</option>
                      <option value="work">Work</option>
                      <option value="home">Home</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>

                    <input
                      type="tel"
                      placeholder="0300 1234567 or +92 300 1234567"
                      value={phone.number}
                      onChange={(e) => handlePhoneChange(idx, e.target.value)}
                      style={{ flex: 1, fontFamily: 'monospace' }}
                    />

                    {phones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhone(idx)}
                        className="action-icon-btn delete"
                        title="Remove phone"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Live Telecom Operator Badge */}
                  {op && phone.number.length >= 4 && (
                    <div
                      className={`live-operator-pill badge-operator-${op.operator}`}
                    >
                      <span>Detected Network:</span>
                      <strong>{op.displayName}</strong>
                      <span className="urdu-text" style={{ fontSize: '0.75rem' }}>
                        ({op.urduName})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pakistani CNIC with instant validation */}
          <div className="form-group full-width">
            <label className="form-label">
              <span>National Identity Card (CNIC / شناختی کارڈ)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                13 digits (XXXXX-XXXXXXX-X)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. 35201-1234567-1"
              value={cnic}
              onChange={(e) => handleCnicChange(e.target.value)}
              style={{ fontFamily: 'monospace' }}
              maxLength={15}
            />

            {cnic && cnicAnalysis && (
              <div className="cnic-status-box">
                {cnicAnalysis.isValid ? (
                  <span
                    style={{
                      color: 'var(--brand-green-emerald)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Check size={16} />
                    Valid CNIC • Province: <strong>{cnicAnalysis.province}</strong> •{' '}
                    Gender: <strong>{cnicAnalysis.gender}</strong>
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-danger)' }}>
                    {cnicAnalysis.error}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Emails */}
          <div className="form-group full-width">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <label className="form-label">Email Addresses</label>
              <button
                type="button"
                onClick={handleAddEmail}
                className="btn-add-label"
                style={{ fontSize: '0.8rem' }}
              >
                <Plus size={14} />
                <span>Add Email</span>
              </button>
            </div>

            {emails.map((email, idx) => (
              <div
                key={email.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email.email}
                  onChange={(e) => handleEmailChange(idx, e.target.value)}
                  style={{ flex: 1 }}
                />
                {emails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(idx)}
                    className="action-icon-btn delete"
                    title="Remove email"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Pakistani Location & Province */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Pakistani City</label>
              <select
                value={city}
                onChange={(e) => handleCitySelect(e.target.value)}
              >
                <option value="">Select or leave blank...</option>
                {PAKISTANI_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.urduName})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Province / Territory</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value as PakistaniProvince)}
              >
                {PAKISTANI_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Street / Neighborhood</label>
              <input
                type="text"
                placeholder="e.g. DHA Phase 5, Gulberg, Clifton, Sector F-7"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
          </div>

          {/* Labels & Groups Selection */}
          <div className="form-group full-width">
            <label className="form-label">Assign Labels / گروپس</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {labels.map((lbl) => {
                const isSelected = selectedLabels.includes(lbl.id);
                return (
                  <button
                    key={lbl.id}
                    type="button"
                    onClick={() => handleToggleLabel(lbl.id)}
                    className="badge"
                    style={{
                      background: isSelected ? lbl.color : 'var(--bg-subtle)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      border: `1px solid ${lbl.color}`,
                      cursor: 'pointer',
                      padding: '0.4rem 0.8rem',
                    }}
                  >
                    {lbl.name} {lbl.urduName && `(${lbl.urduName})`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group full-width">
            <label className="form-label">Notes / نوٹس</label>
            <textarea
              rows={3}
              placeholder="Add any reminders, nicknames, or family relations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Star toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
            }}
            onClick={() => setIsStarred(!isStarred)}
          >
            <Star
              size={18}
              fill={isStarred ? 'var(--color-star)' : 'none'}
              style={{ color: isStarred ? 'var(--color-star)' : 'var(--text-muted)' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              Add to Starred Contacts
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" id="save-contact-btn">
              {contactToEdit ? 'Update Contact' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
