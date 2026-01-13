const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

type FetchOpts = RequestInit & { path: string };

interface ApiResponse<T = unknown> {
  data: T;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\/+^])/g, "\\$1") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  // Dashboard HANYA baca dari cookie (shared dari port 3000)
  const token = readCookie("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchWithAuth<T = unknown>({ path, ...opts }: FetchOpts): Promise<T> {
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Prevent double /api prefix if both baseUrl and path have it
  if (baseUrl.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    normalizedPath = normalizedPath.substring(4); // Remove "/api"
  }

  const url = path.startsWith("http") ? path : `${baseUrl}${normalizedPath}`;

  const res = await fetch(url, {
    credentials: "include", // cookie jika ada
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...(opts.headers || {}),
    },
    ...opts,
  });

  if (!res.ok) {
    const message = await safeMessage(res);
    throw new Error(message || `Request gagal (${res.status})`);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

async function safeMessage(res: Response) {
  try {
    const data = await res.json();
    return typeof data?.message === "string" ? data.message : "";
  } catch (e) {
    return "";
  }
}

export async function getCurrentUser() {
  return fetchWithAuth<{ user?: unknown; data?: unknown }>({ path: "/me" });
}

// Axios-like API wrapper untuk kompatibilitas dengan components
export const api = {
  baseURL: baseUrl,

  async get<T = unknown>(path: string, config?: { params?: Record<string, any> }): Promise<ApiResponse<T>> {
    let fullPath = path;
    if (config?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      const separator = path.includes("?") ? "&" : "?";
      fullPath = `${path}${separator}${searchParams.toString()}`;
    }

    const data = await fetchWithAuth<T>({
      path: fullPath,
      method: "GET",
    });

    return { data };
  },

  async post<T = unknown>(path: string, body?: unknown, config?: any): Promise<ApiResponse<T>> {
    const data = await fetchWithAuth<T>({
      path,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers: config?.headers || {},
    });

    return { data };
  },

  async put<T = unknown>(path: string, body?: unknown, config?: any): Promise<ApiResponse<T>> {
    const data = await fetchWithAuth<T>({
      path,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      headers: config?.headers || {},
    });

    return { data };
  },

  async delete<T = unknown>(path: string, config?: any): Promise<ApiResponse<T>> {
    const data = await fetchWithAuth<T>({
      path,
      method: "DELETE",
      headers: config?.headers || {},
    });

    return { data };
  },
};

