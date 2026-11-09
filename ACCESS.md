# Access rules: kitsonexus.com

Last confirmed by Mugume T Atwine on 2026-11-09.

The website has no accounts and no database of its own. Visitors send details in;
nobody reads anything back through the website, except the one report inside a valid
link. Kitso's team reads leads in Odoo
and in the info@kitsonexus.com inbox, using their own logins there.

## 1. Data

| Data | What it holds | Sensitivity |
|---|---|---|
| contact-note | Name, email, company, industry, phone, message from the Contact form | personal |
| fit-check | Name, business name, email, WhatsApp number, the answers, where they came from | personal, plus private business figures (sales band, team size, losses) |
| booking | Name and email from a Cal.com booking | personal |
| report-link | A fit check's answers, carried inside the link in the report email. No name, email or phone. Stops working 6 months after it's made | private business figures |
| step-count | One mark per step reached: the date, the step's fixed name and the flyer label. No name, address, answers or cookie | public |

The first three are held only in Odoo CRM and in email. A report link's answers exist only
inside the link. The website's server passes all of these on and doesn't keep them, and its
logs never contain them. Step counts are the only thing the website itself keeps, in Netlify's
storage.

## 2. Roles

| Role | Who they are | Scope |
|---|---|---|
| anonymous | Anyone on the internet, using the site or calling its server directly | none, except the report inside a valid link they hold: can send in a new item and open that report |
| other-website | Any other web page trying to send to our server from a visitor's browser | none |
| cal-com | Cal.com telling us about a booking, proven by a signature made with a shared secret | a new booking, and the latest lead with the same email |
| kitso-team | Kitso staff with Odoo CRM access, and everyone who receives info@kitsonexus.com | all, but only inside Odoo and the inbox, never through the website |

## 3. Permission grid

| Role | contact-note | fit-check | booking | report-link | step-count |
|---|---|---|---|---|---|
| anonymous | create(new) | create(new) | - | view(valid link) | create(new) |
| other-website | - | - | - | - | - |
| cal-com | - | - | create(new), mark(same email) | - | - |
| kitso-team | - | - | - | - | - |

Step counts reach the team only in the morning email to info@, sent on days when someone
took the check. Nobody can read them through the website.

The kitso-team row is `-` because the website gives nobody a way to read leads. Staff
read them in Odoo (every Odoo CRM user, by the owner's decision) and in info@.

`view(valid link)` means whoever holds a link the server made, unaltered and under 6 months
old, can see that one report and nothing else. Only the server can make a link. Forwarding a
link is the point of it, so whoever receives one sees those figures with no login (owner's
decision, 2026-11-09).

`mark(same email)` means a booking finds that person's latest lead and adds three stars
and a "Booked a call" label, so the team sees one record per person. It makes a new lead
only if there isn't one, and changes nothing else (owner's decision, 2026-11-09).

What the info@ alert holds: a Contact note in full; for a fit check, the name, contact
details, business type and team size, verdict, hot, warm or cold, what to do next, who
decides, how soon, registration, where they came from, whether they want the community,
and a link to Odoo (owner's decision, 2026-11-09). It never holds business figures or the
reasons someone isn't ready. Full fit check answers stay in Odoo. If Odoo is down, the full lead goes to info@ by email instead, marked to
be added to Odoo by hand, so that one exception is the only time the answers are emailed.

The report email goes only to the address the visitor typed.

## 4. Route map

| Method | Route | Data | Action |
|---|---|---|---|
| POST | /api/contact | contact-note | create |
| POST | /api/fit-check | fit-check | create |
| POST | /api/cal-booking | booking | create |
| POST | /api/report | report-link | view |
| POST | /api/count | step-count | create |

Any other method on these routes is refused. There is no route that reads a lead:
/api/report only hands back what is already inside the link it was given.

## 5. Abuse cases

- Someone calls the server directly instead of using the form. Covered by: every answer is
  checked again on the server, and the verdict is worked out there.
- Someone sends fields the form doesn't show, such as a verdict, a hot label, or a different
  assignee. Covered by: anything not on the list is rejected, and labels come only from the server.
- Someone tries to read a lead by guessing a number. Covered by: no route reads a lead.
- A bot fills the form, or someone repeats it thousands of times. Covered by: a hidden trap field,
  a limit on how often one visitor can send, and daily limits on email: at most 3 reports to one
  address and 600 website leads emailed in 24 hours. Past a limit the lead is still saved in Odoo
  and nothing more is emailed (owner's decision, 2026-11-09). Sending the same form again while
  its first report may still be going out emails nothing.
- Another website makes a visitor's browser post to our server. Covered by: only requests from
  Kitso's own site address are accepted. Grid row other-website.
- Someone pretends to be Cal.com to add a fake booking. Covered by: an unsigned or wrongly signed
  request is refused. Grid row anonymous, booking = -.
- Someone puts line breaks or HTML in a name to tamper with an email or Odoo's notes. Covered by:
  plain-text checks on the server, booking names are cleaned, and Odoo notes are escaped.
- Someone types another person's email address, and a scam line as the business name, so that
  person gets it from Kitso's real address. Covered by: names that look like a web address are
  refused, one address gets at most 3 reports a day, and the report link always points at Kitso's
  own site.
- Someone edits a report link to make Kitso's page say something else, such as "strong fit".
  Covered by: the server signs each link, and a changed link is refused.
- Someone makes up a link, or keeps trying numbers. Covered by: a link can't be guessed without
  the server's secret, and there are no numbers to step through. Grid: report-link = view(valid link).
- An old link keeps circulating. Covered by: the page refuses a link after 6 months.
- Someone sends fake counts to pad the numbers. Covered by: only the fixed step names are taken and
  nothing can be read back.
- Someone triggers the morning email job. It has no public address of its own. At worst it
  sends yesterday's counts to info@ again.
- Another website asks our server for a report from a visitor's browser. Covered by: only requests
  from Kitso's own site address are accepted. Grid row other-website.

## 6. Open questions for the owner

The owner keeps open questions and accepted risks in private notes outside this public repository.

## 7. What this file does not cover

- Whether login itself is safe (password storage, sessions, password reset).
- Secrets: API keys or passwords committed to the code.
- Libraries with known security holes.
- Server, database and cloud settings (open database ports, public storage
  buckets, debug mode in production, CORS set to allow every site).
- Attacks on the code itself, such as SQL injection or cross-site scripting.
- Limits on repeated requests (rate limiting).
- Backups and what to do if data leaks.

Use `/security-review`, a secret scanner (gitleaks), a dependency audit
(`pip-audit`, `npm audit`) and, for apps holding sensitive data, a human
penetration test for these.
