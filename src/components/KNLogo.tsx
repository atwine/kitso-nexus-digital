const KNLogo = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="6" fill="#0C2340" />
    {/* K letterform */}
    <path d="M8 10L8 30" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <path d="M8 20L17 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <path d="M8 20L17 30" stroke="white" strokeWidth="3" strokeLinecap="round" />
    {/* N letterform */}
    <path d="M22 30L22 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <path d="M22 10L32 30" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 30L32 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    {/* Circuit nodes - teal circles at N corners */}
    <circle cx="22" cy="10" r="2.5" fill="#0F6E56" />
    <circle cx="32" cy="10" r="2.5" fill="#0F6E56" />
    <circle cx="22" cy="30" r="2.5" fill="#0F6E56" />
    <circle cx="32" cy="30" r="2.5" fill="#0F6E56" />
    {/* Short teal line extending right from top-right node */}
    <line x1="34.5" y1="10" x2="38" y2="10" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default KNLogo;
