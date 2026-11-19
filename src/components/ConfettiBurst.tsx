import React from 'react';

interface ConfettiBurstProps {
  active: boolean;
}

const CONFETTI_PIECES = [
  { left: '8%', delay: '0ms', color: '#16A34A', size: 10 },
  { left: '16%', delay: '120ms', color: '#F59E0B', size: 12 },
  { left: '24%', delay: '60ms', color: '#0284C7', size: 9 },
  { left: '33%', delay: '180ms', color: '#DC2626', size: 11 },
  { left: '42%', delay: '40ms', color: '#22C55E', size: 12 },
  { left: '51%', delay: '150ms', color: '#FACC15', size: 10 },
  { left: '60%', delay: '80ms', color: '#16A34A', size: 11 },
  { left: '69%', delay: '210ms', color: '#FB923C', size: 12 },
  { left: '78%', delay: '30ms', color: '#0EA5E9', size: 10 },
  { left: '86%', delay: '140ms', color: '#F59E0B', size: 11 },
  { left: '93%', delay: '90ms', color: '#22C55E', size: 9 },
];

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-80 overflow-hidden"
      aria-hidden="true"
    >
      {CONFETTI_PIECES.map((piece, idx) => (
        <span
          key={idx}
          className="animate-confetti absolute top-0 rounded-sm"
          style={{
            left: piece.left,
            width: `${piece.size}px`,
            height: `${piece.size * 1.4}px`,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
          }}
        />
      ))}
    </div>
  );
};
