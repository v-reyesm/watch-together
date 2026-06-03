/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "./page";
import { getWatchSummary } from "@/lib/watch-api";

jest.mock("@/lib/watch-api", () => ({
  getWatchSummary: jest.fn(),
  markListItemWatched: jest.fn(),
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
};

describe("Home", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
