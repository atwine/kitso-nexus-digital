// @vitest-environment node
import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import { describe, expect, it } from "vitest";
import { createGmailTransport, sendMail } from "./mailer";

describe("sendMail", () => {
  it("sends from Kitso's address to the given people with reply-to and both bodies", async () => {
    // jsonTransport builds the message without sending it anywhere.
    const transport = nodemailer.createTransport({ jsonTransport: true });
    let built: Record<string, unknown> = {};
    const original = transport.sendMail.bind(transport);
    transport.sendMail = (async (m: SendMailOptions) => {
      const info = await original(m);
      built = JSON.parse(String((info as unknown as { message: string }).message));
      return info;
    }) as typeof transport.sendMail;

    await sendMail(transport, "Kitso Nexus <info@kitsonexus.com>", {
      to: ["thabo@example.com"],
      cc: ["sales@kitsonexus.com"],
      replyTo: "info@kitsonexus.com",
      subject: "Your fit check report",
      text: "Hello Thabo",
      html: "<p>Hello Thabo</p>",
    });

    expect(built.from).toEqual({ address: "info@kitsonexus.com", name: "Kitso Nexus" });
    expect(built.to).toEqual([{ address: "thabo@example.com", name: "" }]);
    expect(built.cc).toEqual([{ address: "sales@kitsonexus.com", name: "" }]);
    expect(built.replyTo).toEqual([{ address: "info@kitsonexus.com", name: "" }]);
    expect(built.subject).toBe("Your fit check report");
    expect(built.text).toBe("Hello Thabo");
    expect(built.html).toBe("<p>Hello Thabo</p>");
  });
});

describe("createGmailTransport", () => {
  it("uses Gmail's secure SMTP server with the Workspace account", () => {
    const transport = createGmailTransport({ user: "info@kitsonexus.com", appPassword: "abcdabcdabcdabcd" });
    const opts = (transport as unknown as { options: Record<string, unknown> }).options;
    expect(opts).toMatchObject({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: "info@kitsonexus.com" } });
  });
});
