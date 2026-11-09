import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Site buttons from the Paper design: pills, Inter, no shadows.
        // hero: lime, the main call to action on any background.
        hero: "rounded-full bg-kn-lime text-kn-night font-semibold hover:bg-kn-lime/90",
        // heroOutline: white outline, on teal or dark sections.
        heroOutline: "rounded-full border-2 border-white text-white font-semibold hover:bg-white/10",
        // heroSoft: translucent white, the quieter second button on teal.
        heroSoft: "rounded-full bg-white/10 text-white font-medium hover:bg-white/20",
        // teal: the main button on white or stone (form steps).
        teal: "rounded-full bg-kn-teal text-white font-medium hover:bg-kn-teal/90",
        // outlineDark: thin dark outline on white or stone.
        outlineDark: "rounded-full border border-kn-night text-kn-night font-normal hover:bg-kn-night/5",
        whatsapp: "rounded-full bg-kn-whatsapp text-kn-whatsapp-ink font-semibold hover:bg-kn-whatsapp/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-auto px-7 py-4 text-base leading-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// Runs the classes through cn, so a variant's rounded-full or size's text-base
// replace the base rounded-md and text-sm wherever the classes are used
// (on <Button>, and on links styled as buttons).
const buttonVariants = (options?: Parameters<typeof buttonStyles>[0]) => cn(buttonStyles(options));

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
