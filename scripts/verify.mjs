import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const failures = [];

function check(name, ok) {
  if (!ok) failures.push(name);
  console.log(`${ok ? "ok" : "FAIL"} ${name}`);
}

await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle0" });
check("directory heading", (await page.content()).includes("Find a doctor"));
await page.locator("input").fill("Menon");
await page.waitForSelector("text/Dr. Asha Menon");
check("search finds Menon", true);
const card = await page.$eval("article", (node) => node.innerText);
check("join shows two hospitals", card.includes("Apollo Hospital") && card.includes("Manipal Hospital"));
check("schedule is on the card", card.includes("Mon / Wed / Fri, 9 AM–1 PM"));

await page.click("text/Dr. Asha Menon");
await page.waitForSelector("text/Where they practice");
await page.locator("textarea").fill("The doctor was brilliant but the ward was dirty.");
await page.waitForSelector("text/Doctor · Positive");
const split = await page.$eval("form", (node) => node.textContent ?? "");
check("sentiment names the doctor", split.includes("The doctor was brilliant"));
check("sentiment names the ward", split.includes("the ward was dirty"));
check("hospital clause is negative", split.includes("Hospital · Negative"));
await page.click("text/Save note");
await page.waitForSelector("text/Saved on this device");
check("review blend is shown", (await page.content()).includes("Doctor rating"));

await page.goto("http://127.0.0.1:4173/doctors/neil-smith", { waitUntil: "networkidle0" });
const notes = await page.content();
check("seed review is visible", notes.includes("The doctor was brilliant but the ward was dirty."));

await page.goto("http://127.0.0.1:4173/emergency", { waitUntil: "networkidle0" });
check("demo warning", (await page.content()).includes("Demo only"));
check("three ERs", (await page.content()).includes("3 trauma ERs inside 5 km"));
await page.click("text/Ping ERs within 5 km");
await page.waitForSelector("text/Accept — request locks", { timeout: 8000 });
const locked = await page.content();
check("Manipal accepts", locked.includes("Manipal Hospital, Old Airport Road accepted first"));
check("Cloudnine is not pinged as an ER", locked.includes("In radius, no ER system"));
check("Apollo is outside the radius", locked.includes("Outside 5 km") && locked.includes("Apollo Hospital"));
await page.screenshot({ path: "/tmp/asa-emergency.png", fullPage: true });

await page.goto("http://127.0.0.1:4173/hospitals/cloudnine-oar", { waitUntil: "networkidle0" });
check("hospital profile", (await page.content()).includes("Affiliated doctors"));
await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle0" });
await page.screenshot({ path: "/tmp/asa-directory.png", fullPage: true });
await page.goto("http://127.0.0.1:4173/doctors/neil-smith", { waitUntil: "networkidle0" });
await page.screenshot({ path: "/tmp/asa-doctor.png", fullPage: true });

await browser.close();
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
