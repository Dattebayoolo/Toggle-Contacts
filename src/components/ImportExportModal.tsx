import { useState } from 'react';
import {
  X,
  Download,
  Upload,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import type { Contact } from '../types/contact';
import { contactsToVCard, parseVCard } from '../utils/vcard';
import {
  contactsToGoogleCsv,
  downloadFile,
  parseCsvContacts,
} from '../utils/csvExporter';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onImportContacts: (parsed: Partial<Contact>[]) => number;
}

export const ImportExportModal = ({
  isOpen,
  onClose,
  contacts,
  onImportContacts,
}: ImportExportModalProps) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<'vcf' | 'google-csv' | 'pk-csv'>('vcf');
  const [exportScope, setExportScope] = useState<'all' | 'starred'>('all');

  // Import state
  const [importedPreview, setImportedPreview] = useState<Partial<Contact>[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeContacts = contacts.filter((c) => !c.deletedAt);
  const contactsToExport =
    exportScope === 'starred'
      ? activeContacts.filter((c) => c.isStarred)
      : activeContacts;

  // Handle Export
  const handleExport = () => {
    if (contactsToExport.length === 0) {
      alert('No contacts available to export for the selected filter.');
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);

    if (exportFormat === 'vcf') {
      const vcfData = contactsToVCard(contactsToExport);
      downloadFile(
        vcfData,
        `toggle-contacts-pk-${timestamp}.vcf`,
        'text/vcard'
      );
    } else {
      const csvData = contactsToGoogleCsv(contactsToExport);
      downloadFile(
        csvData,
        `toggle-contacts-${exportFormat}-${timestamp}.csv`,
        'text/csv'
      );
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportStatus(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      let parsed: Partial<Contact>[] = [];
      if (file.name.endsWith('.vcf') || file.name.endsWith('.vcard')) {
        parsed = parseVCard(text);
      } else if (file.name.endsWith('.csv')) {
        parsed = parseCsvContacts(text);
      } else {
        alert('Unsupported format. Please select a .vcf (vCard) or .csv file.');
        return;
      }

      setImportedPreview(parsed);
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (importedPreview.length === 0) return;
    const count = onImportContacts(importedPreview);
    setImportStatus(`Successfully imported ${count} contacts into Toggle Contacts!`);
    setImportedPreview([]);
    setImportFileName('');
  };

  const handleDownloadSampleCsv = () => {
    const sample =
      'Given Name,Family Name,Urdu Name,Phone 1 - Value,Phone 1 - Type,Organization Name,Organization Title,CNIC,Address 1 - City,Address 1 - Region,Notes\n' +
      'Muhammad,Usman,محمد عثمان,03001234567,mobile,Systems Limited,Software Engineer,35202-1234567-1,Lahore,Punjab,Sample Pakistani contact';
    downloadFile(sample, 'toggle-contacts-sample-template.csv', 'text/csv');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-window"
        onClick={(e) => e.stopPropagation()}
        id="import-export-modal"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3 className="modal-title">Import & Export Contacts</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-app)',
          }}
        >
          <button
            style={{
              flex: 1,
              padding: '0.85rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              color:
                activeTab === 'export'
                  ? 'var(--brand-green-emerald)'
                  : 'var(--text-muted)',
              borderBottom:
                activeTab === 'export'
                  ? '2px solid var(--brand-green-emerald)'
                  : 'none',
              background: activeTab === 'export' ? 'var(--bg-surface)' : 'none',
            }}
            onClick={() => setActiveTab('export')}
          >
            Export Contacts
          </button>
          <button
            style={{
              flex: 1,
              padding: '0.85rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              color:
                activeTab === 'import'
                  ? 'var(--brand-green-emerald)'
                  : 'var(--text-muted)',
              borderBottom:
                activeTab === 'import'
                  ? '2px solid var(--brand-green-emerald)'
                  : 'none',
              background: activeTab === 'import' ? 'var(--bg-surface)' : 'none',
            }}
            onClick={() => setActiveTab('import')}
          >
            Import Contacts
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {activeTab === 'export' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Select Contacts to Export</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'all'}
                      onChange={() => setExportScope('all')}
                    />
                    <span>All active contacts ({activeContacts.length})</span>
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'starred'}
                      onChange={() => setExportScope('starred')}
                    />
                    <span>
                      Starred only ({activeContacts.filter((c) => c.isStarred).length})
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Export Format</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background:
                        exportFormat === 'vcf' ? 'var(--brand-green-subtle)' : 'none',
                    }}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === 'vcf'}
                      onChange={() => setExportFormat('vcf')}
                    />
                    <div>
                      <strong>vCard 3.0 (.vcf)</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Recommended for iPhone, Android, and Outlook address books.
                      </p>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background:
                        exportFormat === 'google-csv'
                          ? 'var(--brand-green-subtle)'
                          : 'none',
                    }}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === 'google-csv'}
                      onChange={() => setExportFormat('google-csv')}
                    />
                    <div>
                      <strong>Google Contacts CSV</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Directly importable into Google Contacts or Microsoft Excel.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleExport}
                style={{ justifyContent: 'center', padding: '0.75rem' }}
                id="confirm-export-btn"
              >
                <Download size={18} />
                <span>Export {contactsToExport.length} Contacts</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Import contacts from a <strong>.vcf (vCard)</strong> file or a{' '}
                <strong>.csv</strong> spreadsheet.
              </p>

              {/* Upload Input Area */}
              <label
                style={{
                  border: '2px dashed var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  background: 'var(--bg-app)',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <Upload size={32} style={{ color: 'var(--brand-green-emerald)' }} />
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {importFileName ? importFileName : 'Click to browse contact file'}
                  </span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Supports .vcf, .vcard, or .csv files
                  </p>
                </div>
                <input
                  type="file"
                  accept=".vcf,.vcard,.csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {importStatus && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--brand-green-emerald)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  <CheckCircle size={18} />
                  <span>{importStatus}</span>
                </div>
              )}

              {importedPreview.length > 0 && (
                <div
                  style={{
                    background: 'var(--brand-green-subtle)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Found {importedPreview.length} contact(s) ready to import.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={handleConfirmImport}
                    style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
                  >
                    Confirm & Import {importedPreview.length} Contacts
                  </button>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--brand-green-emerald)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <FileSpreadsheet size={16} />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>
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
