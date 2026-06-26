export const BowlIcon = ({ size = 40, color = '#FDF0E8' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bowl body — wider, curved bottom */}
    <path d="M7 20H49L44.5 36Q28 42 11.5 36Z" fill={color} />
    {/* Handle */}
    <path d="M49 24.5h3.5a4.5 4.5 0 010 9H49" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    {/* Steam — 3 evenly-spaced S-curves */}
    <path d="M19 18c1.2-2-1.2-2 0-5.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
    <path d="M28 16c1.2-2-1.2-2 0-5.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
    <path d="M37 18c1.2-2-1.2-2 0-5.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
  </svg>
);

export const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
