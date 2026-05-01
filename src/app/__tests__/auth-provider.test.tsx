/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}));

import { AuthProvider, useAuth } from "../lib/auth";

function TestConsumer() {
  const { signOut } = useAuth();

  return <button onClick={signOut}>Cerrar sesión</button>;
}

describe("AuthProvider", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("clears the session token and redirects to sign-in when signing out", async () => {
    sessionStorage.setItem("wt_token", "token");
    const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          email: "a@b.com",
          name: "Ana",
          avatarUrl: null,
        }),
      } as Response);
    global.fetch = fetchMock as typeof fetch;

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(sessionStorage.getItem("wt_token")).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith("/sign-in");
  });
});
