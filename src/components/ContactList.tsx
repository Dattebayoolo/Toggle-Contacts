import { useMemo, useState, Fragment } from 'react';
import type {
  Contact,
  Label,
  ViewFilter,
} from '../types/contact';
import { ContactCard } from './ContactCard';
import {
  Trash2,
  Download,
  X,
  UserPlus,
  Users,
} from 'lucide-react';
import { TELECOM_OPERATORS } from '../utils/pakistaniTelecom';

interface ContactListProps {
  contacts: Contact[];
  labels: Label[];
  activeFilter: ViewFilter;
  searchQuery: string;
  viewMode: 'table' | 'grid';
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onToggleStar: (id: string) => void;
  onViewDetails: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onBatchDelete: (ids: string[]) => void;
  onBatchAssignLabel: (ids: string[], labelId: string) => void;
  onBatchExport: (selectedContacts: Contact[]) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onEmptyTrash?: () => void;
  onShowQR: (contact: Contact) => void;
  onOpenCreateModal: () => void;
}

export const ContactList = ({
  contacts,
  labels,
  activeFilter,
  searchQuery,
  viewMode,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onToggleStar,
  onViewDetails,
  onEdit,
  onDelete,
  onBatchDelete,
  onBatchAssignLabel,
  onBatchExport,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  onShowQR,
  onOpenCreateModal,
}) => {
  const [sortBy, setSortBy] = useState<'firstName' | 'lastName' | 'recent'>('firstName');
  const [activeLetter, setActiveLetter] = useState<string>('ALL');

  const isTrashView = activeFilter.type === 'trash';

  // 1. Filter Contacts based on activeFilter & search
  const filteredContacts = useMemo(() => {
    let result = contacts;

    // Filter by category
    if (activeFilter.type === 'all') {
      result = result.filter((c) => !c.deletedAt);
    } else if (activeFilter.type === 'starred') {
      result = result.filter((c) => !c.deletedAt && c.isStarred);
    } else if (activeFilter.type === 'frequent') {
      result = result.filter((c) => !c.deletedAt && c.isFrequent);
    } else if (activeFilter.type === 'trash') {
      result = result.filter((c) => !!c.deletedAt);
    } else if (activeFilter.type === 'operator') {
      const op = activeFilter.operator;
      result = result.filter(
        (c) => !c.deletedAt && c.phones.some((p) => p.operator === op)
      );
    } else if (activeFilter.type === 'city') {
      const city = activeFilter.city.toLowerCase();
      result = result.filter(
        (c) => !c.deletedAt && c.address?.city?.toLowerCase() === city
      );
    } else if (activeFilter.type === 'label') {
      const lid = activeFilter.labelId;
      result = result.filter((c) => !c.deletedAt && c.labels.includes(lid));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const urdu = (c.urduName || '').toLowerCase();
        const phones = c.phones.map((p) => p.number).join(' ');
        const operators = c.phones.map((p) => p.operator || '').join(' ');
        const emails = c.emails.map((e) => e.email).join(' ').toLowerCase();
        const cnic = (c.cnic || '').toLowerCase();
        const city = (c.address?.city || '').toLowerCase();
        const province = (c.address?.province || '').toLowerCase();
        const notes = (c.notes || '').toLowerCase();
        const company = (c.company || '').toLowerCase();

        return (
          fullName.includes(q) ||
          urdu.includes(q) ||
          phones.includes(q) ||
          operators.includes(q) ||
          emails.includes(q) ||
          cnic.includes(q) ||
          city.includes(q) ||
          province.includes(q) ||
          notes.includes(q) ||
          company.includes(q)
        );
      });
    }

    // Filter by Alphabet Jump bar
    if (activeLetter !== 'ALL') {
      result = result.filter((c) => {
        const firstLetter = (c.firstName || c.lastName || '').trim().charAt(0).toUpperCase();
        return firstLetter === activeLetter;
      });
    }

    // Sort contacts
    return [...result].sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'lastName') {
        const lA = (a.lastName || a.firstName).toLowerCase();
        const lB = (b.lastName || b.firstName).toLowerCase();
        return lA.localeCompare(lB);
      }
      const fA = (a.firstName || a.lastName).toLowerCase();
      const fB = (b.firstName || b.lastName).toLowerCase();
      return fA.localeCompare(fB);
    });
  }, [contacts, activeFilter, searchQuery, activeLetter, sortBy]);

  // Group by alphabetical letters for Table View
  const groupedContacts = useMemo(() => {
    const groups: { letter: string; items: Contact[] }[] = [];
    const map = new Map<string, Contact[]>();

    for (const c of filteredContacts) {
      const name = (c.firstName || c.lastName || 'Others').trim();
      let letter = name.charAt(0).toUpperCase();
      if (!/^[A-Z]$/.test(letter)) {
        letter = '#';
      }
      const list = map.get(letter) || [];
      list.push(c);
      map.set(letter, list);
    }

    const sortedLetters = Array.from(map.keys()).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });

    for (const letter of sortedLetters) {
      groups.push({ letter, items: map.get(letter)! });
    }

    return groups;
  }, [filteredContacts]);

  // View title determination
  const viewTitle = useMemo(() => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (activeFilter.type === 'all') return 'Contacts';
    if (activeFilter.type === 'starred') return 'Starred Contacts';
    if (activeFilter.type === 'frequent') return 'Frequently Contacted';
    if (activeFilter.type === 'trash') return 'Trash / Recycle Bin';
    if (activeFilter.type === 'operator') {
      const info = TELECOM_OPERATORS[activeFilter.operator];
      return `${info.displayName} (${info.urduName}) Numbers`;
    }
    if (activeFilter.type === 'city') return `${activeFilter.city} Contacts`;
    if (activeFilter.type === 'label') {
      const lbl = labels.find((l) => l.id === activeFilter.labelId);
      return lbl ? `${lbl.name} ${lbl.urduName ? `(${lbl.urduName})` : ''}` : 'Labeled';
    }
    return 'Contacts';
  }, [activeFilter, searchQuery, labels]);

  const allFilteredIds = filteredContacts.map((c) => c.id);
  const isAllSelected =
    allFilteredIds.length > 0 &&
    allFilteredIds.every((id) => selectedIds.includes(id));

  // Available Alphabet jump letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="contact-list-container">
      {/* Header bar */}
      <div className="contact-view-header">
        <div className="view-title-row">
          <div className="view-heading-wrap">
            <h2 className="view-main-title">{viewTitle}</h2>
            <span className="view-count-badge">({filteredContacts.length})</span>
          </div>

          <div className="view-controls">
            {isTrashView && filteredContacts.length > 0 && (
              <button
                className="btn-danger"
                onClick={onEmptyTrash}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                id="empty-trash-btn"
              >
                <Trash2 size={14} />
                <span>Empty Trash</span>
              </button>
            )}

            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              id="sort-select"
            >
              <option value="firstName">Sort by First name</option>
              <option value="lastName">Sort by Last name</option>
              <option value="recent">Sort by Recently added</option>
            </select>
          </div>
        </div>

        {/* Bulk Selection Banner */}
        {selectedIds.length > 0 && (
          <div className="bulk-action-bar">
            <div className="bulk-left">
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={isAllSelected}
                onChange={() => {
                  if (isAllSelected) onClearSelection();
                  else onSelectAll(allFilteredIds);
                }}
              />
              <span>{selectedIds.length} selected</span>
            </div>

            <div className="bulk-right">
              {/* Batch Export */}
              <button
                className="bulk-action-btn"
                onClick={() => {
                  const selContacts = contacts.filter((c) =>
                    selectedIds.includes(c.id)
                  );
                  onBatchExport(selContacts);
                }}
                title="Export selected contacts to vCard / CSV"
              >
                <Download size={14} />
                <span>Export</span>
              </button>

              {/* Batch Assign Label */}
              <select
                className="bulk-action-btn"
                style={{ border: 'none', outline: 'none', cursor: 'pointer' }}
                onChange={(e) => {
                  if (e.target.value) {
                    onBatchAssignLabel(selectedIds, e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled style={{ color: '#000' }}>
                  Assign Label...
                </option>
                {labels.map((lbl) => (
                  <option key={lbl.id} value={lbl.id} style={{ color: '#000' }}>
                    {lbl.name}
                  </option>
                ))}
              </select>

              {/* Batch Delete */}
              <button
                className="bulk-action-btn danger"
                onClick={() => onBatchDelete(selectedIds)}
                title="Delete selected contacts"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>

              <button
                className="bulk-action-btn"
                onClick={onClearSelection}
                title="Clear selection"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Alphabet Jump Bar */}
        <div className="alphabet-bar">
          <button
            className={`letter-btn ${activeLetter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveLetter('ALL')}
            style={{ width: 'auto', padding: '0 0.5rem', borderRadius: '12px' }}
          >
            All
          </button>
          {alphabet.map((letter) => (
            <button
              key={letter}
              className={`letter-btn ${activeLetter === letter ? 'active' : ''}`}
              onClick={() => setActiveLetter(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Main List Render */}
      {filteredContacts.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-icon-circle">
            <Users size={32} />
          </div>
          <h3 className="empty-title">
            {isTrashView
              ? 'Trash is empty'
              : searchQuery
              ? 'No matching contacts found'
              : 'No contacts here yet'}
          </h3>
          <p className="empty-desc">
            {isTrashView
              ? 'Deleted contacts will appear here before being permanently erased.'
              : searchQuery
              ? `No contacts matched your search "${searchQuery}". Try searching by phone number (0300), city, or name.`
              : 'Add your friends, family, and colleagues in Pakistan with automatic mobile network detection.'}
          </p>
          {!isTrashView && !searchQuery && (
            <button
              className="btn-primary"
              onClick={onOpenCreateModal}
              style={{ marginTop: '0.5rem' }}
            >
              <UserPlus size={16} />
              <span>Create Contact</span>
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="contact-table-wrap">
          <table className="contact-table">
            <thead>
              <tr>
                <th className="table-cell-select">
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={isAllSelected}
                    onChange={() => {
                      if (isAllSelected) onClearSelection();
                      else onSelectAll(allFilteredIds);
                    }}
                    title="Select All"
                  />
                </th>
                <th>Name / نام</th>
                <th>Job & Company</th>
                <th>Phone & Operator</th>
                <th>Email</th>
                <th>City / شہر</th>
                <th className="table-cell-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedContacts.map((group) => (
                <Fragment key={group.letter}>
                  <tr>
                    <td
                      colSpan={7}
                      className="alphabet-group-header"
                    >
                      {group.letter}
                    </td>
                  </tr>
                  {group.items.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      labels={labels}
                      isSelected={selectedIds.includes(contact.id)}
                      onToggleSelect={onToggleSelect}
                      onToggleStar={onToggleStar}
                      onViewDetails={onViewDetails}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onRestore={onRestore}
                      onPermanentDelete={onPermanentDelete}
                      onShowQR={onShowQR}
                      viewMode="table"
                      isTrashView={isTrashView}
                    />
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="contact-grid">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              labels={labels}
              isSelected={selectedIds.includes(contact.id)}
              onToggleSelect={onToggleSelect}
              onToggleStar={onToggleStar}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onDelete={onDelete}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
              onShowQR={onShowQR}
              viewMode="grid"
              isTrashView={isTrashView}
            />
          ))}
        </div>
      )}
    </div>
  );
};
