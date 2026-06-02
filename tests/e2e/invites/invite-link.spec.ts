import { expect, test, type Page } from "@playwright/test";

const user = {
  id: 1,
  email: "owner@example.com",
  name: "Owner User",
  avatarUrl: null,
};

const apiList = {
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
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => undefined },
      configurable: true,
    });
  });
}

test.describe("invite links", () => {
  test("creates and copies an invite link from the list header", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page);

    let inviteCreated = false;

    await page.route("**/api/watch-lists", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([apiList]),
      });
    });
    await page.route("**/api/watch-lists/5", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(apiList),
      });
    });
    await page.route("**/api/watch-lists/5/invites", async (route) => {
      inviteCreated = true;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: 99,
          watchListId: 5,
          token: "invite-token",
          expiresAt: "2026-06-09T00:00:00.000Z",
          revokedAt: null,
          usedAt: null,
          createdAt: "2026-06-02T00:00:00.000Z",
          status: "active",
        }),
      });
    });

    await page.goto("/lists?list=5");

    await expect(
      page.getByRole("heading", { name: "Noches de viernes" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Invitar" }).click();

    await expect.poll(() => inviteCreated).toBe(true);
    await expect(
      page.getByText("Invitación creada y enlace copiado."),
    ).toBeVisible();
  });

  test("joins a list from an invite token", async ({ page }) => {
    await mockAuthenticatedUser(page);

    await page.route("**/api/invites/invite-token/join", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          alreadyMember: false,
          watchListId: 5,
          message: "Te uniste a la lista",
        }),
      });
    });

    await page.goto("/invites/invite-token");

    await expect(
      page.getByRole("heading", { name: "Invitación a lista" }),
    ).toBeVisible();
    await expect(page.getByText("Te uniste a la lista")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver lista" })).toHaveAttribute(
      "href",
      "/lists?list=5",
    );
  });
});
