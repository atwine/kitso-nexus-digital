// The Contact form's "Leave us a note": becomes a lead in Odoo and an alert to info@.
import { contactNote } from "../../src/lib/contactMessage.ts";
import { noteAlert } from "./alerts.ts";
import { logFailure, overEmailLimit, readVisitorJson, referenceFor, reply, saveOnce } from "./intake.ts";
import { CONTACT_TAG, type Services } from "./services.ts";

export async function handleContact(request: Request, services: Services, now = new Date()): Promise<Response> {
  const intake = await readVisitorJson(request);
  if (!intake.ok) return intake.response;
  const parsed = contactNote.safeParse(intake.body);
  if (!parsed.success) return reply(400, false);
  const note = parsed.data;
  if (note.website) return reply(200, true); // Only bots fill in the hidden box.

  const reference = referenceFor(note.email, note.message);
  const details = [
    `Name: ${note.name}`,
    `Email: ${note.email}`,
    ...(note.company ? [`Company: ${note.company}`] : []),
    ...(note.industry ? [`Industry: ${note.industry}`] : []),
    ...(note.phone ? [`Phone or WhatsApp: ${note.phone}`] : []),
    "",
    note.message,
  ];
  const saved = await saveOnce(
    services,
    {
      title: `Contact form · ${note.company ?? note.name}`,
      contactName: note.name,
      email: note.email,
      phone: note.phone,
      company: note.company,
      notes: [...details, "", reference].join("\n"),
      tags: [CONTACT_TAG, ...(note.industry ? [note.industry] : [])],
    },
    reference,
    "contact",
  );
  if (saved.status === "repeat") return reply(200, true);

  // The note is safe in Odoo. Over the daily limit, the alert is held back.
  if (saved.status === "saved" && (await overEmailLimit(services, null, "contact"))) return reply(200, true);

  const leadUrl = saved.status === "saved" ? services.leadUrl(saved.id) : null;
  try {
    await services.sendMail({ to: services.alertTo, replyTo: note.email, ...noteAlert({ note, now, leadUrl }) });
  } catch (error) {
    logFailure("contact: sending the alert", error);
    if (leadUrl === null) return reply(502, false);
  }
  return reply(200, true);
}
