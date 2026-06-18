/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import NewListPage from "./page";
import { createWatchList } from "@/lib/watch-api";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/lib/watch-api", () => ({
  createWatchList: jest.fn(),
}));

describe("NewListPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires a list name before submitting", () => {
    render(<NewListPage />);

    fireEvent.click(screen.getByRole("button", { name: /crear lista/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Escribe un nombre para la lista.",
    );
    expect(createWatchList).not.toHaveBeenCalled();
  });

  it("creates the list and redirects to the current list view", async () => {
    (createWatchList as jest.Mock).mockResolvedValue({
      data: {
        id: 42,
        name: "Noches de viernes",
        description: "Películas para dos",
        members: [],
        itemCount: 0,
        pendingCount: 0,
        watchedCount: 0,
        items: [],
      },
      status: 201,
    });

    render(<NewListPage />);

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "  Noches de viernes  " },
    });
    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "  Películas para dos  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear lista/i }));

    await waitFor(() =>
      expect(createWatchList).toHaveBeenCalledWith({
        name: "Noches de viernes",
        description: "Películas para dos",
      }),
    );
    expect(pushMock).toHaveBeenCalledWith("/lists?list=42");
  });
});
