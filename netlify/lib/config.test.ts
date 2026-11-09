// @vitest-environment node
import { describe, expect, it } from "vitest";
import { ConfigError, readServerConfig } from "./config";

const good = {
  ODOO_URL: "https://kitso.odoo.com/",
  ODOO_DB: "kitso",
  // A made-up key, built here so it never looks like a real one.
  ODOO_API_KEY: "test-key-".padEnd(40, "x"),
  ODOO_SALESPERSON_LOGIN: "sales@kitsonexus.com",
  GMAIL_USER: "info@kitsonexus.com",
  GMAIL_APP_PASSWORD: "abcd efgh ijkl mnop",
  MAIL_FROM: "info@kitsonexus.com",
  ALERT_TO: "info@kitsonexus.com, sales@kitsonexus.com",
};

describe("readServerConfig", () => {
  it("cleans up the settings it reads", () => {
    const cfg = readServerConfig(good);
    expect(cfg.ODOO_URL).toBe("https://kitso.odoo.com");
    expect(cfg.GMAIL_APP_PASSWORD).toBe("abcdefghijklmnop");
    expect(cfg.ALERT_TO).toEqual(["info@kitsonexus.com", "sales@kitsonexus.com"]);
  });

  it("names bad settings without ever showing their values", () => {
    const bad = { ...good, ODOO_API_KEY: "short-secret", ODOO_URL: "http://plain-http.example", ALERT_TO: undefined };
    const err = (() => {
      try {
        readServerConfig(bad);
      } catch (e) {
        return e as Error;
      }
    })();
    expect(err).toBeInstanceOf(ConfigError);
    expect(err!.message).toBe("Missing or invalid server settings: ALERT_TO, ODOO_API_KEY, ODOO_URL");
    expect(err!.message).not.toContain("short-secret");
  });
});
