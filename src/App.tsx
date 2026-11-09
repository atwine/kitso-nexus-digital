import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ExitIntentPopup from "./components/ExitIntentPopup";
import CookieBanner from "./components/CookieBanner";
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import LoadError from "./components/LoadError";
import ScrollToTop from "./components/ScrollToTop";

// Loaded only when someone opens /fit, so the rest of the site stays small on phones.
const FitCheck = lazy(() => import("./pages/FitCheck"));
const FitReport = lazy(() => import("./pages/FitReport"));

const queryClient = new QueryClient();

// The fit check is a focused flow with its own small header: no menu, footer,
// floating WhatsApp button or "Before you go" popup (owner's choice, 4 Nov).
const FOCUSED_PATHS = new Set(["/fit", "/fit/report"]);

const Site = () => {
  const { pathname } = useLocation();
  const focused = FOCUSED_PATHS.has(pathname.toLowerCase().replace(/\/+$/, "") || "/");

  return (
    <>
      <ScrollToTop />
      {!focused && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route
          path="/fit"
          element={
            <LoadError>
              <Suspense fallback={<main className="min-h-dvh bg-kn-teal" />}>
                <FitCheck />
              </Suspense>
            </LoadError>
          }
        />
        <Route
          path="/fit/report"
          element={
            <LoadError>
              <Suspense fallback={<main className="min-h-dvh bg-kn-teal" />}>
                <FitReport />
              </Suspense>
            </LoadError>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!focused && <Footer />}
      {/* The bottom dock: on phones the WhatsApp button stacks above the cookie
          banner; on laptops the banner sits bottom left and the button bottom
          right. The banner comes first so Tab follows what the eye sees. The
          dock lets clicks through except on its two parts. */}
      <aside aria-label="Quick contact" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col-reverse items-end gap-[19px] p-3 lg:flex-row lg:p-6 print:hidden">
        <CookieBanner />
        {!focused && <WhatsAppButton />}
      </aside>
      {!focused && <ExitIntentPopup />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Site />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
