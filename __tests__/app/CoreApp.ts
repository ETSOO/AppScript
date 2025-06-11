import { ApiDataError, ApiMethod } from "@etsoo/restclient";
import { DataTypes, ExtendUtils, IActionResult } from "@etsoo/shared";
import {
  EntityStatus,
  ExternalEndpoint,
  ExternalSettings,
  UserRole
} from "../../src";
import { TestApp } from "./TestApp";

// Arrange
// Mixins example
function EnhanceApp<TBase extends DataTypes.MConstructor<TestApp>>(
  Base: TBase
) {
  return class extends Base {};
}

const appClass = EnhanceApp(TestApp);
const app = new appClass();

// First make sure the default culture (here is 'en') is loaded
await ExtendUtils.sleep(50);

// Then change the culture to the first one (here is 'zh-CN')
await app.changeCulture(app.settings.cultures[0]);

await ExtendUtils.sleep(50);

test("Test for domain substitution", () => {
  expect(app.settings.endpoint).toBe("http://admin.etsoo.com:9000/api/");

  expect(app.settings.endpoints?.core.endpoint).toBe(
    "https://core.etsoo.com:9001/api/"
  );
});

test("Test for formatApp", () => {
  expect(
    ExternalSettings.formatApp(
      "admin.app.local",
      "core",
      "https://{hostname}/api/"
    )
  ).toBe("https://core.app.local/api/");

  expect(
    ExternalSettings.formatApp("localhost", "admin", "https://{hostname}/api/")
  ).toBe("https://localhost/api/");

  // Custom sub domain match
  ExternalSettings.subDomainMatch = /app(?=\.)/i;

  expect(
    ExternalSettings.formatApp(
      "admin.app.local",
      "core",
      "https://{hostname}/api/"
    )
  ).toBe("https://admin.core.local/api/");
});

test("Test for formatHost with endpoints", () => {
  // Reset sub domain match
  ExternalSettings.subDomainMatch = /(?<=\/\/)[0-9a-z]+(?=\.)/i;

  const endpoints: Record<string, ExternalEndpoint> = {
    core: {
      endpoint: "https://{hostname}/api/",
      webUrl: "https://{hostname}/"
    }
  };

  const result = ExternalSettings.formatHost(endpoints, "admin.app.local");

  expect(result).toStrictEqual({
    core: {
      endpoint: "https://core.app.local/api/",
      webUrl: "https://core.app.local/"
    }
  });
});

test("Test for properties", () => {
  expect(app.settings.currentRegion.label).toBe("中国大陆");
});

test("Test for formatAction", () => {
  Object.assign(app.settings.currentCulture.resources, {
    appName: "司友®云ERP"
  });
  expect(app.formatAction("修改", "客户A")).toBe("[司友®云ERP] 修改 - 客户A");
  expect(app.formatAction("修改", "客户A", "企业")).toBe(
    "[司友®云ERP] 修改 - 客户A, 企业"
  );
});

test("Tests for addRootUrl", () => {
  expect(app.addRootUrl("/home")).toBe("/cms/home");
  expect(app.addRootUrl("./home")).toBe("/cms/./home");
  expect(app.addRootUrl("home")).toBe("/cms/home");
});

test("Tests for encrypt / decrypt", async () => {
  // Arrange
  const input = "Hello, world!";
  const passphrase = "My password";

  await new Promise((resolve) => setTimeout(resolve, 100));

  // Act
  const encrypted = app.encrypt(input, passphrase);
  const plain = app.decrypt(encrypted, passphrase);
  expect(plain).toEqual(input);
});

test("Tests for encryptEnhanced / decryptEnhanced", async () => {
  // Arrange
  const input = "Hello, world!";
  const passphrase = "My password";

  await new Promise((resolve) => setTimeout(resolve, 100));

  // Act
  const encrypted = app.encryptEnhanced(input, passphrase);
  const plain = app.decryptEnhanced(encrypted, passphrase);
  expect(plain).toEqual(input);
});

test("Tests for initCallUpdateLocal", () => {
  // Act
  const passphrase = app.initCallUpdateLocal(
    {
      deviceId:
        "ZmNjZlov+10067A1520126643352C2022735B85DC8F380088468402C98A5631A8CFBE14E134zXfxmw77lFopTTlbqOfsK2KUqPSsTAQb35Ejrm1BAvUaQH3SuZcwGYu3+PQ/Rd56",
      passphrase:
        "01397BF28A93FC031BC8B9B808F880F12C398AB792DF2ADE7A8768CADD2259EB50HJuKhqGuLQO+SmvCVzuEGUN4TdkUuPMWR0E6lliszbNiXboCziXx5SdfX3lMpoBX"
    },
    1639282438620
  );
  expect(passphrase).not.toBeNull();
});

test("Tests for formatFullName", () => {
  expect(app.formatFullName("亿速", null)).toBe("亿速");
  expect(app.formatFullName(null, null)).toBe("");
  expect(app.formatFullName("亿速", "思维")).toBe("亿速思维");
  expect(app.formatFullName("Xiao", "Garry")).toBe("Garry Xiao");
});

test("Tests for getRoleLabel", () => {
  const labels = app.getRoleLabel(
    UserRole.User | UserRole.Manager | UserRole.Admin,
    "-"
  );
  expect(labels).toBe("User-Manager-Admin");
});

test("Tests for getRoles", () => {
  const roles = app.getRoles(UserRole.User | UserRole.Manager | UserRole.Admin);
  expect(roles.length).toBe(3);
  expect(roles.map((r) => r.id)).toEqual([16, 64, 8192]);
});

test("Tests for getStatusList", () => {
  const statuses = app.getStatusList([
    EntityStatus.Normal,
    EntityStatus.Approved,
    EntityStatus.Doing,
    EntityStatus.Completed,
    EntityStatus.Deleted
  ]);
  expect(statuses.length).toBe(5);
  expect(statuses.map((s) => s.id)).toStrictEqual([0, 100, 110, 250, 255]);

  expect(app.getStatusList().length).toBe(9);
});

test("Tests for formatResult", () => {
  const result: IActionResult = {
    ok: false,
    type: "https://tools.ietf.org/html/rfc9110#section-15.5.1",
    title: "One or more validation errors occurred.",
    status: 400,
    errors: {
      $: [
        "JSON deserialization for type \u0027com.etsoo.CMS.RQ.User.UserCreateRQ\u0027 was missing required properties, including the following: password"
      ],
      rq: ["The rq field is required."]
    },
    traceId: "00-ed96a4f0c83f066594ecc69b77da9803-df770e3cd714fedd-00"
  };

  const formatted = app.formatResult(result);
  expect(formatted).toBe(
    "One or more validation errors occurred. (400, https://tools.ietf.org/html/rfc9110#section-15.5.1)"
  );
});

test("Tests for formatResult with type", () => {
  const result: IActionResult = {
    ok: false,
    type: "TokenExpired",
    title: "您的令牌已过期",
    data: {}
  };

  const formatted = app.formatResult(result);
  expect(formatted).toBe("您的令牌已过期 (TokenExpired)");
});

test("Tests for formatResult with custom label", () => {
  const result: IActionResult = {
    ok: false,
    type: "ItemRequired",
    title: "{0} is required.",
    field: "url"
  };

  const formatted = app.formatResult(result, () => "Url");
  expect(formatted).toBe("Url is required. (ItemRequired, url)");
});

test("Tests for formatResult with custom label", () => {
  const result: IActionResult = {
    ok: false,
    type: "ItemExists",
    field: "url"
  };

  const fieldLabel = "文章地址";
  const formatted = app.formatResult(result, () => fieldLabel);
  expect(formatted).toBe(`'${fieldLabel}'已经存在 (ItemExists, url)`);
});

test("Tests for formatError", () => {
  const error: ApiDataError = {
    name: "ApiDataError",
    message: "Api data error",
    response: {
      type: "https://tools.ietf.org/html/rfc9110#section-15.5.1",
      title: "One or more validation errors occurred.",
      status: 400,
      errors: {
        $: [
          "JSON deserialization for type \u0027com.etsoo.CMS.RQ.User.UserCreateRQ\u0027 was missing required properties, including the following: password"
        ],
        rq: ["The rq field is required."]
      },
      traceId: "00-ed96a4f0c83f066594ecc69b77da9803-df770e3cd714fedd-00"
    },
    data: {
      data: undefined,
      headers: [],
      method: ApiMethod.POST,
      params: {},
      url: ""
    }
  };

  expect(app.formatError(error)).toBe("Api data error (ApiDataError)");
});

test("Tests for isValidPassword", () => {
  expect(app.isValidPassword("12345678")).toBeFalsy();
  expect(app.isValidPassword("abcd3")).toBeFalsy();
  expect(app.isValidPassword("1234abcd")).toBeTruthy();
});

test("Tests for checkSesession", async () => {
  await app.checkSession((isSame) => {
    expect(isSame).toBeFalsy();
    return Promise.resolve();
  });

  await app.checkSession((isSame) => {
    expect(isSame).toBeTruthy();
    return Promise.resolve();
  });

  app.clearSession();

  await app.checkSession((isSame) => {
    expect(isSame).toBeFalsy();
    return Promise.resolve();
  });
});
