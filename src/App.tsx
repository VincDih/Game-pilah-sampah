import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  HelpCircle,
  Home,
  Maximize2,
  Minimize2,
  Minus,
  Play,
  Plus,
  RotateCcw,
  School,
  Star,
  Trash2,
  Trees,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import {
  BIN_CONFIGS,
  BIN_ORDER,
  CAT_QUOTES,
  getAppreciationTier,
  SCENE_CONFIGS,
  SCENE_ORDER,
  SceneLocation,
  WASTE_ITEMS,
  WasteCategory,
  WasteItem,
} from './data/wasteItems';
import { WasteIllustration } from './components/WasteIllustration';
import { ClassroomEncyclopedia } from './components/ClassroomEncyclopedia';
import { ClassScoreRecord, LeaderboardView } from './components/LeaderboardView';
import { ConfettiBurst } from './components/ConfettiBurst';
import { CatMood, CatTeacher } from './components/CatTeacher';
import { ActiveThrowEffect, WasteScene3D } from './components/WasteScene3D';
import { soundManager } from './utils/sound';

type NavTab = 'play' | 'learn' | 'leaderboard';
type PlayMode = 'quick' | 'classroom';
type GameStage = 'TITLE_MENU' | 'TURN_READY' | 'PLAYING' | 'TURN_SUMMARY' | 'CLASS_PODIUM';

interface AnswerRecord {
  item: WasteItem;
  chosenCategory: WasteCategory;
  isCorrect: boolean;
  pointsEarned: number;
}

interface TurnFeedback {
  isCorrect: boolean;
  chosenCategory: WasteCategory;
  pointsEarned: number;
  streakAfter: number;
  item: WasteItem;
}

const TROPHY_IMG_URL = '/src/assets/images/trophy_eco_champion_1795060218244.jpg';
const STORAGE_KEY = 'pilah_pintar_leaderboard_v1';

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildBalancedDeck(count: number): WasteItem[] {
  const byCat: Record<WasteCategory, WasteItem[]> = {
    organik: shuffleArray(WASTE_ITEMS.filter((i) => i.category === 'organik')),
    anorganik: shuffleArray(WASTE_ITEMS.filter((i) => i.category === 'anorganik')),
    b3: shuffleArray(WASTE_ITEMS.filter((i) => i.category === 'b3')),
  };

  const picked: WasteItem[] = [];
  const cats = shuffleArray([...BIN_ORDER]);
  let idx = 0;

  while (picked.length < count) {
    const cat = cats[idx % cats.length];
    const pool = byCat[cat];
    const item = pool[Math.floor(idx / cats.length) % pool.length];
    if (item) {
      picked.push(item);
    }
    idx += 1;
  }

  return shuffleArray(picked);
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('play');
  const [soundEnabled, setSoundEnabled] = useState(true);
  // Default directly to 'sekolah' (3D School Classroom)
  const [sceneLocation, setSceneLocation] = useState<SceneLocation>('sekolah');
  const [trophyLoadError, setTrophyLoadError] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    soundManager.playTap();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen restrictions in embedded preview frames
    }
  };

  // Setup configuration
  const [playMode, setPlayMode] = useState<PlayMode>('classroom');
  const [quickPlayerName, setQuickPlayerName] = useState('Siswa Juara');
  const [studentQueue, setStudentQueue] = useState<string[]>(['Budi', 'Siti', 'Raka']);
  const [newStudentInput, setNewStudentInput] = useState('');
  const [questionsPerTurn, setQuestionsPerTurn] = useState<number>(6);
  const [timerSetting, setTimerSetting] = useState<number>(60);
  const [isCustomQuestions, setIsCustomQuestions] = useState(false);
  const [customQuestionsText, setCustomQuestionsText] = useState('12');
  const [isCustomTimer, setIsCustomTimer] = useState(false);
  const [customTimerText, setCustomTimerText] = useState('90');

  // Active game state
  const [stage, setStage] = useState<GameStage>('TITLE_MENU');
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [deck, setDeck] = useState<WasteItem[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<TurnFeedback | null>(null);
  const [feedbackSecondsLeft, setFeedbackSecondsLeft] = useState(5);
  const [answerHistory, setAnswerHistory] = useState<AnswerRecord[]>([]);
  const [sessionTurnResults, setSessionTurnResults] = useState<ClassScoreRecord[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [throwEffect, setThrowEffect] = useState<ActiveThrowEffect | null>(null);

  // Persistent class leaderboard
  const [leaderboard, setLeaderboard] = useState<ClassScoreRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
    } catch {
      // Ignore storage write errors
    }
  }, [leaderboard]);

  const activePlayers = useMemo(() => {
    if (playMode === 'quick') {
      const clean = quickPlayerName.trim() || 'Siswa Juara';
      return [clean];
    }
    return studentQueue.length > 0 ? studentQueue : ['Siswa 1'];
  }, [playMode, quickPlayerName, studentQueue]);

  const currentPlayerName = activePlayers[currentTurnIndex] || 'Siswa';
  const currentItem = deck[questionIndex] || null;
  const activeScene = SCENE_CONFIGS[sceneLocation];

  // Dynamic Guru Kucing mood & quote
  const catState = useMemo<{ mood: CatMood; message: string }>(() => {
    if (stage === 'TITLE_MENU') {
      return { mood: 'welcome', message: activeScene.welcomeQuote };
    }
    if (stage === 'TURN_READY') {
      return {
        mood: 'welcome',
        message: `Ayo ${currentPlayerName}, maju ke depan! Kamu pasti bisa memilah ${questionsPerTurn} benda dengan hebat!`,
      };
    }
    if (stage === 'TURN_SUMMARY' || stage === 'CLASS_PODIUM') {
      return {
        mood: 'proud',
        message: `Hebat sekali, ${currentPlayerName}! Mr.Meow bangga melihat semangatmu hari ini!`,
      };
    }
    if (feedback) {
      if (feedback.isCorrect) {
        if (feedback.streakAfter >= 2) {
          return {
            mood: 'combo',
            message:
              CAT_QUOTES.combo[(questionIndex + feedback.streakAfter) % CAT_QUOTES.combo.length],
          };
        }
        return {
          mood: 'cheering',
          message: CAT_QUOTES.cheering[questionIndex % CAT_QUOTES.cheering.length],
        };
      }
      return {
        mood: 'encouraging',
        message: CAT_QUOTES.encouraging[questionIndex % CAT_QUOTES.encouraging.length],
      };
    }
    return {
      mood: 'thinking',
      message: CAT_QUOTES.thinking[questionIndex % CAT_QUOTES.thinking.length],
    };
  }, [activeScene.welcomeQuote, currentPlayerName, feedback, questionIndex, questionsPerTurn, stage]);

  const toggleSound = () => {
    const next = !soundEnabled;
    soundManager.enabled = next;
    setSoundEnabled(next);
    if (next) {
      soundManager.playTap();
    }
  };

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    const timer = window.setTimeout(() => setShowConfetti(false), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  const beginTurnPlay = useCallback(
    (turnIdx: number) => {
      const freshDeck = buildBalancedDeck(questionsPerTurn);
      setCurrentTurnIndex(turnIdx);
      setDeck(freshDeck);
      setQuestionIndex(0);
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setTimeLeft(timerSetting);
      setShowHint(false);
      setFeedback(null);
      setFeedbackSecondsLeft(5);
      setAnswerHistory([]);
      setThrowEffect(null);
      setDockCollapsed(false);
      setStage('PLAYING');
    },
    [questionsPerTurn, timerSetting],
  );

  const handleStartGame = () => {
    soundManager.playTap();
    setSessionTurnResults([]);
    if (playMode === 'classroom') {
      setCurrentTurnIndex(0);
      setStage('TURN_READY');
    } else {
      beginTurnPlay(0);
    }
  };

  const finalizeTurn = useCallback(
    (finalScore: number, finalBestStreak: number, history: AnswerRecord[]) => {
      const correctCount = history.filter((h) => h.isCorrect).length;
      const totalAnswered = deck.length || questionsPerTurn;
      const tier = getAppreciationTier(correctCount, totalAnswered);

      const record: ClassScoreRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        playerName: currentPlayerName,
        score: finalScore,
        correctCount,
        totalCount: totalAnswered,
        bestStreak: finalBestStreak,
        stars: tier.stars,
        title: tier.title,
        timestamp: Date.now(),
      };

      setSessionTurnResults((prev) => [...prev, record]);
      setLeaderboard((prev) => [record, ...prev].slice(0, 40));
      setStage('TURN_SUMMARY');
      soundManager.playVictory();
      triggerConfetti();
    },
    [currentPlayerName, deck.length, questionsPerTurn, triggerConfetti],
  );

  const advanceQuestion = useCallback(() => {
    if (!feedback) return;
    soundManager.playTap();
    setFeedback(null);
    setFeedbackSecondsLeft(5);
    setShowHint(false);
    setThrowEffect(null);

    if (questionIndex + 1 >= deck.length) {
      finalizeTurn(score, bestStreak, answerHistory);
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
  }, [answerHistory, bestStreak, deck.length, feedback, finalizeTurn, questionIndex, score]);

  const handleBinSelect = useCallback(
    (chosenCategory: WasteCategory) => {
      if (stage !== 'PLAYING' || !currentItem || feedback) return;

      const isCorrect = currentItem.category === chosenCategory;
      let nextStreak = 0;
      let pointsEarned = 0;

      if (isCorrect) {
        nextStreak = streak + 1;
        pointsEarned = 100 + Math.min(nextStreak - 1, 5) * 20;
        soundManager.playCorrect(nextStreak);
        if (nextStreak === 3 || nextStreak === 5 || nextStreak === 8) {
          window.setTimeout(() => soundManager.playComboMilestone(), 180);
        }
      } else {
        nextStreak = 0;
        pointsEarned = 0;
        soundManager.playWrong();
      }

      const nextScore = score + pointsEarned;
      const nextBest = Math.max(bestStreak, nextStreak);
      const nextRecord: AnswerRecord = {
        item: currentItem,
        chosenCategory,
        isCorrect,
        pointsEarned,
      };
      const nextHistory = [...answerHistory, nextRecord];

      setScore(nextScore);
      setStreak(nextStreak);
      setBestStreak(nextBest);
      setAnswerHistory(nextHistory);
      setThrowEffect({
        id: Date.now(),
        targetCategory: chosenCategory,
        isCorrect,
      });
      setFeedback({
        isCorrect,
        chosenCategory,
        pointsEarned,
        streakAfter: nextStreak,
        item: currentItem,
      });
      setFeedbackSecondsLeft(5);
      setDockCollapsed(false);
    },
    [answerHistory, bestStreak, currentItem, feedback, score, stage, streak],
  );

  // Countdown timer effect (pauses automatically while feedback/fact is shown)
  useEffect(() => {
    if (stage !== 'PLAYING' || timerSetting === 0 || feedback !== null) return;

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        if (prev <= 6) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [stage, timerSetting, feedback]);

  // Handle time running out cleanly
  const hasTimedOutRef = useRef(false);
  useEffect(() => {
    if (stage === 'PLAYING' && timerSetting > 0 && timeLeft === 0 && !feedback && !hasTimedOutRef.current) {
      hasTimedOutRef.current = true;
      finalizeTurn(score, bestStreak, answerHistory);
    }
    if (timeLeft > 0 || stage !== 'PLAYING') {
      hasTimedOutRef.current = false;
    }
  }, [answerHistory, bestStreak, feedback, finalizeTurn, score, stage, timeLeft, timerSetting]);

  // Auto-advance unconditionally 5 seconds after every answer (correct or wrong)
  useEffect(() => {
    if (stage !== 'PLAYING' || !feedback) return;

    const interval = window.setInterval(() => {
      setFeedbackSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [feedback, stage]);

  useEffect(() => {
    if (stage === 'PLAYING' && feedback && feedbackSecondsLeft === 0) {
      advanceQuestion();
    }
  }, [advanceQuestion, feedback, feedbackSecondsLeft, stage]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'play') return;
      if (stage === 'PLAYING') {
        if (!feedback) {
          if (e.key === '1') handleBinSelect('organik');
          if (e.key === '2') handleBinSelect('anorganik');
          if (e.key === '3') handleBinSelect('b3');
          if (e.key.toLowerCase() === 'h') setDockCollapsed((p) => !p);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          advanceQuestion();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, advanceQuestion, feedback, handleBinSelect, stage]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStudentInput.trim();
    if (!trimmed) return;
    soundManager.playTap();
    setStudentQueue((prev) => [...prev, trimmed]);
    setNewStudentInput('');
  };

  const handleRemoveStudent = (idx: number) => {
    soundManager.playTap();
    setStudentQueue((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePresetGroups = () => {
    soundManager.playTap();
    setStudentQueue(['Kelompok Merah', 'Kelompok Kuning', 'Kelompok Hijau', 'Kelompok Biru']);
  };

  const handleNextClassroomTurn = () => {
    soundManager.playTap();
    if (currentTurnIndex + 1 < activePlayers.length) {
      setCurrentTurnIndex((prev) => prev + 1);
      setStage('TURN_READY');
    } else {
      setStage('CLASS_PODIUM');
      soundManager.playVictory();
      triggerConfetti();
    }
  };

  const returnToMenu = () => {
    soundManager.playTap();
    setStage('TITLE_MENU');
    setFeedback(null);
    setThrowEffect(null);
  };

  const currentCorrectCount = answerHistory.filter((h) => h.isCorrect).length;
  const currentTier = getAppreciationTier(currentCorrectCount, deck.length || questionsPerTurn);

  const sceneIcon = (loc: SceneLocation) => {
    if (loc === 'sekolah') return <School className="h-4 w-4 shrink-0" aria-hidden="true" />;
    if (loc === 'rumah') return <Home className="h-4 w-4 shrink-0" aria-hidden="true" />;
    return <Trees className="h-4 w-4 shrink-0" aria-hidden="true" />;
  };

  const is3DCanvasMode = activeTab === 'play';

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#FFFDF7] text-slate-900">
      <ConfettiBurst active={showConfetti} />

      {/* Live 3D WebGL World — mounted persistently on Play tab so switching location/items has zero flicker */}
      {is3DCanvasMode && (
        <div className="fixed inset-0 z-0">
          <WasteScene3D
            location={sceneLocation}
            activeItemId={stage === 'PLAYING' && currentItem ? currentItem.id : null}
            isPlaying={stage === 'PLAYING'}
            canInteract={stage === 'PLAYING' && feedback === null}
            catMood={catState.mood}
            catMessage={catState.message}
            showCatBubble={stage === 'TITLE_MENU' || stage === 'PLAYING'}
            throwEffect={throwEffect}
            highlightCorrectBin={feedback && !feedback.isCorrect ? feedback.item.category : null}
            onBinClick={handleBinSelect}
          />
        </div>
      )}

      {/* Main Overlay Content (No top header — all interactive buttons placed at the bottom for smartboard reach) */}
      <main className="pointer-events-none relative z-20 flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'learn' && (
          <div className="pointer-events-auto flex min-h-0 flex-1 flex-col overflow-hidden bg-[#FFFDF7]">
            <ClassroomEncyclopedia
              onStartPlay={() => {
                setActiveTab('play');
                setStage('TITLE_MENU');
              }}
            />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="pointer-events-auto flex min-h-0 flex-1 flex-col overflow-hidden bg-[#FFFDF7]">
            <LeaderboardView
              records={leaderboard}
              onClearRecords={() => setLeaderboard([])}
              onStartPlay={() => {
                setActiveTab('play');
                setStage('TITLE_MENU');
              }}
            />
          </div>
        )}

        {/* TITLE MENU — Sleek Compact Bottom Setup over Live 3D Classroom (Zero Scroll, 100dvh) */}
        {activeTab === 'play' && stage === 'TITLE_MENU' && (
          <section className="flex min-h-0 flex-1 flex-col justify-end p-2.5 sm:p-4">
            {/* Bottom Setup Dock — compact & adaptive so Guru Kucing at Meja Guru stays clearly visible above */}
            <div className="pointer-events-auto mx-auto max-h-[56dvh] w-full max-w-4xl overflow-y-auto rounded-3xl border-2 border-slate-200 bg-white/95 p-3 shadow-xl sm:p-4">
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-12 md:gap-3.5">
                {/* Left: Location, Mode & Round */}
                <div className="space-y-2 md:col-span-6">
                  <div>
                    <span className="block font-display text-xs font-bold text-slate-800 sm:text-sm">
                      Latar Tempat 3D
                    </span>
                    <div className="mt-1 grid grid-cols-3 gap-1.5">
                      {SCENE_ORDER.map((locId) => {
                        const scene = SCENE_CONFIGS[locId];
                        const isSelected = sceneLocation === locId;
                        return (
                          <button
                            key={locId}
                            type="button"
                            onClick={() => {
                              soundManager.playTap();
                              setSceneLocation(locId);
                            }}
                            className={`touch-game flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-1 text-xs font-bold transition-all sm:min-h-[40px] sm:text-sm cursor-pointer ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {sceneIcon(locId)}
                            <span className="truncate">{scene.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="block font-display text-xs font-bold text-slate-800 sm:text-sm">
                      Cara Bermain
                    </span>
                    <div className="mt-1 grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playTap();
                          setPlayMode('classroom');
                        }}
                        className={`touch-game flex min-h-[36px] items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-1 text-xs font-bold transition-all sm:min-h-[38px] sm:text-sm cursor-pointer ${
                          playMode === 'classroom'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Users className="h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
                        <span className="truncate">Giliran Kelas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playTap();
                          setPlayMode('quick');
                        }}
                        className={`touch-game flex min-h-[36px] items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-1 text-xs font-bold transition-all sm:min-h-[38px] sm:text-sm cursor-pointer ${
                          playMode === 'quick'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Play className="h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
                        <span className="truncate">Main Cepat</span>
                      </button>
                    </div>
                  </div>

                  {/* Round & Timer (with Custom Options) */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-600">Jumlah Soal</span>
                        {isCustomQuestions && (
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playTap();
                              setIsCustomQuestions(false);
                              setQuestionsPerTurn(6);
                            }}
                            className="touch-game text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
                          >
                            Preset
                          </button>
                        )}
                      </div>
                      {!isCustomQuestions ? (
                        <div className="mt-1 grid grid-cols-4 gap-0.5 rounded-xl bg-slate-100 p-0.5">
                          {[6, 8, 10].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                soundManager.playTap();
                                setQuestionsPerTurn(num);
                              }}
                              className={`touch-game min-h-[34px] rounded-lg text-xs font-bold tabular-nums cursor-pointer ${
                                questionsPerTurn === num
                                  ? 'bg-white text-slate-900 shadow-xs'
                                  : 'text-slate-600'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playTap();
                              setIsCustomQuestions(true);
                              const nextVal = [6, 8, 10].includes(questionsPerTurn) ? 12 : questionsPerTurn;
                              setQuestionsPerTurn(nextVal);
                              setCustomQuestionsText(String(nextVal));
                            }}
                            className="touch-game min-h-[34px] rounded-lg text-[11px] font-bold text-sky-700 hover:bg-white/80 cursor-pointer"
                          >
                            Kustom
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-1 rounded-xl border-2 border-emerald-500 bg-emerald-50/60 p-0.5">
                          <button
                            type="button"
                            aria-label="Kurangi jumlah soal"
                            onClick={() => {
                              soundManager.playTap();
                              const next = Math.max(1, questionsPerTurn - 1);
                              setQuestionsPerTurn(next);
                              setCustomQuestionsText(String(next));
                            }}
                            className="touch-game flex h-[30px] w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-xs hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={24}
                            aria-label="Jumlah soal kustom"
                            value={customQuestionsText}
                            onChange={(e) => {
                              const raw = e.target.value;
                              setCustomQuestionsText(raw);
                              const parsed = parseInt(raw, 10);
                              if (!Number.isNaN(parsed)) {
                                setQuestionsPerTurn(Math.max(1, Math.min(24, parsed)));
                              }
                            }}
                            onBlur={() => {
                              const clamped = Math.max(1, Math.min(24, questionsPerTurn));
                              setQuestionsPerTurn(clamped);
                              setCustomQuestionsText(String(clamped));
                            }}
                            className="h-[30px] w-full min-w-0 bg-transparent text-center font-display text-sm font-bold text-slate-900 tabular-nums focus:outline-none"
                          />
                          <button
                            type="button"
                            aria-label="Tambah jumlah soal"
                            onClick={() => {
                              soundManager.playTap();
                              const next = Math.min(24, questionsPerTurn + 1);
                              setQuestionsPerTurn(next);
                              setCustomQuestionsText(String(next));
                            }}
                            className="touch-game flex h-[30px] w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-xs hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-600">Waktu (dtk)</span>
                        {isCustomTimer && (
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playTap();
                              setIsCustomTimer(false);
                              setTimerSetting(60);
                            }}
                            className="touch-game text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
                          >
                            Preset
                          </button>
                        )}
                      </div>
                      {!isCustomTimer ? (
                        <div className="mt-1 grid grid-cols-4 gap-0.5 rounded-xl bg-slate-100 p-0.5">
                          {[
                            { val: 45, label: '45s' },
                            { val: 60, label: '60s' },
                            { val: 0, label: 'Santai' },
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => {
                                soundManager.playTap();
                                setTimerSetting(opt.val);
                              }}
                              className={`touch-game min-h-[34px] rounded-lg text-[11px] font-bold tabular-nums cursor-pointer ${
                                timerSetting === opt.val
                                  ? 'bg-white text-slate-900 shadow-xs'
                                  : 'text-slate-600'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playTap();
                              setIsCustomTimer(true);
                              const nextVal = [0, 45, 60].includes(timerSetting) ? 90 : timerSetting;
                              setTimerSetting(nextVal);
                              setCustomTimerText(String(nextVal));
                            }}
                            className="touch-game min-h-[34px] rounded-lg text-[11px] font-bold text-sky-700 hover:bg-white/80 cursor-pointer"
                          >
                            Kustom
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-1 rounded-xl border-2 border-emerald-500 bg-emerald-50/60 p-0.5">
                          <button
                            type="button"
                            aria-label="Kurangi waktu detik"
                            onClick={() => {
                              soundManager.playTap();
                              const next = Math.max(10, timerSetting - 5);
                              setTimerSetting(next);
                              setCustomTimerText(String(next));
                            }}
                            className="touch-game flex h-[30px] w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-xs hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <input
                            type="number"
                            min={10}
                            max={300}
                            aria-label="Waktu kustom dalam detik"
                            value={customTimerText}
                            onChange={(e) => {
                              const raw = e.target.value;
                              setCustomTimerText(raw);
                              const parsed = parseInt(raw, 10);
                              if (!Number.isNaN(parsed)) {
                                setTimerSetting(Math.max(10, Math.min(300, parsed)));
                              }
                            }}
                            onBlur={() => {
                              const clamped = Math.max(10, Math.min(300, timerSetting || 60));
                              setTimerSetting(clamped);
                              setCustomTimerText(String(clamped));
                            }}
                            className="h-[30px] w-full min-w-0 bg-transparent text-center font-display text-sm font-bold text-slate-900 tabular-nums focus:outline-none"
                          />
                          <button
                            type="button"
                            aria-label="Tambah waktu detik"
                            onClick={() => {
                              soundManager.playTap();
                              const next = Math.min(300, timerSetting + 5);
                              setTimerSetting(next);
                              setCustomTimerText(String(next));
                            }}
                            className="touch-game flex h-[30px] w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-xs hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Roster / Name + Primary CTA */}
                <div className="flex flex-col justify-between gap-2 md:col-span-6">
                  {playMode === 'classroom' ? (
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="student-name-input"
                          className="font-display text-xs font-bold text-slate-800 sm:text-sm"
                        >
                          Daftar Siswa / Kelompok ({studentQueue.length})
                        </label>
                        <button
                          type="button"
                          onClick={handlePresetGroups}
                          className="touch-game text-xs font-bold text-sky-700 hover:underline cursor-pointer"
                        >
                          Isi 4 Kelompok
                        </button>
                      </div>

                      <form onSubmit={handleAddStudent} className="mt-1 flex gap-1.5">
                        <input
                          id="student-name-input"
                          type="text"
                          value={newStudentInput}
                          onChange={(e) => setNewStudentInput(e.target.value)}
                          placeholder="Ketik nama siswa..."
                          maxLength={24}
                          className="min-h-[38px] flex-1 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none sm:text-sm"
                        />
                        <button
                          type="submit"
                          className="touch-game inline-flex min-h-[38px] items-center gap-1 rounded-xl border-b-4 border-sky-800 bg-sky-600 px-3 py-1 text-xs font-bold text-white hover:bg-sky-500 active:translate-y-0.5 whitespace-nowrap shrink-0 sm:text-sm cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Tambah</span>
                        </button>
                      </form>

                      <div className="mt-1.5 flex max-h-[44px] flex-wrap gap-1 overflow-y-auto">
                        {studentQueue.map((student, idx) => (
                          <div
                            key={`${student}-${idx}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-0.5 pl-2 pr-1 text-xs font-semibold text-slate-800"
                          >
                            <span className="tabular-nums text-[11px] font-bold text-slate-500">
                              {idx + 1}.
                            </span>
                            <span>{student}</span>
                            {studentQueue.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveStudent(idx)}
                                aria-label={`Hapus ${student}`}
                                className="touch-game flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-rose-100 hover:text-rose-700 cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="quick-player-input"
                        className="block font-display text-xs font-bold text-slate-800 sm:text-sm"
                      >
                        Nama Pemain
                      </label>
                      <input
                        id="quick-player-input"
                        type="text"
                        value={quickPlayerName}
                        onChange={(e) => setQuickPlayerName(e.target.value)}
                        placeholder="Masukkan nama siswa..."
                        maxLength={24}
                        className="mt-1 min-h-[40px] w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleStartGame}
                    className="touch-game flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-800 bg-emerald-600 px-5 py-2.5 font-display text-base font-bold text-white shadow-sm transition-transform hover:bg-emerald-500 active:translate-y-0.5 sm:min-h-[48px] sm:text-lg cursor-pointer"
                  >
                    <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                    <span>Mulai Bermain 3D!</span>
                  </button>
                </div>
              </div>

              {/* Bottom Smartboard Navigation & Audio Row */}
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playTap();
                      setActiveTab('learn');
                    }}
                    className="touch-game inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 whitespace-nowrap sm:text-sm cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                    <span>Belajar Sampah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playTap();
                      setActiveTab('leaderboard');
                    }}
                    className="touch-game inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 whitespace-nowrap sm:text-sm cursor-pointer"
                  >
                    <Trophy className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    <span>Papan Bintang</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleSound}
                    aria-pressed={soundEnabled}
                    className={`touch-game inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border-2 px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 sm:text-sm cursor-pointer ${
                      soundEnabled
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    )}
                    <span>{soundEnabled ? 'Suara Nyala' : 'Suara Mati'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-pressed={isFullscreen}
                    className="touch-game inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0 sm:text-sm cursor-pointer"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4 text-slate-700" aria-hidden="true" />
                    ) : (
                      <Maximize2 className="h-4 w-4 text-slate-700" aria-hidden="true" />
                    )}
                    <span>{isFullscreen ? 'Keluar Penuh' : 'Layar Penuh'}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TURN READY SCREEN */}
        {activeTab === 'play' && stage === 'TURN_READY' && (
          <section className="pointer-events-auto mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col items-center justify-center p-3 text-center sm:p-4">
            <div className="animate-pop-in max-h-[92dvh] w-full overflow-y-auto rounded-3xl border-2 border-slate-200 bg-white/95 p-5 shadow-xl sm:p-7">
              <p className="text-xs font-bold text-emerald-700 tabular-nums sm:text-sm">
                Giliran {currentTurnIndex + 1} dari {activePlayers.length} · {activeScene.label}
              </p>
              <h1
                className="mt-1 font-display font-bold text-slate-900 text-balance"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
              >
                {currentPlayerName}
              </h1>

              <div className="mt-3 text-left">
                <CatTeacher mood="welcome" message={catState.message} compact />
              </div>

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTap();
                    beginTurnPlay(currentTurnIndex);
                  }}
                  className="touch-game inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-2xl border-b-4 border-emerald-800 bg-emerald-600 px-7 py-2.5 font-display text-lg font-bold text-white transition-transform hover:bg-emerald-500 active:translate-y-0.5 sm:text-xl cursor-pointer"
                >
                  <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                  <span>Saya Siap, Mulai!</span>
                </button>
                <button
                  type="button"
                  onClick={returnToMenu}
                  className="touch-game inline-flex min-h-[50px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:text-base cursor-pointer"
                >
                  Kembali
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ACTIVE 3D GAMEPLAY STAGE — Unobstructed Center 3D Viewport + Collapsible Bottom Dock */}
        {activeTab === 'play' && stage === 'PLAYING' && currentItem && (
          <section className="flex min-h-0 flex-1 flex-col justify-between px-3 py-2.5 sm:px-6 sm:py-3">
            {/* Top Floating HUD & Guru Kucing Motivation (leaves 3D center open!) */}
            <div className="pointer-events-auto mx-auto flex w-full max-w-5xl flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-slate-200 bg-white/95 px-3.5 py-2 shadow-sm sm:px-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-display text-base font-bold text-slate-900 truncate sm:text-lg">
                    {currentPlayerName}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-sm font-bold text-slate-600 tabular-nums whitespace-nowrap">
                    Soal {questionIndex + 1}/{deck.length}
                  </span>
                  <span aria-hidden="true" className="hidden text-slate-300 sm:inline">·</span>
                  <span className="hidden text-xs font-bold text-emerald-700 sm:inline">
                    {activeScene.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:gap-5">
                  <div
                    className={`flex items-center gap-1 font-display text-sm font-bold tabular-nums sm:text-base ${
                      streak >= 2 ? 'text-orange-600' : 'text-slate-400'
                    }`}
                  >
                    <Flame
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        streak >= 2 ? 'fill-orange-500 text-orange-600' : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                    <span>Combo {streak}x</span>
                  </div>

                  <div
                    className={`flex items-center gap-1 font-display text-sm font-bold tabular-nums sm:text-base ${
                      timerSetting > 0 && timeLeft <= 10 ? 'text-rose-600' : 'text-slate-800'
                    }`}
                  >
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    <span>{timerSetting === 0 ? 'Santai' : `${timeLeft} dtk`}</span>
                  </div>

                  <div className="flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 font-display text-sm font-bold text-emerald-900 tabular-nums sm:text-lg">
                    <Award className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" aria-hidden="true" />
                    <span>{score}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center 3D Viewport stays completely unobstructed! */}
            <div className="flex-1" />

            {/* Bottom Control Dock (Collapsible for unobstructed 3D view) */}
            <div className="pointer-events-auto mx-auto flex w-full max-w-4xl flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  soundManager.playTap();
                  setDockCollapsed((p) => !p);
                }}
                className="touch-game inline-flex items-center gap-1.5 rounded-t-xl border-2 border-b-0 border-slate-200 bg-white/95 px-4 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {dockCollapsed ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Tampilkan Tombol</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Sembunyikan Panel</span>
                  </>
                )}
              </button>

              {!dockCollapsed && (
                <div className="w-full rounded-3xl border-2 border-slate-200 bg-white/95 p-3 shadow-xl sm:p-4">
                  {!feedback ? (
                    <div className="space-y-2.5">
                      {/* Item Name & Optional Clue Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-slate-500 sm:text-sm">Benda 3D:</span>
                          <h2
                            className="font-display font-bold text-slate-900"
                            style={{ fontSize: 'clamp(1.2rem, 2.4vw, 1.75rem)' }}
                          >
                            {currentItem.name}
                          </h2>
                        </div>

                        {!showHint ? (
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playTap();
                              setShowHint(true);
                            }}
                            className="touch-game inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-100 sm:text-sm cursor-pointer"
                          >
                            <HelpCircle className="h-4 w-4" aria-hidden="true" />
                            <span>Petunjuk</span>
                          </button>
                        ) : (
                          <div className="animate-pop-in rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-950 sm:text-sm">
                            {currentItem.hint}
                          </div>
                        )}
                      </div>

                      {/* 3 Giant Tactile Bin Tap Buttons */}
                      <div
                        className="grid grid-cols-3 gap-2 sm:gap-3"
                        role="group"
                        aria-label="Pilih tempat sampah"
                      >
                        {BIN_ORDER.map((cat) => {
                          const bin = BIN_CONFIGS[cat];
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleBinSelect(cat)}
                              className={`touch-game flex min-h-[68px] flex-col items-center justify-center rounded-2xl border-2 border-b-4 px-2 py-2 text-center transition-transform active:translate-y-0.5 sm:min-h-[76px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${bin.bgClass} ${bin.borderClass} ${bin.hoverBgClass}`}
                            >
                              <span
                                className={`font-display text-sm font-bold tracking-wide sm:text-lg ${bin.textClass}`}
                              >
                                {bin.shortTitle}
                              </span>
                              <span className="hidden text-xs font-semibold text-slate-700 sm:block">
                                {bin.subtitle}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Immediate Feedback & Educational Fact inside Bottom Dock */
                    <div className="animate-pop-in" role="status" aria-live="polite">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          {feedback.isCorrect ? (
                            <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" aria-hidden="true" />
                          ) : (
                            <XCircle className="mt-0.5 h-7 w-7 shrink-0 text-rose-600" aria-hidden="true" />
                          )}
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2
                                className={`font-display text-lg font-bold sm:text-2xl ${
                                  feedback.isCorrect ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                              >
                                {feedback.isCorrect
                                  ? `Tepat Sekali! +${feedback.pointsEarned} Poin`
                                  : `Masuk ke ${BIN_CONFIGS[feedback.item.category].title}`}
                              </h2>
                              {feedback.isCorrect && feedback.streakAfter >= 2 && (
                                <span className="font-display text-sm font-bold text-orange-600 sm:text-base">
                                  · Combo {feedback.streakAfter}x!
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm leading-snug text-slate-700 sm:text-base">
                              <strong className="font-bold text-slate-900">Fakta Edukasi: </strong>
                              {feedback.item.fact}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:min-w-[215px] sm:items-end">
                          <button
                            type="button"
                            onClick={advanceQuestion}
                            className="touch-game inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-800 bg-emerald-600 px-5 py-2.5 font-display text-base font-bold text-white transition-transform hover:bg-emerald-500 active:translate-y-0.5 whitespace-nowrap cursor-pointer"
                          >
                            <span>
                              {questionIndex + 1 >= deck.length ? 'Lihat Hasil' : 'Berikutnya'}
                            </span>
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </button>

                          <div className="w-full space-y-1">
                            <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-600 sm:text-xs">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                                <span>Otomatis lanjut jika diam</span>
                              </span>
                              <span className="font-display text-emerald-700 tabular-nums">
                                {feedbackSecondsLeft} dtk
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-[width] duration-700 ease-linear"
                                style={{ width: `${Math.max(0, (feedbackSecondsLeft / 5) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Bottom Smartboard Utility Row (Menu, Audio & Fullscreen reachable at the bottom) */}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={returnToMenu}
                      className="touch-game inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 sm:text-sm cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Kembali ke Menu</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={toggleSound}
                        aria-pressed={soundEnabled}
                        className={`touch-game inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold sm:text-sm cursor-pointer ${
                          soundEnabled
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                            : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {soundEnabled ? (
                          <Volume2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                        ) : (
                          <VolumeX className="h-4 w-4 text-slate-500" aria-hidden="true" />
                        )}
                        <span>{soundEnabled ? 'Suara Nyala' : 'Suara Mati'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        aria-pressed={isFullscreen}
                        className="touch-game inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 sm:text-sm cursor-pointer"
                      >
                        {isFullscreen ? (
                          <Minimize2 className="h-4 w-4 text-slate-700" aria-hidden="true" />
                        ) : (
                          <Maximize2 className="h-4 w-4 text-slate-700" aria-hidden="true" />
                        )}
                        <span>{isFullscreen ? 'Keluar Penuh' : 'Layar Penuh'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* TURN SUMMARY SCREEN — Fitted 2-column layout inside 100dvh, zero page scroll */}
        {activeTab === 'play' && stage === 'TURN_SUMMARY' && (
          <section className="pointer-events-auto mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col justify-center p-2.5 sm:p-5">
            <div className="animate-pop-in flex max-h-[94dvh] flex-col rounded-3xl border-2 border-slate-200 bg-white/95 p-4 shadow-xl sm:p-5">
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-3.5 md:grid-cols-12">
                {/* Left Column: Trophy, Appreciation, Metrics */}
                <div className="flex flex-col items-center justify-center text-center md:col-span-5">
                  <div className="flex items-center gap-3">
                    {!trophyLoadError ? (
                      <img
                        src={TROPHY_IMG_URL}
                        alt="Piala Juara Pilah Sampah"
                        referrerPolicy="no-referrer"
                        onError={() => setTrophyLoadError(true)}
                        className="h-16 w-16 rounded-2xl border-2 border-amber-200 object-cover shadow-sm sm:h-20 sm:w-20"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 sm:h-20 sm:w-20">
                        <Trophy className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
                      </div>
                    )}

                    <div className="text-left">
                      <div className="flex items-center gap-1" aria-label={`Meraih ${currentTier.stars} bintang`}>
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`h-5 w-5 sm:h-6 sm:w-6 ${
                              s <= currentTier.stars
                                ? 'fill-amber-400 text-amber-500'
                                : 'fill-slate-100 text-slate-300'
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <h1 className="mt-1 font-display text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
                        {currentTier.title}
                      </h1>
                      <p className="text-sm font-bold text-emerald-700 sm:text-base">
                        {currentPlayerName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 w-full text-left">
                    <CatTeacher
                      mood="proud"
                      message={`Hebat sekali, ${currentPlayerName}! ${currentTier.message}`}
                      compact
                    />
                  </div>

                  {/* Metrics Row */}
                  <div className="mt-2.5 grid w-full grid-cols-3 gap-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <div className="text-[11px] font-bold text-slate-500 sm:text-xs">Total Skor</div>
                      <div className="font-display text-xl font-bold text-emerald-700 tabular-nums sm:text-2xl">
                        {score}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <div className="text-[11px] font-bold text-slate-500 sm:text-xs">Tepat</div>
                      <div className="font-display text-xl font-bold text-slate-900 tabular-nums sm:text-2xl">
                        {currentCorrectCount}/{deck.length || questionsPerTurn}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <div className="text-[11px] font-bold text-slate-500 sm:text-xs">Combo</div>
                      <div className="font-display text-xl font-bold text-orange-600 tabular-nums sm:text-2xl">
                        {bestStreak}x
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Scroll-contained Review of Answers */}
                {answerHistory.length > 0 && (
                  <div className="flex min-h-0 flex-col border-t border-slate-100 pt-2.5 md:col-span-7 md:border-l md:border-t-0 md:pl-4 md:pt-0">
                    <h2 className="shrink-0 font-display text-sm font-bold text-slate-900 sm:text-base">
                      Catatan Belajar {currentPlayerName}
                    </h2>
                    <div className="mt-2 grid min-h-0 flex-1 grid-cols-2 content-start gap-1.5 overflow-y-auto pr-1">
                      {answerHistory.map((entry, idx) => (
                        <div
                          key={`${entry.item.id}-${idx}`}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-1.5"
                        >
                          <WasteIllustration itemId={entry.item.id} className="h-8 w-8 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                              {entry.item.name}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-600">
                              {BIN_CONFIGS[entry.item.category].shortTitle}
                            </div>
                          </div>
                          {entry.isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pinned Bottom Action Buttons */}
              <div className="mt-3 flex shrink-0 flex-wrap justify-center gap-2.5 border-t border-slate-100 pt-3">
                {playMode === 'classroom' && currentTurnIndex + 1 < activePlayers.length ? (
                  <button
                    type="button"
                    onClick={handleNextClassroomTurn}
                    className="touch-game inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-2.5 font-display text-base font-bold text-white transition-transform hover:bg-emerald-500 active:translate-y-0.5 sm:text-lg cursor-pointer"
                  >
                    <span>Giliran Berikutnya: {activePlayers[currentTurnIndex + 1]}</span>
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                ) : playMode === 'classroom' ? (
                  <button
                    type="button"
                    onClick={handleNextClassroomTurn}
                    className="touch-game inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-700 bg-amber-500 px-6 py-2.5 font-display text-base font-bold text-slate-950 transition-transform hover:bg-amber-400 active:translate-y-0.5 sm:text-lg cursor-pointer"
                  >
                    <Trophy className="h-5 w-5" aria-hidden="true" />
                    <span>Lihat Podium Kelas</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playTap();
                      beginTurnPlay(0);
                    }}
                    className="touch-game inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-2.5 font-display text-base font-bold text-white transition-transform hover:bg-emerald-500 active:translate-y-0.5 sm:text-lg cursor-pointer"
                  >
                    <RotateCcw className="h-5 w-5" aria-hidden="true" />
                    <span>Main Lagi</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={returnToMenu}
                  className="touch-game inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:text-base cursor-pointer"
                >
                  Ubah Pengaturan
                </button>
              </div>
            </div>
          </section>
        )}

        {/* CLASSROOM PODIUM — Fitted inside 100dvh, zero page scroll */}
        {activeTab === 'play' && stage === 'CLASS_PODIUM' && (
          <section className="pointer-events-auto mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col justify-center p-2.5 sm:p-5">
            <div className="animate-pop-in flex max-h-[94dvh] flex-col rounded-3xl border-2 border-slate-200 bg-white/95 p-4 text-center shadow-xl sm:p-6">
              <div className="shrink-0">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <Trophy className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                  Semua Siswa Hebat Hari Ini!
                </h1>

                <div className="mt-2.5 text-left">
                  <CatTeacher
                    mood="proud"
                    message="Meow! Mr.Meow sangat bangga pada kalian semua! Ayo tepuk tangan bersama!"
                    compact
                  />
                </div>
              </div>

              <div className="mt-3 min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-200 text-left">
                {[...sessionTurnResults]
                  .sort((a, b) => b.score - a.score)
                  .map((res, idx) => (
                    <div
                      key={res.id}
                      className={`flex items-center justify-between gap-3 p-3 sm:px-4 ${
                        idx === 0 ? 'bg-amber-50/70' : 'bg-white'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-display text-sm font-bold text-slate-800 tabular-nums">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-display text-base font-bold text-slate-900 sm:text-lg">
                            {res.playerName}
                          </div>
                          <div className="text-xs font-semibold text-emerald-700">
                            {res.title} · Benar {res.correctCount}/{res.totalCount}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2.5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`h-4 w-4 ${
                                s <= res.stars
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'fill-slate-100 text-slate-300'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <span className="font-display text-lg font-bold text-slate-900 tabular-nums sm:text-xl">
                          {res.score}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-4 flex shrink-0 flex-wrap justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="touch-game inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-2.5 font-display text-base font-bold text-white transition-transform hover:bg-emerald-500 active:translate-y-0.5 sm:text-lg cursor-pointer"
                >
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                  <span>Main Putaran Baru</span>
                </button>
                <button
                  type="button"
                  onClick={returnToMenu}
                  className="touch-game inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:text-base cursor-pointer"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Smartboard Navigation Bar on Encyclopedia & Leaderboard pages */}
      {(activeTab === 'learn' || activeTab === 'leaderboard') && (
        <div className="pointer-events-auto relative z-30 shrink-0 border-t-2 border-slate-200 bg-white/95 px-3 py-2 shadow-lg sm:px-4">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playTap();
                  setActiveTab('play');
                }}
                className="touch-game inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 whitespace-nowrap sm:min-h-[42px] sm:px-4 sm:text-sm cursor-pointer"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                <span>Main 3D</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playTap();
                  setActiveTab('learn');
                }}
                className={`touch-game inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-bold whitespace-nowrap sm:min-h-[42px] sm:px-4 sm:text-sm cursor-pointer ${
                  activeTab === 'learn'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>Belajar Sampah</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playTap();
                  setActiveTab('leaderboard');
                }}
                className={`touch-game inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-bold whitespace-nowrap sm:min-h-[42px] sm:px-4 sm:text-sm cursor-pointer ${
                  activeTab === 'leaderboard'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Trophy className="h-4 w-4" aria-hidden="true" />
                <span>Papan Bintang</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={soundEnabled}
                className={`touch-game inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-bold whitespace-nowrap sm:min-h-[42px] sm:px-4 sm:text-sm cursor-pointer ${
                  soundEnabled
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4 text-slate-500" aria-hidden="true" />
                )}
                <span>{soundEnabled ? 'Suara Nyala' : 'Suara Mati'}</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-pressed={isFullscreen}
                className="touch-game inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 whitespace-nowrap sm:min-h-[42px] sm:px-4 sm:text-sm cursor-pointer"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4 text-slate-700" aria-hidden="true" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-slate-700" aria-hidden="true" />
                )}
                <span>{isFullscreen ? 'Keluar Penuh' : 'Layar Penuh'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
