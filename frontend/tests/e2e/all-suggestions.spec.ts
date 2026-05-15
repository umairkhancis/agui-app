import { test, expect, Page, FrameLocator, Locator } from "@playwright/test";

// LLM-backed responses are slow and variable. Allow generous waits per step.
const AGENT_RESPONSE_TIMEOUT = 120_000;

const SUGGESTIONS = {
  pie: "Pie Chart (Controlled Generative UI)",
  bar: "Bar Chart (Controlled Generative UI)",
  meeting: "Schedule Meeting (Human In The Loop)",
  flights: "Search Flights (A2UI Fixed Schema)",
  dashboard: "Sales Dashboard (A2UI Dynamic)",
  excalidraw: "Excalidraw Diagram (MCP App)",
  calculator: "Calculator App (Open Generative UI)",
  theme: "Toggle Theme (Frontend Tools)",
  tasks: "Task Manager (Shared State)",
} as const;

async function clickSuggestion(page: Page, name: string) {
  const pill = page.getByRole("button", { name, exact: true });
  await expect(pill).toBeVisible({ timeout: 30_000 });
  await pill.click();
}

function chatInput(page: Page): Locator {
  // The chat panel is the only textbox visible at idle (todo inline editors only
  // appear when the user clicks into a todo title/description).
  return page.getByRole("textbox").first();
}

async function sendChatMessage(page: Page, message: string) {
  const input = chatInput(page);
  await input.click();
  await input.fill(message);
  await input.press("Enter");
}

test.describe.configure({ mode: "serial" });

test.describe("Frontend feature smoke — exercise every suggestion", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Wait until the suggestion pills load (CopilotKit fills them after connecting to the agent).
    await expect(
      page.getByRole("button", { name: SUGGESTIONS.pie, exact: true })
    ).toBeVisible({ timeout: 60_000 });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("Pie Chart suggestion renders a pie chart", async () => {
    await clickSuggestion(page, SUGGESTIONS.pie);
    // The PieChart component draws an SVG with circle elements styled as donut slices.
    const pieSvg = page
      .locator("svg")
      .filter({ has: page.locator("circle[stroke-dasharray], circle[stroke-dashoffset]") });
    await expect(pieSvg.first()).toBeVisible({ timeout: AGENT_RESPONSE_TIMEOUT });
  });

  test("Bar Chart suggestion renders a bar chart", async () => {
    await clickSuggestion(page, SUGGESTIONS.bar);
    // Recharts renders bars inside <g class="recharts-bar"> / <rect> elements.
    const barChart = page.locator(
      "svg .recharts-bar, svg g.recharts-bar-rectangles, svg .recharts-bar-rectangle"
    );
    await expect(barChart.first()).toBeVisible({ timeout: AGENT_RESPONSE_TIMEOUT });
  });

  test("Schedule Meeting renders a time picker and confirms selection", async () => {
    await clickSuggestion(page, SUGGESTIONS.meeting);

    // Picker heading appears while the human-in-the-loop tool is "executing".
    const slot = page
      .locator("button")
      .filter({ hasText: "Tomorrow" })
      .filter({ hasText: "2:00 PM" })
      .first();
    await expect(slot).toBeVisible({ timeout: AGENT_RESPONSE_TIMEOUT });

    await slot.click();

    await expect(
      page.getByRole("heading", { name: "Meeting Scheduled" })
    ).toBeVisible({ timeout: 30_000 });
  });

  test("Search Flights renders a flight carousel (SFO → JFK)", async () => {
    await clickSuggestion(page, SUGGESTIONS.flights);
    // Flight cards mention airport codes and have Select action buttons.
    await expect(page.getByText("SFO").first()).toBeVisible({
      timeout: AGENT_RESPONSE_TIMEOUT,
    });
    await expect(page.getByText("JFK").first()).toBeVisible({
      timeout: AGENT_RESPONSE_TIMEOUT,
    });
    await expect(
      page.getByRole("button", { name: /^Select$/ }).first()
    ).toBeVisible({ timeout: AGENT_RESPONSE_TIMEOUT });
  });

  test("Sales Dashboard renders dashboard metrics + charts", async () => {
    await clickSuggestion(page, SUGGESTIONS.dashboard);
    await expect(page.getByText(/Total Revenue/i).first()).toBeVisible({
      timeout: AGENT_RESPONSE_TIMEOUT,
    });
    await expect(
      page.getByText(/New Customers|Conversion Rate/i).first()
    ).toBeVisible({ timeout: AGENT_RESPONSE_TIMEOUT });
  });

  test("Excalidraw Diagram renders an SVG diagram", async () => {
    await clickSuggestion(page, SUGGESTIONS.excalidraw);
    // The MCP "create_view" tool returns an Excalidraw SVG (sketchy strokes via
    // many <path> elements) inline in the chat — there is no <canvas>.
    await expect(page.getByText("create_view").first()).toBeVisible({
      timeout: AGENT_RESPONSE_TIMEOUT,
    });
    // The diagram has many path elements (rounded rects + connector lines).
    // Lucide icons in the chat chrome only contribute a handful, so 10+ paths
    // confidently signals the diagram has rendered.
    await expect
      .poll(async () => await page.locator("svg path").count(), {
        timeout: AGENT_RESPONSE_TIMEOUT,
        message: "Excalidraw SVG paths never rendered",
      })
      .toBeGreaterThanOrEqual(10);
  });

  test("Calculator (Open Generative UI) computes 5 × 6 = 30", async () => {
    await clickSuggestion(page, SUGGESTIONS.calculator);

    // The sandboxed UI typically renders inline in the chat transcript, but can
    // also land inside an iframe. Look in both places.
    const findCalcContext = async (): Promise<Page | FrameLocator> => {
      const start = Date.now();
      while (Date.now() - start < AGENT_RESPONSE_TIMEOUT) {
        // Inline (main page) first — this is what the rendered demo uses.
        if (await page.getByRole("button", { name: "5", exact: true }).count()) {
          return page;
        }
        // Iframe fallback.
        const iframeCount = await page.locator("iframe").count();
        for (let i = 0; i < iframeCount; i++) {
          const fl = page.frameLocator("iframe").nth(i);
          if (await fl.getByRole("button", { name: "5", exact: true }).count()) {
            return fl;
          }
        }
        await page.waitForTimeout(500);
      }
      throw new Error("Calculator UI never rendered");
    };

    const ctx = await findCalcContext();

    // The keypad uses × (U+00D7) for multiply and a single "=" for equals.
    // Match accessible names exactly so we don't accidentally hit a metric
    // shortcut tile (e.g. REVENUE / $322,000) that also has digit text.
    const five = ctx.getByRole("button", { name: "5", exact: true });
    const six = ctx.getByRole("button", { name: "6", exact: true });
    const multiply = ctx.getByRole("button", { name: /^[×*]$/ });
    const equals = ctx.getByRole("button", { name: "=", exact: true });

    await expect(five).toBeVisible({ timeout: AGENT_RESPONSE_TIMEOUT });
    await expect(multiply).toBeVisible();
    await expect(equals).toBeVisible();

    await five.click();
    await multiply.click();
    await six.click();
    await equals.click();

    // The result lands in the display at the top of the calculator card.
    // Exact match avoids colliding with metric tile values like $322,000 / 150 / 5.2%.
    await expect(ctx.getByText("30", { exact: true }).first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("Toggle Theme flips html class twice (light↔dark↔light)", async () => {
    const html = page.locator("html");
    const readTheme = async (): Promise<"light" | "dark"> => {
      const klass = (await html.getAttribute("class")) ?? "";
      return /\bdark\b/.test(klass) ? "dark" : "light";
    };
    const waitForTheme = (expected: "light" | "dark") =>
      expect
        .poll(readTheme, {
          timeout: AGENT_RESPONSE_TIMEOUT,
          message: `Theme class on <html> never became "${expected}"`,
        })
        .toBe(expected);

    const initial = await readTheme();
    const opposite = initial === "dark" ? "light" : "dark";

    // First toggle: initial -> opposite
    await clickSuggestion(page, SUGGESTIONS.theme);
    await waitForTheme(opposite);

    // Second toggle: opposite -> initial
    await clickSuggestion(page, SUGGESTIONS.theme);
    await waitForTheme(initial);
  });

  test("Task Manager — mark all tasks done, agent confirms none left", async () => {
    await clickSuggestion(page, SUGGESTIONS.tasks);

    const todoColumn = page.locator('section[aria-label="To Do column"]');
    const doneColumn = page.locator('section[aria-label="Done column"]');

    await expect(todoColumn).toBeVisible({ timeout: AGENT_RESPONSE_TIMEOUT });

    const pendingCheckboxes = todoColumn.locator(
      'button[role="checkbox"][data-state="unchecked"]'
    );

    // Wait for the agent to add three todos.
    await expect
      .poll(async () => await pendingCheckboxes.count(), {
        timeout: AGENT_RESPONSE_TIMEOUT,
        message: "Agent never added three todos",
      })
      .toBeGreaterThanOrEqual(3);

    // Mark every pending todo as done. Re-query after each click since
    // the card moves to the Done column and the list re-renders.
    // Cap iterations to avoid runaway loops.
    for (let i = 0; i < 20; i++) {
      const remaining = await pendingCheckboxes.count();
      if (remaining === 0) break;
      await pendingCheckboxes.first().click();
      // Brief settle for the state sync.
      await page.waitForTimeout(300);
    }

    await expect(pendingCheckboxes).toHaveCount(0, { timeout: 10_000 });
    await expect(
      doneColumn.locator('button[role="checkbox"][data-state="checked"]')
    ).toHaveCount(3, { timeout: 10_000 });

    // CopilotKit pushes shared state to the agent backend asynchronously after
    // each setState. Headless mode races ahead of those pushes, so wait for the
    // network to settle and add a small buffer before asking — otherwise the
    // agent answers from stale state (e.g. "You have 3 tasks left").
    await page
      .waitForLoadState("networkidle", { timeout: 15_000 })
      .catch(() => {
        // CopilotKit may hold a long-lived connection; networkidle can time out
        // even when the state push has long since completed. Don't fail the
        // test on that — fall through to the explicit settle below.
      });
    await page.waitForTimeout(2000);

    const doneAnswer =
      /all\s+(tasks|todos)?\s*(are\s+)?(done|complete|completed)|no\s+(more\s+)?(tasks|todos)\s+(left|remaining|pending)|(zero|0)\s+(tasks|todos)|nothing\s+(left|remaining)|all\s+done|(none|nothing)\s+(left|remaining|pending)/i;
    const staleAnswer = /\b[1-9]\d*\s+(tasks?|todos?)\s+(left|remaining|pending)/i;

    // Ask the agent. If it answers with a stale positive count, re-ask once
    // after another settle — by then the state push has definitely landed.
    const askAndWaitForReply = async () => {
      const transcript = page.locator("body");
      await expect
        .poll(
          async () => {
            const text = await transcript.innerText();
            if (doneAnswer.test(text)) return "done";
            if (staleAnswer.test(text)) return "stale";
            return "waiting";
          },
          {
            timeout: AGENT_RESPONSE_TIMEOUT,
            message: "Agent never replied to the tasks-left question",
          }
        )
        .not.toBe("waiting");

      const finalText = await transcript.innerText();
      return doneAnswer.test(finalText) ? "done" : "stale";
    };

    await sendChatMessage(page, "How many tasks left?");
    let result = await askAndWaitForReply();

    if (result === "stale") {
      await page.waitForTimeout(3000);
      await sendChatMessage(
        page,
        "Please check the current todos again. How many tasks are left?"
      );
      result = await askAndWaitForReply();
    }

    expect(
      result,
      "Agent reported tasks remaining even after re-asking"
    ).toBe("done");
  });
});
