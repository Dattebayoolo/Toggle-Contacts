import { useState } from 'react';
import {
  Users,
  Shield,
  Smartphone,
  Sparkles,
  ArrowRight,
  PhoneCall,
  QrCode,
  Lock,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  HeartHandshake,
  ExternalLink,
  LogIn,
  LogOut,
  Search,
} from 'lucide-react';
import type { ToggleSessionUser } from '../types/auth';
import {
  detectPakistaniOperator,
  formatPakistaniPhone,
  TELECOM_OPERATORS,
} from '../utils/pakistaniTelecom';
import { PAKISTANI_EMERGENCY_SERVICES } from '../utils/mockData';
import '../styles/landing.css';

interface LandingPageProps {
  onLaunchApp: () => void;
  onSignIn: () => void;
  isSigningIn?: boolean;
  user: ToggleSessionUser | null;
  onSignOut?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function LandingPage({
  onLaunchApp,
  onSignIn,
  isSigningIn = false,
  user,
  onSignOut,
  isDarkMode,
  onToggleTheme,
}: LandingPageProps) {
  // Interactive Telecom Prefix Tester State
  const [telecomInput, setTelecomInput] = useState('0300 1234567');
  const detectedOp = detectPakistaniOperator(telecomInput);
  const detectedInfo = TELECOM_OPERATORS[detectedOp];

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const presetPrefixes = [
    { code: '0300', label: 'Jazz 0300' },
    { code: '0345', label: 'Telenor 0345' },
    { code: '0312', label: 'Zong 0312' },
    { code: '0333', label: 'Ufone 0333' },
    { code: '0355', label: 'SCOM 0355' },
    { code: '0321', label: 'Warid 0321' },
  ];

  const topEmergencies = PAKISTANI_EMERGENCY_SERVICES.slice(0, 6);

  const faqItems = [
    {
      q: 'Is Toggle Contacts free to use?',
      a: 'Yes, Toggle Contacts is 100% free and open for personal, professional, and family use across Pakistan with no contact limits or subscriptions.',
    },
    {
      q: 'How does the Pakistani telecom network detection work?',
      a: 'Toggle Contacts checks Pakistani mobile phone prefixes in real time (e.g. 0300-0309 for Jazz, 0340-0349 for Telenor, 0310-0318 for Zong, 0330-0337 for Ufone, and 0355 for SCOM) and renders official network operator badges.',
    },
    {
      q: 'Can I import from Google Contacts and iPhone?',
      a: 'Yes! Toggle Contacts supports direct import and export of standard Google Contacts CSV and Apple iCloud / Microsoft Outlook vCard (.vcf) files.',
    },
    {
      q: 'What is the Toggle Account System?',
      a: 'Toggle Account is our dedicated single sign-on platform featuring Argon2id password hashing, OAuth 2.0 PKCE authentication, and client zero-knowledge data isolation. Your passwords are never handled by the contacts application.',
    },
    {
      q: 'Can I use Toggle Contacts offline without signing in?',
      a: 'Yes! Toggle Contacts is offline-first and operates fully in your local browser storage. Linking a Toggle Account lets you store contacts per user profile.',
    },
  ];

  return (
    <div className="g-landing" id="landing-root">
      {/* Google 4-Color Top Stripe */}
      <div className="g-top-color-stripe" aria-hidden="true" />

      {/* ── Google Product Navigation Bar ───────────────────────────────── */}
      <header className="g-nav" role="banner">
        <div className="g-nav-inner">
          <div className="g-brand" onClick={onLaunchApp} role="button" tabIndex={0}>
            <div className="g-brand-icon-wrap">
              {/* Google Contacts style icon */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="g-brand-title">
              <span>Toggle Contacts</span>
              <span className="g-brand-pk-badge">🇵🇰 Pakistan</span>
            </div>
          </div>

          <nav aria-label="Main Navigation">
            <ul className="g-nav-links">
              <li>
                <a href="#overview">Overview</a>
              </li>
              <li>
                <a href="#telecom">Telecom Engine</a>
              </li>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#emergency">Emergency 1122</a>
              </li>
              <li>
                <a href="#security">Security & SSO</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </nav>

          <div className="g-nav-actions">
            {/* Theme Toggle Button */}
            <button
              type="button"
              className="g-theme-btn"
              onClick={onToggleTheme}
              aria-label={isDarkMode ? 'Light theme' : 'Dark theme'}
              title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.86rem',
                    fontWeight: 500,
                    padding: '0.35rem 0.85rem',
                    borderRadius: 100,
                    background: 'var(--google-surface-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#0b57d0',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                    }}
                  >
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.email.split('@')[0]}</span>
                </div>
                {onSignOut && (
                  <button
                    type="button"
                    className="g-btn-text-signin"
                    onClick={onSignOut}
                    title="Sign out of Toggle Account"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                )}
                <button
                  type="button"
                  className="g-btn-primary"
                  onClick={onLaunchApp}
                  id="nav-launch-btn"
                >
                  Open Contacts <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="g-btn-text-signin"
                  onClick={onSignIn}
                  disabled={isSigningIn}
                  id="nav-signin-btn"
                >
                  <LogIn size={15} /> {isSigningIn ? 'Redirecting…' : 'Sign in'}
                </button>
                <button
                  type="button"
                  className="g-btn-primary"
                  onClick={onLaunchApp}
                  id="nav-launch-btn"
                >
                  Launch App <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section (Google Workspace / Google Contacts Style) ──────── */}
      <section className="g-hero" id="overview">
        <div className="g-hero-pill">
          <span className="g-hero-pill-badge">NEW</span>
          <span>Google Contacts alternative built specifically for Pakistan 🇵🇰</span>
        </div>

        <h1 className="g-hero-h1">
          A <span className="accent-blue">simpler, smarter</span> way to manage your contacts in{' '}
          <span className="accent-green">Pakistan</span>.
        </h1>

        <p className="g-hero-p">
          Keep your address book beautifully organized with automated Pakistani telecom operator detection,
          CNIC formatting, 1-click duplicate cleanups, and instant national emergency helplines.
        </p>

        <div className="g-hero-ctas">
          <button
            type="button"
            className="g-btn-hero-primary"
            onClick={onLaunchApp}
            id="hero-launch-primary"
          >
            Launch Contacts Web App <ArrowRight size={18} />
          </button>

          {!user && (
            <button
              type="button"
              className="g-btn-hero-tonal"
              onClick={onSignIn}
              disabled={isSigningIn}
              id="hero-signin-tonal"
            >
              <Lock size={16} /> {isSigningIn ? 'Connecting…' : 'Sign in with Toggle Account'}
            </button>
          )}
        </div>

        <div className="g-hero-sub-stats">
          <div className="g-stat-item">
            <CheckCircle2 size={16} />
            <span>Automatic Jazz, Zong, Telenor & Ufone Badging</span>
          </div>
          <div className="g-stat-item">
            <CheckCircle2 size={16} />
            <span>Rescue 1122 & Edhi Helplines Built-in</span>
          </div>
          <div className="g-stat-item">
            <CheckCircle2 size={16} />
            <span>No Ads • No Tracking • 100% Free</span>
          </div>
        </div>

        {/* ── Realistic Google Contacts App Window Mockup ─────────────────── */}
        <div className="g-mockup-wrapper">
          <div className="g-mockup-window" role="img" aria-label="Google Contacts App Interface Preview">
            {/* Window Top Bar with Google Search Capsule */}
            <div className="g-mockup-topbar">
              <div className="g-mockup-topbar-left">
                <div className="g-mockup-window-controls">
                  <span className="g-window-dot red" />
                  <span className="g-window-dot yellow" />
                  <span className="g-window-dot green" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.95rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0B57D0">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  <span>Contacts</span>
                </div>
              </div>

              {/* Google Search Pill */}
              <div className="g-mockup-search-bar">
                <Search size={16} />
                <span>Search 48 contacts in Pakistan...</span>
              </div>

              {/* Google Account Avatar with subtle ring */}
              <div className="g-mockup-topbar-right">
                <div className="g-mockup-avatar-circle">P</div>
              </div>
            </div>

            {/* Window Body: Google Contacts Sidebar + Data Table */}
            <div className="g-mockup-body">
              {/* Google Contacts Left Sidebar */}
              <div className="g-mockup-sidebar">
                {/* Iconic Google 4-Color "+ Create contact" Button */}
                <div className="g-mockup-fab">
                  <div className="g-fab-plus-icon">
                    <svg width="20" height="20" viewBox="0 0 36 36">
                      <path fill="#4285F4" d="M16 16v14h4V16h14v-4H20V2h-4v10H2v4h14z" />
                      <path fill="#EA4335" d="M16 2h4v14h-4z" />
                      <path fill="#34A853" d="M20 16h14v4H20z" />
                      <path fill="#FBBC05" d="M16 20h4v14h-4z" />
                      <path fill="#4285F4" d="M2 16h14v4H2z" />
                    </svg>
                  </div>
                  <span>Create contact</span>
                </div>

                <div className="g-mockup-nav-item active">
                  <div className="g-mockup-nav-left">
                    <Users size={16} />
                    <span>Contacts</span>
                  </div>
                  <span className="g-mockup-badge">48</span>
                </div>

                <div className="g-mockup-nav-item">
                  <div className="g-mockup-nav-left">
                    <Sparkles size={16} />
                    <span>Frequently contacted</span>
                  </div>
                </div>

                <div className="g-mockup-nav-item">
                  <div className="g-mockup-nav-left">
                    <Layers size={16} />
                    <span>Merge & fix</span>
                  </div>
                  <span
                    style={{
                      background: '#ea4335',
                      color: '#fff',
                      borderRadius: 100,
                      padding: '1px 6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    2
                  </span>
                </div>

                <div className="g-mockup-nav-item emergency-nav">
                  <div className="g-mockup-nav-left">
                    <HeartHandshake size={16} />
                    <span>Emergency 1122 🇵🇰</span>
                  </div>
                </div>
              </div>

              {/* Google Contacts Table Rows */}
              <div className="g-mockup-table-wrap">
                <table className="g-mockup-table">
                  <thead>
                    <tr>
                      <th style={{ width: 30 }}>
                        <input type="checkbox" readOnly checked={false} style={{ accentColor: '#0b57d0' }} />
                      </th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone number & Operator</th>
                      <th>Location / CNIC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1: Jazz */}
                    <tr>
                      <td>
                        <input type="checkbox" readOnly checked={false} />
                      </td>
                      <td>
                        <div className="g-table-contact-name">
                          <div className="g-table-avatar" style={{ background: '#059669' }}>
                            H
                          </div>
                          <div>
                            <div>Hamza Tariq</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--google-text-muted)' }}>Lead Engineer</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--google-text-secondary)' }}>hamza.tariq@toggle.pk</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>+92 300 8472910</span>
                          <span className="g-table-op-badge jazz">Jazz 4G</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--google-text-secondary)' }}>
                        Lahore • 35201-7489201-3
                      </td>
                    </tr>

                    {/* Row 2: Zong */}
                    <tr>
                      <td>
                        <input type="checkbox" readOnly checked={false} />
                      </td>
                      <td>
                        <div className="g-table-contact-name">
                          <div className="g-table-avatar" style={{ background: '#0B57D0' }}>
                            A
                          </div>
                          <div>
                            <div>Ayesha Malik</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--google-text-muted)' }}>Product Designer</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--google-text-secondary)' }}>ayesha.malik@work.com</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>+92 312 9081234</span>
                          <span className="g-table-op-badge zong">Zong 4G</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--google-text-secondary)' }}>
                        Islamabad • 37405-1234567-2
                      </td>
                    </tr>

                    {/* Row 3: Telenor */}
                    <tr>
                      <td>
                        <input type="checkbox" readOnly checked={false} />
                      </td>
                      <td>
                        <div className="g-table-contact-name">
                          <div className="g-table-avatar" style={{ background: '#B06000' }}>
                            B
                          </div>
                          <div>
                            <div>Bilal Khan</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--google-text-muted)' }}>Operations</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--google-text-secondary)' }}>bilal.k@peshawar.pk</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>+92 345 5567890</span>
                          <span className="g-table-op-badge telenor">Telenor</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--google-text-secondary)' }}>
                        Peshawar • 17301-9876543-1
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Pakistani Telecom Engine (Google Search Widget Style) ── */}
      <section className="g-section" id="telecom">
        <div className="g-section-head">
          <span className="g-eyebrow">Smart Telecom Engine</span>
          <h2 className="g-section-title">Instant Pakistani Operator Detection</h2>
          <p className="g-section-desc">
            Toggle Contacts instantly attributes Pakistani numbers to Jazz, Telenor, Zong, Ufone, SCOM, or Onic.
            Test any number below:
          </p>
        </div>

        <div className="g-telecom-widget">
          {/* Google Search Style Input */}
          <div className="g-telecom-search-box">
            <Search size={20} className="g-telecom-search-icon" />
            <input
              type="text"
              className="g-telecom-input"
              value={telecomInput}
              onChange={(e) => setTelecomInput(e.target.value)}
              placeholder="Enter any Pakistani number (e.g. 0300 1234567)"
              id="telecom-search-input"
            />
          </div>

          {/* Quick Preset Chips */}
          <div className="g-telecom-presets">
            <span style={{ fontSize: '0.82rem', color: 'var(--google-text-muted)', fontWeight: 500 }}>
              Quick test prefix:
            </span>
            {presetPrefixes.map((p) => (
              <button
                key={p.code}
                type="button"
                className="g-preset-btn"
                onClick={() => setTelecomInput(`${p.code} 9876543`)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Result Box (Google Knowledge Panel Style) */}
          <div className="g-knowledge-panel">
            <div className="g-knowledge-left">
              <div
                className="g-op-logo-box"
                style={{
                  backgroundColor: detectedInfo.brandColor,
                  color: detectedInfo.textColor,
                }}
              >
                {detectedInfo.logoText.charAt(0)}
              </div>
              <div className="g-op-details">
                <h4>{detectedInfo.displayName}</h4>
                <p>
                  Urdu: <span style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>{detectedInfo.urduName}</span>
                </p>
              </div>
            </div>

            <div className="g-knowledge-right">
              <div className="g-knowledge-row">
                <span className="label">Formatted Number</span>
                <span className="value">{formatPakistaniPhone(telecomInput)}</span>
              </div>
              <div className="g-knowledge-row">
                <span className="label">Network Status</span>
                <span className="value" style={{ color: 'var(--google-green)' }}>
                  Verified Pakistani Operator ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Bento Grid (Google Material 3 Elevation) ─────────────── */}
      <section className="g-section" id="features">
        <div className="g-section-head">
          <span className="g-eyebrow">Google Design System</span>
          <h2 className="g-section-title">Built with Material You Precision</h2>
          <p className="g-section-desc">
            The familiar simplicity of Google Contacts, upgraded with modern Pakistani features.
          </p>
        </div>

        <div className="g-bento-grid">
          {/* Card 1: Google Material You */}
          <div className="g-bento-card">
            <div className="g-card-icon-pill blue">
              <Users size={24} />
            </div>
            <h3>Google Material You Ergonomics</h3>
            <p>
              Clean Google Sans typography, soft 28px rounded corners, table and grid views, and quick keyboard shortcuts
              (C for new, M for merge, E for emergency).
            </p>
            <div className="g-bento-tags">
              <span className="g-bento-chip">Google Sans</span>
              <span className="g-bento-chip">Shortcuts C / M / E</span>
            </div>
          </div>

          {/* Card 2: Telecom Auto-detection */}
          <div className="g-bento-card">
            <div className="g-card-icon-pill green">
              <Smartphone size={24} />
            </div>
            <h3>Automated Network Operator Badges</h3>
            <p>
              Instantly detects Jazz, Telenor, Zong, Ufone, SCOM, and Onic prefixes. Filter your contacts by telecom
              carrier with a single click.
            </p>
            <div className="g-bento-tags">
              <span className="g-bento-chip">Jazz 4G</span>
              <span className="g-bento-chip">Zong 4G</span>
              <span className="g-bento-chip">Ufone & Telenor</span>
            </div>
          </div>

          {/* Card 3: Duplicates Merge */}
          <div className="g-bento-card">
            <div className="g-card-icon-pill yellow">
              <Sparkles size={24} />
            </div>
            <h3>Smart Duplicate Cleaner</h3>
            <p>
              Identifies duplicates across varied Pakistani formats (+92 300, 0300, 0092), exact emails, and fuzzy names.
              Merge records in one click without data loss.
            </p>
            <div className="g-bento-tags">
              <span className="g-bento-chip">+92 Normalization</span>
              <span className="g-bento-chip">1-Click Merge</span>
            </div>
          </div>

          {/* Card 4: Emergency Directory */}
          <div className="g-bento-card">
            <div className="g-card-icon-pill red">
              <HeartHandshake size={24} />
            </div>
            <h3>National Emergency Helplines</h3>
            <p>
              Integrated directory for Rescue 1122, Edhi Ambulance (115), Police Madadgar (15), and Motorway Police (130).
              One-click dial and add to contacts.
            </p>
            <div className="g-bento-tags">
              <span className="g-bento-chip">Rescue 1122</span>
              <span className="g-bento-chip">Edhi 115</span>
              <span className="g-bento-chip">Police 15</span>
            </div>
          </div>

          {/* Card 5: QR Code vCard */}
          <div className="g-bento-card">
            <div className="g-card-icon-pill blue">
              <QrCode size={24} />
            </div>
            <h3>Instant QR Code Sharing</h3>
            <p>
              Generate scannable vCard QR codes for any contact. Any iPhone or Android camera can scan and instantly save
              the contact into their phonebook without typing.
            </p>
            <div className="g-bento-tags">
              <span className="g-bento-chip">Camera Scan</span>
              <span className="g-bento-chip">vCard 3.0</span>
            </div>
          </div>

          {/* Card 6: CSV & vCard Sync */}
          <div className="g-bento-card">
            <div className="g-card-icon-pill green">
              <FileSpreadsheet size={24} />
            </div>
            <h3>Universal Google CSV & vCard Sync</h3>
            <p>
              Effortlessly import contacts from Google Contacts CSV or Apple iCloud vCard (.vcf). Export backups whenever
              needed and print physical address books.
            </p>
            <div className="g-bento-tags">
              <span className="g-bento-chip">Google CSV</span>
              <span className="g-bento-chip">Print-Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pakistani Emergency Helplines Section ──────────────────────── */}
      <section className="g-section" id="emergency">
        <div className="g-section-head">
          <span className="g-eyebrow" style={{ color: 'var(--google-red)' }}>
            24/7 Verified Directory
          </span>
          <h2 className="g-section-title">Pakistan National Emergency Helplines</h2>
          <p className="g-section-desc">
            Toggle Contacts includes verified emergency numbers pre-configured for instant access nationwide.
          </p>
        </div>

        <div className="g-emergency-grid">
          {topEmergencies.map((srv) => (
            <div key={srv.id} className="g-emergency-card">
              <div className="g-emergency-top">
                <span className="g-emergency-number" style={{ backgroundColor: srv.badgeColor }}>
                  {srv.shortCode}
                </span>
                <span className="g-emergency-category">{srv.category}</span>
              </div>
              <h4>{srv.name}</h4>
              <p style={{ fontFamily: 'Noto Nastaliq Urdu, serif', color: 'var(--google-text-muted)' }}>
                {srv.urduName}
              </p>
              <p>{srv.description}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button type="button" className="g-btn-hero-tonal" onClick={onLaunchApp}>
            <PhoneCall size={16} /> Open Complete Emergency Directory in App
          </button>
        </div>
      </section>

      {/* ── Google Security Checkup Style Section ───────────────────────── */}
      <section className="g-section" id="security">
        <div className="g-security-panel">
          <div className="g-security-content">
            <span className="g-eyebrow">Enterprise Security</span>
            <h3>Protected by the Toggle Account System</h3>
            <p>
              Your contact data remains your own. Toggle Contacts links with a centralized, hardened authentication
              service that keeps client applications completely decoupled from sensitive passwords.
            </p>

            <div className="g-security-checks">
              <div className="g-check-item">
                <CheckCircle2 size={18} />
                <span>
                  <strong>Argon2id Password Security:</strong> State-of-the-art password hashing on dedicated servers.
                </span>
              </div>
              <div className="g-check-item">
                <CheckCircle2 size={18} />
                <span>
                  <strong>PKCE OAuth 2.0 Flow:</strong> Secure authorization code exchange with rotating refresh tokens.
                </span>
              </div>
              <div className="g-check-item">
                <CheckCircle2 size={18} />
                <span>
                  <strong>Client Zero-Knowledge:</strong> The contacts web application never handles raw passwords.
                </span>
              </div>
              <div className="g-check-item">
                <CheckCircle2 size={18} />
                <span>
                  <strong>Scoped User Storage:</strong> Each Toggle Account receives an isolated local database scope.
                </span>
              </div>
            </div>
          </div>

          <div className="g-security-action-box">
            <div className="g-shield-icon-large">
              <Shield size={28} />
            </div>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'Google Sans' }}>Toggle Security Gateway</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--google-text-secondary)' }}>
              Sign in with your Toggle Account to unlock per-account contact isolation and seamless authentication.
            </p>

            {user ? (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 100,
                  background: 'var(--google-green-subtle)',
                  color: 'var(--google-green)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                Signed in as {user.email}
              </div>
            ) : (
              <button
                type="button"
                className="g-btn-primary"
                style={{ justifyContent: 'center' }}
                onClick={onSignIn}
                disabled={isSigningIn}
              >
                <LogIn size={16} /> {isSigningIn ? 'Redirecting…' : 'Sign in with Toggle Account'}
              </button>
            )}

            <a
              href="http://localhost:4000/signup"
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '0.85rem',
                color: 'var(--google-blue)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                justifyContent: 'center',
              }}
            >
              <ExternalLink size={14} /> Create a Toggle Account
            </a>
          </div>
        </div>
      </section>

      {/* ── Google-Style FAQ Section ────────────────────────────────────── */}
      <section className="g-section" id="faq">
        <div className="g-section-head">
          <span className="g-eyebrow">Frequently Asked Questions</span>
          <h2 className="g-section-title">Everything you need to know</h2>
          <p className="g-section-desc">Have questions about Toggle Contacts? Find quick answers below.</p>
        </div>

        <div className="g-faq-container">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q} className="g-faq-row">
                <button
                  type="button"
                  className="g-faq-trigger"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isOpen && <div className="g-faq-answer">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Bottom Call-to-Action (Google Blue Container) ───────────────── */}
      <section className="g-cta-section">
        <div className="g-cta-card">
          <h2>Ready to organize your contacts?</h2>
          <p>
            Experience lightning-fast contact organization, automatic Pakistani carrier badges, and smart duplicate
            merges. Start now directly in your browser.
          </p>

          <button
            type="button"
            className="g-btn-white-pill"
            onClick={onLaunchApp}
            id="cta-launch-bottom"
          >
            Launch Contacts Web App <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Google-Style Clean Minimal Footer ───────────────────────────── */}
      <footer className="g-footer" role="contentinfo">
        <div className="g-footer-inner">
          <div className="g-footer-left">
            <span style={{ fontWeight: 600, color: 'var(--google-text-primary)' }}>Toggle Contacts 🇵🇰</span>
            <span>English (Pakistan)</span>
          </div>

          <ul className="g-footer-links">
            <li>
              <a href="#overview">Overview</a>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#emergency">Emergency 1122</a>
            </li>
            <li>
              <a href="#security">Security</a>
            </li>
            <li>
              <a href="http://localhost:4000/account" target="_blank" rel="noreferrer">
                Toggle Account
              </a>
            </li>
          </ul>

          <div>Made with pride for Pakistan 🇵🇰</div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
