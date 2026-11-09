import { ChangeEvent, FormEvent, ReactNode, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { INDUSTRIES } from "@/data/industries";
import { EMAIL, WHATSAPP_URL } from "@/lib/contact";
import { CONTACT_LIMITS, ContactFields, contactFieldProblem, sendContactMessage, toContactMessage } from "@/lib/contactMessage";

const EMPTY: ContactFields = { name: "", email: "", company: "", industry: "", phone: "", message: "", website: "" };
const INDUSTRY_CHOICES = [...INDUSTRIES.map((industry) => industry.aboutName ?? industry.name), "Other"];
// At least one character that isn't a space.
const NOT_BLANK = ".*\\S.*";

type Status = "editing" | "sending" | "sent" | "failed";

const card = "flex flex-col rounded-[18px] bg-white px-5 py-6 lg:rounded-[22px] lg:p-10";
const fieldLabel = "text-sm font-medium leading-[18px] text-[#1F1F1F]";
// outline-hidden keeps an outline in Windows high-contrast mode, where the ring isn't drawn.
const fieldBox =
  "w-full rounded-md border border-[#C9C9C9] bg-white px-3.5 text-base outline-hidden focus-visible:border-kn-teal focus-visible:ring-2 focus-visible:ring-kn-teal/25";
const roundButton = "h-auto p-[15px] text-[15px] leading-[18px]";

const Field = ({ id, text, children }: { id: string; text: ReactNode; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className={fieldLabel}>
      {text}
    </label>
    {children}
  </div>
);

// "Leave us a note" in two steps (Paper page M step 1; step 2 and the results
// on page K). It says "sent" only when the server confirms; otherwise it keeps
// what was typed and offers WhatsApp and email instead.
const ContactForm = () => {
  const id = useId();
  const [fields, setFields] = useState(EMPTY);
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<Status>("editing");
  const firstOfStep = useRef<HTMLInputElement>(null);
  const sentHeading = useRef<HTMLHeadingElement>(null);
  const stepChanged = useRef(false);
  const sending = status === "sending";

  // Moving between steps puts the cursor in the first box of the new step.
  useEffect(() => {
    if (stepChanged.current) firstOfStep.current?.focus();
  }, [step]);

  // The form disappears once sent, so the confirmation takes the focus and is read out.
  useEffect(() => {
    if (status === "sent") sentHeading.current?.focus();
  }, [status]);

  const goToStep = (target: 1 | 2) => {
    stepChanged.current = true;
    setStatus("editing");
    setStep(target);
  };

  const update = (key: keyof ContactFields) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.setCustomValidity("");
    setFields((current) => ({ ...current, [key]: e.target.value }));
  };

  // The server's rules, checked here so a problem appears beside its box and can be fixed.
  const pointOutProblem = (boxes: Parameters<typeof contactFieldProblem>[0][]) => {
    for (const box of boxes) {
      const problem = contactFieldProblem(box, fields[box]);
      if (problem) {
        const input = document.getElementById(`${id}-${box}`) as HTMLInputElement | HTMLTextAreaElement;
        input.setCustomValidity(problem);
        input.reportValidity();
        return true;
      }
    }
    return false;
  };

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (!pointOutProblem(["name", "email", "company"])) goToStep(2);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (sending || pointOutProblem(["phone", "message"])) return;
    setStatus("sending");
    const sent = await sendContactMessage(toContactMessage(fields));
    if (sent) setFields(EMPTY);
    setStatus(sent ? "sent" : "failed");
  };

  if (status === "sent") {
    return (
      <div role="status" className={`${card} gap-3`}>
        <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-[#E3F1E6] text-xl font-semibold text-[#006B30]">
          ✓
        </span>
        <h3 ref={sentHeading} tabIndex={-1} className="text-[22px] leading-7 tracking-[-0.03em] outline-hidden">
          Message sent.
        </h3>
        <p className="text-[15px] leading-[23px] text-kn-body">Thanks. We'll reply by email, or on WhatsApp if you gave us your number.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <section aria-labelledby={`${id}-title`} className={`${card} gap-4`}>
        <div className="flex items-center justify-between gap-4">
          <h3 id={`${id}-title`} className="text-[26px] font-bold leading-8 tracking-[-0.035em] lg:text-[32px] lg:leading-[38px]">
            Leave us a note
          </h3>
          <p className="shrink-0 text-[13px] leading-4 text-[#616161]">Step {step} of 2</p>
        </div>
        <div aria-hidden="true" className="h-1 rounded-full bg-kn-line">
          <div className={`h-1 rounded-full bg-kn-lime ${step === 1 ? "w-1/2" : "w-full"}`} />
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext} className="flex flex-col gap-4">
            <Field id={`${id}-name`} text="Full name">
              <input
                ref={firstOfStep}
                id={`${id}-name`}
                className={`${fieldBox} h-[46px] text-kn-night`}
                required
                pattern={NOT_BLANK}
                title="Please enter your name."
                autoComplete="name"
                maxLength={CONTACT_LIMITS.name}
                value={fields.name}
                onChange={update("name")}
              />
            </Field>
            <Field id={`${id}-email`} text="Email address">
              <input
                id={`${id}-email`}
                type="email"
                className={`${fieldBox} h-[46px] text-kn-night`}
                required
                autoComplete="email"
                maxLength={CONTACT_LIMITS.email}
                value={fields.email}
                onChange={update("email")}
              />
            </Field>
            <Field id={`${id}-company`} text="Company name">
              <input
                id={`${id}-company`}
                className={`${fieldBox} h-[46px] text-kn-night`}
                autoComplete="organization"
                maxLength={CONTACT_LIMITS.company}
                value={fields.company}
                onChange={update("company")}
              />
            </Field>
            <Field id={`${id}-industry`} text="Which industry?">
              <span className="relative">
                <select
                  id={`${id}-industry`}
                  className={`${fieldBox} h-[46px] appearance-none pr-10 *:text-kn-night ${fields.industry ? "text-kn-night" : "text-[#616161]"}`}
                  value={fields.industry}
                  onChange={update("industry")}
                >
                  <option value="">Select your industry</option>
                  {INDUSTRY_CHOICES.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#616161]" />
              </span>
            </Field>
            <button type="submit" className={buttonVariants({ variant: "teal", className: roundButton })}>
              Next: your message
            </button>
          </form>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col gap-4">
            <Field
              id={`${id}-phone`}
              text={
                <>
                  Phone or WhatsApp <span className="font-normal text-[#616161]">(optional)</span>
                </>
              }
            >
              <input
                ref={firstOfStep}
                id={`${id}-phone`}
                type="tel"
                className={`${fieldBox} h-[46px] text-kn-night`}
                autoComplete="tel"
                maxLength={CONTACT_LIMITS.phone}
                value={fields.phone}
                onChange={update("phone")}
              />
            </Field>
            <Field id={`${id}-message`} text="Your message">
              <textarea
                id={`${id}-message`}
                className={`${fieldBox} h-[140px] resize-y py-3 text-kn-night`}
                required
                maxLength={CONTACT_LIMITS.message}
                value={fields.message}
                onChange={update("message")}
              />
            </Field>
            {/* Spam trap, hidden from people, screen readers and password managers. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={`${id}-extra`}>Leave this empty</label>
              <input
                id={`${id}-extra`}
                tabIndex={-1}
                autoComplete="off"
                data-1p-ignore=""
                data-lpignore="true"
                data-bwignore=""
                data-form-type="other"
                value={fields.website}
                onChange={update("website")}
              />
            </div>
            <p className="text-[13px] leading-[19px] text-kn-muted">
              We use these details to reply to you and to follow up about how we could help.{" "}
              <Link to="/privacy" className="text-kn-teal underline">
                Privacy notice
              </Link>
            </p>
            <button type="submit" disabled={sending} className={buttonVariants({ variant: "teal", className: roundButton })}>
              {sending ? "Sending…" : "Send message"}
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => goToStep(1)}
              className="self-center text-sm leading-[18px] text-kn-body underline disabled:opacity-50"
            >
              Back
            </button>
          </form>
        )}
      </section>

      {status === "failed" && (
        <div role="alert" className={`${card} gap-3.5 border border-kn-line`}>
          <h3 className="text-[22px] leading-7 tracking-[-0.03em]">That didn't send.</h3>
          <p className="text-[15px] leading-[23px] text-kn-body">Your message is still in the form, so nothing is lost. You can also reach us directly:</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "whatsapp", className: roundButton })}
          >
            WhatsApp us
          </a>
          <a href={`mailto:${EMAIL}`} className={buttonVariants({ variant: "outlineDark", className: `${roundButton} py-3.5` })}>
            Email {EMAIL}
          </a>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
