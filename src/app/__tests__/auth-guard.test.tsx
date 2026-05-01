/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockPathname = "/";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

let mockAuthValue = {
  user: null as { id: number; email: string; name: string; avatarUrl: string | null } | null,
  token: null as string | null,
  isLoading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
};

jest.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthValue,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { AuthGuard } from "../components/auth/auth-guard";

describe("AuthGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = "/";
    mockAuthValue = {
      user: null,
      token: null,
      isLoading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
    };
  });

  it("shows loading state while checking auth", () => {
    mockAuthValue.isLoading = true;
    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>,
    );
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated user to /sign-in", () => {
    mockPathname = "/profile";
    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>,
    );
    expect(mockReplace).toHaveBeenCalledWith("/sign-in");
  });

  it("renders children for authenticated user on protected route", () => {
    mockAuthValue.user = { id: 1, email: "a@b.com", name: "A", avatarUrl: null };
    mockAuthValue.token = "tok";
    mockPathname = "/profile";
    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>,
    );
    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects authenticated user away from /sign-in", () => {
    mockAuthValue.user = { id: 1, email: "a@b.com", name: "A", avatarUrl: null };
    mockAuthValue.token = "tok";
    mockPathname = "/sign-in";
    render(
      <AuthGuard>
        <div>Sign in form</div>
      </AuthGuard>,
    );
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("allows unauthenticated user on /sign-in", () => {
    mockPathname = "/sign-in";
    render(
      <AuthGuard>
        <div>Sign in form</div>
      </AuthGuard>,
    );
    expect(screen.getByText("Sign in form")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("allows unauthenticated user on /register", () => {
    mockPathname = "/register";
    render(
      <AuthGuard>
        <div>Register form</div>
      </AuthGuard>,
    );
    expect(screen.getByText("Register form")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
