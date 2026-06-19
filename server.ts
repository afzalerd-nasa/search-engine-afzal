import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded model initialization for Gemini AI.
let aiInstance: GoogleGenAI | null = null;

function getGeminiAI(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not defined or is placeholder. Using smart simulated results.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiInstance;
}

// 1. Core Grounded search endpoint
app.post("/api/search", async (req, res) => {
  try {
    const { query, category = "web", mode = "ai" } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log(`Searching for: "${query}" in category: "${category}" [mode: ${mode}]`);
    const ai = getGeminiAI();

    if (ai) {
      try {
        // Build custom system and query prompt styling to match categories
        let promptModifier = "";
        let responseSchema = undefined;

        if (category === "news") {
          promptModifier = " Provide the latest news/articles related to this. Include headings, publish dates, and short summaries.";
        } else if (category === "images") {
          promptModifier = " Give detailed image/photo description suggestions, visual galleries list, or diagram specifications.";
        } else if (category === "maps") {
          promptModifier = " Provide geography details, places coordinates, physical locations, or transit facts.";
        } else if (category === "shopping") {
          promptModifier = " Give product listings, simulated price comparisons, buy options, ratings and product search details.";
        } else {
          promptModifier = " Deliver an informative, clear answer with logical steps or detailed summaries.";
        }

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Query: ${query}.${promptModifier} Return a comprehensive response in tidy Markdown. Include standard Markdown items like lists, headers, bold text and clean spacing.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const text = response.text || "No response text was generated.";
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const chunks = groundingMetadata?.groundingChunks || [];
        const webSearchQueries = groundingMetadata?.webSearchQueries || [];

        // Map chunks to consistent source items
        const citations = chunks.map((chunk: any, index: number) => {
          return {
            id: index + 1,
            title: chunk.web?.title || `Source ${index + 1}`,
            url: chunk.web?.uri || "#",
            snippet: chunk.web?.title || "Search Grounding Source"
          };
        });

        // Formulate procedural results to display side-by-side with AI response
        const mockResults = generateCategoryResults(query, category, citations);

        return res.json({
          aiAnswer: text,
          citations,
          webQueries: webSearchQueries,
          results: mockResults,
          isRealAI: true
        });
      } catch (geminiError: any) {
        console.error("Gemini API error, falling back to simulated results:", geminiError);
        const fallbackResults = generateSimulatedResponse(query, category);
        return res.json({
          ...fallbackResults,
          isRealAI: false,
          warning: "Gemini API experienced a temporary issue. Active simulated fallback mode applied."
        });
      }
    } else {
      // Key is not configured - Return simulation engine responses (gorgeous and intelligent structured data)
      const mockResponse = generateSimulatedResponse(query, category);
      return res.json({
        ...mockResponse,
        isRealAI: false,
        warning: "Connect your GEMINI_API_KEY via 'Settings > Secrets' for live Search Grounding."
      });
    }
  } catch (err: any) {
    console.error("Search API Error:", err);
    res.status(500).json({ error: err.message || "Internal Search failure" });
  }
});

// 2. Interactive Globe country information profile extractor
app.post("/api/explore-country", async (req, res) => {
  try {
    const { countryName, countryCode } = req.body;
    if (!countryName) {
      return res.status(400).json({ error: "Country name is required" });
    }

    console.log(`Exploring country profile for: ${countryName} (${countryCode})`);
    const ai = getGeminiAI();

    let textAnswer = "";
    let isRealAI = false;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Create a highly educational country focus briefing for country: "${countryName}". Include: 1) Brief historical summary, 2) National identity & cultural highlight, 3) Real-world scientific, environmental, or geographical fact, 4) Current initiatives or global impact in less than 350 words. Format with elegant markdown headings.`,
        });
        textAnswer = response.text || "";
        isRealAI = true;
      } catch (geminiErr) {
        console.error("Failed fetching country profile via Gemini:", geminiErr);
      }
    }

    // Always generate structured stats (population, gdp, capital, local dynamic info)
    const profile = getHistoricalCountryStats(countryName, countryCode, textAnswer);
    return res.json({
      profile,
      isRealAI
    });
  } catch (err: any) {
    console.error("Explore Country API Error:", err);
    res.status(500).json({ error: err.message || "Internal country exploration failure" });
  }
});

// Helpers to generate diverse structure categories results
function generateCategoryResults(query: string, category: string, citations: any[]): any[] {
  const list: any[] = [];
  const baseTitle = query.charAt(0).toUpperCase() + query.slice(1);

  // Seed with citations if we have them
  if (citations && citations.length > 0) {
    citations.forEach((c) => {
      list.push({
        title: c.title,
        url: c.url,
        snippet: `Grounded fact retrieved directly from official index: verification sources cite "${c.title}" for latest updates on ${query}.`,
        category,
        sourceName: new URL(c.url).hostname || "Web Source",
        publishDate: "Recent",
        rating: Math.floor(Math.random() * 2) + 4 // 4-5 stars
      });
    });
    return list;
  }

  // Pre-configured custom sources when no web citations returned
  const domains = [
    { name: "Global Wiki", host: "global.wikipedia.org" },
    { name: "Earth News Network", host: "earthnews.org" },
    { name: "Atlas Discovery", host: "atlasdiscovery.com" },
    { name: "Science Journal Today", host: "sciencejournal.org" }
  ];

  for (let i = 1; i <= 5; i++) {
    const d = domains[(i - 1) % domains.length];
    list.push({
      title: `${baseTitle} - Detailed Exploratory Report #${i}`,
      url: `https://${d.host}/search?q=${encodeURIComponent(query)}&id=${i}`,
      snippet: `Comprehensive review about ${query} addressing historical context, modern analysis, regional effects, and scientific insights. Read deeper into regional perspectives and trends.`,
      category,
      sourceName: d.name,
      publishDate: `June ${10 + i}, 2026`,
      rating: i % 2 === 0 ? 4.8 : 4.5
    });
  }

  return list;
}

// Generate premium simulated responses when Gemini API is unconfigured
function generateSimulatedResponse(query: string, category: string) {
  const baseTitle = query.charAt(0).toUpperCase() + query.slice(1);
  let aiAnswer = "";
  const results: any[] = [];

  // Generate intelligent AI Markdown Answers based on category
  if (category === "news") {
    aiAnswer = `### 📰 Latest News: ${baseTitle}\n\n* **Breaking: Global Developments on "${baseTitle}"**\n  Recent updates indicate a significant surge in global interest regarding **${query}** as researcher-consortiums present their findings at the International Summit.\n\n* **Regional Milestones**\n  Leaders in North America and Western Europe announce strategic initiatives to expand infrastructure and standards in light of modern scientific breakthroughs.\n\n* **Expert Prognosis**\n  "We are observing a paradigm shift," remarks Dr. Sylvia Vance, director of Atlas Policy Labs. "The transition is accelerating faster than predicted."`;
  } else if (category === "maps") {
    aiAnswer = `### 🗺️ Places & Coordinates: ${baseTitle}\n\n* **Primary Landmark Center**\n  Geographic coordinates for central **${baseTitle}** register approximately around \`34.0522° N, 118.2437° W\` (Standard Earth Grid Coordinates).\n\n* **Key Connecting Hubs**\n  - **The Meridian Hub**: Situated 1,200 km to the regional northeast (active altitude 320m above sea level).\n  - **Atmospheric Research Area**: Latitude \`51.5074° N\`, Longitude \`0.1278° W\`.\n\n* **Territorial Landscape**\n  Characterized by active microclimates, urban-coexistence indices, and responsive geographical watersheds.`;
  } else if (category === "shopping") {
    aiAnswer = `### 🛍️ Shopping Comparisons for "${baseTitle}"\n\nHere are top rated commercial items for **${query}** on the market:\n\n1. **GlobeSearch Professional Edition ${baseTitle}**\n   * Price: $149.99 (Retail MSRP)\n   * Rating: ⭐⭐⭐⭐☆ (4.9/5, 2,400 Reviews)\n   * Details: High durability shell, premium holographic coating, real-time sync.\n\n2. **Eco-Discovery Standard Pack**\n   * Price: $45.00\n   * Rating: ⭐⭐⭐⭐☆ (4.5/5, 890 Reviews)\n   * Details: 100% recycled materials, educational handbook included.`;
  } else if (category === "images") {
    aiAnswer = `### 🖼️ Visual Context Suggestions for "${baseTitle}"\n\n* **Theme 1: Orbit Perspective (Daylight)**\n  High-resolution satellite preview displaying beautiful oceanic currents, coastal geography, and dynamic white cloud spirals above **${query}** landmasses.\n\n* **Theme 2: City Grid Nocturnal**\n  Luminous urban networks showing glowing gold and amber highway paths, representing digital activity hubs and dynamic density maps.\n\n* **Theme 3: Modern Schematic**\n  Minimalist cyan-line vector drawing highlighting topographic elevation curves, oceanic depths, and flight network lines of the selected region.`;
  } else {
    aiAnswer = `### 🌐 Intelligent Overview: ${baseTitle}\n\n**${baseTitle}** represents a pivotal focal point in contemporary scientific, cultural, and environmental inquiries. \n\n#### Key Findings\n- **Atmospheric Dynamics**: Recent planetary observations reveal a close relationship between regional density layouts and urban activity.\n- **Socio-Economic Index**: Countries with advanced digital infrastructure report a 35% increase in accessibility when integrating global dataset maps.\n- **Future Horizon**: Enhanced visualization algorithms are projected to map over 98% of Earth's uncharted coastal zones by 2030, reinforcing structural preservation.\n\n#### Summary Information\nTo understand the deep impacts of **${query}**, modern search indices recommend cross-referencing topographic land registers, orbital satellite maps, and real-time community reports. Use GlobeSearch to explore these modules directly.`;
  }

  // Pre-fill results
  const domains = [
    { name: "Wikipedia Atlas", host: "en.wikipedia.org" },
    { name: "Atlas Obscura", host: "www.atlasobscura.com" },
    { name: "NASA Earth Observatory", host: "earthobservatory.nasa.gov" },
    { name: "The Planetary Society", host: "www.planetary.org" },
    { name: "National Geographic", host: "www.nationalgeographic.com" }
  ];

  for (let i = 1; i <= 5; i++) {
    const d = domains[i - 1];
    results.push({
      title: `${baseTitle} - Comprehensive Scientific Survey & Case Study #${i}`,
      url: `https://${d.host}/wiki/${encodeURIComponent(query)}`,
      snippet: `Explore the absolute latest articles, historical background, geographic parameters, and future predictions on ${query}. Updated on standard client registries.`,
      category,
      sourceName: d.name,
      publishDate: `June ${12 - i}, 2026`,
      rating: (5.0 - (i * 0.1)).toFixed(1)
    });
  }

  const citations = [
    { id: 1, title: `${baseTitle} Global Registry`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`, snippet: "Primary global reference archive" },
    { id: 2, title: `Oceanographic & Geo-Sciences Journal`, url: `https://earthobservatory.nasa.gov`, snippet: "Spectral data and planetary recordings" }
  ];

  return {
    aiAnswer,
    results,
    citations,
    webQueries: [query, `${query} facts`, `${query} news`, `${query} maps`]
  };
}

// Generate country focus content
function getHistoricalCountryStats(name: string, code: string, textAnswer: string) {
  // Safe basic fallbacks
  const cap = name === "United States" ? "Washington D.C." :
              name === "Japan" ? "Tokyo" :
              name === "Germany" ? "Berlin" :
              name === "Brazil" ? "Brasília" :
              name === "Australia" ? "Canberra" :
              name === "United Kingdom" ? "London" :
              name === "India" ? "New Delhi" :
              name === "Canada" ? "Ottawa" : "Metropolis Central";

  const pop = name === "United States" ? "333 Million" :
              name === "Japan" ? "125 Million" :
              name === "Germany" ? "84 Million" :
              name === "Brazil" ? "215 Million" :
              name === "Australia" ? "26 Million" :
              name === "United Kingdom" ? "67 Million" :
              name === "India" ? "1.4 Billion" :
              name === "Canada" ? "39 Million" : "45 Million";

  const regName = name === "United States" || name === "Canada" ? "North America" :
                  name === "Japan" || name === "India" ? "Asia-Pacific" :
                  name === "Germany" || name === "United Kingdom" ? "Europe" :
                  name === "Brazil" ? "South America" :
                  name === "Australia" ? "Oceania" : "Global Equator";

  const gdp = name === "United States" ? "$25.4 Trillion" :
              name === "Japan" ? "$4.2 Trillion" :
              name === "Germany" ? "$4.0 Trillion" :
              name === "Brazil" ? "$1.9 Trillion" :
              name === "Australia" ? "$1.7 Trillion" :
              name === "United Kingdom" ? "$3.1 Trillion" :
              name === "India" ? "$3.4 Trillion" :
              name === "Canada" ? "$2.1 Trillion" : "$850 Billion";

  const co2 = name === "United States" ? "14.2 tons" :
              name === "Japan" ? "8.5 tons" :
              name === "Germany" ? "7.7 tons" :
              name === "Brazil" ? "2.1 tons" :
              name === "Australia" ? "15.4 tons" :
              name === "United Kingdom" ? "4.5 tons" :
              name === "India" ? "1.9 tons" :
              name === "Canada" ? "14.1 tons" : "3.8 tons";

  const net = name === "United States" ? "91.8%" :
              name === "Japan" ? "93.0%" :
              name === "Germany" ? "94.2%" :
              name === "Brazil" ? "81.3%" :
              name === "Australia" ? "91.0%" :
              name === "United Kingdom" ? "94.9%" :
              name === "India" ? "48.7%" :
              name === "Canada" ? "92.5%" : "78.4%";

  const dynamicInfo = textAnswer || `### 🌐 Overview of ${name}\n\n${name} stands as an influential sovereign state within the ${regName} region. It maintains vital partnerships, strong environmental policies, and robust technological contributions.\n\n#### Key Characteristics\n* **Capital City**: ${cap}\n* **Active Population**: ${pop}\n* **Technological Infrastructure**: Rapid development of sustainability measures and smart cities is currently transforming urban zones. See further updates in the news feed.`;

  return {
    name,
    code,
    capital: cap,
    population: pop,
    region: regName,
    gdp,
    co2,
    internetAccess: net,
    lifeExpectancy: name === "Japan" ? "84.6 Years" : name === "Germany" ? "81.2 Years" : "79.1 Years",
    dynamicInfo,
    trendingNews: [
      { epoch: "Trending Now", text: `${name} launches milestone renewable initiative for energy grid.` },
      { epoch: "Cultural Hub", text: `Major international arts festival returns to municipal center.` },
      { epoch: "Economic Brief", text: `Trade indicators report balanced tech imports and infrastructure investments.` }
    ],
    localWeather: {
      temp: name === "Australia" ? "24°C" : name === "Germany" ? "16°C" : "21°C",
      condition: name === "Brazil" ? "Tropical Showers" : name === "Japan" ? "Partly Cloudy" : "Clear Skies",
      humidity: "62%",
      wind: "12 km/h"
    }
  };
}

// Vite development middleware vs. static build output router setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GlobeSearch server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
