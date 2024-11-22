import { ArrayUtils } from "@etsoo/shared";
import { CultureGridItem } from "../../src";
import { BusinessUtils } from "../../src/business/BusinessUtils";

// Import the ArrayUtils
ArrayUtils.differences([], []);

test("Tests for BusinessUtils.formatAvatarTitle", () => {
  // Assert
  expect(BusinessUtils.formatAvatarTitle("Garry Xiao")).toBe("GX");
  expect(BusinessUtils.formatAvatarTitle("Etsoo")).toBe("ME");
  expect(BusinessUtils.formatAvatarTitle("Etsoo", 3, "E")).toBe("E");
  expect(BusinessUtils.formatAvatarTitle("Etsoo", 5)).toBe("ETSOO");
});

test("Tests for BusinessUtils.formatCultues", () => {
  // Arrange
  const cultures = [
    {
      id: "zh-Hans",
      label: "中文（简体）, Chinese (Simplified)"
    },
    {
      id: "en",
      label: "英语, English"
    },
    {
      id: "de",
      label: "德语, German"
    },
    {
      id: "zh-Hant",
      label: "中文（繁体）, Chinese (Traditional)"
    }
  ];
  const data: { cultures: CultureGridItem[] } = {
    cultures: [{ id: "zh-Hant", title: "繁体" }]
  };

  // Act
  BusinessUtils.formatCultues(cultures, data);

  // Assert
  expect(data.cultures[0].id).toBe("en");
  expect(data.cultures.slice(-1)[0].id).toBe("zh-Hant");
});
