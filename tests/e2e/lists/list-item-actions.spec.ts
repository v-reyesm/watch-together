import { expect, test, type Page } from "@playwright/test";

const user = {
  id: 1,
  email: "owner@example.com",
  name: "Owner User",
  avatarUrl: null,
};

type TestWatchItem = {
  id: number;
  providerName: string;
  providerId: number;
  mediaType: "movie" | "tv";
  title: string;
  translatedTitle: string;
  year: number;
  posterUrl: string;
  overview: string;
  originalLanguage: string;
  rating: number;
  status: "pending" | "watchedTogether" | "watchedAlone";
  watchedAt: string | null;
};

type TestWatchList = {
  id: number;
  name: string;
  description: string;
  members: Array<{
    id: number;
    name: string;
    email: string;
    role: "owner" | "member";
    initials: string;
  }>;
  itemCount: number;
  pendingCount: number;
  watchedCount: number;
  items: TestWatchItem[];
};

const watchedItem: TestWatchItem = {
  id: 10,
  providerName: "tmdb",
  providerId: 666277,
  mediaType: "movie",
  title: "Past Lives",
  translatedTitle: "Past Lives",
  year: 2023,
  posterUrl: "",
  overview: "",
  originalLanguage: "en",
  rating: 7.8,
  status: "watchedTogether",
  watchedAt: "2026-01-01T00:00:00.000Z",
};

const watchedList: TestWatchList = {
  id: 5,
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
  pendingCount: 0,
  watchedCount: 1,
  items: [watchedItem],
};

const pendingList: TestWatchList = {
  ...watchedList,
  pendingCount: 1,
  watchedCount: 0,
  items: [{ ...watchedItem, status: "pending", watchedAt: null }],
};

const emptyList: TestWatchList = {
  ...watchedList,
  itemCount: 0,
  pendingCount: 0,
  watchedCount: 0,
  items: [],
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

test.describe("list item actions", () => {
  test("undoes watched state and removes an item", async ({ page }) => {
    await mockAuthenticatedUser(page);

    let currentList = watchedList;
    let undoCalled = false;
    let removeCalled = false;

    await page.route("**/api/watch-lists", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([currentList]),
      });
    });
    await page.route("**/api/watch-lists/5", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(currentList),
      });
    });
    await page.route(
      "**/api/watch-lists/5/items/10/watch-events/latest",
      async (route) => {
        undoCalled = true;
        currentList = pendingList;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(currentList),
        });
      },
    );
    await page.route("**/api/watch-lists/5/items/10", async (route) => {
      removeCalled = true;
      currentList = emptyList;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(currentList),
      });
    });

    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Past Lives");
      await dialog.accept();
    });

    await page.goto("/lists?list=5");

    await expect(
      page.getByRole("heading", { name: "Noches de viernes" }),
    ).toBeVisible();
    await expect(page.getByText("1 vistas")).toBeVisible();

    await page.getByRole("button", { name: /Deshacer/ }).click();
    await expect.poll(() => undoCalled).toBe(true);
    await expect(page.getByText("1 pendientes")).toBeVisible();

    await page.getByRole("button", { name: /Quitar/ }).click();
    await expect.poll(() => removeCalled).toBe(true);
    await expect(page.getByText("0 vistas")).toBeVisible();
  });
});
