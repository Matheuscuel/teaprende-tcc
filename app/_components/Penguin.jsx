"use client";
export default function Penguin({ size = 180, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      role="img"
      aria-label="Mascote pinguim TEAprende"
      className={`penguin ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0C54B533" />
        </filter>
      </defs>
      <g transform="translate(0,4)" filter="url(#shadow)">
        {/* Corpo do pinguim */}
        <ellipse cx="120" cy="120" rx="62" ry="76" fill="#0C67CC" />
        {/* Barriga */}
        <ellipse cx="120" cy="137" rx="44" ry="50" fill="#FFF7E6" />
        {/* Rosto */}
        <ellipse cx="120" cy="98" rx="35" ry="32" fill="#FFF7E6" />
        {/* Asas */}
        <path d="M70 124c-10 10-14 19-10 26 5 9 18 8 31-5-6-12-10-21-21-21z" fill="#0C67CC" />
        <path d="M170 124c10 10 14 19 10 26-5 9-18 8-31-5 6-12 10-21 21-21z" fill="#0C67CC" />
        {/* Olhos */}
        <circle cx="107" cy="98" r="5.5" fill="#1B1B1B" />
        <circle cx="133" cy="98" r="5.5" fill="#1B1B1B" />
        {/* Destaque dos olhos */}
        <circle cx="109" cy="96" r="2" fill="#FFFFFF" />
        <circle cx="135" cy="96" r="2" fill="#FFFFFF" />
        {/* Bochechas coradas */}
        <circle cx="96" cy="108" r="4.5" fill="#FFB3BD" />
        <circle cx="144" cy="108" r="4.5" fill="#FFB3BD" />
        {/* Bico */}
        <path d="M120 110c6 0 10 3 10 6 0 3-5 5-10 5s-10-2-10-5c0-3 4-6 10-6z" fill="#FF9A33" />
        {/* Pés */}
        <path d="M96 180c8 0 14 4 14 9 0 3-4 6-12 6-7 0-13-3-13-6 0-5 3-9 11-9z" fill="#FF9A33" />
        <path d="M144 180c8 0 14 4 14 9 0 3-5 6-12 6-8 0-13-3-13-6 0-5 3-9 11-9z" fill="#FF9A33" />
      </g>
    </svg>
  );
}