import {
  Star,
  MessageCircle,
  Phone,
  Mail,
  Building,
  MapPin,
  QrCode,
  Edit2,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import type { Contact, Label } from '../types/contact';
import {
  formatPakistaniPhone,
  getWhatsAppUrl,
  TELECOM_OPERATORS,
} from '../utils/pakistaniTelecom';

interface ContactCardProps {
  contact: Contact;
  labels: Label[];
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
  onViewDetails: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onShowQR: (contact: Contact) => void;
  viewMode: 'table' | 'grid';
  isTrashView?: boolean;
}

export const ContactCard = ({
  contact,
  labels: _labels,
  isSelected,
  onToggleSelect,
  onToggleStar,
  onViewDetails,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onShowQR,
  viewMode,
  isTrashView,
}) => {
  const primaryPhone = contact.phones[0];
  const primaryEmail = contact.emails[0];
  const operatorInfo = primaryPhone?.operator
    ? TELECOM_OPERATORS[primaryPhone.operator]
    : undefined;

  const initials =
    (contact.firstName?.[0] || '') + (contact.lastName?.[0] || '');

  const waUrl = primaryPhone ? getWhatsAppUrl(primaryPhone.number) : null;

  // TABLE VIEW ROW
  if (viewMode === 'table') {
    return (
      <tr
        className={`contact-row ${isSelected ? 'selected' : ''}`}
        onClick={(e) => {
          // If clicked outside interactive controls, open details
          const target = e.target as HTMLElement;
          if (
            !target.closest('button') &&
            !target.closest('input') &&
            !target.closest('a')
          ) {
            onViewDetails(contact);
          }
        }}
      >
        {/* Checkbox & Star */}
        <td className="table-cell-select">
          <div className="select-wrapper">
            <input
              type="checkbox"
              className="custom-checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(contact.id)}
              onClick={(e) => e.stopPropagation()}
            />
            {!isTrashView && (
              <button
                className={`star-btn ${contact.isStarred ? 'starred' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(contact.id);
                }}
                title={contact.isStarred ? 'Remove from starred' : 'Star contact'}
              >
                <Star
                  size={17}
                  fill={contact.isStarred ? 'currentColor' : 'none'}
                />
              </button>
            )}
          </div>
        </td>

        {/* Name & Avatar */}
        <td className="table-cell-name">
          <div className="contact-avatar-wrap">
            <div
              className="contact-avatar"
              style={{ backgroundColor: contact.avatarColor || '#059669' }}
            >
              {initials || 'PK'}
            </div>
            <div className="name-info">
              <span className="contact-full-name">
                {[contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
                  'Unnamed'}
              </span>
              {contact.urduName && (
                <span className="urdu-sub-name">{contact.urduName}</span>
              )}
            </div>
          </div>
        </td>

        {/* Company & Job */}
        <td>
          {contact.company || contact.jobTitle ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 500 }}>{contact.company}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {contact.jobTitle}
              </span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>—</span>
          )}
        </td>

        {/* Phone & Operator */}
        <td>
          {primaryPhone ? (
            <div className="phone-cell-wrap">
              {operatorInfo && (
                <span
                  className={`badge badge-operator-${operatorInfo.operator}`}
                  title={`${operatorInfo.displayName} (${operatorInfo.urduName})`}
                >
                  {operatorInfo.logoText}
                </span>
              )}
              <span className="phone-number-text">
                {formatPakistaniPhone(primaryPhone.number)}
              </span>

              {/* One-click WhatsApp Direct */}
              {waUrl && !isTrashView && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp-direct"
                  onClick={(e) => e.stopPropagation()}
                  title="Direct WhatsApp Chat"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>
              )}

              {/* Direct Call */}
              <a
                href={`tel:${primaryPhone.number}`}
                className="btn-call-direct"
                onClick={(e) => e.stopPropagation()}
                title="Call phone"
              >
                <Phone size={13} />
              </a>
            </div>
          ) : (
            <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>—</span>
          )}
        </td>

        {/* Email */}
        <td>
          {primaryEmail ? (
            <a
              href={`mailto:${primaryEmail.email}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Mail size={14} style={{ color: 'var(--text-muted)' }} />
              <span>{primaryEmail.email}</span>
            </a>
          ) : (
            <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>—</span>
          )}
        </td>

        {/* City & Province */}
        <td>
          {contact.address?.city || contact.address?.province ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}
            >
              <MapPin size={13} style={{ color: 'var(--brand-green-emerald)' }} />
              {[contact.address.city, contact.address.province]
                .filter(Boolean)
                .join(', ')}
            </span>
          ) : (
            <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>—</span>
          )}
        </td>

        {/* Actions */}
        <td className="table-cell-actions">
          <div className="row-actions-group">
            {!isTrashView ? (
              <>
                <button
                  className="action-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowQR(contact);
                  }}
                  title="Generate vCard QR Code for Mobile"
                >
                  <QrCode size={16} />
                </button>
                <button
                  className="action-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(contact);
                  }}
                  title="Edit contact"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="action-icon-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(contact.id);
                  }}
                  title="Move to Trash"
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="action-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore?.(contact.id);
                  }}
                  title="Restore Contact"
                  style={{ color: 'var(--brand-green-emerald)' }}
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  className="action-icon-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPermanentDelete?.(contact.id);
                  }}
                  title="Delete Forever"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  }

  // GRID VIEW CARD
  return (
    <div
      className={`contact-card ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (
          !target.closest('button') &&
          !target.closest('input') &&
          !target.closest('a')
        ) {
          onViewDetails(contact);
        }
      }}
    >
      <div className="card-top-row">
        <div className="card-avatar-row">
          <input
            type="checkbox"
            className="custom-checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(contact.id)}
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className="contact-avatar"
            style={{ backgroundColor: contact.avatarColor || '#059669' }}
          >
            {initials || 'PK'}
          </div>
          <div>
            <h3 className="contact-full-name">
              {[contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
                'Unnamed'}
            </h3>
            {contact.urduName && (
              <span className="urdu-sub-name">{contact.urduName}</span>
            )}
          </div>
        </div>

        {!isTrashView && (
          <button
            className={`star-btn ${contact.isStarred ? 'starred' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(contact.id);
            }}
            title={contact.isStarred ? 'Remove from starred' : 'Star contact'}
          >
            <Star
              size={18}
              fill={contact.isStarred ? 'currentColor' : 'none'}
            />
          </button>
        )}
      </div>

      <div className="card-body">
        {/* Company */}
        {(contact.company || contact.jobTitle) && (
          <div className="card-info-item">
            <Building size={14} style={{ color: 'var(--text-muted)' }} />
            <span>
              {[contact.jobTitle, contact.company].filter(Boolean).join(' at ')}
            </span>
          </div>
        )}

        {/* Primary Phone */}
        {primaryPhone && (
          <div className="card-info-item">
            {operatorInfo && (
              <span className={`badge badge-operator-${operatorInfo.operator}`}>
                {operatorInfo.logoText}
              </span>
            )}
            <span className="phone-number-text">
              {formatPakistaniPhone(primaryPhone.number)}
            </span>
          </div>
        )}

        {/* Email */}
        {primaryEmail && (
          <div className="card-info-item">
            <Mail size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.82rem' }}>{primaryEmail.email}</span>
          </div>
        )}

        {/* Location */}
        {contact.address?.city && (
          <div className="card-info-item">
            <MapPin size={14} style={{ color: 'var(--brand-green-emerald)' }} />
            <span style={{ fontSize: '0.82rem' }}>
              {[contact.address.city, contact.address.province].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
      </div>

      <div className="card-footer">
        {waUrl && !isTrashView ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-whatsapp-direct"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle size={14} />
            <span>WhatsApp</span>
          </a>
        ) : (
          <div />
        )}

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {!isTrashView ? (
            <>
              <button
                className="action-icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowQR(contact);
                }}
                title="Generate QR Code"
              >
                <QrCode size={16} />
              </button>
              <button
                className="action-icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(contact);
                }}
                title="Edit Contact"
              >
                <Edit2 size={16} />
              </button>
              <button
                className="action-icon-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(contact.id);
                }}
                title="Delete Contact"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                className="action-icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore?.(contact.id);
                }}
                title="Restore Contact"
                style={{ color: 'var(--brand-green-emerald)' }}
              >
                <RotateCcw size={16} />
              </button>
              <button
                className="action-icon-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onPermanentDelete?.(contact.id);
                }}
                title="Delete Forever"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
