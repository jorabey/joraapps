// ============================================================
// OrbitMark — the signature element of Nexa.
// A small core with one or more rings orbiting it, representing
// a "connection" between the user (core) and an app (ring/dot).
// Used as: app logo, page loader, and connection-state indicator
// on app icons (filled ring = connected).
// ============================================================
import './orbit-mark.css';

export function OrbitMark({ size = 28, spin = false, connected = false }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`orbit-mark ${spin ? 'orbit-mark--spin' : ''}`}
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke="currentColor"
        strokeOpacity={connected ? '0.9' : '0.22'}
        strokeWidth="2"
        strokeDasharray={connected ? '0' : '3 5'}
      />
      <circle cx="16" cy="16" r="4.5" fill="currentColor" />
      <circle cx="27" cy="16" r="2.4" fill="currentColor" className="orbit-mark__dot" />
    </svg>
  );
}

export function OrbitLoader({ size = 40 }) {
  return (
    <div className="orbit-loader" style={{ width: size, height: size }}>
      <OrbitMark size={size} spin />
    </div>
  );
}
