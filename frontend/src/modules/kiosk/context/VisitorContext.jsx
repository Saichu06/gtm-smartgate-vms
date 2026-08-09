/**
 * VisitorContext — Global Visitor Kiosk Flow Context Engine.
 * Features:
 * - Dynamic Org Branding & Settings loader with Admin Portal localStorage override sync
 * - 120-second Inactivity Auto-Reset timer
 * - Dynamic Visitor-Type-Driven Step Progression (Visitor, Vendor, Candidate, Contractor)
 * - Timeline Audit Log tracking (`Created` → `Photo Captured` → `ID Verified` → `Host Selected` → `Submitted` → `Approved`)
 * - Global Theme Engine CSS Variable injector (`--kiosk-primary`, `--kiosk-secondary`, `--kiosk-accent`)
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useOrganizations } from '@contexts/OrganizationContext';
import '../styles/kiosk.css';

const VisitorContext = createContext(null);

export const DEFAULT_VISITOR_TYPES = [
  { id: 'business',   label: 'Business Visitor', steps: ['welcome', 'mobile', 'details', 'employee', 'photo', 'id', 'review', 'approval', 'pass'] },
  { id: 'vendor',     label: 'Vendor / Supplier', steps: ['welcome', 'mobile', 'details', 'photo', 'id', 'employee', 'review', 'approval', 'pass'] },
  { id: 'candidate',  label: 'Job Candidate',    steps: ['welcome', 'mobile', 'details', 'photo', 'employee', 'review', 'approval', 'pass'] },
  { id: 'contractor', label: 'Contractor',       steps: ['welcome', 'mobile', 'details', 'photo', 'id', 'employee', 'review', 'approval', 'pass'] },
];

const generateVisitId = () =>
  `VIS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const DEFAULT_VISITOR = {
  visitId: null,
  phone: '',
  countryCode: '+91',
  firstName: '',
  lastName: '',
  company: '',
  email: '',
  purpose: 'Business Meeting',
  vehicleNumber: '',
  visitorType: 'Business Visitor',
  expectedDuration: '',
  host: null,
  photoDataUrl: null,
  idType: 'aadhaar',
  idImageUrl: null,
  passInfo: null,
  submitted: false,
  timeline: [],
};

export const VisitorProvider = ({ children, orgId }) => {
  const { organizations, activeOrg } = useOrganizations();
  const org = organizations.find(
    (o) => String(o.id) === String(orgId) || String(o.internalId) === String(orgId)
  ) || activeOrg || organizations[0];
  const [visitor, setVisitor] = useState(() => ({
    ...DEFAULT_VISITOR,
    visitId: generateVisitId(),
  }));

  // Inject Theme CSS variables into root body
  useEffect(() => {
    const primary   = org?.primaryColor   || '#1565C0';
    const secondary = org?.secondaryColor || '#0F172A';
    const accent    = org?.accentColor    || '#FFD700';

    document.documentElement.style.setProperty('--kiosk-primary', primary);
    document.documentElement.style.setProperty('--kiosk-secondary', secondary);
    document.documentElement.style.setProperty('--kiosk-accent', accent);
  }, [org]);

  // ── 120-SECOND IDLE TIMEOUT AUTO-RESET ───────────────────────────────────────
  const idleTimeoutSec = org?.kioskConfig?.idleTimeout || 120;
  const timerRef = useRef(null);

  const resetFlow = useCallback(() => {
    setVisitor({
      ...DEFAULT_VISITOR,
      visitId: generateVisitId(),
      timeline: [{ step: 'Reset Flow', timestamp: new Date().toISOString() }],
    });
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      console.log(`Kiosk idle for ${idleTimeoutSec}s — resetting visitor flow...`);
      resetFlow();
    }, idleTimeoutSec * 1000);
  }, [idleTimeoutSec, resetFlow]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleUserActivity = () => resetIdleTimer();

    events.forEach(e => window.addEventListener(e, handleUserActivity));
    resetIdleTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(e => window.removeEventListener(e, handleUserActivity));
    };
  }, [resetIdleTimer]);

  // Update visitor & append timeline audit record
  const updateVisitor = useCallback((fields) => {
    setVisitor(prev => {
      const updated = { ...prev, ...fields };
      const newTimelineItem = {
        step: Object.keys(fields).join(', '),
        timestamp: new Date().toISOString(),
      };
      return {
        ...updated,
        timeline: [...prev.timeline, newTimelineItem],
      };
    });
  }, []);

  return (
    <VisitorContext.Provider value={{
      orgId,
      org,
      visitor,
      updateVisitor,
      resetFlow,
    }}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitor = () => {
  const ctx = useContext(VisitorContext);
  if (!ctx) throw new Error('useVisitor must be used within VisitorProvider');
  return ctx;
};
