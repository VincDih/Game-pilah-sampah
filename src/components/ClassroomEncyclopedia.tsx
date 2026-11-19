import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Info } from 'lucide-react';
import { BIN_CONFIGS, BIN_ORDER, WASTE_ITEMS, WasteCategory, WasteItem } from '../data/wasteItems';
import { WasteBinGraphic, WasteIllustration } from './WasteIllustration';
import { soundManager } from '../utils/sound';

interface ClassroomEncyclopediaProps {
  onStartPlay: () => void;
}

export const ClassroomEncyclopedia: React.FC<ClassroomEncyclopediaProps> = ({ onStartPlay }) => {
  const [filter, setFilter] = useState<'all' | WasteCategory>('all');
  const [selectedItem, setSelectedItem] = useState<WasteItem>(WASTE_ITEMS[0]);

  const filteredItems =
    filter === 'all' ? WASTE_ITEMS : WASTE_ITEMS.filter((item) => item.category === filter);

  const selectedBin = BIN_CONFIGS[selectedItem.category];

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-4">
      {/* Compact Top Bar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div>
          <h1
            className="font-display font-bold tracking-tight text-slate-900 text-balance"
            style={{ fontSize: 'clamp(1.15rem, 2.2vw, 1.75rem)' }}
          >
            Kenali 3 Jenis Tempat Sampah
          </h1>
          <p className="text-xs text-slate-600 sm:text-sm">
            Ketuk kategori atau gambar benda untuk melihat cara memilah dan faktanya.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundManager.playTap();
            onStartPlay();
          }}
          className="touch-game inline-flex min-h-[40px] items-center justify-center rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-transform hover:bg-emerald-500 active:translate-y-0.5 whitespace-nowrap shrink-0 sm:min-h-[44px] sm:px-5 sm:text-sm cursor-pointer"
        >
          Siap! Ayo Mulai Main
        </button>
      </div>

      {/* Compact Interactive Category Selector Cards */}
      <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3">
        {BIN_ORDER.map((cat) => {
          const bin = BIN_CONFIGS[cat];
          const isActive = filter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                soundManager.playTap();
                setFilter(isActive ? 'all' : cat);
              }}
              className={`touch-game flex items-center gap-2 rounded-2xl border-2 p-2 text-left transition-all sm:gap-3 sm:p-3 cursor-pointer ${
                isActive
                  ? `${bin.bgClass} ${bin.borderClass} shadow-sm`
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <WasteBinGraphic
                category={cat}
                isOpen={isActive}
                className="h-10 w-10 shrink-0 sm:h-12 sm:w-12"
              />
              <div className="min-w-0">
                <h2 className={`truncate font-display text-xs font-bold sm:text-base ${bin.textClass}`}>
                  {bin.shortTitle}
                </h2>
                <p className="hidden text-xs leading-tight text-slate-600 md:line-clamp-2">
                  {bin.ruleSummary}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs Row */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1"
          role="tablist"
          aria-label="Filter kategori sampah"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => {
              soundManager.playTap();
              setFilter('all');
            }}
            className={`touch-game min-h-[32px] rounded-lg px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap sm:text-sm cursor-pointer ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({WASTE_ITEMS.length})
          </button>
          {BIN_ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={filter === cat}
              onClick={() => {
                soundManager.playTap();
                setFilter(cat);
              }}
              className={`touch-game min-h-[32px] rounded-lg px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap sm:text-sm cursor-pointer ${
                filter === cat ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {BIN_CONFIGS[cat].shortTitle} (8)
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-1.5 text-xs font-semibold text-slate-500 sm:flex">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Menampilkan {filteredItems.length} benda</span>
        </div>
      </div>

      {/* Split Workspace — Fits Inside Viewport Without Page Scroll */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Scroll-contained Item Grid */}
        <div className="min-h-0 overflow-y-auto pr-1 lg:col-span-7 xl:col-span-8">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-4">
            {filteredItems.map((item) => {
              const isSelected = selectedItem.id === item.id;
              const bin = BIN_CONFIGS[item.category];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    soundManager.playTap();
                    setSelectedItem(item);
                  }}
                  className={`touch-game flex flex-col items-center rounded-2xl border-2 p-2 text-center transition-transform active:scale-95 cursor-pointer ${
                    isSelected
                      ? `${bin.bgClass} ${bin.borderClass} shadow-sm`
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <WasteIllustration itemId={item.id} className="h-12 w-12 sm:h-16 sm:w-16" />
                  <span className="mt-1.5 line-clamp-2 font-display text-xs font-bold leading-tight text-slate-900 sm:text-sm">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Always-Visible Fact Detail Spotlight */}
        <aside className="shrink-0 lg:col-span-5 lg:flex lg:min-h-0 lg:flex-col xl:col-span-4">
          <div className="flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">
            <div className="flex items-center gap-3 lg:flex-col lg:text-center">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl lg:h-28 lg:w-28 ${selectedBin.bgClass}`}
              >
                <WasteIllustration itemId={selectedItem.id} className="h-14 w-14 lg:h-24 lg:w-24" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-lg font-bold text-slate-900 lg:mt-2 lg:text-2xl">
                  {selectedItem.name}
                </h3>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs font-bold lg:justify-center lg:text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span className={selectedBin.textClass}>Masuk ke {selectedBin.title}</span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left lg:mt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 sm:text-sm">
                <Info className="h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
                <span>Fakta Edukasi</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-700 sm:text-sm">
                {selectedItem.fact}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};
