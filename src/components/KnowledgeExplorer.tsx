import React, { useState } from "react";
import { BookOpen, Compass, ChevronRight, Sparkles, Sliders, Globe, Layers, Eye } from "lucide-react";
import { SearchCategory } from "../types";

interface KnowledgeExplorerProps {
  onTriggerSearch: (query: string, category: SearchCategory) => void;
}

interface FactSheet {
  title: string;
  category: string;
  preview: string;
  scientificFact: string;
  historicalEvent: string;
  depthAltitude: string;
}

const FACT_SHEETS: FactSheet[] = [
  {
    title: "Thermohaline Deep Ocean Circulation",
    category: "PALEONTOLOGY & GEO-SCIENCE",
    preview: "Global ocean currents behave as a massive thermal belt moving hot equatorial current pools to polar regions.",
    scientificFact: "Atlantic ocean currents flow at dynamic speeds of 10-15 cm/s. Cooling anomalies indicate a possible 18% slowing of deep water drops, affecting fishing limits.",
    historicalEvent: "Initially identified in 1957 by Dr. Henry Stommel, mapping deep temperature layers on US Atlantic expeditions.",
    depthAltitude: "-4,000m to Ocean Surface"
  },
  {
    title: "Planetary Magnetosphere Protection Shield",
    category: "SPACE PHYSICS",
    preview: "Earth's active spinning liquid-iron core generates magnetic shields, deflecting high energetic solar winds.",
    scientificFact: " deflects solar radiation flares traveling up to 3 million km/h, preventing complete atmospheric depletion and ozone destruction.",
    historicalEvent: "Discovered by solar arrays in 1958 via Explorer 1 Geiger counters, establishing the Van Allen radiation arcs.",
    depthAltitude: "+60,000km altitude"
  },
  {
    title: "Icelandic Volcano Mid-Ocean Ridge Channels",
    category: "TECTONICS & GEOTHERMICS",
    preview: "Magmatic fissures separate tectonic structures, continuously forging new oceanic rock beds.",
    scientificFact: "Mid-Atlantic ridges expand by approximately 2.5 centimeters yearly, continuously altering underwater bathymetric coordinate heights.",
    historicalEvent: "Discovered during the 1953 mapping of subsea telephone cables, confirming Alfred Wegener's continental movement theories.",
    depthAltitude: "-2,500m sea level height"
  }
];

export const KnowledgeExplorer: React.FC<KnowledgeExplorerProps> = ({ onTriggerSearch }) => {
  const [selectedSheet, setSelectedSheet] = useState<FactSheet>(FACT_SHEETS[0]);
  
  // Custom Atmosphere Altitude Sandbox simulator state
  const [sandboxAltitude, setSandboxAltitude] = useState<number>(3000); // meters

  // Get reactive stats depending on chosen height
  const getAtmosMetrics = (h: number) => {
    if (h < 0) {
      // oceanic depths
      const pressureAtm = Math.abs(h / 10).toFixed(0);
      return {
        zone: "Bathyal Oceanic Depth",
        temp: "2.4°C",
        pressure: `${pressureAtm} atm`,
        radiation: "Filtered (99.99%)",
        desc: "Luminous hydrothermal thermal chambers, zero sunlight index."
      };
    } else if (h <= 1000) {
      return {
        zone: "Low Elevation Coastal Grid",
        temp: "15.0°C",
        pressure: "1.0 atm",
        radiation: "Normal (UVA Filtered)",
        desc: "90% of global biosphere, dense urban high-tension corridors."
      };
    } else if (h <= 5000) {
      return {
        zone: "Montane Mountain Watershed",
        temp: "4.5°C",
        pressure: "0.6 atm",
        radiation: "Mild UV exposure",
        desc: "Characterized by thin glacier belts, dynamic precipitation reservoirs."
      };
    } else {
      return {
        zone: "Lower Mesosphere & Stratosphere Boundary",
        temp: "-56.5°C",
        pressure: "0.05 atm",
        radiation: "High Ionizing Flux",
        desc: "Atmosphere density drops past 99% threshold. Cosmic satellite lane."
      };
    }
  };

  const metrics = getAtmosMetrics(sandboxAltitude);

  return (
    <div className="bg-slate-950/60 border border-slate-900/80 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl" id="knowledge-explorer-panel">
      
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-slate-950 pb-3.5 mb-5">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-sans tracking-wide">
          <BookOpen className="h-4.5 w-4.5 text-cyan-400" />
          KNOWLEDGE EXPLORER STATION
        </h3>
        <span className="text-[10px] text-slate-500 font-mono tracking-wider bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded">
          ENCYCLOPEDIC ARCHIVE MATRIX
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Sandbox telemetry simulator (5 columns) */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-slate-900 bg-slate-950/40 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 tracking-wider font-mono uppercase flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-cyan-400" />
              ALTITUDE SOUNDING SANDBOX
            </h4>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-1.5 py-0.5 rounded">
              INTERACTIVE TELEMETRY
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Slide the height sensor probe from oceans' extreme trenches to sub-orbit lines to query dynamic Earth atmospheric metrics procedurally:
          </p>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Target Level:</span>
              <span className="text-cyan-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">
                {sandboxAltitude >= 0 ? `+${sandboxAltitude} meters` : `${sandboxAltitude} meters (Subsea)`}
              </span>
            </div>
            
            <input
              type="range"
              min="-10000"
              max="20000"
              step="500"
              value={sandboxAltitude}
              onChange={(e) => setSandboxAltitude(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            
            <div className="flex justify-between text-[9px] text-slate-600 font-mono">
              <span>Mariana (-10km)</span>
              <span>Sea Level (0)</span>
              <span>Sub-Orbit (+20km)</span>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="p-3.5 bg-slate-950 rounded-lg space-y-2 border border-slate-900">
            <div className="text-[9px] text-cyan-500 font-mono tracking-widest uppercase">PROBE ENVIRONMENT TELEMETRY</div>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-1 px-2 rounded bg-slate-900/40 border border-slate-900/60">
                <span className="text-slate-500 block text-[9px]">ATMOSPHERE ZONE</span>
                <span className="text-slate-200 font-semibold truncate block">{metrics.zone}</span>
              </div>
              <div className="p-1 px-2 rounded bg-slate-900/40 border border-slate-900/60">
                <span className="text-slate-500 block text-[9px]">LOCAL TEMPERATURE</span>
                <span className="text-slate-200 font-semibold">{metrics.temp}</span>
              </div>
              <div className="p-1 px-2 rounded bg-slate-900/40 border border-slate-900/60">
                <span className="text-slate-500 block text-[9px]">HYDRO/BARO PRESSURE</span>
                <span className="text-cyan-400 font-bold">{metrics.pressure}</span>
              </div>
              <div className="p-1 px-2 rounded bg-slate-900/40 border border-slate-900/60">
                <span className="text-slate-500 block text-[9px]">SOLAR RADIATION FLUX</span>
                <span className="text-slate-200 font-semibold">{metrics.radiation}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-2 pt-1 border-t border-slate-900/60">
              <span className="font-bold text-slate-300">Description:</span> {metrics.desc}
            </p>

            <button
              onClick={() => onTriggerSearch(`${metrics.zone} physical properties`, "web")}
              className="w-full mt-2 py-1.5 rounded bg-slate-900 border border-slate-850 hover:border-slate-700 hover:bg-slate-800 text-[10px] text-slate-300 hover:text-white font-mono tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" /> DEEP SEARCH GRID DETAILS
            </button>
          </div>
        </div>

        {/* Right: Fact sheets bookshelf list (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
            {FACT_SHEETS.map((sheet, index) => (
              <button
                key={index}
                onClick={() => setSelectedSheet(sheet)}
                className={`flex-shrink-0 px-3.5 py-2 text-xs font-medium rounded-xl border transition-all ${
                  selectedSheet.title === sheet.title
                    ? "bg-slate-950 border-cyan-800 text-cyan-400 font-bold shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                    : "bg-slate-950/20 hover:bg-slate-900/40 text-slate-500 hover:border-slate-800 hover:text-slate-300 border-transparent"
                }`}
              >
                {sheet.title.split(" ")[0]} ...
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-900 select-text relative">
            <span className="text-[9px] text-cyan-400 font-mono tracking-widest bg-cyan-950/40 border border-cyan-800/20 px-2.5 py-0.5 rounded-full uppercase">
              {selectedSheet.category}
            </span>
            <span className="absolute top-4 right-4 text-[10px] font-mono text-slate-500">
              Range: {selectedSheet.depthAltitude}
            </span>

            <h4 className="text-sm md:text-base font-bold text-slate-100 mt-3 font-sans">
              {selectedSheet.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-2 select-text font-medium">
              {selectedSheet.preview}
            </p>

            <div className="mt-4 pt-3.5 border-t border-slate-900/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">SCIENTIFIC OBSERVED FACT</span>
                <p className="text-slate-400 leading-relaxed select-text">{selectedSheet.scientificFact}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">MILESTONE GEOGRAPHICAL MILESTONE</span>
                <p className="text-slate-400 leading-relaxed select-text">{selectedSheet.historicalEvent}</p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-900/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Verified Atlas Register Index</span>
              <button
                onClick={() => onTriggerSearch(selectedSheet.title, "ai")}
                className="bg-cyan-500 hover:bg-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] text-slate-950 text-xs px-4 py-2 font-medium rounded-xl transition-all duration-300 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" /> ACTIVATE AI RESEARCH
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
