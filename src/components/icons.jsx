
const Icon = ({ d, size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d={d} />
  </svg>
);

export const MapPin = (p) => <Icon {...p} d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z M12 10a2 2 0 100-4 2 2 0 000 4" />;
export const Globe = (p) => <Icon {...p} d="M12 2a10 10 0 100 20A10 10 0 0012 2z M2 12h20 M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />;
export const Trophy = (p) => <Icon {...p} d="M6 9H3V4h3m12 5h3V4h-3m-6 14v-4m0 0H9m3 0h3M5 20h14M6 9a6 6 0 0012 0V4H6v5z" />;
export const GraduationCap = (p) => <Icon {...p} d="M22 10v6M2 10l10-5 10 5-10 5-10-5z M6 12v5c3 3 9 3 12 0v-5" />;
export const Banknote = (p) => <Icon {...p} d="M2 6h20v12H2z M12 12a2 2 0 100-4 2 2 0 000 4M6 12h.01M18 12h.01" />;
export const Briefcase = (p) => <Icon {...p} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />;
export const TrendingUp = (p) => <Icon {...p} d="M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6" />;
export const Users = (p) => <Icon {...p} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" />;
export const BookOpen = (p) => <Icon {...p} d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />;
export const Building = (p) => <Icon {...p} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" />;
export const Wifi = (p) => <Icon {...p} d="M5 12.55a11 11 0 0114.08 0 M1.42 9a16 16 0 0121.16 0 M8.53 16.11a6 6 0 016.95 0 M12 20h.01" />;
export const Dumbbell = (p) => <Icon {...p} d="M6.5 6.5h11m-11 11h11M3 9.5h2v5H3zM19 9.5h2v5h-2zM1 11h2v2H1zM21 11h2v2h-2z" />;
export const Star = (p) => <Icon {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />;
export const Check = (p) => <Icon {...p} d="M20 6L9 17l-5-5" />;
export const X = (p) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />;
export const MessageSquare = (p) => <Icon {...p} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />;
export const ChevronDown = (p) => <Icon {...p} d="M6 9l6 6 6-6" />;
export const ChevronUp = (p) => <Icon {...p} d="M18 15l-6-6-6 6" />;
export const Eye = (p) => <Icon {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12a3 3 0 100-6 3 3 0 000 6" />;
export const ExternalLink = (p) => <Icon {...p} d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6 M15 3h6v6 M10 14L21 3" />;
export const Award = (p) => <Icon {...p} d="M12 15a7 7 0 100-14 7 7 0 000 14z M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />;
export const Clock = (p) => <Icon {...p} d="M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6v6l4 2" />;
export const Layers = (p) => <Icon {...p} d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" />;
export const Target = (p) => <Icon {...p} d="M22 12A10 10 0 1112 2M22 12l-8 8M22 12H12" />;
export const ThumbsUp = (p) => <Icon {...p} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />;
export const Pin = (p) => <Icon {...p} d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />;
export const Filter = (p) => <Icon {...p} d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />;
export const Maximize2 = (p) => <Icon {...p} d="M3 3v7h1 M21 3v7h-1 M3 21H3 M21 21h7" />;
export const UserCheck = (p) => <Icon {...p} d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M19 10a3 3 0 11-6 0 3 3 0 016 0z M22 17h3" />;
export const Percent = (p) => <Icon {...p} d="M19 5L5 19 M19 19L5 5" />;
export const TrendingDown = (p) => <Icon {...p} d="M18 18l-9.5-9.5-5 5L1 7" />;
export const ThumbsDown = (p) => <Icon {...p} d="M14 15v4a3 3 0 01-3 3l-4-9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z M7 6H4a2 2 0 00-2 2v7a2 2 0 002 2h3" />;
export const DollarSign = (p) => <Icon {...p} d="M12 1a11 11 0 00-11 11 11 11 0 0011 11 11 11 0 0011-11 11 11 0 00-11-11zm0 4a7 7 0 00-7 7 7 7 0 007 7 7 7 0 007-7 7 7 0 00-7-7z M8 10h8 M8 14h8" />;
export const Lock = (p) => <Icon {...p} d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4" />;
export const CheckCircle = (p) => <Icon {...p} d="M22 11.08V12a10 10 0 11-5.93-9.14" />;
