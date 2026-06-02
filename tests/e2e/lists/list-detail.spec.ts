import { expect, test, type Page } from "@playwright/test";

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
});
