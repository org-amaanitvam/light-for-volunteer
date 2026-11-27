---
name: Light For Volunteer
description: A verified, transparent marketplace connecting social impact organisations with volunteers and interns.
colors:
  primary: "#0ea5e9"
  primary-hover: "#0284c7"
  secondary: "#e0f2fe"
  secondary-foreground: "#0369a1"
  accent: "#e0f7fa"
  accent-foreground: "#0e7490"
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  neutral-text: "#0f172a"
  neutral-muted: "#64748b"
  neutral-border: "#bae6fd"
  destructive: "#ef4444"
  success: "#10b981"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.025em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  card-default:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Light For Volunteer

## Overview

**Creative North Star: "The Transparent Ledger"**

Light For Volunteer embodies an architectural, disciplined clarity built for civic trust. The interface operates not as an entertainment feed or casual bulletin board, but as a dependable registry where non-profits, volunteers, and academic institutions verify mutual commitment and social impact. Surfaces are grounded in pure studio white and airy glacial slates, structured by precise hairline borders and quiet typography.

Visual tone is purposeful, authoritative, and daylight-clear. Rather than using loud hyper-saturated neon gradients, gamified toy icons, or loud marketing theatrics, the design communicates legitimacy through clean data density, clear status markers, and disciplined restraint. The blue and cyan palette serves as functional illumination—drawing the eye to actionable decisions, verified badges, and verified progress records.

**Key Characteristics:**
- Crisp architectural surfaces with flat-by-default planes and delicate hairline sky-slate borders.
- Disciplined civic azure (`#0ea5e9`) and cobalt accents used strictly for primary intent and verified credentials.
- Clear structural hierarchy emphasizing data legibility, hours verification, and institutional credibility over decorative ornament.
- Quiet, robust system typography with strict optical tracking and generous line heights.

## Colors

The palette balances authoritative civic blues and fresh cyan with high-clarity studio neutrals and soft slate boundaries.

### Primary
- **Civic Azure** (#0ea5e9): The normative interactive color for primary calls-to-action, active selection outlines, and verified impact indicators. Used with intent on key actions.
- **Deep Civic Azure** (#0284c7): Hover and pressed state for primary controls.

### Secondary
- **Glacial Sky Tint** (#e0f2fe): Soft tinted background for secondary actions, active filter pills, and highlighted data columns.
- **Deep Sky Ink** (#0369a1): High-contrast label color for text set against secondary sky backgrounds.

### Accent
- **Solar Cyan Tint** (#e0f7fa): Accent tint for mentorship callouts, volunteer milestone highlights, and subtle gradients.
- **Solar Cyan Ink** (#0e7490): Text accent for specialized roles and tags.

### Neutral
- **Studio White Surface** (#ffffff): Primary card and modal canvas, offering maximum contrast and cleanliness.
- **Glacial Slate Ground** (#f8fafc): Background wash for application canvases, giving subtle separation behind white cards.
- **Deep Slate Text** (#0f172a): High-contrast primary typographic color for titles, body copy, and form inputs.
- **Muted Slate** (#64748b): Subordinate metadata, timestamps, secondary labels, and icon tints.
- **Hairline Sky Border** (#bae6fd): Structural divider for cards, inputs, and tab navigation.

### Named Rules
**The Boundary Over Shadow Rule.** Hairline sky-slate borders define hierarchy and structural separation; shadows appear only on interactive hover states or elevated floating modals.
**The Disciplined Accent Rule.** Civic azure and solar cyan are reserved strictly for primary actions, verified badges, and interactive focus states; background planes remain clean studio white and muted slate.

## Typography

**Display Font:** System Sans Stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`)  
**Body Font:** System Sans Stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`)  
**Label/Mono Font:** System Monospace (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`)

**Character:** Understated, direct, and highly legible across both high-density data tables and spacious editorial landing screens. Tight tracking on display headings lends weight and authority, while generous leading on body text maintains effortless reading.

### Hierarchy
- **Display** (800 Extrabold, 3rem / 48px, line-height 1.15, letter-spacing -0.025em): Used for landing page hero headers and major verified impact statistics.
- **Headline** (700 Bold, 2.25rem / 36px, line-height 1.25, letter-spacing -0.02em): Section titles, dashboard overview greetings, and opportunity detail page titles.
- **Title** (600 Semibold, 1.25rem / 20px, line-height 1.4, letter-spacing -0.01em): Card headings, modal titles, and opportunity listing names.
- **Body** (400 Regular, 1rem / 16px, line-height 1.6, letter-spacing 0em): Descriptive paragraphs, requirements lists, and user reviews (max line length 68ch).
- **Label** (600 Semibold, 0.75rem / 12px, line-height 1.3, letter-spacing 0.025em): Badges, category pills, table column headers, and status tags.

### Named Rules
**The Hierarchy Proof Rule.** Numbers and metrics (hours served, spots remaining, review ratings) must always pair with clear uppercase or semibold labels to ensure immediate glanceability.

## Layout

The layout uses a 12-column responsive grid centered within a maximum width of `1280px` (`max-w-7xl`). Spacing adheres to an 8px baseline rhythm (`8px`, `16px`, `24px`, `32px`, `48px`).

- **Grid & Gutters:** 16px gutters on mobile devices expanding to 24px/32px on tablet and desktop screens.
- **Containers:** Primary views sit inside padded viewport wrappers (`px-4 sm:px-6 lg:px-8`).
- **Density:** Dashboard and table views maintain compact vertical rhythms (`py-3`, `gap-3`) for scanability, while public discovery and landing screens employ generous breathing room (`py-16 sm:py-24`).
- **Responsive Behavior:** Multi-column grids collapse gracefully: 3-column opportunity cards collapse to 2 columns on tablet and 1 column on mobile. Sticky sidebars convert to horizontal tabs or expandable drawers on screens narrower than `1024px`.

## Elevation & Depth

Surfaces are architectural and flat by default. Depth is established through subtle color contrasts (studio white on glacial slate ground) and crisp 1px borders, rather than heavy ambient drop shadows.

### Shadow Vocabulary
- **Subtle Rest (`shadow-sm`)** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): Applied to cards, inputs, and primary buttons at rest to separate them from the ground plane.
- **Interactive Lift (`shadow-md`)** (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): Applied on card hover and button hover alongside a subtle sky glow (`shadow-sky-500/20`).
- **Glass Translucency (`glass-panel`)** (`background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(186, 230, 253, 0.6)`): Applied strictly to sticky headers, floating command bars, and navigation overlays.

### Named Rules
**The Flat-at-Rest Rule.** All cards, panels, and table rows rest on the plane without dramatic drops. Shadows serve as dynamic reactions to mouse hover and touch focus, never static decoration.

## Shapes

Forms are cleanly geometric and gently rounded, providing a friendly yet disciplined balance.

- **Micro Shapes (`rounded-lg`, 8px):** Input fields, compact badges, tooltips, and small action icons.
- **Standard Controls (`rounded-xl`, 12px):** Default buttons, dropdown menus, and standard form inputs.
- **Containers & Surfaces (`rounded-2xl`, 16px):** Opportunity cards, review list items, and modal dialogs.
- **Hero & Showcase Cards (`rounded-3xl`, 24px):** Value pillar feature cards, hero callout blocks, and certificate preview frames.
- **Pills (`rounded-full`, 9999px):** Category filters, status tags, verification badges, and avatar frames.

## Components

### Buttons
- **Shape:** Rounded rectangle (12px radius, `rounded-xl`).
- **Primary:** Background in Civic Azure (`#0ea5e9`), text in Studio White (`#ffffff`), padding `10px 16px` (h-10). Smooth transition to hover state (`#0284c7`, subtle sky shadow `shadow-sky-500/25`).
- **Secondary:** Background in Glacial Sky Tint (`#e0f2fe`), text in Deep Sky Ink (`#0369a1`), padding `10px 16px`. Hover transitions to `#bae6fd`.
- **Outline:** 1px Hairline Border (`#bae6fd`), background Studio White (`#ffffff`), text in Deep Slate (`#0f172a`).
- **Ghost:** Transparent background, text in Muted Slate (`#64748b`), hover reveals soft sky tint.
- **Tactile State:** All buttons trigger an active tactile response (`active:scale-[0.98]`).

### Chips & Badges
- **Shape:** Full pill (9999px radius, `rounded-full`).
- **Default / Verified:** Tinted background (`bg-sky-100 text-sky-800 border-transparent`) or verified outline (`border-sky-200 bg-sky-50/50 text-sky-700`).
- **Success / Completed:** Pale emerald wash (`bg-emerald-50 text-emerald-700 border-emerald-200`).
- **Typography:** `0.75rem` (`12px`), font-semibold, letter-spacing `0.025em`.

### Cards & Containers
- **Corner Style:** Rounded 16px (`rounded-2xl`) or 24px (`rounded-3xl`).
- **Background:** Studio White (`#ffffff`) or 95% white with subtle glass backing (`bg-white/95 backdrop-blur-sm`).
- **Border:** 1px solid Hairline Sky (`#bae6fd` or `border-sky-100`).
- **Internal Padding:** 24px (`p-6`) for standard content cards.
- **Hover Reaction:** Subtle translateY shift (`hover:-translate-y-0.5`), light sky border glow, and `shadow-md`.

### Inputs & Fields
- **Style:** Height 44px (`h-11`), radius 12px (`rounded-xl`), 1px solid border (`#bae6fd`), background Studio White (`#ffffff`).
- **Focus:** 2px ring in Civic Azure (`focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400`).
- **Placeholder:** Muted slate tint (`text-slate-400`).

### Navigation
- **Style:** Sticky top bar with glassmorphic backdrop (`backdrop-blur-md bg-white/85 border-b border-sky-100/70`).
- **Links:** Muted slate typography (`text-slate-600`) transitioning to Civic Azure on hover and active route indicator.

## Do's and Don'ts

### Do:
- **Do** wrap every card and table container in a crisp 1px hairline border (`border-sky-100` / `#bae6fd`) to maintain architectural boundary definition.
- **Do** reserve Civic Azure (`#0ea5e9`) for primary calls-to-action, verified badge highlights, and interactive states.
- **Do** use rounded-full pills for status chips, categories, and verified credential tags.
- **Do** pair numeric metrics (volunteer hours, applicant count, star ratings) with descriptive uppercase or semibold labels.
- **Do** maintain subtle active press feedback (`active:scale-[0.98]`) on all interactive buttons.

### Don't:
- **Don't** use loud, over-saturated neon gradients or jarring rainbow spectrums; keep colors anchored in civic azure, solar cyan, and studio slate.
- **Don't** rely on heavy, dark drop shadows (`shadow-2xl`) for static cards; depth must remain light and border-defined.
- **Don't** clutter screens with cartoonish gamification stickers or toy illustrations; preserve institutional dignity and civic credibility.
- **Don't** leave interactive elements without defined focus rings; maintain accessibility with `focus-visible:ring-sky-400`.
- **Don't** use pure solid black (`#000000`) for text; use Deep Slate (`#0f172a`) to preserve readability without harshness.
