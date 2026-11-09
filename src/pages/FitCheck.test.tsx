import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FitCheckPage from "./FitCheck";
import { calculateFitCheck } from "@/lib/fitCheck/calculate";
import { countStep, forgetCounted } from "@/lib/fitCheck/count";
import { fitCheckDetails } from "@/lib/fitCheck/details";
import { sendFitCheckLead } from "@/lib/fitCheck/lead";
import { MAX_SCREENS } from "@/lib/fitCheck/screens";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

vi.mock("@/lib/fitCheck/lead", () => ({ sendFitCheckLead: vi.fn() }));
vi.mock("@/lib/fitCheck/count", () => ({ countStep: vi.fn(), forgetCounted: vi.fn() }));

const sendReport = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Send my report" }));
  });
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.mocked(sendFitCheckLead).mockReset();
  vi.mocked(sendFitCheckLead).mockResolvedValue("confirmed");
});

const Address = () => <output data-testid="address">{useLocation().search}</output>;

// The browser's own Back button.
const BrowserBack = () => {
  const navigate = useNavigate();
  return (
    <button type="button" data-testid="browser-back" onClick={() => navigate(-1)}>
      previous page
    </button>
  );
};
const browserBack = () => fireEvent.click(screen.getByTestId("browser-back"));

const renderPage = (address: string | { pathname: string; state: unknown } = "/fit") =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <FitCheckPage />
      <Address />
      <BrowserBack />
    </MemoryRouter>,
  );

const pick = (label: string) => fireEvent.click(screen.getByLabelText(label));
const pickIn = (group: RegExp, label: string) => fireEvent.click(within(screen.getByRole("group", { name: group })).getByLabelText(label));
const next = () => fireEvent.click(screen.getByRole("button", { name: "Next" }));
const heading = () => screen.getByRole("heading", { level: 1 }).textContent;

// The car workshop from the Sprint 8 tests, answered through the screens.
const answerWorkshop = (sale = "3,500", decider = "Yes, it's my call") => {
  fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
  pick("Equipment & Machinery"); next();
  pick("6–20"); next();
  pick("Yes, with CIPA in Botswana"); next();
  pick("Excel or Google Sheets"); next();
  pick(decider); next();
  pick("30 to 100"); pick("About a quarter");
  fireEvent.change(screen.getByLabelText("If one of those enquiries had become a sale, how much would the customer usually pay?"), { target: { value: sale } });
  next();
  pick("P2 million to P10 million"); pick("60 to 90 days"); pick("Now and then"); next();
  pick("50 to 150"); pick("About 1 in 10");
  fireEvent.change(screen.getByLabelText("When one of those bookings is lost, how much money do you lose?"), { target: { value: "800" } });
  next();
  pickIn(/apps, spreadsheets/, "4 to 6"); pickIn(/people do admin/, "2 or 3"); pick("5 to 10 hours"); next();
  pick("P500,000 to P2 million"); pick("Every month"); next();
  pick("About a week"); pick("Fairly sure"); next();
};

describe("Fit check", () => {
  it("walks from start to the score-first result with the Sprint 8 numbers", () => {
    renderPage();
    answerWorkshop();

    const expected = calculateFitCheck({
      businessTypes: ["equipment"], teamSize: "6-20", cipa: "yes", mainTools: ["spreadsheets"], decider: "me", enquiries: "30-100", goneCold: "quarter", typicalSale: 3500,
      yearlySales: "2m-10m", daysToPay: "60-90", invoiceMistakes: "sometimes", bookings: "50-150",
      missedBookings: "one-in-ten", bookingValue: 800, adminPeople: "2-3", adminHours: "5-10", appCount: "4-6",
      stockValue: "500k-2m", stockProblems: "monthly", reportTime: "week", reportConfidence: "fairly",
    });
    expect(heading()).toContain(`${expected.score} out of 100`);
    expect(screen.getByText("Odoo can help. Start small")).toBeInTheDocument();
    expect(screen.getByText("Missed sales")).toBeInTheDocument();
    expect(screen.getByText("P204,000 to P301,000 a year")).toBeInTheDocument();
    expect(screen.getByText("Free · All 6 areas · Your next steps")).toBeInTheDocument();
  });

  it("counts 11 screens for a workshop, skips Diary for a shop, and adds it back for shop plus services", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Equipment & Machinery");
    expect(screen.getByText("1 of 11")).toBeInTheDocument();
    pick("Equipment & Machinery");
    pick("Retail & Distribution");
    expect(screen.getByText("1 of 10")).toBeInTheDocument();
    pick("Professional Services");
    expect(screen.getByText("1 of 11")).toBeInTheDocument();
    expect(screen.getByLabelText("Retail & Distribution")).toBeChecked();
    expect(screen.getByLabelText("Professional Services")).toBeChecked();
  });

  it("asks which system when 'Another system' is ticked", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Retail & Distribution"); next();
    pick("2–5"); next();
    pick("Not yet"); next();
    expect(screen.queryByLabelText(/Which system/)).not.toBeInTheDocument();
    pick("WhatsApp"); pick("Another system");
    fireEvent.change(screen.getByLabelText(/Which system/), { target: { value: "Sage Evolution" } });
    next();
    expect(heading()).toBe("Are you the one who makes the final decision on new systems?");
  });

  it("asks about timing on the result; Now makes it report and call, report first", async () => {
    renderPage();
    answerWorkshop();
    pick("This year");
    expect(screen.getByRole("button", { name: "Email me my full report" })).toBeInTheDocument();
    pick("Now");
    expect(screen.queryByRole("link", { name: /Book a call/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to kitsonexus.com" })).toHaveAttribute("href", "/");
    fireEvent.click(screen.getByRole("button", { name: "Email my report and book a call" }));
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Thabo" } });
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "Tlotlo Auto" } });
    fireEvent.change(screen.getByLabelText("Email", { selector: "input[type=email]" }), { target: { value: "thabo@example.com" } });
    fireEvent.change(screen.getByLabelText("WhatsApp number"), { target: { value: "71 234 567" } });
    await sendReport();
    expect(screen.getByRole("heading", { name: "Now book your call" })).toBeInTheDocument();
  });

  it("won't go on until every question on a screen is answered", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    next();
    expect(screen.getByRole("alert")).toHaveTextContent("Please answer the question");
    expect(heading()).toBe("What kind of business do you run?");
  });

  it("names the question still unanswered and puts the keyboard on it", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Retail & Distribution"); next();
    pick("2–5"); next();
    pick("Not yet"); next();
    pick("WhatsApp"); next();
    pick("Yes, it's my call"); next();
    pick("Under 10");
    next();
    expect(screen.getByRole("alert")).toHaveTextContent("How many go cold without a follow-up?");
    expect(screen.getByLabelText("None")).toHaveFocus();
  });

  it("keeps answers when going back", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Construction"); next();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Construction")).toBeChecked();
  });

  it("checks the details, then shows the done screen with their name", async () => {
    renderPage();
    answerWorkshop();
    fireEvent.click(screen.getByRole("button", { name: "Email me my full report" }));
    await sendReport();
    expect(screen.getByText("Please add your first name")).toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveFocus();

    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Thabo" } });
    expect(screen.queryByText("Please add your first name")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "Tlotlo Auto" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "thabo@tlotloauto.co.bw" } });
    fireEvent.change(screen.getByLabelText("WhatsApp number"), { target: { value: "71 234 567" } });
    expect(screen.getByLabelText(/WhatsApp community/)).not.toBeChecked();
    expect(screen.getByRole("link", { name: "Read our privacy notice" })).toHaveAttribute("href", "/privacy");
    await sendReport();

    expect(heading()).toBe("Your report is on its way, Thabo.");
    expect(screen.getByRole("link", { name: "Pick a time" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "Back to kitsonexus.com" })).toHaveAttribute("href", "/");
  });
});

describe("the drop-off counter", () => {
  it("counts opening the check with its flyer label", () => {
    vi.mocked(countStep).mockClear();
    renderPage("/fit?from=flyer");
    expect(vi.mocked(countStep).mock.calls[0]).toEqual(["opened", "flyer"]);
  });

  it("Start again counts as someone new", () => {
    localStorage.setItem("kitso-fit-check-progress", JSON.stringify({ savedAt: Date.now(), source: null, draft: { teamSize: "6-20" } }));
    vi.mocked(countStep).mockClear();
    vi.mocked(forgetCounted).mockClear();
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Start again" }));
    expect(forgetCounted).toHaveBeenCalledTimes(1);
    expect(vi.mocked(countStep).mock.calls.map((c) => c[0])).toEqual(["opened", "opened", "businessTypes"]);
    localStorage.clear();
  });

  it("counts the first question once someone starts", () => {
    vi.mocked(countStep).mockClear();
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /start|begin|check my business/i }));
    expect(vi.mocked(countStep).mock.calls.map((c) => c[0])).toEqual(["opened", "businessTypes"]);
  });
});

describe("the verdict on screen", () => {
  it("says strong fit when everything is in place, and steps back if they're just exploring", () => {
    renderPage();
    answerWorkshop("6,000");
    expect(screen.getByText("Odoo is a strong fit for you")).toBeInTheDocument();
    pick("Just exploring");
    expect(screen.queryByText("Odoo is a strong fit for you")).toBeNull();
    expect(screen.getByText("Odoo can help. Start small")).toBeInTheDocument();
    pick("This year");
    expect(screen.getByText("Odoo is a strong fit for you")).toBeInTheDocument();
  });
});

describe("someone Odoo isn't right for yet", () => {
  // The real rehearsal trainer: on her own, unregistered, about P2,000 a client.
  const answerTrainer = () => {
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Professional Services"); next();
    pick("Just me"); next();
    pick("Not yet"); next();
    pick("WhatsApp"); pick("Paper"); next();
    pick("Yes, it's my call"); next();
    pick("10 to 30"); pick("A few");
    fireEvent.change(screen.getByLabelText(/If one of those enquiries/), { target: { value: "2000" } });
    next();
    pick("Under P500,000"); pick("Under 30 days"); pick("Now and then"); next();
    pick("Under 20"); pick("A few");
    fireEvent.change(screen.getByLabelText(/When one of those bookings/), { target: { value: "2000" } });
    next();
    pickIn(/apps, spreadsheets/, "2 or 3"); pickIn(/people do admin/, "1"); pick("2 to 5 hours"); next();
    pick("A few days"); pick("Fairly sure"); next();
  };

  it("says so plainly and gives advice from her answers, not a pitch", () => {
    renderPage();
    answerTrainer();
    expect(screen.getByText("Not yet. Start simpler first")).toBeInTheDocument();
    expect(screen.queryByText(/strong fit/i)).toBeNull();
    expect(screen.getByRole("heading", { name: "What we'd do in your place" })).toBeInTheDocument();
    expect(screen.getByText("Register your business with CIPA.")).toBeInTheDocument();
    expect(screen.getByText(/free calendar/)).toBeInTheDocument();
    expect(screen.getByText("You've hired your first staff member.")).toBeInTheDocument();
  });

  it("doesn't ask how soon or offer a sales call", async () => {
    renderPage();
    answerTrainer();
    expect(screen.queryByText("How soon do you want this sorted?")).toBeNull();
    expect(screen.queryByText(/how soon/i)).toBeNull();
    expect(screen.getByText("Free · No sales call")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Email me this advice" }));
    // Promised no sales call, so the form doesn't talk about following up.
    expect(screen.getByText("We use your details to send your report. You can stop any message at any time.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Neo" } });
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "Neo Rehearsals" } });
    fireEvent.change(screen.getByLabelText("Email", { selector: "input[type=email]" }), { target: { value: "neo@example.com" } });
    fireEvent.change(screen.getByLabelText("WhatsApp number"), { target: { value: "71 234 567" } });
    await sendReport();
    expect(heading()).toBe("Your report is on its way, Neo.");
    expect(screen.queryByRole("link", { name: "Pick a time" })).toBeNull();
    expect(screen.getByRole("link", { name: /WhatsApp community/ })).toHaveAttribute("href", "https://chat.whatsapp.com/EGogxgoYJpDEHIRn8BhNhu");
    // The browser's Back button can't bring back an offer they were promised they wouldn't get.
    browserBack();
    expect(heading()).toBe("Your report is on its way, Neo.");
    expect(screen.queryByRole("link", { name: "Pick a time" })).toBeNull();
  });
});

describe("someone who can't decide", () => {
  const finish = async () => {
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Neo" } });
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "Neo Works" } });
    fireEvent.change(screen.getByLabelText("Email", { selector: "input[type=email]" }), { target: { value: "neo@example.com" } });
    fireEvent.change(screen.getByLabelText("WhatsApp number"), { target: { value: "71 234 567" } });
    await sendReport();
  };

  it("isn't offered a call at a smaller business, even if they say now", async () => {
    renderPage();
    answerWorkshop("3,500", "No, someone else decides");
    expect(screen.getByText("Odoo can help")).toBeInTheDocument();
    pick("Now");
    expect(screen.queryByRole("button", { name: "Email my report and book a call" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Email me my full report" }));
    // No one will contact them, so the form doesn't say anyone will.
    expect(screen.queryByText(/to follow up about it/)).toBeNull();
    await finish();
    expect(screen.queryByRole("link", { name: "Pick a time" })).toBeNull();
    expect(screen.queryByText(/We'll also be in touch/)).toBeNull();
  });

  it("at a strong business that's ready, hears from the sales representative, and is never told it's a strong fit", async () => {
    renderPage();
    answerWorkshop("6,000", "No, someone else decides");
    expect(screen.queryByText(/strong fit/i)).toBeNull();
    pick("Within 3 months");
    expect(screen.queryByRole("button", { name: "Email my report and book a call" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Email me my full report" }));
    expect(screen.getByText(/to follow up about it/)).toBeInTheDocument();
    await finish();
    expect(screen.queryByRole("link", { name: "Pick a time" })).toBeNull();
    expect(screen.getByText("We'll also be in touch to help you reach whoever decides.")).toBeInTheDocument();
  });
});

describe("a big firm already running on one system", () => {
  const answerBottler = () => {
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Manufacturing"); next();
    pick("200+"); next();
    pick("Yes, with CIPA in Botswana"); next();
    pick("Another system");
    fireEvent.change(screen.getByLabelText(/Which system/), { target: { value: "SAP" } });
    next();
    pick("Yes, but others have a say"); next();
    pick("10 to 30"); pick("A few");
    fireEvent.change(screen.getByLabelText(/If one of those enquiries/), { target: { value: "52000" } });
    next();
    pick("Over P50 million"); pick("30 to 60 days"); pick("Rarely"); next();
    pickIn(/apps, spreadsheets/, "1"); pickIn(/people do admin/, "4 to 6"); pick("5 to 10 hours"); next();
    pick("Over P2 million"); pick("Rarely"); next();
    pick("About a week"); pick("Fairly sure"); next();
  };
  const finish = async () => {
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Neo" } });
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "Neo Drinks" } });
    fireEvent.change(screen.getByLabelText("Email", { selector: "input[type=email]" }), { target: { value: "neo@example.com" } });
    fireEvent.change(screen.getByLabelText("WhatsApp number"), { target: { value: "71 234 567" } });
    await sendReport();
  };

  it("isn't sold Odoo, and only hears from anyone if it says it's ready", async () => {
    renderPage();
    answerBottler();
    expect(screen.getByText("You may not need Odoo right now")).toBeInTheDocument();
    expect(screen.getByText(/we also build custom software/)).toBeInTheDocument();
    expect(screen.getByText("Free · No sales call")).toBeInTheDocument();
    pick("Within 3 months");
    expect(screen.getByText("You may not need Odoo right now")).toBeInTheDocument();
    expect(screen.queryByText("Free · No sales call")).toBeNull();
    expect(screen.getByText("Free · We'll be in touch about custom software")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Email me this advice" }));
    expect(screen.getByText(/to follow up about it/)).toBeInTheDocument();
    await finish();
    expect(screen.getByText("We'll also be in touch about custom software.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Pick a time" })).toBeNull();
    // The browser's Back button keeps the same message.
    browserBack();
    expect(screen.getByText("We'll also be in touch about custom software.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Pick a time" })).toBeNull();
  });

  it("stays out of the way if it says it's just exploring", async () => {
    renderPage();
    answerBottler();
    pick("Just exploring");
    expect(screen.getByText("Free · No sales call")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Email me this advice" }));
    expect(screen.queryByText(/to follow up about it/)).toBeNull();
    await finish();
    expect(screen.queryByText("We'll also be in touch about custom software.")).toBeNull();
  });
});

describe("if the report can't be sent", () => {
  it("says plainly when a daily limit held the email back, and doesn't ask them to retry now", async () => {
    vi.mocked(sendFitCheckLead).mockResolvedValueOnce("held-back");
    renderPage();
    answerWorkshop();
    fireEvent.click(screen.getByRole("button", { name: /Email me my full report/ }));
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Neo" } });
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "Neo Works" } });
    fireEvent.change(screen.getByLabelText("Email", { selector: "input[type=email]" }), { target: { value: "neo@example.com" } });
    fireEvent.change(screen.getByLabelText("WhatsApp number"), { target: { value: "71 234 567" } });
    await sendReport();
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("We can't email another report today.");
    expect(alert).toHaveTextContent("Your answers have reached our team, so they can still follow up. For another report by email, please try again tomorrow.");
    expect(alert).not.toHaveTextContent("That didn't send.");
    expect(within(alert).getByRole("link", { name: "WhatsApp" })).toBeInTheDocument();
  });

  it("says so, keeps the answers and details, and lets them try again", async () => {
    vi.mocked(sendFitCheckLead).mockResolvedValueOnce("failed");
    renderPage();
    answerWorkshop();
    fireEvent.click(screen.getByRole("button", { name: /Email me my full report/ }));
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Neo" } });
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "Neo Works" } });
    fireEvent.change(screen.getByLabelText("Email", { selector: "input[type=email]" }), { target: { value: "neo@example.com" } });
    fireEvent.change(screen.getByLabelText("WhatsApp number"), { target: { value: "71 234 567" } });
    await sendReport();
    expect(screen.getByRole("alert")).toHaveTextContent("That didn't send.");
    expect(screen.getByLabelText("First name")).toHaveValue("Neo");
    expect(localStorage.getItem("kitso-fit-check-progress")).not.toBeNull();
    await sendReport();
    expect(heading()).toBe("Your report is on its way, Neo.");
    expect(localStorage.getItem("kitso-fit-check-progress")).toBeNull();
    expect(vi.mocked(sendFitCheckLead)).toHaveBeenCalledTimes(2);
  });

  it("only the server's confirmation counts, and the trap box travels with it", async () => {
    renderPage();
    answerWorkshop();
    fireEvent.click(screen.getByRole("button", { name: /Email me my full report/ }));
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Neo" } });
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "Neo Works" } });
    fireEvent.change(screen.getByLabelText("Email", { selector: "input[type=email]" }), { target: { value: "neo@example.com" } });
    fireEvent.change(screen.getByLabelText("WhatsApp number"), { target: { value: "71 234 567" } });
    await sendReport();
    expect(vi.mocked(sendFitCheckLead).mock.calls[0][0].website).toBe("");
  });
});

describe("the way back to the main site", () => {
  it("is a plain link at the bottom of a question, not a logo beside the progress bar", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    const link = screen.getByRole("link", { name: "Back to kitsonexus.com" });
    expect(link).toHaveAttribute("href", "/");
    expect(screen.queryByRole("link", { name: "Kitso Nexus home page" })).toBeNull();
    // It comes after the Next button, so it never competes with moving on.
    expect(screen.getByRole("button", { name: "Next" }).compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("is there on the details form too", () => {
    renderPage();
    answerWorkshop();
    fireEvent.click(screen.getByRole("button", { name: /Email me my full report/ }));
    expect(screen.getByRole("link", { name: "Back to kitsonexus.com" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("link", { name: "Kitso Nexus home page" })).toBeNull();
  });
});

describe("the two money questions", () => {
  const toMissedSales = () => {
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Equipment & Machinery"); next();
    pick("6–20"); next();
    pick("Yes, with CIPA in Botswana"); next();
    pick("Excel or Google Sheets"); next();
    pick("Yes, it's my call"); next();
  };

  it("asks what a lost enquiry would have paid, on the missed sales screen", () => {
    renderPage();
    toMissedSales();
    expect(heading()).toBe("How many enquiries come in each month?");
    expect(screen.getByLabelText("If one of those enquiries had become a sale, how much would the customer usually pay?")).toBeInTheDocument();
    expect(screen.queryByText("Usually what the customer would have paid for it.")).toBeNull();
  });

  it("asks what a lost booking costs, on the bookings screen, with a hint", () => {
    renderPage();
    toMissedSales();
    pick("30 to 100"); pick("About a quarter");
    fireEvent.change(screen.getByLabelText("If one of those enquiries had become a sale, how much would the customer usually pay?"), { target: { value: "3,500" } });
    next();
    pick("P2 million to P10 million"); pick("60 to 90 days"); pick("Now and then"); next();
    expect(heading()).toBe("How many bookings or appointments a month?");
    const box = screen.getByLabelText("When one of those bookings is lost, how much money do you lose?");
    expect(box).toHaveAccessibleDescription("Usually what the customer would have paid for it.");
  });
});

describe("the registration question", () => {
  it("offers CIPA for Botswana and another country, and explains CIPA", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Equipment & Machinery"); next();
    pick("6–20"); next();
    expect(heading()).toBe("Is your business registered?");
    expect(screen.getByText(/In Botswana, that's with CIPA/)).toBeInTheDocument();
    for (const option of ["Yes, with CIPA in Botswana", "Yes, in another country", "Registration is in progress", "Not yet"]) {
      expect(screen.getByLabelText(option)).toBeInTheDocument();
    }
  });
});

describe("saved answers and where people came from", () => {
  const fillDetails = () => {
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Thabo" } });
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "Tlotlo" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "t@x.co.bw" } });
    fireEvent.change(screen.getByLabelText("WhatsApp number"), { target: { value: "+27 82 123 4567" } });
  };

  it("offers to continue on a return visit, at the first unanswered question", () => {
    const first = renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Equipment & Machinery"); next();
    pick("6–20"); next();
    first.unmount();

    renderPage();
    expect(screen.queryByRole("button", { name: /Start the check/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Continue where you left off/ }));
    expect(heading()).toBe("Is your business registered?");
    expect(screen.getByText("3 of 11")).toBeInTheDocument();
  });

  it("goes straight to the result when every question was answered", () => {
    const first = renderPage();
    answerWorkshop();
    first.unmount();

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Continue where you left off/ }));
    expect(heading()).toContain("out of 100");
  });

  it("can start again, wiping the saved answers", () => {
    const first = renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Equipment & Machinery");
    first.unmount();

    const second = renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Start again" }));
    expect(screen.getByLabelText("Equipment & Machinery")).not.toBeChecked();
    second.unmount();

    renderPage();
    expect(screen.getByRole("button", { name: /Start the check/ })).toBeInTheDocument();
  });

  it("never saves names, emails or numbers, and clears the answers once finished", async () => {
    renderPage("/fit?from=flyer");
    answerWorkshop();
    fireEvent.click(screen.getByRole("button", { name: /Email me my full report/ }));
    fillDetails();
    expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toMatch(/Thabo|Tlotlo|t@x|82 123 4567|821234567/);
    await sendReport();
    expect(heading()).toBe("Your report is on its way, Thabo.");
    expect(localStorage.getItem("kitso-fit-check-progress")).toBeNull();
  });

  it("keeps the same screen on a reload, and keeps the label in the address", () => {
    const first = renderPage("/fit?from=flyer");
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Equipment & Machinery"); next();
    pick("6–20"); next();
    expect(screen.getByTestId("address")).toHaveTextContent("?from=flyer");
    const run = sessionStorage.getItem("kitso-fit-check-run");
    first.unmount();

    // A reload keeps the browser's history entry, which is what this stands in for.
    renderPage({ pathname: "/fit", state: { step: { name: "question", index: 2 }, run } });
    expect(heading()).toBe("Is your business registered?");
  });

  it("lets Back reach earlier questions after continuing", () => {
    const first = renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Equipment & Machinery"); next();
    pick("6–20"); next();
    first.unmount();

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Continue where you left off/ }));
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(heading()).toBe("How many people work in the business, including you?");
    expect(screen.getByLabelText("6–20")).toBeChecked();
  });

  it("doesn't restart the 14-day clock just by opening the page", () => {
    const first = renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Equipment & Machinery");
    first.unmount();
    const saved = JSON.parse(localStorage.getItem("kitso-fit-check-progress")!);
    localStorage.setItem("kitso-fit-check-progress", JSON.stringify({ ...saved, savedAt: Date.now() - 1000 }));
    const before = localStorage.getItem("kitso-fit-check-progress");

    renderPage();
    expect(localStorage.getItem("kitso-fit-check-progress")).toBe(before);
  });

  it("leaves nothing for the next person: Back stays on the done screen and can't send twice", async () => {
    renderPage("/fit?from=flyer");
    answerWorkshop();
    fireEvent.click(screen.getByRole("button", { name: /Email me my full report/ }));
    fillDetails();
    await sendReport();
    expect(screen.queryByLabelText("First name")).toBeNull();
    expect(vi.mocked(sendFitCheckLead)).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("kitso-fit-check-progress")).toBeNull();
  });

  it("after a reload on the done screen, still says it's done, with no name, and saves nothing", () => {
    const run = (renderPage().unmount(), sessionStorage.getItem("kitso-fit-check-run"));
    localStorage.clear();
    renderPage({ pathname: "/fit", state: { step: { name: "done", wantsCall: true }, run } });
    expect(heading()).toBe("Your report is on its way.");
    expect(screen.getByRole("heading", { name: "Now book your call" })).toBeInTheDocument();
    expect(localStorage.getItem("kitso-fit-check-progress")).toBeNull();
  });

  it("carries the flyer label through to the finished lead, with any country's number", async () => {
    renderPage("/fit?from=flyer");
    answerWorkshop();
    fireEvent.click(screen.getByRole("button", { name: /Email me my full report/ }));
    fillDetails();
    await sendReport();

    const lead = vi.mocked(sendFitCheckLead).mock.calls[0][0];
    expect(lead.source).toBe("flyer");
    expect(lead.details.whatsapp).toBe("+27821234567");
    expect(lead.answers.teamSize).toBe("6-20");
  });

  it("remembers the flyer label when they come back later without it", async () => {
    const first = renderPage("/fit?from=flyer");
    answerWorkshop();
    first.unmount();

    renderPage("/fit");
    fireEvent.click(screen.getByRole("button", { name: /Continue where you left off/ }));
    fireEvent.click(screen.getByRole("button", { name: /Email me my full report/ }));
    fillDetails();
    await sendReport();
    expect(vi.mocked(sendFitCheckLead).mock.calls[0][0].source).toBe("flyer");
  });

  it("has no label for someone who typed the address", async () => {
    renderPage();
    answerWorkshop();
    fireEvent.click(screen.getByRole("button", { name: /Email me my full report/ }));
    fillDetails();
    await sendReport();
    expect(vi.mocked(sendFitCheckLead).mock.calls[0][0].source).toBeNull();
  });
});

describe("details check", () => {
  const ok = { firstName: "Thabo", businessName: "Tlotlo", email: "t@x.co.bw", whatsapp: "71 234 567", joinCommunity: false, emailTips: true };

  it("accepts WhatsApp numbers from any country and stores them with the code", () => {
    expect(fitCheckDetails.parse({ ...ok, whatsapp: "+267 71-234-567" }).whatsapp).toBe("+26771234567");
    expect(fitCheckDetails.parse({ ...ok, whatsapp: "+27 82 123 4567" }).whatsapp).toBe("+27821234567");
    expect(fitCheckDetails.parse({ ...ok, whatsapp: "00264 81 123 4567" }).whatsapp).toBe("+264811234567");
    expect(fitCheckDetails.parse({ ...ok, whatsapp: "+1 (415) 555-0100" }).whatsapp).toBe("+14155550100");
    expect(fitCheckDetails.parse({ ...ok, whatsapp: "267 71 234 567" }).whatsapp).toBe("+26771234567");
  });

  it("treats a short number with no code as Botswana", () => {
    expect(fitCheckDetails.parse(ok).whatsapp).toBe("+26771234567");
    expect(fitCheckDetails.parse({ ...ok, whatsapp: "3901234" }).whatsapp).toBe("+2673901234");
  });

  it("asks for the code on a longer number without one, and rejects impossible numbers", () => {
    const message = (whatsapp: string) => fitCheckDetails.safeParse({ ...ok, whatsapp }).error?.issues[0].message;
    expect(message("082 123 4567")).toMatch(/country code/);
    expect(message("+267 712")).toMatch(/country code/);
    expect(message("+267 7123 45678")).toMatch(/country code/);
    expect(message("+0 82 123 4567")).toMatch(/country code/);
    expect(message("+1234567890123456")).toMatch(/country code/);
    expect(message("+27 abc 4567")).toMatch(/country code/);
    expect(message("+71 234 567")).toMatch(/country code/);
  });

  it("rejects bad numbers, emails, blanks and extra fields", () => {
    expect(fitCheckDetails.safeParse({ ...ok, whatsapp: "12345" }).success).toBe(false);
    expect(fitCheckDetails.safeParse({ ...ok, email: "not-an-email" }).success).toBe(false);
    expect(fitCheckDetails.safeParse({ ...ok, firstName: "   " }).success).toBe(false);
    expect(fitCheckDetails.safeParse({ ...ok, admin: true }).success).toBe(false);
  });

  it("keeps line breaks and hidden characters out of names", () => {
    for (const bad of ["Thabo\r\nBcc: x@evil.com", "a\u0000b", "\u202Emoc.live", "\u200B", "---"]) {
      expect(fitCheckDetails.safeParse({ ...ok, firstName: bad }).success).toBe(false);
      expect(fitCheckDetails.safeParse({ ...ok, businessName: bad }).success).toBe(false);
    }
    expect(fitCheckDetails.parse({ ...ok, firstName: "  Kgomotso  " }).firstName).toBe("Kgomotso");
    expect(fitCheckDetails.parse({ ...ok, businessName: "Tlotlo Auto Parts & Service (Pty) Ltd" }).businessName).toBe("Tlotlo Auto Parts & Service (Pty) Ltd");
  });
});

describe("the site around the fit check", () => {
  const renderAppAt = async (path: string) => {
    window.history.pushState({}, "", path);
    const { default: App } = await import("../App");
    return render(<App />);
  };

  it("hides the menu, footer and floating WhatsApp button on /fit", async () => {
    await renderAppAt("/fit");
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Odoo isn't for everyone.");
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Services" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /chat on whatsapp/i })).not.toBeInTheDocument();
  });

  it("links to the fit check from the footer elsewhere", async () => {
    await renderAppAt("/privacy");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Services" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /chat on whatsapp/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fit check" })).toHaveAttribute("href", "/fit");
  });
});

describe("the wording that counts the questions", () => {
  it("says 'up to' the real number of question screens", () => {
    for (const file of ["src/components/fit/StartScreen.tsx", "src/components/fit/FitCheckPromo.tsx"]) {
      const text = readFileSync(resolve(__dirname, "../..", file), "utf8");
      expect(text).toContain(`Answer up to ${MAX_SCREENS} quick questions`);
    }
  });
});

describe("ways into the fit check", () => {
  it("has a fit check button in the Home and Contact heroes", async () => {
    for (const path of ["/", "/contact"]) {
      window.history.pushState({}, "", path);
      const { default: App } = await import("../App");
      const { unmount } = render(<App />);
      const buttons = screen.getAllByRole("link", { name: /Is Odoo right for you\?/ });
      expect(buttons[0]).toHaveAttribute("href", "/fit");
      unmount();
    }
  });

  it("puts the fit check banner on About", async () => {
    window.history.pushState({}, "", "/about");
    const { default: App } = await import("../App");
    render(<App />);
    expect(screen.getByRole("heading", { name: "Not sure Odoo is right for you?" })).toBeInTheDocument();
  });
});

describe("free result, where you stand", () => {
  it("shows Pula a year for the two most painful areas and blurs the rest", () => {
    renderPage();
    answerWorkshop();
    expect(screen.getByText("P137,000 to P205,000 a year")).toBeInTheDocument();
    expect(screen.getByText("P67,000 to P96,000 a year")).toBeInTheDocument();
    // P6m sales: missed sales ~P171k is about 3%, bookings ~P82k about 1%: both worth fixing
    expect(screen.getAllByText("Worth fixing")).toHaveLength(2);
    expect(screen.getByText(/about 2.8% of your yearly sales/)).toBeInTheDocument();
    // the locked areas show a made-up blurred figure that screen readers skip
    const blurred = screen.getAllByText("P48,000 a year");
    expect(blurred.length).toBe(4);
    blurred.forEach((el) => expect(el).toHaveAttribute("aria-hidden", "true"));
  });
});

describe("an unusable system name", () => {
  it("is left out instead of blocking the result", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Start the check/ }));
    pick("Retail & Distribution"); next();
    pick("2–5"); next();
    pick("Yes, with CIPA in Botswana"); next();
    pick("Another system");
    fireEvent.change(screen.getByLabelText(/Which system/), { target: { value: "   " } });
    next();
    pick("Yes, it's my call"); next();
    pick("10 to 30"); pick("A few");
    fireEvent.change(screen.getByLabelText("If one of those enquiries had become a sale, how much would the customer usually pay?"), { target: { value: "1000" } });
    next();
    pick("Under P500,000"); pick("30 to 60 days"); pick("Rarely"); next();
    pickIn(/apps, spreadsheets/, "2 or 3"); pickIn(/people do admin/, "1"); pick("2 to 5 hours"); next();
    pick("I don't know"); pick("Every month"); next();
    pick("A day or less"); pick("Very sure"); next();
    expect(heading()).toContain("out of 100");
  });
});

describe("Pula ranges", () => {
  it("says 'Up to' instead of starting at P0", async () => {
    const { formatRange } = await import("@/components/fit/shared");
    expect(formatRange(0, 1_000)).toBe("Up to P1,000");
    expect(formatRange(4_000, 4_000)).toBe("P4,000");
    expect(formatRange(137_000, 205_000)).toBe("P137,000 to P205,000");
  });
});
