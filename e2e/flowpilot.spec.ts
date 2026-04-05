import { expect, test } from "@playwright/test";

test("user can open a template and generate a revision", async ({ page }) => {
  test.setTimeout(120000);

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Support Escalation Flow" }),
  ).toBeVisible();

  await page.goto("/workspace/support-escalation", {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByRole("heading", { level: 1, name: "Support Escalation Flow" }),
  ).toBeVisible();

  await page.getByRole("button", { name: /^run$/i }).click();
  await page.getByText("Standard mock stream").click();

  await expect(page.getByRole("button", { name: /^retry$/i })).toBeVisible({
    timeout: 20000,
  });
  await expect(
    page.getByRole("button", { name: /revision 1/i }).first(),
  ).toBeVisible();
});
