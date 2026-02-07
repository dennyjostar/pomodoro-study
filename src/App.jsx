import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, BarChart3, Clock, Flame, Music, Volume2, VolumeX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const WEEK_DATA = [
  { day: '월', minutes: 120 },
  { day: '화', minutes: 180 },
  { day: '수', minutes: 150 },
  { day: '목', minutes: 210 },
  { day: '금', minutes: 90 },
  { day: '토', minutes: 45 },
  { day: '일', minutes: 0 },
];

const SESSION_PRESETS = {
  25: { focus: 25, break: 5, longBreak: 20, label: "25분 집중하고 5분 쉬자" },
  50: { focus: 50, break: 10, longBreak: 30, label: "50분 집중하고 10분 쉬자" }
};

const THEMES = {
  pink: {
    name: '분홍',
    primary: 'bg-hotpink-500',
    text: 'text-hotpink-500',
    border: 'border-hotpink-500/30',
    glow: 'hotpink-glow',
    bg: 'bg-hotpink-500/20'
  },
  emerald: {
    name: '에메랄드',
    primary: 'bg-emerald-500',
    text: 'text-emerald-500',
    border: 'border-emerald-500/30',
    glow: 'emerald-glow', // Will add to CSS
    bg: 'bg-emerald-500/20'
  },
  indigo: {
    name: '인디고',
    primary: 'bg-indigo-500',
    text: 'text-indigo-500',
    border: 'border-indigo-500/30',
    glow: 'indigo-glow', // Will add to CSS
    bg: 'bg-indigo-500/20'
  }
};

export default function App() {
  const [theme, setTheme] = useState('pink');
  const [focusDuration, setFocusDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'break' | 'longBreak'
  const [cycleCount, setCycleCount] = useState(0); // Tracks current cycle (0-3)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const bgMusic = useRef(new Audio("https://stream.zeno.fm/0r0xa792kwzuv"));

  // Audio effects
  const playSound = (type) => {
    const audioContent = type === 'focus'
      ? "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" // Digital bell
      : "https://assets.mixkit.co/active_storage/sfx/1084/1084-preview.mp3"; // Success chime
    const audio = new Audio(audioContent);
    audio.play().catch(e => console.log("Audio play failed:", e));
  };

  const toggleTimer = () => setIsActive(!isActive);

  const toggleMusic = () => {
    if (isMusicPlaying) {
      bgMusic.current.pause();
    } else {
      bgMusic.current.volume = volume;
      bgMusic.current.play().catch(e => console.log("Music play failed:", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  // Sync volume changes
  useEffect(() => {
    if (bgMusic.current) {
      bgMusic.current.volume = volume;
    }
  }, [volume]);

  // Music visibility & cleanup
  useEffect(() => {
    const audio = bgMusic.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (mode === 'focus') {
      setTimeLeft(focusDuration * 60);
    } else if (mode === 'break') {
      setTimeLeft(SESSION_PRESETS[focusDuration].break * 60);
    } else {
      setTimeLeft(SESSION_PRESETS[focusDuration].longBreak * 60);
    }
  }, [mode, focusDuration]);

  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'focus') {
      setTimeLeft(focusDuration * 60);
    } else if (newMode === 'break') {
      setTimeLeft(SESSION_PRESETS[focusDuration].break * 60);
    } else {
      setTimeLeft(SESSION_PRESETS[focusDuration].longBreak * 60);
    }
  }, [focusDuration]);

  const handleFocusDurationChange = (duration) => {
    setFocusDuration(duration);
    setIsActive(false);
    setMode('focus');
    setTimeLeft(duration * 60);
    setCycleCount(0);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setTimeout(() => {
        setIsActive(false);
        if (mode === 'focus') {
          const nextCycle = cycleCount + 1;
          playSound('focus');

          if (nextCycle === 4) {
            setMode('longBreak');
            setTimeLeft(SESSION_PRESETS[focusDuration].longBreak * 60);
            setCycleCount(0);
            alert("4회 집중 완료! 이제 15~30분 푹 쉬세요.");
          } else {
            setMode('break');
            setTimeLeft(SESSION_PRESETS[focusDuration].break * 60);
            setCycleCount(nextCycle);
            alert("집중 완료! 5분간 휴식하세요.");
          }
        } else {
          setMode('focus');
          setTimeLeft(focusDuration * 60);
          playSound('break');
          alert("휴업 종료! 다시 시작합시다.");
        }
      }, 0);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, cycleCount, focusDuration]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (
    mode === 'focus' ? focusDuration * 60 :
      mode === 'break' ? SESSION_PRESETS[focusDuration].break * 60 :
        SESSION_PRESETS[focusDuration].longBreak * 60
  )) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      {/* Header */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 flex-shrink-0", THEMES[theme].primary, THEMES[theme].glow)}>
            <Clock className="text-white w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className={cn("text-2xl font-black tracking-tight text-white transition-all duration-500", THEMES[theme].glow)}>포모도로스터디</h1>
            <p className="text-slate-500 text-[10px] font-semibold italic">4회 집중 후 20분간 긴 휴식!</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mr-1">색 선택</span>
              <div className="flex gap-2">
                {Object.entries(THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={cn(
                      "w-5 h-5 rounded-full border border-white/20 transition-all",
                      t.primary,
                      theme === key ? "scale-125 border-white ring-4 ring-white/10" : "opacity-40 hover:opacity-100"
                    )}
                    title={t.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
              <button
                onClick={toggleMusic}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-500",
                  isMusicPlaying ? cn(THEMES[theme].bg, THEMES[theme].text) : "bg-white/5 hover:bg-white/10 text-slate-400"
                )}
              >
                {isMusicPlaying ? (
                  <div className="flex items-end gap-0.5 h-3 mr-1">
                    <div className={cn("w-0.5 rounded-full music-bar-1", THEMES[theme].primary)}></div>
                    <div className={cn("w-0.5 rounded-full music-bar-2", THEMES[theme].primary)}></div>
                    <div className={cn("w-0.5 rounded-full music-bar-3", THEMES[theme].primary)}></div>
                  </div>
                ) : <VolumeX className="w-4 h-4" />}
                <span className="text-xs font-black uppercase tracking-widest">{isMusicPlaying ? "Playing" : "BGM OFF"}</span>
              </button>

              {isMusicPlaying && (
                <div className="flex items-center gap-3 px-2 border-l border-white/10 animate-in fade-in slide-in-from-left-2">
                  <Volume2 className="w-3 h-3 text-slate-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className={cn("w-16 h-1 rounded-lg appearance-none cursor-pointer accent-current", THEMES[theme].text)}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-2xl border border-white/10 shadow-inner">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Current Progress</span>
              <span className="text-sm font-black text-white">{cycleCount}/4 Sessions</span>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timer Section */}
        <section className="glass rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Background Decorative Glow */}
          <div className={cn(
            "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] transition-colors duration-1000",
            mode === 'focus' ? cn(THEMES[theme].bg, "blur-[100px]") : "bg-cyan-500/20 blur-[100px]"
          )} />

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-8 relative z-10">
            <button
              onClick={() => switchMode('focus')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium",
                mode === 'focus' ? cn(THEMES[theme].primary, "text-white shadow-lg") : "text-slate-400 hover:text-white"
              )}
            >
              <Target className="w-4 h-4" /> Focus
            </button>
            <button
              onClick={() => switchMode('break')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium",
                mode === 'break' ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30" : "text-slate-400 hover:text-white"
              )}
            >
              <Coffee className="w-4 h-4" /> Break
            </button>
            <button
              onClick={() => switchMode('longBreak')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium",
                mode === 'longBreak' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" : "text-slate-400 hover:text-white"
              )}
            >
              <RotateCcw className="w-4 h-4" /> Long
            </button>
          </div>

          {/* Session Preset Selector */}
          <div className="flex flex-col items-center mb-8 relative z-10 w-full">
            <div className="flex gap-3 bg-white/5 p-1.5 rounded-xl border border-white/5 mb-3">
              {[25, 50].map((d) => (
                <button
                  key={d}
                  onClick={() => handleFocusDurationChange(d)}
                  className={cn(
                    "px-6 py-1.5 rounded-lg text-sm font-bold transition-all",
                    focusDuration === d
                      ? cn(THEMES[theme].primary, "text-white shadow-lg")
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {d}m
                </button>
              ))}
            </div>
            <p className={cn("text-xs font-bold animate-pulse-slow", THEMES[theme].text)}>
              {SESSION_PRESETS[focusDuration].label}
            </p>
          </div>

          <div className="relative mb-12">
            <svg className="w-64 h-64 -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                className="stroke-white/5"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                className={cn(
                  "transition-all duration-1000 stroke-current",
                  mode === 'focus' ? THEMES[theme].text :
                    mode === 'break' ? "text-cyan-500" : "text-amber-500"
                )}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={753.6}
                strokeDashoffset={753.6 * (progress / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "text-7xl font-black tabular-nums transition-all duration-500",
                mode === 'focus' ? THEMES[theme].glow :
                  mode === 'break' ? "text-cyan-400" : "text-amber-400"
              )}>
                {formatTime(timeLeft)}
              </span>
              <span className="text-slate-500 font-medium uppercase tracking-widest text-xs mt-2">
                {mode === 'focus' ? 'Stay Focused' : mode === 'break' ? 'Short Break' : 'Long Break'}
              </span>
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <button
              onClick={toggleTimer}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-xl",
                isActive
                  ? "bg-slate-700 text-white"
                  : mode === 'focus' ? cn(THEMES[theme].primary, "text-white") :
                    mode === 'break' ? "bg-cyan-500 text-white shadow-cyan-500/20" : "bg-amber-500 text-white shadow-amber-500/20"
              )}
            >
              {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <button
              onClick={resetTimer}
              className="w-16 h-16 rounded-full glass flex items-center justify-center transition-all hover:bg-white/10"
            >
              <RotateCcw className="w-7 h-7 text-slate-400" />
            </button>
          </div>
        </section>

        {/* Stats Section */}
        <div className="flex flex-col gap-8">
          <section className="glass rounded-[2rem] p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <BarChart3 className={cn("w-6 h-6", THEMES[theme].text)} />
                <h2 className="text-xl font-bold">Weekly Performance</h2>
              </div>
              <span className="text-slate-500 text-sm font-medium">Last 7 Days</span>
            </div>

            <div className="flex-1 min-h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEK_DATA}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                    dy={12}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#ff337f' }}
                  />
                  <Bar
                    dataKey="minutes"
                    radius={[6, 6, 6, 6]}
                    barSize={24}
                  >
                    {WEEK_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.minutes > 150 ? (theme === 'pink' ? '#ff337f' : theme === 'emerald' ? '#10b981' : '#6366f1') : 'rgba(255,255,255,0.1)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Focus</p>
                <p className="text-2xl font-bold">12.5 <span className="text-sm font-normal text-slate-400">hrs</span></p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Daily Avg</p>
                <p className="text-2xl font-bold">112 <span className="text-sm font-normal text-slate-400">min</span></p>
              </div>
            </div>
          </section>

          <div className="glass rounded-[2rem] p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Flame className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium whitespace-nowrap">당신은 오늘도 정말 멋집니다</p>
                <p className="font-bold text-white whitespace-nowrap">상위 5%의 열정을 보여주고 계세요</p>
              </div>
            </div>
            <button className={cn("font-bold hover:underline text-sm px-4 py-2 rounded-xl transition-colors", THEMES[theme].text)}>
              성과 공유하기
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-slate-500 text-sm font-medium">
        Built with <span className={THEMES[theme].text}>❤️</span> by Kodari for the Visionary CEO
      </footer>
    </div>
  );
}
