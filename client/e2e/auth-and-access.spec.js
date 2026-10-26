import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

function uniqueAccount() {
  const suffix = randomUUID();
  return {
    fullName: `Browser Student ${suffix}`,
    email: `browser-student-${suffix}@test.com`,
    password: "P@ssw0rd123",
  };
}

test("registers a student and keeps the session after refresh", async ({
  page,
}) => {
  const account = uniqueAccount();

  await page.goto("/register");
  await page.getByLabel("Full Name").fill(account.fullName);
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Register" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: /welcome/i })).toContainText(
    account.fullName,
  );

  await page.reload();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: /welcome/i })).toContainText(
    account.fullName,
  );
});

test("shows an inline error for invalid login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("missing-account@test.com");
  await page.getByLabel("Password").fill("WrongPass1@");
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    "Email or password is incorrect.",
  );
  await expect(page).toHaveURL("/login");
});

test("redirects logged-out users away from protected pages", async ({
  page,
}) => {
  await page.goto("/admin/moderation");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", {
      name: /internship & co-op experience sharing platform/i,
    }),
  ).toBeVisible();
});

test("shows access denied when a student visits the admin page", async ({
  page,
}) => {
  const account = uniqueAccount();

  await page.goto("/register");
  await page.getByLabel("Full Name").fill(account.fullName);
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Register" }).click();

  await expect(page).toHaveURL("/");
  await page.goto("/admin/moderation");

  await expect(page).toHaveURL("/access-denied");
  await expect(
    page.getByRole("heading", { name: /do not have permission/i }),
  ).toBeVisible();
});

test("student can log in and see the dashboard", async ({ page }) => {
  const account = uniqueAccount();

  await page.goto("/register");
  await page.getByLabel("Full Name").fill(account.fullName);
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL("/");

  await page.getByRole("button", { name: "Log Out" }).click();
  await expect(page).toHaveURL("/login");

  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: /welcome/i })).toContainText(
    account.fullName,
  );
});

async function registerStudent(page) {
  const account = uniqueAccount();
  await page.goto("/register");
  await page.getByLabel("Full Name").fill(account.fullName);
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL("/");
  return account;
}

async function fillExperience(page) {
  await page.getByRole("link", { name: "Create New Experience" }).click();
  await expect(
    page.getByRole("heading", { name: "Create experience" }),
  ).toBeVisible();
  await page.getByLabel("Company name").fill("Playwright Company");
  await page.getByLabel("Role title").fill("Automation Co-op");
  await page.getByLabel("Industry").selectOption({ label: "Technology" });
  await page.getByLabel("City").fill("Burlington");
  await page.getByLabel("Province").fill("ON");
  await page.getByLabel("Start month").fill("1");
  await page.getByLabel("Start year").fill("2026");
  await page.getByLabel("End month").fill("4");
  await page.getByLabel("End year").fill("2026");
  await page.getByLabel("Learning outcomes").fill(
    "Learned how to build reliable automated browser tests.",
  );
  await page.getByLabel("React").check();
  await page.getByRole("button", { name: "Save Draft" }).click();
}

test("student can create an experience draft", async ({ page }) => {
  await registerStudent(page);
  await fillExperience(page);

  await expect(page.getByText("Draft", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Automation Co-op at Playwright Company" }),
  ).toBeVisible();
});

test("student can submit an experience for review", async ({ page }) => {
  await registerStudent(page);
  await fillExperience(page);

  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByText("Pending", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText("Entries under review cannot be edited."),
  ).not.toBeVisible();
});

test("admin can approve a pending experience", async ({ page }) => {
  await registerStudent(page);
  await fillExperience(page);
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByText("Pending", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "Log Out" }).click();
  await expect(page).toHaveURL("/login");
  await page.getByLabel("Email").fill("admin1@test.com");
  await page.getByLabel("Password").fill("P@ssw0rd1");
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page).toHaveURL("/");

  await page.getByRole("link", { name: "Moderation" }).click();
  await expect(
    page.getByRole("heading", { name: "Moderation queue" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(page.getByText("Experience entry approved.")).toBeVisible();
});
