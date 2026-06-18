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

test.describe("create list", () => {
  test("creates a shared list and redirects to the list workspace", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page);

    await page.route("**/api/watch-lists", async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON() as {
          name: string;
          description?: string;
        };

        expect(body).toEqual({
          name: "Noches de viernes",
          description: "Películas para dos",
        });

        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: 42,
            name: body.name,
            description: body.description,
            members: [],
            itemCount: 0,
            pendingCount: 0,
            watchedCount: 0,
            items: [],
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/lists/new");

    await expect(
      page.getByRole("heading", { name: "Crear lista compartida" }),
    ).toBeVisible();
    await page.getByLabel("Nombre").fill("Noches de viernes");
    await page.getByLabel("Descripción").fill("Películas para dos");
    await page.getByRole("button", { name: "Crear lista" }).click();

    await expect(page).toHaveURL(/\/lists\?list=42$/);
  });
});
