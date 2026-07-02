export interface Bean {
  id: number;
  name: string;
  roaster: string | null;
  origin: string | null;
  continent: string | null;
  region: string | null;
  farm: string | null;
  variety: string | null;
  altitude: number | null;
  process: string | null;
  notes: string | null;
  roast_date: string | null;
  created_at: string;
}

export interface BeanCreate {
  name: string;
  roaster?: string | null;
  origin?: string | null;
  continent?: string | null;
  region?: string | null;
  farm?: string | null;
  variety?: string | null;
  altitude?: number | null;
  process?: string | null;
  notes?: string | null;
  roast_date?: string | null;
}

export interface BeanUpdate {
  name?: string;
  roaster?: string | null;
  origin?: string | null;
  continent?: string | null;
  region?: string | null;
  farm?: string | null;
  variety?: string | null;
  altitude?: number | null;
  process?: string | null;
  notes?: string | null;
  roast_date?: string | null;
}

export interface Brew {
  id: number;
  bean_id: number | null;
  brewed_at: string;
  grind_size: string | null;
  water_temp_celsius: string | null;
  coffee_grams: string | null;
  water_grams: string | null;
  bloom_time_seconds: number | null;
  total_time_seconds: number | null;
  rating: number | null;
  tasting_notes: string | null;
  brew_type: string | null;
  filter_type: string | null;
  ice_grams: number | null;
  created_at: string;
}

export interface BrewCreate {
  bean_id?: number | null;
  grind_size?: string | null;
  water_temp_celsius?: number | null;
  coffee_grams?: number | null;
  water_grams?: number | null;
  bloom_time_seconds?: number | null;
  total_time_seconds?: number | null;
  rating?: number | null;
  tasting_notes?: string | null;
  brew_type?: string | null;
  filter_type?: string | null;
  ice_grams?: number | null;
}

export interface BrewUpdate extends Partial<BrewCreate> {}

export interface BrewParameter {
  id: number;
  brew_id: number;
  key: string;
  value: string;
}

export interface RatingTrendPoint {
  brew_id: number;
  brewed_at: string;
  rating: number | null;
  bean_name: string | null;
}

export interface CorrelationResult {
  bean_id: number;
  bean_name: string;
  brew_count: number;
  correlations: Record<string, number | null>;
  best_brews: Record<string, unknown>[];
  message: string | null;
}

export interface SuggestionResult {
  bean_id: number;
  bean_name: string;
  brew_count: number;
  suggestion: Record<string, number> | null;
  based_on_brew_id: number | null;
  message: string;
}

export interface ChatRequest {
  session_id: string;
  message: string;
}

export interface ChatResponse {
  session_id: string;
  response: string;
}
