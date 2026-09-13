import {
  X,
  Star,
  Edit2,
  Trash2,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Tag,
  Calendar,
  Globe,
  FileText,
  QrCode,
} from 'lucide-react';
import type { Contact, Label } from '../types/contact';
import {
  formatPakistaniPhone,
  getWhatsAppUrl,
  TELECOM_OPERATORS,
} from '../utils/pakistaniTelecom';

interface ContactDetailModalProps {
  contact: Contact | null;
  labels: Label[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onShowQR: (contact: Contact) => void;
}

export const ContactDetailModal = ({
  contact,
  labels,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleStar,
  onShowQR,
}: ContactDetailModalProps) => {
  if (!isOpen || !contact) return null;

  const primaryPhone = contact.phones[0];
  const waUrl = primaryPhone ? getWhatsAppUrl(primaryPhone.number) : null;
  const initials =
    (contact.firstName?.[0] || '') + (contact.lastName?.[0] || '');

  return (
    <div className="contact-drawer-backdrop" onClick={onClose}>
      <div
        className="contact-drawer"
        onClick={(e) => e.stopPropagation()}
        id="contact-detail-drawer"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <button
            className="modal-close-btn"
            onClick={onClose}
            title="Close drawer"
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="action-icon-btn"
              onClick={() => onToggleStar(contact.id)}
              title={contact.isStarred ? 'Unstar' : 'Star'}
            >
              <Star
                size={18}
                fill={contact.isStarred ? 'var(--color-star)' : 'none'}
                style={{ color: contact.isStarred ? 'var(--color-star)' : 'inherit' }}
              />
            </button>
            <button
              className="action-icon-btn"
              onClick={() => onEdit(contact)}
              title="Edit contact"
            >
              <Edit2 size={18} />
            </button>
            <button
              className="action-icon-btn delete"
              onClick={() => {
                onDelete(contact.id);
                onClose();
              }}
              title="Delete contact"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="drawer-content">
          {/* Profile Hero */}
          <div className="drawer-profile-hero">
            <div
              className="drawer-big-avatar"
              style={{ backgroundColor: contact.avatarColor || '#059669' }}
            >
              {initials || 'PK'}
            </div>
            <h2 className="drawer-hero-name">
              {[contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
                'Unnamed Contact'}
            </h2>
            {contact.urduName && (
              <span className="drawer-urdu-name">{contact.urduName}</span>
            )}
            {(contact.jobTitle || contact.company) && (
              <p className="drawer-hero-org">
                {[contact.jobTitle, contact.company].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>

          {/* Quick Action Strip */}
          <div className="drawer-action-strip">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="drawer-action-btn"
              >
                <div className="drawer-action-circle whatsapp">
                  <MessageCircle size={20} />
                </div>
                <span>WhatsApp</span>
              </a>
            )}

            {primaryPhone && (
              <a
                href={`tel:${primaryPhone.number}`}
                className="drawer-action-btn"
              >
                <div className="drawer-action-circle">
                  <Phone size={20} />
                </div>
                <span>Call</span>
              </a>
            )}

            {contact.emails[0] && (
              <a
                href={`mailto:${contact.emails[0].email}`}
                className="drawer-action-btn"
              >
                <div className="drawer-action-circle">
                  <Mail size={20} />
                </div>
                <span>Email</span>
              </a>
            )}

            <button
              className="drawer-action-btn"
              onClick={() => onShowQR(contact)}
            >
              <div className="drawer-action-circle">
                <QrCode size={20} />
              </div>
              <span>QR Card</span>
            </button>
          </div>

          {/* Phone Numbers with Telecom Operator Badges */}
          <div className="drawer-section">
            <span className="drawer-section-title">
              Contact Numbers & Network (پاکستان)
            </span>
            {contact.phones.map((phone) => {
              const op = phone.operator ? TELECOM_OPERATORS[phone.operator] : null;
              return (
                <div key={phone.id} className="drawer-info-row">
                  <Phone size={18} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="phone-number-text" style={{ fontSize: '1rem' }}>
                        {formatPakistaniPhone(phone.number, true)}
                      </span>
                      {op && (
                        <span
                          className={`badge badge-operator-${op.operator}`}
                          title={op.displayName}
                        >
                          {op.displayName}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {phone.type.toUpperCase()} {phone.isPrimary ? '• Primary' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pakistani CNIC Details */}
          {contact.cnic && (
            <div className="drawer-section">
              <span className="drawer-section-title">Pakistani CNIC (قومی شناختی کارڈ)</span>
              <div className="drawer-info-row">
                <CreditCard size={18} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 700 }}>
                    {contact.cnic}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {contact.cnicProvince && (
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(5, 150, 105, 0.15)',
                          color: 'var(--brand-green-emerald)',
                        }}
                      >
                        Province: {contact.cnicProvince}
                      </span>
                    )}
                    {contact.cnicGender && (
                      <span
                        className="badge"
                        style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
                      >
                        {contact.cnicGender}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emails */}
          {contact.emails.length > 0 && (
            <div className="drawer-section">
              <span className="drawer-section-title">Email Addresses</span>
              {contact.emails.map((email) => (
                <div key={email.id} className="drawer-info-row">
                  <Mail size={18} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <a
                      href={`mailto:${email.email}`}
                      style={{ color: 'var(--brand-green-emerald)', fontWeight: 500 }}
                    >
                      {email.email}
                    </a>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {email.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Location & Address in Pakistan */}
          {contact.address && (contact.address.city || contact.address.street) && (
            <div className="drawer-section">
              <span className="drawer-section-title">Address & City (پتہ)</span>
              <div className="drawer-info-row">
                <MapPin size={18} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {contact.address.street && <span>{contact.address.street}</span>}
                  <span style={{ fontWeight: 600 }}>
                    {[contact.address.city, contact.address.province, 'Pakistan']
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                  {contact.address.postalCode && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Postal Code: {contact.address.postalCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Labels & Groups */}
          {contact.labels.length > 0 && (
            <div className="drawer-section">
              <span className="drawer-section-title">Labels / گروپس</span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {contact.labels.map((lid) => {
                  const lbl = labels.find((l) => l.id === lid);
                  if (!lbl) return null;
                  return (
                    <span
                      key={lid}
                      className="badge"
                      style={{
                        background: `${lbl.color}22`,
                        color: lbl.color,
                        border: `1px solid ${lbl.color}55`,
                      }}
                    >
                      <Tag size={12} />
                      <span>{lbl.name}</span>
                      {lbl.urduName && (
                        <span className="urdu-text" style={{ fontSize: '0.75rem' }}>
                          ({lbl.urduName})
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="drawer-section">
              <span className="drawer-section-title">Notes / نوٹس</span>
              <div className="drawer-info-row">
                <FileText size={18} />
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {contact.notes}
                </p>
              </div>
            </div>
          )}

          {/* Birthday */}
          {contact.birthday && (
            <div className="drawer-section">
              <span className="drawer-section-title">Birthday</span>
              <div className="drawer-info-row">
                <Calendar size={18} />
                <span>{contact.birthday}</span>
              </div>
            </div>
          )}

          {/* Website */}
          {contact.website && (
            <div className="drawer-section">
              <span className="drawer-section-title">Website</span>
              <div className="drawer-info-row">
                <Globe size={18} />
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--brand-green-emerald)' }}
                >
                  {contact.website}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
