import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Compass,
  AlertCircle,
  Clock,
  Search,
  BookOpen,
  User,
  Sparkles,
  MapPin,
  TrendingUp,
  X,
  Share2,
  Bookmark,
  Activity,
  Award
} from "lucide-react";
import { EarthGlobe, COUNTRIES_DATABASE } from "./components/EarthGlobe";
import { SearchInterface } from "./components/SearchInterface";
import { SearchResults } from "./components/SearchResults";
import { NewsHub } from "./components/NewsHub";
import { KnowledgeExplorer } from "./components/KnowledgeExplorer";
import { UserProfile } from "./components/UserProfile";
import { SearchCategory, SearchHistoryItem, SavedSearch, SearchResponse } from "./types";

// Light custom markdown formatter for clean rendering without external react-markdown library
const formatMarkdown = (text: string) => {
  if (!text) return null;

  const lines = text.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("###")) {
      return (
        <h4 key={idx} className="text-sm font-bold text-cyan-400 mt-3 mb-1.5 font-sans">
          {trimmed.replace("###", "").trim()}
        </h4>
      );
    }
    if (trimmed.startsWith("##")) {
      return (
        <h3 key={idx} className="text-base font-bold text-slate-100 mt-4 mb-2 border-b border-slate-900 pb-1 font-sans">
          {trimmed.replace("##", "").trim()}
        </h3>
      );
    }
    if (trimmed.startsWith("#")) {
      return (
        <h2 key={idx} className="text-lg font-extrabold text-white mt-5 mb-2.5 font-sans">
          {trimmed.replace("#", "").trim()}
        </h2>
      );
    }

    // Unordered list items
    if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
      const parsedText = parseInlineStyles(trimmed.substring(1).trim());
      return (
        <li key={idx} className="ml-4 list-disc text-slate-300 text-xs leading-relaxed mb-1 pr-1">
          {parsedText}
        </li>
      );
    }

    // Number list items
    const numMatch = trimmed.match(/^\d+\.\s(.*)/);
    if (numMatch) {
      const parsedText = parseInlineStyles(numMatch[1].trim());
      return (
        <li key={idx} className="ml-4 list-decimal text-slate-300 text-xs leading-relaxed mb-1 pr-1">
          {parsedText}
        </li>
      );
    }

    // Regular line / Paragraph
    if (trimmed) {
      return (
        <p key={idx} className="text-slate-300 text-xs leading-relaxed mb-2.5">
          {parseInlineStyles(trimmed)}
        </p>
      );
    }

    // Empty spacers
    return <div key={idx} className="h-1.5" />;
  });
};

// Simple parser for inline double asterisks **bold** and backticks `code`
const parseInlineStyles = (text: string) => {
  const parts: React.ReactNode[] = [];
  let currentWordStr = text;

  let index = 0;
  while (currentWordStr.length > 0) {
    const boldStart = currentWordStr.indexOf("**");
    const codeStart = currentWordStr.indexOf("`");

    if (boldStart !== -1 && (codeStart === -1 || boldStart < codeStart)) {
      if (boldStart > 0) {
        parts.push(currentWordStr.substring(0, boldStart));
      }
      const boldEnd = currentWordStr.indexOf("**", boldStart + 2);
      if (boldEnd !== -1) {
        const boldText = currentWordStr.substring(boldStart + 2, boldEnd);
        parts.push(
          <strong key={index++} className="font-semibold text-cyan-200">
            {boldText}
          </strong>
        );
        currentWordStr = currentWordStr.substring(boldEnd + 2);
      } else {
        parts.push(currentWordStr.substring(boldStart));
        currentWordStr = "";
      }
    }
    else if (codeStart !== -1 && (boldStart === -1 || codeStart < boldStart)) {
      if (codeStart > 0) {
        parts.push(currentWordStr.substring(0, codeStart));
      }
      const codeEnd = currentWordStr.indexOf("`", codeStart + 1);
      if (codeEnd !== -1) {
        const codeText = currentWordStr.substring(codeStart + 1, codeEnd);
        parts.push(
          <code key={index++} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-cyan-300 rounded text-[11px] font-mono">
            {codeText}
          </code>
        );
        currentWordStr = currentWordStr.substring(codeEnd + 1);
      } else {
        parts.push(currentWordStr.substring(codeStart));
        currentWordStr = "";
      }
    }
    else {
      parts.push(currentWordStr);
      currentWordStr = "";
    }
  }

  return parts.length > 0 ? parts : text;
};

export default function App() {
  // Navigation active tabs: "home" representing Earth core search, or "news", "explorer", "profile" pages.
  const [activeTab, setActiveTab] = useState<"home" | "news" | "explorer" | "profile">("home");

  // Core Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("web");
  const [aiMode, setAiMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);

  // Selected Country / Globe Details
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [showCountryDrawer, setShowCountryDrawer] = useState(false);

  // User persistence trackers
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Local Time ticker
  const [currentTime, setCurrentTime] = useState("");

  // Sync state with local indices initially
  useEffect(() => {
    // 1. Restore History log
    const savedHist = localStorage.getItem("globesearch_history");
    if (savedHist) {
      try { setHistory(JSON.parse(savedHist)); } catch(e){}
    }
    
    // 2. Restore Saved entries
    const savedClips = localStorage.getItem("globesearch_saved_searches");
    if (savedClips) {
      try { setSavedSearches(JSON.parse(savedClips)); } catch(e){}
    }

    // 3. Restore Theme
    const storedTheme = localStorage.getItem("globesearch_theme");
    if (storedTheme === "light") {
      setTheme("light");
    }

    // 4. Time Ticker
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save changes to local registries
  const saveHistoryToLocal = (newHist: SearchHistoryItem[]) => {
    setHistory(newHist);
    localStorage.setItem("globesearch_history", JSON.stringify(newHist));
  };

  const saveClipsToLocal = (newClips: SavedSearch[]) => {
    setSavedSearches(newClips);
    localStorage.setItem("globesearch_saved_searches", JSON.stringify(newClips));
  };

  // Perform full search action
  const handlePerformSearch = async (query: string, searchCat: SearchCategory, useAI: boolean) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    setCategory(searchCat);
    setAiMode(useAI);
    setIsLoading(true);
    setActiveTab("home"); // Focus query panels in view
    setShowCountryDrawer(false); // Clear drawer if search triggered

    // Save history item
    const newItem: SearchHistoryItem = {
      id: Math.random().toString(),
      query,
      category: searchCat,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })
    };
    saveHistoryToLocal([newItem, ...history.slice(0, 19)]); // Max 20 log records

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category: searchCat, mode: useAI ? "ai" : "standard" })
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResponse(data);
      } else {
        throw new Error("Failure from server index query stream");
      }
    } catch (err) {
      console.error("Grounded Search experienced error:", err);
      // Fallback response with informative mock
      setSearchResponse({
        aiAnswer: `### 🌐 Search Error: ${query}\n\nWe encountered difficulty establishing secure live pipeline links. Please ensure credentials or network routes are clear.\n\n* **Diagnostic Tip**: Register your \`GEMINI_API_KEY\` inside the developer settings menu to enjoy live Search Grounding.`,
        citations: [],
        webQueries: [query],
        results: [],
        isRealAI: false,
        warning: "Temporary offline index connection. Check server port logs."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Country selected from Globe click
  const handleSelectCountry = (profile: any) => {
    setSelectedCountry(profile);
    setSelectedCountryCode(profile.code);
    setShowCountryDrawer(true);
  };

  // User bookmark toggle actions
  const handleSaveSearchClip = (q: string, snippet: string) => {
    const isAlreadySaved = savedSearches.find((s) => s.query.toLowerCase() === q.toLowerCase());
    if (isAlreadySaved) {
      // Remove
      const filtered = savedSearches.filter((s) => s.query.toLowerCase() !== q.toLowerCase());
      saveClipsToLocal(filtered);
    } else {
      // Add
      const newClip: SavedSearch = {
        id: Math.random().toString(),
        query: q,
        category,
        timestamp: new Date().toLocaleDateString("en-US"),
        titleSnippet: snippet
      };
      saveClipsToLocal([newClip, ...savedSearches]);
    }
  };

  // Profile cleanups triggers
  const handleClearHistory = () => {
    saveHistoryToLocal([]);
  };

  const handleClearSaved = () => {
    saveClipsToLocal([]);
  };

  const handleRemoveHistoryItem = (id: string) => {
    saveHistoryToLocal(history.filter(h => h.id !== id));
  };

  const handleRemoveSavedItem = (id: string) => {
    saveClipsToLocal(savedSearches.filter(s => s.id !== id));
  };

  // Trigger search from user recommendations or saved lists
  const handleTriggerQuickSearch = (query: string, searchCat: SearchCategory) => {
    handlePerformSearch(query, searchCat, true);
  };

  // Theme Toggler
  const handleToggleTheme = () => {
    const target = theme === "dark" ? "light" : "dark";
    setTheme(target);
    localStorage.setItem("globesearch_theme", target);
  };

  const isSearchQueryActive = searchQuery.trim().length > 0;
  const isSaved = savedSearches.some((s) => s.query.toLowerCase() === searchQuery.toLowerCase());

  return (
    <div className={`min-h-screen relative flex flex-col font-sans transition-colors duration-500 overflow-x-hidden ${
      theme === "dark"
        ? "bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200"
        : "bg-slate-100 text-slate-900 selection:bg-cyan-100 selection:text-cyan-900"
    }`} id="application-layout-root">

      {/* Futuristic Grid Line Backdrop overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.1),rgba(0,0,0,0))] pointer-events-none -z-40" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,20,38,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,20,38,0.05)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none -z-50" />

      {/* TOP HEADER NAVIGATION AND COMMAND */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md px-4 md:px-8 py-3.5 flex items-center justify-between ${
        theme === "dark"
          ? "bg-slate-950/80 border-slate-900/60"
          : "bg-white/80 border-slate-200"
      }`}>
        {/* Brand logo */}
        <button
          onClick={() => {
            setSearchQuery("");
            setSearchResponse(null);
            setSelectedCountry(null);
            setSelectedCountryCode(null);
            setShowCountryDrawer(false);
            setActiveTab("home");
          }}
          className="flex items-center gap-3 select-none text-left focus:outline-none hover:opacity-85 cursor-pointer"
        >
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse border border-cyan-400">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold tracking-wider font-sans uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
              GlobeSearch
            </h1>
            <p className="text-[9px] font-mono text-slate-500 tracking-widest font-bold">
              ORBITAL COGNITIVE EXPLORER
            </p>
          </div>
        </button>

        {/* Global Page Switcher tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/40 p-1 rounded-xl border border-slate-900/60 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("home")}
            id="nav-tab-search"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all uppercase flex items-center gap-1.5 cursor-pointer ${
              activeTab === "home"
                ? "bg-slate-950 text-cyan-400 border border-slate-800 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>
          
          <button
            onClick={() => setActiveTab("news")}
            id="nav-tab-news"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all uppercase flex items-center gap-1.5 cursor-pointer ${
              activeTab === "news"
                ? "bg-slate-950 text-cyan-400 border border-slate-800 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>News Core</span>
          </button>

          <button
            onClick={() => setActiveTab("explorer")}
            id="nav-tab-explorer"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all uppercase flex items-center gap-1.5 cursor-pointer ${
              activeTab === "explorer"
                ? "bg-slate-950 text-cyan-400 border border-slate-800 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Encyclopedia</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            id="nav-tab-profile"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all uppercase flex items-center gap-1.5 cursor-pointer ${
              activeTab === "profile"
                ? "bg-slate-950 text-cyan-400 border border-slate-800 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile</span>
          </button>
        </nav>

        {/* Local Clock metadata and telemetry metrics */}
        <div className="hidden lg:flex items-center gap-3 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-1.5 border border-slate-900 bg-slate-950/40 px-2.5 py-1 rounded-lg">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>LCTR-UTC: {currentTime || "SYSTEM OK"}</span>
          </div>
          <div className="h-3 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="System Live Ingress" />
        </div>
      </header>

      {/* CORE VIEWPORT BODY LAYOUT */}
      <main className="flex-grow flex flex-col px-4 md:px-8 py-6 max-w-7xl mx-auto w-full relative">
        
        {/* VIEW 1: HOME PAGE WITH EARTH GLOBE & FLOATING BAR */}
        {activeTab === "home" && (
          <div className="flex-grow flex flex-col space-y-6" id="home-view-container">
            
            {/* 3D Earth Globe container - only display at core index if search other categories isn't occupying screen space */}
            {!isSearchQueryActive && (
              <div className="w-full flex flex-col items-center">
                
                {/* Title introduction banner */}
                <div className="text-center max-w-2xl mx-auto mb-2 space-y-2 animate-fade-in">
                  <span className="text-[10px] bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 font-mono tracking-widest px-3 py-1 rounded-full uppercase inline-block">
                    🌌 SEARCH WITHOUT BORDERS
                  </span>
                  <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                    Explore Earth from Orbit
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 font-medium">
                    Analyze global telemetry facts, check weather forecasts, or ask AI about any geographic point. Click Country nodes to start the explorer.
                  </p>
                </div>

                {/* The 3D Interactive WebGL Globe */}
                <div className="w-full relative py-2">
                  <EarthGlobe
                    onSelectCountry={handleSelectCountry}
                    selectedCountryCode={selectedCountryCode}
                    selectedCountryName={selectedCountry ? selectedCountry.name : null}
                  />
                </div>
              </div>
            )}

            {/* Float-up standard/voice search interface */}
            <div className={`transition-all duration-500 ${isSearchQueryActive ? "pt-0" : "pt-2"}`}>
              <SearchInterface
                onSearch={handlePerformSearch}
                isLoading={isLoading}
                initialQuery={searchQuery}
              />
            </div>

            {/* Results Grid - renders when response returns */}
            {isLoading && (
              <div className="w-full flex flex-col items-center justify-center p-20 space-y-4">
                <div className="h-12 w-12 rounded-full border-4 border-slate-800 border-t-cyan-400 animate-spin" />
                <div className="text-center animate-pulse">
                  <h4 className="text-sm font-bold text-slate-100">Synchronizing Global Search Satellite...</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1">LATENCY SECTOR ACCORDING TO UTC CHANNELS • PLACING COGNITIVE CALLS</p>
                </div>
              </div>
            )}

            {!isLoading && searchResponse && (
              <div className="pt-4 animate-fade-in">
                <SearchResults
                  response={searchResponse}
                  category={category}
                  query={searchQuery}
                  onSaveSearch={handleSaveSearchClip}
                  isSaved={isSaved}
                />
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: NEWS HUB */}
        {activeTab === "news" && (
          <div className="animate-fade-in" id="news-view-container">
            <NewsHub onTriggerSearch={handleTriggerQuickSearch} />
          </div>
        )}

        {/* VIEW 3: KNOWLEDGE EXPLORER */}
        {activeTab === "explorer" && (
          <div className="animate-fade-in" id="explorer-view-container">
            <KnowledgeExplorer onTriggerSearch={handleTriggerQuickSearch} />
          </div>
        )}

        {/* VIEW 4: USER PROFILE SETTINGS */}
        {activeTab === "profile" && (
          <div className="animate-fade-in" id="profile-view-container">
            <UserProfile
              history={history}
              savedSearches={savedSearches}
              onClearHistory={handleClearHistory}
              onClearSaved={handleClearSaved}
              onRemoveHistoryItem={handleRemoveHistoryItem}
              onRemoveSavedItem={handleRemoveSavedItem}
              onSelectQuery={handleTriggerQuickSearch}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          </div>
        )}

      </main>

      {/* FLOATING GLASS DRAWER PANEL FOR SELECTED GLOBE COUNTRY DETAILS */}
      {showCountryDrawer && selectedCountry && (
        <div
          className="fixed inset-y-0 left-0 w-full sm:w-[410px] z-50 bg-slate-950/95 border-r border-slate-900/90 shadow-[20px_0_40px_rgba(0,0,0,0.7)] backdrop-blur-xl flex flex-col p-6 animate-slide-right select-text text-left pt-16 sm:pt-6"
          id="country-profile-drawer"
        >
          {/* Close control button */}
          <button
            type="button"
            onClick={() => {
              setShowCountryDrawer(false);
              setSelectedCountryCode(null);
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          {/* Drawer Header details */}
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 font-mono tracking-widest px-2.5 py-0.5 rounded-full uppercase">
                {selectedCountry.region} COORDINATE
              </span>
              <span className="text-xs font-mono text-slate-500">ISO Code: {selectedCountry.code}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-100 font-sans tracking-tight">
              {selectedCountry.name}
            </h3>
            <p className="text-xs text-slate-400">Capital City: <span className="text-slate-200 font-semibold">{selectedCountry.capital}</span></p>
          </div>

          {/* Core country stats grid */}
          <div className="grid grid-cols-2 gap-2.5 mt-5 font-mono text-xs text-slate-200">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-900 space-y-0.5">
              <span className="text-[9px] text-slate-500 uppercase tracking-wide block">POPULATION INDEX</span>
              <span className="font-bold text-slate-200">{selectedCountry.population}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-900 space-y-0.5">
              <span className="text-[9px] text-slate-500 uppercase tracking-wide block">GROSS PRODUCT (GDP)</span>
              <span className="font-bold text-slate-200">{selectedCountry.gdp}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-900 space-y-0.5">
              <span className="text-[9px] text-slate-500 uppercase tracking-wide block">CO2 CAPITA OFFSET</span>
              <span className="font-semibold text-slate-200">{selectedCountry.co2} / yr</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-900 space-y-0.5">
              <span className="text-[9px] text-slate-500 uppercase tracking-wide block">INTERNET CONNECTED</span>
              <span className="font-semibold text-emerald-400">{selectedCountry.internetAccess}</span>
            </div>
          </div>

          {/* Localized Weather Panel */}
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-cyan-950/20 to-slate-950 border border-cyan-900/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">
                {selectedCountry.localWeather.condition.includes("Clear") ? "☀️" :
                 selectedCountry.localWeather.condition.includes("Rain") || selectedCountry.localWeather.condition.includes("Showers") ? "🌧️" : "⛅"}
              </span>
              <div className="text-left font-sans text-xs">
                <span className="block font-bold text-slate-200">Local Forecast Bulletin</span>
                <span className="text-slate-400 text-[11px] font-mono leading-none">Condition: {selectedCountry.localWeather.condition}</span>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="block font-black text-cyan-400 text-sm leading-none">{selectedCountry.localWeather.temp}</span>
              <span className="text-[9px] text-slate-500 leading-none">Wind: {selectedCountry.localWeather.wind}</span>
            </div>
          </div>

          {/* Dynamic AI brief description summary */}
          <div className="mt-5 flex-grow overflow-y-auto pr-1 text-slate-300 border-t border-slate-900/60 pt-4 text-xs leading-relaxed space-y-3.5 select-text">
            <span className="text-[9px] text-cyan-400 font-mono tracking-widest block uppercase font-bold">EDUCATIONAL ATLAS NOTES</span>
            {formatMarkdown(selectedCountry.dynamicInfo)}

            {/* Trending Regional news in country */}
            {selectedCountry.trendingNews && (
              <div className="space-y-2 pt-2 border-t border-slate-900/40">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">REGIONAL CURRENT EVENTS</span>
                {selectedCountry.trendingNews.map((news: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-slate-900/30 text-[11px]">
                    <span className="text-cyan-400 font-mono font-bold text-[9px] block mb-0.5">{news.epoch}</span>
                    <p className="text-slate-300 leading-normal">{news.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Launch deep search direct trigger buttons */}
          <div className="mt-4 pt-3.5 border-t border-slate-900/60 space-y-2">
            <button
              onClick={() => {
                setShowCountryDrawer(false);
                handlePerformSearch(`${selectedCountry.name} active environmental initiatives`, "news", true);
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.35)] text-slate-950 font-medium py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" /> TRACE REGIONAL CLIMATE PROJECTS
            </button>
            <button
              onClick={() => {
                setShowCountryDrawer(false);
                handlePerformSearch(`${selectedCountry.name} travel recommendations, capital guide`, "web", false);
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white py-2 rounded-xl transition-all text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              CLASSIFIED INDEX SEARCH guide
            </button>
          </div>
        </div>
      )}

      {/* FOOTER METADATA */}
      <footer className={`mt-auto border-t text-center py-4 text-[11px] font-mono tracking-wider ${
        theme === "dark"
          ? "bg-slate-950/30 border-slate-900/40 text-slate-600"
          : "bg-slate-50 border-slate-100 text-slate-400"
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 GLOBESEARCH LABS. INTEGRATED SECURE WEB DATA CITATIONS AGENCY.</span>
          <span className="flex items-center gap-1">
            STATUS: ACTIVE SATELLITE INTERFEROMETRY <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-ping" />
          </span>
        </div>
      </footer>

    </div>
  );
}
