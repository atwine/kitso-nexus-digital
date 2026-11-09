// "Six things we won't compromise on." (Paper page H; stacked on phones, page K).
const VALUES = [
  { title: "Precision", body: "No guesswork, no shortcuts." },
  { title: "Partnership", body: "Alongside you, not above you." },
  { title: "Practicality", body: "Works in the real world." },
  { title: "Integrity", body: "Honest about what it takes." },
  { title: "Continuous improvement", body: "We grow with you." },
  { title: "People first", body: "Technology serves people, not the other way around.", highlight: true },
];

const Values = () => (
  <section className="page-line bg-kn-night pb-16 pt-14 lg:py-[120px]">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:gap-10">
      <h2 className="text-[34px] leading-9 tracking-[-0.045em] text-white lg:text-[52px] lg:leading-[54px]">
        Six things we won't compromise on.
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {VALUES.map((v) => (
          <li
            key={v.title}
            className={`flex flex-col gap-2 rounded-[20px] p-[22px] lg:gap-2.5 lg:p-7 ${v.highlight ? "bg-kn-lime" : "bg-white/[0.06]"}`}
          >
            <h3 className={`text-[19px] leading-6 tracking-normal lg:text-xl ${v.highlight ? "text-kn-night" : "text-white"}`}>{v.title}</h3>
            <p className={`text-[15px] leading-[23px] ${v.highlight ? "text-kn-night" : "text-white/65"}`}>{v.body}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Values;
