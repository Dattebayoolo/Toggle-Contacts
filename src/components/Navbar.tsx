import { useRef, useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Moon,
  Sun,
  Menu,
  X,
  LayoutGrid,
  List,
  Keyboard,
  ShieldAlert,
  LogIn,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';

import type { ToggleSessionUser } from '../types/auth';

interface NavbarProps {
  user: ToggleSessionUser | null;
  onSignIn: () => void;
  isSigningIn: boolean;
  onSignOut: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
  onOpenShortcutsModal: () => void;
  onOpenEmergencyModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  viewMode: 'table' | 'grid';
  onToggleViewMode: (mode: 'table' | 'grid') => void;
  onToggleSidebar: () => void;
}

export const Navbar = ({
  user,
  onSignIn,
  isSigningIn,
  onSignOut,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenShortcutsModal,
  onOpenEmergencyModal,
  isDarkMode,
  onToggleTheme,
  viewMode,
  onToggleViewMode,
  onToggleSidebar,
}: NavbarProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Global '/' keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Main menu"
          title="Main menu (Toggle Sidebar)"
          id="menu-toggle-button"
        >
          <Menu size={22} />
        </button>

        <div className="brand-logo" onClick={() => onSearchChange('')}>
          <div className="brand-icon-box">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <div className="brand-title-wrap">
            <h1 className="brand-name">
              Toggle Contacts <span className="pakistan-flag-tag">🇵🇰</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="navbar-center">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            id="global-search-input"
            className="search-input"
            placeholder="Search contacts by name, Jazz/Zong number, CNIC, or city..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
              id="search-clear-button"
            >
              <X size={16} />
            </button>
          )}
          <span className="search-kbd-hint">/</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Pakistani Emergency Helplines quick button */}
        <button
          className="nav-icon-btn"
          onClick={onOpenEmergencyModal}
          title="Pakistani Emergency Numbers (1122, 15, Edhi)"
          id="nav-emergency-button"
          style={{ color: '#EF4444' }}
        >
          <ShieldAlert size={20} />
        </button>

        {/* View Mode Toggle */}
        <div className="view-mode-toggle">
          <button
            className={`mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => onToggleViewMode('table')}
            title="Table View"
            id="view-table-btn"
          >
            <List size={18} />
          </button>
          <button
            className={`mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onToggleViewMode('grid')}
            title="Grid Cards View"
            id="view-grid-btn"
          >
            <LayoutGrid size={18} />
          </button>
        </div>

        {/* Theme switch */}
        <button
          className="nav-icon-btn"
          onClick={onToggleTheme}
          title={isDarkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
          id="theme-toggle-btn"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Keyboard Shortcuts */}
        <button
          className="nav-icon-btn"
          onClick={onOpenShortcutsModal}
          title="Keyboard shortcuts (?)"
          id="shortcuts-btn"
        >
          <Keyboard size={18} />
        </button>

        {/* Mobile Quick Create Button */}
        <button
          className="nav-icon-btn mobile-create-btn"
          onClick={onOpenCreateModal}
          title="Create contact"
          id="nav-create-contact-btn"
          style={{ color: 'var(--google-blue)' }}
        >
          <Plus size={20} />
        </button>

        {/* Account Dropdown */}
        <div className="nav-account-wrap" ref={accountRef}>
          <button
            className={`nav-account-trigger ${isAccountOpen ? 'active' : ''}`}
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            title="Account"
            id="google-user-avatar"
            aria-expanded={isAccountOpen}
            aria-haspopup="true"
          >
            <div className="nav-user-avatar">
              {user ? (
                <span>{user.email.charAt(0).toUpperCase()}</span>
              ) : (
                <User size={16} />
              )}
            </div>
            <ChevronDown size={14} className={`account-chevron ${isAccountOpen ? 'rotated' : ''}`} />
          </button>

          {isAccountOpen && (
            <div className="account-dropdown" id="account-dropdown-menu" role="menu">
              {user ? (
                <>
                  {/* Header — Google-style account card */}
                  <div className="account-dropdown-header">
                    <div className="account-avatar-large">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="account-info">
                      <p className="account-name">Toggle Account</p>
                      <p className="account-email">{user.email}</p>
                    </div>
                  </div>

                  <div className="account-dropdown-divider" />

                  {/* Menu items */}
                  <a
                    className="account-dropdown-item"
                    role="menuitem"
                    href="http://localhost:4000/account"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <User size={16} />
                    <span>Manage Account</span>
                  </a>

                  <div className="account-dropdown-divider" />

                  {/* Privacy */}
                  <div className="account-dropdown-footer">
                    <span>Privacy Policy</span>
                    <span className="account-dot">·</span>
                    <span>Terms of Service</span>
                  </div>

                  <div className="account-dropdown-divider" />

                  <button
                    className="account-dropdown-item account-signout"
                    role="menuitem"
                    onClick={onSignOut}
                  >
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Signed out — offer the hosted Toggle Account sign-in */}
                  <div className="account-dropdown-header">
                    <div className="account-avatar-large">
                      <User size={22} />
                    </div>
                    <div className="account-info">
                      <p className="account-name">Not signed in</p>
                      <p className="account-email">Use your Toggle Account</p>
                    </div>
                  </div>

                  <div className="account-dropdown-divider" />

                  <button
                    className="account-dropdown-item"
                    role="menuitem"
                    onClick={onSignIn}
                    disabled={isSigningIn}
                  >
                    <LogIn size={16} />
                    <span>{isSigningIn ? 'Redirecting…' : 'Sign in with Toggle Account'}</span>
                  </button>

                  <div className="account-dropdown-divider" />

                  {/* Privacy */}
                  <div className="account-dropdown-footer">
                    <span>Privacy Policy</span>
                    <span className="account-dot">·</span>
                    <span>Terms of Service</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
