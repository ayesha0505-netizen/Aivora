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

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    throw new ApiError(err instanceof Error ? err.message : "Network error: Failed to fetch", 0);
  }

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
    try {
      return await request<Session[]>("/api/v1/assistant/sessions");
    } catch {
      console.warn("Backend unavailable, using mock sessions data");
      return [
        {
          id: "sess_mock_1",
          user_id: "user_123",
          title: "Trip to Tokyo",
          status: "active",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
        }
      ];
    }
  },

  async createSession(title?: string): Promise<Session> {
    try {
      return await request<Session>("/api/v1/assistant/sessions", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
    } catch {
      console.warn("Backend unavailable, returning mock session");
      return {
        id: "sess_" + Date.now(),
        user_id: "user_123",
        title: title || "New Conversation",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await request<void>(`/api/v1/assistant/sessions/${sessionId}`, {
        method: "DELETE",
      });
    } catch {
      console.warn("Backend unavailable, mocking deleteSession");
    }
  },

  async getMessages(sessionId: string): Promise<Message[]> {
    try {
      return await request<Message[]>(`/api/v1/assistant/sessions/${sessionId}/messages`);
    } catch {
      console.warn("Backend unavailable, returning mock messages");
      return [
        {
          id: "msg_1",
          session_id: sessionId,
          sender: "ai",
          text: "Hi there! I am Aivora (Mock Mode). The backend is currently unavailable, but I can still show you how the UI looks.",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        }
      ];
    }
  },

  async sendMessage(sessionId: string, text: string): Promise<Message[]> {
    try {
      return await request<Message[]>(`/api/v1/assistant/sessions/${sessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
    } catch {
      console.warn("Backend unavailable, mocking sendMessage");
      const lower = text.toLowerCase();
      let botReply = "I received your message (offline mock mode).";
      let progress_steps = undefined;
      let stats = undefined;
      let actions = undefined;

      if (lower.includes("spend") || lower.includes("budget") || lower.includes("expenses")) {
        botReply = "I've analyzed your spend this month. You're doing great on groceries, but dining out is slightly over budget. \n\n**Top Categories:**\n1. Rent/Mortgage ($1,500)\n2. Groceries ($350)\n3. Dining Out ($220)\n\nWould you like me to set a new alert for dining out?";
        progress_steps = ["Scanning recent transactions...", "Categorizing expenses...", "Calculating monthly averages...", "Generating insights..."];
        stats = { done: 124, missed: 3, score: "96%" };
        actions = [
          { label: "Set Budget Alert", actionId: "set_alert", primary: true },
          { label: "View Full Report", actionId: "view_report" }
        ];
      } else if (lower.includes("routine") || lower.includes("morning") || lower.includes("calendar")) {
        botReply = "Based on your calendar, you have a light morning. \n\nI suggest:\n- **7:00 AM**: 30m workout\n- **8:00 AM**: Deep work block\n- **10:00 AM**: Team Sync\n\nI can add this to your schedule if you like.";
        actions = [
          { label: "Add to Calendar", actionId: "add_cal", primary: true }
        ];
      } else if (lower.includes("email") || lower.includes("boss") || lower.includes("draft")) {
        botReply = "Here is a draft email for your boss:\n\nSubject: Project Update\n\nHi Boss,\nI wanted to share that the initial phase is complete. I'll send over the detailed metrics by Friday.\n\nBest,\nAlexander";
        actions = [
          { label: "Open in Gmail", actionId: "open_email", primary: true },
          { label: "Make it more formal", actionId: "make_formal" }
        ];
      } else if (lower.includes("notes") || lower.includes("checklist")) {
        botReply = "I've turned your recent notes into an actionable checklist. \n\n- [ ] Review design specs\n- [ ] Update staging environment\n- [ ] Schedule user interviews";
        progress_steps = ["Reading notes...", "Extracting action items..."];
      } else if (lower.includes("meditation") || lower.includes("relax")) {
        botReply = "Take a moment for yourself. Try this quick breathing exercise:\n\n1. Inhale deeply for 4 seconds.\n2. Hold for 4 seconds.\n3. Exhale slowly for 6 seconds.\n\nRepeat 3 times to lower your heart rate.";
        actions = [
          { label: "Start 5 Min Timer", actionId: "start_timer", primary: true }
        ];
      }

      return [
        {
          id: "msg_usr_" + Date.now(),
          session_id: sessionId,
          sender: "user",
          text,
          created_at: new Date().toISOString(),
        },
        {
          id: "msg_ai_" + Date.now(),
          session_id: sessionId,
          sender: "ai",
          text: botReply,
          progress_steps,
          stats,
          actions,
          created_at: new Date(Date.now() + 1000).toISOString(),
        }
      ];
    }
  },

  async executeAction(sessionId: string, actionId: string, messageId: string, contextText?: string): Promise<Message[]> {
    try {
      return await request<Message[]>(`/api/v1/assistant/sessions/${sessionId}/actions`, {
        method: "POST",
        body: JSON.stringify({ action_id: actionId, message_id: messageId, context_text: contextText }),
      });
    } catch {
      console.warn("Backend unavailable, mocking executeAction");
      return [
        {
          id: "msg_ai_action_" + Date.now(),
          session_id: sessionId,
          sender: "ai",
          text: `Action ${actionId} executed in mock mode.`,
          created_at: new Date().toISOString(),
        }
      ];
    }
  },

  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    try {
      return await request<DashboardSummaryResponse>("/api/v1/dashboard/summary");
    } catch {
      console.warn("Backend unavailable, using mock dashboard data");
      let userName = "Guest";
      if (typeof window !== "undefined") {
        try {
          const userStr = localStorage.getItem("aivora_user");
          if (userStr) {
            const user = JSON.parse(userStr);
            userName = user.first_name || (user.full_name ? user.full_name.split(" ")[0] : "Guest");
          }
        } catch (err) {}
      }

      return {
        user_name: userName,
        current_date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        ai_insight: "You've got a busy afternoon. I've automatically prioritized your tasks.",
        schedule_events: [
          { id: "e1", title: "Product Sync", event_time: new Date().toISOString(), event_type: "video" },
          { id: "e2", title: "Lunch with Sarah", event_time: new Date(Date.now() + 7200000).toISOString(), event_type: "restaurant" },
          { id: "e3", title: "Gym Session", event_time: new Date(Date.now() + 28800000).toISOString(), event_type: "fitness" },
        ],
        budget_spent_this_week: 342.50,
        budget_weekly_limit: 500,
        upcoming_trip: {
          id: "t1",
          destination: "Tokyo, Japan",
          start_date: "Oct 12",
          end_date: "Oct 24",
          bookings_count: 4
        },
        recent_notes: [
          { id: "n1", title: "Q4 Roadmap Ideas", content: "Focus on user retention...", created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: "n2", title: "Meeting Notes", content: "Discussed new features", created_at: new Date(Date.now() - 86400000).toISOString() },
        ],
        shopping_items: [
          { id: "s1", name: "Oat Milk", is_completed: false },
          { id: "s2", name: "Coffee Beans", is_completed: false },
          { id: "s3", name: "Avocados", is_completed: true },
        ],
        active_reminders: [
          { id: "r1", title: "Call mom", trigger_time: new Date(Date.now() + 3600000).toISOString(), status: "pending" },
          { id: "r2", title: "Pay electric bill", trigger_time: new Date(Date.now() + 86400000).toISOString(), status: "pending" },
        ]
      };
    }
  },

  async createNote(title: string, content?: string): Promise<NoteSchema> {
    try {
      return await request<NoteSchema>("/api/v1/dashboard/notes", {
        method: "POST",
        body: JSON.stringify({ title, content }),
      });
    } catch {
      console.warn("Backend unavailable, returning mock note");
      return {
        id: "note_" + Date.now(),
        title,
        content,
        created_at: new Date().toISOString()
      };
    }
  },

  async deleteNote(noteId: string): Promise<void> {
    return request<void>(`/api/v1/dashboard/notes/${noteId}`, {
      method: "DELETE",
    });
  },

  async createShoppingItem(name: string): Promise<ShoppingItemSchema> {
    try {
      return await request<ShoppingItemSchema>("/api/v1/dashboard/shopping", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    } catch {
      console.warn("Backend unavailable, returning mock shopping item");
      return {
        id: "shop_" + Date.now(),
        name,
        is_completed: false
      };
    }
  },

  async toggleShoppingItem(itemId: string): Promise<ShoppingItemSchema> {
    try {
      return await request<ShoppingItemSchema>(`/api/v1/dashboard/shopping/${itemId}/toggle`, {
        method: "PATCH",
      });
    } catch {
      console.warn("Backend unavailable, returning mock toggle response");
      return { id: itemId, name: "Mock Item", is_completed: true };
    }
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
    try {
      return await request<CalendarEventSchema>("/api/v1/dashboard/events", {
        method: "POST",
        body: JSON.stringify({ title, event_time: eventTime, description, location, event_type: eventType || "generic" }),
      });
    } catch {
      console.warn("Backend unavailable, returning mock event");
      return {
        id: "evt_" + Date.now(),
        title,
        event_time: eventTime,
        description,
        location,
        event_type: eventType || "generic"
      };
    }
  },

  async deleteEvent(eventId: string): Promise<void> {
    return request<void>(`/api/v1/dashboard/events/${eventId}`, {
      method: "DELETE",
    });
  },

  async createExpense(amount: number, description?: string): Promise<{ status: string; amount: number }> {
    try {
      return await request<{ status: string; amount: number }>("/api/v1/dashboard/expenses", {
        method: "POST",
        body: JSON.stringify({ amount, description }),
      });
    } catch {
      console.warn("Backend unavailable, returning mock expense");
      return { status: "success", amount };
    }
  },

  async completeReminder(reminderId: string): Promise<ReminderSchema> {
    try {
      return await request<ReminderSchema>(`/api/v1/dashboard/reminders/${reminderId}/complete`, {
        method: "PATCH",
      });
    } catch {
      console.warn("Backend unavailable, returning mock completed reminder");
      return {
        id: reminderId,
        title: "Mock Reminder",
        trigger_time: new Date().toISOString(),
        status: "completed"
      };
    }
  },

  async generateChecklist(prompt: string): Promise<{ title: string; category: string; items: { id: string; text: string; completed: boolean }[] }> {
    return request<{ title: string; category: string; items: { id: string; text: string; completed: boolean }[] }>("/api/v1/dashboard/checklists/generate", {
      method: "POST",
      body: JSON.stringify({ prompt }),
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
  progress_steps?: string[];
  created_at: string;
}
