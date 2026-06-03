/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ListDetailPage from "./page";
import { getWatchList } from "@/lib/watch-api";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "7" }),
}));

jest.mock("@/lib/watch-api", () => ({
  getWatchList: jest.fn(),
  markListItemWatched: jest.fn(),
}));

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
});
