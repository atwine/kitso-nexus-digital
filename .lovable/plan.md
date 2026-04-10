

## Modern Harmony Theme Update

### Color Mapping

The new palette replaces the existing brand colors:

| Role | Old | New |
|------|-----|-----|
| Primary brand / dark panels (navy) | `#0D2240` | Deep Teal `#004D4D` |
| CTA buttons (blue) | `#1E5AA8` | Warm Terracotta `#C05E3D` |
| Icons & highlights (teal) | `#0E7A4E` | Lime Green `#A4C639` |
| Background | `#FFFFFF` | Soft Cream `#FFF8E7` |
| Body text / secondary panels (foreground) | navy | Charcoal Gray `#333333` |
| Surface sections | `#F5F5F5` | slightly darker cream `#F5EDDA` |

### Files to Change

**1. `src/index.css`** -- Core CSS variables
- Update `--navy` to Deep Teal (`180 100% 15%`)
- Update `--teal` to Lime Green (`73 56% 49%`)
- Update `--blue` to Warm Terracotta (`14 52% 50%`)
- Update `--background` to Soft Cream (`40 100% 95%`)
- Update `--foreground` to Charcoal Gray (`0 0% 20%`)
- Update `--surface` to warm cream (`38 50% 91%`)
- Update `--card` to white or very light cream
- Update `--primary` to Terracotta (CTA color)
- Update `--accent` to Lime Green
- Update `--muted-foreground`, `--border`, `--input`, `--ring` to harmonize
- Update `--card-foreground`, `--popover-foreground`, `--secondary-foreground` to Charcoal
- Update heading base styles to use new Deep Teal
- Update `.btn-hover` box-shadow to use terracotta instead of blue
- Update `.section-label` color reference (already uses teal utility)

**2. `tailwind.config.ts`** -- No structural changes needed (colors are CSS-variable-driven)

**3. `src/components/Navbar.tsx`** -- Already uses `bg-navy`, `text-teal`, `bg-blue` utilities which will auto-update via CSS vars. No code changes needed.

**4. `src/components/Footer.tsx`** -- Same, uses CSS variable-driven utilities. Auto-updates.

**5. `src/components/PageHero.tsx`** -- Uses `bg-navy`. Auto-updates.

**6. `src/pages/Home.tsx`** -- Hero section has hardcoded HSL values in the radial gradient `style` prop. These need updating to match new Deep Teal and Lime Green values.

**7. `src/pages/About.tsx`** -- Uses `bg-blue/10 text-blue` for industry badges. Will auto-update to terracotta tones. May want to switch these to lime green instead for visual consistency (badges as highlights, not CTAs).

**8. `src/components/ui/button.tsx`** -- Button variants reference `bg-blue`, `border-teal` etc. These map through CSS vars automatically. No changes needed.

**9. `src/components/WhatsAppButton.tsx`** -- WhatsApp green stays as-is (brand color for WhatsApp).

### Typography
Plus Jakarta Sans is already a modern clean sans-serif -- no change needed. It aligns with the "Modern Harmony" aesthetic.

### Summary of Actual Edits
- **`src/index.css`**: Update ~15 CSS custom property values + box-shadow references
- **`src/pages/Home.tsx`**: Update 3 hardcoded HSL values in the hero gradient
- **`src/pages/About.tsx`**: Change industry badge classes from `bg-blue/10 text-blue` to `bg-teal/10 text-teal` (lime green highlights instead of CTA color)

Everything else flows through CSS variables automatically.

