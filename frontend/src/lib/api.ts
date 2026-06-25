import type {
  Bean,
  BeanCreate,
  BeanUpdate,
  Brew,
  BrewCreate,
  BrewUpdate,
  BrewParameter,
  RatingTrendPoint,
  CorrelationResult,
  SuggestionResult,
  ChatRequest,
  ChatResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.detail || `Request failed: ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const beansApi = {
  list: () => apiFetch<Bean[]>("/beans"),
  get: (id: number) => apiFetch<Bean>(`/beans/${id}`),
  create: (data: BeanCreate) =>
    apiFetch<Bean>("/beans", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: BeanUpdate) =>
    apiFetch<Bean>(`/beans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => apiFetch<void>(`/beans/${id}`, { method: "DELETE" }),
};

export const brewsApi = {
  list: () => apiFetch<Brew[]>("/brews"),
  get: (id: number) => apiFetch<Brew>(`/brews/${id}`),
  create: (data: BrewCreate) =>
    apiFetch<Brew>("/brews", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: BrewUpdate) =>
    apiFetch<Brew>(`/brews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => apiFetch<void>(`/brews/${id}`, { method: "DELETE" }),
};

export const brewParametersApi = {
  list: (brewId: number) =>
    apiFetch<BrewParameter[]>(`/brews/${brewId}/parameters`),
  create: (brewId: number, key: string, value: string) =>
    apiFetch<BrewParameter>(`/brews/${brewId}/parameters`, {
      method: "POST",
      body: JSON.stringify({ key, value }),
    }),
  delete: (brewId: number, parameterId: number) =>
    apiFetch<void>(`/brews/${brewId}/parameters/${parameterId}`, {
      method: "DELETE",
    }),
};

export const analyticsApi = {
  ratingTrend: () => apiFetch<RatingTrendPoint[]>("/analytics/rating-trend"),
  correlation: (beanId: number) =>
    apiFetch<CorrelationResult>(`/analytics/correlation/${beanId}`),
  suggest: (beanId: number) =>
    apiFetch<SuggestionResult>(`/analytics/suggest/${beanId}`),
};

export const chatApi = {
  send: (data: ChatRequest) =>
    apiFetch<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
