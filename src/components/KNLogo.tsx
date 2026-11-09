import logoImg from "@/assets/logo.jpeg";
import { cn } from "@/lib/utils";

// Decorative: it always sits next to the words "Kitso Nexus Advisory", which name the link.
// Size it with classes (for example "size-10 lg:size-11").
const KNLogo = ({ className }: { className?: string }) => (
  <img src={logoImg} alt="" width={44} height={44} className={cn("shrink-0 rounded-lg object-cover", className)} />
);

export default KNLogo;
