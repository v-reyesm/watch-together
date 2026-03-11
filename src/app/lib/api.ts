const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("wt_token");
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T | null; status: number; error?: string }> {
  const { body, headers: customHeaders, ...rest } = options;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      if (typeof window !== "undefined" && token) {
        sessionStorage.removeItem("wt_token");
        window.location.href = "/sign-in?expired=1";
      }
      return { data: null, status: 401, error: "Sesión expirada" };
    }

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        json?.message || "Ha ocurrido un error. Intenta de nuevo.";
      return { data: null, status: res.status, error: message };
    }

    return { data: json as T, status: res.status };
  } catch {
    return {
      data: null,
      status: 0,
      error: "Error de conexión. Verifica tu red.",
    };
  }
}
