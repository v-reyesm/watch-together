/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SignInPage from "./page";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@react-oauth/google", () => ({
  GoogleLogin: () => <div>Google Login</div>,
}));

jest.mock("@/components/auth/google-provider", () => ({
  hasGoogleClientId: false,
}));

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  useAuth: jest.fn(),
}));

describe("SignInPage", () => {
  const signIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    (useAuth as jest.Mock).mockReturnValue({ signIn });
  });

  it("redirects to next after email login", async () => {
    mockSearchParams = new URLSearchParams("next=/invites/invite-token");
    (apiFetch as jest.Mock).mockResolvedValue({
      data: { accessToken: "jwt-token" },
      status: 200,
    });

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => expect(signIn).toHaveBeenCalledWith("jwt-token"));
    expect(mockPush).toHaveBeenCalledWith("/invites/invite-token");
  });
});
