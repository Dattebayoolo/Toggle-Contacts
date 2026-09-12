import { useMemo } from 'react';
import {
  X,
  GitMerge,
  CheckCircle2,
  Phone,
  Mail,
  Building,
  CreditCard,
} from 'lucide-react';
import type { Contact, DuplicateGroup } from '../types/contact';
import { findDuplicates } from '../utils/duplicateDetector';
import { formatPakistaniPhone } from '../utils/pakistaniTelecom';

interface MergeDuplicatesModalProps {
  isOpen: boolean;
  contacts: Contact[];
  onClose: () => void;
  onMergeGroup: (primaryId: string, duplicateIds: string[]) => void;
  onMergeAll: (groups: DuplicateGroup[]) => void;
}

export const MergeDuplicatesModal = ({
  isOpen,
  contacts,
  onClose,
  onMergeGroup,
  onMergeAll,
}: MergeDuplicatesModalProps) => {
  if (!isOpen) return null;

  const duplicateGroups = useMemo(() => findDuplicates(contacts), [contacts]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-window wide"
        onClick={(e) => e.stopPropagation()}
        id="merge-duplicates-modal"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--brand-green-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GitMerge size={20} />
            </div>
            <div>
              <h3 className="modal-title">Merge & Fix Duplicates</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Consolidate duplicate phone numbers, CNICs, or contact names
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {duplicateGroups.length > 0 && (
              <button
                className="btn-primary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem' }}
                onClick={() => onMergeAll(duplicateGroups)}
                id="merge-all-btn"
              >
                <GitMerge size={16} />
                <span>Merge All ({duplicateGroups.length})</span>
              </button>
            )}

            <button
              className="modal-close-btn"
              onClick={onClose}
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {duplicateGroups.length === 0 ? (
            <div className="empty-state-box" style={{ padding: '3rem 1rem' }}>
              <div
                className="empty-icon-circle"
                style={{ background: 'rgba(16, 185, 129, 0.15)' }}
              >
                <CheckCircle2 size={36} style={{ color: 'var(--brand-green-emerald)' }} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                No duplicate contacts found!
              </h4>
              <p className="empty-desc">
                Your Pakistani phonebook is completely clean and organized. Any
                future duplicate phone numbers or CNICs will be surfaced here
                automatically.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}
              >
                We found <strong>{duplicateGroups.length} duplicate group(s)</strong>.
                Merging will combine unique phone numbers, emails, notes, and labels into
                a single unified contact card without losing any data.
              </div>

              {duplicateGroups.map((group) => {
                const primary = group.contacts[0];
                const others = group.contacts.slice(1);

                return (
                  <div
                    key={group.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      background: 'var(--bg-surface)',
                    }}
                  >
                    {/* Reason Header */}
                    <div
                      style={{
                        padding: '0.65rem 1rem',
                        background: 'var(--brand-green-subtle)',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          className="badge"
                          style={{
                            background: 'var(--brand-green-emerald)',
                            color: '#FFFFFF',
                          }}
                        >
                          {group.reason}
                        </span>
                        <strong style={{ fontSize: '0.88rem' }}>
                          {group.matchedValue}
                        </strong>
                      </div>

                      <button
                        className="btn-primary"
                        style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() =>
                          onMergeGroup(
                            primary.id,
                            others.map((o) => o.id)
                          )
                        }
                      >
                        <GitMerge size={14} />
                        <span>Merge These</span>
                      </button>
                    </div>

                    {/* Side-by-side or Stacked Contacts */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(
                          group.contacts.length,
                          2
                        )}, 1fr)`,
                        gap: '1rem',
                        padding: '1rem',
                      }}
                    >
                      {group.contacts.map((contact, idx) => (
                        <div
                          key={contact.id}
                          style={{
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.85rem',
                            background:
                              idx === 0
                                ? 'var(--bg-app)'
                                : 'var(--bg-surface)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.45rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                color: 'var(--text-muted)',
                              }}
                            >
                              {idx === 0 ? 'Primary Profile' : 'Duplicate Profile'}
                            </span>
                            {contact.urduName && (
                              <span className="urdu-sub-name">{contact.urduName}</span>
                            )}
                          </div>

                          <h5 style={{ fontSize: '1rem', fontWeight: 700 }}>
                            {[contact.firstName, contact.lastName]
                              .filter(Boolean)
                              .join(' ')}
                          </h5>

                          {/* Company */}
                          {(contact.company || contact.jobTitle) && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.82rem',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              <Building size={14} />
                              <span>
                                {[contact.jobTitle, contact.company]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </div>
                          )}

                          {/* Phone */}
                          {contact.phones[0] && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.82rem',
                                fontFamily: 'monospace',
                              }}
                            >
                              <Phone size={14} />
                              <span>{formatPakistaniPhone(contact.phones[0].number)}</span>
                            </div>
                          )}

                          {/* Email */}
                          {contact.emails[0] && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.82rem',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              <Mail size={14} />
                              <span>{contact.emails[0].email}</span>
                            </div>
                          )}

                          {/* CNIC */}
                          {contact.cnic && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.8rem',
                                fontFamily: 'monospace',
                                color: 'var(--text-muted)',
                              }}
                            >
                              <CreditCard size={14} />
                              <span>{contact.cnic}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
