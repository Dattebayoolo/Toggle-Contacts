import { useEffect, useRef, useState } from 'react';
import { X, Download, QrCode, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import type { Contact } from '../types/contact';
import { contactsToVCard } from '../utils/vcard';
import { formatPakistaniPhone, TELECOM_OPERATORS } from '../utils/pakistaniTelecom';

interface QRCodeModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal = ({
  contact,
  isOpen,
  onClose,
}: QRCodeModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !contact) return;

    const vCardPayload = contactsToVCard([contact]);

    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        vCardPayload,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#064E3B', // Pakistani deep green
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code', error);
          else if (canvasRef.current) {
            setDataUrl(canvasRef.current.toDataURL('image/png'));
          }
        }
      );
    }
  }, [contact, isOpen]);

  if (!isOpen || !contact) return null;

  const primaryPhone = contact.phones[0];
  const operator = primaryPhone?.operator
    ? TELECOM_OPERATORS[primaryPhone.operator]
    : null;

  const handleDownloadQR = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `${contact.firstName}_${contact.lastName}_qr.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-window"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
        id="qr-code-modal"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--brand-green-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrCode size={18} />
            </div>
            <h3 className="modal-title">Scan Contact Card</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="modal-body"
          style={{ alignItems: 'center', textAlign: 'center', gap: '1rem' }}
        >
          {/* Contact summary header */}
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {[contact.firstName, contact.lastName].filter(Boolean).join(' ')}
            </h4>
            {contact.urduName && (
              <span className="urdu-sub-name" style={{ fontSize: '0.95rem' }}>
                {contact.urduName}
              </span>
            )}
            {primaryPhone && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  marginTop: '0.35rem',
                }}
              >
                {operator && (
                  <span className={`badge badge-operator-${operator.operator}`}>
                    {operator.displayName}
                  </span>
                )}
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {formatPakistaniPhone(primaryPhone.number)}
                </span>
              </div>
            )}
          </div>

          {/* QR Code Canvas */}
          <div
            style={{
              padding: '1rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <canvas ref={canvasRef} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
            }}
          >
            <Smartphone size={16} />
            <span>Scan with any iPhone or Android camera to save instantly</span>
          </div>

          <button
            className="btn-secondary"
            onClick={handleDownloadQR}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={15} />
            <span>Download QR PNG</span>
          </button>
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
