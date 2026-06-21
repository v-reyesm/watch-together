import { expect, test, type Page } from "@playwright/test";

type UserProfile = {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
};

const authUser: UserProfile = {
  id: 7,
  email: "ana@example.com",
  name: "Ana",
  avatarUrl: null,
};

async function expectSignInPage(page: Page) {
  await expect(page).toHaveURL(/\/sign-in(?:\?.*)?$/);
  await expect(
    page.getByText("Ingresa tus credenciales para continuar"),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Contraseña", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Iniciar sesión" }),
  ).toBeVisible();
}

async function expectProfilePage(page: Page, user: UserProfile = authUser) {
  await expect(page).toHaveURL("/profile");
  await expect(page.getByRole("heading", { name: "Perfil" })).toBeVisible();
  await expect(page.getByText("Tu cuenta y preferencias")).toBeVisible();
  await expect(page.getByRole("main").getByText(user.email)).toBeVisible();
  await expect(page.getByLabel("Nombre para mostrar")).toHaveValue(user.name);
  await expect(
    page.getByRole("button", { name: /Cerrar sesión/ }),
  ).toBeVisible();
}

async function mockLoggedOutSession(page: Page) {
  await page.route("**/api/users/me", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Sesión expirada" }),
    });
  });
}

async function mockAuthenticatedSession(
  page: Page,
  user: UserProfile = authUser,
) {
  await page.route("**/api/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });
}

test.describe("auth", () => {
  test("allows register and signs the new user into the app", async ({
    page,
  }) => {
    await page.route("**/api/auth/register", async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        name: "Ana",
        email: authUser.email,
        password: "password123",
      });

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ accessToken: "register-token" }),
      });
    });
    await mockAuthenticatedSession(page);

    await page.goto("/register");
    await expect(page.getByText("Crear cuenta").first()).toBeVisible();
    await page.getByLabel("Nombre").fill("Ana");
    await page.getByLabel("Email").fill(authUser.email);
    await page.getByLabel("Contraseña", { exact: true }).fill("password123");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "Mis listas" }),
    ).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate(() => window.sessionStorage.getItem("wt_token")),
      )
      .toBe("register-token");
  });

  test("redirects a guest from a protected page to sign-in", async ({
    page,
  }) => {
    await mockLoggedOutSession(page);

    await page.goto("/profile");
    await expectSignInPage(page);
  });

  test("allows sign-in and sign-out from the profile flow", async ({
    page,
  }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accessToken: "playwright-token" }),
      });
    });
    await mockAuthenticatedSession(page);

    await page.goto("/sign-in");
    await expectSignInPage(page);
    await page.getByLabel("Email").fill(authUser.email);
    await page.getByLabel("Contraseña", { exact: true }).fill("password123");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "Mis listas" }),
    ).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate(() => window.sessionStorage.getItem("wt_token")),
      )
      .toBe("playwright-token");

    await page.goto("/profile");
    await expectProfilePage(page);

    await page.getByRole("button", { name: /Cerrar sesión/ }).click();
    await expectSignInPage(page);

    await expect
      .poll(async () =>
        page.evaluate(() => window.sessionStorage.getItem("wt_token")),
      )
      .toBeNull();
  });

  test("clears session storage and redirects when the session expires", async ({
    page,
  }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accessToken: "expiring-token" }),
      });
    });
    await mockAuthenticatedSession(page);
    await page.route("**/api/users/me", async (route) => {
      if (route.request().method() === "PATCH") {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "Sesión expirada" }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(authUser),
      });
    });

    await page.goto("/sign-in");
    await expectSignInPage(page);
    await page.getByLabel("Email").fill(authUser.email);
    await page.getByLabel("Contraseña", { exact: true }).fill("password123");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page).toHaveURL("/");
    await expect
      .poll(async () =>
        page.evaluate(() => window.sessionStorage.getItem("wt_token")),
      )
      .toBe("expiring-token");

    await page.goto("/profile");
    await expectProfilePage(page);
    await page.getByLabel("Nombre para mostrar").fill("Ana Maria");
    await page.getByRole("button", { name: "Guardar" }).click();

    await expect(page).toHaveURL(/\/sign-in\?expired=1$/);
    await expect(
      page
        .getByRole("alert")
        .getByText("Tu sesión ha expirado. Inicia sesión de nuevo."),
    ).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate(() => window.sessionStorage.getItem("wt_token")),
      )
      .toBeNull();
  });
});
