// "Which service covers which stage." A table on laptops (Paper page H); on
// phones one card per service with a labelled tag for each stage (page K).
const STAGES = ["Before you start", "Building", "Go-live", "After go-live"] as const;
type Tone = "core" | "plain" | "monthly";
type Cell = { label: string; tone: Tone } | null;

const core: Cell = { label: "Core", tone: "core" };
const plain = (label: string): Cell => ({ label, tone: "plain" });

const ROWS: { service: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  { service: "Process Consulting", cells: [core, null, null, null] },
  { service: "ERP Implementation", cells: [plain("Assess"), core, core, null] },
  { service: "Customisation & Studio", cells: [null, core, null, plain("As needed")] },
  { service: "Data Migration", cells: [null, plain("Test imports"), core, null] },
  { service: "Training & User Support", cells: [null, null, core, plain("Refreshers")] },
  { service: "Support Retainers", cells: [null, null, null, { label: "Monthly", tone: "monthly" }] },
];

const TONES: Record<Tone, string> = {
  // Darker green than the drawing's #00823A, so the small text passes the 4.5:1 contrast rule.
  core: "bg-[#E3F1E6] text-[#006B30]",
  plain: "bg-[#F1F1F1] text-[#1F1F1F]",
  monthly: "bg-kn-teal text-white",
};

const Tag = ({ cell, children }: { cell: NonNullable<Cell>; children: string }) => (
  <span className={`inline-block rounded-full px-2.5 py-1 text-xs leading-4 ${TONES[cell.tone]}`}>{children}</span>
);

const Coverage = () => (
  <section className="page-line bg-kn-stone pb-14 pt-12 lg:py-24">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5 lg:gap-8">
      <h2 className="text-[32px] leading-9 tracking-[-0.045em] lg:text-5xl lg:leading-[52px]">Which service covers which stage.</h2>

      {/* Tables ignore rounded corners, so the rounding sits on a wrapper. */}
      <div className="hidden overflow-hidden rounded-3xl bg-white lg:block">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-kn-line">
            <th scope="col" className="w-[300px] px-5 py-3.5 text-xs font-medium leading-4 text-[#616161]">Service</th>
            {STAGES.map((stage) => (
              <th key={stage} scope="col" className="px-2 py-3.5 last:pr-5 text-center text-xs font-medium leading-4 text-[#616161]">{stage}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.service} className="border-b border-kn-line last:border-b-0">
              <th scope="row" className="px-5 py-3.5 text-sm font-medium leading-[18px] text-[#1F1F1F]">{row.service}</th>
              {row.cells.map((cell, i) => (
                <td key={STAGES[i]} className="px-2 py-3.5 text-center last:pr-5">
                  {cell ? <Tag cell={cell}>{cell.label}</Tag> : <span className="sr-only">Not covered</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <ul className="flex flex-col overflow-hidden rounded-3xl bg-white lg:hidden">
        {ROWS.map((row) => (
          <li key={row.service} className="flex flex-col gap-2.5 border-b border-kn-line px-5 py-4 last:border-b-0">
            <h3 className="text-[15px] font-semibold leading-5 tracking-normal text-[#1F1F1F]">{row.service}</h3>
            <p className="flex flex-wrap gap-1.5">
              {row.cells.map((cell, i) => cell && <Tag key={STAGES[i]} cell={cell}>{`${STAGES[i]} · ${cell.label}`}</Tag>)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Coverage;
