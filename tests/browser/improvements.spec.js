import { test, expect } from "@playwright/test";
test("MamaLingo branding and older favorites survive the update", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "speakeasy-favorites",
      JSON.stringify([
        { en: "Water, please.", ko: "물 주세요.", loc: "restaurant" },
      ]),
    ),
  );
  await page.reload();
  await expect(page.locator(".brand")).toContainText("MamaLingo");
  await expect(page).toHaveTitle(/MamaLingo/);
  await page.locator(".saved-header").click();
  await expect(
    page.getByRole("heading", { name: "Water, please.", exact: true }),
  ).toBeVisible();
  await page.locator("[data-save]").click();
  await page.reload();
  await page.locator(".saved-header").click();
  await expect(page.getByText("나만의 작은 표현집")).toBeVisible();
});
test("airport check-in, all situations, baggage and gate builders work", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.locator('[data-location="airport"]').click();
  await expect(page.locator("[data-airport-situation] option")).toHaveCount(10);
  await page
    .getByRole("combobox", { name: "좌석", exact: true })
    .selectOption("aisle");
  await expect(
    page.getByRole("heading", {
      name: "Could I have an aisle seat, please?",
      exact: true,
    }),
  ).toBeVisible();
  const options = await page
    .locator("[data-airport-situation] option")
    .evaluateAll((os) => os.map((o) => o.value));
  for (const option of options) {
    await page.locator("[data-airport-situation]").selectOption(option);
    await expect(page.locator(".phrase").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.locator("[data-airport-situation]").selectOption("gate");
  await page.locator('[data-rich="gate"]').fill("B12");
  await page.locator('[data-rich="gate"]').blur();
  await page.locator('[data-rich="direction"]').selectOption("time");
  await expect(
    page.getByRole("heading", {
      name: "How long does it take to get to Gate B12?",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator("[data-airport-situation]").selectOption("lost");
  await page.locator('[data-rich="bagProblem"]').selectOption("damaged");
  await page.locator('[data-rich="bagColor"]').selectOption("red");
  await expect(
    page.getByRole("heading", {
      name: "My suitcase was damaged.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "It's a large red suitcase.",
      exact: true,
    }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("immigration dates, personalized summary, speech practice and saved snapshot persist", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-location="immigration"]').click();
  await expect(
    page.locator("[data-question]").filter({ has: page.locator("span") }),
  ).toHaveCount(11);
  await page.locator('[data-rich="purpose"]').selectOption("both");
  await page.locator('[data-question="stay"]').click();
  await page.locator('[data-rich="duration"]').selectOption("custom");
  await page.locator('[data-rich="arrival"]').fill("2026-10-08");
  await page.locator('[data-rich="departure"]').fill("2026-10-22");
  await page.locator('[data-rich="departure"]').blur();
  await expect(
    page.getByRole("heading", {
      name: "I'll be staying for 14 days, until October 22, 2026.",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator('[data-question="accommodation"]').click();
  await page.locator('[data-rich="region"]').selectOption("custom");
  await page.locator('[data-rich="regionText"]').fill("Texas");
  await page.locator('[data-rich="regionText"]').blur();
  await expect(
    page.getByRole("heading", {
      name: "I'll be staying with my daughter in Texas.",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator('[data-question="summary"]').click();
  await page.evaluate(() => {
    window.__spoken = [];
    speechSynthesis.speak = (u) => window.__spoken.push(u.text);
  });
  await page.locator('[data-action="practice-card"]').click();
  await page.locator('[data-action="practice-card"]').click();
  expect(await page.evaluate(() => window.__spoken)).toEqual([
    "I'm visiting my daughter and doing some sightseeing.",
    "I'll be staying for 14 days, until October 22, 2026.",
  ]);
  await page.locator('[data-action="save-card"]').click();
  await page.reload();
  await page.locator(".saved-header").click();
  await page.locator(".saved-immigration summary").click();
  await expect(
    page.getByRole("heading", {
      name: "I'll be staying with my daughter in Texas.",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator('[data-action="edit-card"]').click();
  await page.locator('[data-question="accommodation"]').click();
  await expect(page.locator('[data-rich="regionText"]')).toHaveValue("Texas");
  await page.locator('[data-rich="region"]').selectOption("Virginia");
  await page.locator(".saved-header").click();
  await page.locator(".saved-immigration summary").click();
  await expect(
    page.getByRole("heading", {
      name: "I'll be staying with my daughter in Texas.",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator(".saved-immigration [data-save]").first().click();
  await expect(
    page.locator(".favorite-group:not(.saved-immigration) h2"),
  ).toContainText("입국심사");
  await page.locator('[data-action="remove-card"]').click();
  await expect(page.locator(".saved-immigration")).toHaveCount(0);
});
test("custom dates do not produce or save an incomplete immigration card", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-location="immigration"]').click();
  await page.locator('[data-question="stay"]').click();
  await page.locator('[data-rich="duration"]').selectOption("custom");
  await page.locator('[data-rich="arrival"]').fill("2026-10-22");
  await page.locator('[data-rich="departure"]').fill("2026-10-08");
  await page.locator('[data-rich="departure"]').blur();
  await expect(page.locator(".selection-note")).toBeVisible();
  await page.locator('[data-question="summary"]').click();
  await expect(page.locator('[data-action="save-card"]')).toBeDisabled();
});
test("shopping, hotel, transportation and dietary requests have richer choices", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-location="souvenir"]').click();
  await page.locator('[data-rich="color"]').selectOption("navy");
  await expect(
    page.getByRole("heading", {
      name: "Do you have this UVA T-shirt in a medium, in navy?",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator('[data-action="home"]').first().click();
  await page.locator('[data-location="hotel"]').click();
  await page.locator('[data-rich="hotelTask"]').selectOption("request");
  await page.locator('[data-rich="quantity"]').selectOption("one");
  await expect(
    page.getByRole("heading", {
      name: "Could I get one extra towel, please?",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator('[data-action="home"]').first().click();
  await page.locator('[data-location="transport"]').click();
  await page.locator('[data-rich="destination"]').selectOption("the airport");
  await expect(
    page.getByRole("heading", {
      name: "Could you take me to the airport, please?",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator('[data-action="home"]').first().click();
  await page.locator('[data-location="restaurant"]').click();
  await page.locator('[data-task="diet"]').click();
  await page.locator('[data-field="0"]').selectOption("dairy");
  await expect(
    page.getByRole("heading", { name: "I have a dairy allergy.", exact: true }),
  ).toBeVisible();
});
