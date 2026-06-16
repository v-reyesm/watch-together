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
          summary: "",
          overview: "",
          genres: [],
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
      summary: "",
      overview: "",
      genres: [],
      originalLanguage: "es",
      rating: 0,
      status: "pending" as const,
      watchedAt: null,
    },
  ],
  pendingSuggestions: [
    {
      id: 10,
      providerName: "tmdb",
      providerId: 100,
      mediaType: "movie" as const,
      title: "Pendiente",
      translatedTitle: "Pendiente",
      year: 2026,
      posterUrl: "",
      summary: "",
      overview: "",
      genres: [],
      originalLanguage: "es",
      rating: 0,
      status: "pending" as const,
      watchedAt: null,
      listId: 5,
      listName: "Noches de viernes",
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

    expect(
      (await screen.findAllByText("Noches de viernes")).length,
    ).toBeGreaterThan(0);
    await waitFor(() => {
      expect(screen.getByText("1/2")).toBeInTheDocument();
    });
    expect(screen.getAllByText("Pendiente").length).toBeGreaterThan(0);
  });

  it("greets the logged-in user by name", async () => {
    (getWatchSummary as jest.Mock).mockResolvedValue({
      data: summary,
      status: 200,
    });

    render(<Home />);

    expect(await screen.findByText("Hola, Ana")).toBeInTheDocument();
  });

  it("renders random to-watch suggestions tagged with their list", async () => {
    (getWatchSummary as jest.Mock).mockResolvedValue({
      data: summary,
      status: 200,
    });

    render(<Home />);

    expect(await screen.findByText("Para ver")).toBeInTheDocument();
    // The list name appears both on the list card and the suggestion badge.
    expect(
      (await screen.findAllByText("Noches de viernes")).length,
    ).toBeGreaterThan(1);
  });

  it("dedupes a title that appears in multiple lists in 'Para ver'", async () => {
    // "Send Help" lives in two lists, so the backend returns it twice (one entry
    // per list). The home page must collapse it to a single suggestion card.
    const baseItem = {
      id: 10,
      providerName: "tmdb",
      providerId: 555,
      mediaType: "movie" as const,
      title: "Send Help",
      translatedTitle: "Send Help",
      year: 2025,
      posterUrl: "",
      summary: "",
      overview: "",
      genres: [],
      originalLanguage: "en",
      rating: 0,
      status: "pending" as const,
      watchedAt: null,
    };
    const dedupeSummary = {
      listCount: 2,
      itemCount: 2,
      watchedCount: 0,
      pendingCount: 2,
      lists: [],
      highlightedItems: [],
      pendingSuggestions: [
        { ...baseItem, id: 10, listId: 5, listName: "Con la baby" },
        // Same providerId + mediaType, different list-item id and list.
        { ...baseItem, id: 99, listId: 7, listName: "Forever alone" },
      ],
    };
    // Deterministic shuffle so the assertion never flakes.
    const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0);
    (getWatchSummary as jest.Mock).mockResolvedValue({
      data: dedupeSummary,
      status: 200,
    });

    render(<Home />);

    expect(await screen.findByText("Para ver")).toBeInTheDocument();
    // Exactly one suggestion card for the duplicated title (each card is a link
    // whose accessible name carries the title + list label).
    const sendHelpCards = screen.getAllByRole("link", { name: /Send Help/ });
    expect(sendHelpCards).toHaveLength(1);
    // It keeps the first occurrence's label + a link to that list.
    expect(screen.getByText("Con la baby")).toBeInTheDocument();
    expect(screen.queryByText("Forever alone")).not.toBeInTheDocument();
    expect(sendHelpCards[0]).toHaveAttribute("href", "/lists/5");

    randomSpy.mockRestore();
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

    await screen.findAllByText("Noches de viernes");
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

    await screen.findAllByText("Noches de viernes");
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
