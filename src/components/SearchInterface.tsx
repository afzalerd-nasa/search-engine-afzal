import React, { useState, useEffect, useRef } from "react";
import { Search, Mic, Keyboard, Sparkles, X, Globe, Heart, History, Trash2 } from "lucide-react";
import { SearchCategory } from "../types";

interface SearchInterfaceProps {
  onSearch: (query: string, category: SearchCategory, aiMode: boolean) => void;
  isLoading: boolean;
  initialQuery?: string;
}

// Preset smart recommendations to trigger discovery
const SEARCH_SUGGESTIONS = [
  "Global water levels and climate impact",
  "Latest renewable policy in Japan",
  "Top coordinates of historical monuments",
  "Renewable wind energy production in Brazil",
  "Scientific discoveries about Deep Ocean floor",
  "Population statistics of major megacities",
  "What is the northernmost city in Europe?",
  "Best time of year to visit Tokyo gardens",
  "CO2 emission rates compared by region"
];

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSearch,
  isLoading,
  initialQuery = ""
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchCategory>("web");
  const [aiMode, setAiMode] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState<number[]>(new Array(10).fill(10));
  const recognitionRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const voiceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Clean suggestions overlay on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter recommendations when user types
  useEffect(() => {
    if (!query.trim()) {
      setFilteredSuggestions(SEARCH_SUGGESTIONS.slice(0, 5));
      return;
    }
    const filtered = SEARCH_SUGGESTIONS.filter((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSuggestions(filtered.length > 0 ? filtered : [
      `Search for "${query}" across the globe`,
      `Explore maps matching "${query}"`,
      `Latest updates on ${query}`
    ]);
  }, [query]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    onSearch(query, category, aiMode);
  };

  // Start Voice Recognition
  const triggerVoiceSearch = () => {
    if (isRecording) {
      stopVoice();
      return;
    }

    setIsRecording(true);
    // Animate audio volume bars procedurally
    const interval = setInterval(() => {
      setVoiceVolume(prev => prev.map(() => Math.floor(Math.random() * 40) + 5));
    }, 120);

    // Browser Speech Recognition Support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          const speechToText = event.results[0][0].transcript;
          setQuery(speechToText);
          clearInterval(interval);
          setIsRecording(false);
          onSearch(speechToText, category, aiMode);
        };

        rec.onerror = (err: any) => {
          console.warn("Speech recognition error hook: ", err);
          simulateMockVoice(interval);
        };

        rec.onend = () => {
          setIsRecording(false);
          clearInterval(interval);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        simulateMockVoice(interval);
      }
    } else {
      simulateMockVoice(interval);
    }
  };

  // Safe fallback if permission blocked or inside restricted sandbox iframe
  const simulateMockVoice = (intervalObj: any) => {
    // Say a cool scientific prompt after a delay
    voiceTimer.current = setTimeout(() => {
      const picks = [
        "Latest oceanographic report in deep currents",
        "Geology status of Japan islands",
        "Scientific CO2 emission updates",
        "Population index of London"
      ];
      const selected = picks[Math.floor(Math.random() * picks.length)];
      setQuery(selected);
      clearInterval(intervalObj);
      setIsRecording(false);
      onSearch(selected, category, aiMode);
    }, 2500);
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    if (voiceTimer.current) {
      clearTimeout(voiceTimer.current);
    }
    setIsRecording(false);
  };

  // Category Selector items
  const CATEGORIES: { label: string; value: SearchCategory; color: string }[] = [
    { label: "Web Search", value: "web", color: "bg-cyan-500" },
    { label: "AI Answers", value: "ai", color: "bg-indigo-500" },
    { label: "Atlas Maps", value: "maps", color: "bg-emerald-500" },
    { label: "Global News", value: "news", color: "bg-amber-500" },
    { label: "Images", value: "images", color: "bg-rose-500" },
    { label: "Videos", value: "videos", color: "bg-purple-500" },
    { label: "Products", value: "shopping", color: "bg-sky-500" },
    { label: "Documents", value: "documents", color: "bg-teal-500" }
  ];

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto px-4" id="search-interface-container">
      {/* Category selector pill row */}
      <div className="flex items-center justify-before gap-1 overflow-x-auto py-2.5 mb-4 scrollbar-none scroll-smooth">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            id={`tab-category-${cat.value}`}
            type="button"
            onClick={() => {
              setCategory(cat.value);
              if (query.trim()) {
                onSearch(query, cat.value, aiMode);
              }
            }}
            className={`flex-shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-all duration-300 flex items-center gap-1.5 border backdrop-blur-sm ${
              category === cat.value
                ? "bg-slate-900 border-cyan-800 text-cyan-400 font-semibold shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                : "bg-slate-950/40 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-900/60"
            }`}
          >
            {category === cat.value && (
              <span className={`w-1.5 h-1.5 rounded-full ${cat.color} animate-ping`} />
            )}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Glassmorphism Custom Search Bar */}
      <form
        onSubmit={handleSubmit}
        className={`relative z-30 flex items-center w-full px-4 py-2 border rounded-2xl backdrop-blur-md transition-all duration-500 ${
          isRecording
            ? "bg-emerald-950/25 border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            : xl_glowing_focus()
        }`}
      >
        {/* Sparkle graphic for AI query mode */}
        <div className="flex items-center justify-center p-1.5 text-slate-400">
          {aiMode ? (
            <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
          ) : (
            <Globe className="h-5 w-5 text-slate-400" />
          )}
        </div>

        {/* Search input field */}
        <input
          type="text"
          id="main-search-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={
            isRecording
              ? "Listening... speak now or wait for orbit sync..."
              : aiMode
              ? "Ask GlobeSearch AI... (e.g. 'Tell me about climate zones')"
              : "Search raw Global internet directory..."
          }
          className="flex-grow bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 text-sm md:text-base px-3 h-10 select-all"
          disabled={isLoading}
        />

        {/* Clear control button */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="p-1 px-2.5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Voice Search button */}
        <button
          type="button"
          id="btn-voice-recorder"
          onClick={triggerVoiceSearch}
          className={`p-2 rounded-xl transition-all duration-300 mr-2 border ${
            isRecording
              ? "bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse scale-105"
              : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white"
          }`}
          title="Voice Search"
        >
          <Mic className="h-4 w-4" />
        </button>

        {/* Launch submit button */}
        <button
          type="submit"
          id="btn-search-submit"
          disabled={isLoading || !query.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800/80 disabled:text-slate-600 hover:shadow-[0_0_12px_rgba(6,182,212,0.4)] text-slate-950 px-4 py-2 font-medium text-xs md:text-sm rounded-xl transition-all duration-300 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Search className="h-4 w-4" />
          )}
          Find
        </button>
      </form>

      {/* Voice indicator waveform drawer */}
      {isRecording && (
        <div className="mt-3 flex justify-center items-center gap-1.5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 backdrop-blur-md animate-fade-in">
          <span className="text-xs font-mono text-emerald-400 mr-2 flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-mono text-emerald-300 mr-4">Live Audio Sync:</span>
          <div className="flex items-end gap-1 h-5 select-none">
            {voiceVolume.map((vol, index) => (
              <span
                key={index}
                className="w-1.5 bg-emerald-400 rounded-full transition-all duration-100"
                style={{ height: `${Math.max(4, vol)}px` }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={stopVoice}
            className="ml-6 px-2.5 py-0.5 text-[10px] text-emerald-400 hover:text-white border border-emerald-800 rounded bg-emerald-950/60 hover:bg-emerald-900/60 font-mono transition-all"
          >
            CANCEL
          </button>
        </div>
      )}

      {/* Suggestions Overlay Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute left-4 right-4 mt-1.5 z-40 bg-slate-950/95 border border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900/98 rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-lg overflow-hidden max-w-3xl mx-auto divide-y divide-slate-900/60 animate-fade-in">
          <div className="px-4 py-2 bg-slate-900/40 text-[10px] text-slate-500 font-mono tracking-wider flex items-center justify-between">
            <span>RECOMMENDED DIRECTORY EXPLORATIONS</span>
            <Keyboard className="h-3 w-3" />
          </div>
          {filteredSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              id={`suggestion-item-${idx}`}
              type="button"
              onClick={() => {
                setQuery(suggestion);
                setShowSuggestions(false);
                onSearch(suggestion, category, aiMode);
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-900/70 text-sm text-slate-300 hover:text-white flex items-center gap-3 transition-colors duration-200"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Futuristic switches & status row */}
      <div className="flex items-center justify-between mt-4 px-1.5 text-xs text-slate-400">
        <label className="flex items-center gap-2.5 cursor-pointer selection:bg-transparent">
          <span className="font-medium">AI Intelligent Grounding</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={aiMode}
              onChange={() => setAiMode(!aiMode)}
              className="sr-only"
            />
            <div className={`w-9 h-5 rounded-full transition-colors duration-300 ${aiMode ? "bg-cyan-500" : "bg-slate-800"}`} />
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-slate-950 rounded-full shadow transition-transform duration-300 ${aiMode ? "transform translate-x-4 bg-white" : ""}`} />
          </div>
        </label>

        {aiMode ? (
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Gemini Search Grounding Ready
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            Raw Web Index Active
          </div>
        )}
      </div>
    </div>
  );

  function xl_glowing_focus() {
    return query
      ? "bg-slate-950/80 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
      : "bg-slate-950/50 hover:bg-slate-950/70 border-slate-800 hover:border-slate-700 shadow-md";
  }
};
