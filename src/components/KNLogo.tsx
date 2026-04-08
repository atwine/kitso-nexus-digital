import logoImg from "@/assets/logo.jpeg";

const KNLogo = ({ size = 40 }: { size?: number }) => (
  <img src={logoImg} alt="Kitso Nexus Advisory" width={size} height={size} className="rounded-md object-cover" />
);

export default KNLogo;
