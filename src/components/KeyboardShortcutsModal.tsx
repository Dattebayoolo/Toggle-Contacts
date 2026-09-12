import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal = ({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', desc: 'Focus global search input' },
    { key: 'c', desc: 'Create new contact' },
    { key: 'm', desc: 'Open Merge & Fix duplicates wizard' },
    { key: 'e', desc: 'Open Pakistani Emergency numbers' },
    { key: '?', desc: 'Show keyboard shortcuts' },
    { key: 'Esc', desc: 'Close any open drawer or modal' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-window"
        style={{ maxWidth: 460 }}
        onClick={(e) => e.stopPropagation()}
        id="shortcuts-modal"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Keyboard size={20} style={{ color: 'var(--brand-green-emerald)' }} />
            <h3 className="modal-title">Keyboard Shortcuts</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {shortcuts.map((s) => (
              <div
                key={s.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {s.desc}
                </span>
                <kbd
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '0.2rem 0.6rem',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
