// The six ERP services and their clay pictures (Paper page H). Home shows the
// short line; the Services page (Sprint 4) adds its longer text.

export interface Service {
  id: string;
  title: string;
  short: string;
  image: string;
}

export const SERVICES: Service[] = [
  {
    id: "implementation",
    title: "ERP Implementation",
    short: "End-to-end setup tailored to your business workflows.",
    image: "/images/clay/erp-implementation.webp",
  },
  {
    id: "customisation",
    title: "Customisation & Studio",
    short: "Custom fields, reports, automations and workflows.",
    image: "/images/clay/customisation-studio.webp",
  },
  {
    id: "training",
    title: "Training & User Support",
    short: "Hands-on training so your team is confident from day one.",
    image: "/images/clay/training-support.webp",
  },
  {
    id: "consulting",
    title: "Process Consulting",
    short: "Map and improve your processes before going digital.",
    image: "/images/clay/process-consulting.webp",
  },
  {
    id: "migration",
    title: "Data Migration",
    short: "Move your data safely from legacy systems or spreadsheets.",
    image: "/images/clay/data-migration.webp",
  },
  {
    id: "retainers",
    title: "Support Retainers",
    short: "Monthly priority support and health checks after go-live.",
    image: "/images/clay/support-retainers.webp",
  },
];
