/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ListDetailPage from "./page";
import {
  getWatchList,
  markListItemWatched,
  undoLatestWatch,
} from "@/lib/watch-api";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "7" }),
}));

jest.mock("@/lib/auth", () => ({
  useAuth: () => ({
    user: { id: 1, email: "ana@example.com", name: "Ana", avatarUrl: null },
  }),
}));

jest.mock("@/components/invite-panel", () => ({
  InvitePanel: () => <div data-testid="invite-panel" />,
}));

jest.mock("@/lib/watch-api", () => ({
  getWatchList: jest.fn(),
  markListItemWatched: jest.fn(),
  undoLatestWatch: jest.fn(),
}));

const listWithPendingItem = {
  id: 7,
  name: "Noches de viernes",
  description: "Películas para dos",
  members: [
    {
      id: 1,
      name: "Ana",
      email: "ana@example.com",
      role: "owner",
      initials: "A",
    },
  ],
  itemCount: 1,
  pendingCount: 1,
  watchedCount: 0,
  items: [
    {
      id: 10,
      providerName: "tmdb",
      providerId: 100,
      mediaType: "movie" as const,
      title: "Past Lives",
      translatedTitle: "Past Lives",
      year: 2023,
      posterUrl: "",
      summary: "",
      overview: "",
      genres: [],
      originalLanguage: "en",
      rating: 7.8,
      status: "pending" as const,
      watchedAt: null,
    },
  ],
};

describe("ListDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads and renders a list by route id", async () => {
    (getWatchList as jest.Mock).mockResolvedValue({
      data: {
        id: 7,
        name: "Noches de viernes",
        description: "Películas para dos",
        members: [
          {
            id: 1,
            name: "Ana",
            email: "ana@example.com",
            role: "owner",
            initials: "A",
          },
        ],
        itemCount: 0,
        pendingCount: 0,
        watchedCount: 0,
        items: [],
      },
      status: 200,
    });

    render(<ListDetailPage />);

    expect(screen.getByText("Cargando lista...")).toBeInTheDocument();
    await waitFor(() => expect(getWatchList).toHaveBeenCalledWith(7));
    expect(
      await screen.findByRole("heading", { name: "Noches de viernes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Películas para dos")).toBeInTheDocument();
    expect(screen.getByText("Esta lista aún no tiene títulos. Agrega uno desde búsqueda.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /invitar/i })).toHaveAttribute(
      "href",
      "#invite-panel",
    );
  });

  it("shows an error when the API cannot load the list", async () => {
    (getWatchList as jest.Mock).mockResolvedValue({
      data: null,
      status: 403,
      error: "No tienes acceso a esta lista",
    });

    render(<ListDetailPage />);

    await waitFor(() => expect(getWatchList).toHaveBeenCalledWith(7));
    expect(
      await screen.findByRole("heading", { name: "Lista no disponible" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No tienes acceso a esta lista",
    );
  });

  it("marks a pending item watched and uses the updated list response", async () => {
    (getWatchList as jest.Mock).mockResolvedValue({
      data: listWithPendingItem,
      status: 200,
    });
    (markListItemWatched as jest.Mock).mockResolvedValue({
      data: {
        ...listWithPendingItem,
        pendingCount: 0,
        watchedCount: 1,
        items: [
          {
            ...listWithPendingItem.items[0],
            status: "watchedTogether",
            watchedAt: "2026-06-01T00:00:00.000Z",
          },
        ],
      },
      status: 201,
    });

    render(<ListDetailPage />);

    await screen.findByRole("heading", { name: "Noches de viernes" });
    screen.getByRole("button", { name: /Past Lives/i }).click();

    await waitFor(() => expect(markListItemWatched).toHaveBeenCalledWith(7, 10));
    expect(await screen.findByText("0 pendientes")).toBeInTheDocument();
    expect(undoLatestWatch).not.toHaveBeenCalled();
  });

  it("undoes the latest watch event for a watched item", async () => {
    const watchedList = {
      ...listWithPendingItem,
      pendingCount: 0,
      watchedCount: 1,
      items: [
        {
          ...listWithPendingItem.items[0],
          status: "watchedTogether" as const,
          watchedAt: "2026-06-01T00:00:00.000Z",
        },
      ],
    };
    (getWatchList as jest.Mock).mockResolvedValue({
      data: watchedList,
      status: 200,
    });
    (undoLatestWatch as jest.Mock).mockResolvedValue({
      data: listWithPendingItem,
      status: 200,
    });

    render(<ListDetailPage />);

    await screen.findByRole("heading", { name: "Noches de viernes" });
    screen.getByRole("button", { name: /Past Lives/i }).click();

    await waitFor(() => expect(undoLatestWatch).toHaveBeenCalledWith(7, 10));
    expect(await screen.findByText("1 pendientes")).toBeInTheDocument();
    expect(markListItemWatched).not.toHaveBeenCalled();
  });
});
