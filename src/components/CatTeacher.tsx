import React from 'react';

export type CatMood = 'welcome' | 'thinking' | 'cheering' | 'combo' | 'encouraging' | 'proud';

interface CatTeacherProps {
  mood: CatMood;
  message: string;
  compact?: boolean;
  className?: string;
}

export const CatTeacher: React.FC<CatTeacherProps> = ({
  mood,
  message,
  compact = false,
  className = '',
}) => {
  const isHappyEyes = mood === 'cheering' || mood === 'combo' || mood === 'proud';
  const isEncouraging = mood === 'encouraging';

  const bubbleColors = {
    welcome: 'border-amber-200 bg-amber-50/95 text-slate-800',
    thinking: 'border-sky-200 bg-sky-50/95 text-slate-800',
    cheering: 'border-emerald-300 bg-emerald-50/95 text-emerald-950',
    combo: 'border-orange-300 bg-orange-50/95 text-orange-950',
    encouraging: 'border-amber-300 bg-amber-50/95 text-slate-800',
    proud: 'border-emerald-300 bg-emerald-50/95 text-emerald-950',
  }[mood];

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      {/* Animated Cat Teacher Avatar SVG */}
      <div
        className={`relative shrink-0 transition-transform duration-200 ${
          mood === 'cheering' || mood === 'combo' ? '-translate-y-1 scale-105' : ''
        } ${compact ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-20 w-20 sm:h-24 sm:w-24'}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 120 120" className="h-full w-full drop-shadow-sm">
          {/* Outer warm badge circle */}
          <circle cx="60" cy="62" r="52" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="3.5" />

          {/* Cat Ears */}
          <path
            d="M28 46 L24 18 L48 32 Z"
            fill="#FB923C"
            stroke="#7C2D12"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M30 40 L28 25 L42 33 Z" fill="#FDBA74" />

          <path
            d="M92 46 L96 18 L72 32 Z"
            fill="#FB923C"
            stroke="#7C2D12"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M90 40 L92 25 L78 33 Z" fill="#FDBA74" />

          {/* Body / Shoulders */}
          <path
            d="M30 106 C32 86, 44 80, 60 80 C76 80, 88 86, 90 106 Z"
            fill="#FB923C"
            stroke="#7C2D12"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Green Teacher Scarf / Collar */}
          <path
            d="M39 83 Q60 95 81 83 L76 94 Q60 102 44 94 Z"
            fill="#16A34A"
            stroke="#14532D"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Tiny leaf pin on scarf */}
          <circle cx="60" cy="92" r="4.5" fill="#FEF08A" stroke="#14532D" strokeWidth="2" />

          {/* Cat Head */}
          <ellipse
            cx="60"
            cy="56"
            rx="34"
            ry="29"
            fill="#FDBA74"
            stroke="#7C2D12"
            strokeWidth="3.5"
          />

          {/* Forehead Stripes */}
          <path
            d="M54 29 L54 36 M60 27 L60 37 M66 29 L66 36"
            stroke="#C2410C"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Rosy Cheeks */}
          <ellipse cx="37" cy="62" rx="5.5" ry="3.5" fill="#FB7185" opacity="0.55" />
          <ellipse cx="83" cy="62" rx="5.5" ry="3.5" fill="#FB7185" opacity="0.55" />

          {/* Eyes */}
          {isHappyEyes ? (
            <>
              <path
                d="M40 53 Q46 46 52 53"
                fill="none"
                stroke="#431407"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M68 53 Q74 46 80 53"
                fill="none"
                stroke="#431407"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <circle cx="46" cy="52" r="4.5" fill="#431407" />
              <circle cx="47.5" cy="50.5" r="1.5" fill="#FFFFFF" />
              <circle cx="74" cy="52" r="4.5" fill="#431407" />
              <circle cx="75.5" cy="50.5" r="1.5" fill="#FFFFFF" />
            </>
          )}

          {/* Round Teacher Glasses */}
          <circle cx="46" cy="52" r="10.5" fill="none" stroke="#1E293B" strokeWidth="2.6" />
          <circle cx="74" cy="52" r="10.5" fill="none" stroke="#1E293B" strokeWidth="2.6" />
          <path d="M56.5 52 L63.5 52" stroke="#1E293B" strokeWidth="2.6" />

          {/* Cute Pink Nose */}
          <polygon
            points="57,60 63,60 60,64"
            fill="#F43F5E"
            stroke="#7C2D12"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Mouth Expression */}
          {mood === 'cheering' || mood === 'combo' ? (
            <path
              d="M52 66 Q60 75 68 66 Z"
              fill="#F43F5E"
              stroke="#7C2D12"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          ) : isEncouraging ? (
            <path
              d="M52 67 Q56 70 60 66 Q64 70 68 67"
              fill="none"
              stroke="#7C2D12"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M51 65 Q55.5 70 60 65 Q64.5 70 69 65"
              fill="none"
              stroke="#7C2D12"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          )}

          {/* Whiskers */}
          <path
            d="M22 57 L33 59 M21 64 L33 64 M98 57 L87 59 M99 64 L87 64"
            stroke="#9A3412"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Raised Cheering Paw when celebrating */}
          {(mood === 'cheering' || mood === 'combo' || mood === 'welcome') && (
            <g>
              <circle
                cx="98"
                cy="86"
                r="9"
                fill="#FDBA74"
                stroke="#7C2D12"
                strokeWidth="3"
              />
              <path d="M95 84 L95 87 M98 83 L98 87 M101 84 L101 87" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          )}
        </svg>
      </div>

      {/* Speech Bubble */}
      <div
        className={`relative flex-1 rounded-2xl border-2 px-3.5 py-2.5 shadow-xs sm:px-4 sm:py-3 ${bubbleColors}`}
      >
        <div className="flex items-center gap-2">
          <span className="font-display text-xs font-bold tracking-wide text-amber-800 sm:text-sm">
            Mr.Meow
          </span>
        </div>
        <p
          className={`mt-0.5 font-semibold leading-snug ${
            compact ? 'text-sm sm:text-base' : 'text-sm sm:text-base'
          }`}
        >
          “{message}”
        </p>
      </div>
    </div>
  );
};
