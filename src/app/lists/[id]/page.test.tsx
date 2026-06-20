/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ListDetailPage from "./page";
import {
  deleteWatchList,
  getWatchList,
  leaveWatchList,
  markListItemWatched,
  removeListMember,
  undoLatestWatch,
  updateWatchList,
} from "@/lib/watch-api";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "7" }),
  useRouter: () => ({ push: pushMock }),
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
  deleteWatchList: jest.fn(),
  getWatchList: jest.fn(),
  leaveWatchList: jest.fn(),
  markListItemWatched: jest.fn(),
  removeListMember: jest.fn(),
  undoLatestWatch: jest.fn(),
  updateWatchList: jest.fn(),
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
    expect(screen.getByRole("button", { name: /invitar/i })).toBeInTheDocument();
  });

  it("points the add button at search pre-selecting the current list", async () => {
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

    expect(
      await screen.findByRole("link", { name: /agregar titulo/i }),
    ).toHaveAttribute("href", "/search?list=7");
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

  it("lets the owner rename the list and remove a member", async () => {
    const sharedList = {
      ...listWithPendingItem,
      members: [
        ...listWithPendingItem.members,
        {
          id: 2,
          name: "Luis",
          email: "luis@example.com",
          role: "member",
          initials: "L",
        },
      ],
    };
    (getWatchList as jest.Mock).mockResolvedValue({
      data: sharedList,
      status: 200,
    });
    (updateWatchList as jest.Mock).mockResolvedValue({
      data: { ...sharedList, name: "Maratones" },
      status: 200,
    });
    (removeListMember as jest.Mock).mockResolvedValue({
      data: listWithPendingItem,
      status: 200,
    });

    render(<ListDetailPage />);
    await screen.findByRole("heading", { name: "Noches de viernes" });

    fireEvent.click(screen.getByRole("button", { name: /editar/i }));
    fireEvent.change(screen.getByLabelText("Nombre de la lista"), {
      target: { value: "Maratones" },
    });
    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() =>
      expect(updateWatchList).toHaveBeenCalledWith(7, {
        name: "Maratones",
        description: "Películas para dos",
      }),
    );
    expect(
      await screen.findByRole("heading", { name: "Maratones" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /quitar/i }));
    await waitFor(() => expect(removeListMember).toHaveBeenCalledWith(7, 2));
  });

  it("lets the owner delete the list after confirming", async () => {
    (getWatchList as jest.Mock).mockResolvedValue({
      data: listWithPendingItem,
      status: 200,
    });
    (deleteWatchList as jest.Mock).mockResolvedValue({
      data: { ok: true },
      status: 200,
    });

    render(<ListDetailPage />);
    await screen.findByRole("heading", { name: "Noches de viernes" });

    fireEvent.click(screen.getByRole("button", { name: /eliminar lista/i }));
    expect(deleteWatchList).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: /confirmar eliminación/i }),
    );

    await waitFor(() => expect(deleteWatchList).toHaveBeenCalledWith(7));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/lists"));
  });

  it("lets a non-owner member leave the list after confirming", async () => {
    (getWatchList as jest.Mock).mockResolvedValue({
      data: {
        ...listWithPendingItem,
        members: [
          {
            id: 2,
            name: "Luis",
            email: "luis@example.com",
            role: "owner",
            initials: "L",
          },
          {
            id: 1,
            name: "Ana",
            email: "ana@example.com",
            role: "member",
            initials: "A",
          },
        ],
      },
      status: 200,
    });
    (leaveWatchList as jest.Mock).mockResolvedValue({
      data: { ok: true },
      status: 200,
    });

    render(<ListDetailPage />);
    await screen.findByRole("heading", { name: "Noches de viernes" });

    expect(
      screen.queryByRole("button", { name: /eliminar lista/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /salir de la lista/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirmar salida/i }));

    await waitFor(() => expect(leaveWatchList).toHaveBeenCalledWith(7));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/lists"));
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
