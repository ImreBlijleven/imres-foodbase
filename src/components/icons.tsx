export const BowlIcon = ({ size = 40, color = '#FDF0E8' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Steam S-curve */}
    <path d="M25 20C23 15 29 11 25 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    {/* Heart at tip of steam */}
    <path d="M25 8C22 6 21 4 22.5 3.5C23.5 3 24.5 3.5 25 4.5C25.5 3.5 26.5 3 27.5 3.5C29 4 28 6 25 8Z" fill={color} />
    {/* Cup rim */}
    <path d="M8 22H48" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    {/* Cup body */}
    <path d="M8 22L11 41Q28 46 45 41L48 22" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    {/* Handle */}
    <path d="M45 28C54 28 54 40 45 40" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    {/* Saucer */}
    <ellipse cx="28" cy="47" rx="19" ry="2.5" stroke={color} strokeWidth="1.6" />
  </svg>
);

export const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
