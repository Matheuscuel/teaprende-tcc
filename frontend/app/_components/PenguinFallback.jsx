export default function PenguinFallback({ size = 190, className = "" }) {
  const S = size;
  return (
    <svg width={S} height={S} viewBox="0 0 220 220" className={className} aria-label="Pinguim">
      <circle cx="110" cy="110" r="88" fill="#FEE7BF"/>
      <path d="M110 40c-24 0-44 19-44 43v5c-12 5-20 16-20 29 0 19 16 35 36 35 10 0 19-4 26-11 7 7 16 11 26 11 20 0 36-16 36-35 0-13-8-24-20-29v-5c0-24-20-43-44-43z" fill="#0C3F66"/>
      <ellipse cx="110" cy="126" rx="38" ry="45" fill="#FFF4DE"/>
      <ellipse cx="110" cy="92"  rx="30" ry="26" fill="#FFF4DE"/>
      <circle cx="96"  cy="90" r="6" fill="#0A2540"/>
      <circle cx="124" cy="90" r="6" fill="#0A2540"/>
      <circle cx="86"  cy="102" r="5.5" fill="#FFB0A3"/>
      <circle cx="134" cy="102" r="5.5" fill="#FFB0A3"/>
      <path d="M110 100c7 0 12-3 12-7-4 1-8 2-12 2s-8-1-12-2c0 4 5 7 12 7z" fill="#FF9A33"/>
      <path d="M68 136c6 8 15 13 25 14-3-8-2-17 3-25-10-2-20 2-28 11z" fill="#0C3F66"/>
      <path d="M152 136c-6 8-15 13-25 14 3-8 2-17-3-25 10-2 20 2 28 11z" fill="#0C3F66"/>
      <path d="M96 176c-8 0-14-3-16-7 5-3 12-5 19-5 2 4 0 8-3 12z" fill="#FF8F25"/>
      <path d="M124 176c8 0 14-3 16-7-5-3-12-5-19-5-2 4 0 8 3 12z" fill="#FF8F25"/>
    </svg>
  );
}