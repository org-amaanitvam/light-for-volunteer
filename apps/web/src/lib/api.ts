export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "volunteer" | "organisation" | "mentor" | "admin";
  phone?: string | null;
  city?: string | null;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  role: "volunteer" | "organisation" | "mentor";
  phone?: string;
  city?: string;
  orgName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

class ApiClient {
  private getTokens(): AuthTokens | null {
    if (typeof window === "undefined") return null;
    const access = localStorage.getItem("lfv_access_token");
    const refresh = localStorage.getItem("lfv_refresh_token");
    if (!access || !refresh) return null;
    return { accessToken: access, refreshToken: refresh };
  }

  public setTokens(tokens: AuthTokens) {
    if (typeof window === "undefined") return;
    localStorage.setItem("lfv_access_token", tokens.accessToken);
    localStorage.setItem("lfv_refresh_token", tokens.refreshToken);
  }

  public clearTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("lfv_access_token");
    localStorage.removeItem("lfv_refresh_token");
    localStorage.removeItem("lfv_user_profile");
  }

  public setUser(user: UserProfile) {
    if (typeof window === "undefined") return;
    localStorage.setItem("lfv_user_profile", JSON.stringify(user));
  }

  public getUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("lfv_user_profile");
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const tokens = this.getTokens();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (tokens?.accessToken) {
      headers["Authorization"] = `Bearer ${tokens.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // If 401 unauthorized and we have a refresh token, try refreshing once
    if (response.status === 401 && tokens?.refreshToken && !endpoint.includes("/auth/refresh")) {
      const refreshed = await this.refreshToken(tokens.refreshToken);
      if (refreshed) {
        headers["Authorization"] = `Bearer ${refreshed.accessToken}`;
        const retry = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
        if (!retry.ok) {
          const errData = await retry.json().catch(() => ({}));
          throw new Error(errData.message || `Request failed: ${retry.statusText}`);
        }
        return retry.json();
      }
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  public async signup(payload: SignupPayload): Promise<{ user: UserProfile; accessToken: string; refreshToken: string }> {
    const res = await this.request<{ user: UserProfile; accessToken: string; refreshToken: string }>(
      "/auth/signup",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    this.setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    this.setUser(res.user);
    return res;
  }

  public async login(payload: LoginPayload): Promise<{ user: UserProfile; accessToken: string; refreshToken: string }> {
    const res = await this.request<{ user: UserProfile; accessToken: string; refreshToken: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    this.setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    this.setUser(res.user);
    return res;
  }

  public async logout(): Promise<void> {
    const tokens = this.getTokens();
    if (tokens?.refreshToken) {
      try {
        await this.request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      } catch {
        // Continue clearing even if server call fails
      }
    }
    this.clearTokens();
  }

  public async getMe(): Promise<UserProfile> {
    const user = await this.request<UserProfile>("/auth/me");
    this.setUser(user);
    return user;
  }

  public async refreshToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        this.clearTokens();
        return null;
      }
      const data: AuthTokens = await res.json();
      this.setTokens(data);
      return data;
    } catch {
      this.clearTokens();
      return null;
    }
  }
}

export const api = new ApiClient();
