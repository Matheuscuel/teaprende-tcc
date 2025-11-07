export default function Penguin({ size = 220, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      role="img"
      aria-label="Pinguim TEAprende"
      className={`penguin ${className}`}
    >
      {/* fundo azul */}
      <rect width="240" height="240" rx="120" fill="#0C67CC" />

      {/* disco bege com leve gradiente/sombra */}
      <defs>
        <radialGradient id="soft" cx="50%" cy="40%" r="65%">
          <stop offset="0%"  stopColor="#FFF7E6" />
          <stop offset="60%" stopColor="#FDE8C3" />
          <stop offset="100%" stopColor="#F4DDB2" />
        </radialGradient>
        <filter id="drop" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0C54B533"/>
        </filter>
      </defs>
      <circle cx="120" cy="120" r="88" fill="url(#soft)" filter="url(#drop)" />

      {/* pinguim */}
      <g transform="translate(0,2)">
        <path d="M72 138c-9 9-12 18-8 24 6 8 18 6 29-6-5-11-9-18-21-18z" fill="#0C538F"/>
        <path d="M168 138c9 9 12 18 8 24-6 8-18 6-29-6 5-11 9-18 21-18z" fill="#0C538F"/>
        <path d="M120 66c-26 0-44 18-44 40 0 24 18 58 44 58s44-34 44-58c0-22-18-40-44-40z" fill="#0C538F"/>
        <ellipse cx="120" cy="130" rx="40" ry="48" fill="#FFF7E6"/>
        <ellipse cx="120" cy="102" rx="30" ry="24" fill="#FFF7E6"/>
        <circle cx="108" cy="100" r="5.5" fill="#1B1B1B"/>
        <circle cx="132" cy="100" r="5.5" fill="#1B1B1B"/>
        <circle cx="98"  cy="110" r="4.2" fill="#FFB3BD"/>
        <circle cx="142" cy="110" r="4.2" fill="#FFB3BD"/>
        <path d="M120 112c6 0 11 3 11 6s-5 5-11 5-11-2-11-5 5-6 11-6z" fill="#FF9A33"/>
        <path d="M100 178c8 0 14 4 14 9 0 3-5 6-12 6-8 0-13-3-13-6 0-5 3-9 11-9z" fill="#FF9A33"/>
        <path d="M140 178c8 0 14 4 14 9 0 3-5 6-12 6-8 0-13-3-13-6 0-5 3-9 11-9z" fill="#FF9A33"/>
      </g>
    </svg>
  );
}