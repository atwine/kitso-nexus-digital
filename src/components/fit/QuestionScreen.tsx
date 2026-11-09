import { useId, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import type { Choice } from "@/lib/fitCheck/questions";
import { ABOUT, minutesLeft, type Field, type Screen } from "@/lib/fitCheck/screens";
import { BackButton, BackToSite, FitShell, ScreenTitle } from "./parts";
import { primaryButton } from "./shared";

export type DraftValue = string | number | string[] | undefined;
export type Draft = Record<string, DraftValue>;

interface Props {
  screen: Screen;
  position: number; // 1-based
  total: number;
  draft: Draft;
  onAnswer: (key: string, value: DraftValue) => void;
  onNext: () => void;
  onBack: () => void;
}

const MAX_PULA = 10_000_000;
const OTHER_SYSTEM_MAX = 80;

const isAnswered = (field: Field, draft: Draft) => {
  const v = draft[field.key];
  if (field.kind === "pula") return typeof v === "number";
  if (field.kind === "ticks") return Array.isArray(v) && v.length > 0;
  return typeof v === "string";
};

// Screens 2 and 3 on Paper page I: one question as big rows, or an area's two
// or three questions as tiles, chips and a Pula amount. "Tick all that apply"
// questions use the same rows with tick boxes.
const QuestionScreen = ({ screen, position, total, draft, onAnswer, onNext, onBack }: Props) => {
  const [missing, setMissing] = useState(false);
  const complete = screen.fields.every((f) => isAnswered(f, draft));
  const helpId = useId();
  const alertId = useId();
  const single = screen.fields.length === 1;
  const footer = screen.eyebrow === ABOUT ? "Your answers stay private." : "Rough numbers are fine.";
  const left = minutesLeft(total - position + 1);
  const labelOf = (i: number) => (i === 0 ? screen.title : (screen.fields[i].label ?? ""));
  const firstGap = screen.fields.findIndex((f) => !isAnswered(f, draft));

  // On a gap, say which question it is and put the keyboard on it.
  const next = () => {
    if (complete) return onNext();
    flushSync(() => setMissing(true));
    document.querySelector<HTMLInputElement>(`#fit-field-${screen.fields[firstGap].key} input`)?.focus();
  };

  return (
    <FitShell tone="white">
      <div className="flex flex-col gap-3 px-6 pt-5">
        <div className="flex items-center justify-between">
          <BackButton onClick={onBack} />
          <p className="text-[13px] font-semibold leading-4 text-kn-muted">
            {position} of {total}
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={position}
          className="h-1.5 overflow-hidden rounded-full bg-kn-card"
        >
          <div className="h-full rounded-full bg-kn-teal transition-[width]" style={{ width: `${Math.round((position / total) * 100)}%` }} />
        </div>
      </div>

      <form
        className="flex grow flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <div className={cn("flex flex-col gap-3 px-6", single ? "pt-11" : "pt-7")}>
          <p className="text-[13px] font-bold uppercase leading-4 tracking-[0.04em] text-kn-olive">{screen.eyebrow}</p>
          <ScreenTitle className="text-[30px] font-bold leading-[34px] tracking-[-0.04em] text-kn-night">{screen.title}</ScreenTitle>
          {screen.help && (
            <p id={helpId} className="text-[15px] leading-[22px] text-kn-body">
              {screen.help}
            </p>
          )}
        </div>

        {screen.fields.map((field, i) => {
          const gap = missing && !isAnswered(field, draft);
          const describedBy = [i === 0 && screen.help ? helpId : null, gap ? alertId : null].filter(Boolean).join(" ") || undefined;
          return <FieldInput key={field.key} field={field} legend={labelOf(i)} describedBy={describedBy} draft={draft} onAnswer={onAnswer} first={i === 0} />;
        })}

        <div className="min-h-8 grow" />

        <div className="flex flex-col gap-3 px-6 pb-10">
          {missing && !complete && (
            <p id={alertId} role="alert" className="text-center text-sm font-medium text-[#B42318]">
              {single || firstGap === 0 ? "Please answer the question to go on." : `Please answer “${labelOf(firstGap)}” to go on.`}
            </p>
          )}
          <button type="submit" className={`${primaryButton} bg-kn-teal text-white hover:bg-kn-teal/90`}>
            Next
          </button>
          <p className="text-center text-[13px] leading-[18px] text-kn-muted">
            {footer} About {left} minute{left === 1 ? "" : "s"} left.
          </p>
          <BackToSite />
        </div>
      </form>
    </FitShell>
  );
};

interface FieldProps {
  field: Field;
  legend: string;
  describedBy?: string;
  draft: Draft;
  onAnswer: Props["onAnswer"];
  first?: boolean;
}

const legendStyle = "pb-3 text-lg font-bold leading-6 tracking-[-0.02em] text-kn-night";

// The first field's question is the screen title, so its group is named by the
// title and the legend is only for screen readers.
const FieldInput = (props: FieldProps) => {
  const { field, legend, describedBy, draft, onAnswer, first } = props;
  const name = useId();
  const helpId = useId();
  const wrap = cn("px-6", first ? (field.kind === "list" || field.kind === "ticks" ? "pt-7" : "pt-6") : "pt-6");
  const help = !first && field.help && (
    <p id={helpId} className="-mt-1.5 pb-3 text-sm leading-5 text-kn-body">
      {field.help}
    </p>
  );
  const described = [describedBy, !first && field.help ? helpId : null].filter(Boolean).join(" ") || undefined;

  if (field.kind === "pula") return <PulaInput {...props} wrap={wrap} help={help} describedBy={described} />;

  const options = (
    <div
      className={cn(
        "clear-left",
        (field.kind === "list" || field.kind === "ticks") && "flex flex-col gap-2.5",
        field.kind === "grid" && "grid grid-cols-2 gap-2.5",
        field.kind === "pills" && "flex flex-wrap gap-2",
      )}
    >
      {field.kind === "ticks"
        ? field.options.map((option) => {
            const picked = (draft[field.key] as string[] | undefined) ?? [];
            const checked = picked.includes(option.id);
            return (
              <Tickbox
                key={option.id}
                option={option}
                checked={checked}
                onToggle={() => onAnswer(field.key, checked ? picked.filter((id) => id !== option.id) : [...picked, option.id])}
              />
            );
          })
        : field.options.map((option) => (
            <Option key={option.id} kind={field.kind} name={name} option={option} checked={draft[field.key] === option.id} onPick={() => onAnswer(field.key, option.id)} />
          ))}
    </div>
  );

  const showOther = field.kind === "ticks" && field.otherId && ((draft[field.key] as string[] | undefined) ?? []).includes(field.otherId);

  return (
    <fieldset id={`fit-field-${field.key}`} className={wrap} aria-describedby={described}>
      {/* A floated legend sits inside the fieldset's padding like any heading. */}
      <legend className={first ? "sr-only" : cn(legendStyle, "float-left w-full")}>{legend}</legend>
      {help && <div className="clear-left">{help}</div>}
      {options}
      {showOther && <OtherSystem value={(draft.otherSystem as string | undefined) ?? ""} onChange={(v) => onAnswer("otherSystem", v === "" ? undefined : v)} />}
    </fieldset>
  );
};

// "Another system": the name helps the call start prepared. Optional.
const OtherSystem = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5 pt-3">
      <label htmlFor={id} className="text-sm font-semibold leading-[18px] text-kn-night">
        Which system? <span className="font-normal text-kn-muted">(optional)</span>
      </label>
      <input
        id={id}
        value={value}
        maxLength={OTHER_SYSTEM_MAX}
        autoComplete="off"
        placeholder="For example Sage Evolution, Zoho, a system made for us"
        onChange={(e) => onChange(e.target.value)}
        className="h-[52px] rounded-[14px] border-[1.5px] border-[#E3E1DC] px-4 text-base font-medium leading-5 text-kn-night outline-none placeholder:text-[#9A978F] focus:border-2 focus:border-kn-teal"
      />
    </div>
  );
};

// Commas appear once the visitor leaves the box, so typing and deleting never fight them.
const PulaInput = ({ field, legend, first, describedBy, draft, onAnswer, wrap, help }: FieldProps & { wrap: string; help: ReactNode }) => {
  const id = useId();
  const value = draft[field.key];
  const [editing, setEditing] = useState<string | null>(null);
  const shown = editing ?? (typeof value === "number" ? value.toLocaleString("en-GB") : "");
  return (
    <div id={`fit-field-${field.key}`} className={cn(wrap, "flex flex-col")}>
      <label htmlFor={id} className={first ? "sr-only" : legendStyle}>
        {legend}
      </label>
      {help}
      <div className="flex h-14 items-center gap-2.5 rounded-[14px] border-[1.5px] border-[#E3E1DC] px-[18px] focus-within:border-2 focus-within:border-kn-teal">
        <span className="text-[17px] font-semibold leading-[22px] text-kn-muted" aria-hidden="true">
          P
        </span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={shown}
          placeholder="0"
          aria-describedby={describedBy}
          onFocus={() => setEditing(typeof value === "number" ? String(value) : "")}
          onBlur={() => setEditing(null)}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
            setEditing(digits);
            onAnswer(field.key, digits === "" ? undefined : Math.min(Number(digits), MAX_PULA));
          }}
          className="w-full bg-transparent text-[17px] font-semibold leading-[22px] text-kn-night outline-none placeholder:text-[#9A978F]"
        />
      </div>
    </div>
  );
};

const focusRing = "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-kn-teal";

const rowStyle = (checked: boolean) =>
  cn(
    "flex min-h-16 cursor-pointer items-center gap-3.5 rounded-2xl px-[18px] py-3 text-[17px] leading-[22px] text-kn-night",
    checked ? "border-2 border-kn-teal bg-kn-stone font-semibold" : "border-[1.5px] border-[#E3E1DC] bg-white font-medium hover:border-kn-teal/50",
    focusRing,
  );

const Tickbox = ({ option, checked, onToggle }: { option: Choice; checked: boolean; onToggle: () => void }) => (
  <label className={rowStyle(checked)}>
    <input type="checkbox" value={option.id} checked={checked} onChange={onToggle} className="peer sr-only" />
    <span aria-hidden="true" className={cn("flex size-[22px] shrink-0 items-center justify-center rounded-md", checked ? "bg-kn-teal" : "border-[1.5px] border-[#8C8983]")}>
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M2.5 6.2L5 8.6L9.5 3.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
    {option.label}
  </label>
);

const Option = ({ kind, name, option, checked, onPick }: { kind: "list" | "grid" | "pills"; name: string; option: Choice; checked: boolean; onPick: () => void }) => {
  const input = <input type="radio" name={name} value={option.id} checked={checked} onChange={onPick} className="peer sr-only" />;

  if (kind === "list") {
    return (
      <label className={rowStyle(checked)}>
        {input}
        <span
          aria-hidden="true"
          className={cn("flex size-[22px] shrink-0 items-center justify-center rounded-full", checked ? "bg-kn-teal" : "border-[1.5px] border-[#8C8983]")}
        >
          {checked && <span className="size-2 rounded-full bg-white" />}
        </span>
        {option.label}
      </label>
    );
  }

  if (kind === "grid") {
    return (
      <label
        className={cn(
          "flex h-[52px] cursor-pointer items-center justify-center rounded-[14px] px-2 text-center text-base leading-5",
          checked ? "border-2 border-kn-teal bg-kn-teal font-semibold text-white" : "border-[1.5px] border-[#E3E1DC] font-medium text-kn-night hover:border-kn-teal/50",
          focusRing,
        )}
      >
        {input}
        {option.label}
      </label>
    );
  }

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center rounded-full border-[1.5px] px-4 py-2.5 text-[15px] leading-[18px]",
        checked ? "border-kn-teal bg-kn-teal font-semibold text-white" : "border-[#E3E1DC] font-medium text-kn-night hover:border-kn-teal/50",
        focusRing,
      )}
    >
      {input}
      {option.label}
    </label>
  );
};

export default QuestionScreen;
