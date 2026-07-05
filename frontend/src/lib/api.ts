/**
 * Aivora Frontend API Client
 * Connects Next.js UI components to the FastAPI backend services.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  auth_provider?: string;
  is_active?: boolean;
  created_at?: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
  user: User;
}

export interface SubscriberResponse {
  id: string;
  email: string;
  subscribed_at?: string | null;
  is_active: boolean;
}

export interface InquiryResponse {
  id: string;
  email: string;
  name?: string | null;
  message?: string | null;
  status: string;
}

export interface StatsResponse {
  active_users: number;
  apps_connected: number;
  agents_online: number;
  tasks_automated: number;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("aivora_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.detail || "An unexpected API error occurred", response.status);
  }

  return data as T;
}

export const api = {
  // Authentication methods using advanced v1 full-stack endpoints
  async login(email: string, password: string): Promise<TokenResponse> {
    const res = await request<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== "undefined" && res.access_token) {
      localStorage.setItem("aivora_token", res.access_token);
      localStorage.setItem("aivora_user", JSON.stringify(res.user));
    }
    return res;
  },

  async signup(email: string, password: string, fullName?: string, firstName?: string, lastName?: string): Promise<TokenResponse> {
    const res = await request<TokenResponse>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName || `${firstName || ""} ${lastName || ""}`.trim() || undefined,
      }),
    });
    if (typeof window !== "undefined" && res.access_token) {
      localStorage.setItem("aivora_token", res.access_token);
      localStorage.setItem("aivora_user", JSON.stringify(res.user));
    }
    return res;
  },

  async socialLogin(provider: string, token: string): Promise<TokenResponse> {
    const res = await request<TokenResponse>(`/api/auth/${provider.toLowerCase()}`, {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    if (typeof window !== "undefined" && res.access_token) {
      localStorage.setItem("aivora_token", res.access_token);
      localStorage.setItem("aivora_user", JSON.stringify(res.user));
    }
    return res;
  },

  async forgotPassword(email: string): Promise<{ message: string; reset_token?: string }> {
    return request("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async getMe(): Promise<User> {
    return request<User>("/api/v1/auth/me");
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("aivora_token");
      localStorage.removeItem("aivora_user");
    }
  },

  // Landing page & marketing methods
  async subscribeNewsletter(email: string): Promise<SubscriberResponse> {
    return request<SubscriberResponse>("/api/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async submitContactInquiry(email: string, name?: string, message?: string): Promise<InquiryResponse> {
    return request<InquiryResponse>("/api/sales/contact", {
      method: "POST",
      body: JSON.stringify({ email, name, message }),
    });
  },

  async getStats(): Promise<StatsResponse> {
    return request<StatsResponse>("/api/stats");
  },

  // Assistant features
  async getSessions(): Promise<Session[]> {
    return request<Session[]>("/api/v1/assistant/sessions");
  },

  async createSession(title?: string): Promise<Session> {
    return request<Session>("/api/v1/assistant/sessions", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },

  async deleteSession(sessionId: string): Promise<void> {
    return request<void>(`/api/v1/assistant/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },

  async getMessages(sessionId: string): Promise<Message[]> {
    return request<Message[]>(`/api/v1/assistant/sessions/${sessionId}/messages`);
  },

  async sendMessage(sessionId: string, text: string): Promise<Message[]> {
    return request<Message[]>(`/api/v1/assistant/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  },

  async executeAction(sessionId: string, actionId: string, messageId: string, contextText?: string): Promise<Message[]> {
    return request<Message[]>(`/api/v1/assistant/sessions/${sessionId}/actions`, {
      method: "POST",
      body: JSON.stringify({ action_id: actionId, message_id: messageId, context_text: contextText }),
    });
  },

  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    return request<DashboardSummaryResponse>("/api/v1/dashboard/summary");
  },

  async createNote(title: string, content?: string): Promise<NoteSchema> {
    return request<NoteSchema>("/api/v1/dashboard/notes", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });
  },

  async deleteNote(noteId: string): Promise<void> {
    return request<void>(`/api/v1/dashboard/notes/${noteId}`, {
      method: "DELETE",
    });
  },

  async createShoppingItem(name: string): Promise<ShoppingItemSchema> {
    return request<ShoppingItemSchema>("/api/v1/dashboard/shopping", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  async toggleShoppingItem(itemId: string): Promise<ShoppingItemSchema> {
    return request<ShoppingItemSchema>(`/api/v1/dashboard/shopping/${itemId}/toggle`, {
      method: "PATCH",
    });
  },

  async deleteShoppingItem(itemId: string): Promise<void> {
    return request<void>(`/api/v1/dashboard/shopping/${itemId}`, {
      method: "DELETE",
    });
  },

  async getEvents(): Promise<CalendarEventSchema[]> {
    return request<CalendarEventSchema[]>("/api/v1/dashboard/events");
  },

  async createEvent(title: string, eventTime: string, description?: string, location?: string, eventType?: string): Promise<CalendarEventSchema> {
    return request<CalendarEventSchema>("/api/v1/dashboard/events", {
      method: "POST",
      body: JSON.stringify({ title, event_time: eventTime, description, location, event_type: eventType || "generic" }),
    });
  },

  async deleteEvent(eventId: string): Promise<void> {
    return request<void>(`/api/v1/dashboard/events/${eventId}`, {
      method: "DELETE",
    });
  },

  async createExpense(amount: number, description?: string): Promise<{ status: string; amount: number }> {
    return request<{ status: string; amount: number }>("/api/v1/dashboard/expenses", {
      method: "POST",
      body: JSON.stringify({ amount, description }),
    });
  },

  async completeReminder(reminderId: string): Promise<ReminderSchema> {
    return request<ReminderSchema>(`/api/v1/dashboard/reminders/${reminderId}/complete`, {
      method: "PATCH",
    });
  },

  async getWeather(city: string): Promise<WeatherResponseSchema> {
    const { fetchLiveWeatherDirect } = await import('./weather');
    return fetchLiveWeatherDirect(city);
  }
};

export interface HourlyForecastSchema {
  time: string;
  temp: number;
  icon: string;
  condition: string;
}

export interface ForecastDaySchema {
  day: string;
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  icon: string;
  precipitation: string;
  badgeClass: string;
  shadowClass: string;
}

export interface TravelRecommendationSchema {
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string;
}

export interface WeatherResponseSchema {
  city: string;
  lat?: number;
  lon?: number;
  currentTemp: number;
  condition: string;
  tempHigh: number;
  tempLow: number;
  uvIndex: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  cloudCover: number;
  sunsetTime: string;
  aqi: string;
  aqiDescription: string;
  aiInsight: string;
  wearRecommendation: string;
  activityRecommendation: string;
  hourly: HourlyForecastSchema[];
  forecast: ForecastDaySchema[];
  travelRecommendations: TravelRecommendationSchema[];
}

export interface CalendarEventSchema {
  id: string;
  title: string;
  description?: string;
  event_time: string;
  event_type: string;
  location?: string;
}

export interface NoteSchema {
  id: string;
  title: string;
  content?: string;
  created_at: string;
  updated_at?: string;
}

export interface ShoppingItemSchema {
  id: string;
  name: string;
  is_completed: boolean;
}

export interface ReminderSchema {
  id: string;
  title: string;
  trigger_time: string;
  status: string;
}

export interface TravelPlanSchema {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_estimate?: number;
  bookings_count: number;
}

export interface DashboardSummaryResponse {
  user_name: string;
  current_date: string;
  ai_insight: string;
  ai_action_suggestion?: string;
  schedule_events: CalendarEventSchema[];
  budget_spent_this_week: number;
  budget_weekly_limit: number;
  upcoming_trip?: TravelPlanSchema;
  recent_notes: NoteSchema[];
  shopping_items: ShoppingItemSchema[];
  active_reminders: ReminderSchema[];
}

export interface Session {
  id: string;
  user_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ActionWidget {
  label: string;
  actionId: string;
  primary?: boolean;
}

export interface MessageStats {
  done?: string | number;
  missed?: string | number;
  score?: string;
}

export interface Message {
  id: string;
  session_id: string;
  sender: "user" | "ai";
  text: string;
  stats?: MessageStats;
  actions?: ActionWidget[];
  created_at: string;
}
