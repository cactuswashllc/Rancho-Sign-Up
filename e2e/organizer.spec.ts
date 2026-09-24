import { expect, test } from "@playwright/test";
import { E2E_SESSION_TOKEN } from "./constants";

test("organizer pages require sign-in", async ({ page }) => {
  await page.goto("/organizer");
  await expect(page).toHaveURL(/\/organizer\/login$/);
  await page.getByLabel("Organizer email").fill("nobody@example.com");
  await page.getByRole("button", { name: "Email me a sign-in link" }).click();
  // Same response whether or not the email is an organizer.
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
});

test("CSV export requires sign-in", async ({ request }) => {
  const res = await request.get("/organizer/events/anything/export");
  expect(res.status()).toBe(401);
});

test.describe("signed in", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await context.addCookies([{ name: "rs_session", value: E2E_SESSION_TOKEN, url: baseURL! }]);
  });

  test("organizer creates an event, adds an item, opens it", async ({ page }, info) => {
    const title = `Valentine Exchange ${info.project.name}`;
    await page.goto("/organizer");
    await page.getByRole("link", { name: "+ New event" }).click();

    await page.getByLabel("Event name").fill(title);
    await page.getByLabel("Date").fill("2099-02-13");
    await page.getByRole("button", { name: /Valentine's Day/ }).click();
    await page.getByLabel("Amazon list link").fill("https://example.com/not-amazon");
    await page.getByRole("button", { name: "Create event" }).click();
    await expect(page.getByText("Must be an amazon.com link")).toBeVisible();

    await page.getByLabel("Amazon list link").fill("https://www.amazon.com/hz/wishlist/ls/E2E");
    await page.getByRole("button", { name: "Create event" }).click();
    await expect(page.getByText("Event created.")).toBeVisible();

    const add = page.locator("form", { has: page.getByRole("heading", { name: "Add an item" }) });
    await add.getByLabel("Item").fill("Valentine cards (class set)");
    await add.getByLabel("Qty needed").fill("3");
    await add.getByRole("button", { name: "Add item" }).click();
    await expect(page.getByText("0 of 3 claimed")).toBeVisible();

    await page.getByRole("button", { name: "Open sign-ups" }).click();
    await expect(page.getByRole("button", { name: "Close sign-ups" })).toBeVisible();

    const link = await page.getByLabel("Public sign-up link").inputValue();
    await page.goto(link);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByText("3 of 3 still needed")).toBeVisible();
  });

  test("organizer sees sign-ups and can export CSV", async ({ page }, info) => {
    const who = `Morgan ${info.project.name}`;
    await page.goto("/events/demo-thanksgiving-feast");
    await page.getByRole("button", { name: "Increase Quantity of Fruit tray" }).click();
    await page.getByLabel("Your name").fill(who);
    await page.getByLabel("Email").fill(`morgan.${info.project.name}@example.com`);
    await page.getByLabel("Student's name").fill("Avery");
    await page.getByLabel("Grade").selectOption("Kindergarten");
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByRole("heading", { name: `Thank you, ${who}!` })).toBeVisible();

    await page.goto("/organizer");
    await page.getByRole("link", { name: /Kindergarten Thanksgiving Feast/ }).click();
    await expect(page.getByText(who)).toBeVisible();

    const download = page.waitForEvent("download");
    await page.getByRole("link", { name: "Download CSV" }).click();
    const file = await (await download).path();
    const csv = (await import("node:fs")).readFileSync(file, "utf8");
    expect(csv).toContain("Parent name,Parent email,Student name,Grade,Item,Quantity");
    expect(csv).toContain(`${who},morgan.${info.project.name}@example.com,Avery,Kindergarten,Fruit tray,1`);
  });
});
