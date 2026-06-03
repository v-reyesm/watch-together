/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ListsPage from "./page";
import {
  createInvite,
  getWatchList,
  getWatchLists,
  removeListItem,
  undoLatestWatch,
} from "@/lib/watch-api";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("list=5"),
}));

jest.mock("@/lib/watch-api", () => ({
  createInvite: jest.fn(),
  getWatchLists: jest.fn(),
  getWatchList: jest.fn(),
  markListItemWatched: jest.fn(),
  removeListItem: jest.fn(),
  undoLatestWatch: jest.fn(),
}));

const baseList = {
  id: 5,
  name: "Noches de viernes",
  description: "",
  members: [
    {
      id: 1,
      name: "Ana",
      email: "ana@example.com",
      role: "owner" as const,
      initials: "A",
    },
  ],
  itemCount: 1,
  pendingCount: 0,
  watchedCount: 1,
  items: [
    {
      id: 10,
      providerName: "tmdb",
      providerId: 666277,
      mediaType: "movie" as const,
      title: "Past Lives",
      translatedTitle: "Past Lives",
      year: 2023,
      posterUrl: "",
      overview: "",
      originalLanguage: "en",
      rating: 7.8,
      status: "watchedTogether" as const,
      watchedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

describe("ListsPage item actions", () => {
  let originalClipboardDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    jest.clearAllMocks();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    (getWatchLists as jest.Mock).mockResolvedValue({
      data: [baseList],
      status: 200,
    });
    (getWatchList as jest.Mock).mockResolvedValue({
      data: baseList,
      status: 200,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalClipboardDescriptor) {
      Object.defineProperty(navigator, "clipboard", originalClipboardDescriptor);
      return;
    }

    Reflect.deleteProperty(navigator as object, "clipboard");
  });

  it("removes an item after confirmation", async () => {
    (removeListItem as jest.Mock).mockResolvedValue({
      data: { ...baseList, itemCount: 0, pendingCount: 0, watchedCount: 0, items: [] },
      status: 200,
    });

    render(<ListsPage />);

    await screen.findByRole("heading", { name: "Noches de viernes" });
    fireEvent.click(screen.getByRole("button", { name: /quitar/i }));

    await waitFor(() => expect(window.confirm).toHaveBeenCalled());
    expect(removeListItem).toHaveBeenCalledWith(5, 10);
    expect(await screen.findByText("0 vistas")).toBeInTheDocument();
  });

  it("undoes the latest watch event for watched items", async () => {
    (undoLatestWatch as jest.Mock).mockResolvedValue({
      data: {
        ...baseList,
        pendingCount: 1,
        watchedCount: 0,
        items: [{ ...baseList.items[0], status: "pending", watchedAt: null }],
      },
      status: 200,
    });

    render(<ListsPage />);

    await screen.findByRole("heading", { name: "Noches de viernes" });
    fireEvent.click(screen.getByRole("button", { name: /deshacer/i }));

    await waitFor(() => expect(undoLatestWatch).toHaveBeenCalledWith(5, 10));
    expect(await screen.findByText("1 pendientes")).toBeInTheDocument();
  });

  it("shows the invite link when clipboard is unavailable", async () => {
    const expectedInviteUrl = `${window.location.origin}/invites/invite-token`;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
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

    render(<ListsPage />);

    await screen.findByRole("heading", { name: "Noches de viernes" });
    fireEvent.click(screen.getByRole("button", { name: /invitar/i }));

    expect(
      await screen.findByText("Invitación creada. Copia el enlace para compartirlo."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: expectedInviteUrl }))
      .toHaveAttribute("href", expectedInviteUrl);
  });
});
