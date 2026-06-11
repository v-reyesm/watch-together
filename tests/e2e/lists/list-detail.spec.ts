import { expect, test, type Page } from "@playwright/test";
import type { ApiWatchList } from "@/lib/watch-api";

async function mockAuthenticatedUser(page: Page) {
  await page.route("**/api/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 1,
        email: "owner@example.com",
        name: "Owner User",
        avatarUrl: null,
      }),
    });
  });

  await page.addInitScript(() => {
    window.sessionStorage.setItem("wt_token", "e2e-token");
  });
}

test.describe("list detail route", () => {
  test("renders list metadata and empty item state from the API", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page);

    await page.route("**/api/watch-lists/7", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
    });

    await page.goto("/lists/7");

    await expect(
      page.getByRole("heading", { name: "Noches de viernes" }),
    ).toBeVisible();
    await expect(page.getByText("Películas para dos")).toBeVisible();
    await expect(page.getByText("0 pendientes")).toBeVisible();
    await expect(page.getByText("0 vistas")).toBeVisible();
    await expect(
      page.getByText("Esta lista aún no tiene títulos. Agrega uno desde búsqueda."),
    ).toBeVisible();
  });

  test("marks an item as watched from the standalone detail route", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page);

    let currentList: ApiWatchList = {
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
          providerId: 666277,
          mediaType: "movie",
          title: "Past Lives",
          translatedTitle: "Past Lives",
          year: 2023,
          posterUrl: "",
          overview: "Two childhood friends reconnect.",
          originalLanguage: "en",
          rating: 7.8,
          status: "pending",
          watchedAt: null,
        },
      ],
    };
    let markWatchedCalled = false;

    await page.route("**/api/watch-lists/7", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(currentList),
      });
    });
    await page.route("**/api/watch-lists/7/items/10/watch-events", async (route) => {
      markWatchedCalled = true;
      currentList = {
        ...currentList,
        pendingCount: 0,
        watchedCount: 1,
        items: currentList.items.map((item) =>
          item.id === 10
            ? {
                ...item,
                status: "watchedTogether",
                watchedAt: "2026-06-11T00:00:00.000Z",
              }
            : item,
        ),
      };

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(currentList),
      });
    });

    await page.goto("/lists/7");

    await expect(
      page.getByRole("heading", { name: "Noches de viernes" }),
    ).toBeVisible();
    await expect(page.getByText("1 pendientes")).toBeVisible();

    await page.getByRole("button", { name: /Past Lives/ }).click();

    await expect.poll(() => markWatchedCalled).toBe(true);
    await expect(page.getByText("0 pendientes")).toBeVisible();
    await expect(page.getByText("1 vistas")).toBeVisible();
    await expect(page.getByText("Vista juntos")).toBeVisible();
  });
});
