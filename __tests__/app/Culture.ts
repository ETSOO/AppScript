import { Culture } from "../../src";

test("Tests for en", async () => {
  const e = Culture.en(
    { nameB: "Name for Business" },
    new Promise((resolve) => resolve({ no: "No override" }))
  );

  expect(e.name).toBe("en");

  const resources =
    typeof e.resources === "object" ? e.resources : await e.resources();

  expect(resources.name).toBe("Name");
  expect(resources.nameB).toBe("Name for Business");
  expect(resources.no).toBe("No override");
});

test("Tests for zhHans", async () => {
  const zh = Culture.zhHans(
    { nameB: "名称覆盖" },
    new Promise((resolve) => resolve({ no: "No override" }))
  );

  expect(zh.name).toBe("zh-Hans");

  const resources =
    typeof zh.resources === "object" ? zh.resources : await zh.resources();

  expect(resources.name).toBe("姓名");
  expect(resources.nameB).toBe("名称覆盖");
  expect(resources.no).toBe("No override");
});
