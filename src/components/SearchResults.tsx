import React, { useState } from "react";
import {
  Globe,
  Compass,
  Star,
  MapPin,
  ExternalLink,
  BookOpen,
  Play,
  ShoppingBag,
  Clock,
  Sparkles,
  Bookmark,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { SearchResponse, SearchResultItem, SearchCitation, SearchCategory } from "../types";

interface SearchResultsProps {
  response: SearchResponse;
  category: SearchCategory;
  query: string;
  onSaveSearch: (query: string, snippet: string) => void;
  isSaved: boolean;
}

// Light custom markdown formatter for clean rendering without external react-markdown library
const formatMarkdown = (text: string) => {
  if (!text) return null;

  const lines = text.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("###")) {
      return (
        <h4 key={idx} className="text-base md:text-lg font-bold text-cyan-400 mt-5 mb-2.5 font-sans tracking-tight">
          {trimmed.replace("###", "").trim()}
        </h4>
      );
    }
    if (trimmed.startsWith("##")) {
      return (
        <h3 key={idx} className="text-lg md:text-xl font-bold text-slate-100 mt-6 mb-3 border-b border-slate-800/80 pb-1.5 font-sans">
          {trimmed.replace("##", "").trim()}
        </h3>
      );
    }
    if (trimmed.startsWith("#")) {
      return (
        <h2 key={idx} className="text-xl md:text-2xl font-extrabold text-white mt-8 mb-4 font-sans">
          {trimmed.replace("#", "").trim()}
        </h2>
      );
    }

    // Unordered list items
    if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
      const parsedText = parseInlineStyles(trimmed.substring(1).trim());
      return (
        <li key={idx} className="ml-5 list-disc text-slate-300 text-sm leading-relaxed mb-1.5 pl-1.5 list-image-none">
          {parsedText}
        </li>
      );
    }

    // Number list items
    const numMatch = trimmed.match(/^\d+\.\s(.*)/);
    if (numMatch) {
      const parsedText = parseInlineStyles(numMatch[1].trim());
      return (
        <li key={idx} className="ml-5 list-decimal text-slate-300 text-sm leading-relaxed mb-1.5 pl-1.5">
          {parsedText}
        </li>
      );
    }

    // Regular line / Paragraph
    if (trimmed) {
      return (
        <p key={idx} className="text-slate-300 text-sm leading-relaxed mb-4">
          {parseInlineStyles(trimmed)}
        </p>
      );
    }

    // Empty spacers
    return <div key={idx} className="h-2" />;
  });
};

// Simple parser for inline double asterisks **bold** and backticks `code`
const parseInlineStyles = (text: string) => {
  const parts: React.ReactNode[] = [];
  let currentWordStr = text;

  // Pattern match helper
  let index = 0;
  while (currentWordStr.length > 0) {
    const boldStart = currentWordStr.indexOf("**");
    const codeStart = currentWordStr.indexOf("`");

    // Case 1: Bold is found first
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
    // Case 2: Code block ticks found first
    else if (codeStart !== -1 && (boldStart === -1 || codeStart < boldStart)) {
      if (codeStart > 0) {
        parts.push(currentWordStr.substring(0, codeStart));
      }
      const codeEnd = currentWordStr.indexOf("`", codeStart + 1);
      if (codeEnd !== -1) {
        const codeText = currentWordStr.substring(codeStart + 1, codeEnd);
        parts.push(
          <code key={index++} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-cyan-300 rounded text-xs font-mono">
            {codeText}
          </code>
        );
        currentWordStr = currentWordStr.substring(codeEnd + 1);
      } else {
        parts.push(currentWordStr.substring(codeStart));
        currentWordStr = "";
      }
    }
    // Case 3: Simple text left
    else {
      parts.push(currentWordStr);
      currentWordStr = "";
    }
  }

  return parts.length > 0 ? parts : text;
};

export const SearchResults: React.FC<SearchResultsProps> = ({
  response,
  category,
  query,
  onSaveSearch,
  isSaved
}) => {
  const { aiAnswer, citations, results, isRealAI, warning } = response;
  const [activeTab, setActiveTab] = useState<"all" | "media" | "citations">(isRealAI ? "all" : "all");

  const formattedAiAnswer = formatMarkdown(aiAnswer);

  // Dynamic suggestion accordion
  const simulatedQuestions = [
    `How does ${query} compare globally?`,
    `What are the historical roots of ${query}?`,
    `Who are the primary authorities or research bodies detailing ${query}?`
  ];

  return (
    <div className="w-full space-y-6" id="search-results-panel">
      {/* Search status warning if un-configured API key */}
      {warning && (
        <div className="bg-amber-950/20 border border-amber-800/40 p-3.5 rounded-xl flex items-start gap-3 backdrop-blur-md">
          <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300">
            <span className="font-semibold block mb-0.5">Holographic Simulated Response</span>
            {warning}
          </div>
        </div>
      )}

      {/* Main layout grid - split screen for high fidelity details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: AI-Grounded Intelligent answer and details (7/12 width) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-950/60 border border-slate-900/80 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl select-text">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-cyan-950/80 flex items-center justify-center border border-cyan-800/60 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans tracking-wide">GlobeSearch Intelligent Answer</h3>
                  <p className="text-[10px] text-slate-500 font-mono tracking-wider">
                    {isRealAI ? "GROUNDED COGNITIVE INTENSITY" : "OFFLINE HOLO-MODEL GENERATION"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSaveSearch(query, aiAnswer.substring(0, 80) + "...")}
                className={`p-2 rounded-xl border transition-all ${
                  isSaved
                    ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800"
                }`}
                title={isSaved ? "Saved to Profile" : "Save Search to History"}
              >
                <Bookmark className="h-4 w-4" />
              </button>
            </div>

            {/* AI parsed output */}
            <div className="prose prose-invert max-w-none text-slate-300">
              {formattedAiAnswer}
            </div>
            
            {/* Real Search Cited sources row */}
            {citations && citations.length > 0 && (
              <div className="mt-6 border-t border-slate-900/60 pt-4">
                <span className="text-[10px] text-slate-500 font-mono tracking-wider block mb-2.5 uppercase">
                  VERIFICTOR SOURCES CITATIONS
                </span>
                <div className="flex flex-wrap gap-2">
                  {citations.map((c) => (
                    <a
                      key={c.id}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800/60 hover:bg-slate-800/80 text-cyan-400 hover:text-cyan-300 text-xs transition-all flex items-center gap-1 font-mono hover:scale-103"
                    >
                      <Globe className="h-3 w-3" />
                      [{c.id}] {c.title.slice(0, 22)}{c.title.length > 22 && "..."}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related Explorations accordion section */}
          <div className="bg-slate-950/30 border border-slate-900/50 rounded-2xl p-4 backdrop-blur-md">
            <h4 className="text-xs text-slate-400 font-mono tracking-wider uppercase mb-3 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-cyan-500" />
              PEOPLE ALSO GLOBALLY DISCOVERED
            </h4>
            <div className="space-y-2">
              {simulatedQuestions.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className="p-3 bg-slate-950/80 border border-slate-900/60 rounded-xl flex items-center justify-between text-sm text-slate-300 hover:text-white hover:border-slate-800 transition-all duration-200"
                >
                  <span className="font-medium">{q}</span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Structured Category Results Panel (5/12 width) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950/60 border border-slate-900/80 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col h-full min-h-[400px]">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-3 mb-4">
              <span className="text-xs font-bold text-slate-200 font-sans tracking-wide uppercase flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                {category.toUpperCase()} INDEX REGISTER
              </span>
              <span className="bg-slate-900 text-slate-500 border border-slate-800/80 text-[10px] font-mono px-2 py-0.5 rounded">
                {results.length} records available
              </span>
            </div>

            {/* 1. Category Specific view layouts */}

            {/* WEB SEARCH VIEW */}
            {category === "web" && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {results.map((r, idx) => (
                  <div key={idx} className="group p-3.5 rounded-xl bg-slate-950/90 border border-slate-900/60 hover:border-slate-800/80 hover:bg-slate-900/40 transition-all duration-300 shadow-md">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] text-slate-500 font-mono tracking-wider bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                        {r.sourceName}
                      </span>
                      {r.rating && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-current" />
                          {r.rating}
                        </span>
                      )}
                    </div>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group-hover:underline underline-offset-3"
                    >
                      {r.title}
                      <ExternalLink className="h-3 w-3 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1.5 select-text">
                      {r.snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* MAPS VIEW */}
            {category === "maps" && (
              <div className="space-y-4">
                <div className="border border-cyan-900/50 bg-cyan-950/15 p-4 rounded-xl flex items-start gap-3.5 backdrop-blur-sm">
                  <MapPin className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <h4 className="text-xs font-mono text-cyan-300 font-semibold uppercase tracking-wider">Spatial GPS Reference</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Query matches geographic parameters on Earth's coordinate matrix: centered on <span className="font-mono text-cyan-100 font-bold bg-slate-900 px-1 py-0.5 rounded">34.0522° N, 118.2437° W</span>.
                    </p>
                  </div>
                </div>

                {results.map((r, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/90 border border-slate-900/60 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider">GEOGRAPHIC POINT MATCH</span>
                    <h5 className="text-xs font-semibold text-slate-200 mt-1">{r.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{r.snippet}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Coordinates: Active Grid Map</span>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-0.5">
                        VIEW MAP <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NEWS VIEW */}
            {category === "news" && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {results.map((r, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-950 hover:bg-slate-900/25 border-slate-905 transition-all">
                    <div className="flex items-center justify-between text-[10px] mb-2 font-mono">
                      <span className="bg-amber-950/40 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40 uppercase">
                        {r.sourceName}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {r.publishDate}
                      </span>
                    </div>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-200 hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                      {r.title}
                    </a>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {r.snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* SHOPPING VIEW */}
            {category === "shopping" && (
              <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {results.map((r, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950/90 border border-slate-900/60 hover:border-slate-800 rounded-xl flex gap-3">
                    <div className="h-14 w-14 rounded-lg bg-slate-900 flex-shrink-0 flex items-center justify-center border border-slate-800 select-none text-slate-600 font-mono text-xl">
                      📦
                    </div>
                    <div className="flex-grow space-y-1">
                      <h5 className="text-xs font-bold text-slate-200 leading-tight">{r.title}</h5>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{r.snippet}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-mono font-bold text-cyan-400">
                          {idx === 0 ? "$149.99" : idx === 1 ? "$45.00" : "$89.50"}
                        </span>
                        <button
                          type="button"
                          onClick={() => alert(`Purchase sequence loaded: checking retail stores for '${r.title}'`)}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-200 px-2.5 py-1 rounded font-medium flex items-center gap-1 hover:scale-103 cursor-pointer"
                        >
                          <ShoppingBag className="h-3 w-3 text-cyan-400" /> BUY OFFER
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* IMAGES VIEW */}
            {category === "images" && (
              <div className="grid grid-cols-2 gap-3">
                {results.slice(0, 4).map((r, idx) => (
                  <div key={idx} className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden aspect-video flex flex-col justify-end p-2.5">
                    {/* Beautiful procedural visual geometric pattern corresponding to index */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/70 to-slate-950 -z-10" />
                    <div className="absolute inset-0 opacity-10 flex flex-wrap gap-1 rotate-12 -z-20">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                      ))}
                    </div>
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[8px] font-mono text-cyan-400">
                      SAT-PREVIEW
                    </div>
                    <h5 className="text-[10px] font-bold text-slate-200 line-clamp-1 leading-snug group-hover:text-cyan-400 transition-colors">
                      {idx === 0 ? "Orbit Elevation" : idx === 1 ? "Nocturnal Lights" : idx === 2 ? "Atmosphere Gradient" : "Global Matrix Elevation"}
                    </h5>
                    <span className="text-[8px] font-mono text-slate-500 block">
                      1024 x 1024 • JPG
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* VIDEOS VIEW */}
            {category === "videos" && (
              <div className="space-y-3">
                {results.slice(0, 3).map((r, idx) => (
                  <div key={idx} className="flex gap-3 bg-slate-950/90 border border-slate-900/60 hover:border-slate-800/80 p-2.5 rounded-xl transition-all">
                    <div className="relative h-16 w-28 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-cyan-950/20" />
                      <Play className="h-5 w-5 text-cyan-400 fill-current animate-pulse" />
                      <span className="absolute bottom-1 right-1 px-1 rounded bg-slate-950/90 text-[9px] font-mono text-slate-400">
                        {idx === 0 ? "5:12" : idx === 1 ? "12:15" : "3:40"}
                      </span>
                    </div>
                    <div className="flex-grow space-y-1">
                      <h5 className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug">
                        {idx === 0 ? "Introductory Physics & Earth Core Exploration" : idx === 1 ? "Simulating City High-Tension Light Corridors" : "Scanning Topography & Atmosphere Volumetrics"}
                      </h5>
                      <span className="text-[9px] font-mono text-slate-500 block">
                        HD 2.5K • Globe Science Channel
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI EXPLORER FALLBACK */}
            {category === "ai" && (
              <div className="space-y-4">
                <div className="border border-indigo-900/40 bg-indigo-950/15 p-4 rounded-xl flex items-start gap-4">
                  <div className="h-7 w-7 rounded-lg bg-indigo-900/20 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                    💡
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-indigo-300 block mb-0.5">Explore Multi-Model Cognition</span>
                    Select different query categories directly to filter or explore country panels at the center of the viewport to trigger focus stats.
                  </div>
                </div>

                {results.slice(0, 3).map((r, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/20 border border-slate-950 rounded-lg">
                    <h5 className="text-xs font-semibold text-cyan-400">{r.title}</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{r.snippet}</p>
                  </div>
                ))}
              </div>
            )}

            {/* DOCUMENTS MODE */}
            {category === "documents" && (
              <div className="space-y-3">
                {results.slice(0, 3).map((r, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/90 border border-slate-900/60 rounded-xl leading-relaxed">
                    <span className="text-[9px] font-mono text-teal-400 block mb-1">DATA REGISTER SHEET / PDF</span>
                    <h5 className="text-xs font-bold text-slate-200 line-clamp-1">{r.title}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{r.snippet}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
