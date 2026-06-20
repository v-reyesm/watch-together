import { expect, test, type Page } from "@playwright/test";

const user = {
  id: 1,
  email: "owner@example.com",
  name: "Owner User",
  avatarUrl: null,
};

const watchLists = [
  {
    id: 5,
    name: "Noches de viernes",
    description: "Películas para dos",
    members: [],
    itemCount: 0,
    pendingCount: 0,
    watchedCount: 0,
    items: [],
  },
];

const searchResults = [
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
];

const mediaDetails: Record<string, { providers: string[]; director: string | null; cast: string[] }> = {
  "movie-100": {
    providers: ["Netflix"],
    director: "Celine Song",
    cast: ["Greta Lee", "Teo Yoo"],
  },
  "tv-200": {
    providers: ["Disney+"],
    director: null,
    cast: ["Jeremy Allen White", "Ayo Edebiri"],
  },
};

async function setupMocks(page: Page) {
  await page.route("**/api/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });

  await page.addInitScript(() => {
    window.sessionStorage.setItem("wt_token", "e2e-token");
  });

  await page.route("**/api/watch-lists", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(watchLists),
    });
  });

  await page.route("**/api/media/search?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(searchResults),
    });
  });

  await page.route("**/api/media/*/details?**", async (route) => {
    const url = new URL(route.request().url());
    const pathParts = url.pathname.split("/");
    const mediaId = pathParts[pathParts.indexOf("media") + 1];
    const type = url.searchParams.get("type") ?? "movie";
    const key = `${type}-${mediaId}`;
    const data = mediaDetails[key] ?? { providers: [], director: null, cast: [] };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
}

test.describe("search filters", () => {
  test("year filter narrows visible results to the chosen year", async ({
    page,
  }) => {
    await setupMocks(page);
    await page.goto("/search");

    await page.getByPlaceholder("Buscar películas o series...").fill("test");
    await page.getByRole("button", { name: "Buscar" }).click();

    // Both results visible
    await expect(page.getByText("Vidas pasadas").first()).toBeVisible();
    await expect(page.getByText("El Oso").first()).toBeVisible();

    // Select year 2022 via the year filter
    const yearSelect = page.getByRole("combobox", { name: /año/i });
    await yearSelect.selectOption("2022");

    // Only The Bear (2022) should remain
    await expect(page.getByText("El Oso").first()).toBeVisible();
    await expect(page.getByText("Vidas pasadas")).not.toBeVisible();
  });

  test("actor filter fetches details and narrows results to selected actor", async ({
    page,
  }) => {
    await setupMocks(page);
    await page.goto("/search");

    await page.getByPlaceholder("Buscar películas o series...").fill("test");
    await page.getByRole("button", { name: "Buscar" }).click();

    await expect(page.getByText("Vidas pasadas").first()).toBeVisible();

    // Focus the actor select to trigger detail fetching
    const actorSelect = page.getByRole("combobox", { name: /actor/i });
    await actorSelect.focus();

    // Wait for options to load (more than just "Todos")
    await expect(actorSelect.locator("option")).not.toHaveCount(1);

    // Select "Greta Lee" (only in Past Lives)
    await actorSelect.selectOption("Greta Lee");

    await expect(page.getByText("Vidas pasadas").first()).toBeVisible();
    await expect(page.getByText("El Oso")).not.toBeVisible();
  });

  test("provider filter narrows results to selected platform", async ({
    page,
  }) => {
    await setupMocks(page);
    await page.goto("/search");

    await page.getByPlaceholder("Buscar películas o series...").fill("test");
    await page.getByRole("button", { name: "Buscar" }).click();

    await expect(page.getByText("Vidas pasadas").first()).toBeVisible();

    // Focus the provider select to trigger detail fetching
    const providerSelect = page.getByRole("combobox", { name: /plataforma/i });
    await providerSelect.focus();

    await expect(providerSelect.locator("option")).not.toHaveCount(1);

    // Select "Disney+" (only in The Bear)
    await providerSelect.selectOption("Disney+");

    await expect(page.getByText("El Oso").first()).toBeVisible();
    await expect(page.getByText("Vidas pasadas")).not.toBeVisible();
  });

  test("shows no-results message when all filters combined exclude everything", async ({
    page,
  }) => {
    await setupMocks(page);
    await page.goto("/search");

    await page.getByPlaceholder("Buscar películas o series...").fill("test");
    await page.getByRole("button", { name: "Buscar" }).click();

    await expect(page.getByText("Vidas pasadas").first()).toBeVisible();

    // Filter by year 2022 and type "movie" (no 2022 movies in the results)
    await page.getByRole("combobox", { name: /año/i }).selectOption("2022");
    await page.getByRole("button", { name: "Películas" }).click();

    await expect(
      page.getByText("Ningún resultado coincide con los filtros seleccionados."),
    ).toBeVisible();
  });
});
