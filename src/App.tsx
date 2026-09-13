import { useState, useEffect, useCallback } from 'react';
import { useContacts } from './hooks/useContacts';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { ContactList } from './components/ContactList';
import { ContactDetailModal } from './components/ContactDetailModal';
import { ContactFormModal } from './components/ContactFormModal';
import { MergeDuplicatesModal } from './components/MergeDuplicatesModal';
import { EmergencyDirectory } from './components/EmergencyDirectory';
import { ImportExportModal } from './components/ImportExportModal';
import { QRCodeModal } from './components/QRCodeModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { Contact, ViewFilter, DuplicateGroup } from './types/contact';
import { findDuplicates } from './utils/duplicateDetector';
import { downloadFile } from './utils/csvExporter';
import { contactsToVCard } from './utils/vcard';

import './index.css';
import './styles/navbar.css';
import './styles/sidebar.css';
import './styles/contact-list.css';
import './styles/modals.css';
import './styles/print.css';

export function App() {
  // Toggle Account System session (hosted sign-in + sign-out)
  const { user, isSigningIn, authError, signIn, signOut } = useAuth();

  // Contact storage is scoped to the signed-in Toggle Account user id
  const {
    contacts,
    labels,
    addContact,
    updateContact,
    deleteContact,
    restoreContact,
    permanentlyDeleteContact,
    emptyTrash,
    toggleStar,
    batchDelete,
    batchAssignLabel,
    mergeDuplicatesAction,
    importContacts,
    addLabel,
    clearAllData,
  } = useContacts(user?.userId);

  // Current view: 'landing' (default on launch) or 'app' (contacts dashboard)
  const [currentView, setCurrentView] = useState<'landing' | 'app'>(() => {
    // If returning from OAuth callback, jump straight to the app
    const params = new URLSearchParams(window.location.search);
    if (params.get('code') || params.get('error')) {
      return 'app';
    }
    return 'landing';
  });

  // Navigation & Filter State
  const [activeFilter, setActiveFilter] = useState<ViewFilter>({ type: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals & Drawers State
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [formContact, setFormContact] = useState<Contact | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  const [qrContact, setQrContact] = useState<Contact | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Toast Stack
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success', onUndo?: () => void) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message: msg, type, onUndo }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('toggle_contacts_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      isDarkMode ? 'dark' : 'light'
    );
    localStorage.setItem('toggle_contacts_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Duplicate count
  const duplicateGroups = findDuplicates(contacts);
  const duplicateCount = duplicateGroups.length;

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setFormContact(null);
        setIsFormOpen(true);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMergeOpen(true);
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setIsEmergencyOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === 'Escape') {
        setIsDetailOpen(false);
        setIsFormOpen(false);
        setIsMergeOpen(false);
        setIsEmergencyOpen(false);
        setIsImportExportOpen(false);
        setIsQrOpen(false);
        setIsShortcutsOpen(false);
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Selection handlers
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // CRUD Actions with Toast & Undo
  const handleCreateContact = useCallback(() => {
    setFormContact(null);
    setIsFormOpen(true);
  }, []);

  const handleEditContact = useCallback((contact: Contact) => {
    setFormContact(contact);
    setIsFormOpen(true);
  }, []);

  const handleSaveContact = useCallback(
    (contactData: Partial<Contact>) => {
      if (formContact) {
        updateContact(formContact.id, contactData);
        addToast(`Updated contact ${contactData.firstName || ''}`);
        // If drawer is viewing this contact, update it
        if (detailContact?.id === formContact.id) {
          setDetailContact((prev) => (prev ? { ...prev, ...contactData } : null));
        }
      } else {
        const created = addContact(contactData);
        addToast(`Created new contact ${created.firstName}`);
      }
    },
    [formContact, updateContact, addContact, detailContact, addToast]
  );

  const handleDeleteContact = useCallback(
    (id: string) => {
      const target = contacts.find((c) => c.id === id);
      deleteContact(id);
      setSelectedIds((prev) => prev.filter((i) => i !== id));

      addToast(
        `Moved "${target?.firstName || 'Contact'}" to Trash`,
        'info',
        () => {
          restoreContact(id);
          addToast('Contact restored');
        }
      );
    },
    [contacts, deleteContact, restoreContact, addToast]
  );

  const handleBatchDelete = useCallback(
    (ids: string[]) => {
      batchDelete(ids);
      setSelectedIds([]);
      addToast(`Moved ${ids.length} contacts to Trash`, 'info', () => {
        ids.forEach((id) => restoreContact(id));
        addToast('Restored selected contacts');
      });
    },
    [batchDelete, restoreContact, addToast]
  );

  const handleBatchAssignLabel = useCallback(
    (ids: string[], labelId: string) => {
      batchAssignLabel(ids, labelId);
      addToast(`Assigned label to ${ids.length} contacts`);
    },
    [batchAssignLabel, addToast]
  );

  const handleBatchExport = useCallback((selectedContacts: Contact[]) => {
    const vcf = contactsToVCard(selectedContacts);
    downloadFile(vcf, `toggle-selected-contacts-${Date.now()}.vcf`, 'text/vcard');
    addToast(`Exported ${selectedContacts.length} contacts to vCard (.vcf)`);
  }, [addToast]);

  const handleViewDetails = useCallback((contact: Contact) => {
    setDetailContact(contact);
    setIsDetailOpen(true);
  }, []);

  const handleShowQR = useCallback((contact: Contact) => {
    setQrContact(contact);
    setIsQrOpen(true);
  }, []);

  // Merge Duplicates
  const handleMergeGroup = useCallback(
    (primaryId: string, duplicateIds: string[]) => {
      mergeDuplicatesAction(primaryId, duplicateIds);
      addToast(`Merged ${duplicateIds.length + 1} contacts into 1`);
    },
    [mergeDuplicatesAction, addToast]
  );

  const handleMergeAll = useCallback(
    (groups: DuplicateGroup[]) => {
      let totalMerged = 0;
      for (const group of groups) {
        const primary = group.contacts[0];
        const others = group.contacts.slice(1).map((c) => c.id);
        mergeDuplicatesAction(primary.id, others);
        totalMerged += others.length;
      }
      addToast(`Merged all ${totalMerged} duplicates successfully!`);
    },
    [mergeDuplicatesAction, addToast]
  );

  // Import handler
  const handleImportContacts = useCallback(
    (parsed: Partial<Contact>[]) => {
      const count = importContacts(parsed);
      addToast(`Imported ${count} contacts from file`);
      return count;
    },
    [importContacts, addToast]
  );

  // Add Emergency Contact
  const handleAddEmergencyContact = useCallback(
    (srvData: Partial<Contact>) => {
      addContact(srvData);
      addToast(`Added "${srvData.firstName}" to your contacts!`);
    },
    [addContact, addToast]
  );

  // Print Directory
  const handlePrintDirectory = useCallback(() => {
    window.print();
  }, []);

  // Clear all contacts
  const handleClearAllData = useCallback(() => {
    if (
      window.confirm(
        'This will permanently delete ALL your contacts and reset labels. Are you sure?'
      )
    ) {
      clearAllData();
      addToast('All contacts cleared', 'info');
    }
  }, [clearAllData, addToast]);

  // If a Toggle Account is linked the app uses per-account storage; otherwise it
  // runs on shared storage. Sign-in lives in the Navbar account menu.
  useEffect(() => {
    if (authError) {
      queueMicrotask(() => {
        addToast(authError, 'error');
      });
    }
  }, [authError, addToast]);

  // If user is on the landing page (default on launch), render the landing page
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onLaunchApp={() => setCurrentView('app')}
          onSignIn={signIn}
          isSigningIn={isSigningIn}
          user={user}
          onSignOut={signOut}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="app-container" id="toggle-contacts-root">
      {/* Top Navigation Bar */}
      <Navbar
        user={user}
        onSignIn={signIn}
        isSigningIn={isSigningIn}
        onSignOut={signOut}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={handleCreateContact}
        onOpenShortcutsModal={() => setIsShortcutsOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onToggleSidebar={() => {
          if (window.innerWidth <= 900) {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
          } else {
            setIsSidebarOpen(!isSidebarOpen);
          }
        }}
      />

      {/* App Body (Sidebar + Content) */}
      <div className="app-body">
        {/* Sidebar */}
        <Sidebar
          contacts={contacts}
          labels={labels}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          duplicateCount={duplicateCount}
          onOpenCreateModal={handleCreateContact}
          onOpenMergeModal={() => setIsMergeOpen(true)}
          onOpenEmergencyModal={() => setIsEmergencyOpen(true)}
          onOpenImportExportModal={() => setIsImportExportOpen(true)}
          onPrintDirectory={handlePrintDirectory}
          onResetDemoData={handleClearAllData}
          onAddLabel={(name, urdu) => addLabel(name, urdu)}
          isOpen={isMobileSidebarOpen || isSidebarOpen}
          isSidebarOpen={isSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="app-main" id="main-content-scroll">
          {/* Printable Header */}
          <div className="print-header">
            <h2>Toggle Contacts 🇵🇰 - Directory Printout</h2>
            <p>Generated on: {new Date().toLocaleDateString()}</p>
          </div>

          <ContactList
            contacts={contacts}
            labels={labels}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            viewMode={viewMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onToggleStar={toggleStar}
            onViewDetails={handleViewDetails}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onBatchDelete={handleBatchDelete}
            onBatchAssignLabel={handleBatchAssignLabel}
            onBatchExport={handleBatchExport}
            onRestore={restoreContact}
            onPermanentDelete={permanentlyDeleteContact}
            onEmptyTrash={emptyTrash}
            onShowQR={handleShowQR}
            onOpenCreateModal={handleCreateContact}
          />
        </main>
      </div>

      {/* Slide-over Contact Detail Drawer */}
      <ContactDetailModal
        contact={detailContact}
        labels={labels}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(c: Contact) => {
          setIsDetailOpen(false);
          handleEditContact(c);
        }}
        onDelete={handleDeleteContact}
        onToggleStar={toggleStar}
        onShowQR={handleShowQR}
      />

      {/* Create / Edit Contact Modal */}
      <ContactFormModal
        isOpen={isFormOpen}
        contactToEdit={formContact}
        labels={labels}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveContact}
      />

      {/* Merge & Fix Duplicates Wizard */}
      <MergeDuplicatesModal
        isOpen={isMergeOpen}
        contacts={contacts}
        onClose={() => setIsMergeOpen(false)}
        onMergeGroup={handleMergeGroup}
        onMergeAll={handleMergeAll}
      />

      {/* Pakistani Emergency Numbers Directory */}
      <EmergencyDirectory
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onAddEmergencyContact={handleAddEmergencyContact}
        existingContacts={contacts}
      />

      {/* Import & Export Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        contacts={contacts}
        onImportContacts={handleImportContacts}
      />

      {/* QR Code Scannable Card Modal */}
      <QRCodeModal
        contact={qrContact}
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
      />

      {/* Keyboard Shortcuts Cheat Sheet */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
