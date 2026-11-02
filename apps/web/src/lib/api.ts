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

export interface OpportunityItem {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  skills_required?: string[];
  skills?: string[];
  location_type?: string;
  locationType?: string;
  city?: string | null;
  location?: string | null;
  duration?: string | null;
  points_reward?: number;
  pointsReward?: number;
  openings?: number;
  deadline?: string | null;
  status: string;
  organisation?: {
    id: string;
    org_name: string;
    website?: string | null;
    verification_status?: string;
    rating_avg?: number;
  };
  org?: string;
  applications_count?: number;
  applicant_stats?: {
    total: number;
    applied: number;
    shortlisted: number;
    selected: number;
    completed: number;
    rejected: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationItem {
  id: string;
  opportunity_id: string;
  opportunity_title: string;
  organisation: string;
  volunteer_id: string;
  pitch_text: string;
  status: "applied" | "shortlisted" | "selected" | "completed" | "rejected";
  applied_at: string;
  volunteer?: { id: string; name: string; email: string; city?: string | null };
}

export interface VolunteerProfileItem {
  id: string;
  headline: string | null;
  about: string | null;
  skills: string[];
  portfolioLinks: string[];
  points: number;
  ratingAvg: number;
  badges: string[];
  resumeUrl: string | null;
  totalHours: number;
}

export interface GamificationItem {
  points: number;
  badges: string[];
  recentTransactions: { eventType: string; points: number; createdAt: string }[];
}

export interface OrganisationProfileItem {
  id: string;
  orgName: string;
  about: string | null;
  website: string | null;
  registrationType: string | null;
  registrationId: string | null;
  verificationDocUrl: string | null;
  verificationStatus: string;
  ratingAvg: number;
  reviewCount: number;
}

export interface SearchFacets {
  categories: Record<string, number>;
  types: Record<string, number>;
  locationTypes: Record<string, number>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  facets?: SearchFacets;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface OpportunityQueryParams {
  search?: string;
  q?: string;
  type?: string;
  category?: string;
  locationType?: string;
  location_type?: string;
  city?: string;
  status?: string;
  skills?: string;
  orgId?: string;
  organisationId?: string;
  sortBy?: "newest" | "relevance" | "deadline_soon" | "points" | "deadline";
  sortOrder?: "ASC" | "DESC" | "asc" | "desc";
  page?: number | string;
  limit?: number | string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface CreateOpportunityInput {
  title: string;
  description: string;
  type: string;
  category: string;
  skillsRequired?: string[];
  skills_required?: string[];
  locationType?: string;
  location_type?: string;
  city?: string;
  duration?: string;
  pointsReward?: number;
  points_reward?: number;
  openings?: number;
  deadline: string;
  status?: string;
  orgId?: string;
  org_id?: string;
  [key: string]: unknown;
}

export interface UpdateOpportunityInput {
  title?: string;
  description?: string;
  type?: string;
  category?: string;
  skillsRequired?: string[];
  skills_required?: string[];
  locationType?: string;
  location_type?: string;
  city?: string;
  duration?: string;
  pointsReward?: number;
  points_reward?: number;
  openings?: number;
  deadline?: string;
  status?: string;
  orgId?: string;
  org_id?: string;
  [key: string]: unknown;
}

export interface CategorySummary {
  name: string;
  count: number;
  active: boolean;
}

export interface DeleteOpportunityResponse {
  message: string;
  id: string;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3001/api" : "")).replace(/\/+$/, "");

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
    if (!API_BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_URL must be set to the deployed API URL ending in /api before building the production web app.");
    }
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

  public async getOpportunities(params: OpportunityQueryParams = {}): Promise<PaginatedResponse<OpportunityItem>> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
    });
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return this.request<PaginatedResponse<OpportunityItem>>(`/opportunities${query}`);
  }

  public async getOpportunityById(id: string): Promise<OpportunityItem> {
    return this.request<OpportunityItem>(`/opportunities/${id}`);
  }

  public async getOpportunityCategories(): Promise<CategorySummary[]> {
    return this.request<CategorySummary[]>("/opportunities/categories");
  }

  public async getMyOpportunities(): Promise<OpportunityItem[]> {
    return this.request<OpportunityItem[]>("/opportunities/mine");
  }

  public async createApplication(opportunityId: string, pitchText: string): Promise<ApplicationItem> {
    return this.request<ApplicationItem>("/applications", {
      method: "POST",
      body: JSON.stringify({ opportunityId, pitchText }),
    });
  }

  public async getMyApplications(): Promise<ApplicationItem[]> {
    return this.request<ApplicationItem[]>("/applications/mine");
  }

  public async getOpportunityApplicants(opportunityId: string): Promise<ApplicationItem[]> {
    return this.request<ApplicationItem[]>(`/applications/opportunity/${opportunityId}`);
  }

  public async updateApplicationStatus(
    applicationId: string,
    status: ApplicationItem["status"],
  ): Promise<ApplicationItem> {
    return this.request<ApplicationItem>(`/applications/${applicationId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  public async getVolunteerProfile(): Promise<VolunteerProfileItem> {
    return this.request<VolunteerProfileItem>("/volunteers/profile");
  }

  public async updateVolunteerProfile(data: Partial<Pick<VolunteerProfileItem, "headline" | "about" | "skills" | "portfolioLinks" | "resumeUrl">>): Promise<VolunteerProfileItem> {
    return this.request<VolunteerProfileItem>("/volunteers/profile", { method: "PATCH", body: JSON.stringify(data) });
  }

  public async getMyGamification(): Promise<GamificationItem> {
    return this.request<GamificationItem>("/gamification/me");
  }

  public async getPendingOpportunities(): Promise<OpportunityItem[]> {
    return this.request<OpportunityItem[]>("/admin/opportunities/pending");
  }

  public async reviewOpportunity(id: string, status: "approved" | "rejected"): Promise<OpportunityItem> {
    return this.request<OpportunityItem>(`/admin/opportunities/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  public async getPendingOrganisations(): Promise<{ id: string; org_name: string; about: string | null; registration_type: string | null; verification_status: string; verification_doc_url: string | null; user?: { name: string; email: string; city: string | null } }[]> {
    return this.request("/admin/organisations/pending");
  }

  public async getMyOrganisation(): Promise<OrganisationProfileItem> {
    return this.request("/organisations/me");
  }

  public async createMyOrganisation(data: { orgName: string; about?: string; website?: string; registrationType?: string; verificationDocUrl?: string }): Promise<OrganisationProfileItem> {
    return this.request("/organisations", { method: "POST", body: JSON.stringify(data) });
  }

  public async updateMyOrganisation(data: { orgName?: string; about?: string; website?: string; registrationType?: string; verificationDocUrl?: string }): Promise<OrganisationProfileItem> {
    return this.request("/organisations/me", { method: "PATCH", body: JSON.stringify(data) });
  }

  public async resubmitMyOrganisation(): Promise<OrganisationProfileItem> {
    return this.request("/organisations/me/resubmit", { method: "POST" });
  }

  public async uploadVerificationDocument(file: File): Promise<string> {
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("Choose a PDF verification document.");
    }
    if (file.size <= 0 || file.size > 10 * 1024 * 1024) {
      throw new Error("The PDF must be between 1 byte and 10 MB.");
    }
    const signed = await this.request<{ uploadUrl: string; key: string; contentType: string }>("/storage/presign-upload", {
      method: "POST",
      body: JSON.stringify({ purpose: "verification", fileName: file.name, contentType: file.type, fileSize: file.size }),
    });
    const uploaded = await fetch(signed.uploadUrl, { method: "PUT", headers: { "Content-Type": signed.contentType }, body: file });
    if (!uploaded.ok) throw new Error(`R2 upload failed (${uploaded.status}). Check the bucket CORS policy and try again.`);
    await this.request("/storage/verify-upload", { method: "POST", body: JSON.stringify({ key: signed.key }) });
    return signed.key;
  }

  public async getStorageDownloadUrl(key: string): Promise<string> {
    const result = await this.request<{ downloadUrl: string }>("/storage/presign-download", { method: "POST", body: JSON.stringify({ key }) });
    return result.downloadUrl;
  }

  public async deleteStorageObject(key: string): Promise<void> {
    await this.request("/storage/object", { method: "DELETE", body: JSON.stringify({ key }) });
  }

  public async reviewOrganisation(id: string, status: "verified" | "rejected"): Promise<unknown> {
    return this.request(`/admin/organisations/${id}/verify`, { method: "PATCH", body: JSON.stringify({ status }) });
  }

  public async getPendingReports(): Promise<{ id: string; target_type: string; target_id: string; reason: string; created_at: string; reporter?: { name: string } }[]> {
    return this.request("/admin/reports/pending");
  }

  public async resolveReport(id: string, action: "dismiss_report" | "remove_content"): Promise<unknown> {
    return this.request(`/admin/reports/${id}/resolve`, { method: "PATCH", body: JSON.stringify({ action }) });
  }

  public async createOpportunity(data: CreateOpportunityInput): Promise<OpportunityItem> {
    return this.request<OpportunityItem>("/opportunities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public async updateOpportunity(id: string, data: UpdateOpportunityInput): Promise<OpportunityItem> {
    return this.request<OpportunityItem>(`/opportunities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  public async deleteOpportunity(id: string): Promise<DeleteOpportunityResponse> {
    return this.request<DeleteOpportunityResponse>(`/opportunities/${id}`, {
      method: "DELETE",
    });
  }

  public async submitOpportunityForReview(id: string): Promise<OpportunityItem> {
    return this.request<OpportunityItem>(`/opportunities/${id}/submit`, {
      method: "POST",
    });
  }

  public async closeOpportunity(id: string): Promise<OpportunityItem> {
    return this.request<OpportunityItem>(`/opportunities/${id}/close`, {
      method: "POST",
    });
  }

  public async reopenOpportunity(id: string): Promise<OpportunityItem> {
    return this.request<OpportunityItem>(`/opportunities/${id}/reopen`, {
      method: "POST",
    });
  }

  public async searchOpportunities(params: OpportunityQueryParams = {}): Promise<PaginatedResponse<OpportunityItem>> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
    });
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return this.request<PaginatedResponse<OpportunityItem>>(`/search/opportunities${query}`);
  }

  public async getSearchFacets(): Promise<SearchFacets> {
    return this.request<SearchFacets>("/search/facets");
  }
}

export const api = new ApiClient();
