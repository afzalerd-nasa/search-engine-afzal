export type SearchCategory =
  | "web"
  | "images"
  | "videos"
  | "news"
  | "maps"
  | "shopping"
  | "ai"
  | "documents";

export interface SearchCitation {
  id: number;
  title: string;
  url: string;
  snippet: string;
}

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  category: string;
  sourceName: string;
  publishDate: string;
  rating?: string | number;
}

export interface SearchResponse {
  aiAnswer: string;
  citations: SearchCitation[];
  webQueries: string[];
  results: SearchResultItem[];
  isRealAI: boolean;
  warning?: string;
}

export interface CountryProfile {
  name: string;
  code: string;
  capital: string;
  population: string;
  region: string;
  gdp: string;
  co2: string;
  internetAccess: string;
  lifeExpectancy: string;
  dynamicInfo: string;
  trendingNews: { epoch: string; text: string }[];
  localWeather: {
    temp: string;
    condition: string;
    humidity: string;
    wind: string;
  };
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  category: SearchCategory;
  timestamp: string;
}

export interface SavedSearch {
  id: string;
  query: string;
  category: SearchCategory;
  timestamp: string;
  titleSnippet: string;
}
