import React, { useState } from "react";
import { TrendingUp, Clock, Globe2, AlertTriangle, Newspaper, Share2, Compass } from "lucide-react";
import { SearchCategory } from "../types";

interface NewsHubProps {
  onTriggerSearch: (query: string, category: SearchCategory) => void;
}

interface NewsItem {
  id: string;
  title: string;
  region: "APAC" | "EUROPE" | "AMER" | "UN";
  snippet: string;
  source: string;
  time: string;
  readTime: string;
}

const REGIONAL_NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "Global satellite lattice maps 98% of uncharted coastal zones",
    region: "UN",
    snippet: "International marine cartographers release high-precision microwave ocean models, exposing sand structures at depths greater than 40 meters.",
    source: "Atlas Science Weekly",
    time: "20 min ago",
    readTime: "3 min read"
  },
  {
    id: "news-2",
    title: "Japan debuts record-breaking geothermal power grid",
    region: "APAC",
    snippet: "Using micro-bore deep pressure channels, Hokkaido test facility generates zero-emission thermal energy, stabilizing 500,000 residential circuits.",
    source: "Tokyo Tech Journal",
    time: "1 hour ago",
    readTime: "5 min read"
  },
  {
    id: "news-3",
    title: "European Union expands digital-twin network for forestry logs",
    region: "EUROPE",
    snippet: "Sweden forest registers employ localized LiDAR drone grids, rendering interactive point-clouds of 8 million hectares for conservation studies.",
    source: "EU Forestry Policy",
    time: "3 hours ago",
    readTime: "4 min read"
  },
  {
    id: "news-4",
    title: "Brazil's solar corridor records milestone megawatt-hour peak",
    region: "AMER",
    snippet: "Equatorial grid expansion yields balanced current distribution, paving way for cross-continental energy share grids.",
    source: "Sud-Am Energy Review",
    time: "5 hours ago",
    readTime: "2 min read"
  },
  {
    id: "news-5",
    title: "Sub-polar atmosphere sensors indicate cooling thermals",
    region: "UN",
    snippet: "Polar research vessels report sudden wind alignment changes, creating cold jet currents that stabilize pressure gradients across the Pacific.",
    source: "Meteo Globe",
    time: "6 hours ago",
    readTime: "6 min read"
  },
  {
    id: "news-6",
    title: "India smart-city hub coordinates green infrastructure with AI",
    region: "APAC",
    snippet: "New Bangalore highway grids deploy real-time solar battery banks, reducing grid offsets by 18 percent during high load limits.",
    source: "Asia Green Build",
    time: "9 hours ago",
    readTime: "4 min read"
  }
];

const TRENDING_TAGS = [
  "Geothermal Cells",
  "Satellite Coastal Mapping",
  "Equatorial Solar Corridors",
  "Sub-polar Thermals",
  "LiDAR Point Cloud",
  "Antarctica Water Shelf",
  "Atlantic Salt Indices"
];

export const NewsHub: React.FC<NewsHubProps> = ({ onTriggerSearch }) => {
  const [activeTab, setActiveTab] = useState<"All" | "APAC" | "EUROPE" | "AMER" | "UN">("All");

  const filteredNews = activeTab === "All"
    ? REGIONAL_NEWS
    : REGIONAL_NEWS.filter(n => n.region === activeTab);

  return (
    <div className="bg-slate-950/60 border border-slate-900/80 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl" id="news-hub-panel">
      
      {/* Alert Header Banner */}
      <div className="bg-red-950/20 border border-red-500/30 p-2.5 rounded-xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[10px] font-mono font-bold text-red-400 tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> BREAKING ALERT
          </span>
          <span className="text-xs text-slate-300 font-medium line-clamp-1">
            Atmosphere jet-streams shift speeds by 12% across Equatorial meridian zone indices.
          </span>
        </div>
        <button
          onClick={() => onTriggerSearch("Equatorial Meridian Jet Stream shifts", "news")}
          className="text-[10px] font-mono text-red-400 hover:text-white underline cursor-pointer"
        >
          TRACE FOCUS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* News Feed left (8 columns) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-sans tracking-wide">
              <Newspaper className="h-4.5 w-4.5 text-cyan-400" />
              GLOBAL NEWSWIRE RECON
            </h3>
            <div className="flex gap-1 text-[11px] font-mono">
              {(["All", "UN", "APAC", "EUROPE", "AMER"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === tab
                      ? "bg-slate-900 border border-slate-800 text-cyan-400 font-semibold shadow-[0_0_8px_rgba(6,182,212,0.1)]"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNews.map((news) => (
              <div
                key={news.id}
                className="group p-4 bg-slate-950/80 border border-slate-900/80 hover:border-slate-800/80 rounded-xl relative hover:bg-slate-900/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-2">
                    <span className="flex items-center gap-1">
                      <Globe2 className="h-3 w-3 text-cyan-500" />
                      {news.region === "APAC" ? "Asia-Pacific Feed" :
                       news.region === "EUROPE" ? "European Feed" :
                       news.region === "AMER" ? "Americas Feed" : "Global Bulletin"}
                    </span>
                    <span>{news.time}</span>
                  </div>
                  <h4 className="text-xs md:text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                    {news.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mt-1.5 font-sans select-text">
                    {news.snippet}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="font-semibold text-slate-400">{news.source}</span>
                  <div className="flex items-center gap-2.5">
                    <span>{news.readTime}</span>
                    <button
                      onClick={() => onTriggerSearch(news.title, "news")}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5 font-bold cursor-pointer"
                    >
                      EXPLORE <Share2 className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Tags right (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl border border-slate-900/60 bg-slate-950/40">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2 font-mono tracking-wider uppercase mb-4">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              HOT SEARCH INTENTS
            </h4>
            <div className="space-y-2">
              {TRENDING_TAGS.map((tag, i) => (
                <button
                  key={i}
                  id={`news-trending-tag-${i}`}
                  onClick={() => onTriggerSearch(tag, "web")}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-950/80 border border-slate-900 hover:border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span className="text-[10px] font-mono text-cyan-500">#{i + 1}</span>
                    {tag}
                  </span>
                  <Compass className="h-3.5 w-3.5 text-slate-600 group-hover:text-cyan-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Informational Tip Card */}
          <div className="p-4 rounded-xl border border-cyan-900/20 bg-gradient-to-tr from-cyan-950/10 to-slate-950 text-xs text-slate-400 leading-relaxed font-sans shadow-inner">
            <span className="text-[10px] text-cyan-400 font-mono block mb-1">PRO-EXPLORER ADVISE</span>
            You can highlight any country node on the 3D Globe above to see dynamic news summaries and real-time localized weather updates instantly.
          </div>
        </div>

      </div>
    </div>
  );
};
