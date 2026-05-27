import { expect, type Page, test } from "@playwright/test";

const user = {
  id: 1,
  email: "ui@example.com",
  name: "UI Tester",
  avatarUrl: null,
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
    await expect(page.getByText("Match alto")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Coming soon|Soon/ }),
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
    await expect(page.getByText("Sugerencias visuales")).toBeVisible();
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
