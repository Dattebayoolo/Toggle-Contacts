import { useState } from 'react';
import {
  Users,
  Clock,
  Star,
  GitMerge,
  ShieldAlert,
  Tag,
  Trash2,
  Download,
  Printer,
  RotateCcw,
  Plus,
  Signal,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { Contact, Label, TelecomOperator, ViewFilter } from '../types/contact';
import { TELECOM_OPERATORS } from '../utils/pakistaniTelecom';

interface SidebarProps {
  contacts: Contact[];
  labels: Label[];
  activeFilter: ViewFilter;
  onSelectFilter: (filter: ViewFilter) => void;
  duplicateCount: number;
  onOpenCreateModal: () => void;
  onOpenMergeModal: () => void;
  onOpenEmergencyModal: () => void;
  onOpenImportExportModal: () => void;
  onPrintDirectory: () => void;
  onResetDemoData: () => void;
  onAddLabel: (name: string, urduName?: string) => void;
  isOpen: boolean;
  isSidebarOpen?: boolean;
  onCloseMobile: () => void;
}

export const Sidebar = ({
  contacts,
  labels,
  activeFilter,
  onSelectFilter,
  duplicateCount,
  onOpenCreateModal,
  onOpenMergeModal,
  onOpenEmergencyModal,
  onOpenImportExportModal,
  onPrintDirectory,
  onResetDemoData,
  onAddLabel,
  isOpen,
  isSidebarOpen = true,
  onCloseMobile,
}: SidebarProps) => {
  const [operatorsOpen, setOperatorsOpen] = useState(true);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelUrdu, setNewLabelUrdu] = useState('');

  const activeContacts = contacts.filter((c) => !c.deletedAt);
  const starredContacts = activeContacts.filter((c) => c.isStarred);
  const frequentContacts = activeContacts.filter((c) => c.isFrequent);
  const trashContacts = contacts.filter((c) => !!c.deletedAt);

  const handleCreateLabelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabelName.trim()) {
      onAddLabel(newLabelName.trim(), newLabelUrdu.trim());
      setNewLabelName('');
      setNewLabelUrdu('');
      setIsAddingLabel(false);
    }
  };

  const isFilterActive = (filter: ViewFilter): boolean => {
    if (activeFilter.type !== filter.type) return false;
    if (filter.type === 'operator' && activeFilter.type === 'operator') {
      return activeFilter.operator === filter.operator;
    }
    if (filter.type === 'label' && activeFilter.type === 'label') {
      return activeFilter.labelId === filter.labelId;
    }
    return true;
  };

  const operatorsList: TelecomOperator[] = [
    'jazz',
    'zong',
    'telenor',
    'ufone',
    'scom',
    'onic',
  ];

  return (
    <>
      {isOpen && window.innerWidth <= 900 && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          id="mobile-sidebar-backdrop"
        />
      )}

      <aside
        className={`sidebar ${isSidebarOpen ? 'desktop-open' : 'desktop-collapsed'} ${isOpen ? 'mobile-open' : ''}`}
        id="app-sidebar"
      >
        {/* Google Floating "+ Create contact" Button */}
        <div className="sidebar-fab-wrap">
          <button
            type="button"
            className="google-fab-create"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenCreateModal();
            }}
            id="sidebar-create-contact-fab"
          >
            <div className="google-plus-icon">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
                <path fill="#4285F4" d="M11 11V5h2v6z" />
                <path fill="#FBBC05" d="M19 11h-6v2h6z" />
                <path fill="#34A853" d="M13 19h-2v-6h2z" />
              </svg>
            </div>
            <span>Create contact</span>
          </button>
        </div>

        <div className="sidebar-content">
          {/* Main Navigation */}
          <div className="sidebar-nav-group">
            <div
              className={`sidebar-link ${isFilterActive({ type: 'all' }) ? 'active' : ''}`}
              onClick={() => {
                onSelectFilter({ type: 'all' });
                onCloseMobile();
              }}
              id="sidebar-all-contacts"
            >
              <div className="sidebar-link-content">
                <Users className="sidebar-link-icon" />
                <span>Contacts</span>
              </div>
              <span className="sidebar-count-pill">{activeContacts.length}</span>
            </div>

            <div
              className={`sidebar-link ${isFilterActive({ type: 'starred' }) ? 'active' : ''}`}
              onClick={() => {
                onSelectFilter({ type: 'starred' });
                onCloseMobile();
              }}
              id="sidebar-starred-contacts"
            >
              <div className="sidebar-link-content">
                <Star className="sidebar-link-icon" />
                <span>Starred</span>
              </div>
              {starredContacts.length > 0 && (
                <span className="sidebar-count-pill">{starredContacts.length}</span>
              )}
            </div>

            <div
              className={`sidebar-link ${isFilterActive({ type: 'frequent' }) ? 'active' : ''}`}
              onClick={() => {
                onSelectFilter({ type: 'frequent' });
                onCloseMobile();
              }}
              id="sidebar-frequent-contacts"
            >
              <div className="sidebar-link-content">
                <Clock className="sidebar-link-icon" />
                <span>Frequent</span>
              </div>
              {frequentContacts.length > 0 && (
                <span className="sidebar-count-pill">{frequentContacts.length}</span>
              )}
            </div>
          </div>

          {/* Pakistani Special Hub */}
          <div className="sidebar-nav-group">
            <span className="sidebar-group-title">Pakistani Local Hub</span>

            {/* Emergency Numbers */}
            <div
              className="sidebar-link"
              onClick={() => {
                onOpenEmergencyModal();
                onCloseMobile();
              }}
              id="sidebar-emergency-hub"
              style={{ color: '#DC2626' }}
            >
              <div className="sidebar-link-content">
                <ShieldAlert className="sidebar-link-icon" style={{ color: '#DC2626' }} />
                <span>Emergency 1122 / 15</span>
              </div>
              <span className="badge-pulse">PK</span>
            </div>

            {/* Telecom Networks Collapsible */}
            <div
              className="sidebar-link"
              onClick={() => setOperatorsOpen(!operatorsOpen)}
              style={{ cursor: 'pointer' }}
            >
              <div className="sidebar-link-content">
                <Signal className="sidebar-link-icon" />
                <span>Telecom Networks</span>
              </div>
              {operatorsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            {operatorsOpen && (
              <div className="operator-sublist">
                {operatorsList.map((opKey) => {
                  const info = TELECOM_OPERATORS[opKey];
                  const count = activeContacts.filter((c) =>
                    c.phones.some((p) => p.operator === opKey)
                  ).length;
                  const isSel =
                    activeFilter.type === 'operator' && activeFilter.operator === opKey;

                  return (
                    <div
                      key={opKey}
                      className={`operator-subitem ${isSel ? 'active' : ''}`}
                      onClick={() => {
                        onSelectFilter({ type: 'operator', operator: opKey });
                        onCloseMobile();
                      }}
                    >
                      <span
                        className="operator-dot"
                        style={{ background: info.brandColor }}
                      />
                      <span>{info.displayName}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fix & Manage (Google Contacts style) */}
          <div className="sidebar-nav-group">
            <span className="sidebar-group-title">Fix & Manage</span>

            <div
              className="sidebar-link"
              onClick={() => {
                onOpenMergeModal();
                onCloseMobile();
              }}
              id="sidebar-merge-duplicates"
            >
              <div className="sidebar-link-content">
                <GitMerge className="sidebar-link-icon" />
                <span>Merge & Fix</span>
              </div>
              {duplicateCount > 0 && (
                <span className="badge-pulse">{duplicateCount}</span>
              )}
            </div>

            <div
              className={`sidebar-link ${isFilterActive({ type: 'trash' }) ? 'active' : ''}`}
              onClick={() => {
                onSelectFilter({ type: 'trash' });
                onCloseMobile();
              }}
              id="sidebar-trash"
            >
              <div className="sidebar-link-content">
                <Trash2 className="sidebar-link-icon" />
                <span>Trash</span>
              </div>
              {trashContacts.length > 0 && (
                <span className="sidebar-count-pill">{trashContacts.length}</span>
              )}
            </div>
          </div>

          {/* Labels & Tags */}
          <div className="sidebar-nav-group">
            <div className="sidebar-group-title">
              <span>Labels / گروپس</span>
              <button
                className="btn-add-label"
                onClick={() => setIsAddingLabel(!isAddingLabel)}
                title="Add custom label"
              >
                <Plus size={14} />
              </button>
            </div>

            {isAddingLabel && (
              <form
                onSubmit={handleCreateLabelSubmit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.5rem',
                }}
              >
                <input
                  type="text"
                  placeholder="Label name (e.g. Neighbors)"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  autoFocus
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                />
                <input
                  type="text"
                  placeholder="اردو نام (مثال: محلہ)"
                  value={newLabelUrdu}
                  onChange={(e) => setNewLabelUrdu(e.target.value)}
                  className="urdu-text"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                />
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddingLabel(false)}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {labels.map((lbl) => {
              const count = activeContacts.filter((c) => c.labels.includes(lbl.id)).length;
              const isSel =
                activeFilter.type === 'label' && activeFilter.labelId === lbl.id;

              return (
                <div
                  key={lbl.id}
                  className={`sidebar-link ${isSel ? 'active' : ''}`}
                  onClick={() => {
                    onSelectFilter({ type: 'label', labelId: lbl.id });
                    onCloseMobile();
                  }}
                >
                  <div className="sidebar-link-content">
                    <Tag className="sidebar-link-icon" style={{ color: lbl.color }} />
                    <span>
                      {lbl.name} {lbl.urduName && <span className="urdu-text" style={{ fontSize: '0.8rem' }}>({lbl.urduName})</span>}
                    </span>
                  </div>
                  {count > 0 && <span className="sidebar-count-pill">{count}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="sidebar-footer">
          <button
            className="sidebar-footer-btn"
            onClick={onOpenImportExportModal}
            id="sidebar-import-export-btn"
          >
            <Download size={16} />
            <span>Import & Export (.vcf / CSV)</span>
          </button>

          <button
            className="sidebar-footer-btn"
            onClick={onPrintDirectory}
            id="sidebar-print-btn"
          >
            <Printer size={16} />
            <span>Print Directory</span>
          </button>

          <button
            className="sidebar-footer-btn"
            onClick={onResetDemoData}
            id="sidebar-reset-demo-btn"
            title="Permanently delete all contacts"
          >
            <RotateCcw size={16} />
            <span>Clear All Contacts</span>
          </button>
        </div>
      </aside>
    </>
  );
};
