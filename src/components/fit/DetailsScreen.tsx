import { type FormEvent, useId, useState } from "react";
import { flushSync } from "react-dom";
import { Link } from "react-router";
import { EMAIL, WHATSAPP_URL } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { DETAILS_LIMITS, fitCheckDetails, type DetailsInput, type FitCheckDetails } from "@/lib/fitCheck/details";
import type { PostOutcome } from "@/lib/postConfirmed";
import { BackButton, BackToSite, FitShell, ScreenTitle } from "./parts";
import { primaryButton } from "./shared";


interface Props {
  areaCount: number;
  followUp: boolean; // false for someone who was promised no sales call
  value: DetailsInput;
  onChange: (value: DetailsInput) => void;
  onBack: () => void;
  /** Resolves to what the server made of them. */
  onSubmit: (details: FitCheckDetails, website: string) => Promise<PostOutcome>;
}

type TextKey = "firstName" | "businessName" | "email" | "whatsapp";

// Screen 5 on Paper page I.
const DetailsScreen = ({ areaCount, followUp, value, onChange, onBack, onSubmit }: Props) => {
  const [errors, setErrors] = useState<Partial<Record<TextKey, string>>>({});
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<Exclude<PostOutcome, "confirmed"> | null>(null);
  const [website, setWebsite] = useState("");
  // Editing a field clears its message; the next Send checks it again.
  const set = <K extends keyof DetailsInput>(key: K, v: DetailsInput[K]) => {
    onChange({ ...value, [key]: v });
    if (key in errors) setErrors(({ [key as TextKey]: _gone, ...rest }) => rest);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const parsed = fitCheckDetails.safeParse(value);
    if (parsed.success) {
      setErrors({});
      setProblem(null);
      setSending(true);
      const outcome = await onSubmit(parsed.data, website);
      if (outcome !== "confirmed") {
        setSending(false);
        setProblem(outcome);
      }
      return;
    }
    const found: Partial<Record<TextKey, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as TextKey;
      found[key] ??= issue.message;
    }
    // Render the messages first, so the field that takes focus already announces its error.
    flushSync(() => setErrors(found));
    const firstBad = (["firstName", "businessName", "email", "whatsapp"] as const).find((k) => found[k]);
    if (firstBad) document.getElementById(`fit-${firstBad}`)?.focus();
  };

  return (
    <FitShell tone="white">
      <div className="flex flex-col gap-3 px-6 pt-5">
        <div className="flex items-center">
          <BackButton onClick={onBack}>My result</BackButton>
        </div>
        <ScreenTitle className="pt-5 text-[30px] font-bold leading-[34px] tracking-[-0.04em] text-kn-night">
          Where should we send your report?
        </ScreenTitle>
        <p className="text-[15px] leading-[22px] text-kn-body">
          All {areaCount} areas and your next steps.
        </p>
      </div>

      <form noValidate onSubmit={submit} className="flex flex-col">
        <div className="flex flex-col gap-3.5 px-6 pt-6">
          <TextField id="firstName" label="First name" autoComplete="given-name" max={DETAILS_LIMITS.firstName} value={value.firstName} error={errors.firstName} onChange={(v) => set("firstName", v)} />
          <TextField id="businessName" label="Business name" autoComplete="organization" max={DETAILS_LIMITS.businessName} value={value.businessName} error={errors.businessName} onChange={(v) => set("businessName", v)} />
          <TextField id="email" label="Email" type="email" autoComplete="email" max={DETAILS_LIMITS.email} value={value.email} error={errors.email} onChange={(v) => set("email", v)} />
          <TextField id="whatsapp" label="WhatsApp number" type="tel" autoComplete="tel" placeholder="+267 71 234 567" hint="Include your country code, for example +267 or +27" max={24} value={value.whatsapp} error={errors.whatsapp} onChange={(v) => set("whatsapp", v)} />
        </div>

        <div className="flex flex-col gap-3 px-6 pt-[22px]">
          <Check label="Add me to the Kitso WhatsApp community for updates and goodies" checked={value.joinCommunity} onChange={(v) => set("joinCommunity", v)} />
          <Check label="Send me Kitso's tips and offers by email" checked={value.emailTips} onChange={(v) => set("emailTips", v)} />
        </div>

        {/* Spam trap, hidden from people, screen readers and password managers. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="fit-extra">Leave this empty</label>
          <input
            id="fit-extra"
            tabIndex={-1}
            autoComplete="off"
            data-1p-ignore=""
            data-lpignore="true"
            data-bwignore=""
            data-form-type="other"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 px-6 pb-10 pt-6">
          {problem && (
            <div role="alert" className="flex flex-col gap-2 rounded-2xl bg-kn-stone px-[18px] py-4">
              <h2 className="text-lg font-bold leading-6 tracking-[-0.02em] text-kn-night">{problem === "held-back" ? "We can't email another report today." : "That didn't send."}</h2>
              <p className="text-[15px] leading-[22px] text-kn-body">
                {problem === "held-back"
                  ? "Your answers have reached our team, so they can still follow up. For another report by email, please try again tomorrow."
                  : "Your answers are safe, so please try again."}{" "}
                You can also reach us on{" "}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-kn-teal underline underline-offset-2">
                  WhatsApp
                </a>{" "}
                or at{" "}
                <a href={`mailto:${EMAIL}`} className="break-words font-semibold text-kn-teal underline underline-offset-2">
                  {EMAIL}
                </a>
                .
              </p>
            </div>
          )}
          <button type="submit" disabled={sending} className={`${primaryButton} bg-kn-teal text-white hover:bg-kn-teal/90 disabled:opacity-70`}>
            {sending ? "Sending…" : "Send my report"}
          </button>
          <p className="text-[13px] leading-[19px] text-kn-body">
            We use your details to send your report{followUp ? " and to follow up about it" : ""}. You can stop any message at any time.
          </p>
          <Link to="/privacy" target="_blank" className="-mt-1.5 self-start text-[13px] font-semibold leading-[19px] text-kn-teal underline underline-offset-2">
            Read our privacy notice
          </Link>
          <BackToSite className="pt-2" />
        </div>
      </form>
    </FitShell>
  );
};

interface TextFieldProps {
  id: TextKey;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete: string;
  placeholder?: string;
  hint?: string;
  max: number;
}

const TextField = ({ id, label, value, onChange, error, type = "text", autoComplete, placeholder, hint, max }: TextFieldProps) => {
  const errorId = useId();
  const hintId = useId();
  const describedBy = [hint && !error ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`fit-${id}`} className="text-sm font-semibold leading-[18px] text-kn-night">
        {label}
      </label>
      <div
        className={cn(
          "flex h-[52px] items-center gap-3 rounded-[14px] px-4 focus-within:border-2 focus-within:border-kn-teal",
          error ? "border-2 border-[#B42318]" : "border-[1.5px] border-[#E3E1DC]",
        )}
      >
        <input
          id={`fit-${id}`}
          type={type}
          autoComplete={autoComplete}
          inputMode={type === "tel" ? "tel" : undefined}
          maxLength={max}
          value={value}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-base font-medium leading-5 text-kn-night outline-none placeholder:text-[#9A978F]"
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="text-[13px] leading-[18px] text-kn-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-[13px] font-medium leading-[18px] text-[#B42318]">
          {error}
        </p>
      )}
    </div>
  );
};

const Check = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex cursor-pointer items-start gap-3 text-[15px] font-medium leading-[21px] text-kn-night">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-px size-[22px] shrink-0 cursor-pointer appearance-none rounded-md border-[1.5px] border-[#8C8983] bg-white bg-center bg-no-repeat checked:border-kn-teal checked:bg-kn-teal checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2012%2012%22%3E%3Cpath%20d=%22M2.5%206.2L5%208.6L9.5%203.6%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%221.8%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22/%3E%3C/svg%3E')] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kn-teal"
    />
    {label}
  </label>
);

export default DetailsScreen;
