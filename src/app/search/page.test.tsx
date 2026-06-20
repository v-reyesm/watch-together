/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchPage from "./page";
import {
  getMediaDetails,
  getWatchLists,
  searchMedia,
} from "@/lib/watch-api";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("@/lib/auth", () => ({
  useAuth: () => ({
    user: { id: 1, email: "ana@example.com", name: "Ana", avatarUrl: null },
  }),
}));

jest.mock("@/components/poster-image", () => ({
  PosterImage: () => <img data-testid="poster-image" alt="" />,
}));

jest.mock("@/lib/watch-api", () => ({
  getWatchLists: jest.fn(),
  searchMedia: jest.fn(),
  addListItem: jest.fn(),
  getMediaDetails: jest.fn(),
}));

const mockLists = [
  {
    id: 5,
    name: "Noches de viernes",
    description: "",
    members: [{ id: 1, name: "Ana", email: "ana@example.com", role: "owner", initials: "A" }],
    itemCount: 0,
    pendingCount: 0,
    watchedCount: 0,
    items: [],
  },
];

const mockResults = [
  {
    id: 100,
    title: "Past Lives",
    translatedTitle: "Vidas pasadas",
    releaseDate: "2023-06-02T00:00:00.000Z",
    posterUrl: "",
    overview: "Two childhood friends reconnect.",
    genres: ["Drama"],
    originalLanguage: "en",
    rating: 7.8,
    mediaType: "movie" as const,
  },
  {
    id: 200,
    title: "The Bear",
    translatedTitle: "El Oso",
    releaseDate: "2022-06-23T00:00:00.000Z",
    posterUrl: "",
    overview: "A chef returns home.",
    genres: ["Drama", "Comedy"],
    originalLanguage: "en",
    rating: 8.6,
    mediaType: "tv" as const,
  },
  {
    id: 300,
    title: "Oppenheimer",
    translatedTitle: "Oppenheimer",
    releaseDate: "2023-07-21T00:00:00.000Z",
    posterUrl: "",
    overview: "The story of the atomic bomb.",
    genres: ["Drama", "History"],
    originalLanguage: "en",
    rating: 8.3,
    mediaType: "movie" as const,
  },
];

const mockDetails: Record<string, { providers: string[]; director: string | null; cast: string[] }> = {
  "movie-100": {
    providers: ["Netflix"],
    director: "Celine Song",
    cast: ["Greta Lee", "Teo Yoo"],
  },
  "tv-200": {
    providers: ["Disney+", "Star+"],
    director: null,
    cast: ["Jeremy Allen White", "Ayo Edebiri"],
  },
  "movie-300": {
    providers: ["Netflix"],
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Robert Downey Jr."],
  },
};

/** Perform a search and wait for results to appear. */
async function searchAndWait() {
  const input = screen.getByPlaceholderText("Buscar películas o series...");
  fireEvent.change(input, { target: { value: "test" } });
  fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
  // Title appears twice in grid view (PosterBlock + label), so use findAllByText
  await waitFor(() => {
    expect(screen.getAllByText("Vidas pasadas").length).toBeGreaterThan(0);
  });
}

/** Check that a title is rendered on the page (may appear more than once in grid). */
function expectTitleVisible(title: string) {
  expect(screen.getAllByText(title).length).toBeGreaterThan(0);
}

/** Check that a title is NOT rendered. */
function expectTitleGone(title: string) {
  expect(screen.queryAllByText(title)).toHaveLength(0);
}

describe("SearchPage filters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getWatchLists as jest.Mock).mockResolvedValue({
      data: mockLists,
      status: 200,
    });
    (searchMedia as jest.Mock).mockResolvedValue({
      data: mockResults,
      status: 200,
    });
    (getMediaDetails as jest.Mock).mockImplementation(
      (mediaId: number, type: string) => {
        const key = `${type}-${mediaId}`;
        const data = mockDetails[key] ?? null;
        return Promise.resolve({ data, status: 200 });
      },
    );
  });

  it("shows year filter options derived from search results", async () => {
    render(<SearchPage />);
    await searchAndWait();

    const yearSelect = screen.getByRole("combobox", { name: /año/i });
    expect(yearSelect).toBeInTheDocument();

    const options = within(yearSelect).getAllByRole("option");
    const optionTexts = options.map((o) => o.textContent);
    // "Todos" + 2023 + 2022 (sorted descending)
    expect(optionTexts).toEqual(["Todos", "2023", "2022"]);
  });

  it("filters results by selected year", async () => {
    render(<SearchPage />);
    await searchAndWait();

    // All three results visible initially
    expectTitleVisible("Vidas pasadas");
    expectTitleVisible("El Oso");
    expectTitleVisible("Oppenheimer");

    // Select year 2022
    const yearSelect = screen.getByRole("combobox", { name: /año/i });
    fireEvent.change(yearSelect, { target: { value: "2022" } });

    // Only The Bear (2022) should remain
    await waitFor(() => {
      expectTitleGone("Vidas pasadas");
      expectTitleVisible("El Oso");
      expectTitleGone("Oppenheimer");
    });
  });

  it("fetches details lazily when actor select is focused", async () => {
    render(<SearchPage />);
    await searchAndWait();

    expect(getMediaDetails).not.toHaveBeenCalled();

    const actorSelect = screen.getByRole("combobox", { name: /actor/i });
    fireEvent.focus(actorSelect);

    await waitFor(() => {
      expect(getMediaDetails).toHaveBeenCalledTimes(3);
    });
  });

  it("filters results by selected actor", async () => {
    render(<SearchPage />);
    await searchAndWait();

    // Trigger detail loading via actor filter focus
    const actorSelect = screen.getByRole("combobox", { name: /actor/i });
    fireEvent.focus(actorSelect);

    // Wait for actor options to appear
    await waitFor(() => {
      const options = within(actorSelect).getAllByRole("option");
      expect(options.length).toBeGreaterThan(1); // more than just "Todos"
    });

    // Select "Greta Lee" (only in Past Lives)
    fireEvent.change(actorSelect, { target: { value: "Greta Lee" } });

    await waitFor(() => {
      expectTitleVisible("Vidas pasadas");
      expectTitleGone("El Oso");
      expectTitleGone("Oppenheimer");
    });
  });

  it("filters results by selected provider/platform", async () => {
    render(<SearchPage />);
    await searchAndWait();

    // Trigger detail loading via provider filter focus
    const providerSelect = screen.getByRole("combobox", { name: /plataforma/i });
    fireEvent.focus(providerSelect);

    await waitFor(() => {
      const options = within(providerSelect).getAllByRole("option");
      expect(options.length).toBeGreaterThan(1);
    });

    // Select "Disney+" (only in The Bear)
    fireEvent.change(providerSelect, { target: { value: "Disney+" } });

    await waitFor(() => {
      expectTitleGone("Vidas pasadas");
      expectTitleVisible("El Oso");
      expectTitleGone("Oppenheimer");
    });
  });

  it("shows empty-filter message when all results are filtered out", async () => {
    render(<SearchPage />);
    await searchAndWait();

    // Trigger detail loading
    const actorSelect = screen.getByRole("combobox", { name: /actor/i });
    fireEvent.focus(actorSelect);

    await waitFor(() => {
      const options = within(actorSelect).getAllByRole("option");
      expect(options.length).toBeGreaterThan(1);
    });

    // Select an actor, then also filter by a year that doesn't match
    fireEvent.change(actorSelect, { target: { value: "Greta Lee" } });
    const yearSelect = screen.getByRole("combobox", { name: /año/i });
    fireEvent.change(yearSelect, { target: { value: "2022" } });

    // No result matches both Greta Lee (movie-100, 2023) and year 2022
    await waitFor(() => {
      expect(
        screen.getByText("Ningún resultado coincide con los filtros seleccionados."),
      ).toBeInTheDocument();
    });
  });

  it("resets actor and provider filters when a new search is performed", async () => {
    render(<SearchPage />);
    await searchAndWait();

    // Set actor filter
    const actorSelect = screen.getByRole("combobox", { name: /actor/i });
    fireEvent.focus(actorSelect);
    await waitFor(() => {
      expect(within(actorSelect).getAllByRole("option").length).toBeGreaterThan(1);
    });
    fireEvent.change(actorSelect, { target: { value: "Greta Lee" } });

    // Perform a new search
    (searchMedia as jest.Mock).mockResolvedValue({
      data: [mockResults[1]], // only The Bear
      status: 200,
    });
    fireEvent.change(
      screen.getByPlaceholderText("Buscar películas o series..."),
      { target: { value: "bear" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() => {
      expect(screen.getAllByText("El Oso").length).toBeGreaterThan(0);
    });

    // Actor filter should be reset (select value back to "")
    expect(actorSelect).toHaveValue("");
  });
});
