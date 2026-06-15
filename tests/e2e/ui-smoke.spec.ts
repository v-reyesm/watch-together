import { expect, type Page, test } from "@playwright/test";

const user = {
  id: 1,
  email: "ui@example.com",
  name: "UI Tester",
  avatarUrl: null,
};

const apiItem = {
  id: 10,
  providerName: "tmdb",
  providerId: 666277,
  mediaType: "movie",
  title: "Past Lives",
  translatedTitle: "Past Lives",
  year: 2023,
  posterUrl: "",
  summary: "Two childhood friends reconnect.",
  overview: "Two childhood friends reconnect.",
  genres: ["Drama", "Romance"],
  originalLanguage: "en",
  rating: 7.8,
  status: "pending",
  watchedAt: null,
};

const apiList = {
  id: 1,
  name: "Noches de viernes",
  description: "Peliculas para dos",
  members: [
    {
      id: 1,
      name: "Tú",
      email: "ui@example.com",
      role: "owner",
      initials: "T",
    },
    {
      id: 2,
      name: "Ana",
      email: "ana@example.com",
      role: "member",
      initials: "A",
    },
  ],
  itemCount: 1,
  pendingCount: 1,
  watchedCount: 0,
  items: [apiItem],
};

async function mockAuthenticatedUser(page: Page) {
  await page.route("**/api/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });
  await page.route("**/api/watch-lists/summary", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        listCount: 1,
        itemCount: 1,
        watchedCount: 0,
        pendingCount: 1,
        lists: [apiList],
        highlightedItems: [apiItem],
      }),
    });
  });
  await page.route("**/api/watch-lists", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([apiList]),
    });
  });
  await page.route("**/api/watch-lists/1", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(apiList),
    });
  });
  await page.route("**/api/media/search?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 666277,
          title: "Past Lives",
          translatedTitle: "Past Lives",
          releaseDate: "2023-06-02T00:00:00.000Z",
          posterUrl: "",
          overview: "Two childhood friends reconnect.",
          genres: [],
          originalLanguage: "en",
          rating: 7.8,
          mediaType: "movie",
        },
      ]),
    });
  });

  await page.addInitScript(() => {
    window.sessionStorage.setItem("wt_token", "e2e-token");
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth + 1;
  });

  expect(hasOverflow).toBe(false);
}

test.describe("public auth UI", () => {
  test("sign-in and register render the expected auth shells", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    await expect(page.getByText("Iniciar sesión").first()).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(page.getByRole("link", { name: "Regístrate" })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole("link", { name: "Regístrate" }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText("Crear cuenta").first()).toBeVisible();
    await expect(page.getByLabel("Nombre")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Inicia sesión" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("authenticated UI", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test("dashboard keeps future modules out of the main MVP surface", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Mis listas" }),
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("heading", {
        name: "Noches de viernes",
      }),
    ).toBeVisible();
    await expect(page.getByText("Pendientes destacados")).toBeVisible();
    await expect(page.getByText("Decidir rapido")).toHaveCount(0);
    await expect(page.getByText("Futuro ranking")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("lists workspace renders proposal layout without coming-soon modules", async ({
    page,
  }) => {
    await page.goto("/lists");

    await expect(
      page.getByRole("heading", { name: "Noches de viernes" }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Buscar en esta lista..."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Past Lives/ }),
    ).toBeVisible();
    await expect(page.getByText("Pendiente").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Próximamente|Nuevo/ }),
    ).toBeVisible();
    await expect(page.getByText("Decidir rapido")).toHaveCount(0);
    await expect(page.getByText("Futuro ranking")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("coming soon groups ranking and quick decision previews", async ({
    page,
  }) => {
    await page.goto("/coming-soon");

    await expect(
      page.getByRole("heading", { name: "Funciones futuras" }),
    ).toBeVisible();
    await expect(page.getByText("Decidir rapido")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Una tarjeta a la vez" }),
    ).toBeVisible();
    await expect(page.getByText("Futuro ranking")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Interés por persona" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("search and config retain key UI controls", async ({ page }) => {
    await page.goto("/search");

    await expect(
      page.getByRole("heading", { name: "Buscar y agregar" }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Buscar películas o series en TMDB..."),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Resultados" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/config");

    await expect(
      page.getByRole("heading", { name: "Estilo y acento" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Rosita", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Bosque", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Terracota", exact: true }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
