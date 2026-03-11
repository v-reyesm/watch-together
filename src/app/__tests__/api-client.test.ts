/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { apiFetch } from "../lib/api";

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

const originalFetch = global.fetch;

describe("apiFetch", () => {
  beforeEach(() => {
    sessionStorageMock.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("attaches Authorization header when token exists", async () => {
    sessionStorageMock.setItem("wt_token", "my-token");

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 1 }),
    }) as jest.Mock;

    await apiFetch("/api/users/me");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/users/me"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-token",
        }),
      }),
    );
  });

  it("does not attach Authorization header when no token", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    }) as jest.Mock;

    await apiFetch("/api/health");

    const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it("returns error message on non-ok response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: "Validation error" }),
    }) as jest.Mock;

    const result = await apiFetch("/api/auth/register", {
      method: "POST",
      body: { email: "bad" },
    });

    expect(result.status).toBe(400);
    expect(result.error).toBe("Validation error");
    expect(result.data).toBeNull();
  });

  it("clears token and redirects on 401", async () => {
    sessionStorageMock.setItem("wt_token", "expired-token");

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: "Unauthorized" }),
    }) as jest.Mock;

    const result = await apiFetch("/api/users/me");

    expect(result.status).toBe(401);
    expect(result.error).toBe("Sesión expirada");
    expect(sessionStorageMock.getItem("wt_token")).toBeNull();
  });

  it("handles network errors gracefully", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error")) as jest.Mock;

    const result = await apiFetch("/api/users/me");

    expect(result.status).toBe(0);
    expect(result.error).toBe("Error de conexión. Verifica tu red.");
  });
});
