import { Linkedin, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// "The team" (Paper page H; stacked on phones, page K). Each card opens a
// "View profile" pop-up with the longer bio, kept at the owner's request on
// 4 Nov 2026. The photos in Paper are the same files as these.
const TEAM = [
  {
    name: "Mugume T. Atwine",
    role: "Technical Lead",
    photo: "/images/team/atwine mugume.jpeg",
    // A tall portrait on a plain dark background (#1E1E1E at every edge). On
    // wider frames the whole portrait is shown at the frame's height, centred
    // on that same dark colour, so head, shirt and jacket all show, as in
    // Fredrick's photo; its side edges fade into the dark so no seam shows. On
    // phones the frame is nearly square, so it simply fills.
    frame: "bg-[#1E1E1E]",
    cardPhoto: "h-[380px] w-full object-cover object-top lg:h-[500px] lg:w-auto lg:max-w-none lg:[mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]",
    popupPhoto: "h-[340px] w-full object-cover object-top sm:h-[480px] sm:w-auto sm:max-w-none sm:[mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]",
    bio: "ERP implementation, customisation and technical architecture. Makes sure every solution is built right.",
    // Pop-up text kept word for word from the previous site.
    details:
      "Mugume has an extensive background in software engineering and system design, having successfully delivered complex ERP solutions. He focuses on bridging the gap between business requirements and technical realities to deliver systems that scale effortlessly.",
    experience: [
      "Over 10 years in software development and architecture",
      "Lead architect on multiple large-scale enterprise resource planning projects",
      "Expertise in modern web frameworks, database optimization, and cloud infrastructures",
      "Passionate about creating scalable, secure, and maintainable systems",
    ],
    linkedin: "https://www.linkedin.com/in/mugume-twinamatsiko-atwine-msc-976ab12b/",
  },
  {
    name: "Fredrick Maripe",
    role: "Business Development",
    photo: "/images/team/fredric maripe.jpeg",
    // A square photo that fits the wide frames. Its right edge has a thin strip
    // of wall; zooming 5% from the left trims it.
    frame: "",
    cardPhoto: "h-[380px] w-full origin-left scale-[1.05] object-cover object-[50%_18%] lg:h-[440px]",
    popupPhoto: "h-[340px] w-full origin-left scale-[1.05] object-cover object-[50%_18%] sm:h-[420px]",
    bio: "Client relationships, requirements gathering and strategic advisory. Your first point of contact.",
    details:
      "Fredrick is a seasoned business strategist with a deep understanding of the operational challenges faced by modern organizations. He ensures that every project aligns perfectly with the client's long-term overarching strategic objectives.",
    experience: [
      "Extensive experience in B2B consulting and enterprise advisory",
      "Proven track record of driving digital transformation across various sectors",
      "Expert in business process mapping, requirements gathering, and change management",
      "Dedicated to fostering and maintaining long-lasting partnerships with clients",
    ],
    linkedin: null,
  },
];

const Team = () => (
  <section className="page-line pb-16 lg:pb-[120px]">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5 lg:gap-10">
      <h2 className="text-sm font-semibold leading-[18px] tracking-normal text-kn-olive">The team</h2>
      <ul className="flex flex-col gap-3 lg:flex-row lg:gap-5">
        {TEAM.map((person) => (
          <li key={person.name} className="flex flex-1">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label={`${person.name}, ${person.role}: view profile`}
                  className="group flex h-full w-full flex-col overflow-hidden rounded-3xl bg-kn-card text-left transition-shadow hover:shadow-[0_12px_32px_rgb(20_20_19/0.12)]"
                >
                  <span className={`flex h-[380px] justify-center overflow-hidden lg:h-[440px] ${person.frame}`}>
                    <img src={person.photo} alt="" loading="lazy" decoding="async" className={person.cardPhoto} />
                  </span>
                  <span className="flex flex-col gap-3 px-[22px] pb-[26px] pt-[22px] lg:px-8 lg:pb-8 lg:pt-7 min-[1400px]:flex-row min-[1400px]:items-start min-[1400px]:justify-between min-[1400px]:gap-6">
                    <span className="flex flex-col gap-1 lg:gap-1.5">
                      <span className="text-[26px] font-semibold leading-8 tracking-[-0.03em] text-kn-night lg:text-[28px] lg:leading-[34px]">
                        {person.name}
                      </span>
                      <span className="text-[15px] leading-[18px] text-kn-muted">{person.role}</span>
                      <span className="pt-1 text-[13px] font-semibold leading-4 text-kn-teal underline-offset-4 group-hover:underline">
                        View profile →
                      </span>
                    </span>
                    <span className="text-[15px] leading-[23px] text-[#3C3A37] min-[1400px]:w-[300px] min-[1400px]:shrink-0">{person.bio}</span>
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent hideClose className="max-h-[90vh] w-[calc(100vw-32px)] max-w-[560px] gap-0 overflow-y-auto rounded-3xl border-0 p-0 sm:rounded-3xl">
                <span className={`flex h-[340px] justify-center overflow-hidden sm:h-[420px] ${person.frame}`}>
                  <img src={person.photo} alt="" className={person.popupPhoto} />
                </span>
                <div className="flex flex-col gap-5 p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <DialogTitle className="text-[28px] font-semibold leading-[34px] tracking-[-0.03em] text-kn-night">{person.name}</DialogTitle>
                      <DialogDescription className="text-[15px] leading-[18px] text-kn-muted">{person.role}</DialogDescription>
                    </div>
                    <DialogClose className="flex size-9 shrink-0 items-center justify-center rounded-full bg-kn-card text-kn-night" aria-label="Close">
                      <X size={14} strokeWidth={2.5} aria-hidden="true" />
                    </DialogClose>
                  </div>
                  <p className="text-[15px] leading-6 text-[#3C3A37]">{person.details}</p>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[13px] font-semibold leading-4 tracking-normal text-kn-olive">Experience</h3>
                    <ul className="flex flex-col gap-1.5 text-[15px] leading-6 text-[#3C3A37]">
                      {person.experience.map((e) => (
                        <li key={e} className="flex gap-2">
                          <span aria-hidden="true" className="text-kn-teal">✓</span>
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {person.linkedin && (
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 self-start rounded-full border border-kn-night px-4 py-2.5 text-sm leading-[18px] text-kn-night hover:bg-kn-night/5"
                    >
                      <Linkedin size={16} aria-hidden="true" />
                      {person.name.split(" ")[0]} on LinkedIn
                    </a>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Team;
