import React from 'react';
import { WasteCategory } from '../data/wasteItems';

interface WasteIllustrationProps {
  itemId: string;
  className?: string;
}

export const WasteIllustration: React.FC<WasteIllustrationProps> = ({
  itemId,
  className = 'w-28 h-28',
}) => {
  switch (itemId) {
    case 'kulit-pisang':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M58 24 C56 18, 64 16, 66 24 L67 36 L57 36 Z" fill="#854D0E" stroke="#422006" strokeWidth="3" strokeLinejoin="round" />
          <path d="M58 36 C36 44, 22 68, 22 86 C34 86, 48 72, 58 54" fill="#FACC15" stroke="#422006" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M66 36 C86 44, 98 70, 96 88 C84 86, 72 72, 64 54" fill="#FDE047" stroke="#422006" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M58 38 C56 60, 48 84, 56 96 C66 94, 70 72, 66 38 Z" fill="#FEF08A" stroke="#422006" strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="40" cy="68" r="2.5" fill="#854D0E" />
          <circle cx="80" cy="70" r="2.5" fill="#854D0E" />
        </svg>
      );

    case 'sisa-apel':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M60 22 C60 14, 67 12, 68 18" fill="none" stroke="#422006" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M64 19 C76 12, 86 18, 80 28 C72 30, 64 26, 64 19 Z" fill="#22C55E" stroke="#14532D" strokeWidth="3" strokeLinejoin="round" />
          <path d="M36 36 C36 26, 84 26, 84 36 C82 44, 72 44, 66 44 L66 78 C72 78, 82 78, 84 88 C84 98, 36 98, 36 88 C38 78, 48 78, 54 78 L54 44 C48 44, 38 44, 36 36 Z" fill="#FEF3C7" stroke="#78350F" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M36 36 C36 26, 84 26, 84 36 C80 40, 40 40, 36 36 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="3" />
          <path d="M36 88 C40 84, 80 84, 84 88 C84 98, 36 98, 36 88 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="3" />
          <ellipse cx="56" cy="58" rx="2.5" ry="4" fill="#451A03" />
          <ellipse cx="64" cy="64" rx="2.5" ry="4" fill="#451A03" />
        </svg>
      );

    case 'daun-kering':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M24 88 C28 50, 56 26, 94 24 C90 64, 66 90, 24 88 Z" fill="#D97706" stroke="#78350F" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M24 88 C46 68, 70 46, 94 24" fill="none" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <path d="M44 70 L38 56 M58 58 L52 42 M72 44 L68 32 M54 64 L70 66 M68 50 L82 52" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 88 L16 98" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
          <path d="M68 88 C72 68, 86 58, 102 60 C98 78, 84 88, 68 88 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      );

    case 'sisa-nasi':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <ellipse cx="60" cy="72" rx="42" ry="22" fill="#E2E8F0" stroke="#334155" strokeWidth="3.5" />
          <ellipse cx="60" cy="68" rx="34" ry="16" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
          <path d="M36 66 C36 52, 54 46, 66 52 C74 48, 86 56, 84 68 Z" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="2.5" />
          <circle cx="48" cy="60" r="3" fill="#CBD5E1" />
          <circle cx="58" cy="56" r="3" fill="#CBD5E1" />
          <circle cx="68" cy="62" r="3" fill="#CBD5E1" />
          <path d="M70 58 C78 54, 86 60, 82 68 C74 70, 68 64, 70 58 Z" fill="#22C55E" stroke="#14532D" strokeWidth="2.5" />
          <circle cx="44" cy="68" r="5" fill="#F97316" stroke="#7C2D12" strokeWidth="2" />
        </svg>
      );

    case 'tulang-ikan':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M22 60 L90 60" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
          <path d="M22 60 C22 44, 38 40, 42 60 C38 80, 22 76, 22 60 Z" fill="#F1F5F9" stroke="#334155" strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="30" cy="56" r="2.5" fill="#0F172A" />
          <path d="M52 44 L52 76 M64 40 L64 80 M76 46 L76 74" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <path d="M88 60 L104 44 L100 60 L104 76 Z" fill="#E2E8F0" stroke="#334155" strokeWidth="3.5" strokeLinejoin="round" />
        </svg>
      );

    case 'cangkang-telur':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M22 66 C22 86, 38 94, 52 90 C62 86, 66 74, 62 62 L52 68 L44 58 L34 68 Z" fill="#FDE68A" stroke="#78350F" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M62 56 C60 40, 74 28, 88 34 C98 38, 100 58, 92 72 L82 62 L72 70 Z" fill="#FEF3C7" stroke="#78350F" strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="40" cy="78" r="2" fill="#B45309" />
          <circle cx="84" cy="46" r="2" fill="#B45309" />
        </svg>
      );

    case 'kulit-jeruk':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M26 70 C24 44, 46 30, 68 34 C86 38, 98 54, 92 74 C82 66, 70 74, 60 86 C46 88, 30 82, 26 70 Z" fill="#FB923C" stroke="#7C2D12" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M38 56 C44 48, 56 46, 66 50" fill="none" stroke="#FFEDD5" strokeWidth="4" strokeLinecap="round" />
          <circle cx="48" cy="66" r="2" fill="#9A3412" />
          <circle cx="62" cy="64" r="2" fill="#9A3412" />
          <circle cx="76" cy="54" r="2" fill="#9A3412" />
          <path d="M56 32 C60 22, 70 20, 74 26 C68 32, 62 34, 56 32 Z" fill="#22C55E" stroke="#14532D" strokeWidth="2.5" />
        </svg>
      );

    case 'potongan-sayur':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M30 86 C26 64, 42 40, 64 36 C74 54, 64 80, 30 86 Z" fill="#22C55E" stroke="#14532D" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M30 86 L58 46" stroke="#14532D" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M54 84 C58 58, 76 32, 96 28 C96 58, 82 82, 54 84 Z" fill="#4ADE80" stroke="#14532D" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M54 84 L86 42" stroke="#14532D" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M36 92 L24 98 M58 90 L52 98" stroke="#16A34A" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );

    // ANORGANIK
    case 'botol-plastik':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="49" y="16" width="22" height="12" rx="3" fill="#0284C7" stroke="#0C4A6E" strokeWidth="3" />
          <path d="M48 28 L72 28 L78 44 L78 96 C78 102, 72 104, 60 104 C48 104, 42 102, 42 96 L42 44 Z" fill="#E0F2FE" stroke="#0369A1" strokeWidth="3.5" strokeLinejoin="round" />
          <rect x="42" y="54" width="36" height="22" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.5" />
          <path d="M50 40 L50 48 M50 82 L50 94" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case 'kaleng-minuman':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="38" y="26" width="44" height="72" rx="8" fill="#EF4444" stroke="#7F1D1D" strokeWidth="3.5" />
          <ellipse cx="60" cy="28" rx="22" ry="6" fill="#E2E8F0" stroke="#475569" strokeWidth="3" />
          <path d="M38 48 L82 48 L82 76 L38 76 Z" fill="#FDE047" stroke="#7F1D1D" strokeWidth="2.5" />
          <path d="M52 26 L62 22 L66 26" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M46 38 L46 86" stroke="#FCA5A5" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'kardus-bekas':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M24 44 L60 28 L96 44 L96 86 L60 102 L24 86 Z" fill="#D97706" stroke="#78350F" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M24 44 L60 60 L96 44" fill="none" stroke="#78350F" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M60 60 L60 102" stroke="#78350F" strokeWidth="3.5" />
          <path d="M24 44 L16 32 L52 18 L60 28" fill="#F59E0B" stroke="#78350F" strokeWidth="3" strokeLinejoin="round" />
          <path d="M96 44 L104 32 L68 18 L60 28" fill="#FBBF24" stroke="#78350F" strokeWidth="3" strokeLinejoin="round" />
          <rect x="44" y="34" width="32" height="10" rx="2" fill="#FEF3C7" stroke="#92400E" strokeWidth="2" />
        </svg>
      );

    case 'gelas-plastik':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M68 16 L60 44" stroke="#F97316" strokeWidth="5" strokeLinecap="round" />
          <path d="M36 40 L84 40 L76 96 C75 100, 45 100, 44 96 Z" fill="#E0F2FE" stroke="#0369A1" strokeWidth="3.5" strokeLinejoin="round" />
          <ellipse cx="60" cy="40" rx="25" ry="6" fill="#BAE6FD" stroke="#0369A1" strokeWidth="3" />
          <path d="M46 54 L49 84" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case 'koran-bekas':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="26" y="24" width="60" height="72" rx="4" fill="#F8FAFC" stroke="#334155" strokeWidth="3.5" />
          <rect x="34" y="34" width="44" height="10" rx="2" fill="#334155" />
          <rect x="34" y="50" width="20" height="20" rx="2" fill="#94A3B8" />
          <path d="M60 52 L78 52 M60 60 L78 60 M60 68 L74 68 M34 78 L78 78 M34 86 L68 86" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <path d="M86 34 L94 34 L94 90 L86 90" fill="#E2E8F0" stroke="#334155" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      );

    case 'botol-kaca':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="52" y="14" width="16" height="8" rx="2" fill="#F59E0B" stroke="#78350F" strokeWidth="2.5" />
          <path d="M51 22 L69 22 L69 38 L80 54 L80 96 C80 100, 74 102, 60 102 C46 102, 40 100, 40 96 L40 54 L51 38 Z" fill="#A7F3D0" stroke="#065F46" strokeWidth="3.5" strokeLinejoin="round" />
          <rect x="44" y="60" width="32" height="22" rx="2" fill="#FEF3C7" stroke="#065F46" strokeWidth="2" />
          <path d="M48 48 L48 56" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'kantong-plastik':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M36 42 L36 26 C36 20, 46 20, 46 26 L46 42 M74 42 L74 26 C74 20, 84 20, 84 26 L84 42" fill="none" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
          <path d="M32 42 L88 42 L94 92 C94 98, 26 98, 26 92 Z" fill="#BAE6FD" stroke="#0369A1" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M46 56 C52 64, 68 64, 74 56" fill="none" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
          <path d="M38 66 L42 84" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'kotak-susu':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M38 38 L60 22 L82 38 L82 96 L38 96 Z" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M38 38 L82 38" stroke="#1E3A8A" strokeWidth="3" />
          <rect x="42" y="48" width="36" height="32" fill="#60A5FA" />
          <circle cx="60" cy="64" r="9" fill="#FFFFFF" />
          <path d="M48 22 L72 22" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    // B3
    case 'baterai-bekas':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="48" y="16" width="24" height="10" rx="2" fill="#94A3B8" stroke="#1E293B" strokeWidth="3" />
          <rect x="38" y="26" width="44" height="74" rx="6" fill="#DC2626" stroke="#450A0A" strokeWidth="3.5" />
          <rect x="38" y="54" width="44" height="46" rx="4" fill="#1E293B" stroke="#450A0A" strokeWidth="3" />
          <path d="M64 34 L54 50 L62 50 L56 64 L68 46 L60 46 Z" fill="#FACC15" stroke="#450A0A" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M54 78 L66 78" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'lampu-bohlam':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M60 20 C40 20, 30 36, 34 54 C36 64, 46 70, 46 80 L74 80 C74 70, 84 64, 86 54 C90 36, 80 20, 60 20 Z" fill="#FEF08A" stroke="#78350F" strokeWidth="3.5" strokeLinejoin="round" />
          <rect x="46" y="80" width="28" height="14" rx="2" fill="#94A3B8" stroke="#334155" strokeWidth="3" />
          <path d="M50 94 L70 94 L66 102 L54 102 Z" fill="#475569" stroke="#1E293B" strokeWidth="2.5" />
          <path d="M52 50 L58 62 L62 52 L68 62" fill="none" stroke="#B45309" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M70 30 L76 38 L70 46" fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'obat-kedaluwarsa':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="28" y="24" width="64" height="72" rx="8" fill="#E2E8F0" stroke="#334155" strokeWidth="3.5" />
          <circle cx="46" cy="44" r="9" fill="#EF4444" stroke="#7F1D1D" strokeWidth="2.5" />
          <circle cx="74" cy="44" r="9" fill="#EF4444" stroke="#7F1D1D" strokeWidth="2.5" />
          <circle cx="46" cy="74" r="9" fill="#FFFFFF" stroke="#475569" strokeWidth="2.5" />
          <circle cx="74" cy="74" r="9" fill="#EF4444" stroke="#7F1D1D" strokeWidth="2.5" />
          <path d="M36 58 L84 58" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      );

    case 'semprot-nyamuk':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="50" y="18" width="20" height="12" rx="3" fill="#F8FAFC" stroke="#1E293B" strokeWidth="3" />
          <circle cx="65" cy="24" r="3" fill="#DC2626" />
          <path d="M40 38 C40 30, 80 30, 80 38 L80 96 C80 100, 40 100, 40 96 Z" fill="#F97316" stroke="#7C2D12" strokeWidth="3.5" />
          <polygon points="60,52 72,74 48,74" fill="#FEF08A" stroke="#7C2D12" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M60 59 L60 67" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="71" r="1.5" fill="#DC2626" />
        </svg>
      );

    case 'termometer-rusak':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <g transform="rotate(-35 60 60)">
            <rect x="52" y="16" width="16" height="72" rx="8" fill="#F8FAFC" stroke="#334155" strokeWidth="3.5" />
            <circle cx="60" cy="88" r="13" fill="#DC2626" stroke="#334155" strokeWidth="3.5" />
            <rect x="57" y="42" width="6" height="44" fill="#DC2626" />
            <path d="M52 34 L58 34 M52 44 L58 44 M52 54 L58 54" stroke="#475569" strokeWidth="2" />
          </g>
          <path d="M56 54 L66 60 L58 66" fill="none" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'charger-rusak':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="44" y="16" width="8" height="16" rx="2" fill="#94A3B8" stroke="#334155" strokeWidth="2.5" />
          <rect x="68" y="16" width="8" height="16" rx="2" fill="#94A3B8" stroke="#334155" strokeWidth="2.5" />
          <rect x="34" y="32" width="52" height="36" rx="8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3.5" />
          <path d="M60 68 C60 84, 38 80, 38 94 C38 102, 76 102, 84 90" fill="none" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
          <path d="M84 90 L92 84 M84 90 L90 98" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="50" r="6" fill="#EF4444" />
        </svg>
      );

    case 'masker-medis':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <path d="M28 48 C16 48, 16 74, 28 74 M92 48 C104 48, 104 74, 92 74" fill="none" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="28" y="42" width="64" height="40" rx="8" fill="#38BDF8" stroke="#0369A1" strokeWidth="3.5" />
          <path d="M36 54 L84 54 M36 62 L84 62 M36 70 L84 70" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M46 42 L74 42" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'cairan-pembersih':
    default:
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="50" y="16" width="20" height="12" rx="2" fill="#DC2626" stroke="#450A0A" strokeWidth="3" />
          <path d="M46 28 L74 28 L86 48 L86 96 C86 100, 34 100, 34 96 L34 48 Z" fill="#C084FC" stroke="#581C87" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M74 36 C86 36, 92 46, 86 58" fill="none" stroke="#581C87" strokeWidth="4" strokeLinecap="round" />
          <polygon points="60,52 72,74 48,74" fill="#FEF08A" stroke="#7C2D12" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M60 59 L60 67" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="71" r="1.5" fill="#DC2626" />
        </svg>
      );
  }
};

interface WasteBinGraphicProps {
  category: WasteCategory;
  isOpen?: boolean;
  className?: string;
}

export const WasteBinGraphic: React.FC<WasteBinGraphicProps> = ({
  category,
  isOpen = false,
  className = 'w-16 h-16 sm:w-20 sm:h-20',
}) => {
  const palette = {
    organik: {
      body: '#16A34A',
      dark: '#14532D',
      lid: '#22C55E',
      emblemBg: '#DCFCE7',
    },
    anorganik: {
      body: '#F59E0B',
      dark: '#78350F',
      lid: '#FBBF24',
      emblemBg: '#FEF3C7',
    },
    b3: {
      body: '#DC2626',
      dark: '#7F1D1D',
      lid: '#EF4444',
      emblemBg: '#FEE2E2',
    },
  }[category];

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {/* Bin Lid (rotates open when active/correct) */}
      <g
        style={{
          transformOrigin: '20px 30px',
          transform: isOpen ? 'rotate(-24deg) translateY(-4px)' : 'rotate(0deg)',
          transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <rect x="40" y="14" width="20" height="7" rx="3" fill={palette.dark} />
        <rect x="16" y="21" width="68" height="11" rx="5" fill={palette.lid} stroke={palette.dark} strokeWidth="3" />
      </g>

      {/* Bin Body */}
      <path
        d="M22 34 L78 34 L72 90 C72 93, 69 95, 66 95 L34 95 C31 95, 28 93, 28 90 Z"
        fill={palette.body}
        stroke={palette.dark}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Category Emblem */}
      <circle cx="50" cy="64" r="16" fill={palette.emblemBg} stroke={palette.dark} strokeWidth="2.5" />

      {category === 'organik' && (
        <path
          d="M42 72 C42 58, 52 52, 60 52 C60 62, 54 72, 42 72 Z M42 72 L55 58"
          fill="#16A34A"
          stroke="#14532D"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {category === 'anorganik' && (
        <g stroke="#92400E" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 53 L57 62 L43 62 Z" />
          <path d="M43 66 L57 66 L50 74 Z" />
        </g>
      )}

      {category === 'b3' && (
        <g>
          <polygon points="50,52 61,72 39,72" fill="#FACC15" stroke="#7F1D1D" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M50 58 L50 65" stroke="#7F1D1D" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="50" cy="68.5" r="1.3" fill="#7F1D1D" />
        </g>
      )}
    </svg>
  );
};
