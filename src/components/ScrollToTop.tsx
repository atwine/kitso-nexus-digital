import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";

// A new page starts at the top. Going Back restores your place, and a link to a
// section of a page takes you there itself.
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navigation = useNavigationType();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    // Instant, because the site's smooth scrolling is for jumps within a page.
    if (navigation !== "POP" && !hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash, navigation]);

  return null;
};

export default ScrollToTop;
