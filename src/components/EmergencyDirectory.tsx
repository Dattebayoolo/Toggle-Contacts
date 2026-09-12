import {
  X,
  ShieldAlert,
  Phone,
  UserPlus,
  Check,
} from 'lucide-react';
import { PAKISTANI_EMERGENCY_SERVICES } from '../utils/mockData';
import type { Contact } from '../types/contact';

interface EmergencyDirectoryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmergencyContact: (serviceContact: Partial<Contact>) => void;
  existingContacts: Contact[];
}

export const EmergencyDirectory = ({
  isOpen,
  onClose,
  onAddEmergencyContact,
  existingContacts,
}: EmergencyDirectoryProps) => {
  if (!isOpen) return null;

  const isAlreadyAdded = (shortCode: string) => {
    return existingContacts.some(
      (c) =>
        !c.deletedAt &&
        c.phones.some((p) => p.number.replace(/[^0-9]/g, '') === shortCode)
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-window wide"
        onClick={(e) => e.stopPropagation()}
        id="emergency-directory-modal"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="modal-title">Pakistani Emergency Directory</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                پاکستان کی قومی اور صوبائی ہنگامی ہیلپ لائنز (24/7 مفت رابطہ)
              </span>
            </div>
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
        <div className="modal-body">
          <div
            style={{
              background: 'var(--brand-green-subtle)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              fontSize: '0.88rem',
              color: 'var(--text-primary)',
            }}
          >
            <strong>Official Pakistani Helplines:</strong> Tap &quot;Call&quot; to dial
            immediately from your phone, or tap &quot;Save to Contacts&quot; to save them
            into your personal Toggle Contacts list with one click.
          </div>

          <div className="emergency-grid">
            {PAKISTANI_EMERGENCY_SERVICES.map((srv) => {
              const added = isAlreadyAdded(srv.shortCode);

              return (
                <div key={srv.id} className="emergency-card">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      className="emergency-code-badge"
                      style={{ color: srv.badgeColor }}
                    >
                      {srv.shortCode}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {srv.category}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>
                      {srv.name}
                    </h4>
                    <span
                      className="urdu-text"
                      style={{
                        fontSize: '0.88rem',
                        color: 'var(--brand-green-emerald)',
                        fontWeight: 600,
                        display: 'block',
                        marginTop: '0.2rem',
                      }}
                    >
                      {srv.urduName}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.4,
                      flex: 1,
                    }}
                  >
                    {srv.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <a
                      href={`tel:${srv.shortCode}`}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: '0.4rem',
                        fontSize: '0.8rem',
                        justifyContent: 'center',
                        background: srv.badgeColor,
                      }}
                    >
                      <Phone size={14} />
                      <span>Call {srv.shortCode}</span>
                    </a>

                    {added ? (
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: 'var(--brand-green-emerald)',
                          padding: '0.4rem 0.6rem',
                        }}
                        title="Saved in your contacts"
                      >
                        <Check size={14} />
                        <span>Saved</span>
                      </span>
                    ) : (
                      <button
                        className="btn-secondary"
                        style={{
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                        onClick={() => {
                          onAddEmergencyContact({
                            firstName: srv.name,
                            urduName: srv.urduName,
                            company: 'Government of Pakistan / Welfare',
                            jobTitle: `${srv.category} Emergency`,
                            phones: [
                              {
                                id: `p-emg-${srv.shortCode}`,
                                number: srv.shortCode,
                                type: 'mobile',
                                operator: 'other',
                                isPrimary: true,
                              },
                              ...(srv.fullPhone
                                ? [
                                    {
                                      id: `p-emg-full-${srv.shortCode}`,
                                      number: srv.fullPhone,
                                      type: 'work' as const,
                                      operator: 'other' as const,
                                    },
                                  ]
                                : []),
                            ],
                            labels: ['emergency'],
                            notes: `${srv.description} Available 24/7.`,
                            isStarred: true,
                            isEmergency: true,
                          });
                        }}
                        title="Add to my Toggle Contacts"
                      >
                        <UserPlus size={14} />
                        <span>Save</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
