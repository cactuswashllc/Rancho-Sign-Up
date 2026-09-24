import { expect, test } from "@playwright/test";

test("parent signs up, edits, and cancels", async ({ page }, info) => {
  const n = info.project.name;
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Upcoming events" })).toBeVisible();
  await page.getByRole("link", { name: /3rd Grade Halloween Party/ }).click();

  await expect(page.getByRole("heading", { level: 1, name: "3rd Grade Halloween Party" })).toBeVisible();
  // No Amazon button until the parent has signed up.
  await expect(page.getByRole("link", { name: /Buy on Amazon/ })).toHaveCount(0);
  await expect(page.getByRole("progressbar", { name: "Items covered" })).toBeVisible();

  // Sign-up button is disabled until something is selected.
  const submit = page.getByRole("button", { name: "Sign up" });
  await expect(submit).toBeDisabled();
  await page.getByRole("button", { name: "Increase Quantity of Napkins" }).click();
  await expect(submit).toBeEnabled();

  // Server-side validation keeps what was typed.
  await page.getByLabel("Your name").fill(`Pat ${n}`);
  await submit.click();
  await expect(page.getByText("Please fix the highlighted fields.")).toBeVisible();
  await expect(page.getByLabel("Your name")).toHaveValue(`Pat ${n}`);

  await page.getByLabel("Email").fill(`pat.${n}@example.com`);
  await page.getByLabel("Student's name").fill("Riley");
  await page.getByLabel("Grade").selectOption("3rd");
  await submit.click();

  await expect(page.getByRole("heading", { name: `Thank you, Pat ${n}!` })).toBeVisible();
  await expect(page.getByText("1 ×")).toBeVisible();
  // After signing up: exactly one Amazon button, pointing at the event's gift list.
  const buy = page.getByRole("link", { name: /Buy on Amazon/ });
  await expect(buy).toHaveCount(1);
  await expect(buy).toHaveAttribute("href", "https://www.amazon.com/hz/wishlist/ls/DEMO123");

  // Edit: bring 2 juice boxes too.
  await page.getByRole("button", { name: "Increase Quantity of Juice boxes (10-pack)" }).click();
  await page.getByRole("button", { name: "Increase Quantity of Juice boxes (10-pack)" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved")).toBeVisible();
  await expect(page.getByText("2 ×")).toBeVisible();

  // Cancel.
  await page.getByRole("button", { name: "Cancel my sign-up" }).click();
  await page.getByRole("button", { name: "Yes, cancel it" }).click();
  await expect(page.getByRole("heading", { name: "Your sign-up was cancelled" })).toBeVisible();
});

test("public list never shows parent names", async ({ page }) => {
  await page.goto("/events/demo-halloween-party");
  await expect(page.getByText(/example\.com/)).toHaveCount(0);
});

test("bad manage link is a 404", async ({ page }) => {
  const res = await page.goto("/signup/not-a-real-token");
  expect(res?.status()).toBe(404);
});
