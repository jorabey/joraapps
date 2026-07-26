// ============================================================
// Minimal inline icon set — stroke-based, 1.75px, 24x24 grid.
// Kept dependency-free (no icon package) for offline builds.
// ============================================================

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const IconGrid = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconGridFilled = (p) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconUser = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c0-3.6 3.2-6 7.5-6s7.5 2.4 7.5 6" />
  </svg>
);

export const IconUserFilled = (p) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c0-3.6 3.2-6 7.5-6s7.5 2.4 7.5 6" />
  </svg>
);

export const IconSearch = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-3.8-3.8" />
  </svg>
);

export const IconClose = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconChevronLeft = (p) => (
  <svg {...base} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const IconChevronRight = (p) => (
  <svg {...base} {...p}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const IconChevronDown = (p) => (
  <svg {...base} {...p}>
    <path d="M5 9l7 7 7-7" />
  </svg>
);

export const IconStar = (p) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.3 6.2 20.5l1.1-6.5L2.5 9.4l6.6-.9z" />
  </svg>
);

export const IconLink = (p) => (
  <svg {...base} {...p}>
    <path d="M9.5 14.5l5-5" />
    <path d="M11 7l1-1a3.5 3.5 0 1 1 5 5l-1 1" />
    <path d="M13 17l-1 1a3.5 3.5 0 1 1-5-5l1-1" />
  </svg>
);

export const IconUnlink = (p) => (
  <svg {...base} {...p}>
    <path d="M9.5 14.5l1.5-1.5M14.5 9.5L13 11" />
    <path d="M11 7l1-1a3.5 3.5 0 1 1 5 5l-1 1" />
    <path d="M13 17l-1 1a3.5 3.5 0 1 1-5-5l1-1" />
    <path d="M4 4l16 16" opacity="0.001" />
  </svg>
);

export const IconShield = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
  </svg>
);

export const IconShieldOff = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </svg>
);

export const IconFlag = (p) => (
  <svg {...base} {...p}>
    <path d="M5 21V4" />
    <path d="M5 4h11l-2 3.5L16 11H5" />
  </svg>
);

export const IconInfo = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <circle cx="12" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

export const IconExternal = (p) => (
  <svg {...base} {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4L10 14" />
    <path d="M19 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h5" />
  </svg>
);

export const IconMore = (p) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
);

export const IconEye = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 12S5.5 5.5 12 5.5 21.5 12 21.5 12 18.5 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = (p) => (
  <svg {...base} {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.7A10.6 10.6 0 0112 5.5c6.5 0 9.5 6.5 9.5 6.5a14.6 14.6 0 01-2.1 2.9M6.6 6.6C4.2 8.2 2.5 10.5 2.5 10.5S5.5 17 12 17a9 9 0 003.4-.7" />
    <path d="M9.9 9.9a3 3 0 004.2 4.2" />
  </svg>
);

export const IconDevice = (p) => (
  <svg {...base} {...p}>
    <rect x="5" y="2" width="14" height="20" rx="2.5" />
    <path d="M9 19h6" />
  </svg>
);

export const IconGlobe = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.4 2.6 3.8 5.7 3.8 9s-1.4 6.4-3.8 9c-2.4-2.6-3.8-5.7-3.8-9s1.4-6.4 3.8-9z" />
  </svg>
);

export const IconLock = (p) => (
  <svg {...base} {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8 10.5V7a4 4 0 018 0v3.5" />
  </svg>
);

export const IconLogout = (p) => (
  <svg {...base} {...p}>
    <path d="M9 4H6a2 2 0 00-2 2v12a2 2 0 002 2h3" />
    <path d="M16 16l4-4-4-4" />
    <path d="M20 12H9" />
  </svg>
);

export const IconCheck = (p) => (
  <svg {...base} {...p}>
    <path d="M5 13l4 4 10-10" />
  </svg>
);

export const IconMail = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5L12 13l8.5-6.5" />
  </svg>
);

export const IconPhone = (p) => (
  <svg {...base} {...p}>
    <path d="M5.5 4h3.2l1.6 4-2 1.5a11 11 0 005.2 5.2l1.5-2 4 1.6V17.5a2 2 0 01-2.2 2A16.5 16.5 0 014 5.7 2 2 0 015.5 4z" />
  </svg>
);

export const IconCalendar = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </svg>
);

export const IconChip = (p) => (
  <svg {...base} {...p}>
    <rect x="7" y="7" width="10" height="10" rx="1.5" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
  </svg>
);

export const IconBell = (p) => (
  <svg {...base} {...p}>
    <path d="M6 10a6 6 0 1112 0c0 4 1.2 5.5 1.2 5.5H4.8S6 14 6 10z" />
    <path d="M10 18.5a2 2 0 004 0" />
  </svg>
);

export const IconArrowUp = (p) => (
  <svg {...base} {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

export const IconArrowDown = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

export const IconClock = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconRefresh = (p) => (
  <svg {...base} {...p}>
    <path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3" />
    <path d="M4 4v4h4M20 20v-4h-4" />
  </svg>
);
