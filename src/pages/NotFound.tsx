import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";

const NotFound = () => (
  <main className="page-line min-h-[85svh] bg-kn-teal pb-24 pt-40 text-white lg:pb-32 lg:pt-48">
    <p className="text-sm font-semibold leading-[18px] text-kn-lime">Page not found</p>
    <h1 className="mt-5 max-w-[760px] text-[44px] leading-[46px] tracking-[-0.045em] text-white lg:text-[72px] lg:leading-[76px]">
      This page doesn't exist.
    </h1>
    <p className="mt-5 max-w-[560px] text-lg leading-7 text-white/70">
      The link may be old or mistyped. Everything else is one click away.
    </p>
    <Link to="/" className={`${buttonVariants({ variant: "hero", size: "lg" })} mt-8`}>
      Back to the home page
    </Link>
  </main>
);

export default NotFound;
