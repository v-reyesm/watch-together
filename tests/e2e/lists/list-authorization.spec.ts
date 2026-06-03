import { expect, test, type Page } from "@playwright/test";

async function mockAuthenticatedUser(page: Page) {
  await page.route("**/api/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 2,
        email: "guest@example.com",
        name: "Guest User",
        avatarUrl: null,
      }),
    });
  });

  await page.addInitScript(() => {
    window.sessionStorage.setItem("wt_token", "e2e-token");
  });
}

test.describe("list authorization", () => {
  test("shows a forbidden API message when list detail is denied", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page);

    await page.route("**/api/watch-lists", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: 7,
            name: "Lista privada",
            description: "",
            members: [],
            itemCount: 0,
            pendingCount: 0,
            watchedCount: 0,
            items: [],
          },
        ]),
      });
    });
    await page.route("**/api/watch-lists/7", async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 403,
          message: "No tienes acceso a esta lista",
        }),
      });
    });

    await page.goto("/lists?list=7");

    await expect(page.getByRole("heading", { name: "Listas" })).toBeVisible();
    await expect(
      page.getByText("No tienes acceso a esta lista"),
    ).toBeVisible();
  });
});
