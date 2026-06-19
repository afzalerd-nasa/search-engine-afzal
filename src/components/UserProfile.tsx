import React from "react";
import { User, History, Bookmark, Shield, Trash2, Award, ArrowUpRight, Compass, Moon, Sun } from "lucide-react";
import { SearchHistoryItem, SavedSearch, SearchCategory } from "../types";

interface UserProfileProps {
  history: SearchHistoryItem[];
  savedSearches: SavedSearch[];
  onClearHistory: () => void;
  onClearSaved: () => void;
  onRemoveHistoryItem: (id: string) => void;
  onRemoveSavedItem: (id: string) => void;
  onSelectQuery: (query: string, category: SearchCategory) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  history,
  savedSearches,
  onClearHistory,
  onClearSaved,
  onRemoveHistoryItem,
  onRemoveSavedItem,
  onSelectQuery,
  theme,
  onToggleTheme
}) => {
  // Compute user search statistics and score levels to gamify learning
  const totalQueries = history.length;
  const userXP = totalQueries * 15;
  const userLevel = Math.floor(userXP / 100) + 1;
  const nextLevelXP = userLevel * 100;
  const progressPercent = Math.min(100, Math.floor((userXP % 100) / nextLevelXP * 100));

  // Compute favorite category based on history
  const getFavoriteCategory = (): { name: string; count: number } => {
    if (history.length === 0) return { name: "Web Indexes", count: 0 };
    const counts: Record<string, number> = {};
    history.forEach((h) => {
      counts[h.category] = (counts[h.category] || 0) + 1;
    });
    let maxCat = "web";
    let maxVal = 0;
    Object.entries(counts).forEach(([k, v]) => {
      if (v > maxVal) {
        maxVal = v;
        maxCat = k;
      }
    });

    const labels: Record<string, string> = {
      web: "Web Exploration",
      ai: "AI Answer Synthesis",
      maps: "Spatial Coordinates",
      news: "Global Bulletins",
      images: "Visual Image Previews",
      videos: "Media Videos",
      shopping: "Commercial Shopping"
    };

    return { name: labels[maxCat] || "Web Indexes", count: maxVal };
  };

  const pref = getFavoriteCategory();

  // Dynamic recommendations depending on statistics
  const getDiagnostics = (): string[] => {
    if (history.length === 0) {
      return [
        "Search 'Deep Ocean Trenches' under News category",
        "Explore 'Thermonaline Circulation' inside Web category",
        "Click Germany node on the 3D globe to check national capital facts"
      ];
    }
    if (pref.name.includes("Coordinate") || pref.name.includes("Maps")) {
      return [
        "Review GPS elevation lines for Mariana Trench depth arrays",
        "Scan wind thermal changes near equatorial regions",
        "Click Brazil on the Earth backdrop to view climate profiles"
      ];
    }
    return [
      "Ask AI 'How does geothermal loops conserve city grid load?'",
      "Scan LiDAR point cloud registries in Germany forests",
      "Check breaking news updates on Equatorial Meridian shifts"
    ];
  };

  const suggestionsList = getDiagnostics();

  return (
    <div className="bg-slate-950/60 border border-slate-900/80 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl" id="user-profile-panel">
      
      {/* User accounts header and profile state */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-slate-900/60 pb-5 mb-5">
        
        {/* Officer graphic and badge (5 cols) */}
        <div className="md:col-span-5 flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-2xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 font-extrabold text-lg shadow-[0_0_12px_rgba(34,211,238,0.25)]">
            <User className="h-6 w-6" />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-cyan-500 rounded-full flex items-center justify-center text-[10px] text-slate-950 border border-slate-950 font-bold" title="XP Level">
              {userLevel}
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 font-sans tracking-wide">
              afzalerd@gmail.com
              <Shield className="h-3.5 w-3.5 text-cyan-400" title="Verified Officer" />
            </h3>
            <p className="text-[10px] text-cyan-400 font-mono tracking-wider font-semibold uppercase">
              Global Archivist Rank
            </p>
            <div className="text-[10px] text-slate-500 font-mono">
              Signed in via AI Studio authentication
            </div>
          </div>
        </div>

        {/* XP Progress metrics bar (5 cols) */}
        <div className="md:col-span-4 space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>ARCHIVE XP: {userXP} / {userLevel * 100}</span>
            <span>{progressPercent}% TO NEXT RANK</span>
          </div>
          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[9px] text-slate-500 font-sans leading-tight">
            Perform additional searches and explore country anchors to unlock advanced space cartography nodes.
          </p>
        </div>

        {/* Theme select controls (3 cols) */}
        <div className="md:col-span-3 flex md:justify-end gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            id="toggle-theme-btn"
            className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {theme === "dark" ? (
              <>
                <Moon className="h-4 w-4 text-cyan-400" />
                <span>Space Dark</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Solar Light</span>
              </>
            )}
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Saved Searches / Bookmarks (4 columns) */}
        <div className="lg:col-span-4 p-4 rounded-xl border border-slate-900 bg-slate-950/40 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 font-mono tracking-wider uppercase flex items-center gap-1.5">
              <Bookmark className="h-4 w-4 text-cyan-400" />
              SAVED DATA CLIPS ({savedSearches.length})
            </h4>
            {savedSearches.length > 0 && (
              <button
                type="button"
                onClick={onClearSaved}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Wipe saved lists"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {savedSearches.length === 0 ? (
              <div className="text-[11px] text-slate-600 font-sans italic text-center py-6">
                No saved web data clips. Click the bookmark icon inside search replies to clip items.
              </div>
            ) : (
              savedSearches.map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800 flex items-start justify-between group transition-all"
                >
                  <div
                    onClick={() => onSelectQuery(s.query, s.category)}
                    className="flex-grow cursor-pointer"
                  >
                    <span className="text-[8px] font-mono text-cyan-500 uppercase tracking-widest block font-bold mb-0.5">
                      {s.category} MATCH
                    </span>
                    <span className="text-xs font-bold text-slate-200 hover:text-cyan-400 truncate block">
                      {s.query}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 block leading-normal">
                      {s.titleSnippet}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSavedItem(s.id)}
                    className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* History Logger list (4 columns) */}
        <div className="lg:col-span-4 p-4 rounded-xl border border-slate-900 bg-slate-950/40 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 font-mono tracking-wider uppercase flex items-center gap-1.5">
              <History className="h-4 w-4 text-cyan-400" />
              ORBIT LOG HISTORY ({history.length})
            </h4>
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Wipe logging logs"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="text-[11px] text-slate-600 font-sans italic text-center py-6">
                Orbit search logs are currently empty.
              </div>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-900/60 hover:border-slate-850 flex items-center justify-between group transition-all"
                >
                  <button
                    type="button"
                    onClick={() => onSelectQuery(h.query, h.category)}
                    className="text-left flex-grow cursor-pointer truncate"
                  >
                    <p className="text-xs text-slate-300 font-medium truncate">
                      {h.query}
                    </p>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mt-0.5">
                      {h.category} • {h.timestamp}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveHistoryItem(h.id)}
                    className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Personalized recommendations diagnostic (4 columns) */}
        <div className="lg:col-span-4 p-4 rounded-xl border border-slate-900 bg-slate-950/40 space-y-3.5">
          <h4 className="text-xs font-bold text-slate-200 font-mono tracking-wider uppercase flex items-center gap-1.5">
            <Award className="h-4 w-4 text-cyan-400" />
            INTELLIGENT DIAGNOSTICS
          </h4>

          <div className="p-3 bg-slate-950 rounded-lg space-y-1 border border-slate-900">
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">FOCUS INTEREST INDEX</span>
            <div className="text-cyan-400 font-bold font-mono text-xs truncate">
              {pref.name}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Calculated dynamically: your profile emphasizes **{pref.name}** covering {pref.count} logging entries.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">CUSTOM RECOMMENDATIONS</span>
            {suggestionsList.map((s, idx) => (
              <button
                key={idx}
                id={`recommendation-item-${idx}`}
                onClick={() => onSelectQuery(s.replace(/explore\s'|ask\sAI\s'|search\s'|review\s|compare\s|scan\s|check\s|climate\s| Germany\sfactors/gi, "").trim(), "web")}
                className="w-full text-left p-2.5 rounded-lg bg-slate-900/40 hover:bg-slate-900 border border-slate-900/60 hover:border-slate-800 text-[11px] text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="truncate">{s}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-cyan-500 flex-shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
