/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "./page";
import { createInvite, getWatchSummary } from "@/lib/watch-api";
import { useAuth } from "@/lib/auth";

jest.mock("@/lib/watch-api", () => ({
  createInvite: jest.fn(),
  getWatchSummary: jest.fn(),
  markListItemWatched: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  useAuth: jest.fn(),
}));

const summary = {
  listCount: 1,
  itemCount: 2,
  watchedCount: 1,
  pendingCount: 1,
  lists: [
    {
      id: 5,
      name: "Noches de viernes",
      description: "Lista compartida",
      members: [
        {
          id: 1,
          name: "Ana",
          email: "ana@example.com",
          role: "owner" as const,
          initials: "A",
        },
      ],
      itemCount: 2,
      pendingCount: 1,
      watchedCount: 1,
      items: [
        {
          id: 10,
          providerName: "tmdb",
          providerId: 100,
          mediaType: "movie" as const,
          title: "Pendiente",
          translatedTitle: "Pendiente",
          year: 2026,
          posterUrl: "",
          overview: "",
          originalLanguage: "es",
          rating: 0,
          status: "pending" as const,
          watchedAt: null,
        },
      ],
    },
  ],
  highlightedItems: [
    {
      id: 10,
      providerName: "tmdb",
      providerId: 100,
      mediaType: "movie" as const,
      title: "Pendiente",
      translatedTitle: "Pendiente",
      year: 2026,
      posterUrl: "",
      overview: "",
      originalLanguage: "es",
      rating: 0,
      status: "pending" as const,
      watchedAt: null,
    },
  ],
};

describe("Home", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, email: "ana@example.com", name: "Ana", avatarUrl: null },
    });
  });

  it("shows Spanish loading states while the dashboard summary loads", () => {
    (getWatchSummary as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<Home />);

    expect(screen.getByText("Cargando tus listas compartidas...")).toBeInTheDocument();
    expect(screen.getByText("Cargando títulos pendientes...")).toBeInTheDocument();
  });

  it("renders backend dashboard summary data", async () => {
    (getWatchSummary as jest.Mock).mockResolvedValue({
      data: summary,
      status: 200,
    });

    render(<Home />);

    expect(await screen.findByText("Noches de viernes")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("1/2")).toBeInTheDocument();
    });
    expect(screen.getAllByText("Pendiente").length).toBeGreaterThan(0);
  });

  it("creates an invite from the dashboard banner", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    (getWatchSummary as jest.Mock).mockResolvedValue({
      data: summary,
      status: 200,
    });
    (createInvite as jest.Mock).mockResolvedValue({
      data: {
        id: 20,
        watchListId: 5,
        token: "invite-token",
        expiresAt: "2026-06-09T00:00:00.000Z",
        revokedAt: null,
        usedAt: null,
        createdAt: "2026-06-02T00:00:00.000Z",
        status: "active",
      },
      status: 201,
    });

    render(<Home />);

    await screen.findByText("Noches de viernes");
    fireEvent.click(screen.getByRole("button", { name: /crear invitación/i }));

    expect(
      await screen.findByText("Invitación creada. Copia el enlace o compártelo por email."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /compartir por email/i }),
    ).toBeInTheDocument();
  });

  it("shows a fallback message when dashboard copy is rejected", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: jest.fn().mockRejectedValue(new Error("denied")),
      },
    });
    (getWatchSummary as jest.Mock).mockResolvedValue({
      data: summary,
      status: 200,
    });
    (createInvite as jest.Mock).mockResolvedValue({
      data: {
        id: 20,
        watchListId: 5,
        token: "invite-token",
        expiresAt: "2026-06-09T00:00:00.000Z",
        revokedAt: null,
        usedAt: null,
        createdAt: "2026-06-02T00:00:00.000Z",
        status: "active",
      },
      status: 201,
    });

    render(<Home />);

    await screen.findByText("Noches de viernes");
    fireEvent.click(screen.getByRole("button", { name: /crear invitación/i }));
    await screen.findByRole("button", { name: /copiar/i });

    fireEvent.click(screen.getByRole("button", { name: /copiar/i }));

    expect(
      await screen.findByText(
        "No pudimos copiar el enlace. Copia la URL o compártela por email.",
      ),
    ).toBeInTheDocument();
  });
});
