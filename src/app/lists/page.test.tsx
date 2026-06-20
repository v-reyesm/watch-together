/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ListsPage from "./page";
import {
  getWatchList,
  getWatchLists,
  removeListItem,
  undoLatestWatch,
} from "@/lib/watch-api";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("list=5"),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("@/lib/auth", () => ({
  useAuth: () => ({
    user: { id: 1, email: "ana@example.com", name: "Ana", avatarUrl: null },
  }),
}));

jest.mock("@/components/invite-modal", () => ({
  InviteModal: () => <div data-testid="invite-modal" />,
}));

jest.mock("@/lib/watch-api", () => ({
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
      summary: "",
      overview: "",
      genres: [],
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

  it("removes an item after confirming in the dialog", async () => {
    (removeListItem as jest.Mock).mockResolvedValue({
      data: { ...baseList, itemCount: 0, pendingCount: 0, watchedCount: 0, items: [] },
      status: 200,
    });

    render(<ListsPage />);

    await screen.findByRole("heading", { name: "Noches de viernes" });
    fireEvent.click(screen.getByRole("button", { name: /quitar/i }));

    // The confirmation dialog should appear with the title name in its heading
    const dialogTitle = await screen.findByRole("heading", {
      name: /Quitar.*Past Lives/,
    });
    expect(dialogTitle).toBeInTheDocument();
    const confirmButton = screen.getByRole("button", { name: "Quitar" });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(removeListItem).toHaveBeenCalledWith(5, 10));
    expect(await screen.findByText("0 vistas")).toBeInTheDocument();
  });

  it("does not remove an item when the dialog is cancelled", async () => {
    render(<ListsPage />);

    await screen.findByRole("heading", { name: "Noches de viernes" });
    fireEvent.click(screen.getByRole("button", { name: /quitar/i }));

    // The confirmation dialog should appear; click Cancel
    const cancelButton = await screen.findByRole("button", { name: "Cancelar" });
    fireEvent.click(cancelButton);

    expect(removeListItem).not.toHaveBeenCalled();
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

  it("shows the invite button for owners that opens a modal", async () => {
    render(<ListsPage />);

    await screen.findByRole("heading", { name: "Noches de viernes" });
    const inviteButton = screen.getByRole("button", { name: /invitar/i });
    expect(inviteButton).toBeInTheDocument();
  });
});
