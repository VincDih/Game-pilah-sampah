import React from 'react';
import { Award, RotateCcw, Star, Trophy } from 'lucide-react';
import { soundManager } from '../utils/sound';

export interface ClassScoreRecord {
  id: string;
  playerName: string;
  score: number;
  correctCount: number;
  totalCount: number;
  bestStreak: number;
  stars: 1 | 2 | 3;
  title: string;
  timestamp: number;
}

interface LeaderboardViewProps {
  records: ClassScoreRecord[];
  onClearRecords: () => void;
  onStartPlay: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  records,
  onClearRecords,
  onStartPlay,
}) => {
  const sorted = [...records].sort((a, b) => b.score - a.score || b.correctCount - a.correctCount);

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col gap-3 px-3 py-3 sm:px-6 sm:py-5">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            className="font-display font-bold tracking-tight text-slate-900 text-balance"
            style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.85rem)' }}
          >
            Papan Bintang Kelas
          </h1>
          <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
            Apresiasi untuk semua siswa yang berani maju mempraktikkan pilah sampah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {records.length > 0 && (
            <button
              type="button"
              onClick={() => {
                soundManager.playTap();
                onClearRecords();
              }}
              className="touch-game inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 sm:text-sm cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Hapus Daftar</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              soundManager.playTap();
              onStartPlay();
            }}
            className="touch-game inline-flex min-h-[40px] items-center justify-center rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-transform hover:bg-emerald-500 active:translate-y-0.5 whitespace-nowrap shrink-0 sm:text-sm cursor-pointer"
          >
            Main Sekarang
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Trophy className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-3 font-display text-lg font-bold text-slate-900 sm:text-xl">
              Belum Ada Nilai Tercatat
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-600 sm:text-sm">
              Selesaikan satu giliran bermain untuk melihat nama siswa serta bintangnya di sini.
            </p>
            <button
              type="button"
              onClick={() => {
                soundManager.playTap();
                onStartPlay();
              }}
              className="touch-game mt-4 inline-flex min-h-[46px] items-center justify-center rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-transform hover:bg-emerald-500 active:translate-y-0.5 cursor-pointer"
            >
              Ayo Mulai Giliran Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {sorted.map((rec, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={rec.id}
                    className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 ${
                      rank === 1 ? 'bg-amber-50/60' : ''
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-base font-bold tabular-nums sm:h-10 sm:w-10 ${
                          rank === 1
                            ? 'bg-amber-400 text-amber-950'
                            : rank === 2
                              ? 'bg-slate-200 text-slate-800'
                              : rank === 3
                                ? 'bg-orange-200 text-orange-900'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rank}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate font-display text-base font-bold text-slate-900 sm:text-lg">
                            {rec.playerName}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-xs font-semibold text-emerald-700 sm:text-sm">
                            {rec.title}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 tabular-nums">
                          <span>Benar {rec.correctCount}/{rec.totalCount}</span>
                          <span aria-hidden="true">·</span>
                          <span>Combo {rec.bestStreak}x</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-0.5" aria-label={`${rec.stars} bintang`}>
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 sm:h-5 sm:w-5 ${
                              s <= rec.stars
                                ? 'fill-amber-400 text-amber-500'
                                : 'fill-slate-100 text-slate-300'
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 font-display text-lg font-bold text-slate-900 tabular-nums sm:text-xl">
                        <Award className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" aria-hidden="true" />
                        <span>{rec.score}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
