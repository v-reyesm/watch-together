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
  {
    id: 8,
    name: "Series cortas",
    description: "",
    members: [],
    itemCount: 0,
    pendingCount: 0,
    watchedCount: 0,
    items: [],
  },
];

const searchResult = {
  id: 666277,
  title: "Past Lives",
  translatedTitle: "Vidas pasadas",
  releaseDate: "2023-06-02T00:00:00.000Z",
  posterUrl: "",
  overview: "Two childhood friends reconnect.",
  genres: ["Drama", "Romance"],
  originalLanguage: "en",
  rating: 7.8,
  mediaType: "movie" as const,
};

async function mockAuthenticatedUser(page: Page) {
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
}

test.describe("search and add", () => {
  test("searches TMDB through the backend and adds a title to the selected list", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page);

    await page.route("**/api/watch-lists", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(watchLists),
      });
    });
    await page.route("**/api/media/search?**", async (route) => {
      const url = new URL(route.request().url());
      expect(url.searchParams.get("query")).toBe("Past Lives");
      expect(url.searchParams.get("type")).toBe("both");

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([searchResult]),
      });
    });
    await page.route("**/api/watch-lists/8/items", async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        providerName: "tmdb",
        providerId: 666277,
        mediaType: "movie",
        title: "Past Lives",
        translatedTitle: "Vidas pasadas",
        releaseDate: "2023-06-02T00:00:00.000Z",
        overview: "Two childhood friends reconnect.",
        originalLanguage: "en",
        rating: 7.8,
      });

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ...watchLists[1],
          itemCount: 1,
          pendingCount: 1,
          items: [
            {
              id: 44,
              providerName: "tmdb",
              providerId: 666277,
              mediaType: "movie",
              title: "Past Lives",
              translatedTitle: "Vidas pasadas",
              year: 2023,
              posterUrl: "",
              overview: "Two childhood friends reconnect.",
              originalLanguage: "en",
              rating: 7.8,
              status: "pending",
              watchedAt: null,
            },
          ],
        }),
      });
    });

    await page.goto("/search");

    await page.getByPlaceholder("Buscar películas o series en TMDB...").fill(
      "Past Lives",
    );
    await page.getByRole("button", { name: "Buscar" }).click();

    await expect(
      page.getByText("Vidas pasadas", { exact: true }).first(),
    ).toBeVisible();

    await page.getByLabel("Agregar a la lista").selectOption("8");
    await page.getByRole("button", { name: "Agregar a lista" }).click();

    await expect(page.getByRole("status")).toContainText(
      "Título agregado a la lista.",
    );
  });
});
